/**
 * @b0ase/whatsonchain
 *
 * WhatsOnChain BSV API client.
 *
 * @example
 * ```typescript
 * import { WhatsOnChain, createMainnetClient } from '@b0ase/whatsonchain';
 *
 * const woc = createMainnetClient();
 *
 * // Get address balance
 * const balance = await woc.getAddressBalance(address);
 * console.log(`Balance: ${balance.confirmed} sats`);
 *
 * // Get UTXOs
 * const utxos = await woc.getAddressUtxos(address);
 *
 * // Broadcast transaction
 * const txid = await woc.broadcastTx(rawTxHex);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Network type */
export type Network = 'main' | 'test' | 'stn';

/** Address balance */
export interface AddressBalance {
  confirmed: number;
  unconfirmed: number;
}

/** UTXO */
export interface UTXO {
  tx_hash: string;
  tx_pos: number;
  value: number;
  height: number;
}

/** Transaction output */
export interface TxOutput {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    type: string;
    addresses?: string[];
  };
}

/** Transaction input */
export interface TxInput {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
}

/** Transaction */
export interface Transaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  locktime: number;
  vin: TxInput[];
  vout: TxOutput[];
  blockhash?: string;
  blockheight?: number;
  confirmations?: number;
  time?: number;
  blocktime?: number;
}

/** Block header */
export interface BlockHeader {
  hash: string;
  confirmations: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  previousblockhash?: string;
  nextblockhash?: string;
}

/** Chain info */
export interface ChainInfo {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  verificationprogress: number;
  chainwork: string;
}

/** Exchange rate */
export interface ExchangeRate {
  currency: string;
  rate: number;
}

/** Client configuration */
export interface WocConfig {
  network: Network;
  apiKey?: string;
  timeout?: number;
}

// ============================================================================
// Constants
// ============================================================================

const API_URLS: Record<Network, string> = {
  main: 'https://api.whatsonchain.com/v1/bsv/main',
  test: 'https://api.whatsonchain.com/v1/bsv/test',
  stn: 'https://api.whatsonchain.com/v1/bsv/stn',
};

const DEFAULT_TIMEOUT = 30000;

// ============================================================================
// WhatsOnChain Client
// ============================================================================

/**
 * WhatsOnChain API Client
 */
export class WhatsOnChain {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;

  constructor(config: WocConfig) {
    this.baseUrl = API_URLS[config.network];
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Fetch with timeout and error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['woc-api-key'] = this.apiKey;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`WoC API error: ${response.status} - ${error}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      throw error;
    }
  }

  // ==========================================================================
  // Chain Info
  // ==========================================================================

  /**
   * Get chain info
   */
  async getChainInfo(): Promise<ChainInfo> {
    return this.fetch<ChainInfo>('/chain/info');
  }

  /**
   * Get current block height
   */
  async getBlockHeight(): Promise<number> {
    const info = await this.getChainInfo();
    return info.blocks;
  }

  // ==========================================================================
  // Address APIs
  // ==========================================================================

  /**
   * Get address balance
   */
  async getAddressBalance(address: string): Promise<AddressBalance> {
    return this.fetch<AddressBalance>(`/address/${address}/balance`);
  }

  /**
   * Get address UTXOs
   */
  async getAddressUtxos(address: string): Promise<UTXO[]> {
    return this.fetch<UTXO[]>(`/address/${address}/unspent`);
  }

  /**
   * Get address history (transaction hashes)
   */
  async getAddressHistory(address: string): Promise<{ tx_hash: string }[]> {
    return this.fetch<{ tx_hash: string }[]>(`/address/${address}/history`);
  }

  /**
   * Check if address has been used
   */
  async isAddressUsed(address: string): Promise<boolean> {
    const history = await this.getAddressHistory(address);
    return history.length > 0;
  }

  // ==========================================================================
  // Transaction APIs
  // ==========================================================================

  /**
   * Get transaction by ID
   */
  async getTransaction(txid: string): Promise<Transaction> {
    return this.fetch<Transaction>(`/tx/${txid}`);
  }

  /**
   * Get raw transaction hex
   */
  async getRawTransaction(txid: string): Promise<string> {
    return this.fetch<string>(`/tx/${txid}/hex`);
  }

  /**
   * Broadcast raw transaction
   */
  async broadcastTx(txhex: string): Promise<string> {
    const result = await this.fetch<string>('/tx/raw', {
      method: 'POST',
      body: JSON.stringify({ txhex }),
    });
    return result.replace(/"/g, '');
  }

  /**
   * Get transaction confirmations
   */
  async getConfirmations(txid: string): Promise<number> {
    const tx = await this.getTransaction(txid);
    return tx.confirmations || 0;
  }

  /**
   * Check if transaction is confirmed
   */
  async isConfirmed(txid: string, minConfirmations: number = 1): Promise<boolean> {
    const confirmations = await this.getConfirmations(txid);
    return confirmations >= minConfirmations;
  }

  // ==========================================================================
  // Block APIs
  // ==========================================================================

  /**
   * Get block header by hash
   */
  async getBlockHeader(hash: string): Promise<BlockHeader> {
    return this.fetch<BlockHeader>(`/block/${hash}/header`);
  }

  /**
   * Get block header by height
   */
  async getBlockHeaderByHeight(height: number): Promise<BlockHeader> {
    return this.fetch<BlockHeader>(`/block/height/${height}`);
  }

  // ==========================================================================
  // Exchange Rate APIs
  // ==========================================================================

  /**
   * Get BSV exchange rate
   */
  async getExchangeRate(): Promise<ExchangeRate> {
    return this.fetch<ExchangeRate>('/exchangerate');
  }

  /**
   * Get BSV price in USD
   */
  async getBsvPriceUsd(): Promise<number> {
    const rate = await this.getExchangeRate();
    return rate.rate;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get explorer URL for transaction
   */
  getTxUrl(txid: string): string {
    const network = this.baseUrl.includes('/test') ? 'test' : 'main';
    const domain =
      network === 'test' ? 'test.whatsonchain.com' : 'whatsonchain.com';
    return `https://${domain}/tx/${txid}`;
  }

  /**
   * Get explorer URL for address
   */
  getAddressUrl(address: string): string {
    const network = this.baseUrl.includes('/test') ? 'test' : 'main';
    const domain =
      network === 'test' ? 'test.whatsonchain.com' : 'whatsonchain.com';
    return `https://${domain}/address/${address}`;
  }

  /**
   * Get explorer URL for block
   */
  getBlockUrl(hashOrHeight: string | number): string {
    const network = this.baseUrl.includes('/test') ? 'test' : 'main';
    const domain =
      network === 'test' ? 'test.whatsonchain.com' : 'whatsonchain.com';
    return `https://${domain}/block/${hashOrHeight}`;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create mainnet client
 */
export function createMainnetClient(apiKey?: string): WhatsOnChain {
  return new WhatsOnChain({ network: 'main', apiKey });
}

/**
 * Create testnet client
 */
export function createTestnetClient(apiKey?: string): WhatsOnChain {
  return new WhatsOnChain({ network: 'test', apiKey });
}

/**
 * Create client for any network
 */
export function createClient(
  network: Network,
  apiKey?: string
): WhatsOnChain {
  return new WhatsOnChain({ network, apiKey });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert satoshis to BSV
 */
export function satsToBsv(sats: number): number {
  return sats / 100000000;
}

/**
 * Convert BSV to satoshis
 */
export function bsvToSats(bsv: number): number {
  return Math.round(bsv * 100000000);
}

/**
 * Format satoshis as BSV string
 */
export function formatBsv(sats: number, decimals: number = 8): string {
  return satsToBsv(sats).toFixed(decimals);
}

/**
 * Validate BSV address format (basic check)
 */
export function isValidAddress(address: string): boolean {
  // BSV addresses start with 1 (P2PKH) or 3 (P2SH)
  if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return false;
  }
  return true;
}

/**
 * Validate transaction ID format
 */
export function isValidTxid(txid: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(txid);
}
