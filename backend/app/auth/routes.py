from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os

from app.core.security import create_access_token
from app.auth.dependencies import get_current_user
from app.services.email_service import send_user_account_deleted_email

router = APIRouter(prefix="/auth", tags=["auth"])

# =========================
# CONFIGURATION
# =========================
ADMIN_CODE = os.getenv("ADMIN_CODE")

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
