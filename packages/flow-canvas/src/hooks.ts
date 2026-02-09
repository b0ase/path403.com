'use client';

/**
 * @b0ase/flow-canvas - Hooks
 *
 * React hooks for managing flow canvas state.
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  CanvasState,
  FlowNode,
  Connection,
  NodeTypeDefinition,
  CanvasEventHandlers,
  CanvasTool,
  ConnectionType,
} from './types';

// ============================================================================
// Default State
// ============================================================================

function createDefaultState<T extends string>(): CanvasState<T> {
  return {
    nodes: [],
    connections: [],
    selectedNode: null,
    selectedNodes: [],
    connectingFrom: null,
    dragging: null,
    tool: 'select',
    scale: 1,
    offset: { x: 0, y: 0 },
    gridSnap: true,
    showGrid: true,
    gridSize: 20,
    clipboard: [],
  };
}

// ============================================================================
// useFlowCanvas Hook
// ============================================================================

export interface UseFlowCanvasOptions<T extends string> {
  /** Initial state */
  initialState?: Partial<CanvasState<T>>;
  /** Node type definitions */
  nodeTypes?: NodeTypeDefinition<T>[];
  /** Callback when state changes */
  onChange?: (state: CanvasState<T>) => void;
}

export interface UseFlowCanvasReturn<T extends string> {
  state: CanvasState<T>;
  nodeTypes: NodeTypeDefinition<T>[];
  handlers: CanvasEventHandlers<T>;
  // State setters
  setState: React.Dispatch<React.SetStateAction<CanvasState<T>>>;
  setTool: (tool: CanvasTool) => void;
  setScale: (scale: number) => void;
  resetView: () => void;
  // Node operations
  addNode: (type: T, position: { x: number; y: number }, data?: Partial<FlowNode<T>>) => string;
  updateNode: (id: string, updates: Partial<FlowNode<T>>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  // Connection operations
  addConnection: (from: string, to: string, type?: ConnectionType) => string;
  deleteConnection: (id: string) => void;
  // Selection
  selectNodes: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  // Clipboard
  copy: () => void;
  paste: (offset?: { x: number; y: number }) => void;
  cut: () => void;
  // Grid
  toggleGrid: () => void;
  toggleGridSnap: () => void;
  // Serialization
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
export function useFlowCanvas<T extends string = string>(
  options: UseFlowCanvasOptions<T> = {}
): UseFlowCanvasReturn<T> {
  const { initialState, nodeTypes = [], onChange } = options;

  const [state, setState] = useState<CanvasState<T>>(() => ({
    ...createDefaultState<T>(),
    ...initialState,
  }));

  // Notify on state change
  const updateState = useCallback(
    (updater: (prev: CanvasState<T>) => CanvasState<T>) => {
      setState((prev) => {
        const next = updater(prev);
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  // Generate unique ID
  const generateId = useCallback(() => {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Node operations
  const addNode = useCallback(
    (type: T, position: { x: number; y: number }, data?: Partial<FlowNode<T>>): string => {
      const id = generateId();
      const nodeDef = nodeTypes.find((n) => n.type === type);

      const newNode: FlowNode<T> = {
        id,
        type,
        name: data?.name || nodeDef?.name || type,
        description: data?.description || nodeDef?.description,
        x: position.x,
        y: position.y,
        width: data?.width || nodeDef?.defaultWidth || 240,
        height: data?.height || nodeDef?.defaultHeight || 60,
        status: data?.status || 'pending',
        data: data?.data || {},
        connections: data?.connections || [],
        metadata: data?.metadata || {},
      };

      updateState((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
        selectedNode: id,
        selectedNodes: [id],
      }));

      return id;
    },
    [generateId, nodeTypes, updateState]
  );

  const updateNode = useCallback(
    (id: string, updates: Partial<FlowNode<T>>) => {
      updateState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      }));
    },
    [updateState]
  );

  const deleteNode = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== id),
        connections: prev.connections.filter((c) => c.from !== id && c.to !== id),
        selectedNode: prev.selectedNode === id ? null : prev.selectedNode,
        selectedNodes: prev.selectedNodes.filter((nid) => nid !== id),
        dragging: prev.dragging === id ? null : prev.dragging,
        connectingFrom: prev.connectingFrom === id ? null : prev.connectingFrom,
      }));
    },
    [updateState]
  );

  const deleteNodes = useCallback(
    (ids: string[]) => {
      updateState((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => !ids.includes(n.id)),
        connections: prev.connections.filter((c) => !ids.includes(c.from) && !ids.includes(c.to)),
        selectedNode: ids.includes(prev.selectedNode || '') ? null : prev.selectedNode,
        selectedNodes: prev.selectedNodes.filter((id) => !ids.includes(id)),
        dragging: ids.includes(prev.dragging || '') ? null : prev.dragging,
        connectingFrom: ids.includes(prev.connectingFrom || '') ? null : prev.connectingFrom,
      }));
    },
    [updateState]
  );

  // Connection operations
  const addConnection = useCallback(
    (from: string, to: string, type: ConnectionType = 'default'): string => {
      // Don't allow self-connections or duplicate connections
      if (from === to) return '';

      const id = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      updateState((prev) => {
        const exists = prev.connections.some((c) => c.from === from && c.to === to);
        if (exists) return prev;

        const newConnection: Connection = { id, from, to, type };
        return {
          ...prev,
          connections: [...prev.connections, newConnection],
          connectingFrom: null,
        };
      });

      return id;
    },
    [updateState]
  );

  const deleteConnection = useCallback(
    (id: string) => {
      updateState((prev) => ({
        ...prev,
        connections: prev.connections.filter((c) => c.id !== id),
      }));
    },
    [updateState]
  );

  // Selection
  const selectNodes = useCallback(
    (ids: string[]) => {
      updateState((prev) => ({
        ...prev,
        selectedNode: ids.length === 1 ? ids[0] : null,
        selectedNodes: ids,
      }));
    },
    [updateState]
  );

  const selectAll = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      selectedNode: null,
      selectedNodes: prev.nodes.map((n) => n.id),
    }));
  }, [updateState]);

  const clearSelection = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      selectedNode: null,
      selectedNodes: [],
    }));
  }, [updateState]);

  // Tool
  const setTool = useCallback(
    (tool: CanvasTool) => {
      updateState((prev) => ({
        ...prev,
        tool,
        connectingFrom: tool !== 'connect' ? null : prev.connectingFrom,
      }));
    },
    [updateState]
  );

  // Scale/View
  const setScale = useCallback(
    (scale: number) => {
      updateState((prev) => ({
        ...prev,
        scale: Math.min(Math.max(scale, 0.1), 3),
      }));
    },
    [updateState]
  );

  const resetView = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      scale: 1,
      offset: { x: 0, y: 0 },
    }));
  }, [updateState]);

  // Clipboard
  const copy = useCallback(() => {
    updateState((prev) => ({
      ...prev,
      clipboard: prev.nodes.filter((n) => prev.selectedNodes.includes(n.id)),
    }));
  }, [updateState]);

  const paste = useCallback(
    (offset = { x: 20, y: 20 }) => {
      updateState((prev) => {
        if (prev.clipboard.length === 0) return prev;

        const idMap = new Map<string, string>();
        const newNodes = prev.clipboard.map((n) => {
          const newId = generateId();
          idMap.set(n.id, newId);
          return {
            ...n,
            id: newId,
            x: n.x + offset.x,
            y: n.y + offset.y,
            connections: [],
          };
        });

        return {
          ...prev,
          nodes: [...prev.nodes, ...newNodes],
          selectedNode: null,
          selectedNodes: newNodes.map((n) => n.id),
        };
      });
    },
    [generateId, updateState]
  );

  const cut = useCallback(() => {
    updateState((prev) => {
      const clipboard = prev.nodes.filter((n) => prev.selectedNodes.includes(n.id));
      return {
        ...prev,
        clipboard,
        nodes: prev.nodes.filter((n) => !prev.selectedNodes.includes(n.id)),
        connections: prev.connections.filter(
          (c) => !prev.selectedNodes.includes(c.from) && !prev.selectedNodes.includes(c.to)
        ),
        selectedNode: null,
        selectedNodes: [],
      };
    });
  }, [updateState]);

  // Grid
  const toggleGrid = useCallback(() => {
    updateState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, [updateState]);

  const toggleGridSnap = useCallback(() => {
    updateState((prev) => ({ ...prev, gridSnap: !prev.gridSnap }));
  }, [updateState]);

  // Serialization
  const toJSON = useCallback(() => {
    return JSON.stringify({
      nodes: state.nodes,
      connections: state.connections,
    });
  }, [state.nodes, state.connections]);

  const fromJSON = useCallback(
    (json: string) => {
      try {
        const data = JSON.parse(json);
        updateState((prev) => ({
          ...prev,
          nodes: data.nodes || [],
          connections: data.connections || [],
          selectedNode: null,
          selectedNodes: [],
        }));
      } catch (e) {
        console.error('Failed to parse flow JSON:', e);
      }
    },
    [updateState]
  );

  // Event handlers for canvas component
  const handlers: CanvasEventHandlers<T> = useMemo(
    () => ({
      onNodeAdd: (type, position) => addNode(type, position),
      onNodeUpdate: updateNode,
      onNodeDelete: deleteNode,
      onNodeSelect: selectNodes,
      onNodeDoubleClick: (node) => {
        // Can be overridden by consumer
      },
      onConnectionAdd: addConnection,
      onConnectionDelete: deleteConnection,
      onCanvasClick: () => clearSelection(),
      onCanvasPan: (offset) => updateState((prev) => ({ ...prev, offset })),
      onCanvasZoom: setScale,
    }),
    [addNode, updateNode, deleteNode, selectNodes, addConnection, deleteConnection, clearSelection, updateState, setScale]
  );

  return {
    state,
    nodeTypes,
    handlers,
    setState,
    setTool,
    setScale,
    resetView,
    addNode,
    updateNode,
    deleteNode,
    deleteNodes,
    addConnection,
    deleteConnection,
    selectNodes,
    selectAll,
    clearSelection,
    copy,
    paste,
    cut,
    toggleGrid,
    toggleGridSnap,
    toJSON,
    fromJSON,
  };
}
