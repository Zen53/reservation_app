from fastapi import APIRouter, HTTPException, Header, Request, Depends
from pydantic import BaseModel
import os
import requests
import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions
from app.auth.dependencies import get_current_user
from datetime import datetime
from app.core.supabase import supabase
from app.services.email_service import send_email, send_user_account_deleted_email
from app.services.template_service import render_template

router = APIRouter(prefix="/auth", tags=["auth"])

ADMIN_CODE = os.getenv("ADMIN_CODE")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

if not ADMIN_CODE:
    raise RuntimeError("ADMIN_CODE manquant dans les variables d'environnement")

if not CLERK_SECRET_KEY:
    raise RuntimeError("CLERK_SECRET_KEY manquant dans les variables d'environnement")


class UserLogin(BaseModel):
    first_name: str
    last_name: str
    email: str


class AdminLogin(BaseModel):
    first_name: str
    last_name: str
    email: str
    admin_code: str


class AdminCodePayload(BaseModel):
    admin_code: str


@router.post("/login/user")
def login_user(payload: UserLogin):
    token_payload = {
        "user_id": payload.email,
        "role": "user",
        "email": payload.email,
        "first_name": payload.first_name,
        "last_name": payload.last_name,
    }

    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": payload.email,
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "email": payload.email,
            "role": "user",
        },
    }


@router.post("/activate-admin")
async def activate_admin(payload: AdminCodePayload, request: Request):
    if payload.admin_code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Code admin invalide")

    sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)

    headers = dict(request.headers)

    httpx_request = httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=headers,
    )

    request_state = sdk.authenticate_request(
        httpx_request,
        AuthenticateRequestOptions(
            authorized_parties=None
        ),
    )

    if not getattr(request_state, "is_signed_in", False):
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    payload = getattr(request_state, "payload", None)
    if not isinstance(payload, dict):
        raise HTTPException(status_code=401, detail="Token Clerk invalide")

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Impossible de récupérer l'utilisateur Clerk")

    response = requests.patch(
        f"https://api.clerk.com/v1/users/{clerk_user_id}/metadata",
        headers={
            "Authorization": f"Bearer {CLERK_SECRET_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "public_metadata": {
                "role": "admin",
            }
        },
        timeout=10,
    )

    if response.status_code >= 400:
        print("Clerk error:", response.status_code, response.text)
        raise HTTPException(status_code=500, detail="Erreur Clerk lors de la mise à jour du rôle")

    return {
        "status": "ok",
        "message": "Rôle admin activé avec succès",
    }


@router.post("/deactivate-admin")
async def deactivate_admin(request: Request):
    sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)
    headers = dict(request.headers)
    httpx_request = httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=headers,
    )

    request_state = sdk.authenticate_request(
        httpx_request,
        AuthenticateRequestOptions(authorized_parties=None),
    )

    if not getattr(request_state, "is_signed_in", False):
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié")

    payload = getattr(request_state, "payload", None)
    clerk_user_id = payload.get("sub") if payload else None

    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Utilisateur Clerk introuvable")

    response = requests.patch(
        f"https://api.clerk.com/v1/users/{clerk_user_id}/metadata",
        headers={
            "Authorization": f"Bearer {CLERK_SECRET_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "public_metadata": {
                "role": "user",
            }
        },
        timeout=10,
    )

    if response.status_code >= 400:
        print("Clerk error (deactivate):", response.status_code, response.text)
        raise HTTPException(status_code=500, detail="Erreur Clerk lors de la désactivation")

    return {
        "status": "ok",
        "message": "Mode administrateur désactivé. Vous êtes maintenant un utilisateur standard.",
    }


@router.delete("/me")
def delete_my_account(user=Depends(get_current_user)):
    email = user.get("email")
    first_name = user.get("first_name", "")
    last_name = user.get("last_name", "")
    role = user.get("role", "user")

    if not email:
        raise HTTPException(status_code=400, detail="Email utilisateur introuvable")

    try:
        supabase.table("reservations") \
            .delete() \
            .eq("user_id", user["id"]) \
            .execute()
    except Exception as e:
        print("Erreur suppression réservations utilisateur :", e)

    try:
        send_user_account_deleted_email(
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
    except Exception as e:
        print("Erreur email utilisateur :", e)

    try:
        if ADMIN_EMAIL:
            html_admin = render_template(
                "admin_notification.html",
                {
                    "user_first_name": first_name or "",
                    "user_last_name": last_name or "",
                    "user_email": email,
                    "date": datetime.now().strftime("%d/%m/%Y"),
                    "time": datetime.now().strftime("%H:%M"),
                    "event": "Suppression de compte utilisateur",
                },
            )

            send_email(
                to=ADMIN_EMAIL,
                subject="Notification administrateur – Suppression de compte",
                html=html_admin,
            )
    except Exception as e:
        print("Erreur email admin :", e)

    try:
        res = requests.delete(
            f"https://api.clerk.com/v1/users/{user['id']}",
            headers={
                "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                "Content-Type": "application/json",
            },
            timeout=10,
        )
        if res.status_code >= 400:
            print(f"Erreur delete Clerk: {res.status_code} {res.text}")
    except Exception as e:
        print("Exception lors de la suppression Clerk :", e)

    return {"message": "Compte utilisateur supprimé avec succès"}

