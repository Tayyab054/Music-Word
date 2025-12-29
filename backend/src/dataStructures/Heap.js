/**
 * Heap / Priority Queue Implementation
 * Used for top charts, most played songs, trending content
 */
class Heap {
  constructor(compareFn = (a, b) => a - b, type = "max") {
    this.heap = [];
    this.type = type; // 'max' or 'min'
    this.compareFn = compareFn;
  }

  // Get parent index
  _parent(index) {
    return Math.floor((index - 1) / 2);
  }

  // Get left child index
  _leftChild(index) {
    return 2 * index + 1;
  }

  // Get right child index
  _rightChild(index) {
    return 2 * index + 2;
  }

  // Compare two elements based on heap type
  _shouldSwap(parentIdx, childIdx) {
    const comparison = this.compareFn(
      this.heap[parentIdx].priority,
      this.heap[childIdx].priority
    );
    return this.type === "max" ? comparison < 0 : comparison > 0;
  }

  // Swap elements
  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Heapify up - O(log n)
  _heapifyUp(index) {
    while (index > 0) {
      const parentIdx = this._parent(index);
      if (this._shouldSwap(parentIdx, index)) {
        this._swap(parentIdx, index);
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  // Heapify down - O(log n)
  _heapifyDown(index) {
    const length = this.heap.length;

    while (true) {
      let targetIdx = index;
      const leftIdx = this._leftChild(index);
      const rightIdx = this._rightChild(index);

      if (leftIdx < length && this._shouldSwap(targetIdx, leftIdx)) {
        targetIdx = leftIdx;
      }

      if (rightIdx < length && this._shouldSwap(targetIdx, rightIdx)) {
        targetIdx = rightIdx;
      }

      if (targetIdx !== index) {
        this._swap(index, targetIdx);
        index = targetIdx;
      } else {
        break;
      }
    }
  }

  // Insert element with priority - O(log n)
  insert(data, priority) {
    this.heap.push({ data, priority });
    this._heapifyUp(this.heap.length - 1);
  }

  // Extract root (max or min) - O(log n)
  extract() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this._heapifyDown(0);

    return root;
  }

  // Peek at root - O(1)
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  // Update priority - O(n + log n)
  updatePriority(data, newPriority, compareFn = (a, b) => a === b) {
    for (let i = 0; i < this.heap.length; i++) {
      if (compareFn(this.heap[i].data, data)) {
        const oldPriority = this.heap[i].priority;
        this.heap[i].priority = newPriority;

        // Decide whether to heapify up or down
        if (
          (this.type === "max" && newPriority > oldPriority) ||
          (this.type === "min" && newPriority < oldPriority)
        ) {
          this._heapifyUp(i);
        } else {
          this._heapifyDown(i);
        }
        return true;
      }
    }
    return false;
  }

  // Remove specific element - O(n)
  remove(data, compareFn = (a, b) => a === b) {
    for (let i = 0; i < this.heap.length; i++) {
      if (compareFn(this.heap[i].data, data)) {
        // Replace with last element and heapify
        const removed = this.heap[i];
        this.heap[i] = this.heap.pop();

        if (i < this.heap.length) {
          this._heapifyUp(i);
          this._heapifyDown(i);
        }

        return removed;
      }
    }
    return null;
  }

  // Get top N elements - O(n log n)
  getTopN(n) {
    const result = [];
    const tempHeap = new Heap(this.compareFn, this.type);
    tempHeap.heap = [...this.heap];

    for (let i = 0; i < Math.min(n, tempHeap.heap.length); i++) {
      const item = tempHeap.extract();
      if (item) result.push(item);
    }

    return result;
  }

  // Check if empty
  isEmpty() {
    return this.heap.length === 0;
  }

  // Get size
  getSize() {
    return this.heap.length;
  }

  // Clear
  clear() {
    this.heap = [];
  }

  // Convert to sorted array - O(n log n)
  toSortedArray() {
    const result = [];
    const tempHeap = new Heap(this.compareFn, this.type);
    tempHeap.heap = [...this.heap];

    while (!tempHeap.isEmpty()) {
      result.push(tempHeap.extract());
    }

    return result;
  }

  // Build heap from array - O(n)
  static fromArray(arr, priorityExtractor, type = "max") {
    const heap = new Heap((a, b) => a - b, type);

    for (const item of arr) {
      heap.insert(item, priorityExtractor(item));
    }

    return heap;
  }
}

export default Heap;
