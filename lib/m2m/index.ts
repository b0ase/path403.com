/**
 * Machine-to-Machine Infrastructure
 *
 * Pattern: capture → normalise → commit → prove → settle
 *
 * This module provides invisible BSV settlement for any external event.
 */

// Event Capture
export {
  captureEvent,
  captureAndNormalise,
  captureStripeWebhook,
  captureAgentAction,
  normaliseEvent,
  getPendingEvents,
  type CaptureEventInput,
  type CapturedEvent,
  type EventSource,
  type EventStatus
} from './event-capture'

// Batch Committer
export {
  createBatch,
  commitBatch,
  captureAndCommit,
  getMerkleProof,
  processPendingBatches,
  type CommitBatch,
  type MerkleNode
} from './batch-committer'

// UTXO Metering
export {
  meter,
  startMeter,
  completeMeter,
  meterAgentTask,
  meterApiCall,
  meterInscription,
  meterPayment,
  getAgentUsage,
  getUnbilledMeters,
  markBilled,
  calculatePeriodCost,
  generateInvoice,
  type MeterAction,
  type MeterInput,
  type MeterEntry,
  type UsageSummary
} from './utxo-meter'

// Proof Lookup
export {
  lookupAnchor,
  verifyAnchor,
  verifyMerkleProof,
  getAnchorsForSource,
  getAnchorStats,
  getTxDetails,
  getOpReturnData,
  formatProofResponse,
  type AnchorProof,
  type VerificationResult
} from './proof-lookup'

// Agent Integration
export {
  executeAgentTaskMetered,
  meterAgentInscription,
  meterAgentAction,
  getAgentDashboardStats,
  createMeteringHook
} from './agent-integration'
