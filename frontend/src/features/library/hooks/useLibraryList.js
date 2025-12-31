/**
 * useLibraryList Hook
 * ====================
 * Manages user's library using a Doubly Linked List.
 *
 * DATA STRUCTURE: Doubly Linked List
 * ----------------------------------
 * - O(1) add to end (append)
 * - O(n) remove by song ID
 * - Maintains order of when songs were added
 *
 * WHY DLL FOR LIBRARY?
 * --------------------
 * - Natural ordering of songs
 * - Can play as a playlist with next/previous
 * - Efficient insertion at either end
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { DoublyLinkedList } from "../../../utils";
import { libraryApi } from "../api/libraryApi";

export function useLibraryList() {
  /**
   * Internal DLL for library management
   */
  const listRef = useRef(new DoublyLinkedList());

  /**
   * Array representation for React rendering
   */
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load library from API and populate DLL
   */
  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await libraryApi.get();
      const librarySongs = response.data?.songs || [];

      // Build DLL from API response
      listRef.current.fromArray(librarySongs);

      // Update React state
      setSongs(listRef.current.toArray());
    } catch (err) {
      console.error("Error loading library:", err);
      setError("Failed to load library");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add song to library - O(1) append to DLL
   */
  const addSong = useCallback(async (song) => {
    // Check if already in library
    if (listRef.current.contains(song.song_id)) {
      return { success: false, message: "Song already in library" };
    }

    try {
      await libraryApi.add(song.song_id);

      // Add to DLL (O(1))
      listRef.current.append(song);

      // Update React state
      setSongs(listRef.current.toArray());

      return { success: true };
    } catch (err) {
      console.error("Error adding to library:", err);
      return { success: false, message: "Failed to add song" };
    }
  }, []);

  /**
   * Remove song from library - O(n) to find in DLL
   */
  const removeSong = useCallback(async (songId) => {
    try {
      await libraryApi.remove(songId);

      // Remove from DLL
      listRef.current.remove(songId);

      // Update React state
      setSongs(listRef.current.toArray());

      return { success: true };
    } catch (err) {
      console.error("Error removing from library:", err);
      return { success: false, message: "Failed to remove song" };
    }
  }, []);

  /**
   * Check if song is in library
   */
  const hasSong = useCallback((songId) => {
    return listRef.current.contains(songId);
  }, []);

  /**
   * Get library as playlist (for playing)
   */
  const getPlaylist = useCallback(() => {
    return listRef.current.toArray();
  }, []);

  /**
   * Get library size
   */
  const size = songs.length;

  // Load library on mount
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  return {
    songs,
    loading,
    error,
    addSong,
    removeSong,
    hasSong,
    getPlaylist,
    size,
    refresh: loadLibrary,
  };
}

export default useLibraryList;
