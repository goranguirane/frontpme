import api from "./axios";

export const authApi = {

  login: (username, password) =>
    api.post("/auth/login", { username, password }),

  logout: () =>
    api.post("/auth/logout"),

  register: (username, password, role) =>
    api.post("/auth/register", { username, password, role }),
};