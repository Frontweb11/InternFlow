import axios from "axios";

const API = axios.create({
  baseURL: "https://internflow-backend.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  getProfile: () => API.get("/auth/profile"),
  updateProfile: (data) => API.put("/auth/profile", data),
};

export const taskAPI = {
  getAll: () => API.get("/tasks"),
  getById: (id) => API.get(`/tasks/${id}`),

  create: (data) => API.post("/tasks", data),

  update: (id, data) => API.put(`/tasks/${id}`, data), // admin only
  delete: (id) => API.delete(`/tasks/${id}`),

  getStats: () => API.get("/tasks/stats"),

  // 🔥 IMPORTANT FIX (YOU WERE MISSING THIS)
  startTask: (id) => API.patch(`/tasks/${id}/start`),
};

export const submissionAPI = {
  getAll: () => API.get("/submissions"),
  getById: (id) => API.get(`/submissions/${id}`),
  create: (data) => API.post("/submissions", data),
  review: (id, data) => API.put(`/submissions/${id}`, data),
};

export const userAPI = {
  getAll: (params) => API.get("/users", { params }),
  create: (data) => API.post("/users", data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

export const analyticsAPI = {
  getDashboardStats: () => API.get("/analytics/dashboard"),
  getInternPerformance: () => API.get("/analytics/performance"),
};

export default API;
