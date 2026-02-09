import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';

/**
 * @b0ase/flow-canvas - Types
 *
 * Type definitions for the flow canvas system.
 */

/** Built-in node categories */
type NodeCategory = 'basic' | 'business' | 'integration' | 'communication' | 'logic' | 'process';
/** Node status */
type NodeStatus = 'pending' | 'active' | 'completed' | 'failed' | 'paused';
/** Built-in node types */
type BuiltInNodeType = 'payment' | 'contract' | 'task' | 'decision' | 'milestone' | 'team' | 'organization' | 'role' | 'member' | 'instrument' | 'asset' | 'api' | 'webhook' | 'database' | 'email' | 'sms' | 'condition' | 'loop' | 'switch' | 'delay' | 'trigger' | 'approval' | 'review' | 'notification' | 'timer' | 'queue';
/** Node definition */
interface FlowNode<T extends string = string> {
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
interface NodeTypeDefinition<T extends string = string> {
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
interface NodeFieldDefinition {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'money';
    options?: {
        value: string;
        label: string;
    }[];
    placeholder?: string;
    required?: boolean;
}
/** Connection type */
type ConnectionType = 'default' | 'success' | 'failure' | 'conditional' | 'payment' | 'task';
/** Connection definition */
interface Connection {
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
/** Canvas tool modes */
type CanvasTool = 'select' | 'pan' | 'connect' | 'delete' | 'zoom';
/** Canvas state */
interface CanvasState<T extends string = string> {
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
    offset: {
        x: number;
        y: number;
    };
    /** Whether to snap to grid */
    gridSnap: boolean;
    /** Whether to show grid */
    showGrid: boolean;
    /** Grid size in pixels */
    gridSize: number;
    /** Clipboard for copy/paste */
    clipboard: FlowNode<T>[];
}
/** Node event */
interface NodeEvent<T extends string = string> {
    node: FlowNode<T>;
    /** Mouse position relative to canvas */
    position?: {
        x: number;
        y: number;
    };
}
/** Connection event */
interface ConnectionEvent {
    connection: Connection;
    fromNode: FlowNode;
    toNode: FlowNode;
}
/** Canvas event handlers */
interface CanvasEventHandlers<T extends string = string> {
    onNodeAdd?: (type: T, position: {
        x: number;
        y: number;
    }) => void;
    onNodeUpdate?: (id: string, updates: Partial<FlowNode<T>>) => void;
    onNodeDelete?: (id: string) => void;
    onNodeSelect?: (ids: string[]) => void;
    onNodeDoubleClick?: (node: FlowNode<T>) => void;
    onConnectionAdd?: (from: string, to: string, type?: ConnectionType) => void;
    onConnectionDelete?: (id: string) => void;
    onCanvasClick?: (position: {
        x: number;
        y: number;
    }) => void;
    onCanvasPan?: (offset: {
        x: number;
        y: number;
    }) => void;
    onCanvasZoom?: (scale: number) => void;
}
/** Flow canvas props */
interface FlowCanvasProps<T extends string = string> {
    /** Canvas state */
    state: CanvasState<T>;
    /** Registered node types */
    nodeTypes: NodeTypeDefinition<T>[];
    /** Event handlers */
    handlers: CanvasEventHandlers<T>;
    /** Custom node renderer */
    renderNode?: (node: FlowNode<T>, nodeType: NodeTypeDefinition<T> | undefined, isSelected: boolean, isDragging: boolean) => ReactNode;
    /** Custom connection renderer */
    renderConnection?: (connection: Connection, fromNode: FlowNode<T>, toNode: FlowNode<T>) => ReactNode;
    /** Whether mobile mode */
    isMobile?: boolean;
    /** CSS class name */
    className?: string;
}
/** Node palette props */
interface NodePaletteProps<T extends string = string> {
    nodeTypes: NodeTypeDefinition<T>[];
    onNodeAdd: (type: T) => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
}
/** Point in 2D space */
interface Point {
    x: number;
    y: number;
}
/** Rectangle bounds */
interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
/** Get bounds of all nodes */
declare function getNodesBounds<T extends string>(nodes: FlowNode<T>[]): Bounds;

/**
 * Flow Canvas
 *
 * A draggable, zoomable canvas for rendering workflow diagrams.
 *
 * @example
 * ```tsx
 * import { FlowCanvas, useFlowCanvas } from '@b0ase/flow-canvas';
 *
 * function WorkflowEditor() {
 *   const { state, nodeTypes, handlers } = useFlowCanvas();
 *
 *   return (
 *     <FlowCanvas
 *       state={state}
 *       nodeTypes={nodeTypes}
 *       handlers={handlers}
 *     />
 *   );
 * }
 * ```
 */
declare function FlowCanvas<T extends string = string>({ state, nodeTypes, handlers, renderNode, renderConnection, isMobile, className, }: FlowCanvasProps<T>): react_jsx_runtime.JSX.Element;

export { type Bounds as B, type CanvasState as C, type FlowNode as F, type NodeTypeDefinition as N, type Point as P, type CanvasEventHandlers as a, type CanvasTool as b, type ConnectionType as c, type BuiltInNodeType as d, type Connection as e, type ConnectionEvent as f, FlowCanvas as g, type FlowCanvasProps as h, type NodeCategory as i, type NodeEvent as j, type NodeFieldDefinition as k, type NodePaletteProps as l, type NodeStatus as m, getNodesBounds as n };
