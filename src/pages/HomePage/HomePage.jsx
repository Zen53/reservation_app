import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { getResources } from '../../api';

import ResourceList from '../../components/ResourceList/ResourceList';
import Loader from '../../components/Loader/Loader';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    const fetch = async () => {
      setLoading(true);
      const res = await getResources();
      if (!mounted) return;

      if (res.status === 500) {
        setError('Une erreur est survenue, veuillez réessayer plus tard');
        setResources([]);
      } else if (res.status === 200) {
        setResources(res.data || []);
        setError(null);
      }

      setLoading(false);
    };

    fetch();
    return () => { mounted = false; };
  }, [isAuthenticated]);

  // CAS 1 — UTILISATEUR NON CONNECTÉ
  if (!isAuthenticated) {
    return (
      <div className="page page--home">
        <header className="page__header">
          <h1>Bienvenue sur l’application de réservation</h1>
          <p className="page__subtitle">
            Connectez-vous pour consulter les ressources et effectuer des réservations.
          </p>
        </header>

        <div className="home-actions">
          <Link to="/login" className="home-button primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // CAS 2 — UTILISATEUR CONNECTÉ
  return (
    <div className="page page--home">
      <header className="page__header">
        <h1>Réservation — Ressources</h1>
        <p className="page__subtitle">
          Choisissez une salle pour voir les disponibilités
        </p>
      </header>

      {loading && <Loader />}

      {!loading && error && (
        <ErrorMessage message={error} type="error" />
      )}

      {!loading && !error && (
        <ResourceList resources={resources} />
      )}
    </div>
  );
};

export default HomePage;
