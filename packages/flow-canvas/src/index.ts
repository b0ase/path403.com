/**
 * @b0ase/flow-canvas
 *
 * SVG-based workflow canvas with nodes, connections, and drag-drop support.
 *
 * @example
 * ```tsx
 * import { FlowCanvas, useFlowCanvas } from '@b0ase/flow-canvas';
 *
 * const nodeTypes = [
 *   { type: 'payment', name: 'Payment', category: 'basic', color: '#eab308' },
 *   { type: 'task', name: 'Task', category: 'basic', color: '#22c55e' },
 *   { type: 'decision', name: 'Decision', category: 'logic', color: '#a855f7' },
 * ];
 *
 * function WorkflowEditor() {
 *   const { state, handlers, addNode, setTool } = useFlowCanvas({
 *     nodeTypes,
 *   });
 *
 *   return (
 *     <div className="h-screen">
 *       <div className="flex gap-2 p-4">
 *         <button onClick={() => setTool('select')}>Select</button>
 *         <button onClick={() => setTool('connect')}>Connect</button>
 *         <button onClick={() => addNode('payment', { x: 100, y: 100 })}>
 *           Add Payment
 *         </button>
 *       </div>
 *       <FlowCanvas
 *         state={state}
 *         nodeTypes={nodeTypes}
 *         handlers={handlers}
 *         className="flex-1"
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// Types
export type {
  // Node types
  NodeCategory,
  NodeStatus,
  BuiltInNodeType,
  FlowNode,
  NodeTypeDefinition,
  NodeFieldDefinition,
  // Connection types
  ConnectionType,
  Connection,
  // Canvas state
  CanvasTool,
  CanvasState,
  // Events
  NodeEvent,
  ConnectionEvent,
  CanvasEventHandlers,
  // Props
  FlowCanvasProps,
  NodePaletteProps,
  // Utility types
  Point,
  Bounds,
} from './types';

// Utilities
export { getNodesBounds } from './types';

// Components
export { FlowCanvas } from './canvas';

// Hooks
export { useFlowCanvas } from './hooks';
export type { UseFlowCanvasOptions, UseFlowCanvasReturn } from './hooks';
