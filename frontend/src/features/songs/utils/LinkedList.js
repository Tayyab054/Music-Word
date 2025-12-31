/**
 * Doubly Linked List for Playlist Navigation
 * Used for prev/next song functionality with efficient navigation
 */

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

  // Add song to end
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

  // Set current song
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

  // Get current song
  getCurrent() {
    return this.current?.song || null;
  }

  // Get next song
  getNext() {
    if (!this.current || !this.current.next) {
      return this.head?.song || null; // Loop to beginning
    }
    this.current = this.current.next;
    return this.current.song;
  }

  // Get previous song
  getPrevious() {
    if (!this.current || !this.current.prev) {
      return this.tail?.song || null; // Loop to end
    }
    this.current = this.current.prev;
    return this.current.song;
  }

  // Check if has next
  hasNext() {
    return this.current?.next !== null;
  }

  // Check if has previous
  hasPrevious() {
    return this.current?.prev !== null;
  }

  // Get all songs as array
  toArray() {
    const songs = [];
    let node = this.head;
    while (node) {
      songs.push(node.song);
      node = node.next;
    }
    return songs;
  }

  // Clear list
  clear() {
    this.head = null;
    this.tail = null;
    this.current = null;
    this.size = 0;
  }

  // Get size
  getSize() {
    return this.size;
  }

  // Check if empty
  isEmpty() {
    return this.size === 0;
  }

  // Build from array
  fromArray(songs) {
    this.clear();
    songs.forEach((song) => this.append(song));
    return this;
  }
}

export default LinkedList;
