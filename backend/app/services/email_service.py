import os
import logging
from pathlib import Path

import resend
from dotenv import load_dotenv

load_dotenv()

# ======================
# Configuration
# ======================
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ENV = os.getenv("ENV", "development")

# ======================
# Logs
# ======================
LOG_DIR = Path("app/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    filename=LOG_DIR / "email.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

# ======================
# Resend init
# ======================
if not RESEND_API_KEY:
    raise RuntimeError("RESEND_API_KEY manquant dans le .env")

if not RESEND_FROM_EMAIL:
    raise RuntimeError("RESEND_FROM_EMAIL manquant dans le .env")

resend.api_key = RESEND_API_KEY


# ======================
# Generic sender
# ======================
def send_email(to: str, subject: str, html: str) -> dict | None:
    try:
        response = resend.Emails.send(
            {
                "from": RESEND_FROM_EMAIL,
                "to": to,
                "subject": subject,
                "html": html,
            }
        )

        logging.info(f"Email envoyé → {to} | {subject}")
        return response

    except Exception as e:
        logging.error(f"Erreur email → {to} | {subject} | {str(e)}")
        return None


# ======================
# USER – suppression compte
# ======================
def send_user_account_deleted_email(email: str, first_name: str, last_name: str):
    template_path = Path("app/templates/emails/user_account_deleted.html")

    html = template_path.read_text(encoding="utf-8")
    html = html.replace("{{ first_name }}", first_name or "")
    html = html.replace("{{ last_name }}", last_name or "")
    html = html.replace("{{ email }}", email)

    subject = "Confirmation de suppression de votre compte"

    return send_email(email, subject, html)
