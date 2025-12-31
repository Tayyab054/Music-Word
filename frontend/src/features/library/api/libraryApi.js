import { apiClient } from "../../../api/apiClient";

export const libraryApi = {
  get: () => apiClient.get("/api/library"),

  getHistory: (limit = 50) =>
    apiClient.get(`/api/library/history?limit=${limit}`),

  clearHistory: () => apiClient.delete("/api/library/history"),

  check: (songId) => apiClient.get(`/api/library/check/${songId}`),

  add: (songId) => apiClient.post(`/api/library/${songId}`),

  remove: (songId) => apiClient.delete(`/api/library/${songId}`),
};
