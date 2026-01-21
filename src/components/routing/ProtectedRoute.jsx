import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null; 
  }

  // 401 - non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 403 - authentifié mais non autorisé
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
