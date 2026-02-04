import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";

import {
  getResourceById,
  getResourceAvailabilities,
  createReservation,
  updateReservation,
  getReservationById,
  deleteReservation
} from "../../api";

import { useAuth } from '@clerk/clerk-react';
import Loader from "../../components/Loader/Loader";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import AvailabilityList from "../../components/AvailabilityList/AvailabilityList";
import ReservationForm from "../../components/ReservationForm/ReservationForm";

import "./ResourcePage.css";

const ResourcePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();

  // On récupère le mode edit depuis l'état de la navigation (passé par ReservationPage)
  // OU depuis les query params si on voulait supporter le lien direct (optionnel)
  const stateMode = location.state?.editMode;
  const stateReservationId = location.state?.reservationdata?.id;

  const isEditMode = stateMode || (searchParams.get("mode") === "edit");
  const reservationId = stateReservationId || searchParams.get("reservationId");

  const [resource, setResource] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);

  const [oldReservation, setOldReservation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorStatus, setSubmitErrorStatus] = useState(null);

  // =========================
  // CHARGEMENT DES DONNÉES
  // =========================
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Chargement de la ressource
      const token = await getToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const resResource = await getResourceById(id, token);
      if (!mounted) return;

      if (resResource.status !== 200 || resResource.data.active === false) {
        setError("Impossible de charger la ressource");
        setLoading(false);
        return;
      }

      setResource(resResource.data);

      // Chargement des créneaux disponibles

      const resAvail = await getResourceAvailabilities(id, token);
      let slots = resAvail.status === 200 ? resAvail.data || [] : [];

      // MODE MODIFICATION
      if (isEditMode) {
        const resReservation = await getReservationById(reservationId, token);
        if (resReservation.status === 200) {
          const currentSlot = {
            date: resReservation.data.date,
            startTime: resReservation.data.startTime,
            endTime: resReservation.data.endTime,
          };

          setOldReservation(currentSlot);

          const exists = slots.some(
            (s) =>
              s.date === currentSlot.date &&
              s.startTime === currentSlot.startTime &&
              s.endTime === currentSlot.endTime
          );

          if (!exists) slots.unshift(currentSlot);
          setSelectedSlot(currentSlot);
        }
      }

      setAvailabilities(slots);
      setLoading(false);
    };

    fetchData();
    return () => (mounted = false);
  }, [id, isEditMode, reservationId]);

  // =========================
  // SÉLECTION CRÉNEAU
  // =========================
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setSubmitErrorStatus(null);
  };

  // =========================
  // SOUMISSION
  // =========================
  const handleSubmit = async () => {
    if (!selectedSlot || isSubmitting) return;

    const token = await getToken();
    if (!token) {
      // Si pas de token, Clerk devrait gérer la redirection ou l'état, 
      // mais on peut forcer une sécurité ici.
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorStatus(null);

    try {
      const payload = {
        resourceId: parseInt(id, 10),
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      };

      // ENVOI DE L’ANCIEN CRÉNEAU POUR MAIL DE MODIFICATION
      /*
        Désormais géré par le PUT backend qui compare avec l'existant en base.
        Plus besoin d'envoyer previousReservation dans le payload pour l'update.
      */

      let res;
      if (isEditMode) {
        // UPDATE
        res = await updateReservation(reservationId, payload, token);
      } else {
        // CREATE
        res = await createReservation(payload, token);
      }

      // 201 Created ou 200 OK (Update)
      if (res.status !== 201 && res.status !== 200) {
        setSubmitErrorStatus(res.status);
        return;
      }

      // ID retourné ou existant
      const finalId = res.data?.id || reservationId;

      navigate(
        `/reservations/${finalId}?success=${isEditMode ? "modified" : "created"}`
      );
    } catch {
      setSubmitErrorStatus(500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="page page--resource">
      <header className="page__header">
        <h1>Détails de la ressource</h1>
        <p className="page__subtitle">
          <Link to="/resources">← Retour à la liste des ressources</Link>
        </p>
      </header>

      {loading && <Loader />}
      {!loading && error && <ErrorMessage message={error} type="error" />}

      {!loading && !error && resource && (
        <div className="resource-layout">
          {/* COLONNE GAUCHE */}
          <div className="resource-left">
            <div className="resource-info">
              <h2>{resource.name}</h2>
              <p>{resource.description}</p>
            </div>

            <AvailabilityList
              availabilities={availabilities}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              disabled={isSubmitting}
            />
          </div>

          {/* COLONNE DROITE */}
          <div className="resource-right">
            <ReservationForm
              resource={resource}
              selectedSlot={selectedSlot}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={submitErrorStatus}
              isEdit={isEditMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePage;
