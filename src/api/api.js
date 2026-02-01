const API_URL = "http://127.0.0.1:8000";

/* =========================
   AUTH
========================= */
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

/* =========================
   REQUEST HELPER
========================= */
export const request = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 204) {
      return { status: 204, data: null, error: null };
    }

    const data = await res.json().catch(() => null);

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
   RESSOURCES
========================= */
export const getResources = () =>
  request(`${API_URL}/resources`);

export const getResourceById = (id) =>
  request(`${API_URL}/resources/${id}`);

export const getResourceAvailabilities = (id) =>
  request(`${API_URL}/resources/${id}/availabilities`);

export const getResourceReservations = (id) =>
  request(`${API_URL}/resources/${id}/reservations`);

export const toggleResourceActive = (resourceId, active) =>
  request(`${API_URL}/resources/${resourceId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });

/* =========================
   RÉSERVATIONS
========================= */
export const getReservations = () =>
  request(`${API_URL}/reservations`);

export const getReservationById = (id) =>
  request(`${API_URL}/reservations/${id}`);

export const createReservation = (payload) =>
  request(`${API_URL}/reservations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteReservation = (id) =>
  request(`${API_URL}/reservations/${id}`, {
    method: "DELETE",
  });

/* =========================
   COMPTE UTILISATEUR
========================= */
export const deleteMyAccount = () =>
  request(`${API_URL}/auth/me`, {
    method: "DELETE",
  });
