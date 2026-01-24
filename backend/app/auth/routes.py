from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.security import create_access_token
import os

router = APIRouter(prefix="/auth", tags=["auth"])


# =========================
# CONFIGURATION
# =========================
# Le code admin est stocké dans le fichier .env
# Il n’est jamais envoyé au frontend
ADMIN_CODE = os.getenv("ADMIN_CODE")

if not ADMIN_CODE:
    raise RuntimeError(
        "ADMIN_CODE manquant dans les variables d'environnement"
    )


# =========================
# SCHEMAS DE DONNÉES
# =========================
# Données attendues pour la connexion utilisateur
class UserLogin(BaseModel):
    first_name: str
    last_name: str
    email: str


# Données attendues pour la connexion administrateur
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
    """
    Connexion d’un utilisateur classique.
    On crée un token qui contient son identité et son rôle.
    """

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
# CONNEXION ADMINISTRATEUR
# =========================
@router.post("/login/admin")
def login_admin(payload: AdminLogin):
    """
    Connexion administrateur.
    L’accès est protégé par un code secret côté backend.
    """

    # Vérification du code admin
    if payload.admin_code != ADMIN_CODE:
        raise HTTPException(
            status_code=403,
            detail="Code admin invalide",
        )

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