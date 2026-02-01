import ResourceCard from "../ResourceCard/ResourceCard";
import "./ResourceList.css";

/*
  Composant ResourceList
  Affiche la liste des ressources disponibles
*/
const ResourceList = ({ resources, setResources }) => {
  /*
    Active / désactive une ressource côté UI
    (sans nouvel appel API)
  */
  const handleToggleActive = (id) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r
      )
    );
  };

  // Aucune ressource
  if (!resources.length) {
    return (
      <p className="empty-state">
        Aucune ressource disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="resource-list">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onToggleActive={handleToggleActive}
        />
      ))}
    </div>
  );
};

export default ResourceList;
