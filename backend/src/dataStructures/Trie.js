// Trie (Prefix Tree) - Used for autocomplete and prefix-based search

class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = [];
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  insert(word, data) {
    if (!word || typeof word !== "string") return;

    const key = word.toLowerCase();
    let current = this.root;

    for (const char of key) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char);
    }

    current.isEndOfWord = true;

    const exists = current.data.some(
      (d) => JSON.stringify(d) === JSON.stringify(data)
    );
    if (!exists) {
      current.data.push(data);
      this.size++;
    }
  }

  search(word) {
    const node = this._getNode(word);
    return node && node.isEndOfWord ? node.data : [];
  }

  contains(word) {
    const node = this._getNode(word);
    return node !== null && node.isEndOfWord;
  }

  startsWith(prefix) {
    return this._getNode(prefix) !== null;
  }

  searchByPrefix(prefix, limit = 50) {
    const node = this._getNode(prefix);
    if (!node) return [];

    const results = [];
    this._collectAllData(node, results, limit);
    return results;
  }

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

  _collectAllData(node, results, limit) {
    if (results.length >= limit) return;

    if (node.isEndOfWord) {
      for (const data of node.data) {
        if (results.length >= limit) break;
        results.push(data);
      }
    }

    for (const child of node.children.values()) {
      if (results.length >= limit) break;
      this._collectAllData(child, results, limit);
    }
  }

  delete(word, data = null) {
    if (!word || typeof word !== "string") return false;

    const key = word.toLowerCase();

    const deleteHelper = (node, index) => {
      if (index === key.length) {
        if (!node.isEndOfWord) return false;

        if (data) {
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
          this.size -= node.data.length;
          node.data = [];
          node.isEndOfWord = false;
        }

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

  autocomplete(prefix, limit = 10) {
    return this.searchByPrefix(prefix, limit);
  }

  getSize() {
    return this.size;
  }

  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }
}

export default Trie;
