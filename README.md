# Reservation App

Application complète de réservation de ressources avec **frontend React** et **backend FastAPI**, authentification par token JWT et gestion des rôles **utilisateur / administrateur**.

---

## Résumé

- Frontend React (Vite + Hooks)
- Backend FastAPI (API REST)
- Base de données Supabase (PostgreSQL)
- Authentification JWT
- Gestion des rôles user / admin
- Créneaux générés dynamiquement
- Tableau de bord administrateur

---

## Fonctionnalités

### Utilisateur

- Connexion par email
- Consultation des ressources actives
- Visualisation des créneaux disponibles
- Création de réservations
- Consultation de ses réservations
- Suppression de ses réservations

### Administrateur

- Connexion avec rôle administrateur
- Accès à un dashboard dédié
- Activation / désactivation des ressources
- Visualisation du nombre total de ressources
- Visualisation du nombre total de réservations
- Consultation de toutes les réservations (tous utilisateurs confondus)

---

## Prérequis

### Frontend

- Node.js v18 minimum (v20 recommandé)
- npm ou yarn

### Backend

- Python 3.10+
- virtualenv / venv
- Compte Supabase (PostgreSQL)

---

## Installation

### Backend

1. Se placer dans le dossier backend
2. Créer et activer l’environnement virtuel

python -m venv venv  
source venv/bin/activate        (macOS)  
venv\\Scripts\\activate         (Windows)

3. Installer les dépendances

pip install -r requirements.txt

4. Créer un fichier .env à la racine du backend

SUPABASE_URL=  
SUPABASE_ANON_KEY=  
SUPABASE_SERVICE_ROLE_KEY=  
JWT_SECRET_KEY=  
ADMIN_CODE=
CLERK_SECRET_KEY=
---

### Frontend

1. Se placer dans le dossier frontend
2. Créer un fichier .env à la racine
   
CLERK_SECRET_KEY=

---
3. Installer les dépendances

npm install

---

## Lancer le projet

### Backend

uvicorn app.main:app --reload --env-file .env

- API disponible sur http://127.0.0.1:8000
- Swagger disponible sur http://127.0.0.1:8000/docs

---

### Frontend

npm run dev

- Application disponible sur http://localhost:5173

---

## Authentification

- Clerk gère l'authentification, les tokens JWT et la gestion des rôles
- Le token JWT généré par Clerk est stocké côté frontend (localStorage)
- Chaque requête protégée utilise l'en-tête Authorization: Bearer <clerk-token>
- Les routes sont protégées via les rôles Clerk (utilisateur ou administrateur)

---

## Messages utilisateur obligatoires

- Aucun créneau disponible → "Aucun créneau disponible pour cette période"
- Conflit de réservation (409) → "Ce créneau n’est plus disponible"
- Données invalides (400) → "Les informations fournies sont incorrectes"
- Action en cours → Bouton désactivé avec le texte "Réservation en cours…"
- Erreur serveur (500 / 503) → "Une erreur est survenue, veuillez réessayer plus tard"

---

## Conformité au contrat API

### Ressources

- GET /resources
- GET /resources/{id}
- PATCH /resources/{id}/active (admin)
- GET /resources/{id}/availabilities
- GET /resources/{id}/reservations

### Réservations utilisateur

- POST /reservations
- GET /reservations
- GET /reservations/{id}
- DELETE /reservations/{id}

### Administration

- GET /reservations/admin/stats
- GET /reservations/admin/all

---

## Notes techniques

- Frontend : React + Vite + React Router
- Backend : FastAPI + JWT
- Base de données : Supabase (PostgreSQL)
- Créneaux calculés dynamiquement à partir des règles horaires
- Détection des conflits côté backend
- Séparation stricte des rôles user / admin


## Partie Emails

# Notifications email (Resend)

- Envoi d’emails côté backend via Resend avec domaine configuré
- Emails envoyés lors de la création, annulation et modification d’une réservation
- Rappels automatiques de réservation J-1 (24h avant) et H-1 (1h avant)

# Templates HTML dédiés pour chaque type d’email

- Logique email séparée de la logique métier
- Tester les emails en local
- Créer un compte Resend et générer une clé API

# Renseigner les variables suivantes dans le .env du backend :

- RESEND_API_KEY
- RESEND_FROM_EMAIL
- ADMIN_EMAIL
- ENV=development ou production

# Lancer le backend normalement

Créer / modifier / annuler une réservation depuis l’interface pour déclencher les emails

# Rappels par email

- Des emails automatiques sont envoyés 24h (J-1) et 1h (H-1) avant chaque réservation.
- Les rappels sont gérés par une tâche planifiée côté backend.
- Les réservations créées via l’application déclenchent automatiquement les rappels.
- Pour tester, il suffit de créer une réservation proche et de lancer le script de rappels.
