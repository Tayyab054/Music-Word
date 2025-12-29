import memoryStore from "../store/memoryStore.js";

/* ========================= GET ARTISTS ========================= */

// Get all artists
export function getAllArtists(req, res) {
  try {
    const artists = memoryStore.getAllArtists();
    res.json({
      success: true,
      artists,
      count: artists.length,
    });
  } catch (error) {
    console.error("Get all artists error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get artist by ID
export function getArtistById(req, res) {
  try {
    const { id } = req.params;
    const artist = memoryStore.getArtist(id);

    if (!artist) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    // Get artist's songs
    const songs = memoryStore.getSongsByArtist(id);

    res.json({
      success: true,
      artist,
      songs,
      songCount: songs.length,
    });
  } catch (error) {
    console.error("Get artist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get artists by category
export function getArtistsByCategory(req, res) {
  try {
    const { category } = req.params;
    const artists = memoryStore.getArtistsByCategory(category);

    res.json({
      success: true,
      artists,
      count: artists.length,
    });
  } catch (error) {
    console.error("Get artists by category error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get related artists
export function getRelatedArtists(req, res) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    const related = memoryStore.getRelatedArtists(id, limit);

    res.json({
      success: true,
      artists: related,
      count: related.length,
    });
  } catch (error) {
    console.error("Get related artists error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get all categories
export function getAllCategories(req, res) {
  try {
    const categories = memoryStore.getAllCategories();
    res.json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
