import { useState } from "react";
import { toast } from "react-toastify";
import { exportApi } from "../api/exportApi";
import sharedStyles from "../sharedStyles";

import {
  FileSpreadsheet, FileText, Users, Package,
  FileStack, AlertTriangle, ShoppingCart,
} from "lucide-react";

const exports = [
  {
    label:    "Clients",
    desc:     "Liste complète de tous les clients",
    icon:     Users,
    color:    "#3b82f6",
    action:   "excelClients",
    type:     "Excel",
  },
  {
    label:    "Produits",
    desc:     "Catalogue produits avec statut stock",
    icon:     Package,
    color:    "#10b981",
    action:   "excelProduits",
    type:     "Excel",
  },
  {
    label:    "Factures",
    desc:     "Toutes les factures + détail des lignes",
    icon:     FileStack,
    color:    "#f59e0b",
    action:   "excelFactures",
    type:     "Excel",
  },
  {
    label:    "Alertes Stock",
    desc:     "Produits sous le seuil d'alerte",
    icon:     AlertTriangle,
    color:    "#f97316",
    action:   "excelAlertes",
    type:     "Excel",
  },
  {
    label:    "Bons de commande",
    desc:     "Historique des bons de commande",
    icon:     ShoppingCart,
    color:    "#8b5cf6",
    action:   "excelBons",
    type:     "Excel",
  },
  {
    label:    "Rapport Stock PDF",
    desc:     "État du stock complet en PDF",
    icon:     FileText,
    color:    "#ef4444",
    action:   "pdfStock",
    type:     "PDF",
  },
];

export default function Export() {
  const [loading, setLoading] = useState(null);

  const handleExport = async (action, label) => {
    setLoading(action);
    try {
      await exportApi[action]();
      toast.success(`${label} exporté avec succès`);
    } catch {
      toast.error(`Erreur export ${label}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Export</h1>
          <p style={s.pageSub}>Téléchargez vos données en Excel ou PDF</p>
        </div>
      </div>

      <div style={exp.grid}>
        {exports.map(({ label, desc, icon: Icon, color, action, type }) => (
          <div key={action} style={exp.card}>
            <div style={{ ...exp.iconWrap, background: color + "20" }}>
              <Icon size={28} color={color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <h3 style={exp.cardTitle}>{label}</h3>
                <span style={{
                  ...s.badge,
                  background: type === "PDF" ? "#ef444420" : "#10b98120",
                  color:      type === "PDF" ? "#ef4444"   : "#10b981",
                }}>
                  {type === "PDF"
                    ? <FileText size={10} />
                    : <FileSpreadsheet size={10} />
                  }
                  {type}
                </span>
              </div>
              <p style={exp.cardDesc}>{desc}</p>
            </div>
            <button
              style={{
                ...s.btnPrimary,
                background: loading === action ? "#334155" : "#f59e0b",
                cursor: loading === action ? "not-allowed" : "pointer",
              }}
              disabled={loading === action}
              onClick={() => handleExport(action, label)}
            >
              {loading === action ? "Export..." : "Télécharger"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const exp = {
  grid: {
    display: "flex", flexDirection: "column", gap: 16,
  },
  card: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    transition: "border-color 0.2s",
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 14,
    display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  cardTitle: {
    color: "#f1f5f9", fontSize: 15,
    fontWeight: 700, margin: 0,
  },
  cardDesc: {
    color: "#64748b", fontSize: 13, margin: 0,
  },
};

const s = sharedStyles();