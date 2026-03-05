// ─── hooks/usePagination.js ───────────────────────────────────────────────────
// Hook réutilisable pour paginer n'importe quelle liste
//
// Usage :
//   const { page, setPage, paginated, totalPages } = usePagination(maListe, 20);
//
//   - page       : page courante (commence à 1)
//   - setPage    : changer de page
//   - paginated  : sous-tableau de la page courante
//   - totalPages : nombre total de pages

import { useState, useMemo } from "react";

export default function usePagination(data = [], perPage = 20) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / perPage));

  // Remettre à la page 1 si les données changent
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return data.slice(start, start + perPage);
  }, [data, safePage, perPage]);

  return {
    page:       safePage,
    setPage,
    paginated,
    totalPages,
    total: data.length,
  };
}