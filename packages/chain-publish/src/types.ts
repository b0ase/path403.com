/**
 * @b0ase/chain-publish - Type definitions
 *
 * Unified types for blockchain publishing on BSV.
 */

// ============================================================================
// Network & Protocol Types
// ============================================================================

/** BSV network */
export type Network = 'mainnet' | 'testnet';

/** Publishing protocol */
export type Protocol =
  | 'op-return'      // Raw OP_RETURN data
  | '1sat-ordinals'  // 1Sat Ordinal inscriptions
  | 'b://'           // B:// protocol for files
  | 'd://'           // D:// protocol (dynamic)
  | 'bcat'           // Bcat for large files (chunked)
  | 'map'            // Magic Attribute Protocol
  | 'run';           // Run protocol for tokens

/** Content type for inscriptions */
export type ContentType =
  | 'text/plain'
  | 'text/markdown'
  | 'text/html'
  | 'application/json'
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'image/svg+xml'
  | 'audio/mpeg'
  | 'video/mp4'
  | 'application/pdf'
  | string; // Allow custom types

// ============================================================================
// UTXO Types
// ============================================================================

/** Unspent transaction output */
export interface UTXO {
  /** Transaction ID */
  txid: string;
  /** Output index */
  vout: number;
  /** Script (hex) */
  script?: string;
  /** Satoshis */
  satoshis: number;
  /** Block height (if confirmed) */
  height?: number;
}

/** Transaction output */
export interface TxOutput {
  /** Script (hex or asm) */
  script: string;
  /** Satoshis */
  satoshis: number;
}

// ============================================================================
// Publishing Input Types
// ============================================================================

/** Base publishing options */
export interface PublishOptions {
  /** Network (default: mainnet) */
  network?: Network;
  /** Private key (WIF or hex) */
  privateKey: string;
  /** Fee rate in sat/byte (default: 0.5) */
  feeRate?: number;
  /** Minimum fee (default: 500 sats) */
  minFee?: number;
  /** Custom UTXOs (if not fetching from network) */
  utxos?: UTXO[];
  /** Timeout in ms (default: 30000) */
  timeout?: number;
}

/** OP_RETURN publish input */
export interface OpReturnInput {
  /** Protocol identifier (e.g., 'b0ase-agent') */
  protocolId: string;
  /** Content to publish */
  content: string | Uint8Array;
  /** Content type */
  contentType: ContentType;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Ordinal inscription input */
export interface OrdinalInput {
  /** Content to inscribe */
  content: string | Uint8Array;
  /** Content type (MIME) */
  contentType: ContentType;
  /** Inscription metadata */
  metadata?: {
    /** Collection ID */
    collectionId?: string;
    /** Inscription number hint */
    number?: number;
    /** Parent inscription ID */
    parent?: string;
    /** Additional attributes */
    attributes?: Record<string, unknown>;
  };
}

/** B:// protocol input */
export interface BProtocolInput {
  /** File content */
  content: Uint8Array;
  /** Content type */
  contentType: ContentType;
  /** Filename */
  filename?: string;
  /** Encoding (default: binary) */
  encoding?: 'binary' | 'utf-8' | 'base64';
}

/** Bcat input (for large files) */
export interface BcatInput {
  /** File content */
  content: Uint8Array;
  /** Content type */
  contentType: ContentType;
  /** Filename */
  filename?: string;
  /** Chunk size in bytes (default: 100000) */
  chunkSize?: number;
}

// ============================================================================
// Publishing Result Types
// ============================================================================

/** Base publish result */
export interface PublishResult {
  /** Transaction ID */
  txid: string;
  /** Raw transaction hex */
  rawTx: string;
  /** Block explorer URL */
  explorerUrl: string;
  /** Fee paid */
  fee: number;
  /** Content hash (SHA-256) */
  contentHash: string;
}

/** OP_RETURN result */
export interface OpReturnResult extends PublishResult {
  /** Protocol used */
  protocol: 'op-return';
  /** Protocol ID */
  protocolId: string;
}

/** Ordinal result */
export interface OrdinalResult extends PublishResult {
  /** Protocol used */
  protocol: '1sat-ordinals';
  /** Inscription ID */
  inscriptionId: string;
  /** Inscription URL */
  inscriptionUrl: string;
}

/** B:// result */
export interface BProtocolResult extends PublishResult {
  /** Protocol used */
  protocol: 'b://';
  /** B:// URI */
  bUri: string;
}

/** Bcat result */
export interface BcatResult extends PublishResult {
  /** Protocol used */
  protocol: 'bcat';
  /** Transaction IDs for all chunks */
  chunkTxids: string[];
  /** Final Bcat transaction ID */
  bcatTxid: string;
  /** Bcat URI */
  bcatUri: string;
}

/** Union of all results */
export type ChainPublishResult =
  | OpReturnResult
  | OrdinalResult
  | BProtocolResult
  | BcatResult;

// ============================================================================
// Verification Types
// ============================================================================

/** Verification input */
export interface VerifyInput {
  /** Transaction ID to verify */
  txid: string;
  /** Expected content hash */
  expectedHash?: string;
  /** Network */
  network?: Network;
}

/** Verification result */
export interface VerifyResult {
  /** Is valid */
  valid: boolean;
  /** Transaction found */
  found: boolean;
  /** Confirmations */
  confirmations: number;
  /** Block height */
  blockHeight?: number;
  /** Extracted content (if OP_RETURN) */
  content?: string;
  /** Content hash */
  contentHash?: string;
  /** Hash matches expected */
  hashMatches?: boolean;
  /** Error message if invalid */
  error?: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

/** Chain publisher configuration */
export interface ChainPublisherConfig {
  /** Default network */
  network: Network;
  /** API base URL */
  apiBaseUrl: string;
  /** Default fee rate */
  feeRate: number;
  /** Minimum fee */
  minFee: number;
  /** Request timeout */
  timeout: number;
  /** Explorer URL template */
  explorerUrlTemplate: string;
  /** Ordinals URL template */
  ordinalsUrlTemplate: string;
}

/** API provider */
export type ApiProvider = 'whatsonchain' | 'taal' | 'gorillapool' | 'custom';
