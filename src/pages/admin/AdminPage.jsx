import { useState, useEffect } from "react";
import { getResources, getResourceReservations } from "../../api";

export default function AdminPage() {
  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const resourcesRes = await getResources();

        if (resourcesRes.status !== 200) {
          throw new Error("Erreur chargement ressources");
        }

        setResources(resourcesRes.data);

        const allReservations = [];

        for (const resource of resourcesRes.data) {
          const res = await getResourceReservations(resource.id);

          if (res.status === 200) {
            allReservations.push(
              ...res.data.map((r) => ({
                ...r,
                resourceName: resource.name,
              }))
            );
          }
        }

        setReservations(allReservations);
      } catch {
        setError("Erreur lors du chargement des données administrateur");
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  if (loading) {
    return <p>Chargement du dashboard administrateur...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className="page">
      <h1>Dashboard Administrateur</h1>

      <section>
        <h2>Statistiques globales</h2>
        <ul>
          <li>Nombre de ressources : {resources.length}</li>
          <li>Nombre total de réservations : {reservations.length}</li>
        </ul>
      </section>

      <section>
        <h2>Réservations</h2>

        {reservations.length === 0 ? (
          <p>Aucune réservation.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ressource</th>
                <th>Date</th>
                <th>Début</th>
                <th>Fin</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td>{r.resourceName}</td>
                  <td>{r.date}</td>
                  <td>{r.startTime}</td>
                  <td>{r.endTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}