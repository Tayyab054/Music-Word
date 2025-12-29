/**
 * HashMap Implementation using Separate Chaining
 * Used for O(1) average lookup of songs, artists, users by ID
 */
class HashNode {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

class HashMap {
  constructor(size = 1000) {
    this.buckets = new Array(size).fill(null);
    this.size = size;
    this.count = 0;
  }

  // Hash function for any key type
  _hash(key) {
    const strKey = String(key);
    let hash = 0;
    for (let i = 0; i < strKey.length; i++) {
      hash = (hash * 31 + strKey.charCodeAt(i)) % this.size;
    }
    return hash;
  }

  // Insert or update a key-value pair - O(1) average
  set(key, value) {
    const index = this._hash(key);
    const newNode = new HashNode(key, value);

    if (!this.buckets[index]) {
      this.buckets[index] = newNode;
      this.count++;
      return;
    }

    let current = this.buckets[index];
    while (current) {
      if (current.key === key) {
        current.value = value; // Update existing
        return;
      }
      if (!current.next) {
        current.next = newNode;
        this.count++;
        return;
      }
      current = current.next;
    }
  }

  // Get value by key - O(1) average
  get(key) {
    const index = this._hash(key);
    let current = this.buckets[index];

    while (current) {
      if (current.key === key) {
        return current.value;
      }
      current = current.next;
    }
    return undefined;
  }

  // Check if key exists - O(1) average
  has(key) {
    return this.get(key) !== undefined;
  }

  // Delete by key - O(1) average
  delete(key) {
    const index = this._hash(key);
    let current = this.buckets[index];
    let prev = null;

    while (current) {
      if (current.key === key) {
        if (prev) {
          prev.next = current.next;
        } else {
          this.buckets[index] = current.next;
        }
        this.count--;
        return true;
      }
      prev = current;
      current = current.next;
    }
    return false;
  }

  // Get all values - O(n)
  values() {
    const result = [];
    for (const bucket of this.buckets) {
      let current = bucket;
      while (current) {
        result.push(current.value);
        current = current.next;
      }
    }
    return result;
  }

  // Get all keys - O(n)
  keys() {
    const result = [];
    for (const bucket of this.buckets) {
      let current = bucket;
      while (current) {
        result.push(current.key);
        current = current.next;
      }
    }
    return result;
  }

  // Get all entries - O(n)
  entries() {
    const result = [];
    for (const bucket of this.buckets) {
      let current = bucket;
      while (current) {
        result.push([current.key, current.value]);
        current = current.next;
      }
    }
    return result;
  }

  // Get count
  getSize() {
    return this.count;
  }

  // Clear all
  clear() {
    this.buckets = new Array(this.size).fill(null);
    this.count = 0;
  }
}

export default HashMap;
