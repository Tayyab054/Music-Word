/**
 * In-Memory Data Store
 * Loads all data from PostgreSQL at startup and maintains it in RAM
 * Uses custom data structures for efficient operations
 */
import {
  HashMap,
  LinkedList,
  Queue,
  BinarySearchTree,
  Trie,
  Stack,
} from "../dataStructures/index.js";
import db from "../config/db.config.js";

class MemoryStore {
  constructor() {
    // Primary storage using HashMaps for O(1) lookup by ID
    this.songs = new HashMap(500);
    this.artists = new HashMap(100);
    this.users = new HashMap(1000);
    this.categories = new HashMap(50);

    // User libraries: userId -> LinkedList of songIds
    this.userLibraries = new HashMap(1000);

    // User song history: userId -> Stack of {songId, playedAt} (LIFO - last listened on top)
    this.userHistory = new HashMap(1000);

    // BST for sorted search by title/name
    this.songsByTitle = new BinarySearchTree((song) => song.title);
    this.artistsByName = new BinarySearchTree((artist) => artist.artist_name);

    // Trie for autocomplete search
    this.songSearchTrie = new Trie();
    this.artistSearchTrie = new Trie();

    // Songs by artist: artistId -> LinkedList of songs
    this.songsByArtist = new HashMap(100);

    // Songs by category: category -> LinkedList of songs
    this.songsByCategory = new HashMap(50);

    // Play counts: songId -> count
    this.playCounts = new HashMap(500);

    // Initialization flag
    this.initialized = false;
  }

  /**
   * Load all data from PostgreSQL into memory
   */
  async initialize() {
    console.log("🔄 Loading data from PostgreSQL into memory...");

    try {
      await this.loadArtists();
      await this.loadSongs();
      await this.loadUsers();
      await this.loadUserLibraries();
      await this.loadUserHistory();

      this.initialized = true;
      console.log("✅ In-memory store initialized successfully!");
      this.printStats();
    } catch (error) {
      console.error("❌ Failed to initialize memory store:", error);
      throw error;
    }
  }

  /**
   * Load artists from DB
   */
  async loadArtists() {
    const { rows } = await db.query("SELECT * FROM artists ORDER BY artist_id");

    for (const artist of rows) {
      // Store in HashMap
      this.artists.set(artist.artist_id, artist);

      // Add to BST for sorted search
      this.artistsByName.insert(artist);

      // Add to Trie for autocomplete
      this.artistSearchTrie.insert(artist.artist_name, artist);

      // Track categories
      if (artist.category) {
        if (!this.categories.has(artist.category)) {
          this.categories.set(artist.category, new LinkedList());
        }
        this.categories.get(artist.category).append(artist);
      }
    }

    console.log(`  📦 Loaded ${rows.length} artists`);
  }

  /**
   * Load songs from DB
   */
  async loadSongs() {
    const { rows } = await db.query(`
      SELECT s.*, a.artist_name, a.category 
      FROM songs s 
      LEFT JOIN artists a ON s.artist_id = a.artist_id 
      ORDER BY s.song_id
    `);

    for (const song of rows) {
      // Ensure each song has artwork; generate deterministic placeholder when missing
      if (!song.image_url) {
        song.image_url = `https://picsum.photos/seed/song-${song.song_id}/400`;
      }

      // Store in HashMap
      this.songs.set(song.song_id, song);

      // Add to BST for sorted search
      this.songsByTitle.insert(song);

      // Add to Trie for autocomplete (by title and artist name)
      this.songSearchTrie.insert(song.title, song);
      if (song.artist_name) {
        this.songSearchTrie.insert(song.artist_name, song);
      }

      // Group by artist
      if (song.artist_id) {
        if (!this.songsByArtist.has(song.artist_id)) {
          this.songsByArtist.set(song.artist_id, new LinkedList());
        }
        this.songsByArtist.get(song.artist_id).append(song);
      }

      // Group by category
      if (song.category) {
        if (!this.songsByCategory.has(song.category)) {
          this.songsByCategory.set(song.category, new LinkedList());
        }
        this.songsByCategory.get(song.category).append(song);
      }

      // Initialize play count
      this.playCounts.set(song.song_id, 0);
    }

    console.log(`  📦 Loaded ${rows.length} songs`);
  }

  /**
   * Load users from DB
   */
  async loadUsers() {
    const { rows } = await db.query(
      "SELECT user_id, name, email, role FROM users ORDER BY user_id"
    );

    for (const user of rows) {
      this.users.set(user.user_id, user);
    }

    console.log(`  📦 Loaded ${rows.length} users`);
  }

  /**
   * Load user libraries from DB
   */
  async loadUserLibraries() {
    const { rows } = await db.query(
      "SELECT * FROM user_library ORDER BY user_id"
    );

    for (const entry of rows) {
      if (!this.userLibraries.has(entry.user_id)) {
        this.userLibraries.set(entry.user_id, new LinkedList());
      }
      this.userLibraries.get(entry.user_id).append(entry.song_id);
    }

    console.log(`  📦 Loaded ${rows.length} library entries`);
  }

  /**
   * Load user song history from DB
   */
  async loadUserHistory() {
    const { rows } = await db.query(`
      SELECT * FROM user_song_history 
      ORDER BY user_id, played_at DESC
    `);

    for (const entry of rows) {
      if (!this.userHistory.has(entry.user_id)) {
        this.userHistory.set(entry.user_id, new Stack(100)); // Keep last 100
      }
      this.userHistory.get(entry.user_id).push({
        songId: entry.song_id,
        playedAt: entry.played_at,
      });

      // Increment play count
      const currentCount = this.playCounts.get(entry.song_id) || 0;
      this.playCounts.set(entry.song_id, currentCount + 1);
    }

    console.log(`  📦 Loaded ${rows.length} history entries`);
  }

  // ==================== SONG OPERATIONS ====================

  /**
   * Get song by ID - O(1)
   */
  getSong(songId) {
    return this.songs.get(Number(songId));
  }

  /**
   * Get all songs - O(n)
   */
  getAllSongs() {
    return this.songs.values();
  }

  /**
   * Search songs by query - O(prefix search)
   */
  searchSongs(query, limit = 20) {
    return this.songSearchTrie.searchByPrefix(query, limit);
  }

  /**
   * Get songs by artist - O(1) + O(k)
   */
  getSongsByArtist(artistId) {
    const songList = this.songsByArtist.get(Number(artistId));
    return songList ? songList.toArray() : [];
  }

  /**
   * Get songs by category - O(1) + O(k)
   */
  getSongsByCategory(category) {
    const songList = this.songsByCategory.get(category);
    return songList ? songList.toArray() : [];
  }

  /**
   * Get popular songs - Sort by play count
   */
  getPopularSongs(limit = 10) {
    const songs = this.songs.values();
    return songs
      .map((song) => ({
        ...song,
        playCount: this.playCounts.get(song.song_id) || 0,
      }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  /**
   * Add new song - O(log n) for BST insert
   */
  async addSong(songData) {
    const { rows } = await db.query(
      `INSERT INTO songs (title, image_url, song_url, artist_id) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        songData.title,
        songData.image_url,
        songData.song_url,
        songData.artist_id,
      ]
    );

    const song = rows[0];

    if (!song.image_url) {
      song.image_url = `https://picsum.photos/seed/song-${song.song_id}/400`;
    }

    // Add artist info
    const artist = this.artists.get(song.artist_id);
    if (artist) {
      song.artist_name = artist.artist_name;
      song.category = artist.category;
    }

    // Update all data structures
    this.songs.set(song.song_id, song);
    this.songsByTitle.insert(song);
    this.songSearchTrie.insert(song.title, song);

    if (song.artist_name) {
      this.songSearchTrie.insert(song.artist_name, song);
    }

    if (song.artist_id) {
      if (!this.songsByArtist.has(song.artist_id)) {
        this.songsByArtist.set(song.artist_id, new LinkedList());
      }
      this.songsByArtist.get(song.artist_id).append(song);
    }

    if (song.category) {
      if (!this.songsByCategory.has(song.category)) {
        this.songsByCategory.set(song.category, new LinkedList());
      }
      this.songsByCategory.get(song.category).append(song);
    }

    this.playCounts.set(song.song_id, 0);

    return song;
  }

  /**
   * Update song - O(n) for BST rebalance
   */
  async updateSong(songId, updates) {
    const song = this.songs.get(Number(songId));
    if (!song) return null;

    const { rows } = await db.query(
      `UPDATE songs SET 
        title = COALESCE($1, title),
        image_url = COALESCE($2, image_url),
        song_url = COALESCE($3, song_url),
        artist_id = COALESCE($4, artist_id)
       WHERE song_id = $5 RETURNING *`,
      [
        updates.title,
        updates.image_url,
        updates.song_url,
        updates.artist_id,
        songId,
      ]
    );

    const updatedSong = rows[0];

    if (!updatedSong.image_url) {
      updatedSong.image_url = `https://picsum.photos/seed/song-${updatedSong.song_id}/400`;
    }

    // Add artist info
    const artist = this.artists.get(updatedSong.artist_id);
    if (artist) {
      updatedSong.artist_name = artist.artist_name;
      updatedSong.category = artist.category;
    }

    // Remove old entries
    this.songsByTitle.delete(song.title);
    this.songSearchTrie.delete(song.title, song);
    if (song.artist_name) {
      this.songSearchTrie.delete(song.artist_name, song);
    }

    // Update HashMap
    this.songs.set(Number(songId), updatedSong);

    // Re-add to data structures
    this.songsByTitle.insert(updatedSong);
    this.songSearchTrie.insert(updatedSong.title, updatedSong);
    if (updatedSong.artist_name) {
      this.songSearchTrie.insert(updatedSong.artist_name, updatedSong);
    }

    return updatedSong;
  }

  /**
   * Delete song - O(n) for cleanup
   */
  async deleteSong(songId) {
    const song = this.songs.get(Number(songId));
    if (!song) return null;

    await db.query("DELETE FROM songs WHERE song_id = $1", [songId]);
    await db.query("DELETE FROM user_library WHERE song_id = $1", [songId]);
    await db.query("DELETE FROM user_song_history WHERE song_id = $1", [
      songId,
    ]);

    // Remove from all data structures
    this.songs.delete(Number(songId));
    this.songsByTitle.delete(song.title);
    this.songSearchTrie.delete(song.title, song);

    if (song.artist_name) {
      this.songSearchTrie.delete(song.artist_name, song);
    }

    // Remove from songsByArtist
    if (song.artist_id && this.songsByArtist.has(song.artist_id)) {
      const artistSongs = this.songsByArtist.get(song.artist_id);
      artistSongs.remove(song, (a, b) => a.song_id === b.song_id);
    }

    // Remove from songsByCategory
    if (song.category && this.songsByCategory.has(song.category)) {
      const categorySongs = this.songsByCategory.get(song.category);
      categorySongs.remove(song, (a, b) => a.song_id === b.song_id);
    }

    // Remove from user libraries
    for (const userId of this.userLibraries.keys()) {
      const library = this.userLibraries.get(userId);
      library.remove(Number(songId));
    }

    this.playCounts.delete(Number(songId));

    return song;
  }

  // ==================== ARTIST OPERATIONS ====================

  /**
   * Get artist by ID - O(1)
   */
  getArtist(artistId) {
    return this.artists.get(Number(artistId));
  }

  /**
   * Get all artists - O(n)
   */
  getAllArtists() {
    return this.artists.values();
  }

  /**
   * Search artists - O(prefix search)
   */
  searchArtists(query, limit = 20) {
    return this.artistSearchTrie.searchByPrefix(query, limit);
  }

  /**
   * Get related artists - O(V + E)
   */
  getRelatedArtists(artistId, limit = 5) {
    // Get related artists from same category
    const artist = this.artists.get(Number(artistId));
    if (!artist) return [];

    const categoryArtists = this.categories.get(artist.category);
    if (!categoryArtists) return [];

    const related = categoryArtists
      .toArray()
      .filter((a) => a.artist_id !== Number(artistId));
    return related
      .slice(0, limit)
      .map((r) => r.data)
      .filter(Boolean);
  }

  /**
   * Get artists by category - O(1) + O(k)
   */
  getArtistsByCategory(category) {
    const artistList = this.categories.get(category);
    return artistList ? artistList.toArray() : [];
  }

  /**
   * Get all categories - O(n)
   */
  getAllCategories() {
    return this.categories.keys();
  }

  /**
   * Add new artist
   */
  async addArtist(artistData) {
    const { rows } = await db.query(
      `INSERT INTO artists (artist_name, category, image_url) 
       VALUES ($1, $2, $3) RETURNING *`,
      [artistData.artist_name, artistData.category, artistData.image_url]
    );

    const artist = rows[0];

    // Update all data structures
    this.artists.set(artist.artist_id, artist);
    this.artistsByName.insert(artist);
    this.artistSearchTrie.insert(artist.artist_name, artist);
    // Artist added to category list above

    if (artist.category) {
      if (!this.categories.has(artist.category)) {
        this.categories.set(artist.category, new LinkedList());
      }
      this.categories.get(artist.category).append(artist);
    }

    return artist;
  }

  /**
   * Update artist
   */
  async updateArtist(artistId, updates) {
    const artist = this.artists.get(Number(artistId));
    if (!artist) return null;

    const { rows } = await db.query(
      `UPDATE artists SET 
        artist_name = COALESCE($1, artist_name),
        category = COALESCE($2, category),
        image_url = COALESCE($3, image_url)
       WHERE artist_id = $4 RETURNING *`,
      [updates.artist_name, updates.category, updates.image_url, artistId]
    );

    const updatedArtist = rows[0];

    // Remove old entries
    this.artistsByName.delete(artist.artist_name);
    this.artistSearchTrie.delete(artist.artist_name, artist);

    // Update HashMap
    this.artists.set(Number(artistId), updatedArtist);

    // Re-add to data structures
    this.artistsByName.insert(updatedArtist);
    this.artistSearchTrie.insert(updatedArtist.artist_name, updatedArtist);

    return updatedArtist;
  }

  /**
   * Delete artist
   */
  async deleteArtist(artistId) {
    const artist = this.artists.get(Number(artistId));
    if (!artist) return null;

    // Get all songs by this artist
    const artistSongs = this.getSongsByArtist(artistId);

    // Delete all songs by this artist
    for (const song of artistSongs) {
      await this.deleteSong(song.song_id);
    }

    await db.query("DELETE FROM artists WHERE artist_id = $1", [artistId]);

    // Remove from data structures
    this.artists.delete(Number(artistId));
    this.artistsByName.delete(artist.artist_name);
    this.artistSearchTrie.delete(artist.artist_name, artist);
    this.songsByArtist.delete(Number(artistId));

    if (artist.category && this.categories.has(artist.category)) {
      const categoryArtists = this.categories.get(artist.category);
      categoryArtists.remove(artist, (a, b) => a.artist_id === b.artist_id);
    }

    return artist;
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Get user by ID - O(1)
   */
  getUser(userId) {
    return this.users.get(Number(userId));
  }

  /**
   * Get all users - O(n)
   */
  getAllUsers() {
    return this.users.values();
  }

  /**
   * Add user to memory
   */
  addUser(user) {
    this.users.set(user.user_id, {
      user_id: user.user_id,
      name: user.name,
      country: user.country,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Update user in memory
   */
  updateUser(userId, updates) {
    const user = this.users.get(Number(userId));
    if (!user) return null;

    const updatedUser = { ...user, ...updates };
    this.users.set(Number(userId), updatedUser);
    return updatedUser;
  }

  /**
   * Delete user from memory
   */
  async deleteUser(userId) {
    const user = this.users.get(Number(userId));
    if (!user) return null;

    await db.query("DELETE FROM user_library WHERE user_id = $1", [userId]);
    await db.query("DELETE FROM user_song_history WHERE user_id = $1", [
      userId,
    ]);
    await db.query("DELETE FROM users WHERE user_id = $1", [userId]);

    this.users.delete(Number(userId));
    this.userLibraries.delete(Number(userId));
    this.userHistory.delete(Number(userId));

    return user;
  }

  // ==================== USER LIBRARY OPERATIONS ====================

  /**
   * Get user library songs - O(1) + O(k)
   */
  getUserLibrary(userId) {
    const library = this.userLibraries.get(Number(userId));
    if (!library) return [];

    return library
      .toArray()
      .map((songId) => this.songs.get(songId))
      .filter(Boolean);
  }

  /**
   * Check if song is in user library - O(n)
   */
  isInLibrary(userId, songId) {
    const library = this.userLibraries.get(Number(userId));
    if (!library) return false;
    return library.contains(Number(songId));
  }

  /**
   * Add song to user library - O(1)
   */
  async addToLibrary(userId, songId) {
    if (this.isInLibrary(userId, songId)) {
      return { success: false, message: "Song already in library" };
    }

    await db.query(
      "INSERT INTO user_library (user_id, song_id) VALUES ($1, $2)",
      [userId, songId]
    );

    if (!this.userLibraries.has(Number(userId))) {
      this.userLibraries.set(Number(userId), new LinkedList());
    }
    this.userLibraries.get(Number(userId)).append(Number(songId));

    return { success: true, message: "Song added to library" };
  }

  /**
   * Remove song from user library - O(n)
   */
  async removeFromLibrary(userId, songId) {
    if (!this.isInLibrary(userId, songId)) {
      return { success: false, message: "Song not in library" };
    }

    await db.query(
      "DELETE FROM user_library WHERE user_id = $1 AND song_id = $2",
      [userId, songId]
    );

    const library = this.userLibraries.get(Number(userId));
    if (library) {
      library.remove(Number(songId));
    }

    return { success: true, message: "Song removed from library" };
  }

  // ==================== PLAY HISTORY OPERATIONS ====================

  /**
   * Get user play history - O(1) + O(k) - Stack returns most recent first (LIFO)
   */
  getUserHistory(userId, limit = 50) {
    const history = this.userHistory.get(Number(userId));
    if (!history) return [];

    return history
      .toArray()
      .slice(0, limit)
      .map((entry) => ({
        ...this.songs.get(entry.songId),
        played_at: entry.playedAt,
      }))
      .filter((s) => s.song_id);
  }

  /**
   * Clear user play history - removes DB rows and in-memory stack
   */
  async clearUserHistory(userId) {
    await db.query("DELETE FROM user_song_history WHERE user_id = $1", [
      userId,
    ]);

    if (this.userHistory.has(Number(userId))) {
      this.userHistory.delete(Number(userId));
    }

    return { success: true };
  }

  /**
   * Record song play - O(1) - Pushes to Stack (most recent on top)
   */
  async recordPlay(userId, songId) {
    const playedAt = new Date();

    await db.query(
      "INSERT INTO user_song_history (user_id, song_id, played_at) VALUES ($1, $2, $3)",
      [userId, songId, playedAt]
    );

    if (!this.userHistory.has(Number(userId))) {
      this.userHistory.set(Number(userId), new Stack(100));
    }
    this.userHistory.get(Number(userId)).push({
      songId: Number(songId),
      playedAt,
    });

    return { success: true };
  }

  // ==================== SEARCH OPERATIONS ====================

  /**
   * Global search - songs and artists
   */
  search(query, limit = 20) {
    const songs = this.searchSongs(query, limit);
    const artists = this.searchArtists(query, limit);

    return {
      songs: songs.slice(0, limit),
      artists: artists.slice(0, limit),
    };
  }

  // ==================== STATS ====================

  printStats() {
    console.log("\n📊 Memory Store Statistics:");
    console.log(`  Songs: ${this.songs.getSize()}`);
    console.log(`  Artists: ${this.artists.getSize()}`);
    console.log(`  Users: ${this.users.getSize()}`);
    console.log(`  Categories: ${this.categories.getSize()}`);
    console.log("");
  }

  isReady() {
    return this.initialized;
  }
}

// Singleton instance
const memoryStore = new MemoryStore();

export default memoryStore;
