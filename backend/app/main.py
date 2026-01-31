from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer

from app.auth.routes import router as auth_router
from app.routes.resources import router as resources_router
from app.routes.reservations import router as reservations_router

# Création de l'application FastAPI
app = FastAPI(
    title="Reservation API",
    version="1.0.0"
)

# Schéma de sécurité pour Swagger (Bearer Token)
security = HTTPBearer()

# Configuration CORS pour autoriser le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
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

# Déclaration des routes de l'application
app.include_router(auth_router)
app.include_router(resources_router)
app.include_router(reservations_router)

# Route simple pour vérifier que l'API fonctionne
@app.get("/")
def root():
    return {"status": "ok"}