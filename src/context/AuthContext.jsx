import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { setUser(JSON.parse(saved)); }
      catch { localStorage.removeItem("user"); }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    const userData = {
      username: res.data.username,
      role:     res.data.role,         // ✅ ROLE_ADMIN ou ROLE_VENDEUR
      isAdmin:  res.data.role === "ROLE_ADMIN",
    };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    finally {
      setUser(null);
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // ✅ Helper pour vérifier le rôle
  const isAdmin  = () => user?.role === "ROLE_ADMIN";
  const isVendeur = () => user?.role === "ROLE_VENDEUR";

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isVendeur }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);