# Reservation App (Mock)

Application React de réservation (mock) respectant strictement le contrat API fourni.

## Résumé
- Frontend React (fonctionnel + Hooks).
- API simulée dans `src/api` (mockApi.js + mockData.js).
- Aucun backend réel; le frontend n'invente pas de comportements autres que ceux du contrat.

## Arborescence importante
- `src/api/` : mock API et données (respect du contrat).
- `src/components/` : composants UI réutilisables.
- `src/pages/` : pages (`HomePage`, `ResourcePage`, `ReservationPage`).
- `src/__tests__/` : tests unitaires sur le mock API.
- `scripts/check_api.js` : script simple de vérification du contrat.

## Prérequis
- Node.js (v20+ recommandé). Sur votre machine actuelle, Vite fonctionne mais certains paquets peuvent émettre des warnings si Node < 20.19.

## Installation
À la racine du projet:

```bash
npm install
```

## Lancer le serveur de dev
```bash
npm run dev
```
Ouvrir ensuite `http://localhost:5173` (Vite affiche l'URL exacte).

## Tests automatisés
- Tests unitaires avec Vitest :

```bash
npm test
# ou
npx vitest run
```

- Vérification rapide du contrat API (script JS) :

```bash
node scripts/check_api.js
```

## Mock API et simulation d'erreurs
- Le mock respecte strictement le contrat API défini (statuts 200/201/400/404/409/500, etc.).
- Pour simuler une erreur serveur (500) : utiliser `setSimulateServerError(true)` dans `src/api/mockApi.js` (ou appeler l'export `setSimulateServerError(true)` depuis la console si vous modifiez le code).

## Messages utilisateur obligatoires
Le frontend affiche exactement les messages suivants selon la réponse API :
- Aucune disponibilité (200 liste vide) → « Aucun créneau disponible pour cette date »
- Conflit (409) → « Ce créneau n’est plus disponible »
- Données invalides (400) → « Les informations fournies sont incorrectes »
- Action en cours (bouton désactivé pendant l'appel) → texte du bouton : « Réservation en cours… »
- Erreur technique (500 / 503) → « Une erreur est survenue, veuillez réessayer plus tard »

Ces messages sont utilisés uniquement lorsqu'ils sont explicitement renvoyés par le mock API ou mappés depuis les codes HTTP ci-dessus.

## Conformité au contrat
- Toutes les routes listées dans le contrat sont implémentées dans `src/api/mockApi.js` :
  - `GET /resources` → `getResources()`
  - `GET /resources/{id}/availabilities` → `getResourceAvailabilities(id)`
  - `GET /resources/{id}/reservations` → `getResourceReservations(id)`
  - `POST /reservations` → `createReservation(payload)`
  - `GET /reservations/{id}` → `getReservationById(id)`
  - `DELETE /reservations/{id}` → `deleteReservation(id)` (optionnel)
- Le frontend n'ajoute aucune logique métier back-end supplémentaire : affichage et gestion d'état uniquement.

## Notes techniques rapides
- Navigation : `react-router-dom` (routes principales définies dans `src/App.jsx`).
- Styles : CSS simple dans chaque composant/page (pas de framework CSS externe).
- Tests : `src/__tests__/api.test.js` couvre les cas contractuels (200/400/404/409/500).

## Prochaines suggestions
- Ajouter tests d'intégration UI (`@testing-library/react`) si souhaité.
- Ajouter storybook pour visualiser les composants isolés.

---
### Backend
- Pour lancer backend(Git Bash / Windows):
  Activer le venv: `source venv/Scripts/activate`
  puis `uvicorn app.main:app --reload`
### Authentification

L’application utilise une authentification mock par token.
Le backend (FastAPI) génère un token lors du login.
Ce token est stocké côté frontend et utilisé pour protéger les routes.

Les rôles utilisateur / admin permettent de restreindre l’accès à certaines pages
(ex : espace administrateur).
