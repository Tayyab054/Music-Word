import { apiClient } from "../../../api/apiClient";

export const artistApi = {
  /**
   * Get all artists
   */
  getAll: () => apiClient.get("/api/artists"),

  /**
   * Get artist by ID (includes songs)
   */
  getById: (id) => apiClient.get(`/api/artists/${id}`),

  /**
   * Get artist's playlist (songs only)
   */
  getPlaylist: (id) => apiClient.get(`/api/artists/${id}/playlist`),

  /**
   * Get all categories
   */
  getCategories: () => apiClient.get("/api/artists/categories"),

  /**
   * Get artists by category
   */
  getByCategory: (category) =>
    apiClient.get(`/api/artists/category/${category}`),

  /**
   * Get related artists (same category)
   */
  getRelated: (id, limit = 5) =>
    apiClient.get(`/api/artists/${id}/related?limit=${limit}`),
};
