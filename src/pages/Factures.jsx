// ─── pages/Factures.jsx ───────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { factureApi } from "../api/factureApi";
import { clientApi  } from "../api/clientApi";
import { produitApi } from "../api/produitApi";
import { Plus, Download, Printer, Trash2, X, Search } from "lucide-react";
import sharedStyles from "../sharedStyles";
import Pagination from "../components/Pagination";
import usePagination from "../hooks/usePagination";
import { useConfirm } from "../components/ConfirmModal";
import { useAuth } from "../context/AuthContext";

const STATUTS = ["EN_ATTENTE", "PAYEE", "ANNULEE"];

export default function Factures() {
  const [factures, setFactures] = useState([]);
  const [clients,  setClients]  = useState([]);
  const [produits, setProduits] = useState([]);
  const [modal,    setModal]    = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [filterSt, setFilterSt] = useState("");
  const [search,   setSearch]   = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin,   setDateFin]   = useState("");

  const { user } = useAuth();
  const isAdmin  = user?.role === "ROLE_ADMIN";
  const { confirm, ConfirmModal } = useConfirm();

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

  const filtered = factures.filter((f) => {
    const matchStatut = !filterSt || f.statut === filterSt;
    const matchSearch = !search   ||
      f.numeroFacture?.toLowerCase().includes(search.toLowerCase()) ||
      `${f.client?.prenom} ${f.client?.nom}`
        .toLowerCase().includes(search.toLowerCase());
    const matchDebut  = !dateDebut || f.dateFacture >= dateDebut;
    const matchFin    = !dateFin   || f.dateFacture <= dateFin;
    return matchStatut && matchSearch && matchDebut && matchFin;
  });

  const { page, setPage, paginated, totalPages, total } =
    usePagination(filtered, 15);

  const addLigne = () =>
    setForm({ ...form, lignes: [...form.lignes, { produitId: "", quantite: 1 }] });

  const removeLigne = (i) =>
    setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) });

  const updateLigne = (i, key, val) => {
    const lignes = [...form.lignes];
    lignes[i] = { ...lignes[i], [key]: val };
    setForm({ ...form, lignes });
  };

  const calcTotal = () =>
    form.lignes.reduce((acc, l) => {
      const p = produits.find((p) => p.id === parseInt(l.produitId));
      return acc + (p ? p.prixVente * (l.quantite || 0) : 0);
    }, 0);

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

  const handleDelete = async (facture) => {
    const ok = await confirm({
      title:   "Supprimer cette facture ?",
      message: `${facture.numeroFacture} — ${facture.client?.prenom} ${facture.client?.nom} sera supprimée définitivement.`,
      danger:  true,
    });
    if (!ok) return;
    try {
      await factureApi.delete(facture.id);
      toast.success("Facture supprimée");
      fetchAll();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const handlePDF = async (id, numero) => {
    try {
      const res = await factureApi.downloadPDF(id);
      const url = URL.createObjectURL(res.data);
      const a   = document.createElement("a");
      a.href = url; a.download = `${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur téléchargement PDF");
    }
  };

  // ✅ Impression directe dans le navigateur
  const handlePrint = async (id) => {
    try {
      const res = await factureApi.downloadPDF(id);
      const url = URL.createObjectURL(res.data);
      const win = window.open(url, "_blank");
      win.addEventListener("load", () => { win.focus(); win.print(); });
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      toast.error("Erreur impression");
    }
  };

  const statutColor = (st) => ({
    PAYEE:      { color: "#10b981", bg: "#10b98120" },
    EN_ATTENTE: { color: "#f59e0b", bg: "#f59e0b20" },
    ANNULEE:    { color: "#ef4444", bg: "#ef444420" },
  }[st] || { color: "#64748b", bg: "#64748b20" });

  const totalForm = calcTotal();
  const s = sharedStyles();

  return (
    <div>
      <ConfirmModal />

      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Factures</h1>
          <p style={s.pageSub}>{factures.length} facture(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal(true)}>
          <Plus size={16} /> Nouvelle facture
        </button>
      </div>

      {/* Filtres statut */}
      <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
        {["", ...STATUTS].map((st) => (
          <button key={st} onClick={() => { setFilterSt(st); setPage(1); }}
            style={{
              background: filterSt === st ? "#f59e0b" : "#1e293b",
              color:      filterSt === st ? "#0f172a" : "#94a3b8",
              border: "1px solid #334155", borderRadius: 8,
              padding: "6px 14px", fontSize: 12,
              fontWeight: 600, cursor: "pointer",
            }}>
            {st || "Tous"}
          </button>
        ))}
      </div>

      {/* Recherche + filtre dates */}
      <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ ...s.searchWrap, flex:1, minWidth:200 }}>
          <Search size={14} color="#64748b" />
          <input style={s.searchInput}
            placeholder="N° facture ou nom client..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          {search && (
            <button style={s.clearBtn} onClick={() => setSearch("")}>
              <X size={13} />
            </button>
          )}
        </div>

        {/* ✅ Filtres date */}
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:"#64748b", fontSize:12 }}>Du</span>
          <input type="date" value={dateDebut}
            onChange={(e) => { setDateDebut(e.target.value); setPage(1); }}
            style={loc.dateInput} />
          <span style={{ color:"#64748b", fontSize:12 }}>Au</span>
          <input type="date" value={dateFin}
            onChange={(e) => { setDateFin(e.target.value); setPage(1); }}
            style={loc.dateInput} />
          {(dateDebut || dateFin) && (
            <button style={{ ...s.clearBtn, padding:"4px 8px" }}
              onClick={() => { setDateDebut(""); setDateFin(""); setPage(1); }}>
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Tableau */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["N° Facture","Date","Client","Total","Statut","Actions"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} style={s.empty}>Aucune facture trouvée</td></tr>
            ) : paginated.map((f) => {
              const { color, bg } = statutColor(f.statut);
              return (
                <tr key={f.id} style={s.tr}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1e3a5f20"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={s.td}><span style={s.badge}>{f.numeroFacture}</span></td>
                  <td style={s.td}>{f.dateFacture}</td>
                  <td style={s.td}>{f.client?.prenom} {f.client?.nom}</td>
                  <td style={{ ...s.td, fontWeight:700, color:"#f59e0b" }}>
                    {f.sousTotal?.toLocaleString()} F
                  </td>
                  <td style={s.td}>
                    <select value={f.statut}
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
                    <div style={s.actions}>
                      {/* ✅ Imprimer */}
                      <button style={{ ...s.btnEdit, color:"#10b981" }}
                        title="Imprimer" onClick={() => handlePrint(f.id)}>
                        <Printer size={14} />
                      </button>
                      {/* Télécharger */}
                      <button style={s.btnEdit}
                        title="Télécharger PDF"
                        onClick={() => handlePDF(f.id, f.numeroFacture)}>
                        <Download size={14} />
                      </button>
                      {/* Supprimer ADMIN */}
                      {isAdmin && (
                        <button style={s.btnDel}
                          title="Supprimer"
                          onClick={() => handleDelete(f)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages}
          onChange={setPage} total={total} />
      </div>

      {/* Modal création */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={{ ...s.modal, maxWidth:640 }}
            onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Nouvelle facture</h2>
              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ ...s.field, marginBottom:20 }}>
                <label style={s.label}>Client *</label>
                <select style={s.input} value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                  <option value="">-- Sélectionner un client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom}
                    </option>
                  ))}
                </select>
              </div>

              <p style={{ ...s.label, marginBottom:10 }}>Produits</p>
              {form.lignes.map((ligne, i) => {
                const produit = produits.find((p) => p.id === parseInt(ligne.produitId));
                const stLigne = produit ? produit.prixVente * (ligne.quantite || 0) : 0;
                return (
                  <div key={i} style={loc.ligneRow}>
                    <select style={{ ...s.input, flex:2 }} value={ligne.produitId}
                      onChange={(e) => updateLigne(i, "produitId", e.target.value)}>
                      <option value="">-- Produit --</option>
                      {produits.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom} — {p.prixVente?.toLocaleString()} F ({p.quantiteStock} en stock)
                        </option>
                      ))}
                    </select>
                    <input style={{ ...s.input, width:80 }}
                      type="number" min="1" value={ligne.quantite}
                      onChange={(e) => updateLigne(i, "quantite", e.target.value)} />
                    <span style={loc.ligneTotal}>{stLigne.toLocaleString()} F</span>
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
                style={{ ...s.btnCancel, marginTop:8, fontSize:13 }}>
                + Ajouter une ligne
              </button>

              <div style={loc.totalBox}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:700, color:"#f1f5f9", fontSize:15 }}>Total</span>
                  <span style={{ fontWeight:700, color:"#f59e0b", fontSize:20 }}>
                    {totalForm.toLocaleString()} F
                  </span>
                </div>
              </div>

              <div style={{ ...s.modalFooter, marginTop:20 }}>
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

const loc = {
  dateInput: {
    background:"#1e293b", border:"1px solid #334155",
    borderRadius:8, padding:"7px 10px",
    color:"#f1f5f9", fontSize:12, outline:"none",
  },
  ligneRow: { display:"flex", alignItems:"center", gap:8, marginBottom:8 },
  ligneTotal: { color:"#f59e0b", fontWeight:600, minWidth:110, textAlign:"right", fontSize:13 },
  totalBox: { background:"#0f172a", borderRadius:10, padding:"16px 20px", marginTop:16 },
};