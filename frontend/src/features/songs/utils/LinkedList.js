/**
 * Doubly Linked List for Playlist Navigation
 * ===========================================
 * Used for prev/next song functionality in the music player.
 *
 * DATA STRUCTURE DESIGN:
 * ----------------------
 * Each node contains:
 * - song: The song data object
 * - prev: Pointer to previous node
 * - next: Pointer to next node
 *
 * TIME COMPLEXITY:
 * ----------------
 * - getNext(): O(1) - Move forward one song
 * - getPrevious(): O(1) - Move backward one song
 * - setCurrent(): O(n) - Find song by ID (could optimize with Map)
 * - append(): O(1) - Add to end
 * - clear(): O(1) - Reset list
 *
 * WHY DOUBLY LINKED LIST?
 * -----------------------
 * Perfect for music player because:
 * 1. O(1) next/previous navigation
 * 2. Maintains play order naturally
 * 3. Easy to track current position
 *
 * VISUAL REPRESENTATION:
 * ----------------------
 *  null <- [Song A] <-> [Song B] <-> [Song C] -> null
 *          ^head        ^current     ^tail
 */

class ListNode {
  constructor(song) {
    this.song = song;
    this.prev = null;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null; // First song in playlist
    this.tail = null; // Last song in playlist
    this.current = null; // Currently playing song
    this.size = 0;
  }

  /**
   * Add song to end of playlist - O(1)
   */
  append(song) {
    const newNode = new ListNode(song);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
    return newNode;
  }

  /**
   * Set current song by ID - O(n)
   */
  setCurrent(songId) {
    let node = this.head;
    while (node) {
      if (node.song.song_id === songId) {
        this.current = node;
        return node.song;
      }
      node = node.next;
    }
    return null;
  }

  /**
   * Get current song - O(1)
   */
  getCurrent() {
    return this.current?.song || null;
  }

  /**
   * Move to next song - O(1)
   * Returns null if at end (no wrap-around by default)
   */
  getNext() {
    if (!this.current || !this.current.next) {
      return this.head?.song || null; // Loop to beginning
    }
    this.current = this.current.next;
    return this.current.song;
  }

  /**
   * Move to previous song - O(1)
   * Returns null if at beginning
   */
  getPrevious() {
    if (!this.current || !this.current.prev) {
      return this.tail?.song || null; // Loop to end
    }
    this.current = this.current.prev;
    return this.current.song;
  }

  /**
   * Check if has next song
   */
  hasNext() {
    return this.current?.next !== null;
  }

  /**
   * Check if has previous song
   */
  hasPrevious() {
    return this.current?.prev !== null;
  }

  /**
   * Convert to array (for React state)
   */
  toArray() {
    const songs = [];
    let node = this.head;
    while (node) {
      songs.push(node.song);
      node = node.next;
    }
    return songs;
  }

  /**
   * Clear entire playlist - O(1)
   */
  clear() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  /**
   * Get playlist size
   */
  getSize() {
    return this.size;
  }

  /**
   * Check if playlist is empty
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * Build playlist from array - O(n)
   */
  fromArray(songs) {
    this.clear();
    songs.forEach((song) => this.append(song));
    return this;
  }
}

export default LinkedList;
