/**
 * Artist Service
 * ==============
 * Handles artist-related business logic.
 * Uses the cache service for in-memory lookups.
 *
 * PRINCIPLE: Controllers call services, services access cache.
 */

import cacheService from "./cache.service.js";
import db from "../config/db.config.js";

/**
 * Get artist by ID or slug from cache
 * Falls back to DB if not found (edge case)
 */
export async function getArtist(idOrSlug) {
  // Try cache first - O(1) lookup
  let artist = cacheService.getArtist(idOrSlug);

  if (artist) {
    return artist;
  }

  // Fallback to DB only if cache miss (shouldn't happen normally)
  console.warn(`Cache miss for artist: ${idOrSlug}, fetching from DB`);

  const { rows } = await db.query(
    `SELECT * FROM artists WHERE artist_id = $1 OR LOWER(artist_name) = LOWER($2)`,
    [Number(idOrSlug) || 0, String(idOrSlug)]
  );

  return rows[0] || null;
}

/**
 * Get all artists from cache
 */
export function getAllArtists() {
  return cacheService.getAllArtists();
}

/**
 * Get artist's playlist (songs) from cache
 * This is the main function for /api/artists/:id/playlist
 */
export function getArtistPlaylist(artistId) {
  return cacheService.getArtistPlaylist(artistId);
}

/**
 * Get artists by category
 */
export function getArtistsByCategory(category) {
  const allArtists = cacheService.getAllArtists();
  return allArtists.filter(
    (a) => a.category?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get related artists (same category, excluding self)
 */
export function getRelatedArtists(artistId, limit = 5) {
  const artist = cacheService.getArtist(artistId);
  if (!artist || !artist.category) return [];

  const sameCategory = getArtistsByCategory(artist.category);
  return sameCategory
    .filter((a) => a.artist_id !== artist.artist_id)
    .slice(0, limit);
}

/**
 * Get all unique categories
 */
export function getAllCategories() {
  const artists = cacheService.getAllArtists();
  const categories = new Set(artists.map((a) => a.category).filter(Boolean));
  return Array.from(categories);
}
