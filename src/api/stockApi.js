import api from "./axios";

export const stockApi = {
  getAlertes:      ()                    => api.get("/stock/alertes"),
  getRuptures:     ()                    => api.get("/stock/ruptures"),
  countAlertes:    ()                    => api.get("/stock/alertes/count"),
  getMouvements:   ()                    => api.get("/stock/mouvements"),
  getByProduit:    (id)                  => api.get(`/stock/mouvements/produit/${id}`),
  ajusterStock:    (id, quantite, motif) => api.patch(
    `/stock/produit/${id}/ajuster?quantite=${quantite}&motif=${motif}`),
};