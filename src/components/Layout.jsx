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
        {isAuthenticated && (
        <span className="user-info">
          Connecté : {user.first_name ? `${user.first_name} ${user.last_name}` : user.email}
          </span>
          )}

        <nav className="layout-nav">
          <Link to="/">Accueil</Link>

          {isAuthenticated && <Link to="/resources">Ressources</Link>}

          {isAuthenticated && user?.role === "admin" && (
            <Link to="/admin">Admin</Link>
          )}

          {!isAuthenticated && <Link to="/login">Connexion</Link>}

          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-button">
              Déconnexion
            </button>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}
