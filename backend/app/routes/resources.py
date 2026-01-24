from fastapi import APIRouter, HTTPException
from app.core.supabase import supabase
from datetime import date, timedelta, datetime

router = APIRouter(prefix="/resources", tags=["resources"])


# =========================
# GET /resources
# =========================
@router.get("/")
def get_resources():
    try:
        res = (
            supabase
            .table("resources")
            .select("*")
            .execute()
        )
        return res.data
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Erreur lors de la récupération des ressources"
        )


# =========================
# GET /resources/{id}
# =========================
@router.get("/{resource_id}")
def get_resource_by_id(resource_id: int):
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

    return res[0]


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
# (CALCUL DYNAMIQUE — VERSION STABLE)
# =========================
@router.get("/{resource_id}/availabilities")
def get_resource_availabilities(resource_id: int):
    # 🔹 Règles horaires
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

    # 🔹 Réservations existantes
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
        weekday = current_day.weekday()  # 0 = lundi

        for rule in rules:
            # 🔒 Sécurisation complète des données DB
            if (
                "day_of_week" not in rule
                or "open_time" not in rule
                or "close_time" not in rule
                or "slot_duration_minutes" not in rule
                or rule["slot_duration_minutes"] is None
            ):
                continue

            if rule["day_of_week"] != weekday:
                continue

            open_time = datetime.combine(
                current_day,
                datetime.strptime(
                    str(rule["open_time"])[:8],
                    "%H:%M:%S"
                ).time()
            )

            close_time = datetime.combine(
                current_day,
                datetime.strptime(
                    str(rule["close_time"])[:8],
                    "%H:%M:%S"
                ).time()
            )

            slot_duration = timedelta(
                minutes=int(rule["slot_duration_minutes"])
            )

            slot_start = open_time

            while slot_start + slot_duration <= close_time:
                slot_end = slot_start + slot_duration

                # 🔎 Vérifier si le créneau est déjà réservé
                is_reserved = False

                for r in reservations:
                    # ✅ Normalisation de la date (str ou date)
                    reservation_date = (
                        r["date"]
                        if isinstance(r["date"], str)
                        else r["date"].isoformat()
                    )

                    if reservation_date != slot_start.date().isoformat():
                        continue

                    reserved_start = datetime.combine(
                        slot_start.date(),
                        datetime.strptime(
                            str(r["start_time"])[:8],
                            "%H:%M:%S"
                        ).time()
                    )
                    reserved_end = datetime.combine(
                        slot_start.date(),
                        datetime.strptime(
                            str(r["end_time"])[:8],
                            "%H:%M:%S"
                        ).time()
                    )

                    # ❌ Chevauchement → créneau bloqué
                    if not (
                        slot_end <= reserved_start
                        or slot_start >= reserved_end
                    ):
                        is_reserved = True
                        break

                # ✅ Créneau libre
                if not is_reserved:
                    availabilities.append({
                        "date": slot_start.date().isoformat(),
                        "startTime": slot_start.time().strftime("%H:%M"),
                        "endTime": slot_end.time().strftime("%H:%M"),
                    })

                slot_start = slot_end

        current_day += timedelta(days=1)

    return availabilities


# =========================
# GET /resources/{id}/reservations
# =========================
@router.get("/{resource_id}/reservations")
def get_resource_reservations(resource_id: int):
    rows = (
        supabase
        .table("reservations")
        .select("*")
        .eq("resource_id", resource_id)
        .order("date", desc=False)
        .order("start_time", desc=False)
        .execute()
        .data
    )

    return [
        {
            "id": r["id"],
            "resourceId": r["resource_id"],
            "date": r["date"],
            "startTime": r["start_time"],
            "endTime": r["end_time"],
            "createdAt": r["created_at"],
        }
        for r in rows
    ]