import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (role) => {
    await login(role);
    navigate("/");
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Connexion</h1>
      <p className="login-subtitle">
        Authentification simulée (backend Python)
      </p>

      <div className="login-actions">
        <button
          className="login-button user"
          onClick={() => handleLogin("user")}
        >
          Se connecter en tant qu'utilisateur
        </button>

        <button
          className="login-button admin"
          onClick={() => handleLogin("admin")}
        >
          Se connecter en tant qu'admin
        </button>
      </div>
    </div>
  );
}
