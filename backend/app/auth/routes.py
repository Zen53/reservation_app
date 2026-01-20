from fastapi import APIRouter, Depends
from app.models.user import User
from app.core.security import create_fake_token
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/login")
def login(role: str = "user"):
    user = User(
        id="mock-user-id",
        email="user@test.com",
        role=role
    )

    token = create_fake_token(user.id, user.role)

    return {
        "access_token": token,
        "user": user
    }

@router.get("/me")
def me(current_user = Depends(get_current_user)):
    return current_user
