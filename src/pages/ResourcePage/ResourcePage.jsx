import React, { useEffect, useState } from 'react';
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams
} from 'react-router-dom';

import {
  getResourceById,
  getResourceAvailabilities,
  createReservation,
  getReservationById,
  deleteReservation
} from '../../api';

import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import AvailabilityList from '../../components/AvailabilityList/AvailabilityList';
import ReservationForm from '../../components/ReservationForm/ReservationForm';

import './ResourcePage.css';

const ResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get('mode');
  const reservationId = searchParams.get('reservationId');
  const isEditMode = mode === 'edit' && reservationId;

  const [resource, setResource] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorStatus, setSubmitErrorStatus] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      /* ===== Ressource ===== */
      const resResource = await getResourceById(id);
      if (!mounted) return;

      if (resResource.status !== 200) {
        setError("Impossible de charger la ressource");
        setLoading(false);
        return;
      }

      if (resResource.data.active === false) {
        setError("Cette ressource est désactivée");
        setLoading(false);
        return;
      }

      setResource(resResource.data);

      /* ===== Disponibilités ===== */
      const resAvail = await getResourceAvailabilities(id);
      if (!mounted) return;

      let slots = [];
      if (resAvail.status === 200) {
        slots = resAvail.data || [];
      }

      /* ===== MODE ÉDITION : préchargement ===== */
      if (isEditMode) {
        const resReservation = await getReservationById(reservationId);

        if (resReservation.status === 200) {
          const currentSlot = {
            date: resReservation.data.date,
            startTime: resReservation.data.startTime,
            endTime: resReservation.data.endTime
          };

          // Réinjecter le créneau actuel s’il n’existe plus
          const exists = slots.some(
            s =>
              s.date === currentSlot.date &&
              s.startTime === currentSlot.startTime &&
              s.endTime === currentSlot.endTime
          );

          if (!exists) {
            slots = [currentSlot, ...slots];
          }

          setSelectedSlot(currentSlot);
        }
      }

      setAvailabilities(slots);
      setLoading(false);
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, [id, isEditMode, reservationId]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSubmitErrorStatus(null);
  };

  const handleSubmit = async () => {
    if (!selectedSlot || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitErrorStatus(null);

    try {
      // 🧹 MODE ÉDITION → supprimer l’ancienne réservation
      if (isEditMode) {
        await deleteReservation(reservationId);
      }

      // ➕ Créer la nouvelle réservation
      const payload = {
        resourceId: parseInt(id, 10),
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      };

      const res = await createReservation(payload);

      if (res.status === 201) {
        navigate(`/reservations/${res.data.id}`);
        return;
      }

      setSubmitErrorStatus(res.status);
    } catch {
      setSubmitErrorStatus(500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page page--resource">
      <header className="page__header">
        <h1>
          {isEditMode ? "Modifier la réservation" : "Détails de la ressource"}
        </h1>
        <p className="page__subtitle">
        <Link to="/resources">← Retour à la liste des ressources</Link>
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
            <p>{resource.description}</p>
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
          </aside>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;