// ─── pages/Clients.jsx ────────────────────────────────────────────────────────
// Avec pagination, modal confirmation, bouton historique

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clientApi } from "../api/clientApi";
import { Plus, Pencil, Trash2, Search, X, History } from "lucide-react";
import sharedStyles from "../sharedStyles";
import Pagination from "../components/Pagination";
import usePagination from "../hooks/usePagination";
import { useConfirm } from "../components/ConfirmModal";

const EMPTY = {
  nom: "", prenom: "", email: "",
  tel: "", adresse: "", ville: "",
};

export default function Clients() {
  const [clients,  setClients]  = useState([]);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [loading,  setLoading]  = useState(false);
  const navigate   = useNavigate();
  const { confirm, ConfirmModal } = useConfirm();
  const s = sharedStyles();

  const fetchAll = () =>
    clientApi.getAll().then((r) => setClients(r.data)).catch(() => {});

  useEffect(() => { fetchAll(); }, []);

  const filtered = clients.filter((c) =>
    `${c.nom} ${c.prenom} ${c.email} ${c.numeroClient}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const { page, setPage, paginated, totalPages, total } =
    usePagination(filtered, 15);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (c) => {
    setEditing(c.id);
    setForm({ nom: c.nom, prenom: c.prenom || "", email: c.email || "",
              tel: c.tel || "", adresse: c.adresse || "", ville: c.ville || "" });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      nom:     form.nom.trim(),
      prenom:  form.prenom.trim()  || null,
      email:   form.email.trim()   || null,
      tel:     form.tel.trim()     || null,
      adresse: form.adresse.trim() || null,
      ville:   form.ville.trim()   || null,
    };
    try {
      editing
        ? await clientApi.update(editing, payload)
        : await clientApi.create(payload);
      toast.success(editing ? "Client modifié" : "Client créé");
      setModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (client) => {
    const ok = await confirm({
      title:   "Supprimer ce client ?",
      message: `${client.prenom || ""} ${client.nom} (${client.numeroClient}) sera supprimé définitivement.`,
      danger:  true,
    });
    if (!ok) return;
    try {
      await clientApi.delete(client.id);
      toast.success("Client supprimé");
      fetchAll();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  return (
    <div>
      <ConfirmModal />

      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Clients</h1>
          <p style={s.pageSub}>{clients.length} client(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={openCreate}>
          <Plus size={16} /> Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <div style={s.searchWrap}>
        <Search size={16} color="#64748b" />
        <input style={s.searchInput}
          placeholder="Rechercher par nom, prénom, email, N°..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        {search && (
          <button style={s.clearBtn} onClick={() => { setSearch(""); setPage(1); }}>
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tableau + pagination */}
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
            {paginated.length === 0 ? (
              <tr><td colSpan={7} style={s.empty}>Aucun client trouvé</td></tr>
            ) : paginated.map((c) => (
              <tr key={c.id} style={s.tr}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1e3a5f20"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={s.td}><span style={s.badge}>{c.numeroClient}</span></td>
                <td style={{ ...s.td, fontWeight: 600 }}>{c.nom}</td>
                <td style={s.td}>{c.prenom}</td>
                <td style={s.td}>{c.email}</td>
                <td style={s.td}>{c.tel}</td>
                <td style={s.td}>{c.ville}</td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={{ ...s.btnEdit, color: "#10b981" }}
                      title="Historique factures"
                      onClick={() => navigate(`/clients/${c.id}/historique`)}>
                      <History size={14} />
                    </button>
                    <button style={s.btnEdit}
                      title="Modifier"
                      onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </button>
                    <button style={s.btnDel}
                      title="Supprimer"
                      onClick={() => handleDelete(c)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages}
          onChange={setPage} total={total} />
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
                { key: "nom",     label: "Nom *",     required: true  },
                { key: "prenom",  label: "Prénom",     required: false },
                { key: "email",   label: "Email",      required: false },
                { key: "tel",     label: "Téléphone",  required: false },
                { key: "ville",   label: "Ville",      required: false },
                { key: "adresse", label: "Adresse",    required: false },
              ].map(({ key, label, required }) => (
                <div key={key} style={s.field}>
                  <label style={s.label}>{label}</label>
                  <input style={s.input} value={form[key]}
                    required={required}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                    onBlur={(e)  => e.target.style.borderColor = "#334155"} />
                </div>
              ))}
              <div style={{ ...s.modalFooter, gridColumn: "1 / -1" }}>
                <button type="button" style={s.btnCancel}
                  onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" style={s.btnPrimary} disabled={loading}>
                  {loading ? "..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}