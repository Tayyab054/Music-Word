// Doubly Linked List for playlist navigation with next/prev song functionality

class ListNode {
  constructor(song) {
    this.song = song;
    this.prev = null;
    this.next = null;
  }
}

class LinkedList {
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
      return this.head?.song || null;
    }
    this.current = this.current.next;
    return this.current.song;
  }

  getPrevious() {
    if (!this.current || !this.current.prev) {
      return this.tail?.song || null;
    }
    this.current = this.current.prev;
    return this.current.song;
  }

  hasNext() {
    return this.current?.next !== null;
  }

  hasPrevious() {
    return this.current?.prev !== null;
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

  fromArray(songs) {
    this.clear();
    songs.forEach((song) => this.append(song));
    return this;
  }
}

export default LinkedList;
