/**
 * Index des exports API
 * Point d’entrée unique pour tous les appels API
 */

export {
  // 🔧 CORE
  request,

  // 📦 RESOURCES
  getResources,
  getResourceById,
  getResourceAvailabilities,
  getResourceReservations,

  // 📅 RESERVATIONS (USER)
  getReservations,
  createReservation,
  getReservationById,
  deleteReservation,

  // 🛠 ADMIN
  toggleResourceActive,
} from "./api";