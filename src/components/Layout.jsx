import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  useUser,
  useAuth as useClerkAuth,
} from "@clerk/clerk-react";
import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useUser();
  const { signOut, isLoaded } = useClerkAuth();

  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme === "dark" || (!savedTheme && prefersDark);
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  const role = user?.publicMetadata?.role || "user";
  const isAdmin = role === "admin";

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="layout-header">
        {/* ===== LEFT : Navigation ===== */}
        <nav className="layout-nav layout-left">
          <Link to="/" className={isActive("/") ? "active" : ""}>
            Accueil
          </Link>

          <SignedIn>
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

              {isAdmin && <Link to="/admin">Admin</Link>}
              {/* Optionnel : page pour entrer le code admin */}
              {!isAdmin && <Link to="/admin-code">Code admin</Link>}

              <Link
                to="/profile"
                className={isActive("/profile") ? "active" : ""}
              >
                Profil
              </Link>
          </SignedIn>

          <SignedOut>
            <Link to="/login">Connexion</Link>
          </SignedOut>
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

          <SignedIn>
              <span className="user-info">
              Connecté :{" "}
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.primaryEmailAddress?.emailAddress}
            </span>

              <button
                onClick={handleLogout}
                className="logout-button"
              >
                Déconnexion
              </button>
          </SignedIn>
          <SignedOut>
            <Link to="/signup" className="signup-button">
              S'inscrire
            </Link>
          </SignedOut>
        </div>
      </header>

      {/* ===== Main content ===== */}
      <main>
        <Outlet />
      </main>
    </>
  );
}
