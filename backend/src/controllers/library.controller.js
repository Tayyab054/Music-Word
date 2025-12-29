import memoryStore from "../store/memoryStore.js";

/* ========================= LIBRARY OPERATIONS ========================= */

// Get user's library
export function getLibrary(req, res) {
  try {
    const userId = req.session.userId;
    const songs = memoryStore.getUserLibrary(userId);

    res.json({
      success: true,
      songs,
      count: songs.length,
    });
  } catch (error) {
    console.error("Get library error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Add song to library
export async function addToLibrary(req, res) {
  try {
    const userId = req.session.userId;
    const { songId } = req.params;

    // Check if song exists
    const song = memoryStore.getSong(songId);
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    const result = await memoryStore.addToLibrary(userId, songId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Song added to library",
      song,
    });
  } catch (error) {
    console.error("Add to library error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Remove song from library
export async function removeFromLibrary(req, res) {
  try {
    const userId = req.session.userId;
    const { songId } = req.params;

    const result = await memoryStore.removeFromLibrary(userId, songId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: "Song removed from library",
    });
  } catch (error) {
    console.error("Remove from library error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// Check if song is in library
export function checkInLibrary(req, res) {
  try {
    const userId = req.session.userId;
    const { songId } = req.params;

    const inLibrary = memoryStore.isInLibrary(userId, songId);

    res.json({
      success: true,
      inLibrary,
    });
  } catch (error) {
    console.error("Check library error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/* ========================= HISTORY OPERATIONS ========================= */

// Get user's play history
export function getHistory(req, res) {
  try {
    const userId = req.session.userId;
    const limit = parseInt(req.query.limit) || 50;
    const history = memoryStore.getUserHistory(userId, limit);

    res.json({
      success: true,
      songs: history,
      count: history.length,
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
