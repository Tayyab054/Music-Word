/**
 * Artist Controller
 * =================
 * Handles HTTP requests for artist operations.
 * Controllers call services, keeping logic separated from HTTP handling.
 */

import * as artistService from "../services/artist.service.js";

/**
 * GET /api/artists
 * Get all artists from in-memory cache
 */
export function getAllArtists(req, res) {
  try {
    const artists = artistService.getAllArtists();

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

/**
 * GET /api/artists/:id
 * Get artist by ID or slug (includes songs)
 * Uses Map lookup - O(1) time complexity
 */
export async function getArtistById(req, res) {
  try {
    const { id } = req.params;
    const artist = await artistService.getArtist(id);

    if (!artist) {
      return res
        .status(404)
        .json({ success: false, message: "Artist not found" });
    }

    res.json({
      success: true,
      artist: {
        artist_id: artist.artist_id,
        artist_name: artist.artist_name,
        category: artist.category,
        image_url: artist.image_url,
        slug: artist.slug,
      },
      songs: artist.songs,
      songCount: artist.songs.length,
    });
  } catch (error) {
    console.error("Get artist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/artists/:id/playlist
 * Get artist's playlist (songs only)
 *
 * This endpoint fetches from in-memory cache (no DB hit).
 * Use case: When only songs are needed, not full artist info.
 */
export function getArtistPlaylist(req, res) {
  try {
    const { id } = req.params;
    const songs = artistService.getArtistPlaylist(id);

    if (!songs || songs.length === 0) {
      // Check if artist exists but has no songs
      const artist = artistService
        .getAllArtists()
        .find((a) => a.artist_id === Number(id) || a.slug === id);

      if (!artist) {
        return res
          .status(404)
          .json({ success: false, message: "Artist not found" });
      }

      // Artist exists but has no songs
      return res.json({
        success: true,
        playlist: [],
        artistId: artist.artist_id,
        artistName: artist.artist_name,
        count: 0,
      });
    }

    res.json({
      success: true,
      playlist: songs,
      artistId: songs[0]?.artist_id,
      artistName: songs[0]?.artist_name,
      count: songs.length,
    });
  } catch (error) {
    console.error("Get artist playlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

/**
 * GET /api/artists/category/:category
 * Get artists by category
 */
export function getArtistsByCategory(req, res) {
  try {
    const { category } = req.params;
    const artists = artistService.getArtistsByCategory(category);

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

/**
 * GET /api/artists/:id/related
 * Get related artists (same category)
 */
export function getRelatedArtists(req, res) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    const related = artistService.getRelatedArtists(id, limit);

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

/**
 * GET /api/artists/categories
 * Get all unique categories
 */
export function getAllCategories(req, res) {
  try {
    const categories = artistService.getAllCategories();

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
