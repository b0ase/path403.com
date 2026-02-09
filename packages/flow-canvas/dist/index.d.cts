import { C as CanvasState, N as NodeTypeDefinition, a as CanvasEventHandlers, b as CanvasTool, F as FlowNode, c as ConnectionType } from './canvas-S2hq11QB.cjs';
export { B as Bounds, d as BuiltInNodeType, e as Connection, f as ConnectionEvent, g as FlowCanvas, h as FlowCanvasProps, i as NodeCategory, j as NodeEvent, k as NodeFieldDefinition, l as NodePaletteProps, m as NodeStatus, P as Point, n as getNodesBounds } from './canvas-S2hq11QB.cjs';
import 'react/jsx-runtime';
import 'react';

interface UseFlowCanvasOptions<T extends string> {
    /** Initial state */
    initialState?: Partial<CanvasState<T>>;
    /** Node type definitions */
    nodeTypes?: NodeTypeDefinition<T>[];
    /** Callback when state changes */
    onChange?: (state: CanvasState<T>) => void;
}
interface UseFlowCanvasReturn<T extends string> {
    state: CanvasState<T>;
    nodeTypes: NodeTypeDefinition<T>[];
    handlers: CanvasEventHandlers<T>;
    setState: React.Dispatch<React.SetStateAction<CanvasState<T>>>;
    setTool: (tool: CanvasTool) => void;
    setScale: (scale: number) => void;
    resetView: () => void;
    addNode: (type: T, position: {
        x: number;
        y: number;
    }, data?: Partial<FlowNode<T>>) => string;
    updateNode: (id: string, updates: Partial<FlowNode<T>>) => void;
    deleteNode: (id: string) => void;
    deleteNodes: (ids: string[]) => void;
    addConnection: (from: string, to: string, type?: ConnectionType) => string;
    deleteConnection: (id: string) => void;
    selectNodes: (ids: string[]) => void;
    selectAll: () => void;
    clearSelection: () => void;
    copy: () => void;
    paste: (offset?: {
        x: number;
        y: number;
    }) => void;
    cut: () => void;
    toggleGrid: () => void;
    toggleGridSnap: () => void;
    toJSON: () => string;
    fromJSON: (json: string) => void;
}
/**
 * Hook for managing flow canvas state
 *
 * @example
 * ```tsx
 * const { state, handlers, addNode, setTool } = useFlowCanvas({
 *   nodeTypes: myNodeTypes,
 *   onChange: (state) => saveToDatabase(state),
 * });
 *
 * return <FlowCanvas state={state} nodeTypes={nodeTypes} handlers={handlers} />;
 * ```
 */
declare function useFlowCanvas<T extends string = string>(options?: UseFlowCanvasOptions<T>): UseFlowCanvasReturn<T>;

export { CanvasEventHandlers, CanvasState, CanvasTool, ConnectionType, FlowNode, NodeTypeDefinition, type UseFlowCanvasOptions, type UseFlowCanvasReturn, useFlowCanvas };
