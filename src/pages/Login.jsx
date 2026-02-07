import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Veuillez saisir votre nom d'utilisateur");
      return;
    }
    if (!password.trim()) {
      toast.error("Veuillez saisir votre mot de passe");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      toast.success(`Bienvenue ${username} !`);
      navigate("/dashboard");
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.error("Identifiants incorrects");
      } else if (status === 500) {
        toast.error("Erreur serveur — vérifiez que le backend tourne sur le port 1919");
      } else if (!err.response) {
        toast.error("Impossible de joindre le serveur (port 1919)");
      } else {
        toast.error("Erreur de connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgPattern} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>G</div>
          <h1 style={styles.logoText}>GestionPro</h1>
          <p style={styles.logoSub}>Système de facturation & stock</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <input
              style={styles.input}
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
              onBlur={(e)  => e.target.style.borderColor = "#334155"}
              autoComplete="username"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
              onBlur={(e)  => e.target.style.borderColor = "#334155"}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.btn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#d97706")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#f59e0b")}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        {/* Info debug */}
        <p style={styles.debugInfo}>
          Serveur : localhost:1919
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', sans-serif",
  },
  bgPattern: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)," +
      "radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  card: {
    background: "#1e293b",
    borderRadius: 16,
    padding: "48px 40px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
    border: "1px solid #334155",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: {
    textAlign: "center",
    marginBottom: 36,
  },
  logoIcon: {
    width: 56, height: 56,
    borderRadius: 14,
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24, fontWeight: 800,
    color: "#fff",
    margin: "0 auto 16px",
    boxShadow: "0 8px 20px rgba(245,158,11,0.3)",
  },
  logoText: {
    color: "#f1f5f9",
    fontSize: 24, fontWeight: 700,
    margin: "0 0 6px",
    letterSpacing: "-0.5px",
  },
  logoSub: {
    color: "#64748b",
    fontSize: 13, margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    color: "#94a3b8",
    fontSize: 13, fontWeight: 500,
  },
  input: {
    background: "#0f172a",
    border: "1.5px solid #334155",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#f1f5f9",
    fontSize: 15,
    outline: "none",
    transition: "border-color 0.2s",
  },
  btn: {
    background: "#f59e0b",
    border: "none",
    borderRadius: 10,
    padding: "14px",
    color: "#0f172a",
    fontSize: 15, fontWeight: 700,
    transition: "background 0.2s",
    marginTop: 8,
  },
  debugInfo: {
    textAlign: "center",
    color: "#334155",
    fontSize: 11,
    marginTop: 24,
    marginBottom: 0,
  },
};