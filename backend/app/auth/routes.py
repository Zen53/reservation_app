from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])
class UserLogin(BaseModel):
    first_name: str
    last_name: str
    email: str

class AdminLogin(BaseModel):
    first_name: str
    last_name: str
    email: str
    admin_code: str


@router.post("/login/user")
def login_user(payload: UserLogin):
    token = create_access_token({
        "user_id": 1,
        "role": "user",
        "email": payload.email
    })

    return {
        "access_token": token,
        "user": {
            "id": 1,
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "email": payload.email,
            "role": "user"
        }
    }

@router.post("/login/admin")
def login_admin(payload: AdminLogin):
    if payload.admin_code != "code123":
        raise HTTPException(status_code=403, detail="Code admin invalide")

    token = create_access_token({
        "user_id": 99,
        "role": "admin",
        "email": payload.email
    })

    return {
        "access_token": token,
        "user": {
            "id": 99,
            "first_name": payload.first_name,
            "last_name": payload.last_name,
            "email": payload.email,
            "role": "admin"
        }
    }
