import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/clerk-react";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/routing/ProtectedRoute"; // keep if used, otherwise remove
import Loader from "./components/Loader/Loader";

// Lazy Loading des pages
const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const Unauthorized = lazy(() => import("./pages/auth/Unauthorized"));
const NotFound = lazy(() => import("./pages/auth/NotFound"));
const Profile = lazy(() => import("./pages/Profile/Profile"));

const HomePage = lazy(() => import("./pages/HomePage"));
const ResourceListPage = lazy(() => import("./pages/ResourceListPage"));
const ResourcePage = lazy(() => import("./pages/ResourcePage"));
const ReservationPage = lazy(() => import("./pages/ReservationPage"));
const MyReservationsPage = lazy(() => import("./pages/MyReservationsPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));
const AdminCodePage = lazy(() => import("./pages/admin/AdminCodePage"));

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
    <Suspense fallback={<Loader />}>
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
    </Suspense>
  );
}