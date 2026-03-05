// ─── Layout.jsx ───────────────────────────────────────────────────────────────
import { Outlet } from "react-router-dom";
import Sidebar       from "./Sidebar";
import GlobalSearch  from "./GlobalSearch";
import useAutoLogout from "../hooks/useAutoLogout";
import { useAuth }   from "../context/AuthContext";

export default function Layout() {
  const { user, logout }          = useAuth();
  const { warning, countdown, resetTimer } = useAutoLogout();

  return (
    <div style={s.wrapper}>
      <Sidebar />

      <div style={s.right}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header style={s.header}>
          <GlobalSearch />
          <div style={s.headerRight}>
            <div style={s.userPill}>
              <div style={s.dot} />
              <span style={s.userName}>{user?.username}</span>
              <span style={{
                ...s.roleTag,
                background: user?.role === "ROLE_ADMIN"
                  ? "#f59e0b20" : "#3b82f620",
                color: user?.role === "ROLE_ADMIN"
                  ? "#f59e0b" : "#3b82f6",
              }}>
                {user?.role === "ROLE_ADMIN" ? "Admin" : "Vendeur"}
              </span>
            </div>
          </div>
        </header>

        {/* ── Bandeau avertissement déconnexion ────────────────────────── */}
        {warning && (
          <div style={s.warningBanner}>
            <span>
              ⚠️ Inactivité détectée — Déconnexion automatique dans{" "}
              <strong>{countdown}s</strong>
            </span>
            <button style={s.stayBtn} onClick={resetTimer}>
              Rester connecté
            </button>
          </div>
        )}

        {/* ── Contenu page ─────────────────────────────────────────────── */}
        <main style={s.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    display: "flex", minHeight: "100vh",
    background: "#0f172a",
    fontFamily: "'Segoe UI', sans-serif",
  },
  right: {
    flex: 1, display: "flex",
    flexDirection: "column", overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 32px",
    background: "#1e293b",
    borderBottom: "1px solid #334155",
    gap: 16,
    position: "sticky", top: 0, zIndex: 100,
  },
  headerRight: {
    display: "flex", alignItems: "center",
    gap: 12, flexShrink: 0,
  },
  userPill: {
    display: "flex", alignItems: "center",
    gap: 8, background: "#0f172a",
    borderRadius: 20, padding: "6px 12px",
    border: "1px solid #334155",
  },
  dot: {
    width: 8, height: 8, borderRadius: "50%",
    background: "#10b981", flexShrink: 0,
  },
  userName: { color: "#f1f5f9", fontSize: 13, fontWeight: 600 },
  roleTag: {
    borderRadius: 5, padding: "2px 8px",
    fontSize: 11, fontWeight: 700,
  },
  warningBanner: {
    background: "#f97316",
    color: "#0f172a",
    padding: "10px 32px",
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    fontSize: 14, fontWeight: 600,
  },
  stayBtn: {
    background: "#0f172a", border: "none",
    borderRadius: 7, padding: "6px 14px",
    color: "#f97316", fontWeight: 700,
    fontSize: 13, cursor: "pointer",
  },
  main: {
    flex: 1, padding: "32px",
    overflowY: "auto", color: "#f1f5f9",
  },
};