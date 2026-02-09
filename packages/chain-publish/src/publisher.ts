/**
 * @b0ase/chain-publish - Publisher implementation
 *
 * Core publishing utilities for BSV blockchain.
 */

import type {
  Network,
  UTXO,
  PublishOptions,
  OpReturnInput,
  OrdinalInput,
  BProtocolInput,
  OpReturnResult,
  OrdinalResult,
  BProtocolResult,
  VerifyInput,
  VerifyResult,
  ChainPublisherConfig,
} from './types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: ChainPublisherConfig = {
  network: 'mainnet',
  apiBaseUrl: 'https://api.whatsonchain.com/v1/bsv/main',
  feeRate: 0.5,
  minFee: 500,
  timeout: 30000,
  explorerUrlTemplate: 'https://whatsonchain.com/tx/{txid}',
  ordinalsUrlTemplate: 'https://1satordinals.com/inscription/{inscriptionId}',
};

const TESTNET_CONFIG: Partial<ChainPublisherConfig> = {
  apiBaseUrl: 'https://api.whatsonchain.com/v1/bsv/test',
  explorerUrlTemplate: 'https://test.whatsonchain.com/tx/{txid}',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Calculate SHA-256 hash
 */
export async function sha256(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = typeof data === 'string' ? encoder.encode(data) : data;

  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle?.digest) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for environments without crypto.subtle
  throw new Error('crypto.subtle not available - use Node.js crypto module');
}

/**
 * Convert content to Uint8Array
 */
function toBytes(content: string | Uint8Array): Uint8Array {
  if (content instanceof Uint8Array) return content;
  return new TextEncoder().encode(content);
}

/**
 * Estimate transaction size
 */
function estimateTxSize(dataSize: number, numInputs: number = 1): number {
  // Base TX overhead + input(s) + OP_RETURN output + change output
  const BASE_OVERHEAD = 10;
  const INPUT_SIZE = 148; // P2PKH input
  const OUTPUT_SIZE = 34; // P2PKH output
  const OP_RETURN_OVERHEAD = 9; // OP_RETURN script prefix

  return (
    BASE_OVERHEAD +
    INPUT_SIZE * numInputs +
    OP_RETURN_OVERHEAD +
    dataSize +
    OUTPUT_SIZE // change output
  );
}

// ============================================================================
// Chain Publisher Class
// ============================================================================

/**
 * Chain Publisher
 *
 * Unified interface for publishing to BSV blockchain.
 * Supports OP_RETURN, Ordinals, B://, and more.
 *
 * Note: This is a type-safe wrapper. Actual transaction signing
 * requires @bsv/sdk or similar library in the consuming application.
 */
export class ChainPublisher {
  private config: ChainPublisherConfig;

  constructor(config: Partial<ChainPublisherConfig> = {}) {
    const network = config.network || 'mainnet';
    const networkConfig = network === 'testnet' ? TESTNET_CONFIG : {};

    this.config = {
      ...DEFAULT_CONFIG,
      ...networkConfig,
      ...config,
    };
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  /**
   * Get explorer URL for a transaction
   */
  getExplorerUrl(txid: string): string {
    return this.config.explorerUrlTemplate.replace('{txid}', txid);
  }

  /**
   * Get ordinals URL for an inscription
   */
  getOrdinalsUrl(inscriptionId: string): string {
    return this.config.ordinalsUrlTemplate.replace('{inscriptionId}', inscriptionId);
  }

  /**
   * Fetch UTXOs for an address
   */
  async fetchUtxos(address: string): Promise<UTXO[]> {
    const url = `${this.config.apiBaseUrl}/address/${address}/unspent`;

    const response = await fetchWithTimeout(url, {}, this.config.timeout);
    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
    }

    const data = (await response.json()) as Array<Record<string, unknown>>;
    return data.map((utxo) => ({
      txid: utxo.tx_hash as string,
      vout: utxo.tx_pos as number,
      satoshis: utxo.value as number,
      height: utxo.height as number | undefined,
    }));
  }

  /**
   * Broadcast raw transaction
   */
  async broadcast(rawTx: string): Promise<string> {
    const url = `${this.config.apiBaseUrl}/tx/raw`;

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txhex: rawTx }),
      },
      this.config.timeout
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to broadcast: ${response.statusText} - ${errorText}`);
    }

    const txid = await response.text();
    return txid.replace(/"/g, '');
  }

  /**
   * Get transaction details
   */
  async getTransaction(txid: string): Promise<Record<string, unknown> | null> {
    const url = `${this.config.apiBaseUrl}/tx/${txid}`;

    const response = await fetchWithTimeout(url, {}, this.config.timeout);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to get transaction: ${response.statusText}`);
    }

    return (await response.json()) as Record<string, unknown>;
  }

  /**
   * Calculate fee for data size
   */
  calculateFee(dataSize: number, numInputs: number = 1): number {
    const txSize = estimateTxSize(dataSize, numInputs);
    const fee = Math.ceil(txSize * this.config.feeRate);
    return Math.max(fee, this.config.minFee);
  }

  /**
   * Build OP_RETURN script data
   *
   * Creates the data portion for an OP_RETURN output.
   * Format: [protocolId, contentType, content, ...metadata]
   */
  buildOpReturnData(input: OpReturnInput): Uint8Array[] {
    const parts: Uint8Array[] = [];

    // Protocol ID
    parts.push(new TextEncoder().encode(input.protocolId));

    // Content type
    parts.push(new TextEncoder().encode(input.contentType));

    // Content
    parts.push(toBytes(input.content));

    // Metadata (if any)
    if (input.metadata) {
      parts.push(new TextEncoder().encode(JSON.stringify(input.metadata)));
    }

    return parts;
  }

  /**
   * Build ordinal inscription data
   *
   * Creates data for 1Sat Ordinal inscription.
   */
  buildOrdinalData(input: OrdinalInput): {
    contentType: string;
    content: Uint8Array;
    metadata?: string;
  } {
    return {
      contentType: input.contentType,
      content: toBytes(input.content),
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    };
  }

  /**
   * Build B:// protocol data
   *
   * Format: OP_FALSE OP_RETURN "19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut" <data> <media_type> <encoding> [filename]
   */
  buildBProtocolData(input: BProtocolInput): Uint8Array[] {
    const B_PREFIX = '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut';
    const parts: Uint8Array[] = [];

    // B:// prefix
    parts.push(new TextEncoder().encode(B_PREFIX));

    // Content
    parts.push(input.content);

    // Media type
    parts.push(new TextEncoder().encode(input.contentType));

    // Encoding
    parts.push(new TextEncoder().encode(input.encoding || 'binary'));

    // Filename (optional)
    if (input.filename) {
      parts.push(new TextEncoder().encode(input.filename));
    }

    return parts;
  }

  /**
   * Verify an inscription/transaction
   */
  async verify(input: VerifyInput): Promise<VerifyResult> {
    try {
      const tx = await this.getTransaction(input.txid);

      if (!tx) {
        return {
          valid: false,
          found: false,
          confirmations: 0,
          error: 'Transaction not found',
        };
      }

      const confirmations = (tx.confirmations as number) || 0;
      const blockHeight = tx.blockheight as number | undefined;

      // Extract OP_RETURN data if present
      let content: string | undefined;
      let contentHash: string | undefined;

      const outputs = tx.vout as Array<{ scriptPubKey: { asm: string; hex: string } }>;
      for (const output of outputs) {
        const asm = output.scriptPubKey?.asm || '';
        if (asm.startsWith('OP_RETURN') || asm.startsWith('0 OP_RETURN')) {
          // Extract hex data after OP_RETURN
          const hex = output.scriptPubKey?.hex || '';
          if (hex.length > 4) {
            // Skip OP_RETURN prefix
            const dataHex = hex.slice(4);
            content = Buffer.from(dataHex, 'hex').toString('utf-8');
            contentHash = await sha256(content);
          }
        }
      }

      const hashMatches = input.expectedHash
        ? contentHash === input.expectedHash
        : undefined;

      return {
        valid: true,
        found: true,
        confirmations,
        blockHeight,
        content,
        contentHash,
        hashMatches,
      };
    } catch (error) {
      return {
        valid: false,
        found: false,
        confirmations: 0,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a chain publisher for mainnet
 */
export function createMainnetPublisher(
  config?: Partial<ChainPublisherConfig>
): ChainPublisher {
  return new ChainPublisher({ ...config, network: 'mainnet' });
}

/**
 * Create a chain publisher for testnet
 */
export function createTestnetPublisher(
  config?: Partial<ChainPublisherConfig>
): ChainPublisher {
  return new ChainPublisher({ ...config, network: 'testnet' });
}

// ============================================================================
// Standalone Utilities
// ============================================================================

/**
 * Generate inscription ID from txid and output index
 */
export function generateInscriptionId(txid: string, vout: number = 0): string {
  return `${txid}i${vout}`;
}

/**
 * Parse inscription ID to txid and output index
 */
export function parseInscriptionId(inscriptionId: string): {
  txid: string;
  vout: number;
} {
  const match = inscriptionId.match(/^([a-f0-9]{64})i(\d+)$/);
  if (!match) {
    throw new Error(`Invalid inscription ID: ${inscriptionId}`);
  }
  return {
    txid: match[1],
    vout: parseInt(match[2], 10),
  };
}

/**
 * Format satoshis as BSV
 */
export function satsToBsv(sats: number): string {
  return (sats / 100000000).toFixed(8);
}

/**
 * Convert BSV to satoshis
 */
export function bsvToSats(bsv: number): number {
  return Math.round(bsv * 100000000);
}
