import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReservationById } from '../../api';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './ReservationPage.css';

const ReservationPage = () => {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      const res = await getReservationById(id);
      if (!mounted) return;

      if (res.status === 500) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
      } else if (res.status === 404) {
        setError('Réservation inexistante');
      } else if (res.status === 200) {
        setReservation(res.data);
      }

      setLoading(false);
    };

    fetch();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="page page--reservation">
      <header className="page__header">
        <h1>Détail de la réservation</h1>
        <p className="page__subtitle"><Link to="/">← Retour</Link></p>
      </header>

      {loading && <Loader />}

      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {!loading && !error && reservation && (
        <div className="reservation-card">
          <h2>Réservation #{reservation.id}</h2>
          <p>Ressource: {reservation.resourceName}</p>
          <p>Date: {reservation.date}</p>
          <p>Heure: {reservation.startTime} - {reservation.endTime}</p>
          <p>Créée le: {new Date(reservation.createdAt).toLocaleString('fr-FR')}</p>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
