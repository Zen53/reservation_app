import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getReservationById, deleteReservation } from "../../api";
import { useAuth } from "@clerk/clerk-react";

import Loader from "../../components/Loader/Loader";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

import "./ReservationPage.css";

const ReservationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Helper pour les images (Hardcodé faute de DB)
  const getImageForResource = (name) => {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    if (lowerName.includes("curie")) return "/images/salle-curie.png";
    if (lowerName.includes("newton")) return "/images/salle-newton.png";
    if (lowerName.includes("einstein")) return "/images/salle-einstein.png";
    if (lowerName.includes("darwin")) return "/images/salle-darwin.png";
    return "/images/default-room.jpg"; // Fallback
  };
  useEffect(() => {
    const successParam = searchParams.get("success");
    if (successParam === "created") {
      setSuccess("Votre réservation a bien été créée.");
    } else if (successParam === "modified") {
      setSuccess("Votre réservation a bien été modifiée.");
    }
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const fetchReservation = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        const res = await getReservationById(id, token);

        if (!mounted) return;

        if (res.status !== 200) {
          setError("Impossible de charger la réservation.");
        } else {
          setReservation(res.data);
          // Si on vient d'une création/modif, on peut éventuellement afficher un toast ici, mais c'est géré par la page précédente généralement
        }
      } catch {
        setError("Erreur lors du chargement de la réservation.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReservation();
    return () => {
      mounted = false;
    };
  }, [id, getToken]);

  const handleDelete = async () => {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    try {
      const token = await getToken();
      const res = await deleteReservation(id, token);

      if (res.status === 200 || res.status === 204) {
        // Redirection immédiate avec paramètre pour l'affichage du message sur la page de liste
        navigate("/my-reservations?success=cancelled");
      } else {
        setError("Impossible d'annuler la réservation.");
      }
    } catch {
      setError("Erreur lors de l'annulation.");
    }
  };

  const handleModify = () => {
    // Redirige vers la page ressource avec state pour pré-remplir
    if (reservation) {
      // On assume que modification = refaire une réservation sur la même ressource
      // Idéalement, il faudrait une route /resources/:id?edit=reservation_id
      // ou passer l'état via navigate
      navigate(`/resources/${reservation.resourceId}`, {
        state: {
          editMode: true,
          reservationdata: reservation
        }
      });
    }
  };

  if (loading) return <div className="page--reservation-detail"><Loader /></div>;
  if (error) return (
    <div className="page--reservation-detail">
      <div className="reservation-card" style={{ display: 'block', textAlign: 'center' }}>
        <ErrorMessage message={error} type="error" />
        <button className="btn-back-link" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          Retour
        </button>
      </div>
    </div>
  );

  if (!reservation) return null;

  return (
    <div className="page--reservation-detail">
      <div className="reservation-card">

        {/* LEFT SIDE: Content */}
        <div className="reservation-content">
          <h1>Détail de la réservation</h1>

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="reservation-details">
            <div className="detail-item">
              <strong>Ressource</strong>
              <span>{reservation.resourceName}</span>
            </div>
            <div className="detail-item">
              <strong>Date</strong>
              <span>{reservation.date}</span>
            </div>
            <div className="detail-item">
              <strong>Heure</strong>
              <span>{reservation.startTime} – {reservation.endTime}</span>
            </div>
          </div>

          <div className="reservation-actions">
            <button className="btn-modify" onClick={handleModify}>
              Modifier
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              Annuler
            </button>
          </div>

          <button className="btn-back-link" onClick={() => navigate("/my-reservations")}>
            Retour à mes réservations
          </button>
        </div>

        {/* RIGHT SIDE: Image */}
        <div className="reservation-image-side">
          <img
            src={getImageForResource(reservation.resourceName) || "/images/salle-curie.png"}
            alt={reservation.resourceName}
            onError={(e) => { e.target.onerror = null; e.target.src = "/images/salle-curie.png" }}
          />

        </div>

      </div>
    </div>
  );
};

export default ReservationPage;
