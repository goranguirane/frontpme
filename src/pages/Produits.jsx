import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { produitApi } from "../api/produitApi";
import { fournisseurApi } from "../api/fournisseurApi";
import { Plus, Pencil, Trash2, Search, X, AlertTriangle } from "lucide-react";
import sharedStyles from "../sharedStyles";


const EMPTY = {
  nom: "", reference: "", description: "",
  prixAchat: "", prixVente: "", quantiteStock: "",
  seuilAlerte: "5",
  categorie: { id: "" },
  fournisseur: { id: "" },
};

export default function Produits() {
  const [produits,     setProduits]     = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [search,       setSearch]       = useState("");
  const [modal,        setModal]        = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [loading,      setLoading]      = useState(false);

  const fetchAll = () => {
    produitApi.getAll().then((r) => setProduits(r.data)).catch(() => {});
    fournisseurApi.getAll().then((r) => setFournisseurs(r.data)).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = produits.filter((p) =>
    `${p.nom} ${p.reference}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (p) => {
    setEditing(p.id);
    setForm({
      nom: p.nom, reference: p.reference, description: p.description || "",
      prixAchat: p.prixAchat, prixVente: p.prixVente,
      quantiteStock: p.quantiteStock, seuilAlerte: p.seuilAlerte,
      categorie: { id: "" },
      fournisseur: { id: p.fournisseur?.id || "" },
    });
    setModal(true);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // ✅ Nettoyage des données avant envoi
  const payload = {
    nom:           form.nom,
    reference:     form.reference || null,
    description:   form.description || null,
    prixAchat:     parseFloat(form.prixAchat)     || 0,
    prixVente:     parseFloat(form.prixVente)      || 0,
    quantiteStock: parseInt(form.quantiteStock)    || 0,
    seuilAlerte:   parseInt(form.seuilAlerte)      || 5,

    // ✅ null si pas sélectionné
    categorie:   null,
    fournisseur: form.fournisseur.id
      ? { id: parseInt(form.fournisseur.id) }
      : null,
  };

  console.log("Payload envoyé :", payload); // debug

  try {
    if (editing) {
      await produitApi.update(editing, payload);
      toast.success("Produit modifié");
    } else {
      await produitApi.create(payload);
      toast.success("Produit créé");
    }
    setModal(false);
    fetchAll();
  } catch (err) {
    // ✅ Affiche le vrai message d'erreur du backend
    const msg = err.response?.data?.message
      || err.response?.data
      || "Erreur lors de l'enregistrement";
    toast.error(String(msg));
    console.error("Erreur backend :", err.response?.data);
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await produitApi.delete(id);
      toast.success("Produit supprimé");
      fetchAll();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const getStatutBadge = (p) => {
    if (p.quantiteStock === 0)
      return { label: "Rupture", color: "#ef4444", bg: "#ef444420" };
    if (p.quantiteStock <= p.seuilAlerte)
      return { label: "Alerte", color: "#f97316", bg: "#f9731620" };
    return { label: "OK", color: "#10b981", bg: "#10b98120" };
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Produits</h1>
          <p style={s.pageSub}>{produits.length} produit(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={openCreate}>
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      <div style={s.searchWrap}>
        <Search size={16} color="#64748b" />
        <input style={s.searchInput} placeholder="Rechercher par nom, référence..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button style={s.clearBtn} onClick={() => setSearch("")}>
          <X size={14} /></button>}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Référence","Nom","Prix Achat","Prix Vente",
                "Stock","Seuil","Fournisseur","Statut","Actions"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={s.empty}>Aucun produit trouvé</td></tr>
            ) : filtered.map((p) => {
              const { label, color, bg } = getStatutBadge(p);
              return (
                <tr key={p.id} style={s.tr}
                  onMouseEnter={(e) => e.currentTarget.style.background="#1e3a5f20"}
                  onMouseLeave={(e) => e.currentTarget.style.background="transparent"}
                >
                  <td style={s.td}><span style={s.badge}>{p.reference}</span></td>
                  <td style={{...s.td, fontWeight: 600}}>{p.nom}</td>
                  <td style={s.td}>{p.prixAchat?.toLocaleString()} F</td>
                  <td style={s.td}>{p.prixVente?.toLocaleString()} F</td>
                  <td style={s.td}>{p.quantiteStock}</td>
                  <td style={s.td}>{p.seuilAlerte}</td>
                  <td style={s.td}>{p.fournisseur?.nom || "—"}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.statusBadge, color, background: bg
                    }}>
                      {label === "Alerte" && <AlertTriangle size={11} />}
                      {label}
                    </span>
                  </td>
                  <td style={s.td}>
                    <div style={s.actions}>
                      <button style={s.btnEdit} onClick={() => openEdit(p)}>
                        <Pencil size={14} />
                      </button>
                      <button style={s.btnDel} onClick={() => handleDelete(p.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={{...s.modal, maxWidth: 560}}
            onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editing ? "Modifier produit" : "Nouveau produit"}
              </h2>
              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.formGrid}>
              <div style={s.field}>
                <label style={s.label}>Nom *</label>
                <input style={s.input} value={form.nom} required
                  onChange={(e) => setForm({...form, nom: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Référence</label>
                <input style={s.input} value={form.reference}
                  onChange={(e) => setForm({...form, reference: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Prix Achat *</label>
                <input style={s.input} type="number" value={form.prixAchat} required
                  onChange={(e) => setForm({...form, prixAchat: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Prix Vente *</label>
                <input style={s.input} type="number" value={form.prixVente} required
                  onChange={(e) => setForm({...form, prixVente: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Stock initial</label>
                <input style={s.input} type="number" value={form.quantiteStock}
                  onChange={(e) => setForm({...form, quantiteStock: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Seuil alerte</label>
                <input style={s.input} type="number" value={form.seuilAlerte}
                  onChange={(e) => setForm({...form, seuilAlerte: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={{...s.field, gridColumn: "1 / -1"}}>
                <label style={s.label}>Fournisseur</label>
                <select style={s.input}
                  value={form.fournisseur.id}
                  onChange={(e) =>
                    setForm({...form, fournisseur: { id: e.target.value }})}>
                  <option value="">-- Sélectionner --</option>
                  {fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div style={{...s.field, gridColumn: "1 / -1"}}>
                <label style={s.label}>Description</label>
                <textarea style={{...s.input, resize: "vertical", minHeight: 70}}
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor="#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor="#334155"} />
              </div>
              <div style={{...s.modalFooter, gridColumn: "1 / -1"}}>
                <button type="button" style={s.btnCancel}
                  onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? "..." : "Enregistrer"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = sharedStyles();