import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReservationById, deleteReservation } from '../../api';

import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

import './ReservationPage.css';

const ReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      const res = await getReservationById(id);
      if (!mounted) return;

      if (res.status === 404) {
        setError('Réservation inexistante');
      } else if (res.status === 500) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
      } else if (res.status === 200) {
        setReservation(res.data);
      }

      setLoading(false);
    };

    fetch();
    return () => { mounted = false; };
  }, [id]);

  const handleCancel = async () => {
    if (cancelLoading) return;

    setCancelLoading(true);
    setError(null);

    const res = await deleteReservation(id);

    if (res.status === 204) {
      setCancelSuccess(true);

      // ⏱ Redirection après confirmation
      setTimeout(() => {
        navigate('/resources');
      }, 1500);
    } else {
      setError("Impossible d’annuler la réservation.");
    }

    setCancelLoading(false);
  };

  const handleModify = () => {
    navigate(
      `/resources/${reservation.resourceId}?mode=edit&reservationId=${reservation.id}`
    );
  };

  return (
    <div className="page page--reservation">
      <header className="page__header">
        <h1>Détail de la réservation</h1>
        <p className="page__subtitle">
          <Link to="/">← Retour à l’accueil</Link>
        </p>
      </header>

      {loading && <Loader />}

      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {cancelSuccess && (
        <p className="success-message">
          ✅ La réservation a été annulée avec succès.  
          <br />
          Redirection en cours…
        </p>
      )}

      {!loading && !error && reservation && (
        <div className="reservation-card">
          <h2>Réservation #{reservation.id}</h2>

          <p><strong>Ressource :</strong> {reservation.resourceName}</p>
          <p><strong>Date :</strong> {reservation.date}</p>
          <p>
            <strong>Heure :</strong> {reservation.startTime} – {reservation.endTime}
          </p>
          <p>
            <strong>Créée le :</strong>{' '}
            {new Date(reservation.createdAt).toLocaleString('fr-FR')}
          </p>

          <div className="reservation-actions">
            <button
              onClick={handleModify}
              className="btn-modify"
            >
              Modifier la réservation
            </button>

            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="btn-cancel"
            >
              {cancelLoading ? 'Annulation…' : 'Annuler la réservation'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;