from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from app.auth.routes import router as auth_router
from app.routes.resources import router as resources_router
from app.routes.reservations import router as reservations_router

app = FastAPI(
    title="Reservation API",
    version="1.0.0"
)

# =========================
# 🔐 SECURITY (Swagger)
# =========================
security = HTTPBearer()

# =========================
# 🌍 CORS (FRONT + ADMIN)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Front Vite
    ],
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
    ],
)

# =========================
# ROUTES
# =========================
app.include_router(auth_router)
app.include_router(resources_router)
app.include_router(reservations_router)

# =========================
# HEALTHCHECK
# =========================
@app.get("/")
def root():
    return {"status": "ok"}