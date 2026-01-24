from fastapi import APIRouter, HTTPException
from app.core.supabase import supabase

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
# GET /resources/{id}/availabilities
# (mock volontaire : non stocké en DB)
# =========================
@router.get("/{resource_id}/availabilities")
def get_resource_availabilities(resource_id: int):
    availabilities = {
        1: [
            {"date": "2026-01-20", "startTime": "09:00", "endTime": "10:00"},
            {"date": "2026-01-20", "startTime": "10:00", "endTime": "11:00"},
        ],
        2: [
            {"date": "2026-01-20", "startTime": "08:00", "endTime": "09:00"},
        ],
        3: [
            {"date": "2026-01-22", "startTime": "16:00", "endTime": "17:00"},
        ],
        4: []
    }

    return availabilities.get(resource_id, [])


# =========================
# GET /resources/{id}/reservations
# (SUPABASE + FORMAT FRONT)
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

    # 🔁 Mapping snake_case → camelCase (CONTRAT MOCK)
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