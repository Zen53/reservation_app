from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase import supabase
from app.auth.dependencies import get_current_user
from datetime import date, timedelta, datetime

router = APIRouter(prefix="/resources", tags=["resources"])


# =========================
# GET /resources
# =========================
@router.get("/")
def get_resources(user=Depends(get_current_user)):
    try:
        query = supabase.table("resources").select("*")

        # 🔐 USER → seulement actives
        if user.get("role") != "admin":
            query = query.eq("active", True)

        return query.execute().data
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la récupération des ressources"
        )


# =========================
# GET /resources/{id}
# =========================
@router.get("/{resource_id}")
def get_resource_by_id(resource_id: int, user=Depends(get_current_user)):
    res = (
        supabase
        .table("resources")
        .select("*")
        .eq("id", resource_id)
        .execute()
        .data
    )

    if not res:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource = res[0]

    # 🔐 USER ne peut pas accéder à une ressource inactive
    if user.get("role") != "admin" and resource.get("active") is False:
        raise HTTPException(status_code=403, detail="Resource disabled")

    return resource


# =========================
# PATCH /resources/{id}/active
# (ADMIN ONLY)
# =========================
@router.patch("/{resource_id}/active")
def toggle_resource_active(
    resource_id: int,
    payload: dict,
    user=Depends(get_current_user)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    if "active" not in payload:
        raise HTTPException(status_code=400, detail="Missing 'active' field")

    result = (
        supabase
        .table("resources")
        .update({"active": payload["active"]})
        .eq("id", resource_id)
        .execute()
        .data
    )

    if not result:
        raise HTTPException(status_code=404, detail="Resource not found")

    return result[0]


# =========================
# GET /resources/{id}/rules
# =========================
@router.get("/{resource_id}/rules")
def get_resource_rules(resource_id: int):
    return (
        supabase
        .table("resource_rules")
        .select("*")
        .eq("resource_id", resource_id)
        .execute()
        .data
    )


# =========================
# GET /resources/{id}/availabilities
# =========================
@router.get("/{resource_id}/availabilities")
def get_resource_availabilities(resource_id: int, user=Depends(get_current_user)):
    resource = (
        supabase
        .table("resources")
        .select("active")
        .eq("id", resource_id)
        .execute()
        .data
    )

    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # 🔒 AUCUN créneau si inactive
    if resource[0]["active"] is False:
        return []

    rules = (
        supabase
        .table("resource_rules")
        .select("*")
        .eq("resource_id", resource_id)
        .execute()
        .data
    )

    if not rules:
        return []

    reservations = (
        supabase
        .table("reservations")
        .select("date,start_time,end_time")
        .eq("resource_id", resource_id)
        .execute()
        .data
    )

    today = date.today()
    end_date = today + timedelta(days=7)
    availabilities = []

    current_day = today
    while current_day <= end_date:
        weekday = current_day.weekday()

        for rule in rules:
            if rule.get("day_of_week") != weekday:
                continue

            open_time = datetime.combine(
                current_day,
                datetime.strptime(str(rule["open_time"])[:8], "%H:%M:%S").time()
            )
            close_time = datetime.combine(
                current_day,
                datetime.strptime(str(rule["close_time"])[:8], "%H:%M:%S").time()
            )

            slot_duration = timedelta(minutes=int(rule["slot_duration_minutes"]))
            slot_start = open_time

            while slot_start + slot_duration <= close_time:
                slot_end = slot_start + slot_duration
                is_reserved = False

                for r in reservations:
                    if r["date"] != slot_start.date().isoformat():
                        continue

                    reserved_start = datetime.combine(
                        slot_start.date(),
                        datetime.strptime(str(r["start_time"])[:8], "%H:%M:%S").time()
                    )
                    reserved_end = datetime.combine(
                        slot_start.date(),
                        datetime.strptime(str(r["end_time"])[:8], "%H:%M:%S").time()
                    )

                    if not (slot_end <= reserved_start or slot_start >= reserved_end):
                        is_reserved = True
                        break

                if not is_reserved:
                    availabilities.append({
                        "date": slot_start.date().isoformat(),
                        "startTime": slot_start.time().strftime("%H:%M"),
                        "endTime": slot_end.time().strftime("%H:%M"),
                    })

                slot_start = slot_end

        current_day += timedelta(days=1)

    return availabilities