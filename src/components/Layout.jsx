import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./Layout.css";

export default function Layout() {
  const { isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  
  const handleLogout = () => {
    logout();
    setTimeout(() => {
    navigate("/"); 
     }, 0);
  };

  return (
    <>
      <header className="layout-header">
        <nav className="layout-nav">
          <Link to="/">Accueil</Link>

          {isAuthenticated && <Link to="/resources">Ressources</Link>}
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
