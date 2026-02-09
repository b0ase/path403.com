/**
 * @b0ase/network-graph
 *
 * D3 force-directed network graph types and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Node type */
export type NodeType =
  | 'default'
  | 'user'
  | 'token'
  | 'organization'
  | 'project'
  | 'transaction'
  | 'file'
  | 'group';

/** Edge type */
export type EdgeType =
  | 'default'
  | 'owns'
  | 'member'
  | 'transfer'
  | 'relationship'
  | 'dependency'
  | 'bidirectional';

/** Node shape */
export type NodeShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'hexagon';

/** Graph node */
export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  shape?: NodeShape;
  size?: number;
  color?: string;
  icon?: string;
  image?: string;
  metadata?: Record<string, unknown>;
  // D3 simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  index?: number;
}

/** Graph edge/link */
export interface GraphEdge {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  type: EdgeType;
  label?: string;
  weight?: number;
  color?: string;
  dashed?: boolean;
  animated?: boolean;
  metadata?: Record<string, unknown>;
  index?: number;
}

/** Graph data */
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** Force simulation config */
export interface ForceConfig {
  /** Center force strength */
  centerStrength?: number;
  /** Charge force strength (negative = repel) */
  chargeStrength?: number;
  /** Collision radius multiplier */
  collisionRadius?: number;
  /** Link distance */
  linkDistance?: number;
  /** Link strength */
  linkStrength?: number;
  /** Alpha decay rate */
  alphaDecay?: number;
  /** Velocity decay */
  velocityDecay?: number;
  /** Alpha target for stabilization */
  alphaTarget?: number;
}

/** Layout type */
export type LayoutType =
  | 'force'
  | 'circular'
  | 'hierarchical'
  | 'radial'
  | 'grid'
  | 'tree';

/** Layout config */
export interface LayoutConfig {
  type: LayoutType;
  width: number;
  height: number;
  padding?: number;
  force?: ForceConfig;
}

/** Graph viewport */
export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
}

/** Graph selection */
export interface GraphSelection {
  nodes: string[];
  edges: string[];
}

/** Graph interaction event */
export interface GraphEvent {
  type: 'click' | 'dblclick' | 'hover' | 'drag' | 'select';
  target: 'node' | 'edge' | 'background';
  nodeId?: string;
  edgeId?: string;
  position?: { x: number; y: number };
}

/** Graph callbacks */
export interface GraphCallbacks {
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
  onNodeDrag?: (node: GraphNode, position: { x: number; y: number }) => void;
  onEdgeClick?: (edge: GraphEdge) => void;
  onBackgroundClick?: (position: { x: number; y: number }) => void;
  onSelectionChange?: (selection: GraphSelection) => void;
  onZoomChange?: (viewport: GraphViewport) => void;
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_FORCE_CONFIG: ForceConfig = {
  centerStrength: 0.05,
  chargeStrength: -300,
  collisionRadius: 1.5,
  linkDistance: 100,
  linkStrength: 0.5,
  alphaDecay: 0.02,
  velocityDecay: 0.4,
  alphaTarget: 0,
};

export const NODE_COLORS: Record<NodeType, string> = {
  default: '#6B7280',
  user: '#3B82F6',
  token: '#F59E0B',
  organization: '#8B5CF6',
  project: '#10B981',
  transaction: '#EF4444',
  file: '#EC4899',
  group: '#6366F1',
};

export const EDGE_COLORS: Record<EdgeType, string> = {
  default: '#9CA3AF',
  owns: '#3B82F6',
  member: '#10B981',
  transfer: '#F59E0B',
  relationship: '#8B5CF6',
  dependency: '#EF4444',
  bidirectional: '#6366F1',
};

// ============================================================================
// Graph Manager
// ============================================================================

export class GraphManager {
  private data: GraphData;
  private config: LayoutConfig;
  private viewport: GraphViewport;
  private selection: GraphSelection;
  private nodeMap: Map<string, GraphNode>;
  private edgeMap: Map<string, GraphEdge>;

  constructor(config: LayoutConfig) {
    this.config = config;
    this.data = { nodes: [], edges: [] };
    this.viewport = { x: 0, y: 0, zoom: 1, minZoom: 0.1, maxZoom: 4 };
    this.selection = { nodes: [], edges: [] };
    this.nodeMap = new Map();
    this.edgeMap = new Map();
  }

  setData(data: GraphData): void {
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

  getData(): GraphData {
    return { ...this.data };
  }

  addNode(node: GraphNode): void {
    if (this.nodeMap.has(node.id)) {
      throw new Error(`Node already exists: ${node.id}`);
    }
    this.data.nodes.push(node);
    this.nodeMap.set(node.id, node);
  }

  removeNode(nodeId: string): void {
    const index = this.data.nodes.findIndex(n => n.id === nodeId);
    if (index >= 0) {
      this.data.nodes.splice(index, 1);
      this.nodeMap.delete(nodeId);

      // Remove connected edges
      this.data.edges = this.data.edges.filter(e => {
        const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
        const targetId = typeof e.target === 'string' ? e.target : e.target.id;
        const keep = sourceId !== nodeId && targetId !== nodeId;
        if (!keep) {
          this.edgeMap.delete(e.id);
        }
        return keep;
      });
    }
  }

  updateNode(nodeId: string, updates: Partial<GraphNode>): void {
    const node = this.nodeMap.get(nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  }

  getNode(nodeId: string): GraphNode | undefined {
    return this.nodeMap.get(nodeId);
  }

  addEdge(edge: GraphEdge): void {
    if (this.edgeMap.has(edge.id)) {
      throw new Error(`Edge already exists: ${edge.id}`);
    }
    this.data.edges.push(edge);
    this.edgeMap.set(edge.id, edge);
  }

  removeEdge(edgeId: string): void {
    const index = this.data.edges.findIndex(e => e.id === edgeId);
    if (index >= 0) {
      this.data.edges.splice(index, 1);
      this.edgeMap.delete(edgeId);
    }
  }

  updateEdge(edgeId: string, updates: Partial<GraphEdge>): void {
    const edge = this.edgeMap.get(edgeId);
    if (edge) {
      Object.assign(edge, updates);
    }
  }

  getEdge(edgeId: string): GraphEdge | undefined {
    return this.edgeMap.get(edgeId);
  }

  getConnectedEdges(nodeId: string): GraphEdge[] {
    return this.data.edges.filter(e => {
      const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
      const targetId = typeof e.target === 'string' ? e.target : e.target.id;
      return sourceId === nodeId || targetId === nodeId;
    });
  }

  getNeighbors(nodeId: string): GraphNode[] {
    const neighborIds = new Set<string>();
    for (const edge of this.getConnectedEdges(nodeId)) {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target.id;
      if (sourceId === nodeId) neighborIds.add(targetId);
      if (targetId === nodeId) neighborIds.add(sourceId);
    }
    return Array.from(neighborIds)
      .map(id => this.nodeMap.get(id))
      .filter((n): n is GraphNode => !!n);
  }

  setSelection(selection: GraphSelection): void {
    this.selection = selection;
  }

  getSelection(): GraphSelection {
    return { ...this.selection };
  }

  selectNode(nodeId: string, multi = false): void {
    if (multi) {
      if (!this.selection.nodes.includes(nodeId)) {
        this.selection.nodes.push(nodeId);
      }
    } else {
      this.selection = { nodes: [nodeId], edges: [] };
    }
  }

  deselectNode(nodeId: string): void {
    this.selection.nodes = this.selection.nodes.filter(id => id !== nodeId);
  }

  clearSelection(): void {
    this.selection = { nodes: [], edges: [] };
  }

  setViewport(viewport: Partial<GraphViewport>): void {
    Object.assign(this.viewport, viewport);
    if (this.viewport.minZoom && this.viewport.zoom < this.viewport.minZoom) {
      this.viewport.zoom = this.viewport.minZoom;
    }
    if (this.viewport.maxZoom && this.viewport.zoom > this.viewport.maxZoom) {
      this.viewport.zoom = this.viewport.maxZoom;
    }
  }

  getViewport(): GraphViewport {
    return { ...this.viewport };
  }

  fitToView(padding = 50): void {
    if (this.data.nodes.length === 0) return;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const node of this.data.nodes) {
      if (node.x !== undefined && node.y !== undefined) {
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
      zoom: Math.max(zoom, this.viewport.minZoom || 0.1),
    };
  }

  getStats(): {
    nodeCount: number;
    edgeCount: number;
    density: number;
    avgDegree: number;
  } {
    const nodeCount = this.data.nodes.length;
    const edgeCount = this.data.edges.length;
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    const density = maxEdges > 0 ? edgeCount / maxEdges : 0;
    const avgDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;

    return { nodeCount, edgeCount, density, avgDegree };
  }
}

// ============================================================================
// Layout Functions
// ============================================================================

export function applyCircularLayout(
  nodes: GraphNode[],
  width: number,
  height: number,
  padding = 50
): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - padding;

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
}

export function applyGridLayout(
  nodes: GraphNode[],
  width: number,
  height: number,
  padding = 50
): void {
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

export function applyRadialLayout(
  nodes: GraphNode[],
  width: number,
  height: number,
  centerNodeId?: string
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  // Find center node or use first
  const centerNode = centerNodeId
    ? nodes.find(n => n.id === centerNodeId)
    : nodes[0];

  if (!centerNode) return;

  centerNode.x = centerX;
  centerNode.y = centerY;

  const others = nodes.filter(n => n.id !== centerNode.id);
  const radius = Math.min(width, height) / 3;

  others.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / others.length;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createGraphManager(config: LayoutConfig): GraphManager {
  return new GraphManager(config);
}

export function createNode(
  id: string,
  label: string,
  type: NodeType = 'default',
  options?: Partial<GraphNode>
): GraphNode {
  return {
    id,
    label,
    type,
    color: NODE_COLORS[type],
    size: 20,
    ...options,
  };
}

export function createEdge(
  id: string,
  source: string,
  target: string,
  type: EdgeType = 'default',
  options?: Partial<GraphEdge>
): GraphEdge {
  return {
    id,
    source,
    target,
    type,
    color: EDGE_COLORS[type],
    ...options,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateEdgeId(sourceId: string, targetId: string): string {
  return `${sourceId}-${targetId}`;
}

export function getNodeDegree(nodeId: string, edges: GraphEdge[]): number {
  return edges.filter(e => {
    const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
    const targetId = typeof e.target === 'string' ? e.target : e.target.id;
    return sourceId === nodeId || targetId === nodeId;
  }).length;
}

export function filterByNodeType(data: GraphData, types: NodeType[]): GraphData {
  const nodeIds = new Set(data.nodes.filter(n => types.includes(n.type)).map(n => n.id));
  return {
    nodes: data.nodes.filter(n => nodeIds.has(n.id)),
    edges: data.edges.filter(e => {
      const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
      const targetId = typeof e.target === 'string' ? e.target : e.target.id;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    }),
  };
}

export function mergeGraphs(...graphs: GraphData[]): GraphData {
  const nodeMap = new Map<string, GraphNode>();
  const edgeMap = new Map<string, GraphEdge>();

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
    edges: Array.from(edgeMap.values()),
  };
}

export function calculateBoundingBox(nodes: GraphNode[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} | null {
  if (nodes.length === 0) return null;

  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const node of nodes) {
    if (node.x !== undefined && node.y !== undefined) {
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
    height: maxY - minY,
  };
}
