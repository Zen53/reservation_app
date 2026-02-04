const API_URL = "http://127.0.0.1:8000";

/* =========================
   REQUEST HELPER
========================= */
export const request = async (url, options = {}, token = null) => {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
export const getResources = (token) =>
  request(`${API_URL}/resources`, {}, token);

export const getResourceById = (id, token) =>
  request(`${API_URL}/resources/${id}`, {}, token);

export const getResourceAvailabilities = (id, token) =>
  request(`${API_URL}/resources/${id}/availabilities`, {}, token);

export const getResourceReservations = (id, token) =>
  request(`${API_URL}/resources/${id}/reservations`, {}, token);

export const toggleResourceActive = (resourceId, active, token) =>
  request(
    `${API_URL}/resources/${resourceId}/active`,
    {
      method: "PATCH",
      body: JSON.stringify({ active }),
    },
    token
  );

export const getAdminReservations = (token) =>
  request(`${API_URL}/reservations/admin/all`, {}, token);

export const deleteAdminReservation = (id, token) =>
  request(
    `${API_URL}/reservations/admin/${id}`,
    {
      method: "DELETE",
    },
    token
  );

/* =========================
   RÉSERVATIONS
========================= */
export const getReservations = (token) =>
  request(`${API_URL}/reservations`, {}, token);

export const getReservationById = (id, token) =>
  request(`${API_URL}/reservations/${id}`, {}, token);

export const createReservation = (payload, token) =>
  request(
    `${API_URL}/reservations`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );

export const updateReservation = (id, payload, token) =>
  request(
    `${API_URL}/reservations/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    token
  );

export const deleteReservation = (id, token) =>
  request(
    `${API_URL}/reservations/${id}`,
    {
      method: "DELETE",
    },
    token
  );

/* =========================
   COMPTE UTILISATEUR
========================= */
export const deleteMyAccount = (token) =>
  request(
    `${API_URL}/auth/me`,
    {
      method: "DELETE",
    },
    token
  );
