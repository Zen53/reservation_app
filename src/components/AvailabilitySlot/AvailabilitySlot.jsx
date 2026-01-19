import './AvailabilitySlot.css';

/**
 * Composant AvailabilitySlot
 * Affiche un créneau de disponibilité sélectionnable
 */
const AvailabilitySlot = ({ slot, isSelected, onSelect, disabled }) => {
  const { date, startTime, endTime } = slot;

  // Formater la date pour l'affichage
  const formatDate = (dateStr) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
  };

  return (
    <button
      className={`availability-slot ${isSelected ? 'availability-slot--selected' : ''}`}
      onClick={() => onSelect(slot)}
      disabled={disabled}
      type="button"
    >
      <span className="availability-slot__date">{formatDate(date)}</span>
      <span className="availability-slot__time">
        {startTime} - {endTime}
      </span>
    </button>
  );
};

export default AvailabilitySlot;
