import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, Truck, Package,
  FileText, Warehouse, ShoppingCart,
  Download, LogOut, Menu, X,
} from "lucide-react";
import { useState } from "react";

const menu = [
  { path: "/dashboard",     label: "Dashboard",       icon: LayoutDashboard },
  { path: "/clients",       label: "Clients",          icon: Users },
  { path: "/fournisseurs",  label: "Fournisseurs",     icon: Truck },
  { path: "/produits",      label: "Produits",         icon: Package },
  { path: "/factures",      label: "Factures",         icon: FileText },
  { path: "/stock",         label: "Stock & Alertes",  icon: Warehouse },
  { path: "/bons-commande", label: "Bons de commande", icon: ShoppingCart },
  { path: "/export",        label: "Export",           icon: Download },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? 72 : 240 }}>
      {/* Header */}
      <div style={styles.header}>
        {!collapsed && (
          <div style={styles.brand}>
            <div style={styles.brandIcon}>G</div>
            <span style={styles.brandText}>GestionPro</span>
          </div>
        )}
        <button
          style={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {menu.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              ...styles.link,
              background: isActive ? "rgba(245,158,11,0.12)" : "transparent",
              color: isActive ? "#f59e0b" : "#94a3b8",
              borderLeft: isActive
                ? "3px solid #f59e0b"
                : "3px solid transparent",
            })}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={styles.linkLabel}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer user */}
      <div style={styles.footer}>
        {!collapsed && (
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={styles.userName}>{user?.username}</p>
              <p style={styles.userRole}>Administrateur</p>
            </div>
          </div>
        )}
        <button
          style={styles.logoutBtn}
          onClick={logout}
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    background: "#1e293b",
    borderRight: "1px solid #334155",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "sticky",
    top: 0,
    transition: "width 0.25s ease",
    overflow: "hidden",
    flexShrink: 0,
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    padding: "20px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #334155",
    minHeight: 68,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  brandText: {
    color: "#f1f5f9",
    fontWeight: 700,
    fontSize: 16,
    whiteSpace: "nowrap",
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: 4,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s",
  },
  nav: {
    flex: 1,
    padding: "12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: "0 8px 8px 0",
    textDecoration: "none",
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
    marginLeft: -8,
    paddingLeft: 20,
  },
  linkLabel: {
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  footer: {
    padding: "16px",
    borderTop: "1px solid #334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#fff",
    fontSize: 14,
    flexShrink: 0,
  },
  userName: {
    color: "#f1f5f9",
    fontSize: 13,
    fontWeight: 600,
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    color: "#64748b",
    fontSize: 11,
    margin: 0,
  },
  logoutBtn: {
    background: "rgba(239,68,68,0.1)",
    border: "none",
    borderRadius: 8,
    color: "#ef4444",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    transition: "background 0.2s",
    flexShrink: 0,
  },
};