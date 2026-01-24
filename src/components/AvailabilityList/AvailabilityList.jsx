import { useState } from "react";
import "./AvailabilityList.css";
import AvailabilitySlot from "../AvailabilitySlot/AvailabilitySlot";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

/*
  Affiche les créneaux disponibles d’une ressource.
  Les créneaux sont regroupés par jour
  et affichés sous forme de liste déroulante.
*/
const AvailabilityList = ({
  availabilities,
  selectedSlot,
  onSelectSlot,
  disabled
}) => {
  const [openDate, setOpenDate] = useState(null);

  // Aucun créneau disponible
  if (!availabilities || availabilities.length === 0) {
    return (
      <ErrorMessage
        message="Aucun créneau disponible pour cette période"
        type="info"
      />
    );
  }

  // Regroupement des créneaux par date
  const groupedByDate = availabilities.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // Ouvre ou ferme un jour
  const toggleDate = (date) => {
    setOpenDate((prev) => (prev === date ? null : date));
  };

  return (
    <div className="availability-list">
      <h3 className="availability-list__title">
        Créneaux disponibles
      </h3>

      {Object.entries(groupedByDate).map(([date, slots]) => {
        const isOpen = openDate === date;

        return (
          <div key={date} className="availability-list__group">
            {/* Bouton pour afficher les créneaux du jour */}
            <button
              type="button"
              className="availability-list__date"
              onClick={() => toggleDate(date)}
              disabled={disabled}
            >
              <span>
                {new Date(date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long"
                })}
              </span>

              <span className="availability-list__chevron">
                {isOpen ? "▼" : "▶"}
              </span>
            </button>

            {/* Créneaux affichés uniquement si le jour est ouvert */}
            {isOpen && (
              <div className="availability-list__slots">
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
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AvailabilityList;