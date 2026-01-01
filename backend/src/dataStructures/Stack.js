// Stack (LIFO) - Used for undo operations, navigation history, recently viewed

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

  push(data) {
    if (this.size >= this.maxSize) {
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

  pop() {
    if (!this.top) return null;

    const data = this.top.data;
    this.top = this.top.next;
    this.size--;
    return data;
  }

  peek() {
    return this.top ? this.top.data : null;
  }

  isEmpty() {
    return this.size === 0;
  }

  isFull() {
    return this.size >= this.maxSize;
  }

  getSize() {
    return this.size;
  }

  toArray() {
    const result = [];
    let current = this.top;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  clear() {
    this.top = null;
    this.size = 0;
  }

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

  remove(data, compareFn = (a, b) => a === b) {
    if (!this.top) return null;

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
