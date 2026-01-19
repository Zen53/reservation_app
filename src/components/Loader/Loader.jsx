import './Loader.css';

/**
 * Composant Loader
 * Affiche un indicateur de chargement pendant les appels API
 */
const Loader = ({ message = "Chargement en cours..." }) => {
  return (
    <div className="loader-container">
      <div className="loader-spinner"></div>
      <p className="loader-message">{message}</p>
    </div>
  );
};

export default Loader;
