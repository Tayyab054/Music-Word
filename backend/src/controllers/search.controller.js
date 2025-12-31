/**
 * Search Controller
 * =================
 * Handles search-related HTTP requests.
 *
 * Uses Trie data structure for autocomplete:
 * - Time Complexity: O(m + k) where m = prefix length, k = result count
 * - Case-insensitive matching
 */

import * as searchService from "../services/search.service.js";

/**
 * GET /api/search
 * Global search (songs and artists)
 */
export function search(req, res) {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        songs: [],
        artists: [],
      });
    }

    const searchLimit = parseInt(limit) || 20;
    const results = searchService.search(q.trim(), searchLimit);

    res.json({
      success: true,
      query: q,
      ...results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/search/songs
 * Search songs only using Trie autocomplete
 */
export function searchSongs(req, res) {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        songs: [],
      });
    }

    const searchLimit = parseInt(limit) || 20;
    const songs = searchService.searchSongs(q.trim(), searchLimit);

    res.json({
      success: true,
      query: q,
      songs,
      count: songs.length,
    });
  } catch (error) {
    console.error("Search songs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/search/artists
 * Search artists only
 */
export function searchArtists(req, res) {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        artists: [],
      });
    }

    const searchLimit = parseInt(limit) || 20;
    const artists = searchService.searchArtists(q.trim(), searchLimit);

    res.json({
      success: true,
      query: q,
      artists,
      count: artists.length,
    });
  } catch (error) {
    console.error("Search artists error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/search/autocomplete
 * Get autocomplete suggestions for search dropdown
 * Uses Trie for fast prefix matching
 */
export function autocomplete(req, res) {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    const searchLimit = parseInt(limit) || 10;
    const suggestions = searchService.getAutocompleteSuggestions(
      q.trim(),
      searchLimit
    );

    res.json({
      success: true,
      query: q,
      suggestions,
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
