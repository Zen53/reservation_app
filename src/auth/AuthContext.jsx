/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const API_URL = "http://localhost:8000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (role = "user") => {
    const response = await fetch(
      `${API_URL}/auth/login?role=${role}`,
      { method: "POST" }
    );

    const data = await response.json();

    localStorage.setItem("token", data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });

        if (!response.ok) throw new Error();

        const user = await response.json();
        if (isMounted) setUser(user);
      } catch {
        logout();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
