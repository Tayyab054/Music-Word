// Binary Search Tree - Used for efficient sorted searching of songs/artists

class BSTNode {
  constructor(key, data) {
    this.key = key;
    this.data = data;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor(compareKey = (data) => data) {
    this.root = null;
    this.size = 0;
    this.compareKey = compareKey;
  }

  _getKey(data) {
    const key = this.compareKey(data);
    return typeof key === "string" ? key.toLowerCase() : key;
  }

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
        current.data = data;
        return;
      }
    }
  }

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

  searchByPrefix(prefix) {
    const results = [];
    const searchPrefix = prefix.toLowerCase();

    const traverse = (node) => {
      if (!node) return;

      if (node.key.startsWith(searchPrefix)) {
        results.push(node.data);
      }

      if (node.left && searchPrefix <= node.key) {
        traverse(node.left);
      }

      if (node.right) {
        traverse(node.right);
      }
    };

    traverse(this.root);
    return results;
  }

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

  findMin(node = this.root) {
    if (!node) return null;
    while (node.left) {
      node = node.left;
    }
    return node.data;
  }

  findMax(node = this.root) {
    if (!node) return null;
    while (node.right) {
      node = node.right;
    }
    return node.data;
  }

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
        this.size--;

        if (!node.left && !node.right) {
          return null;
        }

        if (!node.left) return node.right;
        if (!node.right) return node.left;

        let successor = node.right;
        while (successor.left) {
          successor = successor.left;
        }
        node.key = successor.key;
        node.data = successor.data;
        node.right = removeNode(node.right, successor.key);
        this.size++;
        return node;
      }
    };

    this.root = removeNode(this.root, deleteKey);
  }

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

  getSize() {
    return this.size;
  }

  clear() {
    this.root = null;
    this.size = 0;
  }

  isEmpty() {
    return this.size === 0;
  }

  toArray() {
    return this.inOrder();
  }
}

export default BinarySearchTree;
