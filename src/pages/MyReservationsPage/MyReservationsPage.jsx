import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResources, getResourceReservations } from "../../api";

import Loader from "../../components/Loader/Loader";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchReservations = async () => {
      try {
        const resourcesRes = await getResources();

        if (resourcesRes.status !== 200) {
          throw new Error();
        }

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

        if (mounted) setReservations(allReservations);
      } catch {
        if (mounted) setError("Impossible de charger vos réservations.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReservations();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <Loader />;

  if (error) return <ErrorMessage message={error} type="error" />;

  return (
    <div className="page">
      <h1>Mes réservations</h1>

      {reservations.length === 0 ? (
        <div className="empty-state">
          <h2>Aucune réservation pour le moment</h2>
          <p>
            Vous n’avez encore effectué aucune réservation.
            <br />
            Consultez les ressources disponibles pour en créer une.
          </p>

          <Link to="/resources" className="primary-button">
            Voir les ressources
          </Link>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Ressource</th>
              <th>Date</th>
              <th>Heure</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.resourceName}</td>
                <td>{r.date}</td>
                <td>
                  {r.startTime} – {r.endTime}
                </td>
                <td>
                  <Link to={`/reservations/${r.id}`}>
                    Voir le détail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyReservationsPage;