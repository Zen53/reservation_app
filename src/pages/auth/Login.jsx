import { SignIn } from "@clerk/clerk-react";
import "./Login.css";

export default function Login() {
  return (
    <div className="login-page">
      <h1 className="login-title">Connexion</h1>
      <p className="login-subtitle">
        Authentification sécurisée via Clerk
      </p>

      <div className="login-form">
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/signup"
          afterSignInUrl="/"
        />
      </div>
    </div>
  );
}
