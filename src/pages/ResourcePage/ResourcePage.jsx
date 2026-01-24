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

      const resAvail = await getResourceAvailabilities(id);
      let slots = resAvail.status === 200 ? resAvail.data || [] : [];

      if (isEditMode) {
        const resReservation = await getReservationById(reservationId);

        if (resReservation.status === 200) {
          const currentSlot = {
            date: resReservation.data.date,
            startTime: resReservation.data.startTime,
            endTime: resReservation.data.endTime
          };

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
    return () => { mounted = false; };
  }, [id, isEditMode, reservationId]);

  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSubmitErrorStatus(null);
  };

  const handleSubmit = async () => {
    if (!selectedSlot || isSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorStatus(null);

    const payload = {
      resourceId: parseInt(id, 10),
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime
    };

    try {
      // ➕ Créer d’abord
      const resCreate = await createReservation(payload);

      if (resCreate.status !== 201) {
        setSubmitErrorStatus(resCreate.status);
        return;
      }

      const newReservationId = resCreate.data.id;

      // 🧹 Puis supprimer l’ancienne si édition
      if (isEditMode) {
        await deleteReservation(reservationId);
      }

      navigate(`/reservations/${newReservationId}`);
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