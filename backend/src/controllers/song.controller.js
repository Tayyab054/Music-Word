import memoryStore from "../store/memoryStore.js";

/* ========================= GET SONGS ========================= */

// Get all songs
export function getAllSongs(req, res) {
  try {
    const songs = memoryStore.getAllSongs();
    res.json({
      success: true,
      songs,
      count: songs.length,
    });
  } catch (error) {
    console.error("Get all songs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get song by ID
export function getSongById(req, res) {
  try {
    const { id } = req.params;
    const song = memoryStore.getSong(id);

    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    res.json({ success: true, song });
  } catch (error) {
    console.error("Get song error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get songs by artist
export function getSongsByArtist(req, res) {
  try {
    const { artistId } = req.params;
    const songs = memoryStore.getSongsByArtist(artistId);

    res.json({
      success: true,
      songs,
      count: songs.length,
    });
  } catch (error) {
    console.error("Get songs by artist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get songs by category
export function getSongsByCategory(req, res) {
  try {
    const { category } = req.params;
    const songs = memoryStore.getSongsByCategory(category);

    res.json({
      success: true,
      songs,
      count: songs.length,
    });
  } catch (error) {
    console.error("Get songs by category error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Get popular songs
export function getPopularSongs(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const songs = memoryStore.getPopularSongs(limit);

    res.json({
      success: true,
      songs,
      count: songs.length,
    });
  } catch (error) {
    console.error("Get popular songs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ========================= PLAY SONG ========================= */

// Record song play (for history and stats)
export async function playSong(req, res) {
  try {
    const { id } = req.params;
    const userId = req.session.userId;

    const song = memoryStore.getSong(id);
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    // Record play if user is logged in
    if (userId) {
      await memoryStore.recordPlay(userId, id);
    }

    res.json({
      success: true,
      song,
      message: "Play recorded",
    });
  } catch (error) {
    console.error("Play song error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
