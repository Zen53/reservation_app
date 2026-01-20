from fastapi import Header, HTTPException
from app.core.security import decode_fake_token

def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.replace("Bearer ", "")
    payload = decode_fake_token(token)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload
