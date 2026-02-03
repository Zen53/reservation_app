import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Unauthorized from "./pages/auth/Unauthorized";
import NotFound from "./pages/auth/NotFound";
import Profile from "./pages/Profile/Profile";

import HomePage from "./pages/HomePage";
import ResourceListPage from "./pages/ResourceListPage";
import ResourcePage from "./pages/ResourcePage";
import ReservationPage from "./pages/ReservationPage";
import MyReservationsPage from "./pages/MyReservationsPage";
import AdminPage from "./pages/admin/AdminPage";
import AdminCodePage from "./pages/admin/AdminCodePage";

function ClerkProtected({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={window.location.pathname} />
      </SignedOut>
    </>
  );
}

function AdminProtected({ children }) {
  const { user } = useUser();
  const role = user?.publicMetadata?.role || "user";
  const isAdmin = role === "admin";

  return (
    <ClerkProtected>
      {isAdmin ? children : <Unauthorized />}
    </ClerkProtected>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Accueil */}
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/login/*" element={<Login />} />
        <Route path="/signup/*" element={<Signup />} />

        <Route path="/profile" element={
          <SignedIn>
            <Profile />
          </SignedIn>
        } />
        
        {/* Page pour activer le rôle admin via codeAdmin */}
        <Route
          path="/admin-code"
          element={
            <ClerkProtected>
              <AdminCodePage />
            </ClerkProtected>
          }
        />

        {/* Liste des ressources */}
        <Route
          path="/resources"
          element={
            <ClerkProtected>
              <ResourceListPage />
            </ClerkProtected>
          }
        />

        {/* Détail ressource */}
        <Route
          path="/resources/:id"
          element={
            <ClerkProtected>
              <ResourcePage />
            </ClerkProtected>
          }
        />

        {/* Détail réservation */}
        <Route
          path="/reservations/:id"
          element={
            <ClerkProtected>
              <ReservationPage />
            </ClerkProtected>
          }
        />

        {/* Historique utilisateur */}
        <Route
          path="/my-reservations"
          element={
            <ClerkProtected>
              <MyReservationsPage />
            </ClerkProtected>
          }
        />

        {/* Page admin réservée aux admins */}
        <Route
          path="/admin"
          element={
            <AdminProtected>
              <AdminPage />
            </AdminProtected>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}