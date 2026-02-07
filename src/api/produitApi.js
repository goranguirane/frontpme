import api from "./axios";

export const produitApi = {
  getAll:       ()           => api.get("/produits"),
  getById:      (id)         => api.get(`/produits/${id}`),
  rechercher:   (nom)        => api.get(`/produits/recherche?nom=${nom}`),
  getAlertes:   ()           => api.get("/produits/alertes"),
  getRuptures:  ()           => api.get("/produits/ruptures"),
  create:       (data)       => api.post("/produits", data),
  update:       (id, data)   => api.put(`/produits/${id}`, data),
  updateStock:  (id, qte)    => api.patch(`/produits/${id}/stock?quantite=${qte}`),
  updateSeuil:  (id, seuil)  => api.patch(`/produits/${id}/seuil?seuil=${seuil}`),
  delete:       (id)         => api.delete(`/produits/${id}`),
};