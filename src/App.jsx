import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import Login from "./pages/auth/Login";
import Unauthorized from "./pages/auth/Unauthorized";
import NotFound from "./pages/auth/NotFound";

import HomePage from "./pages/HomePage";
import ResourcePage from "./pages/ResourcePage";
import ReservationPage from "./pages/ReservationPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Accueil public */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Ressources protégées */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Navigate to="/" replace />
                </ProtectedRoute>
        }
        />
        <Route
          path="/resources/:id"
          element={
            <ProtectedRoute>
              <ResourcePage />
            </ProtectedRoute>
          }
        />

        {/* Réservations (prévu / optionnel) */}
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <ReservationPage />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <div>Dashboard Admin</div>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
