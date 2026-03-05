// ─── ConfirmModal.jsx ─────────────────────────────────────────────────────────
// Remplace window.confirm() par un vrai modal stylé
//
// Usage :
//   const { confirm, ConfirmModal } = useConfirm();
//   await confirm({ title: "Supprimer ?", message: "Client Jean Dupont", danger: true });
//   <ConfirmModal />

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function useConfirm() {
  const [state, setState] = useState({
    open: false, title: "", message: "",
    danger: true, resolve: null,
  });

  const confirm = ({ title, message, danger = true }) =>
    new Promise((resolve) => {
      setState({ open: true, title, message, danger, resolve });
    });

  const handleClose = (result) => {
    state.resolve?.(result);
    setState((s) => ({ ...s, open: false }));
  };

  const Modal = () => {
    if (!state.open) return null;
    return (
      <div style={s.overlay} onClick={() => handleClose(false)}>
        <div style={s.modal} onClick={(e) => e.stopPropagation()}>
          {/* Icône */}
          <div style={{
            ...s.iconWrap,
            background: state.danger ? "#ef444420" : "#f59e0b20",
          }}>
            {state.danger
              ? <Trash2 size={28} color="#ef4444" />
              : <AlertTriangle size={28} color="#f59e0b" />
            }
          </div>

          {/* Texte */}
          <h2 style={s.title}>{state.title}</h2>
          {state.message && (
            <p style={s.message}>{state.message}</p>
          )}

          {/* Boutons */}
          <div style={s.btns}>
            <button style={s.btnCancel} onClick={() => handleClose(false)}>
              Annuler
            </button>
            <button
              style={{
                ...s.btnConfirm,
                background: state.danger ? "#ef4444" : "#f59e0b",
                color:      state.danger ? "#fff"    : "#0f172a",
              }}
              onClick={() => handleClose(true)}
            >
              {state.danger ? "Supprimer" : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { confirm, ConfirmModal: Modal };
}

const s = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#1e293b",
    borderRadius: 16, padding: "32px",
    width: "100%", maxWidth: 400,
    border: "1px solid #334155",
    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: "50%",
    display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 20px",
  },
  title: {
    color: "#f1f5f9", fontSize: 18,
    fontWeight: 700, margin: "0 0 10px",
  },
  message: {
    color: "#94a3b8", fontSize: 14,
    margin: "0 0 24px", lineHeight: 1.5,
  },
  btns: {
    display: "flex", gap: 12,
    justifyContent: "center",
  },
  btnCancel: {
    background: "#334155", border: "none",
    borderRadius: 9, padding: "10px 24px",
    color: "#94a3b8", fontWeight: 600,
    fontSize: 14, cursor: "pointer",
  },
  btnConfirm: {
    border: "none", borderRadius: 9,
    padding: "10px 24px", fontWeight: 700,
    fontSize: 14, cursor: "pointer",
  },
};