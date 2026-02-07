import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { factureApi } from "../api/factureApi";
import { clientApi }  from "../api/clientApi";
import { produitApi } from "../api/produitApi";
import { Plus, Download, X} from "lucide-react";
import sharedStyles from "../sharedStyles";


const STATUTS = ["EN_ATTENTE", "PAYEE", "ANNULEE"];

export default function Factures() {
  const [factures,  setFactures]  = useState([]);
  const [clients,   setClients]   = useState([]);
  const [produits,  setProduits]  = useState([]);
  const [modal,     setModal]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [filterSt,  setFilterSt]  = useState("");

  const [form, setForm] = useState({
    clientId: "",
    lignes: [{ produitId: "", quantite: 1 }],
  });

  const fetchAll = () => {
    factureApi.getAll().then((r) => setFactures(r.data)).catch(() => {});
    clientApi.getAll().then((r)  => setClients(r.data)).catch(() => {});
    produitApi.getAll().then((r) => setProduits(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filterSt
    ? factures.filter((f) => f.statut === filterSt)
    : factures;

  const addLigne = () =>
    setForm({ ...form, lignes: [...form.lignes, { produitId: "", quantite: 1 }] });

  const removeLigne = (i) =>
    setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) });

  const updateLigne = (i, key, val) => {
    const lignes = [...form.lignes];
    lignes[i] = { ...lignes[i], [key]: val };
    setForm({ ...form, lignes });
  };

  const calcTotal = () => {
    const st = form.lignes.reduce((acc, l) => {
      const p = produits.find((p) => p.id === parseInt(l.produitId));
      return acc + (p ? p.prixVente * (l.quantite || 0) : 0);
    }, 0);
    return { sousTotal: st, tva: st * 0.18, total: st * 1.18 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientId) { toast.error("Sélectionnez un client"); return; }
    if (form.lignes.some((l) => !l.produitId)) {
      toast.error("Sélectionnez un produit pour chaque ligne");
      return;
    }
    setLoading(true);
    try {
      await factureApi.create({
        clientId: parseInt(form.clientId),
        lignes: form.lignes.map((l) => ({
          produitId: parseInt(l.produitId),
          quantite:  parseInt(l.quantite),
        })),
      });
      toast.success("Facture créée avec succès");
      setModal(false);
      setForm({ clientId: "", lignes: [{ produitId: "", quantite: 1 }] });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur création facture");
    } finally {
      setLoading(false);
    }
  };

  const handleStatut = async (id, statut) => {
    try {
      await factureApi.updateStatut(id, statut);
      toast.success("Statut mis à jour");
      fetchAll();
    } catch {
      toast.error("Erreur mise à jour statut");
    }
  };

  const handlePDF = async (id, numero) => {
    try {
      const res = await factureApi.downloadPDF(id);
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = `${numero}.pdf`;
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

  const { sousTotal, tva, total } = calcTotal();

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Factures</h1>
          <p style={s.pageSub}>{factures.length} facture(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal(true)}>
          <Plus size={16} /> Nouvelle facture
        </button>
      </div>

      {/* Filtre statut */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["", ...STATUTS].map((st) => (
          <button key={st} onClick={() => setFilterSt(st)}
            style={{
              ...s.filterBtn,
              background: filterSt === st ? "#f59e0b" : "#1e293b",
              color:      filterSt === st ? "#0f172a" : "#94a3b8",
            }}>
            {st || "Tous"}
          </button>
        ))}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["N° Facture","Date","Client","Sous-total","TVA","Total","Statut","Actions"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={s.empty}>Aucune facture</td></tr>
            ) : filtered.map((f) => {
              const { color, bg } = statutColor(f.statut);
              return (
                <tr key={f.id} style={s.tr}
                  onMouseEnter={(e) => e.currentTarget.style.background="#1e3a5f20"}
                  onMouseLeave={(e) => e.currentTarget.style.background="transparent"}
                >
                  <td style={s.td}><span style={s.badge}>{f.numeroFacture}</span></td>
                  <td style={s.td}>{f.dateFacture}</td>
                  <td style={s.td}>
                    {f.client?.prenom} {f.client?.nom}
                  </td>
                  <td style={s.td}>{f.sousTotal?.toLocaleString()} F</td>
                  <td style={s.td}>{(f.sousTotal*0.18)?.toLocaleString()} F</td>
                  <td style={{...s.td, fontWeight: 700, color: "#f59e0b"}}>
                    {f.total?.toLocaleString()} F
                  </td>
                  <td style={s.td}>
                    <select
                      value={f.statut}
                      onChange={(e) => handleStatut(f.id, e.target.value)}
                      style={{
                        background: bg, color,
                        border: `1px solid ${color}40`,
                        borderRadius: 6, padding: "4px 8px",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                      }}>
                      {STATUTS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnEdit}
                      onClick={() => handlePDF(f.id, f.numeroFacture)}
                      title="Télécharger PDF">
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal création facture */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={{...s.modal, maxWidth: 640}}
            onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Nouvelle facture</h2>
              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Client */}
              <div style={{...s.field, marginBottom: 20}}>
                <label style={s.label}>Client *</label>
                <select style={s.input} value={form.clientId}
                  onChange={(e) => setForm({...form, clientId: e.target.value})}>
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lignes */}
              <p style={{...s.label, marginBottom: 10}}>Lignes de facture</p>
              {form.lignes.map((ligne, i) => {
                const produit = produits.find(
                  (p) => p.id === parseInt(ligne.produitId));
                const stLigne = produit
                  ? produit.prixVente * ligne.quantite : 0;
                return (
                  <div key={i} style={styles.ligneRow}>
                    <select style={{...s.input, flex: 2}}
                      value={ligne.produitId}
                      onChange={(e) => updateLigne(i, "produitId", e.target.value)}>
                      <option value="">-- Produit --</option>
                      {produits.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom} ({p.quantiteStock} en stock)
                        </option>
                      ))}
                    </select>
                    <input style={{...s.input, flex: 1, width: 80}}
                      type="number" min="1" value={ligne.quantite}
                      onChange={(e) => updateLigne(i, "quantite", e.target.value)} />
                    <span style={styles.ligneTotal}>
                      {stLigne.toLocaleString()} F
                    </span>
                    {form.lignes.length > 1 && (
                      <button type="button" style={s.btnDel}
                        onClick={() => removeLigne(i)}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}

              <button type="button" onClick={addLigne}
                style={{...s.btnCancel, marginTop: 8, fontSize: 13}}>
                + Ajouter une ligne
              </button>

              {/* Totaux */}
              <div style={styles.totalBox}>
                <div style={styles.totalRow}>
                  <span style={{color:"#94a3b8"}}>Sous-total HT</span>
                  <span>{sousTotal.toLocaleString()} F</span>
                </div>
                <div style={styles.totalRow}>
                  <span style={{color:"#94a3b8"}}>TVA 18%</span>
                  <span>{tva.toLocaleString()} F</span>
                </div>
                <div style={{...styles.totalRow, borderTop:"1px solid #334155",
                  paddingTop:10, marginTop:4}}>
                  <span style={{fontWeight:700, color:"#f1f5f9"}}>Total TTC</span>
                  <span style={{fontWeight:700, color:"#f59e0b", fontSize:18}}>
                    {total.toLocaleString()} F
                  </span>
                </div>
              </div>

              <div style={{...s.modalFooter, marginTop: 20}}>
                <button type="button" style={s.btnCancel}
                  onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? "Création..." : "Créer la facture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  ligneRow: {
    display: "flex", alignItems: "center",
    gap: 8, marginBottom: 8,
  },
  ligneTotal: {
    color: "#f59e0b", fontWeight: 600,
    minWidth: 100, textAlign: "right", fontSize: 13,
  },
  totalBox: {
    background: "#0f172a", borderRadius: 10,
    padding: "16px 20px", marginTop: 16,
    display: "flex", flexDirection: "column", gap: 8,
  },
  totalRow: {
    display: "flex", justifyContent: "space-between",
    color: "#f1f5f9", fontSize: 14,
  },
};

const s = sharedStyles();