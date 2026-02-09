/**
 * @b0ase/mempool-service
 *
 * Mempool monitoring service with fee estimation and transaction tracking.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Network type */
export type Network = 'mainnet' | 'testnet' | 'signet';

/** Fee rates in sat/vB */
export interface FeeRates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

/** Mempool info */
export interface MempoolInfo {
  count: number;
  vsize: number;
  totalFee: number;
  feeHistogram: Array<[number, number]>;
}

/** Transaction status */
export interface TxStatus {
  confirmed: boolean;
  blockHeight?: number;
  blockHash?: string;
  blockTime?: number;
}

/** Transaction details */
export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  size: number;
  weight: number;
  fee: number;
  status: TxStatus;
  vin: TxInput[];
  vout: TxOutput[];
}

/** Transaction input */
export interface TxInput {
  txid: string;
  vout: number;
  prevout?: TxOutput;
  scriptsig: string;
  scriptsigAsm: string;
  witness?: string[];
  isCoinbase: boolean;
  sequence: number;
}

/** Transaction output */
export interface TxOutput {
  scriptpubkey: string;
  scriptpubkeyAsm: string;
  scriptpubkeyType: string;
  scriptpubkeyAddress?: string;
  value: number;
}

/** Block details */
export interface Block {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  txCount: number;
  size: number;
  weight: number;
  merkleRoot: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}

/** Address info */
export interface AddressInfo {
  address: string;
  chainStats: {
    fundedTxoCount: number;
    fundedTxoSum: number;
    spentTxoCount: number;
    spentTxoSum: number;
    txCount: number;
  };
  mempoolStats: {
    fundedTxoCount: number;
    fundedTxoSum: number;
    spentTxoCount: number;
    spentTxoSum: number;
    txCount: number;
  };
}

/** UTXO */
export interface UTXO {
  txid: string;
  vout: number;
  status: TxStatus;
  value: number;
}

/** WebSocket message */
export interface WSMessage {
  type: 'block' | 'tx' | 'address-tx' | 'mempool';
  data: unknown;
}

/** Client options */
export interface MempoolClientOptions {
  network?: Network;
  baseUrl?: string;
  wsUrl?: string;
  timeout?: number;
}

/** Event types */
export type MempoolEvent = 'block' | 'tx' | 'address-tx' | 'connected' | 'disconnected' | 'error';

/** Event listener */
export type MempoolEventListener = (data: unknown) => void;

// ============================================================================
// Default Configuration
// ============================================================================

export const NETWORK_URLS: Record<Network, { api: string; ws: string }> = {
  mainnet: {
    api: 'https://mempool.space/api',
    ws: 'wss://mempool.space/api/v1/ws',
  },
  testnet: {
    api: 'https://mempool.space/testnet/api',
    ws: 'wss://mempool.space/testnet/api/v1/ws',
  },
  signet: {
    api: 'https://mempool.space/signet/api',
    ws: 'wss://mempool.space/signet/api/v1/ws',
  },
};

// ============================================================================
// Mempool Client
// ============================================================================

export class MempoolClient {
  private network: Network;
  private baseUrl: string;
  private wsUrl: string;
  private timeout: number;
  private ws: WebSocket | null = null;
  private listeners: Map<MempoolEvent, Set<MempoolEventListener>> = new Map();
  private subscriptions: {
    blocks: boolean;
    mempool: boolean;
    addresses: Set<string>;
  } = { blocks: false, mempool: false, addresses: new Set() };

  constructor(options: MempoolClientOptions = {}) {
    this.network = options.network || 'mainnet';
    this.baseUrl = options.baseUrl || NETWORK_URLS[this.network].api;
    this.wsUrl = options.wsUrl || NETWORK_URLS[this.network].ws;
    this.timeout = options.timeout || 30000;
  }

  // ==========================================================================
  // HTTP Helpers
  // ==========================================================================

  private async request<T>(endpoint: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ==========================================================================
  // Fee Estimation
  // ==========================================================================

  async getFeeRates(): Promise<FeeRates> {
    return this.request<FeeRates>('/v1/fees/recommended');
  }

  async getMempoolBlocks(): Promise<Array<{ blockSize: number; blockVSize: number; feeRange: number[] }>> {
    return this.request('/v1/fees/mempool-blocks');
  }

  // ==========================================================================
  // Mempool
  // ==========================================================================

  async getMempoolInfo(): Promise<MempoolInfo> {
    return this.request<MempoolInfo>('/mempool');
  }

  async getMempoolTxids(): Promise<string[]> {
    return this.request<string[]>('/mempool/txids');
  }

  async getRecentMempoolTxs(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/mempool/recent');
  }

  // ==========================================================================
  // Transactions
  // ==========================================================================

  async getTransaction(txid: string): Promise<Transaction> {
    return this.request<Transaction>(`/tx/${txid}`);
  }

  async getTxStatus(txid: string): Promise<TxStatus> {
    return this.request<TxStatus>(`/tx/${txid}/status`);
  }

  async getTxHex(txid: string): Promise<string> {
    return this.request<string>(`/tx/${txid}/hex`);
  }

  async getTxRaw(txid: string): Promise<Uint8Array> {
    const response = await fetch(`${this.baseUrl}/tx/${txid}/raw`);
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  async broadcastTx(txHex: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/tx`, {
      method: 'POST',
      body: txHex,
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return response.text();
  }

  async getTxOutspends(txid: string): Promise<Array<{ spent: boolean; txid?: string; vin?: number }>> {
    return this.request(`/tx/${txid}/outspends`);
  }

  // ==========================================================================
  // Addresses
  // ==========================================================================

  async getAddressInfo(address: string): Promise<AddressInfo> {
    return this.request<AddressInfo>(`/address/${address}`);
  }

  async getAddressTxs(address: string): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/address/${address}/txs`);
  }

  async getAddressTxsChain(address: string, lastTxid?: string): Promise<Transaction[]> {
    const endpoint = lastTxid
      ? `/address/${address}/txs/chain/${lastTxid}`
      : `/address/${address}/txs/chain`;
    return this.request<Transaction[]>(endpoint);
  }

  async getAddressTxsMempool(address: string): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/address/${address}/txs/mempool`);
  }

  async getAddressUtxos(address: string): Promise<UTXO[]> {
    return this.request<UTXO[]>(`/address/${address}/utxo`);
  }

  // ==========================================================================
  // Blocks
  // ==========================================================================

  async getBlock(hash: string): Promise<Block> {
    return this.request<Block>(`/block/${hash}`);
  }

  async getBlockHeader(hash: string): Promise<string> {
    return this.request<string>(`/block/${hash}/header`);
  }

  async getBlockHeight(hash: string): Promise<number> {
    return this.request<number>(`/block/${hash}/height`);
  }

  async getBlockTxids(hash: string): Promise<string[]> {
    return this.request<string[]>(`/block/${hash}/txids`);
  }

  async getBlockTxs(hash: string, startIndex: number = 0): Promise<Transaction[]> {
    return this.request<Transaction[]>(`/block/${hash}/txs/${startIndex}`);
  }

  async getBlockHashByHeight(height: number): Promise<string> {
    return this.request<string>(`/block-height/${height}`);
  }

  async getTipHeight(): Promise<number> {
    return this.request<number>('/blocks/tip/height');
  }

  async getTipHash(): Promise<string> {
    return this.request<string>('/blocks/tip/hash');
  }

  async getRecentBlocks(): Promise<Block[]> {
    return this.request<Block[]>('/v1/blocks');
  }

  // ==========================================================================
  // Mining
  // ==========================================================================

  async getDifficultyAdjustment(): Promise<{
    progressPercent: number;
    difficultyChange: number;
    estimatedRetargetDate: number;
    remainingBlocks: number;
    remainingTime: number;
    previousRetarget: number;
    nextRetargetHeight: number;
    timeAvg: number;
    timeOffset: number;
  }> {
    return this.request('/v1/difficulty-adjustment');
  }

  async getHashrate(timePeriod?: '1m' | '3m' | '6m' | '1y' | '2y' | '3y'): Promise<{
    hashrates: Array<{ timestamp: number; avgHashrate: number }>;
    difficulty: Array<{ timestamp: number; difficulty: number }>;
    currentHashrate: number;
    currentDifficulty: number;
  }> {
    const endpoint = timePeriod ? `/v1/mining/hashrate/${timePeriod}` : '/v1/mining/hashrate/3m';
    return this.request(endpoint);
  }

  // ==========================================================================
  // WebSocket
  // ==========================================================================

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      this.emit('connected', null);
      this.resubscribe();
    };

    this.ws.onclose = () => {
      this.emit('disconnected', null);
    };

    this.ws.onerror = (error) => {
      this.emit('error', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.block) {
          this.emit('block', data.block);
        }
        if (data['address-transactions']) {
          this.emit('address-tx', data['address-transactions']);
        }
        if (data.mempoolInfo) {
          this.emit('tx', data);
        }
      } catch {
        // Ignore parse errors
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private resubscribe(): void {
    if (this.subscriptions.blocks) {
      this.send({ action: 'want', data: ['blocks'] });
    }
    if (this.subscriptions.mempool) {
      this.send({ action: 'want', data: ['mempool-blocks'] });
    }
    for (const address of this.subscriptions.addresses) {
      this.send({ 'track-address': address });
    }
  }

  subscribeBlocks(): void {
    this.subscriptions.blocks = true;
    this.send({ action: 'want', data: ['blocks'] });
  }

  subscribeMempool(): void {
    this.subscriptions.mempool = true;
    this.send({ action: 'want', data: ['mempool-blocks'] });
  }

  subscribeAddress(address: string): void {
    this.subscriptions.addresses.add(address);
    this.send({ 'track-address': address });
  }

  unsubscribeAddress(address: string): void {
    this.subscriptions.addresses.delete(address);
    this.send({ 'untrack-address': address });
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(event: MempoolEvent, listener: MempoolEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off(event: MempoolEvent, listener: MempoolEventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: MempoolEvent, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      for (const listener of eventListeners) {
        try {
          listener(data);
        } catch {
          // Ignore listener errors
        }
      }
    }
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  async waitForConfirmation(
    txid: string,
    options: { timeout?: number; pollInterval?: number } = {}
  ): Promise<TxStatus> {
    const { timeout = 3600000, pollInterval = 30000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getTxStatus(txid);
      if (status.confirmed) {
        return status;
      }
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error('Confirmation timeout');
  }

  async estimateFee(vsize: number, priority: 'fastest' | 'halfHour' | 'hour' | 'economy' = 'halfHour'): Promise<number> {
    const rates = await this.getFeeRates();
    const feeMap = {
      fastest: rates.fastestFee,
      halfHour: rates.halfHourFee,
      hour: rates.hourFee,
      economy: rates.economyFee,
    };
    return vsize * feeMap[priority];
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createMempoolClient(options?: MempoolClientOptions): MempoolClient {
  return new MempoolClient(options);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate transaction virtual size
 */
export function calculateVSize(weight: number): number {
  return Math.ceil(weight / 4);
}

/**
 * Calculate fee rate from transaction
 */
export function calculateFeeRate(fee: number, vsize: number): number {
  return Math.round(fee / vsize);
}

/**
 * Format satoshis as BTC
 */
export function satsToBtc(sats: number): string {
  return (sats / 100_000_000).toFixed(8);
}

/**
 * Format BTC as satoshis
 */
export function btcToSats(btc: number): number {
  return Math.round(btc * 100_000_000);
}
