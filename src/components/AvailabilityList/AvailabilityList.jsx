import './AvailabilityList.css';
import AvailabilitySlot from '../AvailabilitySlot/AvailabilitySlot';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

/**
 * Composant AvailabilityList
 * Affiche la liste des créneaux disponibles pour une ressource
 */
const AvailabilityList = ({ 
  availabilities, 
  selectedSlot, 
  onSelectSlot, 
  disabled 
}) => {
  // Cas: liste vide - message selon contrat API
  if (!availabilities || availabilities.length === 0) {
    return (
      <ErrorMessage 
        message="Aucun créneau disponible pour cette date" 
        type="info" 
      />
    );
  }

  // Grouper les disponibilités par date
  const groupedByDate = availabilities.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="availability-list">
      <h3 className="availability-list__title">Créneaux disponibles</h3>
      
      {Object.entries(groupedByDate).map(([date, slots]) => (
        <div key={date} className="availability-list__group">
          {slots.map((slot, index) => (
            <AvailabilitySlot
              key={`${slot.date}-${slot.startTime}-${index}`}
              slot={slot}
              isSelected={
                selectedSlot?.date === slot.date &&
                selectedSlot?.startTime === slot.startTime
              }
              onSelect={onSelectSlot}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default AvailabilityList;
