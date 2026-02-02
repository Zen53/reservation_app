const API_URL = "http://127.0.0.1:8000";

/* =========================
   REQUEST HELPER
========================= */
export const request = async (url, options = {}, extraHeaders = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    ...extraHeaders,
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
export const getResources = extraHeaders = {}) =>
  request(`${API_URL}/resources`, {}, extraHeaders);

export const getResourceById = (id, extraHeaders = {}) =>
  request(`${API_URL}/resources/${id}`, {}, extraHeaders);

export const getResourceAvailabilities = (id, extraHeaders = {}) =>
  request(`${API_URL}/resources/${id}/availabilities`, {}, extraHeaders);

export const getResourceReservations = (id, extraHeaders = {}) =>
  request(`${API_URL}/resources/${id}/reservations`, {}, extraHeaders);

export const toggleResourceActive = (resourceId, active, extraHeaders = {}) =>
  request(`${API_URL}/resources/${resourceId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  }, extraHeaders);

/* =========================
   RÉSERVATIONS
========================= */
export const getReservations = (extraHeaders = {}) =>
  request(`${API_URL}/reservations`, {}, extraHeaders);

export const getReservationById = (id, extraHeaders = {}) =>
  request(`${API_URL}/reservations/${id}`, {}, extraHeaders);

export const createReservation = (payload, extraHeaders = {}) =>
  request(`${API_URL}/reservations`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, extraHeaders);

export const deleteReservation = (id, extraHeaders = {}) =>
  request(`${API_URL}/reservations/${id}`, {
    method: "DELETE",
  }, extraHeaders);

// ADMIN
export const toggleResourceActive = (resourceId, active, extraHeaders = {}) =>
  request(`${API_URL}/resources/${resourceId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  }, extraHeaders);

/* =========================
   COMPTE UTILISATEUR
========================= */
export const deleteMyAccount = ( extraHeaders = {}) =>
  request(`${API_URL}/auth/me`, {
    method: "DELETE",
  }, extraHeaders);
