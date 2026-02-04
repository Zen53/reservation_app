import "./ReservationForm.css";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { resourceImages } from "../../utils/resourceImages";

/*
  Formulaire de confirmation / modification d’une réservation.
*/
const ReservationForm = ({
  resource,
  selectedSlot,
  onSubmit,
  isSubmitting,
  error,
  isEdit = false,
}) => {
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const getErrorMessage = (errorValue) => {
    const status =
      typeof errorValue === "number"
        ? errorValue
        : errorValue?.status;

    switch (status) {
      case 400:
        return "Les informations fournies sont incorrectes";
      case 409:
        return "Ce créneau n'est plus disponible";
      default:
        return "Une erreur est survenue, veuillez réessayer plus tard";
    }
  };

  if (!selectedSlot) {
    return (
      <div className="reservation-form reservation-form--empty">
        <p>Sélectionnez un créneau pour réserver</p>
      </div>
    );
  }

  const roomImage =
    resourceImages[resource?.name] || "/images/default-room.png";

  return (
    <div className="reservation-form">

      {/* TITRE EN HAUT */}
      <h3 className="reservation-form__title">
        {isEdit ? "Modifier la réservation" : "Confirmer la réservation"}
      </h3>

      {/* IMAGE */}
      <img
        src={roomImage}
        alt={resource?.name}
        className="reservation-form__image"
      />

      {isEdit && (
        <p className="reservation-form__info">
          Vous êtes sur le point de modifier votre réservation.
        </p>
      )}

      {/* RÉCAP */}
      <div className="reservation-form__summary">
        <div className="reservation-form__row">
          <span>Salle</span>
          <strong>{resource?.name}</strong>
        </div>

        <div className="reservation-form__row">
          <span>Date</span>
          <strong>{formatDate(selectedSlot.date)}</strong>
        </div>

        <div className="reservation-form__row">
          <span>Horaire</span>
          <strong>
            {selectedSlot.startTime} – {selectedSlot.endTime}
          </strong>
        </div>
      </div>

      {error && (
        <ErrorMessage message={getErrorMessage(error)} type="error" />
      )}

      <button
        className="reservation-form__button"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Traitement en cours…"
          : isEdit
            ? "Modifier la réservation"
            : "Confirmer la réservation"}
      </button>
    </div>
  );
};

export default ReservationForm;
