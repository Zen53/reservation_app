from datetime import datetime, timedelta
from app.core.supabase import supabase
from app.services.email_service import send_email
from app.services.template_service import render_template
import logging


def send_reminders():
    """
    Envoie les rappels J-1 et H-1
    """
    now = datetime.now()

    reservations = (
        supabase
        .table("reservations")
        .select("""
            id,
            user_id,
            date,
            start_time,
            resources(name)
        """)
        .execute()
        .data
    )

    for r in reservations:
        reservation_datetime = datetime.fromisoformat(
            f"{r['date']}T{r['start_time']}"
        )

        delta = reservation_datetime - now

        # Rappel J-1
        if timedelta(hours=23) <= delta <= timedelta(hours=25):
            send_email(
                to=r["user_id"],
                subject="Rappel : votre réservation est demain",
                html=render_template(
                    "reservation_reminder_j1.html",
                    {
                        "resource": r["resources"]["name"],
                        "date": r["date"],
                        "time": r["start_time"],
                    },
                ),
            )
            logging.info(f"Rappel J-1 envoyé (reservation {r['id']})")

        # Rappel H-1
        if timedelta(minutes=55) <= delta <= timedelta(minutes=65):
            send_email(
                to=r["user_id"],
                subject="Rappel : votre réservation commence bientôt",
                html=render_template(
                    "reservation_reminder_h1.html",
                    {
                        "resource": r["resources"]["name"],
                        "date": r["date"],
                        "time": r["start_time"],
                    },
                ),
            )
            logging.info(f"Rappel H-1 envoyé (reservation {r['id']})")
