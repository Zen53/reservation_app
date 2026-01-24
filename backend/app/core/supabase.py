from supabase import create_client
import os
from dotenv import load_dotenv

# =========================
# CHARGEMENT DES VARIABLES D’ENVIRONNEMENT
# =========================

# Charge le fichier .env pour rendre les variables accessibles
load_dotenv()


# =========================
# CONFIGURATION SUPABASE
# =========================

# URL du projet Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")

# Clé service role (utilisée uniquement côté backend)
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


# Vérification de la présence des variables nécessaires
if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL manquant dans les variables d'environnement")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d'environnement")


# =========================
# CLIENT SUPABASE
# =========================

# Création du client Supabase utilisé dans tout le backend
# Ce client permet de lire / écrire dans la base de données
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)