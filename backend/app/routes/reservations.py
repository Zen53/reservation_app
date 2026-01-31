from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase import supabase
from app.auth.dependencies import get_current_user
from app.services.email_service import send_email
from app.services.template_service import render_template

router = APIRouter(prefix="/reservations", tags=["reservations"])

# ==================================================
# ADMIN
# ==================================================

@router.get("/admin/stats")
def admin_stats(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    resources = supabase.table("resources").select("id").execute().data
    reservations = supabase.table("reservations").select("id").execute().data

    return {
        "resourcesCount": len(resources),
        "reservationsCount": len(reservations)
    }


@router.get("/admin/all")
def admin_all_reservations(user=Depends(get_current_user)):
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
            "createdAt": r["created_at"]
        }
        for r in data
    ]


# ==================================================
# UTILISATEUR
# ==================================================

@router.post("/", status_code=201)
def create_reservation(payload: dict, user=Depends(get_current_user)):
    required = ["resourceId", "date", "startTime", "endTime"]
    for f in required:
        if f not in payload:
            raise HTTPException(status_code=400, detail="Missing required fields")

    resource_id = payload["resourceId"]
    date = payload["date"]
    start_time = payload["startTime"]
    end_time = payload["endTime"]
    previous = payload.get("previousReservation")

    user_id = user["user_id"]
    user_email = user["email"]

    # 🔒 conflits
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

    # ➕ insertion
    result = (
        supabase.table("reservations")
        .insert({
            "resource_id": resource_id,
            "user_id": user_id,
            "date": date,
            "start_time": start_time,
            "end_time": end_time
        })
        .execute()
    )

    reservation_id = result.data[0]["id"]

    # 🔎 nom ressource
    resource = (
        supabase.table("resources")
        .select("name")
        .eq("id", resource_id)
        .execute()
        .data[0]
    )

    # 📧 EMAIL
    if previous:
        html = render_template(
            "reservation_modified.html",
            {
                "resource": resource["name"],
                "old_date": previous["date"],
                "old_time": f'{previous["startTime"]} - {previous["endTime"]}',
                "new_date": date,
                "new_time": f"{start_time} - {end_time}"
            }
        )
        subject = "Modification de votre réservation"
    else:
        html = render_template(
            "reservation_created.html",
            {
                "resource": resource["name"],
                "date": date,
                "time": f"{start_time} - {end_time}"
            }
        )
        subject = "Confirmation de votre réservation"

    send_email(
        to=user_email,
        subject=subject,
        html=html
    )

    return {"id": reservation_id}


@router.get("/")
def get_my_reservations(user=Depends(get_current_user)):
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
        .eq("user_id", user["user_id"])
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
            "createdAt": r["created_at"]
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
        .eq("user_id", user["user_id"])
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
        "createdAt": r["created_at"]
    }


@router.delete("/{reservation_id}", status_code=204)
def delete_reservation(reservation_id: int, user=Depends(get_current_user)):
    data = (
        supabase.table("reservations")
        .delete()
        .eq("id", reservation_id)
        .eq("user_id", user["user_id"])
        .execute()
        .data
    )

    if not data:
        raise HTTPException(status_code=404, detail="Reservation not found")

    html = render_template(
        "reservation_cancelled.html",
        {
            "reservation_id": reservation_id
        }
    )

    send_email(
        to=user["email"],
        subject="Annulation de votre réservation",
        html=html
    )

    return None
