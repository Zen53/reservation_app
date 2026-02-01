import React, { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { getReservationById, deleteReservation } from "../../api";
import { resourceImages } from "../../utils/resourceImages";

import Loader from "../../components/Loader/Loader";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

import "./ReservationPage.css";

const ReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      setLoading(true);
      const res = await getReservationById(id);

      if (res.status === 200) setReservation(res.data);
      else setError("Impossible de charger la réservation");

      setLoading(false);
    };

    fetchReservation();
  }, [id]);

  const handleCancel = async () => {
    if (cancelLoading) return;
    setCancelLoading(true);

    const res = await deleteReservation(id);
    if (res.status === 204) {
      navigate("/resources");
    } else {
      setError("Impossible d’annuler la réservation");
    }

    setCancelLoading(false);
  };

  const handleModify = () => {
    navigate(
      `/resources/${reservation.resourceId}?mode=edit&reservationId=${reservation.id}`
    );
  };

  const roomImage =
    resourceImages[reservation?.resourceName] ||
    "/images/default-room.png";

  return (
    <div className="page page--reservation">
      <header className="page__header">
        <h1>Détail de la réservation</h1>
        <p className="page__subtitle">
          <Link to="/">← Retour à l’accueil</Link>
        </p>
      </header>

      {success && (
        <p className="success-message">
          {success === "created"
            ? "Votre réservation a bien été créée."
            : "Votre réservation a bien été modifiée."}
        </p>
      )}

      {loading && <Loader />}
      {!loading && error && <ErrorMessage message={error} type="error" />}

      {!loading && reservation && (
        <div className="reservation-card">

          {/* TEXTE */}
          <div className="reservation-details">
            <h2>Réservation #{reservation.id}</h2>

            <p><strong>Ressource :</strong> {reservation.resourceName}</p>
            <p><strong>Date :</strong> {reservation.date}</p>
            <p>
              <strong>Heure :</strong>{" "}
              {reservation.startTime} – {reservation.endTime}
            </p>

            <div className="reservation-actions">
              <button
                className="btn-modify"
                onClick={handleModify}
              >
                Modifier la réservation
              </button>

              <button
                className="btn-cancel"
                onClick={handleCancel}
                disabled={cancelLoading}
              >
                Annuler la réservation
              </button>
            </div>
          </div>

          {/* IMAGE */}
          <div className="reservation-image">
            <img
              src={roomImage}
              alt={reservation.resourceName}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;