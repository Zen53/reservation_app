from app.services.email_service import send_email

send_email(
    to="ton-email-perso@gmail.com",
    subject="Test Resend PROD",
    html="<p>Si tu vois ce mail, Resend est OK 🎉</p>"
)
