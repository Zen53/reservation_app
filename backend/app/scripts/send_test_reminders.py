"""
Script de test pour les emails de rappel (J-1 et H-1)

Commande :
    python -m app.scripts.send_test_reminders
"""

import os
import logging
import httpx
import asyncio

from app.core.supabase import supabase
from app.services.email_service import send_email
from app.services.template_service import render_template

logging.basicConfig(level=logging.INFO)

CLERK_BASE_URL = "https://api.clerk.dev/v1"
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")


async def fetch_user_email(user_id: str) -> str:
    if not CLERK_SECRET_KEY:
        logging.error("CLERK_SECRET_KEY manquant")
        return ""

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(
                f"{CLERK_BASE_URL}/users/{user_id}",
                headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"}
            )
            if res.status_code == 200:
                clerk_user = res.json()
                primary_id = clerk_user.get("primary_email_address_id")
                for e in clerk_user.get("email_addresses", []):
                    if e["id"] == primary_id:
                        return e["email_address"]
    except Exception as e:
        logging.error(f"Erreur récupération email Clerk : {e}")

    return ""


def send_test_reminders():
    reservations = (
        supabase
        .table("reservations")
        .select("""
            id,
            date,
            start_time,
            end_time,
            user_id,
            resources ( name )
        """)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
        .data
    )

    if not reservations:
        logging.warning("Aucune réservation trouvée pour le test.")
        return

    r = reservations[0]

    user_email = asyncio.run(fetch_user_email(r["user_id"]))
    if not user_email:
        logging.error("Email utilisateur introuvable.")
        return

    context = {
        "resource": r["resources"]["name"],
        "date": r["date"],
        "time": f"{r['start_time']} – {r['end_time']}",
    }

    send_email(
        to=user_email,
        subject="[TEST] Rappel J-1 – Votre réservation",
        html=render_template("reservation_reminder_j1.html", context),
    )

    send_email(
        to=user_email,
        subject="[TEST] Rappel H-1 – Votre réservation imminente",
        html=render_template("reservation_reminder_h1.html", context),
    )


if __name__ == "__main__":
    send_test_reminders()
