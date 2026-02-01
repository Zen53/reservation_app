import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import Profile from "./pages/auth/Profile";
import Login from "./pages/auth/Login";
import Unauthorized from "./pages/auth/Unauthorized";
import NotFound from "./pages/auth/NotFound";

import HomePage from "./pages/HomePage";
import ResourceListPage from "./pages/ResourceListPage";
import ResourcePage from "./pages/ResourcePage";
import ReservationPage from "./pages/ReservationPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import AdminPage from "./pages/admin/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Accueil */}
        <Route path="/" element={<HomePage />} />

        {/* Liste des ressources */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <ResourceListPage />
            </ProtectedRoute>
          }
        />

        {/* Détail ressource */}
        <Route
          path="/resources/:id"
          element={
            <ProtectedRoute>
              <ResourcePage />
            </ProtectedRoute>
          }
        />

        {/* Détail réservation */}
        <Route
          path="/reservations/:id"
          element={
            <ProtectedRoute>
              <ReservationPage />
            </ProtectedRoute>
          }
        />

        {/* Historique utilisateur */}
        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}