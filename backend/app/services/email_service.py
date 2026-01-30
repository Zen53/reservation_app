import os
import logging
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
EMAIL_FROM = os.getenv("EMAIL_FROM")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ENV = os.getenv("ENV", "development")

logging.basicConfig(
    filename="app/logs/email.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def send_email(to: str, subject: str, html: str):
    try:
        if ENV != "production":
            logging.info(f"[DEV] Email simulé → {to} | {subject}")
            return

        resend.Emails.send({
            "from": EMAIL_FROM,
            "to": to,
            "subject": subject,
            "html": html,
        })

        logging.info(f"Email envoyé → {to} | {subject}")

    except Exception as e:
        logging.error(f"Erreur email ({to}) : {str(e)}")
