/**
 * @b0ase/chain-publish
 *
 * Unified blockchain publishing for BSV.
 * Supports OP_RETURN, Ordinals, B://, D://, and Bcat protocols.
 *
 * @example
 * ```typescript
 * import {
 *   ChainPublisher,
 *   createMainnetPublisher,
 *   sha256,
 * } from '@b0ase/chain-publish';
 *
 * // Create publisher
 * const publisher = createMainnetPublisher();
 *
 * // Fetch UTXOs
 * const utxos = await publisher.fetchUtxos(address);
 *
 * // Build OP_RETURN data
 * const opReturnData = publisher.buildOpReturnData({
 *   protocolId: 'my-protocol',
 *   content: JSON.stringify({ message: 'Hello blockchain!' }),
 *   contentType: 'application/json',
 * });
 *
 * // Calculate fee
 * const contentSize = new TextEncoder().encode(JSON.stringify(data)).length;
 * const fee = publisher.calculateFee(contentSize);
 *
 * // Build and sign transaction (using @bsv/sdk or similar)
 * // const tx = new Transaction()...
 *
 * // Broadcast
 * const txid = await publisher.broadcast(rawTxHex);
 *
 * // Get explorer URL
 * const url = publisher.getExplorerUrl(txid);
 *
 * // Verify inscription
 * const result = await publisher.verify({ txid });
 * console.log(result.confirmations);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Network & protocol
  Network,
  Protocol,
  ContentType,

  // UTXO types
  UTXO,
  TxOutput,

  // Input types
  PublishOptions,
  OpReturnInput,
  OrdinalInput,
  BProtocolInput,
  BcatInput,

  // Result types
  PublishResult,
  OpReturnResult,
  OrdinalResult,
  BProtocolResult,
  BcatResult,
  ChainPublishResult,

  // Verification
  VerifyInput,
  VerifyResult,

  // Configuration
  ChainPublisherConfig,
  ApiProvider,
} from './types';

// ============================================================================
// Publisher Exports
// ============================================================================

export {
  // Main class
  ChainPublisher,

  // Factory functions
  createMainnetPublisher,
  createTestnetPublisher,

  // Utilities
  sha256,
  generateInscriptionId,
  parseInscriptionId,
  satsToBsv,
  bsvToSats,
} from './publisher';
