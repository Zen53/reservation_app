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

  // Détermination du mode (création ou modification)
  const mode = searchParams.get('mode');
  const reservationId = searchParams.get('reservationId');
  const isEditMode = mode === 'edit' && reservationId;

  // Données principales
  const [resource, setResource] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);

  // États d’affichage
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États liés à la réservation
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorStatus, setSubmitErrorStatus] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Chargement de la ressource
      const resResource = await getResourceById(id);
      if (!mounted) return;

      if (resResource.status !== 200) {
        setError("Impossible de charger la ressource");
        setLoading(false);
        return;
      }

      // Blocage si la ressource est désactivée
      if (resResource.data.active === false) {
        setError("Cette ressource est désactivée");
        setLoading(false);
        return;
      }

      setResource(resResource.data);

      // Chargement des créneaux disponibles
      const resAvail = await getResourceAvailabilities(id);
      let slots = resAvail.status === 200 ? resAvail.data || [] : [];

      // Cas particulier : modification d’une réservation existante
      if (isEditMode) {
        const resReservation = await getReservationById(reservationId);

        if (resReservation.status === 200) {
          const currentSlot = {
            date: resReservation.data.date,
            startTime: resReservation.data.startTime,
            endTime: resReservation.data.endTime
          };

          // Ajout du créneau actuel s’il n’est plus disponible
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

    fetchData();
    return () => {
      mounted = false;
    };
  }, [id, isEditMode, reservationId]);

  // Sélection d’un créneau
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSubmitErrorStatus(null);
  };

  // Validation de la réservation
const handleSubmit = async () => {
  if (!selectedSlot || isSubmitting) return;

  setIsSubmitting(true);
  setSubmitErrorStatus(null);

  const payload = {
    resourceId: parseInt(id, 10),
    date: selectedSlot.date,
    startTime: selectedSlot.startTime,
    endTime: selectedSlot.endTime,
  };

  // ✏️ Cas modification
  if (isEditMode) {
    payload.previousReservation = {
      id: reservationId,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
    };
  }

  try {
    const resCreate = await createReservation(payload);

    if (resCreate.status !== 201) {
      setSubmitErrorStatus(resCreate.status);
      return;
    }

    const newReservationId = resCreate.data.id;

    if (isEditMode) {
      await deleteReservation(reservationId);
    }

    navigate(`/reservations/${newReservationId}?success=${isEditMode ? "modified" : "created"}`);
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