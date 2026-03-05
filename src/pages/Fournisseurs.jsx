import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fournisseurApi } from "../api/fournisseurApi";
import { Plus, Pencil, Trash2, Search, X} from "lucide-react";
import sharedStyles from "../sharedStyles";


const EMPTY = { nom: "", email: "", tel: "", adresse: "" };

export default function Fournisseurs() {
  const [items,   setItems]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const fetchAll = () =>
    fournisseurApi.getAll().then((r) => setItems(r.data)).catch(() => {});

  useEffect(() => { fetchAll(); }, []);

  const filtered = items.filter((f) =>
    `${f.nom} ${f.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (f)  => {
    setEditing(f.id);
    setForm({ nom: f.nom, email: f.email, tel: f.tel, adresse: f.adresse });
    setModal(true);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // ✅ Nettoyage des données
  const payload = {
    nom:     form.nom.trim(),
    email:   form.email.trim()   || null,
    tel:     form.tel.trim()     || null,
    adresse: form.adresse.trim() || null,
  };

  console.log("Payload envoyé :", payload); // debug

  try {
    if (editing) {
      await fournisseurApi.update(editing, payload);
      toast.success("Fournisseur modifié");
    } else {
      await fournisseurApi.create(payload);
      toast.success("Fournisseur créé");
    }
    setModal(false);
    fetchAll();
  } catch (err) {
    // ✅ Affiche le vrai message d'erreur backend
    const msg = err.response?.data?.message
      || err.response?.data
      || err.message
      || "Erreur lors de l'enregistrement";
    toast.error(String(msg));
    console.error("Erreur complète :", err.response?.data);
  } finally {
    setLoading(false);
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce fournisseur ?")) return;
    try {
      await fournisseurApi.delete(id);
      toast.success("Fournisseur supprimé");
      fetchAll();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Fournisseurs</h1>
          <p style={s.pageSub}>{items.length} fournisseur(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={openCreate}>
          <Plus size={16} /> Nouveau fournisseur
        </button>
      </div>

      <div style={s.searchWrap}>
        <Search size={16} color="#64748b" />
        <input style={s.searchInput} placeholder="Rechercher..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        {search && <button style={s.clearBtn} onClick={() => setSearch("")}>
          <X size={14} /></button>}
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["Nom","Email","Téléphone","Adresse","Actions"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={s.empty}>Aucun fournisseur trouvé</td></tr>
            ) : filtered.map((f) => (
              <tr key={f.id} style={s.tr}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1e3a5f20"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{...s.td, fontWeight: 600}}>{f.nom}</td>
                <td style={s.td}>{f.email}</td>
                <td style={s.td}>{f.tel}</td>
                <td style={s.td}>{f.adresse}</td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnEdit} onClick={() => openEdit(f)}>
                      <Pencil size={14} />
                    </button>
                    <button style={s.btnDel} onClick={() => handleDelete(f.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editing ? "Modifier fournisseur" : "Nouveau fournisseur"}
              </h2>
              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.formGrid}>
              {[
                { key: "nom",     label: "Nom *",       required: true  },
                { key: "email",   label: "Email",        required: false },
                { key: "tel",     label: "Téléphone",    required: false },
                { key: "adresse", label: "Adresse",      required: false },
              ].map(({ key, label, required }) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>{label}</label>
                  <input style={s.input} value={form[key]} required={required}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                    onBlur={(e)  => e.target.style.borderColor = "#334155"} />
                </div>
              ))}
              <div style={s.modalFooter}>
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