import ResourceCard from "../ResourceCard/ResourceCard";
import "./ResourceList.css";

/*
  Composant ResourceList
  Affiche la liste des ressources disponibles
  Il se contente de parcourir les données et d'afficher des ResourceCard
*/
const ResourceList = ({ resources, setResources }) => {
  /*
    Fonction appelée quand un admin active ou désactive une ressource
    Met à jour l'état local sans refaire un appel serveur
  */
  const handleToggleActive = (id) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, active: !r.active }
          : r
      )
    );
  };

  // Cas où aucune ressource n'est disponible
  if (!resources.length) {
    return (
      <p className="empty-state">
        Aucune ressource disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="resource-list">
      {/* Affichage de chaque ressource */}
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