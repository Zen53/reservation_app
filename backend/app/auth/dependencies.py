from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import jwt
import httpx
import requests

security = HTTPBearer()

CLERK_ISSUER = "https://distinct-starling-30.clerk.accounts.dev"
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

# Récupération des clés publiques Clerk (JWKS) au démarrage
jwks = requests.get(JWKS_URL).json()
CLERK_BASE_URL = "https://api.clerk.dev/v1"

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
if not CLERK_SECRET_KEY:
    raise RuntimeError("CLERK_SECRET_KEY manquant dans les variables d'environnement")

def get_public_key(token: str):
    """
    Récupère la bonne clé publique dans le JWKS en fonction du kid du token.
    """
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")

    for key in jwks["keys"]:
        if key["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)

    raise HTTPException(status_code=401, detail="Unable to find matching JWK")

#  Auth OBLIGATOIRE (routes PROTÉGÉES uniquement)
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
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid Clerk token payload")

    # Rôle par défaut = "user" (pas d'appel API Clerk pour éviter lenteurs)
    role = "user"

    request.state.user = {
        "id": user_id,
        "role": role,
        "raw": payload,
    }
    return request.state.user

# Auth ADMIN (avec vérif Clerk API)
async def get_current_admin(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user = await get_current_user(request, credentials)
    
    # Vérif admin grace a l'API Clerk (seulement pour pages admin)
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(
                f"{CLERK_BASE_URL}/users/{user['id']}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
            )
            
            if response.status_code == 200:
                clerk_user = response.json()
                user["role"] = clerk_user.get("public_metadata", {}).get("role", "user")
    except:
        # Fallback si Clerk API down
        user["role"] = "user"
    
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return user

# Auth OPTIONNELLE (pour pages publiques avec ou sans user)
async def get_current_user_optional(request: Request):
    credentials = request.headers.get("authorization")
    
    if not credentials or not credentials.startswith("Bearer "):
        # Anonyme = accès limité
        request.state.user = {"id": None, "role": "anonymous", "raw": None}
        return request.state.user
    
    try:
        token = credentials.split(" ")[1]
        return await get_current_user(request, HTTPAuthorizationCredentials(scheme="Bearer", credentials=token))
    except:
        # Token invalide = traite comme anonyme
        request.state.user = {"id": None, "role": "anonymous", "raw": None}
        return request.state.user
