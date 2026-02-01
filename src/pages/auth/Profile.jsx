import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { deleteMyAccount } from "../../api/api";
import "./Profile.css";

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
      alert("Une erreur est survenue lors de la suppression du compte.");
    }

    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">Profil & sécurité</h1>

        <div className="profile-card">
          <p>
            <strong>Nom :</strong>{" "}
            {user?.first_name
              ? `${user.first_name} ${user.last_name}`
              : "—"}
          </p>
          <p>
            <strong>Email :</strong> {user?.email}
          </p>
          <p>
            <strong>Rôle :</strong> {user?.role}
          </p>
        </div>

        <div className="profile-separator" />

        <div className="profile-danger">
          <h3>Zone dangereuse</h3>
          <p>
            La suppression de votre compte est définitive et entraînera la perte
            de toutes vos données.
          </p>

          <button
            className="delete-account-button"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? "Suppression en cours..." : "Supprimer mon compte"}
          </button>
        </div>
      </div>
    </div>
  );
}
