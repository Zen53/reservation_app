import './ErrorMessage.css';

/**
 * Composant ErrorMessage
 * Affiche les messages d'erreur
 * Les messages sont définis selon le contrat API
 */
const ErrorMessage = ({ message, type = "error" }) => {
  if (!message) return null;

  return (
    <div className={`error-message error-message--${type}`}>
      <span className="error-icon">
        {type === "error" ? "⚠️" : type === "warning" ? "⚡" : "ℹ️"}
      </span>
      <span className="error-text">{message}</span>
    </div>
  );
};

export default ErrorMessage;
