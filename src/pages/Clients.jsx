import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { clientApi } from "../api/clientApi";
import { Plus, Pencil, Trash2, Search, X} from "lucide-react";
import sharedStyles from "../sharedStyles";


const EMPTY = {
  nom: "", prenom: "", email: "",
  tel: "", adresse: "", ville: "",
};

export default function Clients() {
  const [clients,    setClients]    = useState([]);
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [loading,    setLoading]    = useState(false);

  const fetchAll = () =>
    clientApi.getAll().then((r) => setClients(r.data)).catch(() => {});

  useEffect(() => { fetchAll(); }, []);

  const filtered = clients.filter((c) =>
    `${c.nom} ${c.prenom} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (c)  => {
    setEditing(c.id);
    setForm({ nom: c.nom, prenom: c.prenom, email: c.email,
              tel: c.tel, adresse: c.adresse, ville: c.ville });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await clientApi.update(editing, form);
        toast.success("Client modifié");
      } else {
        await clientApi.create(form);
        toast.success("Client créé");
      }
      setModal(false);
      fetchAll();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce client ?")) return;
    try {
      await clientApi.delete(id);
      toast.success("Client supprimé");
      fetchAll();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Clients</h1>
          <p style={s.pageSub}>{clients.length} client(s) enregistré(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={openCreate}>
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <div style={s.searchWrap}>
        <Search size={16} color="#64748b" />
        <input
          style={s.searchInput}
          placeholder="Rechercher par nom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button style={s.clearBtn} onClick={() => setSearch("")}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["N° Client","Nom","Prénom","Email","Tél","Ville","Actions"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={s.empty}>Aucun client trouvé</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} style={s.tr}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1e3a5f20"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={s.td}>
                  <span style={s.badge}>{c.numeroClient}</span>
                </td>
                <td style={s.td}>{c.nom}</td>
                <td style={s.td}>{c.prenom}</td>
                <td style={s.td}>{c.email}</td>
                <td style={s.td}>{c.tel}</td>
                <td style={s.td}>{c.ville}</td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnEdit} onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </button>
                    <button style={s.btnDel} onClick={() => handleDelete(c.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editing ? "Modifier le client" : "Nouveau client"}
              </h2>
              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={s.formGrid}>
              {[
                { key: "nom",     label: "Nom *",      required: true  },
                { key: "prenom",  label: "Prénom",      required: false },
                { key: "email",   label: "Email",       required: false },
                { key: "tel",     label: "Téléphone",   required: false },
                { key: "ville",   label: "Ville",       required: false },
                { key: "adresse", label: "Adresse",     required: false },
              ].map(({ key, label, required }) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>{label}</label>
                  <input
                    style={s.input}
                    value={form[key]}
                    required={required}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onFocus={(e)  => e.target.style.borderColor = "#f59e0b"}
                    onBlur={(e)   => e.target.style.borderColor = "#334155"}
                  />
                </div>
              ))}
              <div style={s.modalFooter}>
                <button type="button" style={s.btnCancel}
                  onClick={() => setModal(false)}>
                  Annuler
                </button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = sharedStyles();