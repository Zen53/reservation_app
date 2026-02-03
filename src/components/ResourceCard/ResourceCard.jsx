import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";  
import { resourceImages } from "../../utils/resourceImages";

import "./ResourceCard.css";

/*
  Composant ResourceCard
  Affiche une ressource sous forme de carte
*/
const ResourceCard = ({ resource, onToggleActive }) => {
  const { user, isLoaded } = useUser();

  // Sécurité : attend le chargement de l'utilisateur
  if (!isLoaded) {
    return (
      <div className="resource-card loading">
        Chargement...
      </div>
    );
  }

  // Récupération du rôle depuis publicMetadata
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Vérifie si la ressource est désactivée
  const isInactive = resource.active === false;

  const image =
    resourceImages[resource.name] || "/images/default-room.png";

  /*
    Toggle activation (admin)
  */
  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleActive(resource.id);
  };

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

        {/* ADMIN */}
        {isAdmin && (
          <button
            className={`badge ${isInactive ? "off" : "on"}`}
            onClick={handleToggle}
          >
            {isInactive ? "Désactivée" : "Active"}
          </button>
        )}

        {/* USER */}
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
