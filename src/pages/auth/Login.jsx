import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./Login.css";

export default function Login() {
  // Récupération de la fonction login depuis le contexte d’authentification
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mode de connexion : utilisateur ou admin
  const [mode, setMode] = useState("user");

  // Données du formulaire
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    admin_code: "",
  });

  // Message d’erreur affiché en cas d’échec
  const [error, setError] = useState(null);

  // Mise à jour des champs du formulaire
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Soumission du formulaire de connexion
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Connexion utilisateur classique
      if (mode === "user") {
        await login("user", {
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
        });
      }
      // Connexion administrateur avec code
      else {
        await login("admin", form);
      }

      // Redirection après connexion réussie
      navigate("/");
    } catch {
      // Message affiché si la connexion échoue
      setError("Erreur de connexion. Vérifiez les informations.");
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Connexion</h1>
      <p className="login-subtitle">
        Authentification sécurisée par formulaire
      </p>

      {/* Sélecteur de mode utilisateur / admin */}
      <div className="login-switch">
        <button
          className={mode === "user" ? "active" : ""}
          onClick={() => setMode("user")}
        >
          Utilisateur
        </button>
        <button
          className={mode === "admin" ? "active" : ""}
          onClick={() => setMode("admin")}
        >
          Admin
        </button>
      </div>

      {/* Formulaire de connexion */}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Prénom</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Nom</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Champ supplémentaire visible uniquement en mode admin */}
        {mode === "admin" && (
          <div className="form-group">
            <label>Code ADMIN</label>
            <input
              type="password"
              name="admin_code"
              value={form.admin_code}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-submit">
          Se connecter
        </button>
      </form>
    </div>
  );
}