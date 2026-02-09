/**
 * @b0ase/network-graph
 *
 * D3 force-directed network graph types and utilities.
 *
 * @packageDocumentation
 */
/** Node type */
type NodeType = 'default' | 'user' | 'token' | 'organization' | 'project' | 'transaction' | 'file' | 'group';
/** Edge type */
type EdgeType = 'default' | 'owns' | 'member' | 'transfer' | 'relationship' | 'dependency' | 'bidirectional';
/** Node shape */
type NodeShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'hexagon';
/** Graph node */
interface GraphNode {
    id: string;
    label: string;
    type: NodeType;
    shape?: NodeShape;
    size?: number;
    color?: string;
    icon?: string;
    image?: string;
    metadata?: Record<string, unknown>;
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    fx?: number | null;
    fy?: number | null;
    index?: number;
}
/** Graph edge/link */
interface GraphEdge {
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
interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}
/** Force simulation config */
interface ForceConfig {
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
type LayoutType = 'force' | 'circular' | 'hierarchical' | 'radial' | 'grid' | 'tree';
/** Layout config */
interface LayoutConfig {
    type: LayoutType;
    width: number;
    height: number;
    padding?: number;
    force?: ForceConfig;
}
/** Graph viewport */
interface GraphViewport {
    x: number;
    y: number;
    zoom: number;
    minZoom?: number;
    maxZoom?: number;
}
/** Graph selection */
interface GraphSelection {
    nodes: string[];
    edges: string[];
}
/** Graph interaction event */
interface GraphEvent {
    type: 'click' | 'dblclick' | 'hover' | 'drag' | 'select';
    target: 'node' | 'edge' | 'background';
    nodeId?: string;
    edgeId?: string;
    position?: {
        x: number;
        y: number;
    };
}
/** Graph callbacks */
interface GraphCallbacks {
    onNodeClick?: (node: GraphNode) => void;
    onNodeDoubleClick?: (node: GraphNode) => void;
    onNodeHover?: (node: GraphNode | null) => void;
    onNodeDrag?: (node: GraphNode, position: {
        x: number;
        y: number;
    }) => void;
    onEdgeClick?: (edge: GraphEdge) => void;
    onBackgroundClick?: (position: {
        x: number;
        y: number;
    }) => void;
    onSelectionChange?: (selection: GraphSelection) => void;
    onZoomChange?: (viewport: GraphViewport) => void;
}
declare const DEFAULT_FORCE_CONFIG: ForceConfig;
declare const NODE_COLORS: Record<NodeType, string>;
declare const EDGE_COLORS: Record<EdgeType, string>;
declare class GraphManager {
    private data;
    private config;
    private viewport;
    private selection;
    private nodeMap;
    private edgeMap;
    constructor(config: LayoutConfig);
    setData(data: GraphData): void;
    getData(): GraphData;
    addNode(node: GraphNode): void;
    removeNode(nodeId: string): void;
    updateNode(nodeId: string, updates: Partial<GraphNode>): void;
    getNode(nodeId: string): GraphNode | undefined;
    addEdge(edge: GraphEdge): void;
    removeEdge(edgeId: string): void;
    updateEdge(edgeId: string, updates: Partial<GraphEdge>): void;
    getEdge(edgeId: string): GraphEdge | undefined;
    getConnectedEdges(nodeId: string): GraphEdge[];
    getNeighbors(nodeId: string): GraphNode[];
    setSelection(selection: GraphSelection): void;
    getSelection(): GraphSelection;
    selectNode(nodeId: string, multi?: boolean): void;
    deselectNode(nodeId: string): void;
    clearSelection(): void;
    setViewport(viewport: Partial<GraphViewport>): void;
    getViewport(): GraphViewport;
    fitToView(padding?: number): void;
    getStats(): {
        nodeCount: number;
        edgeCount: number;
        density: number;
        avgDegree: number;
    };
}
declare function applyCircularLayout(nodes: GraphNode[], width: number, height: number, padding?: number): void;
declare function applyGridLayout(nodes: GraphNode[], width: number, height: number, padding?: number): void;
declare function applyRadialLayout(nodes: GraphNode[], width: number, height: number, centerNodeId?: string): void;
declare function createGraphManager(config: LayoutConfig): GraphManager;
declare function createNode(id: string, label: string, type?: NodeType, options?: Partial<GraphNode>): GraphNode;
declare function createEdge(id: string, source: string, target: string, type?: EdgeType, options?: Partial<GraphEdge>): GraphEdge;
declare function generateEdgeId(sourceId: string, targetId: string): string;
declare function getNodeDegree(nodeId: string, edges: GraphEdge[]): number;
declare function filterByNodeType(data: GraphData, types: NodeType[]): GraphData;
declare function mergeGraphs(...graphs: GraphData[]): GraphData;
declare function calculateBoundingBox(nodes: GraphNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
} | null;

export { DEFAULT_FORCE_CONFIG, EDGE_COLORS, type EdgeType, type ForceConfig, type GraphCallbacks, type GraphData, type GraphEdge, type GraphEvent, GraphManager, type GraphNode, type GraphSelection, type GraphViewport, type LayoutConfig, type LayoutType, NODE_COLORS, type NodeShape, type NodeType, applyCircularLayout, applyGridLayout, applyRadialLayout, calculateBoundingBox, createEdge, createGraphManager, createNode, filterByNodeType, generateEdgeId, getNodeDegree, mergeGraphs };
