"""
Script de test pour les emails de rappel (J-1 et H-1)

⚠️ Ce script est volontairement indépendant du temps réel.
Il permet de tester les emails sans attendre une vraie échéance.

Commande :
    python -m app.scripts.send_test_reminders
"""

from app.core.supabase import supabase
from app.services.email_service import send_email
from app.services.template_service import render_template
import logging

logging.basicConfig(level=logging.INFO)


def send_test_reminders():
    # 1️⃣ Récupérer UNE réservation (la plus récente)
    reservations = (
        supabase
        .table("reservations")
        .select("""
            id,
            date,
            start_time,
            end_time,
            user_id,
            resources (
                name
            )
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

    resource_name = r["resources"]["name"]
    user_email = r["user_id"]

    context = {
        "resource": resource_name,
        "date": r["date"],
        "time": f"{r['start_time']} - {r['end_time']}",
    }

    # 2️⃣ Email J-1
    send_email(
        to=user_email,
        subject="[TEST] Rappel J-1 – Votre réservation",
        html=render_template(
            "reservation_reminder_j1.html",
            context
        ),
    )

    logging.info(f"[TEST] Email J-1 envoyé à {user_email}")

    # 3️⃣ Email H-1
    send_email(
        to=user_email,
        subject="[TEST] Rappel H-1 – Votre réservation imminente",
        html=render_template(
            "reservation_reminder_h1.html",
            context
        ),
    )

    logging.info(f"[TEST] Email H-1 envoyé à {user_email}")


if __name__ == "__main__":
    send_test_reminders()
