import api from "./axios";

export const bonCommandeApi = {
  getAll:        ()             => api.get("/bons-commande"),
  getById:       (id)           => api.get(`/bons-commande/${id}`),
  getByStatut:   (statut)       => api.get(`/bons-commande/statut/${statut}`),
  create:        (data)         => api.post("/bons-commande", data),
  updateStatut:  (id, statut)   => api.patch(`/bons-commande/${id}/statut?statut=${statut}`),
  delete:        (id)           => api.delete(`/bons-commande/${id}`),
};