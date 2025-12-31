/**
 * Stack Data Structure
 * ====================
 * A simple array-based Stack (LIFO - Last In, First Out)
 *
 * USAGE IN THIS APP:
 * ------------------
 * - Recently Played Songs: Most recent song is always on top
 * - Push when a song is played, peek/pop to see recent history
 *
 * TIME COMPLEXITY:
 * ----------------
 * - push(): O(1) - Add to top
 * - pop(): O(1) - Remove from top
 * - peek(): O(1) - View top without removing
 * - toArray(): O(n) - Convert to array
 *
 * WHY A STACK?
 * ------------
 * LIFO order naturally shows most recently played songs first.
 * Simple array-based implementation is efficient for ~100 items.
 */

class Stack {
  /**
   * Create a new Stack
   * @param {number} maxSize - Maximum items to store (default: 100)
   */
  constructor(maxSize = 100) {
    this.items = [];
    this.maxSize = maxSize;
  }

  /**
   * Push an item onto the stack
   * If stack is full, removes the oldest item (bottom)
   *
   * @param {any} item - Item to add
   * @returns {any} The pushed item
   */
  push(item) {
    // Avoid duplicates for recently played (optional: remove if duplicate allowed)
    const existingIndex = this.items.findIndex(
      (i) => i.song_id === item.song_id
    );
    if (existingIndex !== -1) {
      // Remove existing occurrence (will be re-added at top)
      this.items.splice(existingIndex, 1);
    }

    // Add to top (end of array = top of stack)
    this.items.push(item);

    // If exceeds max size, remove oldest (bottom = start of array)
    if (this.items.length > this.maxSize) {
      this.items.shift();
    }

    return item;
  }

  /**
   * Remove and return the top item
   * @returns {any|null} The top item, or null if empty
   */
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  /**
   * View the top item without removing
   * @returns {any|null} The top item, or null if empty
   */
  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  /**
   * Check if stack is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Get current stack size
   * @returns {number}
   */
  size() {
    return this.items.length;
  }

  /**
   * Convert to array (top first, for display)
   * @returns {Array} Stack contents with most recent first
   */
  toArray() {
    // Return reversed so most recent (top) is first
    return [...this.items].reverse();
  }

  /**
   * Clear all items
   */
  clear() {
    this.items = [];
  }

  /**
   * Check if stack contains an item
   * @param {number} songId - Song ID to find
   * @returns {boolean}
   */
  contains(songId) {
    return this.items.some((item) => item.song_id === songId);
  }
}

export default Stack;
