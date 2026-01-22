import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  /* ===================== */
  /* CAS 1 — NON CONNECTÉ  */
  /* ===================== */
  if (!isAuthenticated) {
    return (
      <div className="page page--home home-welcome">
        <div className="welcome-card fade-in">
          <h1>Bienvenue 👋</h1>

          <p className="welcome-text">
            Cette application vous permet de réserver facilement des ressources
            (salles, créneaux horaires, équipements).
          </p>

          <p className="welcome-subtext">
            Connectez-vous pour consulter les disponibilités et effectuer une réservation.
          </p>

          <Link to="/login" className="home-button primary">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  /* ================= */
  /* CAS 2 — CONNECTÉ */
  /* ================= */
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
          Accédez à la liste des ressources pour consulter les disponibilités.
        </p>

        <Link to="/resources" className="home-button primary">
          Voir les ressources
        </Link>
      </div>
    </div>
  );
};

export default HomePage;