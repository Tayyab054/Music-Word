import { apiClient } from "../../../api/apiClient";

export const songApi = {
  getAll: () => apiClient.get("/api/songs"),

  getById: (id) => apiClient.get(`/api/songs/${id}`),

  getPopular: (limit = 10) =>
    apiClient.get(`/api/songs/popular?limit=${limit}`),

  getByCategory: (category) => apiClient.get(`/api/songs/category/${category}`),

  getByArtist: (artistId) => apiClient.get(`/api/songs/artist/${artistId}`),

  play: (id) => apiClient.post(`/api/songs/${id}/play`),
};
