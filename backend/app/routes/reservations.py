from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase import supabase
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/reservations", tags=["reservations"])

# ==================================================
# PARTIE ADMIN
# ==================================================

# Récupère des statistiques globales
# Accessible uniquement par un administrateur
@router.get("/admin/stats")
def admin_stats(
    user=Depends(get_current_user)
):
    # Vérification du rôle admin
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Récupération du nombre de ressources
    resources = (
        supabase
        .table("resources")
        .select("id")
        .execute()
        .data
    )

    # Récupération du nombre de réservations
    reservations = (
        supabase
        .table("reservations")
        .select("id")
        .execute()
        .data
    )

    return {
        "resourcesCount": len(resources),
        "reservationsCount": len(reservations)
    }

# Récupère toutes les réservations (tous utilisateurs)
# Réservé à l'administrateur
@router.get("/admin/all")
def admin_all_reservations(
    user=Depends(get_current_user)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

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
        .order("created_at", desc=True)
        .execute()
        .data
    )

    # Mise en forme des données pour le frontend
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
# PARTIE UTILISATEUR
# ==================================================

# Création d'une réservation
# L'utilisateur doit être connecté
@router.post("/", status_code=201)
def create_reservation(
    payload: dict,
    user=Depends(get_current_user)
):
    # Vérification des champs obligatoires
    required_fields = ["resourceId", "date", "startTime", "endTime"]
    for field in required_fields:
        if field not in payload:
            raise HTTPException(status_code=400, detail="Missing required fields")

    resource_id = payload["resourceId"]
    date = payload["date"]
    start_time = payload["startTime"]
    end_time = payload["endTime"]

    # Identifiant utilisateur récupéré depuis le token
    user_id = user["user_id"]

    # Vérification des conflits de réservation
    conflicts = (
        supabase
        .table("reservations")
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

    # Insertion de la réservation
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

# Récupère les réservations de l'utilisateur connecté
@router.get("/")
def get_my_reservations(
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


# Récupère une réservation précise (si elle appartient à l'utilisateur)
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


# Suppression d'une réservation (propriétaire uniquement)
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
