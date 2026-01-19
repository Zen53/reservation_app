import { Link } from 'react-router-dom';
import './ResourceCard.css';

/**
 * Composant ResourceCard
 * Affiche une carte pour une ressource (salle)
 */
const ResourceCard = ({ resource }) => {
  const { id, name, description, capacity, equipment } = resource;

  return (
    <div className="resource-card">
      <div className="resource-card__header">
        <h3 className="resource-card__title">{name}</h3>
        <span className="resource-card__capacity">
          👥 {capacity} pers.
        </span>
      </div>
      
      <p className="resource-card__description">{description}</p>
      
      {equipment && equipment.length > 0 && (
        <div className="resource-card__equipment">
          {equipment.map((item, index) => (
            <span key={index} className="resource-card__tag">
              {item}
            </span>
          ))}
        </div>
      )}
      
      <Link to={`/resources/${id}`} className="resource-card__link">
        Voir les disponibilités →
      </Link>
    </div>
  );
};

export default ResourceCard;
