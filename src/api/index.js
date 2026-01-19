/**
 * Index des exports API
 * Point d'entrée unique pour tous les appels API
 */

export {
  getResources,
  getResourceById,
  getResourceAvailabilities,
  getResourceReservations,
  createReservation,
  getReservationById,
  deleteReservation,
  setSimulateServerError
} from './mockApi';
