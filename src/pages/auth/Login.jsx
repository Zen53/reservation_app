import { SignIn } from "@clerk/clerk-react";
import { useOutletContext } from "react-router-dom";
import { dark } from "@clerk/themes";
import "./Login.css";

export default function Login() {
  const { isDark } = useOutletContext() || {};

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1 className="login-title">Connexion</h1>
        <p className="login-subtitle">
          Authentification sécurisée via Clerk
        </p>

        <div className="login-form-wrapper">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            afterSignInUrl="/"
            appearance={{
              baseTheme: isDark ? dark : undefined,
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none", // On retire l'ombre par défaut de Clerk pour utiliser la nôtre
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
