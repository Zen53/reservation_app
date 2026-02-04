import "./Profile.css";
import { useState, useEffect } from "react";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { deleteMyAccount } from "../../api";

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { signOut, setActive } = useClerk();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.unsafeMetadata?.bio || "",
        phoneNumber: user.phoneNumbers[0]?.phoneNumber || "",
      });
    }
  }, [isLoaded, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");

    try {
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
        unsafeMetadata: {
          ...user.unsafeMetadata,
          bio: formData.bio,
        },
      });

      setSuccess("Profil mis à jour avec succès !");
      setIsEditing(false);

      await setActive({ session: user.appearances[0]?.sessions[0]?.id });

    } catch (err) {
      console.error("Erreur mise à jour profil:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      console.log("Tentative suppression backend...");
      const res = await deleteMyAccount(token);
      console.log("Réponse backend:", res);

      if (res.status !== 200) {
        throw new Error(`Erreur Backend (${res.status}): ${res.error?.detail || "Inconnue"}`);
      }

      await signOut();
      navigate("/");
    } catch (err) {
      console.error("Erreur suppression détaillée:", err);
      setError(err.message || "Erreur lors de la suppression du compte.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="page"><p>Chargement du profil...</p></div>;
  }

  return (
    <div className="page--profile">
      <div className="profile-card">
        <h1>Mon Profil</h1>

        {error && (
          <div className="alert alert-error">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <strong>Succès :</strong> {success}
          </div>
        )}


        <div className="profile-header">
          <img
            src={user.imageUrl}
            alt="Avatar"
            className="profile-avatar"
          />
          <div>
            <h2>{user.fullName || "Utilisateur"}</h2>
            <p className="profile-email">{user.primaryEmailAddress?.emailAddress}</p>
            <p className="profile-id">ID: {user.id}</p>
            <span className="badge badge-verified">
              {user.primaryEmailAddress?.verification?.status === "verified"
                ? "Email vérifié" : "Email non vérifié"}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            {isEditing ? "Annuler" : "Modifier le profil"}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            Supprimer le compte
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                autoComplete="given-name"
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                autoComplete="family-name"
              />
            </div>

            <div className="form-group">
              <label>Biographie</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows="4"
                placeholder="Décrivez-vous en quelques mots..."
                maxLength="500"
              />
              <small>{formData.bio.length}/500 caractères</small>
            </div>

            <div className="form-group">
              <label>Téléphone (optionnel)</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                autoComplete="tel"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </form>
        )}

        <div className="profile-details">
          <h3>Informations du compte</h3>
          <div className="detail-row">
            <span>Inscrit le</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span>Dernière connexion</span>
            <span>{new Date(user.lastSignInAt).toLocaleDateString()}</span>
          </div>
          {formData.bio && (
            <div className="detail-row">
              <span>Biographie</span>
              <span>{formData.bio}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
