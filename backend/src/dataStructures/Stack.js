/**
 * Stack Implementation (LIFO)
 * Used for undo operations, navigation history, recently viewed
 */
class StackNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class Stack {
  constructor(maxSize = Infinity) {
    this.top = null;
    this.size = 0;
    this.maxSize = maxSize;
  }

  // Push to top - O(1)
  push(data) {
    if (this.size >= this.maxSize) {
      // Remove from bottom (convert to array, remove first, rebuild)
      const arr = this.toArray().reverse();
      arr.shift();
      this.clear();
      arr.reverse().forEach((item) => this._pushInternal(item));
    }

    return this._pushInternal(data);
  }

  _pushInternal(data) {
    const newNode = new StackNode(data);
    newNode.next = this.top;
    this.top = newNode;
    this.size++;
    return data;
  }

  // Pop from top - O(1)
  pop() {
    if (!this.top) return null;

    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  // Peek at top - O(1)
  peek() {
    return this.top ? this.top.data : null;
  }

  // Check if empty
  isEmpty() {
    return this.size === 0;
  }

  // Check if full
  isFull() {
    return this.size >= this.maxSize;
  }

  // Get size
  getSize() {
    return this.size;
  }

  // Convert to array (top first) - O(n)
  toArray() {
    const result = [];
    let current = this.top;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // Clear all
  clear() {
    this.top = null;
    this.size = 0;
  }

  // Check if contains - O(n)
  contains(data, compareFn = (a, b) => a === b) {
    let current = this.top;
    while (current) {
      if (compareFn(current.data, data)) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Remove specific item (not typical stack operation) - O(n)
  remove(data, compareFn = (a, b) => a === b) {
    if (!this.top) return null;

    // If top is the target
    if (compareFn(this.top.data, data)) {
      return this.pop();
    }

    let current = this.top;
    while (current.next) {
      if (compareFn(current.next.data, data)) {
        const removed = current.next.data;
        current.next = current.next.next;
        this.size--;
        return removed;
      }
      current = current.next;
    }
    return null;
  }
}

export default Stack;
