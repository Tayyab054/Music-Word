// Artist Service - Handles artist-related business logic

import cacheService from "./cache.service.js";
import db from "../config/db.config.js";

export async function getArtist(idOrSlug) {
  let artist = cacheService.getArtist(idOrSlug);

  if (artist) {
    return artist;
  }

  console.warn(`Cache miss for artist: ${idOrSlug}, fetching from DB`);

  const { rows } = await db.query(
    `SELECT * FROM artists WHERE artist_id = $1 OR LOWER(artist_name) = LOWER($2)`,
    [Number(idOrSlug) || 0, String(idOrSlug)]
  );

  return rows[0] || null;
}

export function getAllArtists() {
  return cacheService.getAllArtists();
}

export function getArtistPlaylist(artistId) {
  return cacheService.getArtistPlaylist(artistId);
}

export function getArtistsByCategory(category) {
  const allArtists = cacheService.getAllArtists();
  return allArtists.filter(
    (a) => a.category?.toLowerCase() === category.toLowerCase()
  );
}

export function getRelatedArtists(artistId, limit = 5) {
  const artist = cacheService.getArtist(artistId);
  if (!artist || !artist.category) return [];

  const sameCategory = getArtistsByCategory(artist.category);
  return sameCategory
    .filter((a) => a.artist_id !== artist.artist_id)
    .slice(0, limit);
}

export function getAllCategories() {
  const artists = cacheService.getAllArtists();
  const categories = new Set(artists.map((a) => a.category).filter(Boolean));
  return Array.from(categories);
}
