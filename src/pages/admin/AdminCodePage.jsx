import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import "./AdminCodePage.css"; // optionnel

export default function AdminCodePage() {
  const { getToken } = useAuth();
  const [adminCode, setAdminCode] = useState("");
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const token = await getToken(); // token Clerk

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
    } catch (err) {
      setStatus(err.message || "Code invalide.");
    }
  };

  return (
    <div className="page page--home home-welcome page--admin-code">
      <div className="welcome-card">
        <h1>Activer le rôle administrateur</h1>
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
      </div>
    </div>
  );
}
