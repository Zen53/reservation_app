import os
import resend
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

print(f"API KEY: {RESEND_API_KEY[:5]}..." if RESEND_API_KEY else "API KEY: Missing")
print(f"FROM: {RESEND_FROM_EMAIL}")
print(f"TO: {ADMIN_EMAIL}")

if not RESEND_API_KEY:
    print("Error: No API Key")
    exit(1)

resend.api_key = RESEND_API_KEY

try:
    r = resend.Emails.send({
        "from": RESEND_FROM_EMAIL,
        "to": ADMIN_EMAIL,  # Envoi à l'admin pour tester
        "subject": "Test Resend Manuel",
        "html": "<p>Ceci est un test manuel.</p>"
    })
    print("Success:", r)
except Exception as e:
    print("Error:", e)
