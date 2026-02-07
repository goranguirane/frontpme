import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "center", height: "100vh",
      background: "#0f172a", color: "#fff"
    }}>
      Chargement...
    </div>
  );

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}