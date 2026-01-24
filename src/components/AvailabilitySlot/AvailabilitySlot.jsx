import './AvailabilitySlot.css';

/*
  Composant qui représente un créneau horaire.
  Il est cliquable et peut être sélectionné.
*/
const AvailabilitySlot = ({ slot, isSelected, onSelect, disabled }) => {
  const { date, startTime, endTime } = slot;

  /*
    Transforme une date au format ISO
    en date lisible en français
  */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <button
      type="button"
      className={`availability-slot ${
        isSelected ? 'availability-slot--selected' : ''
      }`}
      onClick={() => onSelect(slot)}
      disabled={disabled}
    >
      <span className="availability-slot__date">
        {formatDate(date)}
      </span>

      <span className="availability-slot__time">
        {startTime} - {endTime}
      </span>
    </button>
  );
};

export default AvailabilitySlot;