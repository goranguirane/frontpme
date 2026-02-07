import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { stockApi } from "../api/stockApi";
import sharedStyles from "../sharedStyles";

import { AlertTriangle, Settings } from "lucide-react";

export default function Stock() {
  const [alertes,    setAlertes]    = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [counts,     setCounts]     = useState({ alertes: 0, ruptures: 0 });
  const [tab,        setTab]        = useState("alertes");
  const [ajustModal, setAjustModal] = useState(false);
  const [ajustForm,  setAjustForm]  = useState({ id:"", quantite:"", motif:"" });
  const [produitNom, setProduitNom] = useState("");

  const fetchAll = () => {
    stockApi.getAlertes().then((r)   => setAlertes(r.data)).catch(() => {});
    stockApi.getMouvements().then((r) => setMouvements(r.data)).catch(() => {});
    stockApi.countAlertes().then((r)  => setCounts(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAjust = async (e) => {
    e.preventDefault();
    try {
      await stockApi.ajusterStock(
        ajustForm.id, ajustForm.quantite, ajustForm.motif || "Ajustement");
      toast.success("Stock ajusté");
      setAjustModal(false);
      fetchAll();
    } catch {
      toast.error("Erreur ajustement");
    }
  };

  const niveauColor = (n) => ({
    RUPTURE:  { color: "#ef4444", bg: "#ef444420" },
    CRITIQUE: { color: "#f97316", bg: "#f9731620" },
    FAIBLE:   { color: "#f59e0b", bg: "#f59e0b20" },
  }[n] || { color: "#10b981", bg: "#10b98120" });

  const typeColor = (t) => ({
    ENTREE:     "#10b981",
    SORTIE:     "#ef4444",
    AJUSTEMENT: "#f59e0b",
  }[t] || "#64748b");

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Stock & Alertes</h1>
          <p style={s.pageSub}>Suivi en temps réel</p>
        </div>
      </div>

      {/* Compteurs */}
      <div style={{ display:"flex", gap:16, marginBottom:28 }}>
        <div style={stk.countCard}>
          <AlertTriangle size={20} color="#f97316" />
          <div>
            <p style={stk.countVal}>{counts.alertes}</p>
            <p style={stk.countLbl}>En alerte</p>
          </div>
        </div>
        <div style={{...stk.countCard, borderColor:"#ef444440"}}>
          <AlertTriangle size={20} color="#ef4444" />
          <div>
            <p style={stk.countVal}>{counts.ruptures}</p>
            <p style={stk.countLbl}>En rupture</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20 }}>
        {[
          { key:"alertes",    label:"Produits en alerte" },
          { key:"mouvements", label:"Historique mouvements" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              ...s.filterBtn,
              background: tab===key ? "#f59e0b" : "#1e293b",
              color:      tab===key ? "#0f172a" : "#94a3b8",
            }}>{label}</button>
        ))}
      </div>

      {/* Tab alertes */}
      {tab === "alertes" && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Référence","Produit","Catégorie","Fournisseur",
                  "Stock","Seuil","Manquant","Niveau","Action"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alertes.length === 0 ? (
                <tr><td colSpan={9} style={s.empty}>
                  ✅ Aucune alerte de stock</td></tr>
              ) : alertes.map((a) => {
                const { color, bg } = niveauColor(a.niveau);
                return (
                  <tr key={a.produitId} style={s.tr}
                    onMouseEnter={(e)=>e.currentTarget.style.background="#1e3a5f20"}
                    onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
                  >
                    <td style={s.td}><span style={s.badge}>{a.reference}</span></td>
                    <td style={{...s.td, fontWeight:600}}>{a.nom}</td>
                    <td style={s.td}>{a.categorie}</td>
                    <td style={s.td}>{a.fournisseur}</td>
                    <td style={{...s.td, color: "#ef4444", fontWeight:700}}>
                      {a.quantiteStock}
                    </td>
                    <td style={s.td}>{a.seuilAlerte}</td>
                    <td style={{...s.td, color:"#f97316", fontWeight:600}}>
                      {a.manquant}
                    </td>
                    <td style={s.td}>
                      <span style={{...s.statusBadge, color, background:bg}}>
                        {a.niveau}
                      </span>
                    </td>
                    <td style={s.td}>
                      <button style={s.btnEdit}
                        title="Ajuster le stock"
                        onClick={() => {
                          setAjustForm({
                            id: a.produitId,
                            quantite: "",
                            motif: "",
                          });
                          setProduitNom(a.nom);
                          setAjustModal(true);
                        }}>
                        <Settings size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab mouvements */}
      {tab === "mouvements" && (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Date","Produit","Type","Quantité","Motif"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mouvements.length === 0 ? (
                <tr><td colSpan={5} style={s.empty}>Aucun mouvement</td></tr>
              ) : mouvements.slice().reverse().map((m) => (
                <tr key={m.id} style={s.tr}
                  onMouseEnter={(e)=>e.currentTarget.style.background="#1e3a5f20"}
                  onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
                >
                  <td style={s.td}>
                    {new Date(m.dateMouvement).toLocaleString("fr-FR")}
                  </td>
                  <td style={s.td}>{m.produit?.nom}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.statusBadge,
                      color:      typeColor(m.type),
                      background: typeColor(m.type) + "20",
                    }}>{m.type}</span>
                  </td>
                  <td style={{...s.td, fontWeight:600}}>{m.quantite}</td>
                  <td style={{...s.td, color:"#64748b"}}>{m.motif}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal ajustement */}
      {ajustModal && (
        <div style={s.overlay} onClick={() => setAjustModal(false)}>
          <div style={{...s.modal, maxWidth: 400}}
            onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Ajuster le stock</h2>
            </div>
            <p style={{color:"#f59e0b", marginBottom:16, fontWeight:600}}>
              {produitNom}
            </p>
            <form onSubmit={handleAjust} style={{display:"flex",flexDirection:"column",gap:16}}>
              <div style={s.field}>
                <label style={s.label}>Nouvelle quantité *</label>
                <input style={s.input} type="number" min="0" required
                  value={ajustForm.quantite}
                  onChange={(e) => setAjustForm({...ajustForm, quantite:e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Motif</label>
                <input style={s.input} placeholder="Ex: Inventaire physique"
                  value={ajustForm.motif}
                  onChange={(e) => setAjustForm({...ajustForm, motif:e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={s.modalFooter}>
                <button type="button" style={s.btnCancel}
                  onClick={() => setAjustModal(false)}>Annuler</button>
                <button type="submit" style={s.btnPrimary}>Ajuster</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const stk = {
  countCard: {
    background:"#1e293b", border:"1px solid #f9731640",
    borderRadius:12, padding:"16px 20px",
    display:"flex", alignItems:"center", gap:14,
  },
  countVal: { fontSize:28, fontWeight:700, color:"#f1f5f9", margin:0 },
  countLbl: { color:"#64748b", fontSize:12, margin:0 },
};

const s = sharedStyles();