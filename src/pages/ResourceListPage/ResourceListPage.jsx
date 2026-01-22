import React, { useEffect, useState } from 'react';
import { getResources } from '../../api';

import ResourceList from '../../components/ResourceList/ResourceList';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

const ResourceListPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      const res = await getResources();
      if (!mounted) return;

      if (res.status === 500) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
        setResources([]);
      } else if (res.status === 200) {
        setResources(res.data || []);
      }

      setLoading(false);
    };

    fetch();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="page">
      <header className="page__header">
        <h1>Liste des ressources</h1>
        <p className="page__subtitle">
          Choisissez une ressource pour consulter les disponibilités
        </p>
      </header>

      {loading && <Loader />}

      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {!loading && !error && (
        <ResourceList
          resources={resources}
          setResources={setResources}
        />
      )}
    </div>
  );
};

export default ResourceListPage;