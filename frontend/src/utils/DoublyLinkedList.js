/**
 * Doubly Linked List Data Structure
 * ==================================
 * A simple Doubly Linked List for playlist/library navigation.
 *
 * USAGE IN THIS APP:
 * ------------------
 * 1. Music Player: Navigate next/previous songs efficiently
 * 2. Playlists: Insert/remove songs at any position
 * 3. Library: Manage user's saved songs
 *
 * TIME COMPLEXITY:
 * ----------------
 * - append(): O(1) - Add to end
 * - prepend(): O(1) - Add to beginning
 * - getNext(): O(1) - Move to next node
 * - getPrevious(): O(1) - Move to previous node
 * - remove(): O(n) - Find and remove by value
 * - insertAfter(): O(1) - Insert after known node
 *
 * WHY A DOUBLY LINKED LIST?
 * -------------------------
 * - O(1) forward and backward navigation (next/previous buttons)
 * - O(1) insertion/removal at known positions
 * - Maintains order without array shifting
 * - Natural representation of a playlist
 *
 * STRUCTURE:
 * ----------
 *  null <- [prev|song|next] <-> [prev|song|next] <-> [prev|song|next] -> null
 *          ^head              ^current               ^tail
 */

class ListNode {
  /**
   * Create a new node
   * @param {Object} song - Song data
   */
  constructor(song) {
    this.song = song;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null; // First node
    this.tail = null; // Last node
    this.current = null; // Currently playing node
    this.size = 0;
  }

  /**
   * Add song to end of list
   * @param {Object} song - Song to add
   * @returns {ListNode} The created node
   */
  append(song) {
    const newNode = new ListNode(song);

    if (!this.head) {
      // First item: head, tail, and current all point to it
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      // Link to existing tail
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
    return newNode;
  }

  /**
   * Add song to beginning of list
   * @param {Object} song - Song to add
   * @returns {ListNode} The created node
   */
  prepend(song) {
    const newNode = new ListNode(song);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }

    this.size++;
    return newNode;
  }

  /**
   * Set current playing song by ID
   * @param {number} songId - Song ID to find
   * @returns {Object|null} The song if found
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
   * Get current song
   * @returns {Object|null} Current song or null
   */
  getCurrent() {
    return this.current?.song || null;
  }

  /**
   * Move to and return next song - O(1)
   * @returns {Object|null} Next song or null if at end
   */
  getNext() {
    if (!this.current || !this.current.next) {
      return null;
    }
    this.current = this.current.next;
    return this.current.song;
  }

  /**
   * Move to and return previous song - O(1)
   * @returns {Object|null} Previous song or null if at start
   */
  getPrevious() {
    if (!this.current || !this.current.prev) {
      return null;
    }
    this.current = this.current.prev;
    return this.current.song;
  }

  /**
   * Peek at next song without moving
   * @returns {Object|null} Next song or null
   */
  peekNext() {
    return this.current?.next?.song || null;
  }

  /**
   * Peek at previous song without moving
   * @returns {Object|null} Previous song or null
   */
  peekPrevious() {
    return this.current?.prev?.song || null;
  }

  /**
   * Check if has next song
   * @returns {boolean}
   */
  hasNext() {
    return this.current?.next !== null;
  }

  /**
   * Check if has previous song
   * @returns {boolean}
   */
  hasPrevious() {
    return this.current?.prev !== null;
  }

  /**
   * Remove song by ID - O(n)
   * @param {number} songId - Song ID to remove
   * @returns {Object|null} Removed song or null
   */
  remove(songId) {
    let node = this.head;

    while (node) {
      if (node.song.song_id === songId) {
        return this.removeNode(node);
      }
      node = node.next;
    }

    return null;
  }

  /**
   * Remove specific node - O(1)
   * @param {ListNode} node - Node to remove
   * @returns {Object} The removed song
   */
  removeNode(node) {
    if (!node) return null;

    // Update previous node's next pointer
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      // Removing head
      this.head = node.next;
    }

    // Update next node's prev pointer
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      // Removing tail
      this.tail = node.prev;
    }

    // Update current if needed
    if (this.current === node) {
      this.current = node.next || node.prev;
    }

    this.size--;
    return node.song;
  }

  /**
   * Convert to array
   * @returns {Array} All songs in order
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
   * Build list from array
   * @param {Array} songs - Songs to add
   * @returns {DoublyLinkedList} This list (for chaining)
   */
  fromArray(songs) {
    this.clear();
    songs.forEach((song) => this.append(song));
    return this;
  }

  /**
   * Clear all songs
   */
  clear() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  /**
   * Get list size
   * @returns {number}
   */
  getSize() {
    return this.size;
  }

  /**
   * Check if list is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.size === 0;
  }

  /**
   * Find song by ID
   * @param {number} songId - Song ID to find
   * @returns {Object|null} Song if found
   */
  find(songId) {
    let node = this.head;

    while (node) {
      if (node.song.song_id === songId) {
        return node.song;
      }
      node = node.next;
    }

    return null;
  }

  /**
   * Check if list contains a song
   * @param {number} songId - Song ID to check
   * @returns {boolean}
   */
  contains(songId) {
    return this.find(songId) !== null;
  }

  /**
   * Get song at index (for display purposes)
   * @param {number} index - Zero-based index
   * @returns {Object|null} Song at index or null
   */
  getAt(index) {
    if (index < 0 || index >= this.size) return null;

    let node = this.head;
    for (let i = 0; i < index; i++) {
      node = node.next;
    }

    return node?.song || null;
  }
}

export default DoublyLinkedList;
