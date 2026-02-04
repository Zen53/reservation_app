from fastapi import APIRouter, HTTPException, Depends
from app.core.supabase import supabase
from app.auth.dependencies import get_current_user, get_current_admin
from app.services.email_service import send_email
from app.services.template_service import render_template
from datetime import datetime
import os

router = APIRouter(prefix="/reservations", tags=["reservations"])

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


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
async def admin_all_reservations(user=Depends(get_current_admin)):
    import httpx

    CLERK_BASE_URL = "https://api.clerk.dev/v1"
    CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

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

    import asyncio
    
    async def fetch_user_email(client, user_id):
        try:
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
        except Exception:
            pass
        return "Email introuvable"

    unique_user_ids = list(set(r["user_id"] for r in data))
    
    async with httpx.AsyncClient() as client:
        results = await asyncio.gather(*(fetch_user_email(client, uid) for uid in unique_user_ids))
    
    user_map = dict(zip(unique_user_ids, results))

    enriched_data = []
    for r in data:
        enriched_data.append({
            "id": r["id"],
            "resourceId": r["resource_id"],
            "resourceName": r["resources"]["name"],
            "userId": r["user_id"],
            "userEmail": user_map.get(r["user_id"], "N/A"),
            "date": r["date"],
            "startTime": r["start_time"],
            "endTime": r["end_time"],
            "createdAt": r["created_at"],
        })

    return enriched_data


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

    user_id = user.get("id")
    user_email = user.get("email")
    first_name = user.get("first_name", "")
    last_name = user.get("last_name", "")

    if not user_id or not user_email:
        raise HTTPException(
            status_code=400,
            detail="Informations utilisateur incomplètes"
        )

    conflicts = (
        supabase.table("reservations")
        .select("id")
        .eq("resource_id", resource_id)
        .eq("date", date)
        .or_(f"and(start_time.lt.{end_time},end_time.gt.{start_time})")
        .execute()
        .data
    )

    if conflicts:
        raise HTTPException(status_code=409, detail="Time slot already booked")

    result = (
        supabase.table("reservations")
        .insert({
            "resource_id": resource_id,
            "user_id": user_id,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
            "created_at": datetime.utcnow().isoformat(),
        })
        .execute()
    )

    reservation = result.data[0]
    reservation_id = reservation["id"]

    resource = (
        supabase.table("resources")
        .select("name")
        .eq("id", resource_id)
        .execute()
        .data[0]
    )


    try:
        if user_email:
            reservation_link = f"{FRONTEND_URL}/reservations/{reservation['id']}"
            
            if previous:
                html_content = render_template(
                    "reservation_modified.html",
                    {
                        "resource": resource["name"],
                        "old_date": previous.get("date", ""),
                        "old_time": f"{previous.get('startTime','')} – {previous.get('endTime','')}",
                        "new_date": date,
                        "new_time": f"{start_time} – {end_time}",
                        "link": reservation_link
                    },
                )
                subject = "Modification de votre réservation"
            else:
                html_content = render_template(
                    "reservation_created.html",
                    {
                        "resource": resource["name"],
                        "date": date,
                        "time": f"{start_time} – {end_time}",
                        "link": reservation_link
                    },
                )
                subject = "Confirmation de votre réservation"

            send_email(
                to=user_email,
                subject=subject,
                html=html_content
            )
    except Exception as e:
        print("Erreur email:", e)

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
    user_id = user.get("id")

    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

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
        .eq("user_id", user.get("id"))
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


@router.put("/{reservation_id}")
def update_reservation(
    reservation_id: int,
    payload: dict,
    user=Depends(get_current_user)
):
    required = ["resourceId", "date", "startTime", "endTime"]
    for field in required:
        if field not in payload:
            raise HTTPException(status_code=400, detail="Missing required fields")

    resource_id = payload["resourceId"]
    date_val = payload["date"]
    start_time = payload["startTime"]
    end_time = payload["endTime"]

    user_id = user.get("id")
    user_email = user.get("email")

    if not user_id or not user_email:
        raise HTTPException(status_code=400, detail="User info incomplete")

    existing = (
        supabase.table("reservations")
        .select("*")
        .eq("id", reservation_id)
        .eq("user_id", user_id)
        .execute()
        .data
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Reservation not found")

    old_reservation = existing[0]

    conflicts = (
        supabase.table("reservations")
        .select("id")
        .eq("resource_id", resource_id)
        .eq("date", date_val)
        .neq("id", reservation_id) # Exclude self
        .or_(f"and(start_time.lt.{end_time},end_time.gt.{start_time})")
        .execute()
        .data
    )

    if conflicts:
        raise HTTPException(status_code=409, detail="Time slot already booked")

    try:
        result = (
            supabase.table("reservations")
            .update({
                "resource_id": resource_id,
                "date": date_val,
                "start_time": start_time,
                "end_time": end_time,
            })
            .eq("id", reservation_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not result.data:
        raise HTTPException(status_code=500, detail="Update failed")
    
    updated_res = result.data[0]

    resource_data = (
        supabase.table("resources")
        .select("name")
        .eq("id", resource_id)
        .execute()
        .data
    )
    resource_name = resource_data[0]["name"] if resource_data else "Ressource"

    try:
        html_user = render_template(
            "reservation_modified.html",
            {
                "resource": resource_name,
                "old_date": old_reservation["date"],
                "old_time": f"{old_reservation['start_time']} – {old_reservation['end_time']}",
                "new_date": date_val,
                "new_time": f"{start_time} – {end_time}",
            },
        )
        send_email(
            to=user_email,
            subject="Modification de votre réservation",
            html=html_user
        )
    except Exception as e:
        print("Error sending modification email:", e)

    try:
        if ADMIN_EMAIL:
            html_admin = render_template(
                "admin_reservation_modified.html",
                {
                    "user": user_email,
                    "resource": resource_name,
                    "old_date": old_reservation["date"],
                    "old_time": f"{old_reservation['start_time']} – {old_reservation['end_time']}",
                    "new_date": date_val,
                    "new_time": f"{start_time} – {end_time}",
                },
            )
            send_email(
                to=ADMIN_EMAIL,
                subject="Réservation modifiée",
                html=html_admin,
            )
    except Exception as e:
        print("Error sending admin modification email:", e)
    
    return updated_res


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
        .eq("user_id", user.get("id"))
        .execute()
        .data
    )

    if not data:
        raise HTTPException(status_code=404, detail="Reservation not found")

    r = data[0]

    supabase.table("reservations").delete().eq("id", reservation_id).execute()

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


@router.delete("/admin/{reservation_id}", status_code=204)
def delete_reservation_admin(reservation_id: int, user=Depends(get_current_admin)):
    data = (
        supabase.table("reservations")
        .select("id")
        .eq("id", reservation_id)
        .execute()
        .data
    )

    if not data:
        raise HTTPException(status_code=404, detail="Reservation not found")

    supabase.table("reservations").delete().eq("id", reservation_id).execute()

    return None
