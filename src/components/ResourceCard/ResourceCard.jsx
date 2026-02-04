import { Link } from "react-router-dom";
import { resourceImages } from "../../utils/resourceImages";

import "./ResourceCard.css";

/*
  Composant ResourceCard
  Affiche une ressource sous forme de carte (consultation uniquement)
  👉 Aucune action d’activation/désactivation sur cette page
*/
const ResourceCard = ({ resource }) => {
  // Vérifie si la ressource est désactivée
  const isInactive = resource.active === false;

  // Image associée à la ressource
  const image =
    resourceImages[resource.name] || "/images/default-room.png";

  return (
    <div className={`resource-card ${isInactive ? "inactive" : ""}`}>
      {/* IMAGE */}
      <img
        src={image}
        alt={resource.name}
        className="resource-card__image"
      />

      {/* HEADER */}
      <div className="resource-card__header">
        <h3>{resource.name}</h3>
        <span className="capacity">
          {resource.capacity} pers.
        </span>
      </div>

      {/* DESCRIPTION */}
      <p className="resource-card__description">
        {resource.description}
      </p>

      {/* ÉQUIPEMENTS */}
      <div className="resource-card__equipment">
        {resource.equipment.map((eq, i) => (
          <span key={i} className="tag">
            {eq}
          </span>
        ))}
      </div>

      {/* FOOTER */}
      <div className="resource-card__footer">
        {/* STATUT (informatif uniquement) */}
        <span
          className={`badge ${isInactive ? "off" : "on"}`}
        >
          {isInactive ? "Indisponible" : "Disponible"}
        </span>

        {/* ACTION UTILISATEUR */}
        {!isInactive ? (
          <Link to={`/resources/${resource.id}`}>
            Voir les disponibilités →
          </Link>
        ) : (
          <span className="disabled-text">
            Ressource indisponible
          </span>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
