# Présentation du projet – Application de réservation

Ce document explique ce que nous avons fait, pourquoi nous l’avons fait et comment le projet fonctionne, du frontend jusqu’au backend.

L’objectif est de montrer la logique technique, les choix réalisés et la progression du projet.

---

## 1. Objectif du projet

Le but du projet est de créer une application complète de réservation de ressources.

Une ressource peut être par exemple :
- une salle de réunion,
- une salle de conférence,
- un équipement.

Les utilisateurs doivent pouvoir :
- voir les ressources disponibles,
- consulter les créneaux horaires,
- réserver un créneau,
- gérer leurs réservations.

Les administrateurs doivent pouvoir :
- gérer l’état des ressources (actives / inactives),
- voir toutes les réservations,
- consulter des statistiques globales.

---

## 2. Architecture générale

Le projet est séparé en deux parties distinctes :

### Frontend
- React (Vite)
- Gestion de l’interface utilisateur
- Appels API vers le backend
- Gestion de l’authentification via token

### Backend
- FastAPI
- API REST
- Authentification JWT
- Connexion à une base de données Supabase (PostgreSQL)
- Logique métier (réservations, conflits, rôles)

Cette séparation permet :
- une meilleure organisation,
- une application plus maintenable,
- une vraie logique professionnelle.

---

## 3. Phase 1 – Frontend avec Mock API

### Pourquoi commencer par un mock ?

Au début, nous n’avions pas encore de backend réel.  
Nous avons donc utilisé un Mock API côté frontend pour :

- respecter un contrat API donné,
- développer l’interface sans dépendre du backend,
- tester tous les cas (succès, erreurs, conflits).

### Ce que faisait le mock

Le mock simulait :
- les ressources,
- les créneaux disponibles,
- les réservations,
- les erreurs (400, 409, 500).

Le frontend ne faisait aucune logique métier :
il affichait uniquement ce que l’API renvoyait.

---

## 4. Phase 2 – Mise en place du backend FastAPI

### Pourquoi FastAPI ?

FastAPI a été choisi car :
- il est rapide,
- il génère automatiquement Swagger,
- il est très adapté aux API REST modernes.

### Structure du backend

Le backend est organisé par responsabilités :

- auth → authentification
- resources → ressources et créneaux
- reservations → réservations utilisateur et admin

Chaque route correspond à un besoin précis du frontend.

---

## 5. Authentification et rôles

### Principe

Lors de la connexion :
- le backend génère une connexion a Clerk
- Cela permet de gérer les roles par l'API CLerk
- La gestion de token reste la meme qu'une utilisation classique sans Clerk

Le frontend :
- stocke le token dans le localStorage
- l’envoie dans l’en-tête Authorization à chaque requête protégée

### Pourquoi les rôles ?

Les rôles permettent de :
- protéger certaines routes
- donner plus de droits à l’administrateur
- éviter qu’un utilisateur fasse des actions interdites

Exemples :
- un user ne peut voir que ses réservations
- un admin peut voir toutes les réservations

---

## 6. Gestion des ressources

Chaque ressource possède :
- un nom
- une description
- une capacité
- un état actif / inactif

### Pourquoi activer / désactiver ?

Cela permet à l’administrateur de :
- retirer une ressource temporairement
- empêcher toute réservation sans supprimer la ressource

Le frontend admin appelle une route protégée :
PATCH /resources/{id}/active

---

## 7. Gestion des créneaux horaires

### Principe général

Les créneaux ne sont pas stockés directement en base.

Ils sont générés dynamiquement à partir :
- de règles horaires (jours, heures, durée)
- des réservations existantes

### Avantages

- pas de duplication inutile en base
- créneaux toujours à jour
- logique centralisée dans le backend

### Étapes du calcul

Pour chaque ressource :
1. lire les règles horaires
2. parcourir les jours à venir
3. générer des créneaux
4. exclure ceux déjà réservés
5. renvoyer uniquement les créneaux disponibles

---

## 8. Gestion des réservations

### Création d’une réservation

Lorsqu’un utilisateur réserve :
1. le frontend envoie la demande
2. le backend vérifie les conflits
3. si aucun conflit → insertion en base
4. sinon → erreur 409

### Pourquoi vérifier côté backend ?

Même si le frontend affiche des créneaux libres :
- plusieurs utilisateurs peuvent réserver en même temps
- seul le backend peut garantir la cohérence

---

## 9. Partie administrateur

### Dashboard admin

L’administrateur dispose :
- du nombre total de ressources
- du nombre total de réservations
- de la liste complète des réservations

### Pourquoi une vue globale ?

Cela permet :
- un suivi de l’utilisation
- une gestion centralisée
- une vision claire du système

Les routes admin sont protégées par le rôle.

---

## 10. Sécurité et bonnes pratiques

- Vérification systématique du token
- Vérification du rôle admin
- Validation des données reçues
- Gestion des erreurs HTTP explicites
- Aucun secret dans le frontend
- Variables sensibles dans le .env

---

## 11. Conclusion

Ce projet montre :
- une vraie séparation frontend / backend
- une logique professionnelle
- une API sécurisée
- une application complète et fonctionnelle

Il simule un cas réel d’entreprise :
- gestion des utilisateurs
- gestion des ressources
- gestion des droits
- prévention des conflits

C’est une base solide pour une application de réservation réelle.
