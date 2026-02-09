/**
 * @b0ase/flow-canvas - Types
 *
 * Type definitions for the flow canvas system.
 */

import { ReactNode } from 'react';

// ============================================================================
// Node Types
// ============================================================================

/** Built-in node categories */
export type NodeCategory =
  | 'basic'
  | 'business'
  | 'integration'
  | 'communication'
  | 'logic'
  | 'process';

/** Node status */
export type NodeStatus = 'pending' | 'active' | 'completed' | 'failed' | 'paused';

/** Built-in node types */
export type BuiltInNodeType =
  // Basic
  | 'payment'
  | 'contract'
  | 'task'
  | 'decision'
  | 'milestone'
  | 'team'
  // Business
  | 'organization'
  | 'role'
  | 'member'
  | 'instrument'
  | 'asset'
  // Integration
  | 'api'
  | 'webhook'
  | 'database'
  | 'email'
  | 'sms'
  // Logic
  | 'condition'
  | 'loop'
  | 'switch'
  | 'delay'
  | 'trigger'
  // Process
  | 'approval'
  | 'review'
  | 'notification'
  | 'timer'
  | 'queue';

/** Node definition */
export interface FlowNode<T extends string = string> {
  id: string;
  type: T;
  name: string;
  description?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  status: NodeStatus;
  /** Node-specific data */
  data?: Record<string, unknown>;
  /** IDs of connected nodes (outgoing) */
  connections: string[];
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/** Node type definition (for registration) */
export interface NodeTypeDefinition<T extends string = string> {
  type: T;
  name: string;
  description?: string;
  category: NodeCategory | string;
  icon?: ReactNode;
  color?: string;
  /** Default width */
  defaultWidth?: number;
  /** Default height */
  defaultHeight?: number;
  /** Fields that can be edited */
  fields?: NodeFieldDefinition[];
}

/** Field definition for node editing */
export interface NodeFieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'money';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

// ============================================================================
// Connection Types
// ============================================================================

/** Connection type */
export type ConnectionType =
  | 'default'
  | 'success'
  | 'failure'
  | 'conditional'
  | 'payment'
  | 'task';

/** Connection definition */
export interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  /** Condition for conditional connections */
  condition?: string;
  /** Amount for payment connections */
  amount?: number;
  /** Label to show on connection */
  label?: string;
}

// ============================================================================
// Canvas State
// ============================================================================

/** Canvas tool modes */
export type CanvasTool = 'select' | 'pan' | 'connect' | 'delete' | 'zoom';

/** Canvas state */
export interface CanvasState<T extends string = string> {
  nodes: FlowNode<T>[];
  connections: Connection[];
  /** Currently selected node ID */
  selectedNode: string | null;
  /** Multi-selected node IDs */
  selectedNodes: string[];
  /** Node being connected from */
  connectingFrom: string | null;
  /** Node being dragged */
  dragging: string | null;
  /** Current tool mode */
  tool: CanvasTool;
  /** Canvas zoom scale */
  scale: number;
  /** Canvas offset (pan) */
  offset: { x: number; y: number };
  /** Whether to snap to grid */
  gridSnap: boolean;
  /** Whether to show grid */
  showGrid: boolean;
  /** Grid size in pixels */
  gridSize: number;
  /** Clipboard for copy/paste */
  clipboard: FlowNode<T>[];
}

// ============================================================================
// Event Types
// ============================================================================

/** Node event */
export interface NodeEvent<T extends string = string> {
  node: FlowNode<T>;
  /** Mouse position relative to canvas */
  position?: { x: number; y: number };
}

/** Connection event */
export interface ConnectionEvent {
  connection: Connection;
  fromNode: FlowNode;
  toNode: FlowNode;
}

/** Canvas event handlers */
export interface CanvasEventHandlers<T extends string = string> {
  onNodeAdd?: (type: T, position: { x: number; y: number }) => void;
  onNodeUpdate?: (id: string, updates: Partial<FlowNode<T>>) => void;
  onNodeDelete?: (id: string) => void;
  onNodeSelect?: (ids: string[]) => void;
  onNodeDoubleClick?: (node: FlowNode<T>) => void;
  onConnectionAdd?: (from: string, to: string, type?: ConnectionType) => void;
  onConnectionDelete?: (id: string) => void;
  onCanvasClick?: (position: { x: number; y: number }) => void;
  onCanvasPan?: (offset: { x: number; y: number }) => void;
  onCanvasZoom?: (scale: number) => void;
}

// ============================================================================
// Component Props
// ============================================================================

/** Flow canvas props */
export interface FlowCanvasProps<T extends string = string> {
  /** Canvas state */
  state: CanvasState<T>;
  /** Registered node types */
  nodeTypes: NodeTypeDefinition<T>[];
  /** Event handlers */
  handlers: CanvasEventHandlers<T>;
  /** Custom node renderer */
  renderNode?: (
    node: FlowNode<T>,
    nodeType: NodeTypeDefinition<T> | undefined,
    isSelected: boolean,
    isDragging: boolean
  ) => ReactNode;
  /** Custom connection renderer */
  renderConnection?: (
    connection: Connection,
    fromNode: FlowNode<T>,
    toNode: FlowNode<T>
  ) => ReactNode;
  /** Whether mobile mode */
  isMobile?: boolean;
  /** CSS class name */
  className?: string;
}

/** Node palette props */
export interface NodePaletteProps<T extends string = string> {
  nodeTypes: NodeTypeDefinition<T>[];
  onNodeAdd: (type: T) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ============================================================================
// Utility Types
// ============================================================================

/** Point in 2D space */
export interface Point {
  x: number;
  y: number;
}

/** Rectangle bounds */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Get bounds of all nodes */
export function getNodesBounds<T extends string>(nodes: FlowNode<T>[]): Bounds {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const xEnds = nodes.map((n) => n.x + (n.width || 240));
  const yEnds = nodes.map((n) => n.y + (n.height || 60));

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xEnds);
  const maxY = Math.max(...yEnds);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
