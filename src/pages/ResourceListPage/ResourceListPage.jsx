import React, { useEffect, useState } from 'react';
import { getResources } from '../../api';
import { useAuth } from '@clerk/clerk-react';

import ResourceList from '../../components/ResourceList/ResourceList';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

const ResourceListPage = () => {
  // Liste des ressources récupérées depuis l’API
  const [resources, setResources] = useState([]);

  // États de gestion du chargement et des erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  // Chargement des ressources au montage du composant
  useEffect(() => {
    let mounted = true;

    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      const token = await getToken(); 
      
      const res = await getResources(token);

      // Sécurité pour éviter un setState après démontage
      if (!mounted) return;

      // Gestion des erreurs serveur
      if (res.status === 500) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
        setResources([]);
      }

      // Cas normal : ressources récupérées avec succès
      else if (res.status === 200) {
        setResources(res.data || []);
      }

      setLoading(false);
    };

    fetchResources();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page">
      {/* En-tête de la page */}
      <header className="page__header">
        <h1>Liste des ressources</h1>
        <p className="page__subtitle">
          Choisissez une ressource pour consulter les disponibilités
        </p>
      </header>

      {/* Chargement */}
      {loading && <Loader />}

      {/* Erreur */}
      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {/* Liste des ressources */}
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