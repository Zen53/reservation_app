from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase import supabase
from app.auth.dependencies import get_current_user, get_current_admin  # ← Les 2 !
from app.services.email_service import send_email
from app.services.template_service import render_template
import os

router = APIRouter(prefix="/reservations", tags=["reservations"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")

# ==================================================
# ADMIN
# ==================================================

@router.get("/admin/stats")
def admin_stats(user=Depends(get_current_admin)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    resources = supabase.table("resources").select("id").execute().data
    reservations = supabase.table("reservations").select("id").execute().data

    return {
        "resourcesCount": len(resources),
        "reservationsCount": len(reservations),
    }


@router.get("/admin/all")
def admin_all_reservations(user=Depends(get_current_admin)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    data = (
        supabase.table("reservations")
        .select("""
            id,
            resource_id,
            user_id,
            date,
            start_time,
            end_time,
            created_at,
            resources ( name )
        """)
        .order("created_at", desc=True)
        .execute()
        .data
    )

    return [
        {
            "id": r["id"],
            "resourceId": r["resource_id"],
            "resourceName": r["resources"]["name"],
            "userId": r["user_id"],
            "date": r["date"],
            "startTime": r["start_time"],
            "endTime": r["end_time"],
            "createdAt": r["created_at"],
        }
        for r in data
    ]


# ==================================================
# UTILISATEUR
# ==================================================

@router.post("/", status_code=201)
def create_reservation(payload: dict, user=Depends(get_current_user)):
    required = ["resourceId", "date", "startTime", "endTime"]
    for field in required:
        if field not in payload:
            raise HTTPException(status_code=400, detail="Missing required fields")

    resource_id = payload["resourceId"]
    date = payload["date"]
    start_time = payload["startTime"]
    end_time = payload["endTime"]
    previous = payload.get("previousReservation")

    user_id = user["id"]
    user_email = user["email"]

    # 🔒 Vérification des conflits
    conflicts = (
        supabase.table("reservations")
        .select("id")
        .eq("resource_id", resource_id)
        .eq("date", date)
        .lt("start_time", end_time)
        .gt("end_time", start_time)
        .execute()
        .data
    )

    if conflicts:
        raise HTTPException(status_code=409, detail="Time slot already booked")

    # ➕ Création réservation
    result = (
        supabase.table("reservations")
        .insert({
            "resource_id": resource_id,
            "user_id": user_id,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
        })
        .execute()
    )

    reservation_id = result.data[0]["id"]

    # Nom de la ressource
    resource = (
        supabase.table("resources")
        .select("name")
        .eq("id", resource_id)
        .execute()
        .data[0]
    )

    # =============================
    # EMAIL UTILISATEUR (SAFE)
    # =============================
    try:
        if previous:
            html_user = render_template(
                "reservation_modified.html",
                {
                    "resource": resource["name"],
                    "old_date": previous.get("date", ""),
                    "old_time": f"{previous.get('startTime','')} – {previous.get('endTime','')}",
                    "new_date": date,
                    "new_time": f"{start_time} – {end_time}",
                },
            )
            subject = "Modification de votre réservation"
        else:
            html_user = render_template(
                "reservation_created.html",
                {
                    "resource": resource["name"],
                    "date": date,
                    "time": f"{start_time} – {end_time}",
                },
            )
            subject = "Confirmation de votre réservation"

        send_email(to=user_email, subject=subject, html=html_user)
    except Exception as e:
        print("Erreur email utilisateur :", e)

    # =============================
    # EMAIL ADMIN (SAFE)
    # =============================
    try:
        if ADMIN_EMAIL:
            html_admin = render_template(
                "admin_reservation_created.html",
                {
                    "user": user_email,
                    "resource": resource["name"],
                    "date": date,
                    "time": f"{start_time} – {end_time}",
                },
            )
            send_email(
                to=ADMIN_EMAIL,
                subject="Nouvelle réservation créée",
                html=html_admin,
            )
    except Exception as e:
        print("Erreur email admin :", e)

    return {"id": reservation_id}


@router.get("/")
def get_my_reservations(user=Depends(get_current_user)):
    user_id= user["id"]
    data = (
        supabase.table("reservations")
        .select("""
            id,
            resource_id,
            date,
            start_time,
            end_time,
            created_at,
            resources ( name )
        """)
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
        .data
    )

    return [
        {
            "id": r["id"],
            "resourceId": r["resource_id"],
            "resourceName": r["resources"]["name"],
            "date": r["date"],
            "startTime": r["start_time"],
            "endTime": r["end_time"],
            "createdAt": r["created_at"],
        }
        for r in data
    ]


@router.get("/{reservation_id}")
def get_reservation_by_id(reservation_id: int, user=Depends(get_current_user)):
    data = (
        supabase.table("reservations")
        .select("""
            id,
            resource_id,
            date,
            start_time,
            end_time,
            created_at,
            resources ( name )
        """)
        .eq("id", reservation_id)
        .eq("user_id", user["id"])
        .execute()
        .data
    )

    if not data:
        raise HTTPException(status_code=404, detail="Reservation not found")

    r = data[0]

    return {
        "id": r["id"],
        "resourceId": r["resource_id"],
        "resourceName": r["resources"]["name"],
        "date": r["date"],
        "startTime": r["start_time"],
        "endTime": r["end_time"],
        "createdAt": r["created_at"],
    }


@router.delete("/{reservation_id}", status_code=204)
def delete_reservation(reservation_id: int, user=Depends(get_current_user)):
    data = (
        supabase.table("reservations")
        .select("""
            id,
            date,
            start_time,
            end_time,
            resources ( name )
        """)
        .eq("id", reservation_id)
        .eq("user_id", user["id"])
        .execute()
        .data
    )

    if not data:
        raise HTTPException(status_code=404, detail="Reservation not found")

    r = data[0]

    supabase.table("reservations").delete().eq("id", reservation_id).execute()

    # EMAIL UTILISATEUR (SAFE)
    try:
        html_user = render_template(
            "reservation_cancelled.html",
            {
                "resource": r["resources"]["name"],
                "date": r["date"],
                "time": f"{r['start_time']} – {r['end_time']}",
            },
        )
        send_email(
            to=user["email"],
            subject="Annulation de votre réservation",
            html=html_user,
        )
    except Exception as e:
        print("Erreur email utilisateur :", e)

    # EMAIL ADMIN (SAFE)
    try:
        if ADMIN_EMAIL:
            html_admin = render_template(
                "admin_reservation_cancelled.html",
                {
                    "user": user["email"],
                    "resource": r["resources"]["name"],
                    "date": r["date"],
                    "time": f"{r['start_time']} – {r['end_time']}",
                },
            )
            send_email(
                to=ADMIN_EMAIL,
                subject="Réservation annulée",
                html=html_admin,
            )
    except Exception as e:
        print("Erreur email admin :", e)

    return None
