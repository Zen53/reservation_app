import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./ResourceCard.css";

/*
  Composant ResourceCard
  Affiche une ressource (salle, équipement, etc.)
  Le comportement change selon le rôle (user / admin)
*/
const ResourceCard = ({ resource, onToggleActive }) => {
  // Récupération de l'utilisateur connecté
  const { user } = useAuth();

  // Vérifie si l'utilisateur est administrateur
  const isAdmin = user?.role === "admin";

  // Vérifie si la ressource est désactivée
  const isInactive = resource.active === false;

  /*
    Fonction appelée quand l'admin clique sur le bouton
    d'activation / désactivation de la ressource
  */
  const handleToggle = (e) => {
    // Empêche le clic de déclencher la navigation
    e.stopPropagation();
    onToggleActive(resource.id);
  };

  return (
    <div className={`resource-card ${isInactive ? "inactive" : ""}`}>
      {/* En-tête de la carte */}
      <div className="resource-card__header">
        <h3>{resource.name}</h3>
        <span>{resource.capacity} pers.</span>
      </div>

      {/* Description de la ressource */}
      <p>{resource.description}</p>

      {/* Liste des équipements */}
      <div className="resource-card__equipment">
        {resource.equipment.map((eq, i) => (
          <span key={i} className="tag">
            {eq}
          </span>
        ))}
      </div>

      {/* Pied de carte : actions */}
      <div className="resource-card__footer">
        {/* Bouton visible uniquement pour l'admin */}
        {isAdmin && (
          <button
            className={`badge ${isInactive ? "off" : "on"}`}
            onClick={handleToggle}
          >
            {isInactive ? "Désactivée" : "Active"}
          </button>
        )}

        {/* Lien vers les disponibilités si la ressource est active */}
        {!isInactive ? (
          <Link to={`/resources/${resource.id}`}>
            Voir les disponibilités →
          </Link>
        ) : (
          <span className="disabled-text">
            Aucune ressource disponible
          </span>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;