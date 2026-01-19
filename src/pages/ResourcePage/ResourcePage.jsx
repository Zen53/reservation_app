import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getResourceById,
  getResourceAvailabilities,
  createReservation
} from '../../api';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import AvailabilityList from '../../components/AvailabilityList/AvailabilityList';
import ReservationForm from '../../components/ReservationForm/ReservationForm';
import SuccessMessage from '../../components/SuccessMessage/SuccessMessage';
import './ResourcePage.css';

const ResourcePage = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorStatus, setSubmitErrorStatus] = useState(null);
  const [reservationId, setReservationId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      const resResource = await getResourceById(id);
      if (!mounted) return;

      if (resResource.status === 500) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
        setLoading(false);
        return;
      }

      if (resResource.status === 404) {
        setError('Ressource inexistante');
        setLoading(false);
        return;
      }

      setResource(resResource.data);

      const resAvail = await getResourceAvailabilities(id);
      if (!mounted) return;

      if (resAvail.status === 500) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
        setAvailabilities([]);
      } else if (resAvail.status === 200) {
        setAvailabilities(resAvail.data || []);
      }

      setLoading(false);
    };

    fetch();
    return () => { mounted = false; };
  }, [id]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSubmitErrorStatus(null);
    setReservationId(null);
  };

  const handleSubmit = async () => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    setSubmitErrorStatus(null);

    const payload = {
      resourceId: parseInt(id),
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime
    };

    const res = await createReservation(payload);

    if (res.status === 201) {
      setReservationId(res.data.id);
      // Retirer le créneau réservé de la liste locale pour refléter l'état
      setAvailabilities(prev => prev.filter(s => !(s.date === selectedSlot.date && s.startTime === selectedSlot.startTime && s.endTime === selectedSlot.endTime)));
      setSelectedSlot(null);
    } else if (res.status === 400) {
      setSubmitErrorStatus(400);
    } else if (res.status === 409) {
      setSubmitErrorStatus(409);
    } else if (res.status === 500) {
      setSubmitErrorStatus(500);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="page page--resource">
      <header className="page__header">
        <h1>Détails de la ressource</h1>
        <p className="page__subtitle">
          <Link to="/">← Retour à la liste</Link>
        </p>
      </header>

      {loading && <Loader />}

      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {!loading && !error && resource && (
        <div className="resource-wrapper">
          <section className="resource-info">
            <h2>{resource.name}</h2>
            <p className="resource-desc">{resource.description}</p>
            <p className="resource-meta">Capacité: {resource.capacity} — Équipements: {resource.equipment.join(', ')}</p>
          </section>

          <aside className="resource-actions">
            <AvailabilityList
              availabilities={availabilities}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              disabled={isSubmitting}
            />

            <ReservationForm
              resource={resource}
              selectedSlot={selectedSlot}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={submitErrorStatus}
            />

            {reservationId && (
              <SuccessMessage
                message={`Réservation créée (ID: ${reservationId})`}
                onClose={() => setReservationId(null)}
              />
            )}

            {submitErrorStatus === 409 && (
              <ErrorMessage message={"Ce créneau n'est plus disponible"} type="error" />
            )}

            {submitErrorStatus === 400 && (
              <ErrorMessage message={"Les informations fournies sont incorrectes"} type="error" />
            )}

            {submitErrorStatus === 500 && (
              <ErrorMessage message={"Une erreur est survenue, veuillez réessayer plus tard"} type="error" />
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;
