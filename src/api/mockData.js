/**
 * Données mockées pour simuler la base de données
 * Ces données respectent strictement le contrat API
 */

// Liste des ressources (salles de réunion)
export const resources = [
  {
    id: 1,
    name: "Salle Einstein",
    description: "Grande salle de conférence - 20 personnes",
    capacity: 20,
    equipment: ["Projecteur", "Tableau blanc", "Visioconférence"]
  },
  {
    id: 2,
    name: "Salle Newton",
    description: "Salle de réunion moyenne - 10 personnes",
    capacity: 10,
    equipment: ["Écran TV", "Tableau blanc"]
  },
  {
    id: 3,
    name: "Salle Curie",
    description: "Petite salle de réunion - 6 personnes",
    capacity: 6,
    equipment: ["Écran TV"]
  },
  {
    id: 4,
    name: "Salle Darwin",
    description: "Espace collaboratif - 15 personnes",
    capacity: 15,
    equipment: ["Projecteur", "Paperboard", "Visioconférence"]
  }
];

// Disponibilités par ressource (créneaux disponibles)
export const availabilities = {
  1: [
    { date: "2026-01-20", startTime: "09:00", endTime: "10:00" },
    { date: "2026-01-20", startTime: "10:00", endTime: "11:00" },
    { date: "2026-01-20", startTime: "14:00", endTime: "15:00" },
    { date: "2026-01-20", startTime: "15:00", endTime: "16:00" },
    { date: "2026-01-21", startTime: "09:00", endTime: "10:00" },
    { date: "2026-01-21", startTime: "11:00", endTime: "12:00" },
    { date: "2026-01-22", startTime: "09:00", endTime: "10:00" },
    { date: "2026-01-22", startTime: "10:00", endTime: "11:00" }
  ],
  2: [
    { date: "2026-01-20", startTime: "08:00", endTime: "09:00" },
    { date: "2026-01-20", startTime: "13:00", endTime: "14:00" },
    { date: "2026-01-21", startTime: "10:00", endTime: "11:00" },
    { date: "2026-01-21", startTime: "14:00", endTime: "15:00" }
  ],
  3: [
    // Salle avec peu de disponibilités
    { date: "2026-01-22", startTime: "16:00", endTime: "17:00" }
  ],
  4: [] // Aucune disponibilité pour cette salle (cas de test)
};

// Réservations existantes (stockage en mémoire)
export let reservations = [
  {
    id: 1,
    resourceId: 1,
    date: "2026-01-20",
    startTime: "11:00",
    endTime: "12:00",
    createdAt: "2026-01-19T10:00:00Z"
  },
  {
    id: 2,
    resourceId: 2,
    date: "2026-01-20",
    startTime: "09:00",
    endTime: "10:00",
    createdAt: "2026-01-19T11:00:00Z"
  }
];

// Compteur pour les nouveaux IDs de réservation
export let nextReservationId = 3;

// Fonction pour incrémenter l'ID
export const getNextReservationId = () => {
  return nextReservationId++;
};

// Fonction pour ajouter une réservation
export const addReservation = (reservation) => {
  reservations.push(reservation);
};

// Fonction pour supprimer une réservation
export const removeReservation = (id) => {
  reservations = reservations.filter(r => r.id !== id);
};
