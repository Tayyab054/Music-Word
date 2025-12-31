import { apiClient } from "../../../api/apiClient";

/**
 * Artist API
 * ==========
 * API calls for artist-related operations.
 *
 * CACHING NOTE:
 * Backend uses in-memory cache (Map + Trie) for fast lookups.
 * No need for frontend caching for this small dataset.
 */
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
   * Uses in-memory cache on backend - no DB hit
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
