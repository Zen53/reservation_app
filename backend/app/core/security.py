from datetime import datetime, timedelta
from jose import jwt, JWTError

# =========================
# CONFIGURATION DU TOKEN
# =========================

# Clé secrète utilisée pour signer les tokens JWT
# (dans un vrai projet, elle devrait être stockée dans le .env)
SECRET_KEY = "super-secret-key"

# Algorithme de chiffrement utilisé pour le JWT
ALGORITHM = "HS256"

# Durée de validité du token (en minutes)
TOKEN_EXPIRE_MINUTES = 60


# =========================
# CRÉATION DU TOKEN
# =========================
def create_access_token(data: dict):
    """
    Crée un token JWT à partir des données fournies.

    Le token contient :
    - les informations utilisateur (id, rôle, email…)
    - une date d’expiration (exp)
    """

    # On copie les données pour éviter de modifier l’original
    to_encode = data.copy()

    # Calcul de la date d’expiration du token
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)

    # Ajout de la date d’expiration au payload
    to_encode.update({"exp": expire})

    # Génération du token JWT signé
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# =========================
# DÉCODAGE DU TOKEN
# =========================
def decode_fake_token(token: str):
    """
    Décode un token JWT et retourne son contenu.

    Si le token est invalide ou expiré,
    la fonction retourne None.
    """

    try:
        # Décodage et vérification du token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Token invalide, expiré ou mal signé
        return None