import memoryStore from "../store/memoryStore.js";

/* ========================= SEARCH ========================= */

// Global search (songs and artists)
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
    const results = memoryStore.search(q.trim(), searchLimit);

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

// Search songs only
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
    const songs = memoryStore.searchSongs(q.trim(), searchLimit);

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

// Search artists only
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
    const artists = memoryStore.searchArtists(q.trim(), searchLimit);

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

// Autocomplete suggestions
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
    const results = memoryStore.search(q.trim(), searchLimit);

    // Combine and format suggestions
    const suggestions = [
      ...results.songs.map((s) => ({
        type: "song",
        id: s.song_id,
        title: s.title,
        subtitle: s.artist_name || "",
        image: s.image_url,
      })),
      ...results.artists.map((a) => ({
        type: "artist",
        id: a.artist_id,
        title: a.artist_name,
        subtitle: a.category || "",
        image: a.image_url,
      })),
    ].slice(0, searchLimit);

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
