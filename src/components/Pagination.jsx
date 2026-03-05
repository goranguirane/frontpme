// ─── Pagination.jsx ───────────────────────────────────────────────────────────
// Usage :
//   const { page, setPage, paginated, totalPages } = usePagination(data, 20);
//   <Pagination page={page} totalPages={totalPages} onChange={setPage} />

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onChange, total }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={s.wrap}>
      <span style={s.info}>
        Page {page} / {totalPages}
        {total !== undefined && ` — ${total} résultat(s)`}
      </span>

      <div style={s.btns}>
        {/* Précédent */}
        <button
          style={{ ...s.btn, opacity: page === 1 ? 0.3 : 1 }}
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Première page */}
        {start > 1 && (
          <>
            <button style={s.btn} onClick={() => onChange(1)}>1</button>
            {start > 2 && <span style={s.dots}>…</span>}
          </>
        )}

        {/* Pages autour de la courante */}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...s.btn,
              background: p === page ? "#f59e0b" : "#1e293b",
              color:      p === page ? "#0f172a" : "#94a3b8",
              fontWeight: p === page ? 700 : 400,
            }}
          >
            {p}
          </button>
        ))}

        {/* Dernière page */}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span style={s.dots}>…</span>}
            <button style={s.btn} onClick={() => onChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        {/* Suivant */}
        <button
          style={{ ...s.btn, opacity: page === totalPages ? 0.3 : 1 }}
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderTop: "1px solid #334155",
    background: "#1e293b",
    borderRadius: "0 0 14px 14px",
  },
  info: { color: "#64748b", fontSize: 13 },
  btns: { display: "flex", gap: 4, alignItems: "center" },
  btn: {
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: 7, padding: "6px 10px",
    color: "#94a3b8", fontSize: 13,
    cursor: "pointer", minWidth: 32,
    transition: "all 0.15s",
  },
  dots: { color: "#475569", padding: "0 4px" },
};