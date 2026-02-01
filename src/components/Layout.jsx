import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import "./Layout.css";

export default function Layout() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme === "dark" || (!savedTheme && prefersDark);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="layout-header">
        {/* ===== LEFT : Navigation ===== */}
        <nav className="layout-nav layout-left">
          <Link to="/" className={isActive("/") ? "active" : ""}>
            Accueil
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/resources"
                className={isActive("/resources") ? "active" : ""}
              >
                Ressources
              </Link>

              <Link
                to="/my-reservations"
                className={isActive("/my-reservations") ? "active" : ""}
              >
                Mes réservations
              </Link>

              <Link
                to="/profile"
                className={isActive("/profile") ? "active" : ""}
              >
                Profil
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === "admin" && (
            <Link
              to="/admin"
              className={isActive("/admin") ? "active" : ""}
            >
              Admin
            </Link>
          )}

          {!isAuthenticated && (
            <Link
              to="/login"
              className={isActive("/login") ? "active" : ""}
            >
              Connexion
            </Link>
          )}
        </nav>

        {/* ===== CENTER : Logo ===== */}
        <div className="layout-logo">
          <Link to="/" className="logo-link">
            <img
              src="/logo_reservation.png"
              alt="Logo réservation"
              className="logo-img"
            />
          </Link>
        </div>

        {/* ===== RIGHT : User / Theme ===== */}
        <div className="layout-right">
          {/* Theme toggle */}
          <button
            className="theme-toggle no-style"
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Changer le thème"
          >
            {isDark ? (
              // ☀️ Light icon
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              // 🌙 Dark icon
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {isAuthenticated && (
            <>
              <span className="user-info">
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

      {/* ===== Main content ===== */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
