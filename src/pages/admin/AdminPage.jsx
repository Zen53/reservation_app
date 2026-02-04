import React, { useEffect, useState } from "react";
import {
  getResources,
  toggleResourceActive,
  getAdminReservations,
  deleteAdminReservation
} from "../../api";
import { useAuth } from "@clerk/clerk-react";

import Loader from "../../components/Loader/Loader";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";

import "./AdminPage.css";

const AdminPage = () => {
  const { getToken } = useAuth();

  // Tabs: 'resources' | 'reservations'
  const [activeTab, setActiveTab] = useState("resources");

  const handleDeactivate = async () => {
    if (!window.confirm("Voulez-vous vraiment quitter le mode administrateur ?")) return;

    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8000/auth/deactivate-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur serveur");

      window.location.href = "/";
    } catch (err) {
      alert("Erreur lors de la désactivation : " + err.message);
    }
  };

  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    let mounted = true;

    const fetchResources = async (token) => {
      try {
        const res = await getResources(token);
        if (mounted && res.status === 200) setResources(res.data);
      } catch (e) { console.error(e); }
    };

    const fetchReservations = async (token) => {
      try {
        const res = await getAdminReservations(token);
        if (mounted && res.status === 200) setReservations(res.data);
      } catch (e) { console.error(e); }
    };

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await getToken();
        await Promise.all([fetchResources(token), fetchReservations(token)]);

      } catch (err) {
        console.error(err);
        setError("Erreur réseau ou serveur.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [getToken, refreshKey]);

  const handleToggleResource = async (id, active) => {
    try {
      const token = await getToken();
      await toggleResourceActive(id, !active, token);
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !active } : r))
      );
    } catch {
      alert("Erreur lors de la modification de la ressource.");
    }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) {
      return;
    }

    try {
      const token = await getToken();
      const res = await deleteAdminReservation(id, token);

      if (res.status === 204) {
        setReservations((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Erreur lors de la suppression.");
      }
    } catch {
      alert("Erreur serveur.");
    }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} type="error" />;

  return (
    <div className="page page-admin">
      <div className="admin-header">
        <div className="admin-header-top">
          <h1>Administration</h1>
          <button
            onClick={handleDeactivate}
            className="btn-quit-admin"
            title="Revenir au mode utilisateur standard"
          >
            Quitter le mode Admin
          </button>
        </div>
        <p>Gérez les ressources et les réservations de l'application.</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "resources" ? "active" : ""}`}
          onClick={() => setActiveTab("resources")}
        >
          Ressources
        </button>
        <button
          className={`admin-tab ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          Réservations
        </button>

        <button type="button" className="btn-refresh" onClick={refresh} title="Actualiser">
          ↻
        </button>
      </div>

      <div className="admin-content fade-in">

        {activeTab === "resources" && (
          <div className="admin-table-container">
            {resources.length === 0 ? (
              <div className="admin-empty">Aucune ressource disponible.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.name}</strong></td>
                      <td>
                        <span className={`status-badge ${r.active ? "active" : "inactive"}`}>
                          {r.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-action btn-toggle"
                          onClick={() => handleToggleResource(r.id, r.active)}
                        >
                          {r.active ? "Désactiver" : "Activer"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="admin-table-container">
            {reservations.length === 0 ? (
              <div className="admin-empty">Aucune réservation enregistrée.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Utilisateur</th>
                    <th>Ressource</th>
                    <th>Date</th>
                    <th>Horaire</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.userEmail || "N/A"}</td>
                      <td>{r.resourceName}</td>
                      <td>{new Date(r.date).toLocaleDateString()}</td>
                      <td>{r.startTime} – {r.endTime}</td>
                      <td>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteReservation(r.id)}
                        >
                          Annuler
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
