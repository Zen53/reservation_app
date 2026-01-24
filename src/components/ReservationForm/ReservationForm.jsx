import './ReservationForm.css';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

/*
  Formulaire de confirmation d’une réservation.
  Il affiche un récapitulatif du créneau sélectionné
  et permet de valider la réservation.
*/
const ReservationForm = ({
  resource,
  selectedSlot,
  onSubmit,
  isSubmitting,
  error,
  isEdit = false
}) => {

  /*
    Met en forme une date pour l’affichage
    (format lisible en français)
  */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  /*
    Associe un code d’erreur API
    à un message utilisateur clair
  */
  const getErrorMessage = (errorValue) => {
    const status =
      typeof errorValue === 'number'
        ? errorValue
        : errorValue?.status;

    switch (status) {
      case 400:
        return "Les informations fournies sont incorrectes";
      case 409:
        return "Ce créneau n'est plus disponible";
      case 500:
      case 503:
        return "Une erreur est survenue, veuillez réessayer plus tard";
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

  return (
    <div className="reservation-form">
      <h3 className="reservation-form__title">
        {isEdit
          ? "Modifier la réservation"
          : "Confirmer la réservation"}
      </h3>

      {isEdit && (
        <p className="reservation-form__info">
          Cette action annulera la réservation actuelle
          avant d’en créer une nouvelle.
        </p>
      )}

      <div className="reservation-form__summary">
        <div className="reservation-form__row">
          <span className="reservation-form__label">Salle</span>
          <span className="reservation-form__value">
            {resource?.name}
          </span>
        </div>

        <div className="reservation-form__row">
          <span className="reservation-form__label">Date</span>
          <span className="reservation-form__value">
            {formatDate(selectedSlot.date)}
          </span>
        </div>

        <div className="reservation-form__row">
          <span className="reservation-form__label">Horaire</span>
          <span className="reservation-form__value">
            {selectedSlot.startTime} – {selectedSlot.endTime}
          </span>
        </div>
      </div>

      {error && (
        <ErrorMessage
          message={getErrorMessage(error)}
          type="error"
        />
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