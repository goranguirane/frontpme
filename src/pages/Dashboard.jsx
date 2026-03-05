// ─── pages/Dashboard.jsx ─────────────────────────────────────────────────────
// Tableau de bord personnalisé selon le rôle (ADMIN / VENDEUR)
// Sans recharts — graphiques CSS purs

import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Users, Truck, Package, FileText,
  AlertTriangle, TrendingUp, ShoppingCart,
  CheckCircle, Clock, XCircle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin  = user?.role === "ROLE_ADMIN";

  const [stats,    setStats]    = useState({
    clients: 0, fournisseurs: 0, produits: 0,
    factures: 0, alertes: 0, ruptures: 0,
  });
  const [factures, setFactures] = useState([]);
  const [alertes,  setAlertes]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const calls = [
      api.get("/clients"),
      api.get("/produits"),
      api.get("/factures"),
      api.get("/stock/alertes/count"),
      api.get("/stock/alertes"),
    ];

    // Admins seulement — fournisseurs
    if (isAdmin) calls.push(api.get("/fournisseurs"));

    Promise.all(calls.map((c) => c.catch(() => ({ data: [] }))))
      .then(([c, p, fa, s, al, f]) => {
        setStats({
          clients:      c.data.length,
          fournisseurs: f?.data.length || 0,
          produits:     p.data.length,
          factures:     fa.data.length,
          alertes:      s.data?.alertes || 0,
          ruptures:     s.data?.ruptures || 0,
        });
        setFactures(fa.data);
        setAlertes(al.data);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  // ── Calculs ─────────────────────────────────────────────────────────────
  const caMoisCourant = () => {
    const moisActuel = new Date().getMonth();
    return factures
      .filter((f) => f.statut === "PAYEE" &&
        new Date(f.dateFacture).getMonth() === moisActuel)
      .reduce((acc, f) => acc + (f.total || 0), 0);
  };

  const caJour = () => {
    const today = new Date().toISOString().split("T")[0];
    return factures
      .filter((f) => f.statut === "PAYEE" && f.dateFacture === today)
      .reduce((acc, f) => acc + (f.total || 0), 0);
  };

  const facturesAujourdhui = () => {
    const today = new Date().toISOString().split("T")[0];
    return factures.filter((f) => f.dateFacture === today);
  };

  const caParMois = () => {
    const mois = ["Jan","Fév","Mar","Avr","Mai","Jun",
                  "Jul","Aoû","Sep","Oct","Nov","Déc"];
    const data = mois.map((m) => ({ mois: m, ca: 0 }));
    factures
      .filter((f) => f.statut === "PAYEE")
      .forEach((f) => {
        const m = new Date(f.dateFacture).getMonth();
        data[m].ca += f.total || 0;
      });
    return data.filter((d) => d.ca > 0).slice(-6);
  };

  const topProduits = () => {
    const counts = {};
    factures.forEach((f) => {
      (f.lignes || []).forEach((l) => {
        const nom = l.produit?.nom || "Inconnu";
        counts[nom] = (counts[nom] || 0) + (l.quantite || 0);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nom, qte]) => ({ nom, qte }));
  };

  const statutFactures = () => {
    const counts = { PAYEE: 0, EN_ATTENTE: 0, ANNULEE: 0 };
    factures.forEach((f) => { if (counts[f.statut] !== undefined) counts[f.statut]++; });
    const total = factures.length || 1;
    return [
      { name: "Payées",     value: counts.PAYEE,      color: "#10b981",
        pct: Math.round((counts.PAYEE / total) * 100) },
      { name: "En attente", value: counts.EN_ATTENTE,  color: "#f59e0b",
        pct: Math.round((counts.EN_ATTENTE / total) * 100) },
      { name: "Annulées",   value: counts.ANNULEE,    color: "#ef4444",
        pct: Math.round((counts.ANNULEE / total) * 100) },
    ].filter((d) => d.value > 0);
  };

  const donneesCA       = caParMois();
  const donneesProduits = topProduits();
  const donneesStatuts  = statutFactures();
  const maxCA  = Math.max(...donneesCA.map((d) => d.ca), 1);
  const maxQte = Math.max(...donneesProduits.map((d) => d.qte), 1);

  if (loading) return (
    <div style={{ color: "#64748b", padding: 40, textAlign: "center" }}>
      Chargement du dashboard...
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // VUE VENDEUR
  // ════════════════════════════════════════════════════════════════════════
  if (!isAdmin) return (
    <div>
      <div style={st.pageHeader}>
        <div>
          <h1 style={st.pageTitle}>
            Bonjour, {user?.username} 👋
          </h1>
          <p style={st.pageSub}>Voici votre activité du jour</p>
        </div>
        <div style={st.dateBadge}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric",
            month: "long", year: "numeric",
          })}
        </div>
      </div>

      {/* Cartes vendeur */}
      <div style={st.grid}>
        {[
          { label: "CA aujourd'hui",   value: `${caJour().toLocaleString()} F`,
            color: "#10b981", icon: TrendingUp },
          { label: "Factures du jour", value: facturesAujourdhui().length,
            color: "#3b82f6", icon: FileText },
          { label: "En attente paiement",
            value: factures.filter((f) => f.statut === "EN_ATTENTE").length,
            color: "#f59e0b", icon: Clock },
          { label: "Alertes stock",    value: stats.alertes,
            color: "#f97316", icon: AlertTriangle },
          { label: "Produits",         value: stats.produits,
            color: "#8b5cf6", icon: Package },
          { label: "Clients",          value: stats.clients,
            color: "#06b6d4", icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={st.card}>
            <div style={{ ...st.cardIcon, background: color + "20" }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <p style={st.cardValue}>{value}</p>
              <p style={st.cardLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Factures du jour */}
      <div style={st.chartsGrid}>
        <div style={{ ...st.chartCard, gridColumn: "1 / -1" }}>
          <h3 style={st.chartTitle}>📋 Factures du jour</h3>
          {facturesAujourdhui().length === 0 ? (
            <p style={st.noData}>Aucune facture créée aujourd'hui</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["N° Facture","Client","Total","Statut"].map((h) => (
                    <th key={h} style={st.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {facturesAujourdhui().map((f) => {
                  const colors = {
                    PAYEE: "#10b981", EN_ATTENTE: "#f59e0b", ANNULEE: "#ef4444",
                  };
                  const color = colors[f.statut] || "#64748b";
                  return (
                    <tr key={f.id}>
                      <td style={st.td}>{f.numeroFacture}</td>
                      <td style={st.td}>
                        {f.client?.prenom} {f.client?.nom}
                      </td>
                      <td style={{ ...st.td, color: "#f59e0b", fontWeight: 700 }}>
                        {f.total?.toLocaleString()} F
                      </td>
                      <td style={st.td}>
                        <span style={{
                          background: color + "20", color,
                          borderRadius: 6, padding: "3px 8px",
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {f.statut}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Alertes stock vendeur */}
        <div style={st.chartCard}>
          <h3 style={st.chartTitle}>⚠️ Stocks à surveiller</h3>
          {alertes.length === 0 ? (
            <p style={{ ...st.noData, color: "#10b981" }}>
              ✅ Tous les stocks sont OK
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {alertes.slice(0, 6).map((a) => {
                const c = a.niveau === "RUPTURE" ? "#ef4444"
                  : a.niveau === "CRITIQUE" ? "#f97316" : "#f59e0b";
                return (
                  <div key={a.produitId} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: c + "10",
                    borderRadius: 8,
                    border: `1px solid ${c}30`,
                  }}>
                    <span style={{ color: "#cbd5e1", fontSize: 13 }}>
                      {a.nom}
                    </span>
                    <span style={{
                      color: c, fontWeight: 700, fontSize: 12,
                    }}>
                      {a.quantiteStock} restants
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════
  // VUE ADMIN
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div>
      <div style={st.pageHeader}>
        <div>
          <h1 style={st.pageTitle}>Dashboard Admin</h1>
          <p style={st.pageSub}>Vue d'ensemble complète de l'activité</p>
        </div>
        <div style={st.dateBadge}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric",
            month: "long", year: "numeric",
          })}
        </div>
      </div>

      {/* Cartes admin */}
      <div style={st.grid}>
        {[
          { label: "Clients",        value: stats.clients,      color: "#3b82f6", icon: Users },
          { label: "Fournisseurs",   value: stats.fournisseurs, color: "#8b5cf6", icon: Truck },
          { label: "Produits",       value: stats.produits,     color: "#10b981", icon: Package },
          { label: "Factures",       value: stats.factures,     color: "#f59e0b", icon: FileText },
          { label: "Alertes stock",  value: stats.alertes,      color: "#f97316", icon: AlertTriangle },
          { label: "CA ce mois",
            value: `${caMoisCourant().toLocaleString()} F`,
            color: "#06b6d4", icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={st.card}>
            <div style={{ ...st.cardIcon, background: color + "20" }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <p style={st.cardValue}>{value}</p>
              <p style={st.cardLabel}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={st.chartsGrid}>

        
        {/* Top produits */}
        <div style={st.chartCard}>
          <h3 style={st.chartTitle}>🏆 Top produits vendus</h3>
          {donneesProduits.length === 0 ? (
            <p style={st.noData}>Aucune vente enregistrée</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {donneesProduits.map((d, i) => {
                const colors = ["#3b82f6","#10b981","#f59e0b","#8b5cf6","#ef4444"];
                const pct = Math.round((d.qte / maxQte) * 100);
                return (
                  <div key={d.nom}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 5 }}>
                      <span style={{ color:"#cbd5e1", fontSize:13 }}>
                        {i+1}. {d.nom}
                      </span>
                      <span style={{ color: colors[i], fontWeight:700, fontSize:13 }}>
                        {d.qte} unités
                      </span>
                    </div>
                    <div style={st.hBarTrack}>
                      <div style={{ ...st.hBarFill, width:`${pct}%`, background: colors[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Statut factures */}
        <div style={st.chartCard}>
          <h3 style={st.chartTitle}>📊 Statut des factures</h3>
          {donneesStatuts.length === 0 ? (
            <p style={st.noData}>Aucune facture</p>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
              <div style={{
                width:140, height:140, borderRadius:"50%", flexShrink:0,
                boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
                background: (() => {
                  let cumul = 0;
                  const total = donneesStatuts.reduce((a,d) => a+d.value, 0);
                  const parts = donneesStatuts.map((d) => {
                    const pct = (d.value/total)*100;
                    const from = cumul; cumul += pct;
                    return `${d.color} ${from}% ${cumul}%`;
                  });
                  return `conic-gradient(${parts.join(",")})`;
                })(),
              }}>
                <div style={{
                  width:80, height:80, borderRadius:"50%",
                  background:"#1e293b", margin:"30px auto",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{ color:"#f1f5f9", fontSize:18, fontWeight:700 }}>
                    {factures.length}
                  </span>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {donneesStatuts.map((d) => (
                  <div key={d.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:d.color }} />
                    <span style={{ color:"#94a3b8", fontSize:13 }}>{d.name}</span>
                    <span style={{ color:d.color, fontWeight:700, fontSize:13 }}>
                      {d.value} ({d.pct}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      
      </div>
    </div>
  );
}

const st = {
  pageHeader: { marginBottom:28, display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  pageTitle:  { fontSize:26, fontWeight:700, color:"#f1f5f9", margin:"0 0 4px" },
  pageSub:    { color:"#64748b", fontSize:13, margin:0 },
  dateBadge:  {
    background:"#1e293b", border:"1px solid #334155",
    borderRadius:10, padding:"8px 14px",
    color:"#94a3b8", fontSize:12, fontWeight:500,
  },
  grid: {
    display:"grid",
    gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",
    gap:16, marginBottom:28,
  },
  card: {
    background:"#1e293b", border:"1px solid #334155",
    borderRadius:14, padding:"20px",
    display:"flex", alignItems:"center", gap:14,
  },
  cardIcon: {
    width:48, height:48, borderRadius:12,
    display:"flex", alignItems:"center",
    justifyContent:"center", flexShrink:0,
  },
  cardValue: { fontSize:24, fontWeight:700, color:"#f1f5f9", margin:"0 0 4px" },
  cardLabel: { color:"#64748b", fontSize:12, margin:0 },
  chartsGrid: {
    display:"grid",
    gridTemplateColumns:"repeat(auto-fill, minmax(420px, 1fr))",
    gap:20,
  },
  chartCard: {
    background:"#1e293b", border:"1px solid #334155",
    borderRadius:14, padding:"20px 24px",
  },
  chartTitle: { color:"#f1f5f9", fontSize:15, fontWeight:700, margin:"0 0 20px" },
  noData: { color:"#475569", textAlign:"center", padding:"40px 0", margin:0 },
  barChartWrap: { display:"flex", alignItems:"flex-end", gap:12, height:200, paddingBottom:4 },
  barCol:  { display:"flex", flexDirection:"column", alignItems:"center", gap:4, flex:1 },
  barValue: { color:"#94a3b8", fontSize:10, fontWeight:600 },
  barTrack: { width:"100%", height:160, background:"#0f172a", borderRadius:6, display:"flex", alignItems:"flex-end", overflow:"hidden" },
  barFill:  { width:"100%", borderRadius:"6px 6px 0 0", transition:"height 0.5s ease", minHeight:4 },
  barLabel: { color:"#64748b", fontSize:11, fontWeight:600 },
  hBarTrack: { width:"100%", height:8, background:"#0f172a", borderRadius:4, overflow:"hidden" },
  hBarFill:  { height:"100%", borderRadius:4, transition:"width 0.5s ease", minWidth:4 },
  th: { textAlign:"left", padding:"10px 14px", color:"#64748b", fontSize:12, fontWeight:600, borderBottom:"1px solid #334155" },
  td: { padding:"10px 14px", color:"#f1f5f9", fontSize:13, borderBottom:"1px solid #1e293b" },
};