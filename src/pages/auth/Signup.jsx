import { SignUp } from "@clerk/clerk-react";
import { useOutletContext } from "react-router-dom";
import { dark } from "@clerk/themes";
import "./Login.css";

export default function Signup() {
  const { isDark } = useOutletContext() || {};

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h1 className="login-title">Créer un compte</h1>
        <p className="login-subtitle">
          Inscription sécurisée via Clerk
        </p>

        <div className="login-form-wrapper">
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            afterSignUpUrl="/"
            appearance={{
              baseTheme: isDark ? dark : undefined,
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
