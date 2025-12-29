/**
 * Binary Search Tree Implementation
 * Used for efficient sorted searching of songs by title, artists by name
 */
class BSTNode {
  constructor(key, data) {
    this.key = key; // The comparison key (e.g., title, name)
    this.data = data; // The actual data object
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor(compareKey = (data) => data) {
    this.root = null;
    this.size = 0;
    this.compareKey = compareKey; // Function to extract comparison key
  }

  // Get key for comparison (lowercase string)
  _getKey(data) {
    const key = this.compareKey(data);
    return typeof key === "string" ? key.toLowerCase() : key;
  }

  // Insert - O(log n) average, O(n) worst
  insert(data) {
    const key = this._getKey(data);
    const newNode = new BSTNode(key, data);

    if (!this.root) {
      this.root = newNode;
      this.size++;
      return;
    }

    let current = this.root;
    while (true) {
      if (key < current.key) {
        if (!current.left) {
          current.left = newNode;
          this.size++;
          return;
        }
        current = current.left;
      } else if (key > current.key) {
        if (!current.right) {
          current.right = newNode;
          this.size++;
          return;
        }
        current = current.right;
      } else {
        // Key exists, update data
        current.data = data;
        return;
      }
    }
  }

  // Search exact - O(log n) average
  search(key) {
    const searchKey = typeof key === "string" ? key.toLowerCase() : key;
    let current = this.root;

    while (current) {
      if (searchKey === current.key) {
        return current.data;
      }
      current = searchKey < current.key ? current.left : current.right;
    }
    return null;
  }

  // Search by prefix - O(log n + k) where k is number of matches
  searchByPrefix(prefix) {
    const results = [];
    const searchPrefix = prefix.toLowerCase();

    const traverse = (node) => {
      if (!node) return;

      // If node key starts with prefix, add to results
      if (node.key.startsWith(searchPrefix)) {
        results.push(node.data);
      }

      // Search left if prefix could be there
      if (node.left && searchPrefix <= node.key) {
        traverse(node.left);
      }

      // Search right if prefix could be there
      if (node.right) {
        traverse(node.right);
      }
    };

    traverse(this.root);
    return results;
  }

  // Search containing substring - O(n)
  searchContaining(substring) {
    const results = [];
    const searchStr = substring.toLowerCase();

    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      if (node.key.includes(searchStr)) {
        results.push(node.data);
      }
      traverse(node.right);
    };

    traverse(this.root);
    return results;
  }

  // Find minimum - O(log n) average
  findMin(node = this.root) {
    if (!node) return null;
    while (node.left) {
      node = node.left;
    }
    return node.data;
  }

  // Find maximum - O(log n) average
  findMax(node = this.root) {
    if (!node) return null;
    while (node.right) {
      node = node.right;
    }
    return node.data;
  }

  // Delete - O(log n) average
  delete(key) {
    const deleteKey = typeof key === "string" ? key.toLowerCase() : key;

    const removeNode = (node, key) => {
      if (!node) return null;

      if (key < node.key) {
        node.left = removeNode(node.left, key);
        return node;
      } else if (key > node.key) {
        node.right = removeNode(node.right, key);
        return node;
      } else {
        // Node to delete found
        this.size--;

        // No children
        if (!node.left && !node.right) {
          return null;
        }

        // One child
        if (!node.left) return node.right;
        if (!node.right) return node.left;

        // Two children - get inorder successor
        let successor = node.right;
        while (successor.left) {
          successor = successor.left;
        }
        node.key = successor.key;
        node.data = successor.data;
        node.right = removeNode(node.right, successor.key);
        this.size++; // Correct the decrement from recursive call
        return node;
      }
    };

    this.root = removeNode(this.root, deleteKey);
  }

  // In-order traversal (sorted) - O(n)
  inOrder() {
    const result = [];
    const traverse = (node) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.data);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  // Get sorted range - O(log n + k)
  getRange(startKey, endKey) {
    const results = [];
    const start =
      typeof startKey === "string" ? startKey.toLowerCase() : startKey;
    const end = typeof endKey === "string" ? endKey.toLowerCase() : endKey;

    const traverse = (node) => {
      if (!node) return;

      if (start < node.key) {
        traverse(node.left);
      }

      if (node.key >= start && node.key <= end) {
        results.push(node.data);
      }

      if (end > node.key) {
        traverse(node.right);
      }
    };

    traverse(this.root);
    return results;
  }

  // Get size
  getSize() {
    return this.size;
  }

  // Clear
  clear() {
    this.root = null;
    this.size = 0;
  }

  // Check if empty
  isEmpty() {
    return this.size === 0;
  }

  // Get all data as array (sorted)
  toArray() {
    return this.inOrder();
  }
}

export default BinarySearchTree;
