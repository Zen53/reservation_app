/**
 * Mock API - Simule un backend REST
 * Respecte strictement le contrat API fourni
 * 
 * Endpoints:
 * - GET /resources - Liste des ressources
 * - GET /resources/{id}/availabilities - Disponibilités d'une ressource
 * - GET /resources/{id}/reservations - Réservations d'une ressource
 * - POST /reservations - Créer une réservation
 * - GET /reservations/{id} - Détail d'une réservation
 * - DELETE /reservations/{id} - Annuler une réservation
 */

import {
  resources,
  availabilities,
  reservations,
  getNextReservationId,
  addReservation,
  removeReservation
} from './mockData';

// Délai simulé pour les appels API (en ms)
const API_DELAY = 500;

// Variable pour simuler des erreurs techniques (pour les tests)
let simulateServerError = false;

// Fonction utilitaire pour simuler un délai réseau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * GET /resources
 * Récupère la liste de toutes les ressources
 * 
 * Réponses possibles:
 * - 200: Liste de ressources
 * - 200: Liste vide
 * - 500: Erreur technique
 */
export const getResources = async () => {
  await delay(API_DELAY);

  if (simulateServerError) {
    return {
      status: 500,
      data: null,
      error: { message: "Internal Server Error" }
    };
  }

  return {
    status: 200,
    data: resources,
    error: null
  };
};

/**
 * GET /resources/{id}/availabilities
 * Récupère les disponibilités d'une ressource
 * 
 * Réponses possibles:
 * - 200: Créneaux disponibles
 * - 200: Aucun créneau disponible (liste vide)
 * - 404: Ressource inexistante
 * - 500: Erreur technique
 */
export const getResourceAvailabilities = async (resourceId) => {
  await delay(API_DELAY);

  if (simulateServerError) {
    return {
      status: 500,
      data: null,
      error: { message: "Internal Server Error" }
    };
  }

  const resource = resources.find(r => r.id === parseInt(resourceId));
  
  if (!resource) {
    return {
      status: 404,
      data: null,
      error: { message: "Resource not found" }
    };
  }

  const resourceAvailabilities = availabilities[resourceId] || [];

  return {
    status: 200,
    data: resourceAvailabilities,
    error: null
  };
};

/**
 * GET /resources/{id}
 * Récupère le détail d'une ressource
 * 
 * Réponses possibles:
 * - 200: Détail de la ressource
 * - 404: Ressource inexistante
 * - 500: Erreur technique
 */
export const getResourceById = async (resourceId) => {
  await delay(API_DELAY);

  if (simulateServerError) {
    return {
      status: 500,
      data: null,
      error: { message: "Internal Server Error" }
    };
  }

  const resource = resources.find(r => r.id === parseInt(resourceId));
  
  if (!resource) {
    return {
      status: 404,
      data: null,
      error: { message: "Resource not found" }
    };
  }

  return {
    status: 200,
    data: resource,
    error: null
  };
};

/**
 * GET /resources/{id}/reservations
 * Récupère les réservations d'une ressource
 * 
 * Réponses possibles:
 * - 200: Liste des réservations
 * - 404: Ressource inexistante
 * - 500: Erreur technique
 */
export const getResourceReservations = async (resourceId) => {
  await delay(API_DELAY);

  if (simulateServerError) {
    return {
      status: 500,
      data: null,
      error: { message: "Internal Server Error" }
    };
  }

  const resource = resources.find(r => r.id === parseInt(resourceId));
  
  if (!resource) {
    return {
      status: 404,
      data: null,
      error: { message: "Resource not found" }
    };
  }

  const resourceReservations = reservations.filter(
    r => r.resourceId === parseInt(resourceId)
  );

  return {
    status: 200,
    data: resourceReservations,
    error: null
  };
};

/**
 * POST /reservations
 * Crée une nouvelle réservation
 * 
 * Body attendu: { resourceId, date, startTime, endTime }
 * 
 * Réponses possibles:
 * - 201: Réservation créée (retourne l'id)
 * - 400: Données invalides
 * - 409: Créneau déjà réservé
 * - 500: Erreur technique
 */
export const createReservation = async (reservationData) => {
  await delay(API_DELAY);

  if (simulateServerError) {
    return {
      status: 500,
      data: null,
      error: { message: "Internal Server Error" }
    };
  }

  const { resourceId, date, startTime, endTime } = reservationData;

  // Validation des données (400 - Bad Request)
  if (!resourceId || !date || !startTime || !endTime) {
    return {
      status: 400,
      data: null,
      error: { message: "Missing required fields" }
    };
  }

  // Validation du format de date
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const timeRegex = /^\d{2}:\d{2}$/;

  if (!dateRegex.test(date) || !timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return {
      status: 400,
      data: null,
      error: { message: "Invalid date or time format" }
    };
  }

  // Vérification que startTime < endTime
  if (startTime >= endTime) {
    return {
      status: 400,
      data: null,
      error: { message: "Start time must be before end time" }
    };
  }

  // Vérification que la ressource existe
  const resource = resources.find(r => r.id === parseInt(resourceId));
  if (!resource) {
    return {
      status: 400,
      data: null,
      error: { message: "Resource does not exist" }
    };
  }

  // Vérification des conflits (409 - Conflict)
  const conflictingReservation = reservations.find(r => 
    r.resourceId === parseInt(resourceId) &&
    r.date === date &&
    ((startTime >= r.startTime && startTime < r.endTime) ||
     (endTime > r.startTime && endTime <= r.endTime) ||
     (startTime <= r.startTime && endTime >= r.endTime))
  );

  if (conflictingReservation) {
    return {
      status: 409,
      data: null,
      error: { message: "Time slot already booked" }
    };
  }

  // Création de la réservation
  const newReservation = {
    id: getNextReservationId(),
    resourceId: parseInt(resourceId),
    date,
    startTime,
    endTime,
    createdAt: new Date().toISOString()
  };

  addReservation(newReservation);

  return {
    status: 201,
    data: { id: newReservation.id },
    error: null
  };
};

/**
 * GET /reservations/{id}
 * Récupère le détail d'une réservation
 * 
 * Réponses possibles:
 * - 200: Détail de la réservation
 * - 404: Réservation inexistante
 * - 500: Erreur technique
 */
export const getReservationById = async (reservationId) => {
  await delay(API_DELAY);

  if (simulateServerError) {
    return {
      status: 500,
      data: null,
      error: { message: "Internal Server Error" }
    };
  }

  const reservation = reservations.find(r => r.id === parseInt(reservationId));
  
  if (!reservation) {
    return {
      status: 404,
      data: null,
      error: { message: "Reservation not found" }
    };
  }

  // Enrichir avec les infos de la ressource
  const resource = resources.find(r => r.id === reservation.resourceId);

  return {
    status: 200,
    data: {
      ...reservation,
      resourceName: resource?.name || "Ressource inconnue"
    },
    error: null
  };
};

/**
 * DELETE /reservations/{id}
 * Annule une réservation
 * 
 * Réponses possibles:
 * - 204: Réservation annulée
 * - 404: Réservation inexistante
 * - 500: Erreur technique
 */
export const deleteReservation = async (reservationId) => {
  await delay(API_DELAY);

  if (simulateServerError) {
    return {
      status: 500,
      data: null,
      error: { message: "Internal Server Error" }
    };
  }

  const reservation = reservations.find(r => r.id === parseInt(reservationId));
  
  if (!reservation) {
    return {
      status: 404,
      data: null,
      error: { message: "Reservation not found" }
    };
  }

  removeReservation(parseInt(reservationId));

  return {
    status: 204,
    data: null,
    error: null
  };
};

// Fonction pour activer/désactiver la simulation d'erreur serveur (pour tests)
export const setSimulateServerError = (value) => {
  simulateServerError = value;
};

/**
 * PATCH /resources/{id}/toggle
 * Active / désactive une ressource
 * 
 * Réponses possibles :
 * - 200 : Ressource mise à jour
 * - 404 : Ressource inexistante
 */
export const toggleResourceActive = async (resourceId) => {
  await delay(API_DELAY);

  const resource = resources.find(r => r.id === parseInt(resourceId));

  if (!resource) {
    return {
      status: 404,
      data: null,
      error: { message: "Resource not found" }
    };
  }

  resource.active = !resource.active;

  return {
    status: 200,
    data: resource,
    error: null
  };
};
