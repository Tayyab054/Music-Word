// Doubly Linked List - Used for playlist/library navigation with next/prev

class ListNode {
  constructor(song) {
    this.song = song;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  append(song) {
    const newNode = new ListNode(song);

    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
      this.current = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }

    this.size++;
    return newNode;
  }

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

  getCurrent() {
    return this.current?.song || null;
  }

  getNext() {
    if (!this.current || !this.current.next) {
      return null;
    }
    this.current = this.current.next;
    return this.current.song;
  }

  getPrevious() {
    if (!this.current || !this.current.prev) {
      return null;
    }
    this.current = this.current.prev;
    return this.current.song;
  }

  peekNext() {
    return this.current?.next?.song || null;
  }

  peekPrevious() {
    return this.current?.prev?.song || null;
  }

  hasNext() {
    return this.current?.next !== null;
  }

  hasPrevious() {
    return this.current?.prev !== null;
  }

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

    if (this.current === node) {
      this.current = node.next || node.prev;
    }

    this.size--;
    return node.song;
  }

  toArray() {
    const songs = [];
    let node = this.head;

    while (node) {
      songs.push(node.song);
      node = node.next;
    }

    return songs;
  }

  fromArray(songs) {
    this.clear();
    songs.forEach((song) => this.append(song));
    return this;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  getSize() {
    return this.size;
  }

  isEmpty() {
    return this.size === 0;
  }

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

  contains(songId) {
    return this.find(songId) !== null;
  }

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
