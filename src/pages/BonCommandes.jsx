import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { bonCommandeApi } from "../api/bonCommandeApi";
import { fournisseurApi } from "../api/fournisseurApi";
import { produitApi }     from "../api/produitApi";
import { Plus, X, CheckCircle, XCircle } from "lucide-react";
import sharedStyles from "../sharedStyles";

const STATUTS = ["EN_COURS", "RECU", "ANNULE"];

export default function BonCommandes() {
  const [bons,         setBons]         = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [produits,     setProduits]     = useState([]);
  const [modal,        setModal]        = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [filterSt,     setFilterSt]     = useState("");

  const [form, setForm] = useState({
    fournisseur: { id: "" },
    lignes: [{ produit: { id: "" }, quantite: 1, prixUnitaire: "" }],
  });

  const fetchAll = () => {
    bonCommandeApi.getAll().then((r) => setBons(r.data)).catch(() => {});
    fournisseurApi.getAll().then((r) => setFournisseurs(r.data)).catch(() => {});
    produitApi.getAll().then((r)     => setProduits(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filterSt
    ? bons.filter((b) => b.statut === filterSt)
    : bons;

  const addLigne = () => setForm({
    ...form,
    lignes: [...form.lignes, { produit: { id: "" }, quantite: 1, prixUnitaire: "" }],
  });

  const removeLigne = (i) =>
    setForm({ ...form, lignes: form.lignes.filter((_, idx) => idx !== i) });

  const updateLigne = (i, key, val) => {
    const lignes = [...form.lignes];
    if (key === "produitId") {
      const p = produits.find((p) => p.id === parseInt(val));
      lignes[i] = {
        ...lignes[i],
        produit: { id: val },
        prixUnitaire: p ? p.prixAchat : "",
      };
    } else {
      lignes[i] = { ...lignes[i], [key]: val };
    }
    setForm({ ...form, lignes });
  };

  const calcTotal = () =>
    form.lignes.reduce((acc, l) =>
      acc + (parseFloat(l.prixUnitaire) || 0) * (parseInt(l.quantite) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fournisseur.id) {
      toast.error("Sélectionnez un fournisseur");
      return;
    }
    setLoading(true);
    try {
      await bonCommandeApi.create({
        fournisseur: { id: parseInt(form.fournisseur.id) },
        lignes: form.lignes.map((l) => ({
          produit:      { id: parseInt(l.produit.id) },
          quantite:     parseInt(l.quantite),
          prixUnitaire: parseFloat(l.prixUnitaire),
        })),
      });
      toast.success("Bon de commande créé");
      setModal(false);
      setForm({
        fournisseur: { id: "" },
        lignes: [{ produit: { id: "" }, quantite: 1, prixUnitaire: "" }],
      });
      fetchAll();
    } catch {
      toast.error("Erreur création bon");
    } finally {
      setLoading(false);
    }
  };

  const handleStatut = async (id, statut) => {
    const msg = statut === "RECU"
      ? "Marquer comme reçu ? Le stock sera mis à jour automatiquement."
      : `Changer le statut en ${statut} ?`;
    if (!window.confirm(msg)) return;
    try {
      await bonCommandeApi.updateStatut(id, statut);
      toast.success("Statut mis à jour");
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    }
  };

  const statutColor = (st) => ({
    RECU:     { color: "#10b981", bg: "#10b98120" },
    EN_COURS: { color: "#f59e0b", bg: "#f59e0b20" },
    ANNULE:   { color: "#ef4444", bg: "#ef444420" },
  }[st] || { color: "#64748b", bg: "#64748b20" });

  const s = sharedStyles();

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Bons de commande</h1>
          <p style={s.pageSub}>{bons.length} bon(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setModal(true)}>
          <Plus size={16} /> Nouveau bon
        </button>
      </div>

      {/* Filtres statut */}
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

      {/* Tableau */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["N° Bon","Date","Fournisseur","Total","Statut","Actions"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={s.empty}>Aucun bon de commande</td></tr>
            ) : filtered.map((b) => {
              const { color, bg } = statutColor(b.statut);
              return (
                <tr key={b.id} style={s.tr}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#1e3a5f20"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={s.td}><span style={s.badge}>{b.numeroBon}</span></td>
                  <td style={s.td}>{b.dateCommande}</td>
                  <td style={s.td}>{b.fournisseur?.nom}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#f59e0b" }}>
                    {b.total?.toLocaleString()} F
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.statusBadge, color, background: bg }}>
                      {b.statut}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      {b.statut === "EN_COURS" && (
                        <>
                          <button
                            style={{ ...s.btnEdit, color: "#10b981" }}
                            title="Marquer reçu"
                            onClick={() => handleStatut(b.id, "RECU")}>
                            <CheckCircle size={14} />
                          </button>
                          <button
                            style={s.btnDel}
                            title="Annuler"
                            onClick={() => handleStatut(b.id, "ANNULE")}>
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal création */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={{ ...s.modal, maxWidth: 620 }}
            onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Nouveau bon de commande</h2>
              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Fournisseur */}
              <div style={{ ...s.field, marginBottom: 20 }}>
                <label style={s.label}>Fournisseur *</label>
                <select style={s.input} value={form.fournisseur.id}
                  onChange={(e) =>
                    setForm({ ...form, fournisseur: { id: e.target.value } })}>
                  <option value="">-- Sélectionner --</option>
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>

              {/* Lignes */}
              <p style={{ ...s.label, marginBottom: 10 }}>Produits commandés</p>
              {form.lignes.map((l, i) => (
                <div key={i} style={{
                  display: "flex", gap: 8,
                  marginBottom: 8, alignItems: "center"
                }}>
                  <select style={{ ...s.input, flex: 2 }} value={l.produit.id}
                    onChange={(e) => updateLigne(i, "produitId", e.target.value)}>
                    <option value="">-- Produit --</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                  <input style={{ ...s.input, width: 70 }}
                    type="number" min="1" placeholder="Qté"
                    value={l.quantite}
                    onChange={(e) => updateLigne(i, "quantite", e.target.value)} />
                  <input style={{ ...s.input, width: 110 }}
                    type="number" placeholder="Prix unit."
                    value={l.prixUnitaire}
                    onChange={(e) => updateLigne(i, "prixUnitaire", e.target.value)} />
                  <span style={{
                    color: "#f59e0b", fontWeight: 600,
                    minWidth: 80, fontSize: 12, textAlign: "right"
                  }}>
                    {((parseFloat(l.prixUnitaire) || 0) *
                      (parseInt(l.quantite) || 0)).toLocaleString()} F
                  </span>
                  {form.lignes.length > 1 && (
                    <button type="button" style={s.btnDel}
                      onClick={() => removeLigne(i)}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}

              <button type="button" onClick={addLigne}
                style={{ ...s.btnCancel, marginTop: 8, fontSize: 13 }}>
                + Ajouter une ligne
              </button>

              {/* Total */}
              <div style={{
                background: "#0f172a", borderRadius: 10,
                padding: "12px 16px", marginTop: 16,
                display: "flex", justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ color: "#94a3b8" }}>Total commande</span>
                <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: 18 }}>
                  {calcTotal().toLocaleString()} F
                </span>
              </div>

              <div style={{ ...s.modalFooter, marginTop: 20 }}>
                <button type="button" style={s.btnCancel}
                  onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? "..." : "Créer le bon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}