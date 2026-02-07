// src/sharedStyles.js
export default function sharedStyles() {
  return {
    pageHeader: {
      display: "flex", justifyContent: "space-between",
      alignItems: "flex-start", marginBottom: 28,
    },
    pageTitle: {
      fontSize: 26, fontWeight: 700,
      color: "#f1f5f9", margin: "0 0 4px",
    },
    pageSub: { color: "#64748b", fontSize: 13, margin: 0 },

    btnPrimary: {
      background: "#f59e0b", border: "none", borderRadius: 9,
      padding: "10px 18px", color: "#0f172a",
      fontWeight: 700, fontSize: 14,
      cursor: "pointer", display: "flex",
      alignItems: "center", gap: 6,
      transition: "background 0.2s",
    },
    btnCancel: {
      background: "#1e293b", border: "1px solid #334155",
      borderRadius: 9, padding: "10px 18px",
      color: "#94a3b8", fontWeight: 600,
      fontSize: 14, cursor: "pointer",
    },
    btnEdit: {
      background: "#3b82f620", border: "none", borderRadius: 7,
      padding: "7px 9px", color: "#3b82f6",
      cursor: "pointer", display: "flex", alignItems: "center",
    },
    btnDel: {
      background: "#ef444420", border: "none", borderRadius: 7,
      padding: "7px 9px", color: "#ef4444",
      cursor: "pointer", display: "flex", alignItems: "center",
    },
    filterBtn: {
      border: "none", borderRadius: 8,
      padding: "7px 14px", fontSize: 13,
      fontWeight: 600, cursor: "pointer",
      transition: "all 0.15s",
    },
    searchWrap: {
      display: "flex", alignItems: "center",
      gap: 10, background: "#1e293b",
      border: "1px solid #334155", borderRadius: 10,
      padding: "10px 16px", marginBottom: 20,
    },
    searchInput: {
      flex: 1, background: "transparent",
      border: "none", color: "#f1f5f9",
      fontSize: 14, outline: "none",
    },
    clearBtn: {
      background: "transparent", border: "none",
      color: "#64748b", cursor: "pointer",
      display: "flex", alignItems: "center",
    },
    tableWrap: {
      background: "#1e293b", borderRadius: 14,
      border: "1px solid #334155", overflow: "hidden",
    },
    table: {
      width: "100%", borderCollapse: "collapse",
    },
    th: {
      background: "#0f172a", color: "#64748b",
      fontSize: 12, fontWeight: 600,
      padding: "12px 16px", textAlign: "left",
      borderBottom: "1px solid #334155",
      letterSpacing: "0.5px", textTransform: "uppercase",
    },
    tr: { transition: "background 0.15s" },
    td: {
      padding: "12px 16px", color: "#cbd5e1",
      fontSize: 13, borderBottom: "1px solid #1e293b",
    },
    empty: {
      textAlign: "center", color: "#475569",
      padding: "40px", fontSize: 14,
    },
    badge: {
      background: "#334155", color: "#94a3b8",
      borderRadius: 6, padding: "3px 8px",
      fontSize: 12, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 4,
    },
    statusBadge: {
      borderRadius: 6, padding: "4px 10px",
      fontSize: 11, fontWeight: 700,
      display: "inline-flex", alignItems: "center", gap: 4,
    },
    actions: { display: "flex", gap: 6 },

    overlay: {
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 1000,
      backdropFilter: "blur(4px)",
    },
    modal: {
      background: "#1e293b", borderRadius: 16,
      padding: "28px 32px", width: "90%",
      maxWidth: 480, maxHeight: "90vh",
      overflowY: "auto", border: "1px solid #334155",
      boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
    },
    modalHeader: {
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: 24,
    },
    modalTitle: {
      color: "#f1f5f9", fontSize: 18,
      fontWeight: 700, margin: 0,
    },
    closeBtn: {
      background: "transparent", border: "none",
      color: "#64748b", cursor: "pointer",
      display: "flex", alignItems: "center",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
    },
    field: { display: "flex", flexDirection: "column", gap: 6 },
    label: { color: "#94a3b8", fontSize: 12, fontWeight: 600 },
    input: {
      background: "#0f172a", border: "1.5px solid #334155",
      borderRadius: 8, padding: "10px 12px",
      color: "#f1f5f9", fontSize: 14,
      outline: "none", transition: "border-color 0.2s",
      width: "100%",
    },
    modalFooter: {
      display: "flex", justifyContent: "flex-end",
      gap: 12, marginTop: 8,
    },
  };
}