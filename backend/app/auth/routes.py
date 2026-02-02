from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
from datetime import datetime
from app.core.supabase import supabase
from app.core.security import create_access_token
from app.auth.dependencies import get_current_user
from app.services.email_service import (
    send_user_account_deleted_email,
    send_email,
)
from app.services.template_service import render_template

router = APIRouter(prefix="/auth", tags=["auth"])

# =========================
# CONFIGURATION
# =========================
ADMIN_CODE = os.getenv("ADMIN_CODE")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

if not ADMIN_CODE:
    raise RuntimeError("ADMIN_CODE manquant dans les variables d'environnement")

# =========================
# SCHEMAS
# =========================
class UserLogin(BaseModel):
    first_name: str
    last_name: str
    email: str


class AdminLogin(BaseModel):
    first_name: str
    last_name: str
    email: str
    admin_code: str


# =========================
# CONNEXION UTILISATEUR
# =========================
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


# =========================
# CONNEXION ADMIN
# =========================
@router.post("/login/admin")
def login_admin(payload: AdminLogin):
    if payload.admin_code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Code admin invalide")

    token_payload = {
        "user_id": payload.email,
        "role": "admin",
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
            "role": "admin",
        },
    }


# =========================
# SUPPRESSION COMPTE UTILISATEUR
# =========================
@router.delete("/me")
def delete_my_account(user=Depends(get_current_user)):
    """
    Suppression du compte utilisateur connecté
    - Annulation des réservations
    - Email utilisateur (résilient)
    - Notification admin
    """

    email = user.get("email")
    first_name = user.get("first_name", "")
    last_name = user.get("last_name", "")
    role = user.get("role", "user")

    if not email:
        raise HTTPException(status_code=400, detail="Email utilisateur introuvable")

    # =========================
    # ANNULATION DES RÉSERVATIONS UTILISATEUR
    # =========================
    try:
        supabase.table("reservations") \
            .delete() \
            .eq("user_id", user["user_id"]) \
            .execute()
    except Exception as e:
        print("Erreur suppression réservations utilisateur :", e)

    # =========================
    # EMAIL UTILISATEUR
    # =========================
    try:
        send_user_account_deleted_email(
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
    except Exception as e:
        print("Erreur email utilisateur :", e)

    # =========================
    # EMAIL ADMIN
    # =========================
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

    return {"message": "Compte utilisateur supprimé avec succès"}

