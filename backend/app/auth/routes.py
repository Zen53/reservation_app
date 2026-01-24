from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.security import create_access_token
import os

router = APIRouter(prefix="/auth", tags=["auth"])


# =========================
# CONFIG
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
# LOGIN USER
# =========================
@router.post("/login/user")
def login_user(payload: UserLogin):
    """
    Login utilisateur :
    - génère un token JWT BACKEND
    - utilisé par Swagger et le Front
    """

    token_payload = {
        "user_id": payload.email,   # ⚠️ IDENTITÉ UNIQUE
        "role": "user",
        "email": payload.email
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
            "role": "user"
        }
    }


# =========================
# LOGIN ADMIN
# =========================
@router.post("/login/admin")
def login_admin(payload: AdminLogin):
    """
    Login admin :
    - code admin stocké UNIQUEMENT dans le backend (.env)
    - jamais exposé au front
    """

    if payload.admin_code != ADMIN_CODE:
        raise HTTPException(status_code=403, detail="Code admin invalide")

    token_payload = {
        "user_id": payload.email,
        "role": "admin",
        "email": payload.email
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
            "role": "admin"
        }
    }