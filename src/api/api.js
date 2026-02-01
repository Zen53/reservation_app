const API_URL = "http://127.0.0.1:8000";

/*
  Récupère le token stocké dans le navigateur
  et l’ajoute dans le header Authorization si présent
*/
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/*
  Fonction générique pour faire des appels API
  Elle gère :
  - les headers
  - le JSON
  - les erreurs simples
*/
export const request = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data =
      res.status === 204
        ? null
        : await res.json().catch(() => null);

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

/*
  ----- RESSOURCES -----
*/

export const getResources = () =>
  request(`${API_URL}/resources`);

export const getResourceById = (id) =>
  request(`${API_URL}/resources/${id}`);

export const getResourceAvailabilities = (id) =>
  request(`${API_URL}/resources/${id}/availabilities`);

export const getResourceReservations = (id) =>
  request(`${API_URL}/resources/${id}/reservations`);

/*
  ----- RÉSERVATIONS UTILISATEUR -----
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

/*
  ----- ADMIN -----
*/

export const toggleResourceActive = (resourceId, active) =>
  request(`${API_URL}/resources/${resourceId}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });

  /*
  ----- COMPTE UTILISATEUR -----
*/

export const deleteMyAccount = (email) =>
  request(`http://127.0.0.1:8000/auth/me?email=${email}`, {
    method: "DELETE",
  });
