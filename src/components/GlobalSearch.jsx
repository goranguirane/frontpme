// ─── GlobalSearch.jsx ─────────────────────────────────────────────────────────
// Recherche globale dans clients, produits et factures
// À placer dans Layout.jsx dans le header

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Users, Package, FileText } from "lucide-react";
import api from "../api/axios";

export default function GlobalSearch() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState({ clients: [], produits: [], factures: [] });
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate  = useNavigate();
  const ref       = useRef(null);
  const timerRef  = useRef(null);

  // Fermer si clic en dehors
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Recherche avec debounce 400ms
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.trim().length < 2) {
      setResults({ clients: [], produits: [], factures: [] });
      setOpen(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const [c, p, f] = await Promise.all([
          api.get(`/clients/recherche?nom=${query}`).catch(() => ({ data: [] })),
          api.get(`/produits/recherche?nom=${query}`).catch(() => ({ data: [] })),
          api.get("/factures").catch(() => ({ data: [] })),
        ]);

        // Filtrer factures par numéro ou nom client
        const facturesFiltrees = (f.data || []).filter((fac) =>
          fac.numeroFacture?.toLowerCase().includes(query.toLowerCase()) ||
          `${fac.client?.prenom} ${fac.client?.nom}`
            .toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        setResults({
          clients:  (c.data || []).slice(0, 5),
          produits: (p.data || []).slice(0, 5),
          factures: facturesFiltrees,
        });
        setOpen(true);
      } catch {
        setResults({ clients: [], produits: [], factures: [] });
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  const total = results.clients.length
    + results.produits.length
    + results.factures.length;

  const goTo = (path) => {
    navigate(path);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={ref} style={s.wrap}>
      {/* Input */}
      <div style={s.inputWrap}>
        <Search size={15} color="#64748b" />
        <input
          style={s.input}
          placeholder="Rechercher clients, produits, factures..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
        />
        {loading && <div style={s.spinner} />}
        {query && !loading && (
          <button style={s.clearBtn} onClick={() => { setQuery(""); setOpen(false); }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown résultats */}
      {open && (
        <div style={s.dropdown}>
          {total === 0 ? (
            <p style={s.noResult}>Aucun résultat pour "{query}"</p>
          ) : (
            <>
              {/* Clients */}
              {results.clients.length > 0 && (
                <div>
                  <p style={s.sectionTitle}>
                    <Users size={12} /> Clients
                  </p>
                  {results.clients.map((c) => (
                    <button key={c.id} style={s.item}
                      onClick={() => goTo("/clients")}>
                      <span style={s.itemMain}>
                        {c.prenom} {c.nom}
                      </span>
                      <span style={s.itemSub}>{c.numeroClient}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Produits */}
              {results.produits.length > 0 && (
                <div>
                  <p style={s.sectionTitle}>
                    <Package size={12} /> Produits
                  </p>
                  {results.produits.map((p) => (
                    <button key={p.id} style={s.item}
                      onClick={() => goTo("/produits")}>
                      <span style={s.itemMain}>{p.nom}</span>
                      <span style={s.itemSub}>
                        {p.reference} — Stock: {p.quantiteStock}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Factures */}
              {results.factures.length > 0 && (
                <div>
                  <p style={s.sectionTitle}>
                    <FileText size={12} /> Factures
                  </p>
                  {results.factures.map((f) => (
                    <button key={f.id} style={s.item}
                      onClick={() => goTo("/factures")}>
                      <span style={s.itemMain}>{f.numeroFacture}</span>
                      <span style={s.itemSub}>
                        {f.client?.prenom} {f.client?.nom}
                        {" — "}{f.total?.toLocaleString()} F
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    position: "relative",
    width: "100%", maxWidth: 480,
    fontFamily: "'Segoe UI', sans-serif",
  },
  inputWrap: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#0f172a", border: "1.5px solid #334155",
    borderRadius: 10, padding: "8px 14px",
  },
  input: {
    flex: 1, background: "transparent", border: "none",
    color: "#f1f5f9", fontSize: 13, outline: "none",
  },
  spinner: {
    width: 14, height: 14, borderRadius: "50%",
    border: "2px solid #334155",
    borderTop: "2px solid #f59e0b",
    animation: "spin 0.8s linear infinite",
    flexShrink: 0,
  },
  clearBtn: {
    background: "transparent", border: "none",
    color: "#64748b", cursor: "pointer",
    display: "flex", alignItems: "center",
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 8px)",
    left: 0, right: 0, zIndex: 1000,
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    maxHeight: 420, overflowY: "auto",
  },
  noResult: {
    color: "#475569", textAlign: "center",
    padding: "20px", margin: 0, fontSize: 13,
  },
  sectionTitle: {
    color: "#64748b", fontSize: 11, fontWeight: 700,
    padding: "10px 14px 4px",
    margin: 0, textTransform: "uppercase",
    letterSpacing: "0.5px",
    display: "flex", alignItems: "center", gap: 5,
    borderTop: "1px solid #334155",
  },
  item: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    width: "100%", background: "transparent",
    border: "none", padding: "9px 14px",
    cursor: "pointer", textAlign: "left",
    transition: "background 0.15s",
  },
  itemMain: { color: "#f1f5f9", fontSize: 13, fontWeight: 500 },
  itemSub:  { color: "#64748b", fontSize: 11 },
};