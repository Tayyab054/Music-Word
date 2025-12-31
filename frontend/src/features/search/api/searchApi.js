import { apiClient } from "../../../api/apiClient";

export const searchApi = {
  search: (query, limit = 20) =>
    apiClient.get(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  searchSongs: (query, limit = 20) =>
    apiClient.get(
      `/api/search/songs?q=${encodeURIComponent(query)}&limit=${limit}`
    ),

  searchArtists: (query, limit = 20) =>
    apiClient.get(
      `/api/search/artists?q=${encodeURIComponent(query)}&limit=${limit}`
    ),

  autocomplete: (query, limit = 10) =>
    apiClient.get(
      `/api/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`
    ),
};
