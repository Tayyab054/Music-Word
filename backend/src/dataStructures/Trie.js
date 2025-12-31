/**
 * Trie (Prefix Tree) Implementation
 * ==================================
 * Used for autocomplete and fast prefix-based song/artist search.
 *
 * STRUCTURE:
 * ----------
 * Each node contains:
 * - children: Map of character -> child node
 * - isEndOfWord: true if a word ends at this node
 * - data: array of items (songs/artists) stored at this node
 *
 * EXAMPLE:
 * --------
 * Words: "cat", "car", "card"
 *
 *         root
 *          |
 *          c
 *          |
 *          a
 *         / \
 *        t   r
 *            |
 *            d
 *
 * TIME COMPLEXITY:
 * ----------------
 * - insert(word): O(m) where m = word length
 * - search(word): O(m)
 * - searchByPrefix(prefix): O(m + k) where k = number of results
 *
 * WHY TRIE FOR AUTOCOMPLETE?
 * --------------------------
 * - Fast prefix matching without scanning all items
 * - Memory efficient for words with common prefixes
 * - Case-insensitive search by converting to lowercase
 */

class TrieNode {
  constructor() {
    this.children = new Map(); // char -> TrieNode
    this.isEndOfWord = false; // Marks complete words
    this.data = []; // Store items (songs/artists) at word end
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  /**
   * Insert a word with associated data - O(m) where m is word length
   * @param {string} word - The word to insert (e.g., song title)
   * @param {Object} data - The data to store (e.g., song object)
   */
  insert(word, data) {
    if (!word || typeof word !== "string") return;

    // Convert to lowercase for case-insensitive search
    const key = word.toLowerCase();
    let current = this.root;

    // Traverse/create path for each character
    for (const char of key) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }

    current.isEndOfWord = true;

    // Avoid storing duplicates
    const exists = current.data.some(
      (d) => JSON.stringify(d) === JSON.stringify(data)
    );
    if (!exists) {
      current.data.push(data);
      this.size++;
    }
  }

  /**
   * Search for exact word - O(m)
   * @param {string} word - Word to find
   * @returns {Array} Data stored at that word, or empty array
   */
  search(word) {
    const node = this._getNode(word);
    return node && node.isEndOfWord ? node.data : [];
  }

  /**
   * Check if word exists - O(m)
   */
  contains(word) {
    const node = this._getNode(word);
    return node !== null && node.isEndOfWord;
  }

  /**
   * Check if any word starts with prefix - O(m)
   */
  startsWith(prefix) {
    return this._getNode(prefix) !== null;
  }

  /**
   * Get all items with matching prefix - O(m + k)
   * This is the main autocomplete function.
   *
   * @param {string} prefix - The search prefix
   * @param {number} limit - Maximum results to return
   * @returns {Array} Matching items (songs/artists)
   */
  searchByPrefix(prefix, limit = 50) {
    const node = this._getNode(prefix);
    if (!node) return [];

    const results = [];
    this._collectAllData(node, results, limit);
    return results;
  }

  /**
   * Get node at end of prefix - O(m)
   * Internal helper function.
   */
  _getNode(prefix) {
    if (!prefix || typeof prefix !== "string") return null;

    const key = prefix.toLowerCase();
    let current = this.root;

    for (const char of key) {
      if (!current.children.has(char)) {
        return null;
      }
      current = current.children.get(char);
    }

    return current;
  }

  /**
   * Collect all data from node and descendants - O(k)
   * Internal helper for searchByPrefix.
   */
  _collectAllData(node, results, limit) {
    if (results.length >= limit) return;

    // Collect data at this node
    if (node.isEndOfWord) {
      for (const data of node.data) {
        if (results.length >= limit) break;
        results.push(data);
      }
    }

    // Recursively collect from children
    for (const child of node.children.values()) {
      if (results.length >= limit) break;
      this._collectAllData(child, results, limit);
    }
  }

  /**
   * Delete a word - O(m)
   * @param {string} word - Word to delete
   * @param {Object} data - Specific data to remove (optional)
   * @returns {boolean} True if deleted
   */
  delete(word, data = null) {
    if (!word || typeof word !== "string") return false;

    const key = word.toLowerCase();

    const deleteHelper = (node, index) => {
      if (index === key.length) {
        if (!node.isEndOfWord) return false;

        if (data) {
          // Remove specific data item
          const idx = node.data.findIndex(
            (d) => JSON.stringify(d) === JSON.stringify(data)
          );
          if (idx !== -1) {
            node.data.splice(idx, 1);
            this.size--;
          }
          if (node.data.length === 0) {
            node.isEndOfWord = false;
          }
        } else {
          // Remove all data for this word
          this.size -= node.data.length;
          node.data = [];
          node.isEndOfWord = false;
        }

        // Return true if node can be deleted (no children)
        return node.children.size === 0;
      }

      const char = key[index];
      if (!node.children.has(char)) return false;

      const shouldDeleteChild = deleteHelper(
        node.children.get(char),
        index + 1
      );

      if (shouldDeleteChild) {
        node.children.delete(char);
        return !node.isEndOfWord && node.children.size === 0;
      }

      return false;
    };

    return deleteHelper(this.root, 0);
  }

  /**
   * Alias for searchByPrefix - for convenience
   */
  autocomplete(prefix, limit = 10) {
    return this.searchByPrefix(prefix, limit);
  }

  /**
   * Get total number of items stored
   */
  getSize() {
    return this.size;
  }

  /**
   * Clear all data
   */
  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }
}

export default Trie;
