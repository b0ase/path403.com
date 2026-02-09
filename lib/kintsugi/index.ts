/**
 * Kintsugi - AI Agent for Economic Coordination
 *
 * Mediates three-party relationships between founders, developers, and investors.
 * Pattern: capture → negotiate → commit → meter → settle
 */

// Core Engine
export {
  KintsugiEngine,
  createKintsugiEngine,
  type KintsugiSession,
  type KintsugiEngineConfig,
  type PartyRole
} from './engine'

// Kimi Client
export {
  KimiClient,
  createKimiClient,
  KIMI_PRICING,
  type KimiProvider,
  type KimiMode,
  type KimiMessage,
  type KimiTool,
  type KimiCompletionOptions,
  type KimiResponse
} from './kimi-client'

// Tools
export {
  contractTools,
  milestoneTools,
  paymentTools,
  disputeTools,
  negotiationTools,
  allKintsugiTools,
  toolCategories
} from './tools'

// Tool Executor
export {
  executeTool,
  executeTools,
  type ToolExecutionResult,
  type ToolExecutionContext
} from './tool-executor'
