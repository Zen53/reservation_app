from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import jwt
import httpx
import requests

# =========================
# CONFIGURATION CLERK
# =========================
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

CLERK_ISSUER = "https://distinct-starling-30.clerk.accounts.dev"
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

CLERK_BASE_URL = "https://api.clerk.dev/v1"
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    raise RuntimeError("CLERK_SECRET_KEY manquant dans les variables d'environnement")


# =========================
# JWKS / JWT UTIL
# =========================
def get_public_key(token: str):
    try:
        jwks = requests.get(JWKS_URL, timeout=5).json()
        header = jwt.get_unverified_header(token)

        for key in jwks["keys"]:
            if key["kid"] == header.get("kid"):
                return jwt.algorithms.RSAAlgorithm.from_jwk(key)

        raise HTTPException(status_code=401, detail="Invalid token key")
    except Exception:
        raise HTTPException(status_code=401, detail="Unable to verify token")


# =========================
# USER CONNECTÉ (OBLIGATOIRE)
# =========================
# Global client to reuse connection
# Note: For production, handle lifecycle (startup/shutdown). Here simple global is fine.
client = httpx.AsyncClient(timeout=5.0)

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        public_key = get_public_key(token)
        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False},
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Invalid Clerk token")

    # Reuse global client
    res = await client.get(
        f"{CLERK_BASE_URL}/users/{clerk_user_id}",
        headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
    )

    if res.status_code != 200:
        raise HTTPException(status_code=401, detail="Unable to fetch Clerk user")

    clerk_user = res.json()

    # Récupération fiable de l'email principal
    email = None
    primary_email_id = clerk_user.get("primary_email_address_id")
    for e in clerk_user.get("email_addresses", []):
        if e.get("id") == primary_email_id:
            email = e.get("email_address")
            break

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email utilisateur introuvable",
        )

    user = {
        "id": clerk_user_id,
        "email": email,
        "first_name": clerk_user.get("first_name") or "",
        "last_name": clerk_user.get("last_name") or "",
        "role": clerk_user.get("public_metadata", {}).get("role", "user"),
    }

    request.state.user = user
    return user


# =========================
# USER CONNECTÉ (OPTIONNEL)
# =========================
async def get_current_user_optional(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security_optional),
):
    if not credentials:
        return None

    try:
        return await get_current_user(request, credentials)
    except Exception:
        return None


# =========================
# ADMIN
# =========================
async def get_current_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
