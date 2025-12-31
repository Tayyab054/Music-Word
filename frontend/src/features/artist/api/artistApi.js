import { apiClient } from "../../../api/apiClient";

export const artistApi = {
  getAll: () => apiClient.get("/api/artists"),

  getById: (id) => apiClient.get(`/api/artists/${id}`),

  getCategories: () => apiClient.get("/api/artists/categories"),

  getByCategory: (category) =>
    apiClient.get(`/api/artists/category/${category}`),

  getRelated: (id, limit = 5) =>
    apiClient.get(`/api/artists/${id}/related?limit=${limit}`),
};
