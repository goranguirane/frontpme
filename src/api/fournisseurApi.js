import api from "./axios";

export const fournisseurApi = {
  getAll:     ()           => api.get("/fournisseurs"),
  getById:    (id)         => api.get(`/fournisseurs/${id}`),
  rechercher: (nom)        => api.get(`/fournisseurs/recherche?nom=${nom}`),
  create:     (data)       => api.post("/fournisseurs", data),
  update:     (id, data)   => api.put(`/fournisseurs/${id}`, data),
  delete:     (id)         => api.delete(`/fournisseurs/${id}`),
};