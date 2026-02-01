import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

const API_URL = "http://localhost:8000";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Au chargement de l'application :
  // on vérifie si un utilisateur est déjà connecté
  useEffect(() => {
    Promise.resolve().then(() => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    });
  }, []);

  // Connexion utilisateur ou admin
  const login = async (role, payload) => {
    const response = await fetch(`${API_URL}/auth/login/${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();

    setToken(data.access_token);
    setUser(data.user);

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // Déconnexion :
  // on vide l'état et le localStorage
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token),
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}