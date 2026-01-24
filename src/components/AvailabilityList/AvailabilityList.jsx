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
  // Aucun créneau
  if (!availabilities || availabilities.length === 0) {
    return (
      <ErrorMessage
        message="Aucun créneau disponible pour cette période"
        type="info"
      />
    );
  }

  // 🔹 Grouper les créneaux par date
  const groupedByDate = availabilities.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="availability-list">
      <h3 className="availability-list__title">
        Créneaux disponibles
      </h3>

      {Object.entries(groupedByDate).map(([date, slots]) => (
        <div key={date} className="availability-list__group">
          {/* 🗓 Date visible */}
          <h4 className="availability-list__date">
            {new Date(date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </h4>

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