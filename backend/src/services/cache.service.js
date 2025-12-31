import db from "../config/db.config.js";
import { Trie } from "../dataStructures/index.js";

class CacheService {
  constructor() {
    this.artistsById = new Map();
    this.artistsBySlug = new Map();
    this.songsTrie = new Trie();
    this.allSongs = [];
    this.allArtists = [];
    this.initialized = false;
  }

  async initialize() {
    console.log("🔄 Loading data from PostgreSQL into cache...");

    try {
      await this.loadArtists();
      await this.loadSongs();
      this.initialized = true;

      console.log("✅ Cache initialized successfully!");
      console.log(`   📦 Artists: ${this.artistsById.size}`);
      console.log(`   📦 Songs: ${this.allSongs.length}`);
    } catch (error) {
      console.error("❌ Failed to initialize cache:", error);
      throw error;
    }
  }

  async loadArtists() {
    const { rows } = await db.query(`SELECT * FROM artists ORDER BY artist_id`);

    for (const artist of rows) {
      const slug = this.generateSlug(artist.artist_name);
      const artistData = { ...artist, slug, songs: [] };

      this.artistsById.set(artist.artist_id, artistData);
      this.artistsBySlug.set(slug, artistData);
      this.allArtists.push(artistData);
    }
  }

  async loadSongs() {
    const { rows } = await db.query(`
      SELECT s.*, a.artist_name, a.category
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      ORDER BY s.song_id
    `);

    for (const song of rows) {
      if (!song.image_url) {
        song.image_url = `https://picsum.photos/seed/song-${song.song_id}/400`;
      }

      this.allSongs.push(song);
      this.songsTrie.insert(song.title, song);

      if (song.artist_name) {
        this.songsTrie.insert(song.artist_name, song);
      }

      if (song.artist_id && this.artistsById.has(song.artist_id)) {
        this.artistsById.get(song.artist_id).songs.push(song);
      }
    }
  }

  getArtistById(id) {
    return this.artistsById.get(Number(id)) || null;
  }

  getArtistBySlug(slug) {
    return this.artistsBySlug.get(slug.toLowerCase()) || null;
  }

  getArtist(idOrSlug) {
    const numId = Number(idOrSlug);
    if (!isNaN(numId) && this.artistsById.has(numId)) {
      return this.artistsById.get(numId);
    }
    return this.artistsBySlug.get(String(idOrSlug).toLowerCase()) || null;
  }

  getAllArtists() {
    return this.allArtists;
  }

  getArtistPlaylist(artistId) {
    const artist = this.getArtist(artistId);
    return artist ? artist.songs : [];
  }

  getAllSongs() {
    return this.allSongs;
  }

  getSongById(songId) {
    return this.allSongs.find((s) => s.song_id === Number(songId)) || null;
  }

  searchSongs(prefix, limit = 10) {
    if (!prefix || prefix.trim().length === 0) {
      return [];
    }
    return this.songsTrie.searchByPrefix(prefix.trim(), limit);
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  isReady() {
    return this.initialized;
  }

  getStats() {
    return {
      artists: this.artistsById.size,
      songs: this.allSongs.length,
      initialized: this.initialized,
    };
  }
}

const cacheService = new CacheService();
export default cacheService;
