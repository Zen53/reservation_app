from supabase import create_client
import os
from dotenv import load_dotenv

# =========================
# CHARGEMENT .env
# =========================
load_dotenv()

# =========================
# CONFIG SUPABASE
# =========================
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL:
    raise RuntimeError("SUPABASE_URL manquant dans les variables d'environnement")

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d'environnement")

# =========================
# CLIENT SUPABASE (BACKEND)
# =========================
supabase = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)