import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./ResourceCard.css";

const ResourceCard = ({ resource, onToggleActive }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isInactive = resource.active === false;

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggleActive(resource.id);
  };

  return (
    <div className={`resource-card ${isInactive ? "inactive" : ""}`}>
      <div className="resource-card__header">
        <h3>{resource.name}</h3>
        <span>{resource.capacity} pers.</span>
      </div>

      <p>{resource.description}</p>

      <div className="resource-card__equipment">
        {resource.equipment.map((eq, i) => (
          <span key={i} className="tag">{eq}</span>
        ))}
      </div>

      <div className="resource-card__footer">
        {isAdmin && (
          <button
            className={`badge ${isInactive ? "off" : "on"}`}
            onClick={handleToggle}
          >
            {isInactive ? "Désactivée" : "Active"}
          </button>
        )}

        {!isInactive ? (
          <Link to={`/resources/${resource.id}`}>
            Voir les disponibilités →
          </Link>
        ) : (
          <span className="disabled-text">Aucune ressource disponible</span>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;
