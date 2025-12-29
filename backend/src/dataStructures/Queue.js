/**
 * Queue Implementation (FIFO)
 * Used for song playback queue, recently played processing
 */
class QueueNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class Queue {
  constructor(maxSize = Infinity) {
    this.front = null;
    this.rear = null;
    this.size = 0;
    this.maxSize = maxSize;
  }

  // Add to rear - O(1)
  enqueue(data) {
    if (this.size >= this.maxSize) {
      this.dequeue(); // Remove oldest if at capacity
    }

    const newNode = new QueueNode(data);

    if (!this.rear) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      this.rear.next = newNode;
      this.rear = newNode;
    }
    this.size++;
    return data;
  }

  // Remove from front - O(1)
  dequeue() {
    if (!this.front) return null;

    const data = this.front.data;
    this.front = this.front.next;

    if (!this.front) {
      this.rear = null;
    }
    this.size--;
    return data;
  }

  // Peek at front - O(1)
  peek() {
    return this.front ? this.front.data : null;
  }

  // Peek at rear - O(1)
  peekRear() {
    return this.rear ? this.rear.data : null;
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

  // Convert to array - O(n)
  toArray() {
    const result = [];
    let current = this.front;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // Clear all
  clear() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  // Check if contains - O(n)
  contains(data, compareFn = (a, b) => a === b) {
    let current = this.front;
    while (current) {
      if (compareFn(current.data, data)) {
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Remove specific item - O(n)
  remove(data, compareFn = (a, b) => a === b) {
    if (!this.front) return null;

    // If front is the target
    if (compareFn(this.front.data, data)) {
      return this.dequeue();
    }

    let current = this.front;
    while (current.next) {
      if (compareFn(current.next.data, data)) {
        const removed = current.next.data;
        current.next = current.next.next;
        if (!current.next) {
          this.rear = current;
        }
        this.size--;
        return removed;
      }
      current = current.next;
    }
    return null;
  }
}

export default Queue;
