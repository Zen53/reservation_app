import { useState } from "react";
import { deleteMyAccount } from "../api/api";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est définitive."
    );

    if (!confirmed) return;

    setLoading(true);

    const response = await deleteMyAccount(user.email);

    if (response.status === 200) {
      logout();
      navigate("/login");
    } else {
      alert("Erreur lors de la suppression du compte");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto" }}>
      <h1>Profil & sécurité</h1>

      <div style={{ marginBottom: "30px" }}>
        <p><strong>Nom :</strong> {user?.first_name} {user?.last_name}</p>
        <p><strong>Email :</strong> {user?.email}</p>
        <p><strong>Rôle :</strong> {user?.role}</p>
      </div>

      <hr />

      <div style={{ marginTop: "30px" }}>
        <h3>Zone dangereuse</h3>

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          style={{
            background: "#c0392b",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading ? "Suppression..." : "Supprimer mon compte"}
        </button>
      </div>
    </div>
  );
}
