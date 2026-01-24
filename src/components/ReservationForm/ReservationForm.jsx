import './ReservationForm.css';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

/**
 * Composant ReservationForm
 * Formulaire de confirmation de réservation
 * 
 * Messages d'erreur selon le contrat API:
 * - 400: "Les informations fournies sont incorrectes"
 * - 409: "Ce créneau n'est plus disponible"
 * - 500: "Une erreur est survenue, veuillez réessayer plus tard"
 */
const ReservationForm = ({ 
  resource, 
  selectedSlot, 
  onSubmit, 
  isSubmitting,
  error,
  isEdit = false // 🆕 mode modification
}) => {
  // Formater la date pour l'affichage
  const formatDate = (dateStr) => {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
  };

  // Mapper les codes d'erreur API vers les messages utilisateur
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
        {isEdit ? "Modifier la réservation" : "Confirmer la réservation"}
      </h3>

      {isEdit && (
        <p className="reservation-form__info">
          ⚠️ Cette action annulera votre réservation actuelle
          puis en créera une nouvelle.
        </p>
      )}
      
      <div className="reservation-form__summary">
        <div className="reservation-form__row">
          <span className="reservation-form__label">Salle</span>
          <span className="reservation-form__value">{resource?.name}</span>
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
            : "Confirmer la réservation"
        }
      </button>
    </div>
  );
};

export default ReservationForm;