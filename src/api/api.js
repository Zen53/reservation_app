const API_URL = "http://127.0.0.1:8000";

/* =========================
   AUTH HEADER
========================= */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* =========================
   REQUEST WRAPPER
========================= */
const request = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = res.status === 204 ? null : await res.json();

    return {
      status: res.status,
      data: res.ok ? data : null,
      error: res.ok ? null : data,
    };
  } catch {
    return {
      status: 500,
      data: null,
      error: { message: "Network error" },
    };
  }
};

/* =========================
   RESOURCES
========================= */
export const getResources = () =>
  request(`${API_URL}/resources`);

export const getResourceById = (id) =>
  request(`${API_URL}/resources/${id}`);

export const getResourceAvailabilities = (id) =>
  request(`${API_URL}/resources/${id}/availabilities`);

/**
 * ⚠️ CONSERVÉ pour les pages "ressource"
 * (historique / compat)
 */
export const getResourceReservations = (id) =>
  request(`${API_URL}/resources/${id}/reservations`);

/* =========================
   RESERVATIONS (USER)
========================= */

/**
 * 👉 MES RÉSERVATIONS
 * utilise GET /reservations
 * protégé par token
 */
export const getReservations = () =>
  request(`${API_URL}/reservations`);

export const createReservation = (payload) =>
  request(`${API_URL}/reservations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getReservationById = (id) =>
  request(`${API_URL}/reservations/${id}`);

export const deleteReservation = (id) =>
  request(`${API_URL}/reservations/${id}`, {
    method: "DELETE",
  });

/* =========================
   NO-OP (compat admin)
========================= */
export const setSimulateServerError = () => {};
export const toggleResourceActive = () =>
  Promise.resolve({ status: 501, data: null, error: null });