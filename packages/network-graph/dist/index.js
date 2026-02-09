// src/index.ts
var DEFAULT_FORCE_CONFIG = {
  centerStrength: 0.05,
  chargeStrength: -300,
  collisionRadius: 1.5,
  linkDistance: 100,
  linkStrength: 0.5,
  alphaDecay: 0.02,
  velocityDecay: 0.4,
  alphaTarget: 0
};
var NODE_COLORS = {
  default: "#6B7280",
  user: "#3B82F6",
  token: "#F59E0B",
  organization: "#8B5CF6",
  project: "#10B981",
  transaction: "#EF4444",
  file: "#EC4899",
  group: "#6366F1"
};
var EDGE_COLORS = {
  default: "#9CA3AF",
  owns: "#3B82F6",
  member: "#10B981",
  transfer: "#F59E0B",
  relationship: "#8B5CF6",
  dependency: "#EF4444",
  bidirectional: "#6366F1"
};
var GraphManager = class {
  constructor(config) {
    this.config = config;
    this.data = { nodes: [], edges: [] };
    this.viewport = { x: 0, y: 0, zoom: 1, minZoom: 0.1, maxZoom: 4 };
    this.selection = { nodes: [], edges: [] };
    this.nodeMap = /* @__PURE__ */ new Map();
    this.edgeMap = /* @__PURE__ */ new Map();
  }
  setData(data) {
    this.data = data;
    this.nodeMap.clear();
    this.edgeMap.clear();
    for (const node of data.nodes) {
      this.nodeMap.set(node.id, node);
    }
    for (const edge of data.edges) {
      this.edgeMap.set(edge.id, edge);
    }
  }
  getData() {
    return { ...this.data };
  }
  addNode(node) {
    if (this.nodeMap.has(node.id)) {
      throw new Error(`Node already exists: ${node.id}`);
    }
    this.data.nodes.push(node);
    this.nodeMap.set(node.id, node);
  }
  removeNode(nodeId) {
    const index = this.data.nodes.findIndex((n) => n.id === nodeId);
    if (index >= 0) {
      this.data.nodes.splice(index, 1);
      this.nodeMap.delete(nodeId);
      this.data.edges = this.data.edges.filter((e) => {
        const sourceId = typeof e.source === "string" ? e.source : e.source.id;
        const targetId = typeof e.target === "string" ? e.target : e.target.id;
        const keep = sourceId !== nodeId && targetId !== nodeId;
        if (!keep) {
          this.edgeMap.delete(e.id);
        }
        return keep;
      });
    }
  }
  updateNode(nodeId, updates) {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  }
  getNode(nodeId) {
    return this.nodeMap.get(nodeId);
  }
  addEdge(edge) {
    if (this.edgeMap.has(edge.id)) {
      throw new Error(`Edge already exists: ${edge.id}`);
    }
    this.data.edges.push(edge);
    this.edgeMap.set(edge.id, edge);
  }
  removeEdge(edgeId) {
    const index = this.data.edges.findIndex((e) => e.id === edgeId);
    if (index >= 0) {
      this.data.edges.splice(index, 1);
      this.edgeMap.delete(edgeId);
    }
  }
  updateEdge(edgeId, updates) {
    const edge = this.edgeMap.get(edgeId);
    if (edge) {
      Object.assign(edge, updates);
    }
  }
  getEdge(edgeId) {
    return this.edgeMap.get(edgeId);
  }
  getConnectedEdges(nodeId) {
    return this.data.edges.filter((e) => {
      const sourceId = typeof e.source === "string" ? e.source : e.source.id;
      const targetId = typeof e.target === "string" ? e.target : e.target.id;
      return sourceId === nodeId || targetId === nodeId;
    });
  }
  getNeighbors(nodeId) {
    const neighborIds = /* @__PURE__ */ new Set();
    for (const edge of this.getConnectedEdges(nodeId)) {
      const sourceId = typeof edge.source === "string" ? edge.source : edge.source.id;
      const targetId = typeof edge.target === "string" ? edge.target : edge.target.id;
      if (sourceId === nodeId) neighborIds.add(targetId);
      if (targetId === nodeId) neighborIds.add(sourceId);
    }
    return Array.from(neighborIds).map((id) => this.nodeMap.get(id)).filter((n) => !!n);
  }
  setSelection(selection) {
    this.selection = selection;
  }
  getSelection() {
    return { ...this.selection };
  }
  selectNode(nodeId, multi = false) {
    if (multi) {
      if (!this.selection.nodes.includes(nodeId)) {
        this.selection.nodes.push(nodeId);
      }
    } else {
      this.selection = { nodes: [nodeId], edges: [] };
    }
  }
  deselectNode(nodeId) {
    this.selection.nodes = this.selection.nodes.filter((id) => id !== nodeId);
  }
  clearSelection() {
    this.selection = { nodes: [], edges: [] };
  }
  setViewport(viewport) {
    Object.assign(this.viewport, viewport);
    if (this.viewport.minZoom && this.viewport.zoom < this.viewport.minZoom) {
      this.viewport.zoom = this.viewport.minZoom;
    }
    if (this.viewport.maxZoom && this.viewport.zoom > this.viewport.maxZoom) {
      this.viewport.zoom = this.viewport.maxZoom;
    }
  }
  getViewport() {
    return { ...this.viewport };
  }
  fitToView(padding = 50) {
    if (this.data.nodes.length === 0) return;
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const node of this.data.nodes) {
      if (node.x !== void 0 && node.y !== void 0) {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x);
        maxY = Math.max(maxY, node.y);
      }
    }
    if (minX === Infinity) return;
    const graphWidth = maxX - minX + padding * 2;
    const graphHeight = maxY - minY + padding * 2;
    const zoom = Math.min(
      this.config.width / graphWidth,
      this.config.height / graphHeight,
      this.viewport.maxZoom || 4
    );
    this.viewport = {
      ...this.viewport,
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      zoom: Math.max(zoom, this.viewport.minZoom || 0.1)
    };
  }
  getStats() {
    const nodeCount = this.data.nodes.length;
    const edgeCount = this.data.edges.length;
    const maxEdges = nodeCount * (nodeCount - 1) / 2;
    const density = maxEdges > 0 ? edgeCount / maxEdges : 0;
    const avgDegree = nodeCount > 0 ? 2 * edgeCount / nodeCount : 0;
    return { nodeCount, edgeCount, density, avgDegree };
  }
};
function applyCircularLayout(nodes, width, height, padding = 50) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - padding;
  nodes.forEach((node, i) => {
    const angle = 2 * Math.PI * i / nodes.length - Math.PI / 2;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
}
function applyGridLayout(nodes, width, height, padding = 50) {
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const cellWidth = (width - padding * 2) / cols;
  const cellHeight = (height - padding * 2) / Math.ceil(nodes.length / cols);
  nodes.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    node.x = padding + cellWidth * (col + 0.5);
    node.y = padding + cellHeight * (row + 0.5);
  });
}
function applyRadialLayout(nodes, width, height, centerNodeId) {
  const centerX = width / 2;
  const centerY = height / 2;
  const centerNode = centerNodeId ? nodes.find((n) => n.id === centerNodeId) : nodes[0];
  if (!centerNode) return;
  centerNode.x = centerX;
  centerNode.y = centerY;
  const others = nodes.filter((n) => n.id !== centerNode.id);
  const radius = Math.min(width, height) / 3;
  others.forEach((node, i) => {
    const angle = 2 * Math.PI * i / others.length;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
}
function createGraphManager(config) {
  return new GraphManager(config);
}
function createNode(id, label, type = "default", options) {
  return {
    id,
    label,
    type,
    color: NODE_COLORS[type],
    size: 20,
    ...options
  };
}
function createEdge(id, source, target, type = "default", options) {
  return {
    id,
    source,
    target,
    type,
    color: EDGE_COLORS[type],
    ...options
  };
}
function generateEdgeId(sourceId, targetId) {
  return `${sourceId}-${targetId}`;
}
function getNodeDegree(nodeId, edges) {
  return edges.filter((e) => {
    const sourceId = typeof e.source === "string" ? e.source : e.source.id;
    const targetId = typeof e.target === "string" ? e.target : e.target.id;
    return sourceId === nodeId || targetId === nodeId;
  }).length;
}
function filterByNodeType(data, types) {
  const nodeIds = new Set(data.nodes.filter((n) => types.includes(n.type)).map((n) => n.id));
  return {
    nodes: data.nodes.filter((n) => nodeIds.has(n.id)),
    edges: data.edges.filter((e) => {
      const sourceId = typeof e.source === "string" ? e.source : e.source.id;
      const targetId = typeof e.target === "string" ? e.target : e.target.id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    })
  };
}
function mergeGraphs(...graphs) {
  const nodeMap = /* @__PURE__ */ new Map();
  const edgeMap = /* @__PURE__ */ new Map();
  for (const graph of graphs) {
    for (const node of graph.nodes) {
      nodeMap.set(node.id, node);
    }
    for (const edge of graph.edges) {
      edgeMap.set(edge.id, edge);
    }
  }
  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values())
  };
}
function calculateBoundingBox(nodes) {
  if (nodes.length === 0) return null;
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  for (const node of nodes) {
    if (node.x !== void 0 && node.y !== void 0) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    }
  }
  if (minX === Infinity) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
export {
  DEFAULT_FORCE_CONFIG,
  EDGE_COLORS,
  GraphManager,
  NODE_COLORS,
  applyCircularLayout,
  applyGridLayout,
  applyRadialLayout,
  calculateBoundingBox,
  createEdge,
  createGraphManager,
  createNode,
  filterByNodeType,
  generateEdgeId,
  getNodeDegree,
  mergeGraphs
};
//# sourceMappingURL=index.js.map