import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api/axios";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import sharedStyles from "../sharedStyles";

const EMPTY = { username: "", password: "", role: "ROLE_VENDEUR" };

export default function Utilisateurs() {
  const [users,   setUsers]   = useState([]);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const s = sharedStyles();

  const fetchAll = () =>
    api.get("/users").then((r) => setUsers(r.data)).catch(() => {});

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit   = (u) => {
    setEditing(u.id);
    setForm({ username: u.username, password: "", role: u.role });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/users/${editing}`, form);
        toast.success("Utilisateur modifié");
      } else {
        await api.post("/users", form);
        toast.success("Utilisateur créé");
      }
      setModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Utilisateur supprimé");
      fetchAll();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Utilisateurs</h1>
          <p style={s.pageSub}>{users.length} utilisateur(s)</p>
        </div>
        <button style={s.btnPrimary} onClick={openCreate}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              {["ID","Username","Rôle","Actions"].map((h) => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={s.tr}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1e3a5f20"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={s.td}>{u.id}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>{u.username}</td>
                <td style={s.td}>
                  <span style={{
                    ...s.statusBadge,
                    background: u.role === "ROLE_ADMIN" ? "#f59e0b20" : "#3b82f620",
                    color:      u.role === "ROLE_ADMIN" ? "#f59e0b"   : "#3b82f6",
                  }}>
                    {u.role === "ROLE_ADMIN" ? "👑 Admin" : "🧑‍💼 Vendeur"}
                  </span>
                </td>
                <td style={s.td}>
                  <div style={s.actions}>
                    <button style={s.btnEdit} onClick={() => openEdit(u)}>
                      <Pencil size={14} />
                    </button>
                    <button style={s.btnDel} onClick={() => handleDelete(u.id)}>
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
                {editing ? "Modifier utilisateur" : "Nouvel utilisateur"}
              </h2>
              <button style={s.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={s.field}>
                <label style={s.label}>Username *</label>
                <input style={s.input} required value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor = "#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>
                  Mot de passe {editing ? "(laisser vide = inchangé)" : "*"}
                </label>
                <input style={s.input} type="password"
                  required={!editing} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onFocus={(e) => e.target.style.borderColor = "#f59e0b"}
                  onBlur={(e)  => e.target.style.borderColor = "#334155"} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Rôle *</label>
                <select style={s.input} value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="ROLE_ADMIN">👑 Administrateur</option>
                  <option value="ROLE_VENDEUR">🧑‍💼 Vendeur</option>
                </select>
              </div>
              <div style={s.modalFooter}>
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