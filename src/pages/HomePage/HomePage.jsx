import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

import "./HomePage.css";

/* Images de fond */
const images = [
  "/images/salle-curie.png",
  "/images/salle-newton.png",
  "/images/salle-einstein.png",
  "/images/salle-darwin.png",
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-background">
      {/* Images de fond */}
      {images.map((img, i) => (
        <div
          key={i}
          className={`bg-image ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}

      {/* Overlay sombre (SANS dégradé) */}
      <div className="bg-overlay" />

      <div className="page page--home">
        <div className="welcome-card fade-in">

          {!isAuthenticated && (
            <>
              <h1>Bienvenue</h1>

              <p className="welcome-text">
                Cette application permet de réserver facilement des ressources
                comme des salles ou des créneaux horaires.
              </p>

              <p className="welcome-subtext">
                Vous devez être connecté pour accéder aux réservations.
              </p>

              <Link to="/login" className="home-button">
                Se connecter
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <h1>
                Bon retour{user?.first_name ? `, ${user.first_name}` : ""}
              </h1>

              <p className="welcome-text">
                Vous êtes connecté à l’application de réservation.
              </p>

              <p className="welcome-subtext">
                Vous pouvez maintenant consulter les ressources disponibles.
              </p>

              <Link to="/resources" className="home-button">
                Voir les ressources
              </Link>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default HomePage;
