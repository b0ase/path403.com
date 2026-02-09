/**
 * @b0ase/chain-publish - Type definitions
 *
 * Unified types for blockchain publishing on BSV.
 */
/** BSV network */
type Network = 'mainnet' | 'testnet';
/** Publishing protocol */
type Protocol = 'op-return' | '1sat-ordinals' | 'b://' | 'd://' | 'bcat' | 'map' | 'run';
/** Content type for inscriptions */
type ContentType = 'text/plain' | 'text/markdown' | 'text/html' | 'application/json' | 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'image/svg+xml' | 'audio/mpeg' | 'video/mp4' | 'application/pdf' | string;
/** Unspent transaction output */
interface UTXO {
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
interface TxOutput {
    /** Script (hex or asm) */
    script: string;
    /** Satoshis */
    satoshis: number;
}
/** Base publishing options */
interface PublishOptions {
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
interface OpReturnInput {
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
interface OrdinalInput {
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
interface BProtocolInput {
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
interface BcatInput {
    /** File content */
    content: Uint8Array;
    /** Content type */
    contentType: ContentType;
    /** Filename */
    filename?: string;
    /** Chunk size in bytes (default: 100000) */
    chunkSize?: number;
}
/** Base publish result */
interface PublishResult {
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
interface OpReturnResult extends PublishResult {
    /** Protocol used */
    protocol: 'op-return';
    /** Protocol ID */
    protocolId: string;
}
/** Ordinal result */
interface OrdinalResult extends PublishResult {
    /** Protocol used */
    protocol: '1sat-ordinals';
    /** Inscription ID */
    inscriptionId: string;
    /** Inscription URL */
    inscriptionUrl: string;
}
/** B:// result */
interface BProtocolResult extends PublishResult {
    /** Protocol used */
    protocol: 'b://';
    /** B:// URI */
    bUri: string;
}
/** Bcat result */
interface BcatResult extends PublishResult {
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
type ChainPublishResult = OpReturnResult | OrdinalResult | BProtocolResult | BcatResult;
/** Verification input */
interface VerifyInput {
    /** Transaction ID to verify */
    txid: string;
    /** Expected content hash */
    expectedHash?: string;
    /** Network */
    network?: Network;
}
/** Verification result */
interface VerifyResult {
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
/** Chain publisher configuration */
interface ChainPublisherConfig {
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
type ApiProvider = 'whatsonchain' | 'taal' | 'gorillapool' | 'custom';

/**
 * @b0ase/chain-publish - Publisher implementation
 *
 * Core publishing utilities for BSV blockchain.
 */

/**
 * Calculate SHA-256 hash
 */
declare function sha256(data: string | Uint8Array): Promise<string>;
/**
 * Chain Publisher
 *
 * Unified interface for publishing to BSV blockchain.
 * Supports OP_RETURN, Ordinals, B://, and more.
 *
 * Note: This is a type-safe wrapper. Actual transaction signing
 * requires @bsv/sdk or similar library in the consuming application.
 */
declare class ChainPublisher {
    private config;
    constructor(config?: Partial<ChainPublisherConfig>);
    /**
     * Get API base URL
     */
    getApiBaseUrl(): string;
    /**
     * Get explorer URL for a transaction
     */
    getExplorerUrl(txid: string): string;
    /**
     * Get ordinals URL for an inscription
     */
    getOrdinalsUrl(inscriptionId: string): string;
    /**
     * Fetch UTXOs for an address
     */
    fetchUtxos(address: string): Promise<UTXO[]>;
    /**
     * Broadcast raw transaction
     */
    broadcast(rawTx: string): Promise<string>;
    /**
     * Get transaction details
     */
    getTransaction(txid: string): Promise<Record<string, unknown> | null>;
    /**
     * Calculate fee for data size
     */
    calculateFee(dataSize: number, numInputs?: number): number;
    /**
     * Build OP_RETURN script data
     *
     * Creates the data portion for an OP_RETURN output.
     * Format: [protocolId, contentType, content, ...metadata]
     */
    buildOpReturnData(input: OpReturnInput): Uint8Array[];
    /**
     * Build ordinal inscription data
     *
     * Creates data for 1Sat Ordinal inscription.
     */
    buildOrdinalData(input: OrdinalInput): {
        contentType: string;
        content: Uint8Array;
        metadata?: string;
    };
    /**
     * Build B:// protocol data
     *
     * Format: OP_FALSE OP_RETURN "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut" <data> <media_type> <encoding> [filename]
     */
    buildBProtocolData(input: BProtocolInput): Uint8Array[];
    /**
     * Verify an inscription/transaction
     */
    verify(input: VerifyInput): Promise<VerifyResult>;
}
/**
 * Create a chain publisher for mainnet
 */
declare function createMainnetPublisher(config?: Partial<ChainPublisherConfig>): ChainPublisher;
/**
 * Create a chain publisher for testnet
 */
declare function createTestnetPublisher(config?: Partial<ChainPublisherConfig>): ChainPublisher;
/**
 * Generate inscription ID from txid and output index
 */
declare function generateInscriptionId(txid: string, vout?: number): string;
/**
 * Parse inscription ID to txid and output index
 */
declare function parseInscriptionId(inscriptionId: string): {
    txid: string;
    vout: number;
};
/**
 * Format satoshis as BSV
 */
declare function satsToBsv(sats: number): string;
/**
 * Convert BSV to satoshis
 */
declare function bsvToSats(bsv: number): number;

export { type ApiProvider, type BProtocolInput, type BProtocolResult, type BcatInput, type BcatResult, type ChainPublishResult, ChainPublisher, type ChainPublisherConfig, type ContentType, type Network, type OpReturnInput, type OpReturnResult, type OrdinalInput, type OrdinalResult, type Protocol, type PublishOptions, type PublishResult, type TxOutput, type UTXO, type VerifyInput, type VerifyResult, bsvToSats, createMainnetPublisher, createTestnetPublisher, generateInscriptionId, parseInscriptionId, satsToBsv, sha256 };
