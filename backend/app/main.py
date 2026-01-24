from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from app.auth.routes import router as auth_router
from app.routes.resources import router as resources_router
from app.routes.reservations import router as reservations_router

app = FastAPI()

# 🔐 Déclaration du schéma de sécurité (Swagger)
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROUTES
# =========================
app.include_router(auth_router)
app.include_router(resources_router)
app.include_router(reservations_router)

@app.get("/")
def root():
    return {"status": "ok"}