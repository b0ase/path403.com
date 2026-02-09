"use client";

// src/types.ts
function getNodesBounds(nodes) {
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
    height: maxY - minY
  };
}

// src/canvas.tsx
import {
  useRef,
  useState,
  useCallback
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var defaultNodeColors = {
  payment: "#eab308",
  contract: "#3b82f6",
  task: "#22c55e",
  decision: "#a855f7",
  milestone: "#6366f1",
  team: "#ec4899",
  organization: "#06b6d4",
  role: "#f97316",
  member: "#84cc16",
  api: "#8b5cf6",
  webhook: "#14b8a6",
  condition: "#f59e0b",
  default: "#6b7280"
};
var connectionColors = {
  default: "stroke-gray-400",
  success: "stroke-green-400",
  failure: "stroke-red-400",
  conditional: "stroke-purple-400",
  payment: "stroke-yellow-400",
  task: "stroke-blue-400"
};
var statusColors = {
  pending: "bg-yellow-400",
  active: "bg-green-400",
  completed: "bg-blue-400",
  failed: "bg-red-400",
  paused: "bg-gray-400"
};
function getNodeColor(type, nodeTypes) {
  const def = nodeTypes.find((n) => n.type === type);
  return def?.color || defaultNodeColors[type] || defaultNodeColors.default;
}
function getConnectionColor(type) {
  return connectionColors[type] || connectionColors.default;
}
function getStatusColor(status) {
  return statusColors[status] || statusColors.pending;
}
function snapToGrid(value, gridSize, enabled) {
  if (!enabled) return value;
  return Math.round(value / gridSize) * gridSize;
}
function FlowCanvas({
  state,
  nodeTypes,
  handlers,
  renderNode,
  renderConnection,
  isMobile = false,
  className = ""
}) {
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(null);
  const getNodePosition = useCallback(
    (id) => {
      return state.nodes.find((n) => n.id === id);
    },
    [state.nodes]
  );
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - state.offset.x) / state.scale;
      const y = (e.clientY - rect.top - state.offset.y) / state.scale;
      if (state.tool === "pan" || state.tool === "select" && e.target === e.currentTarget) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - state.offset.x, y: e.clientY - state.offset.y });
      }
    },
    [state.tool, state.offset, state.scale]
  );
  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning && panStart) {
        const newOffset = {
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        };
        handlers.onCanvasPan?.(newOffset);
      }
      if (state.dragging && dragStart && dragOffset) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - state.offset.x) / state.scale - dragOffset.x;
        const y = (e.clientY - rect.top - state.offset.y) / state.scale - dragOffset.y;
        const snappedX = snapToGrid(x, state.gridSize, state.gridSnap);
        const snappedY = snapToGrid(y, state.gridSize, state.gridSnap);
        handlers.onNodeUpdate?.(state.dragging, { x: snappedX, y: snappedY });
      }
    },
    [
      isPanning,
      panStart,
      state.dragging,
      dragStart,
      dragOffset,
      state.offset,
      state.scale,
      state.gridSize,
      state.gridSnap,
      handlers
    ]
  );
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
    setDragStart(null);
    setDragOffset(null);
  }, []);
  const handleNodeMouseDown = useCallback(
    (e, nodeId) => {
      e.stopPropagation();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const clientX = (e.clientX - rect.left - state.offset.x) / state.scale;
      const clientY = (e.clientY - rect.top - state.offset.y) / state.scale;
      if (state.tool === "delete") {
        handlers.onNodeDelete?.(nodeId);
        return;
      }
      if (state.tool === "connect") {
        if (state.connectingFrom) {
          handlers.onConnectionAdd?.(state.connectingFrom, nodeId);
        } else {
          handlers.onNodeSelect?.([nodeId]);
        }
        return;
      }
      if (state.tool === "select") {
        if (e.ctrlKey || e.metaKey) {
          const isSelected = state.selectedNodes.includes(nodeId);
          const newSelection = isSelected ? state.selectedNodes.filter((id) => id !== nodeId) : [...state.selectedNodes, nodeId];
          handlers.onNodeSelect?.(newSelection);
        } else {
          handlers.onNodeSelect?.([nodeId]);
        }
        setDragStart({ x: clientX, y: clientY });
        setDragOffset({ x: clientX - node.x, y: clientY - node.y });
      }
    },
    [state, handlers]
  );
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(state.scale * delta, 0.1), 3);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newOffset = {
        x: mouseX - (mouseX - state.offset.x) * (newScale / state.scale),
        y: mouseY - (mouseY - state.offset.y) * (newScale / state.scale)
      };
      handlers.onCanvasZoom?.(newScale);
      handlers.onCanvasPan?.(newOffset);
    },
    [state.scale, state.offset, handlers]
  );
  const handleCanvasClick = useCallback(
    (e) => {
      if (e.target !== e.currentTarget) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left - state.offset.x) / state.scale;
      const y = (e.clientY - rect.top - state.offset.y) / state.scale;
      handlers.onCanvasClick?.({ x, y });
      if (state.tool === "select") {
        handlers.onNodeSelect?.([]);
      }
    },
    [state.offset, state.scale, state.tool, handlers]
  );
  const getCursor = () => {
    if (isPanning) return "grabbing";
    switch (state.tool) {
      case "pan":
        return "grab";
      case "connect":
        return "crosshair";
      case "delete":
        return "not-allowed";
      case "zoom":
        return "zoom-in";
      default:
        return "default";
    }
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: canvasRef,
      className: `relative overflow-hidden bg-black/20 ${className}`,
      style: { cursor: getCursor() },
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onClick: handleCanvasClick,
      onWheel: handleWheel,
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              transform: `scale(${state.scale}) translate(${state.offset.x / state.scale}px, ${state.offset.y / state.scale}px)`,
              transformOrigin: "0 0",
              width: "100%",
              height: "100%",
              position: "absolute"
            },
            children: [
              state.showGrid && /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 w-full h-full pointer-events-none opacity-20", children: [
                /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx(
                  "pattern",
                  {
                    id: "flow-canvas-grid",
                    width: state.gridSize,
                    height: state.gridSize,
                    patternUnits: "userSpaceOnUse",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        d: `M ${state.gridSize} 0 L 0 0 0 ${state.gridSize}`,
                        fill: "none",
                        stroke: "white",
                        strokeWidth: "0.5",
                        opacity: "0.3"
                      }
                    )
                  }
                ) }),
                /* @__PURE__ */ jsx("rect", { width: "100%", height: "100%", fill: "url(#flow-canvas-grid)" })
              ] }),
              /* @__PURE__ */ jsxs("svg", { className: "absolute inset-0 w-full h-full pointer-events-none", children: [
                /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx(
                  "marker",
                  {
                    id: "flow-canvas-arrow",
                    markerWidth: "8",
                    markerHeight: "6",
                    refX: "7",
                    refY: "3",
                    orient: "auto",
                    children: /* @__PURE__ */ jsx("polygon", { points: "0 0, 8 3, 0 6", fill: "currentColor", className: "text-white" })
                  }
                ) }),
                state.connections.map((connection) => {
                  const from = getNodePosition(connection.from);
                  const to = getNodePosition(connection.to);
                  if (!from || !to) return null;
                  const fromX = from.x + (from.width || 240) / 2;
                  const fromY = from.y + (from.height || 60) / 2;
                  const toX = to.x + (to.width || 240) / 2;
                  const toY = to.y + (to.height || 60) / 2;
                  if (renderConnection) {
                    return renderConnection(connection, from, to);
                  }
                  return /* @__PURE__ */ jsxs("g", { children: [
                    /* @__PURE__ */ jsx(
                      "line",
                      {
                        x1: fromX,
                        y1: fromY,
                        x2: toX,
                        y2: toY,
                        stroke: "rgba(255, 255, 255, 0.1)",
                        strokeWidth: "4",
                        strokeDasharray: "5,5"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "line",
                      {
                        x1: fromX,
                        y1: fromY,
                        x2: toX,
                        y2: toY,
                        className: getConnectionColor(connection.type),
                        strokeWidth: "2",
                        markerEnd: "url(#flow-canvas-arrow)"
                      }
                    ),
                    connection.label && /* @__PURE__ */ jsx(
                      "text",
                      {
                        x: (fromX + toX) / 2,
                        y: (fromY + toY) / 2 - 10,
                        className: "text-xs fill-white",
                        textAnchor: "middle",
                        children: connection.label
                      }
                    ),
                    connection.amount !== void 0 && /* @__PURE__ */ jsxs(
                      "text",
                      {
                        x: (fromX + toX) / 2,
                        y: (fromY + toY) / 2 + 5,
                        className: "text-xs fill-yellow-400",
                        textAnchor: "middle",
                        children: [
                          "$",
                          connection.amount.toLocaleString()
                        ]
                      }
                    )
                  ] }, connection.id);
                }),
                state.connectingFrom && /* @__PURE__ */ jsx(
                  "line",
                  {
                    x1: getNodePosition(state.connectingFrom)?.x || 0,
                    y1: getNodePosition(state.connectingFrom)?.y || 0,
                    x2: getNodePosition(state.connectingFrom)?.x || 0,
                    y2: getNodePosition(state.connectingFrom)?.y || 0,
                    className: "stroke-green-400",
                    strokeWidth: "2",
                    strokeDasharray: "5,5"
                  }
                )
              ] }),
              state.nodes.map((node) => {
                const nodeType = nodeTypes.find((n) => n.type === node.type);
                const isSelected = state.selectedNode === node.id || state.selectedNodes.includes(node.id);
                const isDragging = state.dragging === node.id;
                const isConnecting = state.connectingFrom === node.id;
                const nodeColor = getNodeColor(node.type, nodeTypes);
                if (renderNode) {
                  return renderNode(node, nodeType, isSelected, isDragging);
                }
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: `absolute bg-black/60 backdrop-blur-xl border rounded-xl transition-all duration-200 shadow-2xl hover:shadow-white/5 ${isSelected ? "border-blue-400/60 ring-2 ring-blue-400/30" : isConnecting ? "ring-2 ring-green-400/50 border-green-400/60" : "border-white/20"} ${state.tool === "delete" ? "hover:border-red-400/60 hover:ring-2 hover:ring-red-400/30" : ""}`,
                    style: {
                      left: snapToGrid(node.x, state.gridSize, state.gridSnap),
                      top: snapToGrid(node.y, state.gridSize, state.gridSnap),
                      width: node.width || 240,
                      minHeight: node.height || 60,
                      transform: isDragging ? "scale(1.05)" : "scale(1)",
                      zIndex: isDragging ? 1e3 : isSelected ? 100 : 10,
                      cursor: state.tool === "select" ? "move" : state.tool === "connect" ? "crosshair" : state.tool === "delete" ? "not-allowed" : "pointer"
                    },
                    onMouseDown: (e) => handleNodeMouseDown(e, node.id),
                    onDoubleClick: () => handlers.onNodeDoubleClick?.(node),
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                          /* @__PURE__ */ jsx("div", { className: `w-2 h-2 rounded-full ${getStatusColor(node.status)}` }),
                          /* @__PURE__ */ jsx(
                            "div",
                            {
                              className: "w-6 h-6 rounded-lg flex items-center justify-center",
                              style: { backgroundColor: `${nodeColor}20` },
                              children: nodeType?.icon ? nodeType.icon : /* @__PURE__ */ jsx("span", { style: { color: nodeColor }, className: "text-xs font-bold", children: node.type[0].toUpperCase() })
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "text-xs px-2 py-0.5 rounded-full",
                            style: { backgroundColor: `${nodeColor}20`, color: nodeColor },
                            children: nodeType?.name || node.type
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "px-3 pb-3 space-y-1", children: [
                        /* @__PURE__ */ jsx("div", { className: "text-white text-sm font-medium truncate", children: node.name }),
                        node.description && /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs truncate", children: node.description }),
                        node.data?.amount != null && /* @__PURE__ */ jsxs("div", { className: "text-yellow-400 text-sm font-medium", children: [
                          "$",
                          Number(node.data.amount).toLocaleString()
                        ] }),
                        node.data?.deadline != null && /* @__PURE__ */ jsxs("div", { className: "text-gray-400 text-xs", children: [
                          "Due: ",
                          new Date(String(node.data.deadline)).toLocaleDateString()
                        ] })
                      ] })
                    ]
                  },
                  node.id
                );
              })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-300 pointer-events-none", children: [
          state.nodes.length,
          " nodes \u2022 ",
          state.connections.length,
          " connections \u2022",
          " ",
          Math.round(state.scale * 100),
          "%"
        ] })
      ]
    }
  );
}

// src/hooks.ts
import { useState as useState2, useCallback as useCallback2, useMemo } from "react";
function createDefaultState() {
  return {
    nodes: [],
    connections: [],
    selectedNode: null,
    selectedNodes: [],
    connectingFrom: null,
    dragging: null,
    tool: "select",
    scale: 1,
    offset: { x: 0, y: 0 },
    gridSnap: true,
    showGrid: true,
    gridSize: 20,
    clipboard: []
  };
}
function useFlowCanvas(options = {}) {
  const { initialState, nodeTypes = [], onChange } = options;
  const [state, setState] = useState2(() => ({
    ...createDefaultState(),
    ...initialState
  }));
  const updateState = useCallback2(
    (updater) => {
      setState((prev) => {
        const next = updater(prev);
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );
  const generateId = useCallback2(() => {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  const addNode = useCallback2(
    (type, position, data) => {
      const id = generateId();
      const nodeDef = nodeTypes.find((n) => n.type === type);
      const newNode = {
        id,
        type,
        name: data?.name || nodeDef?.name || type,
        description: data?.description || nodeDef?.description,
        x: position.x,
        y: position.y,
        width: data?.width || nodeDef?.defaultWidth || 240,
        height: data?.height || nodeDef?.defaultHeight || 60,
        status: data?.status || "pending",
        data: data?.data || {},
        connections: data?.connections || [],
        metadata: data?.metadata || {}
      };
      updateState((prev) => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
        selectedNode: id,
        selectedNodes: [id]
      }));
      return id;
    },
    [generateId, nodeTypes, updateState]
  );
  const updateNode = useCallback2(
    (id, updates) => {
      updateState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) => n.id === id ? { ...n, ...updates } : n)
      }));
    },
    [updateState]
  );
  const deleteNode = useCallback2(
    (id) => {
      updateState((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== id),
        connections: prev.connections.filter((c) => c.from !== id && c.to !== id),
        selectedNode: prev.selectedNode === id ? null : prev.selectedNode,
        selectedNodes: prev.selectedNodes.filter((nid) => nid !== id),
        dragging: prev.dragging === id ? null : prev.dragging,
        connectingFrom: prev.connectingFrom === id ? null : prev.connectingFrom
      }));
    },
    [updateState]
  );
  const deleteNodes = useCallback2(
    (ids) => {
      updateState((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => !ids.includes(n.id)),
        connections: prev.connections.filter((c) => !ids.includes(c.from) && !ids.includes(c.to)),
        selectedNode: ids.includes(prev.selectedNode || "") ? null : prev.selectedNode,
        selectedNodes: prev.selectedNodes.filter((id) => !ids.includes(id)),
        dragging: ids.includes(prev.dragging || "") ? null : prev.dragging,
        connectingFrom: ids.includes(prev.connectingFrom || "") ? null : prev.connectingFrom
      }));
    },
    [updateState]
  );
  const addConnection = useCallback2(
    (from, to, type = "default") => {
      if (from === to) return "";
      const id = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      updateState((prev) => {
        const exists = prev.connections.some((c) => c.from === from && c.to === to);
        if (exists) return prev;
        const newConnection = { id, from, to, type };
        return {
          ...prev,
          connections: [...prev.connections, newConnection],
          connectingFrom: null
        };
      });
      return id;
    },
    [updateState]
  );
  const deleteConnection = useCallback2(
    (id) => {
      updateState((prev) => ({
        ...prev,
        connections: prev.connections.filter((c) => c.id !== id)
      }));
    },
    [updateState]
  );
  const selectNodes = useCallback2(
    (ids) => {
      updateState((prev) => ({
        ...prev,
        selectedNode: ids.length === 1 ? ids[0] : null,
        selectedNodes: ids
      }));
    },
    [updateState]
  );
  const selectAll = useCallback2(() => {
    updateState((prev) => ({
      ...prev,
      selectedNode: null,
      selectedNodes: prev.nodes.map((n) => n.id)
    }));
  }, [updateState]);
  const clearSelection = useCallback2(() => {
    updateState((prev) => ({
      ...prev,
      selectedNode: null,
      selectedNodes: []
    }));
  }, [updateState]);
  const setTool = useCallback2(
    (tool) => {
      updateState((prev) => ({
        ...prev,
        tool,
        connectingFrom: tool !== "connect" ? null : prev.connectingFrom
      }));
    },
    [updateState]
  );
  const setScale = useCallback2(
    (scale) => {
      updateState((prev) => ({
        ...prev,
        scale: Math.min(Math.max(scale, 0.1), 3)
      }));
    },
    [updateState]
  );
  const resetView = useCallback2(() => {
    updateState((prev) => ({
      ...prev,
      scale: 1,
      offset: { x: 0, y: 0 }
    }));
  }, [updateState]);
  const copy = useCallback2(() => {
    updateState((prev) => ({
      ...prev,
      clipboard: prev.nodes.filter((n) => prev.selectedNodes.includes(n.id))
    }));
  }, [updateState]);
  const paste = useCallback2(
    (offset = { x: 20, y: 20 }) => {
      updateState((prev) => {
        if (prev.clipboard.length === 0) return prev;
        const idMap = /* @__PURE__ */ new Map();
        const newNodes = prev.clipboard.map((n) => {
          const newId = generateId();
          idMap.set(n.id, newId);
          return {
            ...n,
            id: newId,
            x: n.x + offset.x,
            y: n.y + offset.y,
            connections: []
          };
        });
        return {
          ...prev,
          nodes: [...prev.nodes, ...newNodes],
          selectedNode: null,
          selectedNodes: newNodes.map((n) => n.id)
        };
      });
    },
    [generateId, updateState]
  );
  const cut = useCallback2(() => {
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
        selectedNodes: []
      };
    });
  }, [updateState]);
  const toggleGrid = useCallback2(() => {
    updateState((prev) => ({ ...prev, showGrid: !prev.showGrid }));
  }, [updateState]);
  const toggleGridSnap = useCallback2(() => {
    updateState((prev) => ({ ...prev, gridSnap: !prev.gridSnap }));
  }, [updateState]);
  const toJSON = useCallback2(() => {
    return JSON.stringify({
      nodes: state.nodes,
      connections: state.connections
    });
  }, [state.nodes, state.connections]);
  const fromJSON = useCallback2(
    (json) => {
      try {
        const data = JSON.parse(json);
        updateState((prev) => ({
          ...prev,
          nodes: data.nodes || [],
          connections: data.connections || [],
          selectedNode: null,
          selectedNodes: []
        }));
      } catch (e) {
        console.error("Failed to parse flow JSON:", e);
      }
    },
    [updateState]
  );
  const handlers = useMemo(
    () => ({
      onNodeAdd: (type, position) => addNode(type, position),
      onNodeUpdate: updateNode,
      onNodeDelete: deleteNode,
      onNodeSelect: selectNodes,
      onNodeDoubleClick: (node) => {
      },
      onConnectionAdd: addConnection,
      onConnectionDelete: deleteConnection,
      onCanvasClick: () => clearSelection(),
      onCanvasPan: (offset) => updateState((prev) => ({ ...prev, offset })),
      onCanvasZoom: setScale
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
    fromJSON
  };
}
export {
  FlowCanvas,
  getNodesBounds,
  useFlowCanvas
};
//# sourceMappingURL=index.js.map