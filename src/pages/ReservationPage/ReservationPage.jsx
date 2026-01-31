import React, { useEffect, useState } from 'react';
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams
} from 'react-router-dom';

import { getReservationById, deleteReservation } from '../../api';

import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

import './ReservationPage.css';

const ReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Paramètre de succès (?success=created|modified)
  const success = searchParams.get('success');

  // Données réservation
  const [reservation, setReservation] = useState(null);

  // États généraux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États annulation
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchReservation = async () => {
      setLoading(true);
      setError(null);

      const res = await getReservationById(id);
      if (!mounted) return;

      if (res.status === 404) {
        setError('Réservation inexistante');
      } else if (res.status !== 200) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
      } else {
        setReservation(res.data);
      }

      setLoading(false);
    };

    fetchReservation();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Annulation
  const handleCancel = async () => {
    if (cancelLoading) return;

    setCancelLoading(true);
    setError(null);

    const res = await deleteReservation(id);

    if (res.status === 204) {
      setCancelSuccess(true);
      setTimeout(() => {
        navigate('/resources');
      }, 1500);
    } else {
      setError("Impossible d’annuler la réservation.");
    }

    setCancelLoading(false);
  };

  // Modification
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

      {/* Messages de succès */}
      {success === 'created' && (
        <p className="success-message">
          ✅ Votre réservation a bien été créée.
        </p>
      )}

      {success === 'modified' && (
        <p className="success-message">
          ✏️ Votre réservation a bien été modifiée.
        </p>
      )}

      {cancelSuccess && (
        <p className="success-message">
          ❌ Votre réservation a bien été annulée.
          <br />
          Redirection en cours…
        </p>
      )}

      {/* Chargement */}
      {loading && <Loader />}

      {/* Erreur */}
      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {/* Détails */}
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
