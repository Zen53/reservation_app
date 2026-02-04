import React from "react";

export default function Error500({ error, resetErrorBoundary }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#1a1a1a",
            color: "white",
            textAlign: "center",
            padding: "20px"
        }}>
            <h1 style={{ fontSize: "4rem", marginBottom: "1rem", color: "#ef4444" }}>500</h1>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Oups ! Une erreur critique est survenue.</h2>
            <p style={{ maxWidth: "500px", marginBottom: "2rem", color: "#a3a3a3" }}>
                L'application a rencontré un problème inattendu. Nous sommes désolés pour la gêne occasionnée.
            </p>

            {error && (
                <details style={{ marginBottom: "2rem", textAlign: "left", background: "#333", padding: "1rem", borderRadius: "8px", maxWidth: "800px", overflow: "auto" }}>
                    <summary style={{ cursor: "pointer", color: "#fbbf24" }}>Voir les détails techniques</summary>
                    <pre style={{ marginTop: "10px", fontSize: "0.8rem", color: "#e5e5e5" }}>
                        {error.toString()}
                    </pre>
                </details>
            )}

            <button
                onClick={() => window.location.href = "/"}
                style={{
                    padding: "12px 24px",
                    backgroundColor: "hsl(var(--primary))", // Utilise la couleur primaire de l'app si dispo, sinon fallback
                    color: "white", // Texte blanc sur bouton primaire
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
                Retour à l'accueil
            </button>
        </div>
    );
}
