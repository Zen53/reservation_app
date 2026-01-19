import './ResourceList.css';
import ResourceCard from '../ResourceCard/ResourceCard';

/**
 * Composant ResourceList
 * Affiche la liste des ressources sous forme de grille de cartes
 */
const ResourceList = ({ resources }) => {
  if (!resources || resources.length === 0) {
    return (
      <div className="resource-list--empty">
        <p>Aucune ressource disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="resource-list">
      {resources.map(resource => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
};

export default ResourceList;
