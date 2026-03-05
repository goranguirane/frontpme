// ─── pages/NotFound.jsx ───────────────────────────────────────────────────────
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={s.container}>
      <div style={s.content}>
        <div style={s.code}>404</div>
        <h1 style={s.title}>Page introuvable</h1>
        <p style={s.sub}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div style={s.btns}>
          <button style={s.btnPrimary} onClick={() => navigate("/dashboard")}>
            Retour au Dashboard
          </button>
          <button style={s.btnSecondary} onClick={() => navigate(-1)}>
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight: "100vh", background: "#0f172a",
    display: "flex", alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  content: { textAlign: "center", padding: 32 },
  code: {
    fontSize: 120, fontWeight: 900,
    color: "#1e293b", lineHeight: 1,
    marginBottom: 16,
    textShadow: "0 0 60px rgba(245,158,11,0.2)",
  },
  title: {
    color: "#f1f5f9", fontSize: 28,
    fontWeight: 700, margin: "0 0 12px",
  },
  sub: {
    color: "#64748b", fontSize: 15,
    margin: "0 0 32px",
  },
  btns: { display: "flex", gap: 12, justifyContent: "center" },
  btnPrimary: {
    background: "#f59e0b", border: "none",
    borderRadius: 10, padding: "12px 24px",
    color: "#0f172a", fontWeight: 700,
    fontSize: 14, cursor: "pointer",
  },
  btnSecondary: {
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: 10, padding: "12px 24px",
    color: "#94a3b8", fontWeight: 600,
    fontSize: 14, cursor: "pointer",
  },
};