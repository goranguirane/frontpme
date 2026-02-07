import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  Users, Truck, Package, FileText,
  AlertTriangle, ShoppingCart,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    clients: 0, fournisseurs: 0, produits: 0,
    factures: 0, alertes: 0, ruptures: 0,
  });

  useEffect(() => {
    Promise.all([
      api.get("/clients"),
      api.get("/fournisseurs"),
      api.get("/produits"),
      api.get("/factures"),
      api.get("/stock/alertes/count"),
    ]).then(([c, f, p, fa, s]) => {
      setStats({
        clients:     c.data.length,
        fournisseurs: f.data.length,
        produits:    p.data.length,
        factures:    fa.data.length,
        alertes:     s.data.alertes,
        ruptures:    s.data.ruptures,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: "Clients",       value: stats.clients,
      icon: Users,        color: "#3b82f6" },
    { label: "Fournisseurs",  value: stats.fournisseurs,
      icon: Truck,        color: "#8b5cf6" },
    { label: "Produits",      value: stats.produits,
      icon: Package,      color: "#10b981" },
    { label: "Factures",      value: stats.factures,
      icon: FileText,     color: "#f59e0b" },
    { label: "Alertes stock", value: stats.alertes,
      icon: AlertTriangle, color: "#f97316" },
    { label: "En rupture",    value: stats.ruptures,
      icon: ShoppingCart, color: "#ef4444" },
  ];

  return (
    <div>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>Dashboard</h1>
        <p style={styles.pageSub}>Vue d'ensemble de votre activité</p>
      </div>

      <div style={styles.grid}>
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={styles.card}>
            <div style={{ ...styles.cardIcon, background: color + "20" }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <p style={styles.cardValue}>{value}</p>
              <p style={styles.cardLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pageHeader: { marginBottom: 32 },
  pageTitle: {
    fontSize: 28, fontWeight: 700,
    color: "#f1f5f9", margin: "0 0 6px",
  },
  pageSub:  { color: "#64748b", margin: 0, fontSize: 14 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 14,
    padding: "24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    transition: "transform 0.2s",
    cursor: "default",
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  cardValue: {
    fontSize: 28, fontWeight: 700,
    color: "#f1f5f9", margin: "0 0 4px",
  },
  cardLabel: { color: "#64748b", fontSize: 13, margin: 0 },
};