from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase import supabase
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/reservations", tags=["reservations"])


# =========================
# POST /reservations
# =========================
@router.post("/", status_code=201)
def create_reservation(
    payload: dict,
    user=Depends(get_current_user)
):
    required_fields = ["resourceId", "date", "startTime", "endTime"]
    for field in required_fields:
        if field not in payload:
            raise HTTPException(status_code=400, detail="Missing required fields")

    resource_id = payload["resourceId"]
    date = payload["date"]
    start_time = payload["startTime"]
    end_time = payload["endTime"]

    # ✅ USER ID DEPUIS LE TOKEN
    user_id = user["user_id"]

    # 🔎 Vérification des conflits (tous utilisateurs confondus)
    conflicts = (
        supabase
        .table("reservations")
        .select("id")
        .eq("resource_id", resource_id)
        .eq("date", date)
        .or_(
            f"and(start_time.lte.{start_time},end_time.gt.{start_time}),"
            f"and(start_time.lt.{end_time},end_time.gte.{end_time}),"
            f"and(start_time.gte.{start_time},end_time.lte.{end_time})"
        )
        .execute()
        .data
    )

    if conflicts:
        raise HTTPException(status_code=409, detail="Time slot already booked")

    # ✅ INSERT AVEC user_id
    result = (
        supabase
        .table("reservations")
        .insert({
            "resource_id": resource_id,
            "user_id": user_id,
            "date": date,
            "start_time": start_time,
            "end_time": end_time
        })
        .execute()
    )

    return {"id": result.data[0]["id"]}


# =========================
# GET /reservations
# (MES RÉSERVATIONS)
# =========================
@router.get("/")
def get_all_reservations(
    user=Depends(get_current_user)
):
    user_id = user["user_id"]

    data = (
        supabase
        .table("reservations")
        .select("""
            id,
            resource_id,
            user_id,
            date,
            start_time,
            end_time,
            created_at,
            resources (
                name
            )
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
            "createdAt": r["created_at"]
        }
        for r in data
    ]


# =========================
# GET /reservations/{id}
# =========================
@router.get("/{reservation_id}")
def get_reservation_by_id(
    reservation_id: int,
    user=Depends(get_current_user)
):
    user_id = user["user_id"]

    data = (
        supabase
        .table("reservations")
        .select("""
            id,
            resource_id,
            user_id,
            date,
            start_time,
            end_time,
            created_at,
            resources (
                name
            )
        """)
        .eq("id", reservation_id)
        .eq("user_id", user_id)
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


# =========================
# DELETE /reservations/{id}
# =========================
@router.delete("/{reservation_id}", status_code=204)
def delete_reservation(
    reservation_id: int,
    user=Depends(get_current_user)
):
    user_id = user["user_id"]

    data = (
        supabase
        .table("reservations")
        .delete()
        .eq("id", reservation_id)
        .eq("user_id", user_id)
        .execute()
        .data
    )

    if not data:
        raise HTTPException(status_code=404, detail="Reservation not found")