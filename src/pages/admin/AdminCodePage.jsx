import { useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import "./AdminCodePage.css";

export default function AdminCodePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [adminCode, setAdminCode] = useState("");
  const [status, setStatus] = useState(null);

  const isAdmin = user?.publicMetadata?.role === "admin";

  const handleDeactivate = async () => {
    setStatus(null);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:8000/auth/deactivate-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Erreur serveur");
      }

      setStatus("Mode admin désactivé. Rechargez la page pour appliquer les changements.");
      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      setStatus(err.message || "Erreur lors de la désactivation.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const token = await getToken();

      const res = await fetch("http://localhost:8000/auth/activate-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ admin_code: adminCode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Erreur serveur");
      }

      setStatus("Rôle admin activé ! Recharge la page pour voir le menu admin.");
      setAdminCode("");

      setTimeout(() => window.location.reload(), 1500);

    } catch (err) {
      setStatus(err.message || "Code invalide.");
    }
  };

  if (!isLoaded) return <div>Chargement...</div>;

  return (
    <div className="page page--home home-welcome page--admin-code">
      <div className="welcome-card">
        <h1>{isAdmin ? "Gestion Administrateur" : "Activer le rôle administrateur"}</h1>

        {isAdmin ? (
          <div className="admin-active-state">
            <p className="welcome-text" style={{ color: "#4ade80", fontWeight: "bold" }}>
              ✅ Vous êtes actuellement Administrateur.
            </p>
            <p className="welcome-text">
              Vous souhaitez revenir à un compte utilisateur standard ?
            </p>

            {status && <p className="login-error" style={{ color: "white" }}>{status}</p>}

            <button
              onClick={handleDeactivate}
              className="login-submit"
              style={{ background: "hsl(var(--destructive))", color: "white", marginTop: "1rem" }}
            >
              Désactiver le mode Admin
            </button>
          </div>
        ) : (
          <>
            <p className="welcome-text">
              Entrez votre code admin pour devenir administrateur de l'application.
            </p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Code ADMIN</label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
              </div>

              {status && <p className="login-error">{status}</p>}

              <button type="submit" className="login-submit">
                Valider le code
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
