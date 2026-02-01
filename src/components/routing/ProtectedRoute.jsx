import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

/**
 * Protège une route selon l'authentification
 * et éventuellement selon le rôle utilisateur.
 *
 * @param {ReactNode} children
 * @param {string} role - rôle requis (ex: "admin")
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  // En attente du chargement de l'auth
  if (loading) {
    return null;
  }

  // Non authentifié → login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authentifié mais pas le bon rôle → 403
  if (role && user?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Accès autorisé
  return children;
}
