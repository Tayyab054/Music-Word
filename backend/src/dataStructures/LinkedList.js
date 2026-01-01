// Doubly Linked List - Used for ordered collections, playlists, and history

class ListNode {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  append(data) {
    const newNode = new ListNode(data);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
    return newNode;
  }

  prepend(data) {
    const newNode = new ListNode(data);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
    return newNode;
  }

  insertAt(data, index) {
    if (index < 0 || index > this.size) return null;
    if (index === 0) return this.prepend(data);
    if (index === this.size) return this.append(data);

    const newNode = new ListNode(data);
    let current = this.head;
    let count = 0;

    while (count < index) {
      current = current.next;
      count++;
    }

    newNode.prev = current.prev;
    newNode.next = current;
    current.prev.next = newNode;
    current.prev = newNode;
    this.size++;
    return newNode;
  }

  remove(data, compareFn = (a, b) => a === b) {
    let current = this.head;

    while (current) {
      if (compareFn(current.data, data)) {
        return this.removeNode(current);
      }
      current = current.next;
    }
    return null;
  }

  removeNode(node) {
    if (!node) return null;

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.size--;
    return node.data;
  }

  removeLast() {
    if (!this.tail) return null;
    return this.removeNode(this.tail);
  }

  removeFirst() {
    if (!this.head) return null;
    return this.removeNode(this.head);
  }

  find(predicate) {
    let current = this.head;
    while (current) {
      if (predicate(current.data)) {
        return current.data;
      }
      current = current.next;
    }
    return null;
  }

  findNode(predicate) {
    let current = this.head;
    while (current) {
      if (predicate(current.data)) {
        return current;
      }
      current = current.next;
    }
    return null;
  }

  contains(data, compareFn = (a, b) => a === b) {
    let current = this.head;
    while (current) {
      if (compareFn(current.data, data)) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  toArrayReversed() {
    const result = [];
    let current = this.tail;
    while (current) {
      result.push(current.data);
      current = current.prev;
    }
    return result;
  }

  getAt(index) {
    if (index < 0 || index >= this.size) return null;

    let current;
    if (index < this.size / 2) {
      current = this.head;
      for (let i = 0; i < index; i++) {
        current = current.next;
      }
    } else {
      current = this.tail;
      for (let i = this.size - 1; i > index; i--) {
        current = current.prev;
      }
    }
    return current.data;
  }

  getSize() {
    return this.size;
  }

  isEmpty() {
    return this.size === 0;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  forEach(callback) {
    let current = this.head;
    let index = 0;
    while (current) {
      callback(current.data, index);
      current = current.next;
      index++;
    }
  }

  filter(predicate) {
    const newList = new LinkedList();
    let current = this.head;
    while (current) {
      if (predicate(current.data)) {
        newList.append(current.data);
      }
      current = current.next;
    }
    return newList;
  }

  map(transform) {
    const newList = new LinkedList();
    let current = this.head;
    while (current) {
      newList.append(transform(current.data));
      current = current.next;
    }
    return newList;
  }
}

export default LinkedList;
