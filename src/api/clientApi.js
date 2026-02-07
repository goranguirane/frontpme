import api from "./axios";

export const clientApi = {
  getAll:       ()           => api.get("/clients"),
  getById:      (id)         => api.get(`/clients/${id}`),
  rechercher:   (nom)        => api.get(`/clients/recherche?nom=${nom}`),
  create:       (data)       => api.post("/clients", data),
  update:       (id, data)   => api.put(`/clients/${id}`, data),
  delete:       (id)         => api.delete(`/clients/${id}`),
};