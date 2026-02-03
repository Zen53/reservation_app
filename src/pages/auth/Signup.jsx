import { SignUp } from "@clerk/clerk-react";
import "./Login.css";

export default function Signup() {
  return (
    <div className="login-page">
      <h1 className="login-title">Créer un compte</h1>
      <p className="login-subtitle">
        Inscription sécurisée via Clerk
      </p>

      <div className="login-form">
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          afterSignUpUrl="/"
        />
      </div>
    </div>
  );
}
