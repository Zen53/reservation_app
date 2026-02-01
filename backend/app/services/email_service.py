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
# Resend init (SAFE)
# ======================
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
else:
    logging.warning("RESEND_API_KEY manquant → emails désactivés")

# ======================
# Generic sender (NE BLOQUE JAMAIS)
# ======================
def send_email(to: str, subject: str, html: str) -> None:
    try:
        if not RESEND_API_KEY or not RESEND_FROM_EMAIL:
            logging.warning("Email ignoré (config manquante)")
            return

        resend.Emails.send(
            {
                "from": RESEND_FROM_EMAIL,
                "to": to,
                "subject": subject,
                "html": html,
            }
        )

        logging.info(f"Email envoyé → {to} | {subject}")

    except Exception as e:
        logging.error(f"Erreur email → {to} | {subject} | {str(e)}")


# ==================================================
# USER — suppression compte
# ==================================================
def send_user_account_deleted_email(email: str):
    try:
        template = Path("app/templates/emails/user_account_deleted.html")
        html = template.read_text(encoding="utf-8")

        send_email(
            to=email,
            subject="Confirmation de suppression de votre compte",
            html=html,
        )
    except Exception as e:
        logging.error(f"Erreur mail suppression compte user : {e}")


# ==================================================
# ADMIN — création réservation
# ==================================================
def send_admin_reservation_created_email(data: dict):
    try:
        template = Path("app/templates/emails/admin_new_reservation.html")
        html = template.read_text(encoding="utf-8")

        for key, value in data.items():
            html = html.replace(f"{{{{ {key} }}}}", str(value))

        send_email(
            to=ADMIN_EMAIL,
            subject="Nouvelle réservation créée",
            html=html,
        )
    except Exception as e:
        logging.error(f"Erreur mail admin création : {e}")


# ==================================================
# ADMIN — annulation réservation
# ==================================================
def send_admin_reservation_cancelled_email(data: dict):
    try:
        template = Path("app/templates/emails/admin_cancel_reservation.html")
        html = template.read_text(encoding="utf-8")

        for key, value in data.items():
            html = html.replace(f"{{{{ {key} }}}}", str(value))

        send_email(
            to=ADMIN_EMAIL,
            subject="Réservation annulée",
            html=html,
        )
    except Exception as e:
        logging.error(f"Erreur mail admin annulation : {e}")
