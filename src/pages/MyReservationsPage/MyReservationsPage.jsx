import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getReservations } from "../../api";
import { useAuth } from "@clerk/clerk-react";

import Loader from "../../components/Loader/Loader";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

import "./MyReservationsPage.css";

const MyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getToken } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let mounted = true;

    const fetchReservations = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        // Le backend attend un string, pas un objet ! (Correctif appliqué précédemment ailleurs)
        const res = await getReservations(token);

        if (!mounted) return;

        if (res.status === 401 || res.status === 403) {
          setError("Vous devez être connecté pour voir vos réservations.");
        } else if (res.status !== 200) {
          setError("Impossible de charger vos réservations.");
        } else {
          setReservations(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        setError("Erreur lors du chargement des réservations.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReservations();

    return () => {
      mounted = false;
    };
  }, [getToken]);

  if (loading) return <div className="page--reservations"><Loader /></div>;
  if (error) return <div className="page--reservations"><div className="reservations-card"><ErrorMessage message={error} type="error" /></div></div>;

  return (
    <div className="page--reservations">
      <div className="reservations-card">
        <h1>Mes réservations</h1>

        {searchParams.get("success") === "cancelled" && (
          <div className="success-message" style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '1rem', background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))', borderRadius: '8px', fontWeight: '600' }}>
            Votre réservation a bien été annulée.
          </div>
        )}

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
                    <Link to={`/reservations/${r.id}`}>Voir le détail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;
