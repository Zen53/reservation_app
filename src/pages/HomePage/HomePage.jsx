import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  // Cas où l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    return (
      <div className="page page--home home-welcome">
        <div className="welcome-card fade-in">
          <h1>Bienvenue 👋</h1>

          <p className="welcome-text">
            Cette application permet de réserver facilement des ressources
            comme des salles ou des créneaux horaires.
          </p>

          <p className="welcome-subtext">
            Vous devez être connecté pour accéder aux réservations.
          </p>

          <Link to="/login" className="home-button primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  // Cas où l'utilisateur est connecté
  return (
    <div className="page page--home home-welcome">
      <div className="welcome-card">
        <h1>
          Bon retour{user?.first_name ? `, ${user.first_name}` : ''} 👋
        </h1>

        <p className="welcome-text">
          Vous êtes connecté à l’application de réservation.
        </p>

        <p className="welcome-subtext">
          Vous pouvez maintenant consulter les ressources disponibles.
        </p>

        <Link to="/resources" className="home-button primary">
          Voir les ressources
        </Link>
      </div>
    </div>
  );
};

export default HomePage;