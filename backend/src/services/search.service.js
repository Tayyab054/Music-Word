/**
 * Search Service
 * ==============
 * Handles search operations using Trie-based autocomplete.
 *
 * DATA STRUCTURE: Trie (Prefix Tree)
 * ----------------------------------
 * - Used for fast prefix-based song search
 * - Time Complexity: O(m + k) where m = prefix length, k = results count
 * - Case-insensitive for better user experience
 */

import cacheService from "./cache.service.js";

/**
 * Autocomplete search for songs
 * Uses Trie stored in cache service
 *
 * @param {string} query - Search prefix
 * @param {number} limit - Max results
 * @returns {Array} Matching songs
 */
export function searchSongs(query, limit = 10) {
  return cacheService.searchSongs(query, limit);
}

/**
 * Search artists by name prefix
 * Simple filter on cached artists array
 *
 * @param {string} query - Search prefix
 * @param {number} limit - Max results
 */
export function searchArtists(query, limit = 10) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const artists = cacheService.getAllArtists();

  return artists
    .filter((a) => a.artist_name.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}

/**
 * Global search - returns both songs and artists
 */
export function search(query, limit = 20) {
  return {
    songs: searchSongs(query, limit),
    artists: searchArtists(query, limit),
  };
}

/**
 * Get autocomplete suggestions
 * Returns formatted suggestions for dropdown
 */
export function getAutocompleteSuggestions(query, limit = 10) {
  const results = search(query, limit);

  const suggestions = [
    ...results.songs.slice(0, Math.ceil(limit / 2)).map((s) => ({
      type: "song",
      id: s.song_id,
      title: s.title,
      subtitle: s.artist_name || "",
      image: s.image_url,
    })),
    ...results.artists.slice(0, Math.floor(limit / 2)).map((a) => ({
      type: "artist",
      id: a.artist_id,
      title: a.artist_name,
      subtitle: a.category || "",
      image: a.image_url,
    })),
  ];

  return suggestions.slice(0, limit);
}
