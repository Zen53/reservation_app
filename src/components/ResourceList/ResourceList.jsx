import ResourceCard from "../ResourceCard/ResourceCard";
import "./ResourceList.css";

const ResourceList = ({ resources, setResources }) => {
  const handleToggleActive = (id) => {
    setResources(prev =>
      prev.map(r =>
        r.id === id ? { ...r, active: !r.active } : r
      )
    );
  };

  if (!resources.length) {
    return <p>Aucune ressource disponible</p>;
  }

  return (
    <div className="resource-list">
      {resources.map(resource => (
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
