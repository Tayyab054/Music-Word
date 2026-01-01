// Stack (LIFO) - Used for recently played songs

class Stack {
  constructor(maxSize = 100) {
    this.items = [];
    this.maxSize = maxSize;
  }

  push(item) {
    const existingIndex = this.items.findIndex(
      (i) => i.song_id === item.song_id
    );
    if (existingIndex !== -1) {
      this.items.splice(existingIndex, 1);
    }

    this.items.push(item);

    if (this.items.length > this.maxSize) {
      this.items.shift();
    }

    return item;
  }

  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }

  peek() {
    if (this.isEmpty()) return null;
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  toArray() {
    return [...this.items].reverse();
  }

  clear() {
    this.items = [];
  }

  contains(songId) {
    return this.items.some((item) => item.song_id === songId);
  }
}

export default Stack;
