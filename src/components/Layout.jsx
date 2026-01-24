import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./Layout.css";

export default function Layout() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="layout-header">
        {/* GAUCHE : menu */}
        <nav className="layout-nav layout-left">
          <Link to="/">Accueil</Link>

          {isAuthenticated && (
            <>
              <Link to="/resources">Ressources</Link>
              <Link to="/my-reservations">Mes réservations</Link>
            </>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <Link to="/admin">Admin</Link>
          )}

          {!isAuthenticated && <Link to="/login">Connexion</Link>}
        </nav>

        {/* CENTRE : logo */}
        <div className="layout-logo">
          <img
            src="/logo_reservation.png"
            alt="Logo Reservation App"
          />
        </div>

        {/* DROITE : utilisateur */}
        <div className="layout-right">
          {isAuthenticated && (
            <>
              <span className="user-info">
                Connecté :{" "}
                {user.first_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.email}
              </span>

              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}