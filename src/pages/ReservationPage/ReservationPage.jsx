import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getReservationById, deleteReservation } from '../../api';

import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

import './ReservationPage.css';

const ReservationPage = () => {
  // Récupération de l'id de la réservation depuis l'URL
  const { id } = useParams();
  const navigate = useNavigate();

  // Données de la réservation
  const [reservation, setReservation] = useState(null);

  // États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États liés à l'annulation
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    let mounted = true; // évite les mises à jour après démontage

    const fetchReservation = async () => {
      setLoading(true);
      setError(null);

      // Appel API pour récupérer la réservation
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

    fetchReservation();

    // Nettoyage à la destruction du composant
    return () => {
      mounted = false;
    };
  }, [id]);

  // Annulation de la réservation
  const handleCancel = async () => {
    if (cancelLoading) return;

    setCancelLoading(true);
    setError(null);

    const res = await deleteReservation(id);

    if (res.status === 204) {
      setCancelSuccess(true);

      // Redirection après confirmation visuelle
      setTimeout(() => {
        navigate('/resources');
      }, 1500);
    } else {
      setError("Impossible d’annuler la réservation.");
    }

    setCancelLoading(false);
  };

  // Redirection vers la modification de réservation
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

      {/* Chargement */}
      {loading && <Loader />}

      {/* Erreur */}
      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {/* Confirmation d'annulation */}
      {cancelSuccess && (
        <p className="success-message">
          ✅ La réservation a été annulée avec succès.
          <br />
          Redirection en cours…
        </p>
      )}

      {/* Détails de la réservation */}
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