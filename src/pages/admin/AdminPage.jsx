import "./AdminPage.css";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

import {
  getResources,
  toggleResourceActive,
  request
} from "../../api";

export default function AdminPage() {
  const { getToken } = useAuth();

  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    resourcesCount: 0,
    reservationsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const token = await getToken();

        const authHeaders = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        // Récupération de la liste des ressources
        const resourcesRes = await getResources(authHeaders);
        if (resourcesRes.status !== 200) throw new Error();
        setResources(resourcesRes.data);

        // Récupération des statistiques globales (admin uniquement)
        const statsRes = await request(
          "http://127.0.0.1:8000/reservations/admin/stats",
          {},
          authHeaders
        );
        if (statsRes.status === 200) {
          setStats(statsRes.data);
        }

        // Récupération de toutes les réservations de tous les utilisateurs
        const allRes = await request(
          "http://127.0.0.1:8000/reservations/admin/all",
          {},
          authHeaders
        );
        if (allRes.status === 200) {
          setReservations(allRes.data);
        }
      } catch {
        setError("Erreur lors du chargement des données administrateur");
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [getToken]);

  // Activation / désactivation d’une ressource par l’admin
  const handleToggleActive = async (resource) => {
    try {
      const token = await getToken();
      const authHeaders = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const newActive = !resource.active;

      const res = await toggleResourceActive(resource.id, newActive,authHeaders);

      if (res.status === 200) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id ? { ...r, active: newActive } : r
          )
        );
      } else {
        alert("Impossible de modifier l’état de la ressource");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la modification de la ressource");
    }
  };

  if (loading) {
    return <p>Chargement du dashboard administrateur...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="page">
      <h1>Dashboard Administrateur</h1>

      {/* Affichage des statistiques globales */}
      <section>
        <h2>Statistiques globales</h2>
        <ul>
          <li>Nombre de ressources : {stats.resourcesCount}</li>
          <li>Nombre total de réservations : {stats.reservationsCount}</li>
        </ul>
      </section>

      {/* Gestion de l’activation des ressources */}
      <section>
        <h2>Gestion des ressources</h2>

        <ul>
          {resources.map((resource) => (
            <li key={resource.id}>
              <strong>{resource.name}</strong> —{" "}
              {resource.active ? "Active" : "Inactive"}

              <button
                className={
                  resource.active ? "btn-desactivate" : "btn-activate"
                }
                onClick={() => handleToggleActive(resource)}
              >
                {resource.active ? "Désactiver" : "Activer"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Historique de toutes les réservations */}
      <section>
        <h2>Historique global des réservations</h2>

        {reservations.length === 0 ? (
          <p>Aucune réservation.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ressource</th>
                <th>Utilisateur</th>
                <th>Date</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Créée le</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.resourceName}</td>
                  <td>{r.userId}</td>
                  <td>{r.date}</td>
                  <td>{r.startTime}</td>
                  <td>{r.endTime}</td>
                  <td>
                    {new Date(r.createdAt).toLocaleDateString()}
                    <br />
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}