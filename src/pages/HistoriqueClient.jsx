// ─── pages/HistoriqueClient.jsx ───────────────────────────────────────────────
// Affiche les factures d'un client + total cumulé
// Route : /clients/:id/historique

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Download, TrendingUp, FileText } from "lucide-react";
import api from "../api/axios";
import { factureApi } from "../api/factureApi";
import sharedStyles from "../sharedStyles";

export default function HistoriqueClient() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [client,     setClient]   = useState(null);
  const [factures,   setFactures] = useState([]);
  const s = sharedStyles();

  useEffect(() => {
    api.get(`/clients/${id}`).then((r) => setClient(r.data)).catch(() => {});
    api.get(`/factures/client/${id}`).then((r) => setFactures(r.data)).catch(() => {});
  }, [id]);

  const totalCumule = factures
    .filter((f) => f.statut === "PAYEE")
    .reduce((acc, f) => acc + (f.total || 0), 0);

  const nbPayees    = factures.filter((f) => f.statut === "PAYEE").length;
  const nbAttente   = factures.filter((f) => f.statut === "EN_ATTENTE").length;
  const nbAnnulees  = factures.filter((f) => f.statut === "ANNULEE").length;

  const handlePDF = async (facture) => {
    try {
      const res = await factureApi.downloadPDF(facture.id);
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${facture.numeroFacture}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur téléchargement PDF");
    }
  };

  const statutColor = (st) => ({
    PAYEE:      { color: "#10b981", bg: "#10b98120" },
    EN_ATTENTE: { color: "#f59e0b", bg: "#f59e0b20" },
    ANNULEE:    { color: "#ef4444", bg: "#ef444420" },
  }[st] || { color: "#64748b", bg: "#64748b20" });

  if (!client) return (
    <div style={{ color: "#64748b", padding: 40 }}>Chargement...</div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <button
          style={{ ...s.btnCancel, display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => navigate("/clients")}
        >
          <ArrowLeft size={15} /> Retour
        </button>
        <div>
          <h1 style={s.pageTitle}>
            {client.prenom} {client.nom}
          </h1>
          <p style={s.pageSub}>
            {client.numeroClient} — {client.tel || "—"} — {client.ville || "—"}
          </p>
        </div>
      </div>

      {/* Statistiques client */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total cumulé (payé)", value: `${totalCumule.toLocaleString()} F`, color: "#10b981", icon: TrendingUp },
          { label: "Factures payées",     value: nbPayees,   color: "#10b981", icon: FileText },
          { label: "En attente",          value: nbAttente,  color: "#f59e0b", icon: FileText },
          { label: "Annulées",            value: nbAnnulees, color: "#ef4444", icon: FileText },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: color + "20", width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 20, margin: 0 }}>{value}</p>
              <p style={{ color: "#64748b", fontSize: 11, margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tableau factures */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["N° Facture", "Date", "Total", "Statut", "PDF"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {factures.length === 0 ? (
              <tr><td colSpan={5} style={s.empty}>Aucune facture pour ce client</td></tr>
            ) : factures.map((f) => {
              const { color, bg } = statutColor(f.statut);
              return (
                <tr key={f.id} style={s.tr}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1e3a5f20"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={s.td}><span style={s.badge}>{f.numeroFacture}</span></td>
                  <td style={s.td}>{f.dateFacture}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#f59e0b" }}>
                    {f.total?.toLocaleString()} F
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.statusBadge, color, background: bg }}>
                      {f.statut}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnEdit} onClick={() => handlePDF(f)}>
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}