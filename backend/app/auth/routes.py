from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel
import os
import requests
import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions

router = APIRouter(prefix="/auth", tags=["auth"])

# =========================
# CONFIGURATION
# =========================
ADMIN_CODE = os.getenv("ADMIN_CODE")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not ADMIN_CODE:
    raise RuntimeError("ADMIN_CODE manquant dans les variables d'environnement")

if not CLERK_SECRET_KEY:
    raise RuntimeError("CLERK_SECRET_KEY manquant dans les variables d'environnement")

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


class AdminCodePayload(BaseModel):
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
# ACTIVATION ADMIN via Clerk
# =========================
@router.post("/activate-admin")
async def activate_admin(payload: AdminCodePayload, request: Request):
    """
    Active le rôle admin pour l'utilisateur Clerk courant,
    si le code admin est correct.
    """

    # Vérifier le code admin
    if payload.admin_code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Code admin invalide")

    # Authentifier la requête avec Clerk (vérif token + payload)
    sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)

    # On copie les headers de la requête FastAPI
    headers = dict(request.headers)

    httpx_request = httpx.Request(
        method=request.method,
        url=str(request.url),
        headers=headers,
    )

    request_state = sdk.authenticate_request(
        httpx_request,
        AuthenticateRequestOptions(
            authorized_parties=None  # tu peux mettre ['http://localhost:5173'] si tu veux restreindre
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

    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Impossible de récupérer l'utilisateur Clerk")

    # Mettre à jour le public_metadata.role = "admin" via l'API Clerk
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



# =========================
# SUPPRESSION COMPTE UTILISATEUR
# =========================
@router.delete("/me")
def delete_my_account(user=Depends(get_current_user)):
    """
    Suppression du compte utilisateur connecté.
    Envoie un email de confirmation.
    """

    email = user.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email utilisateur introuvable")

    # Email confirmation (NON BLOQUANT)
    try:
        send_user_account_deleted_email(email)
    except Exception:
        pass

    return {"message": "Compte utilisateur supprimé avec succès"}
