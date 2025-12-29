/**
 * Graph Implementation using Adjacency List
 * Used for artist relationships, song recommendations, related content
 */
class Graph {
  constructor(isDirected = false) {
    this.adjacencyList = new Map();
    this.isDirected = isDirected;
    this.vertexData = new Map(); // Store data for each vertex
  }

  // Add vertex - O(1)
  addVertex(vertex, data = null) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, []);
      if (data) {
        this.vertexData.set(vertex, data);
      }
    }
  }

  // Add edge - O(1)
  addEdge(vertex1, vertex2, weight = 1) {
    // Add vertices if they don't exist
    if (!this.adjacencyList.has(vertex1)) {
      this.addVertex(vertex1);
    }
    if (!this.adjacencyList.has(vertex2)) {
      this.addVertex(vertex2);
    }

    // Add edge
    this.adjacencyList.get(vertex1).push({ node: vertex2, weight });

    if (!this.isDirected) {
      this.adjacencyList.get(vertex2).push({ node: vertex1, weight });
    }
  }

  // Remove edge - O(E)
  removeEdge(vertex1, vertex2) {
    if (this.adjacencyList.has(vertex1)) {
      this.adjacencyList.set(
        vertex1,
        this.adjacencyList.get(vertex1).filter((edge) => edge.node !== vertex2)
      );
    }

    if (!this.isDirected && this.adjacencyList.has(vertex2)) {
      this.adjacencyList.set(
        vertex2,
        this.adjacencyList.get(vertex2).filter((edge) => edge.node !== vertex1)
      );
    }
  }

  // Remove vertex - O(V + E)
  removeVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) return;

    // Remove all edges to this vertex
    for (const [v, edges] of this.adjacencyList) {
      this.adjacencyList.set(
        v,
        edges.filter((edge) => edge.node !== vertex)
      );
    }

    // Remove the vertex
    this.adjacencyList.delete(vertex);
    this.vertexData.delete(vertex);
  }

  // Get neighbors - O(1)
  getNeighbors(vertex) {
    return this.adjacencyList.get(vertex) || [];
  }

  // Get vertex data - O(1)
  getVertexData(vertex) {
    return this.vertexData.get(vertex);
  }

  // BFS traversal - O(V + E)
  bfs(startVertex) {
    const visited = new Set();
    const result = [];
    const queue = [startVertex];

    visited.add(startVertex);

    while (queue.length > 0) {
      const vertex = queue.shift();
      result.push(vertex);

      for (const edge of this.getNeighbors(vertex)) {
        if (!visited.has(edge.node)) {
          visited.add(edge.node);
          queue.push(edge.node);
        }
      }
    }

    return result;
  }

  // DFS traversal - O(V + E)
  dfs(startVertex) {
    const visited = new Set();
    const result = [];

    const dfsHelper = (vertex) => {
      visited.add(vertex);
      result.push(vertex);

      for (const edge of this.getNeighbors(vertex)) {
        if (!visited.has(edge.node)) {
          dfsHelper(edge.node);
        }
      }
    };

    dfsHelper(startVertex);
    return result;
  }

  // Find related items within N degrees - O(V + E)
  findRelated(startVertex, maxDepth = 2) {
    const visited = new Map(); // vertex -> depth
    const result = [];
    const queue = [{ vertex: startVertex, depth: 0 }];

    visited.set(startVertex, 0);

    while (queue.length > 0) {
      const { vertex, depth } = queue.shift();

      if (depth > 0) {
        result.push({
          vertex,
          data: this.vertexData.get(vertex),
          depth,
        });
      }

      if (depth < maxDepth) {
        for (const edge of this.getNeighbors(vertex)) {
          if (!visited.has(edge.node)) {
            visited.set(edge.node, depth + 1);
            queue.push({ vertex: edge.node, depth: depth + 1 });
          }
        }
      }
    }

    return result;
  }

  // Check if path exists - O(V + E)
  hasPath(start, end) {
    if (start === end) return true;
    if (!this.adjacencyList.has(start) || !this.adjacencyList.has(end)) {
      return false;
    }

    const visited = new Set();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const vertex = queue.shift();

      for (const edge of this.getNeighbors(vertex)) {
        if (edge.node === end) return true;
        if (!visited.has(edge.node)) {
          visited.add(edge.node);
          queue.push(edge.node);
        }
      }
    }

    return false;
  }

  // Get all vertices - O(V)
  getVertices() {
    return Array.from(this.adjacencyList.keys());
  }

  // Get vertex count
  getVertexCount() {
    return this.adjacencyList.size;
  }

  // Get edge count - O(V + E)
  getEdgeCount() {
    let count = 0;
    for (const edges of this.adjacencyList.values()) {
      count += edges.length;
    }
    return this.isDirected ? count : count / 2;
  }

  // Clear
  clear() {
    this.adjacencyList.clear();
    this.vertexData.clear();
  }
}

export default Graph;
