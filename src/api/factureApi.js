import api from "./axios";

export const factureApi = {
  getAll:       ()              => api.get("/factures"),
  getById:      (id)            => api.get(`/factures/${id}`),
  getByClient:  (clientId)      => api.get(`/factures/client/${clientId}`),
  getByStatut:  (statut)        => api.get(`/factures/statut/${statut}`),
  create:       (data)          => api.post("/factures", data),
  updateStatut: (id, statut)    => api.patch(`/factures/${id}/statut?statut=${statut}`),
  delete:       (id)            => api.delete(`/factures/${id}`),
  downloadPDF:  (id)            => api.get(`/factures/${id}/pdf`, { responseType: "blob" }),
  getCA:        (debut, fin)    => api.get(`/factures/chiffre-affaires?debut=${debut}&fin=${fin}`),
};