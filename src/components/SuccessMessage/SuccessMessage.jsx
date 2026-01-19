import './SuccessMessage.css';

/**
 * Composant SuccessMessage
 * Affiche les messages de succès après une action réussie
 */
const SuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="success-message">
      <span className="success-icon">✅</span>
      <span className="success-text">{message}</span>
      {onClose && (
        <button className="success-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;
