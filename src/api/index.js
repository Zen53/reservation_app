/**
 * Point d’entrée unique pour tous les appels API du projet.
 * 
 * Ce fichier permet de centraliser tous les exports liés aux appels
 * vers le backend afin de simplifier les imports dans les composants React.
 */

export {
  // Fonctions de base pour effectuer des requêtes HTTP
  request,

  // Fonctions liées aux ressources
  getResources,
  getResourceById,
  getResourceAvailabilities,
  getResourceReservations,

  // Fonctions liées aux réservations utilisateur
  getReservations,
  createReservation,
  updateReservation,
  getReservationById,
  deleteReservation,

  // Fonction réservée à l’administrateur
  toggleResourceActive,
  getAdminReservations,
  deleteAdminReservation,
  deleteMyAccount,
} from "./api";