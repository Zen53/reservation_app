from dotenv import load_dotenv
load_dotenv()

from app.services.email_service import send_email

send_email(
    to="kira47@hotmail.fr",
    subject="Test Resend PROD",
    html="<p>Si tu vois ce mail, Resend est OK 🎉</p>"
)
