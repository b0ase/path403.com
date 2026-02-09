/**
 * @b0ase/ordinals-api
 *
 * Ordinals indexer API client for inscriptions and BRC-20 tokens.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Inscription data */
export interface Inscription {
  id: string;
  number: number;
  address: string;
  genesisAddress: string;
  genesisBlockHeight: number;
  genesisBlockHash: string;
  genesisTxId: string;
  genesisTimestamp: number;
  contentType: string;
  contentLength: number;
  sat: number;
  satName: string;
  offset: number;
  outputValue: number;
  location: string;
}

/** Inscription content */
export interface InscriptionContent {
  id: string;
  contentType: string;
  content: Uint8Array;
  text?: string;
}

/** BRC-20 token info */
export interface BRC20Token {
  ticker: string;
  maxSupply: string;
  mintLimit: string;
  decimals: number;
  deployedBy: string;
  deployedAt: number;
  deployTxId: string;
  totalMinted: string;
  holdersCount: number;
}

/** BRC-20 balance */
export interface BRC20Balance {
  ticker: string;
  availableBalance: string;
  transferableBalance: string;
  overallBalance: string;
}

/** BRC-20 transfer */
export interface BRC20Transfer {
  inscriptionId: string;
  ticker: string;
  amount: string;
  from: string;
  to: string;
  txId: string;
  blockHeight: number;
  timestamp: number;
}

/** Sat details */
export interface SatDetails {
  number: number;
  name: string;
  rarity: SatRarity;
  block: number;
  offset: number;
  coinbaseHeight: number;
  inscriptions: string[];
}

/** Sat rarity levels */
export type SatRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

/** API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  offset?: number;
  limit?: number;
}

/** Pagination options */
export interface PaginationOptions {
  offset?: number;
  limit?: number;
  [key: string]: unknown;
}

/** Search options */
export interface SearchOptions extends PaginationOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Client options */
export interface OrdinalsClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG: Required<OrdinalsClientOptions> = {
  baseUrl: 'https://api.hiro.so/ordinals/v1',
  apiKey: '',
  timeout: 30000,
  retries: 3,
};

/** Alternative API endpoints */
export const API_ENDPOINTS = {
  hiro: 'https://api.hiro.so/ordinals/v1',
  ordapi: 'https://ordapi.xyz',
  ordiscan: 'https://api.ordiscan.com/v1',
  bestinslot: 'https://api.bestinslot.xyz/v3',
};

// ============================================================================
// Ordinals Client
// ============================================================================

export class OrdinalsClient {
  private config: Required<OrdinalsClientOptions>;

  constructor(options: OrdinalsClientOptions = {}) {
    this.config = { ...DEFAULT_CONFIG, ...options };
  }

  // ==========================================================================
  // HTTP Helpers
  // ==========================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.config.apiKey) {
      headers['x-api-key'] = this.config.apiKey;
    }

    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          return { success: false, error: error || `HTTP ${response.status}` };
        }

        const data = await response.json();
        return { success: true, data: data as T };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < this.config.retries - 1) {
          await this.sleep(1000 * (attempt + 1));
        }
      }
    }

    return { success: false, error: lastError?.message || 'Request failed' };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildQuery(params: Record<string, unknown>): string {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');
    return query ? `?${query}` : '';
  }

  // ==========================================================================
  // Inscriptions
  // ==========================================================================

  async getInscription(id: string): Promise<ApiResponse<Inscription>> {
    return this.request<Inscription>(`/inscriptions/${id}`);
  }

  async getInscriptions(options: SearchOptions = {}): Promise<ApiResponse<Inscription[]>> {
    const query = this.buildQuery(options);
    return this.request<Inscription[]>(`/inscriptions${query}`);
  }

  async getInscriptionsByAddress(
    address: string,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Inscription[]>> {
    const query = this.buildQuery(options);
    return this.request<Inscription[]>(`/inscriptions?address=${address}${query ? '&' + query.slice(1) : ''}`);
  }

  async getInscriptionContent(id: string): Promise<ApiResponse<InscriptionContent>> {
    const response = await this.request<{ content_type: string }>(`/inscriptions/${id}`);
    if (!response.success || !response.data) {
      return { success: false, error: response.error };
    }

    try {
      const contentUrl = `${this.config.baseUrl}/inscriptions/${id}/content`;
      const contentResponse = await fetch(contentUrl);
      const buffer = await contentResponse.arrayBuffer();
      const content = new Uint8Array(buffer);

      return {
        success: true,
        data: {
          id,
          contentType: response.data.content_type,
          content,
          text: response.data.content_type.startsWith('text/')
            ? new TextDecoder().decode(content)
            : undefined,
        },
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to fetch content' };
    }
  }

  async getInscriptionsByBlock(
    blockHeight: number,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Inscription[]>> {
    const query = this.buildQuery({ ...options, genesis_block: blockHeight });
    return this.request<Inscription[]>(`/inscriptions${query}`);
  }

  async searchInscriptions(params: {
    contentType?: string;
    fromNumber?: number;
    toNumber?: number;
    fromBlock?: number;
    toBlock?: number;
  } & PaginationOptions): Promise<ApiResponse<Inscription[]>> {
    const query = this.buildQuery({
      mime_type: params.contentType,
      from_number: params.fromNumber,
      to_number: params.toNumber,
      from_genesis_block_height: params.fromBlock,
      to_genesis_block_height: params.toBlock,
      offset: params.offset,
      limit: params.limit,
    });
    return this.request<Inscription[]>(`/inscriptions${query}`);
  }

  // ==========================================================================
  // BRC-20 Tokens
  // ==========================================================================

  async getBRC20Tokens(options: PaginationOptions = {}): Promise<ApiResponse<BRC20Token[]>> {
    const query = this.buildQuery(options);
    return this.request<BRC20Token[]>(`/brc-20/tokens${query}`);
  }

  async getBRC20Token(ticker: string): Promise<ApiResponse<BRC20Token>> {
    return this.request<BRC20Token>(`/brc-20/tokens/${ticker}`);
  }

  async getBRC20Balances(
    address: string,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<BRC20Balance[]>> {
    const query = this.buildQuery(options);
    return this.request<BRC20Balance[]>(`/brc-20/balances/${address}${query}`);
  }

  async getBRC20Balance(address: string, ticker: string): Promise<ApiResponse<BRC20Balance>> {
    return this.request<BRC20Balance>(`/brc-20/balances/${address}/${ticker}`);
  }

  async getBRC20Transfers(
    ticker: string,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<BRC20Transfer[]>> {
    const query = this.buildQuery(options);
    return this.request<BRC20Transfer[]>(`/brc-20/tokens/${ticker}/transfers${query}`);
  }

  async getBRC20Holders(
    ticker: string,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Array<{ address: string; balance: string }>>> {
    const query = this.buildQuery(options);
    return this.request<Array<{ address: string; balance: string }>>(
      `/brc-20/tokens/${ticker}/holders${query}`
    );
  }

  // ==========================================================================
  // Sats
  // ==========================================================================

  async getSat(satNumber: number): Promise<ApiResponse<SatDetails>> {
    return this.request<SatDetails>(`/sats/${satNumber}`);
  }

  async getSatByName(name: string): Promise<ApiResponse<SatDetails>> {
    return this.request<SatDetails>(`/sats/${name}`);
  }

  async getSatInscriptions(
    satNumber: number,
    options: PaginationOptions = {}
  ): Promise<ApiResponse<Inscription[]>> {
    const query = this.buildQuery(options);
    return this.request<Inscription[]>(`/sats/${satNumber}/inscriptions${query}`);
  }

  // ==========================================================================
  // Stats
  // ==========================================================================

  async getStats(): Promise<ApiResponse<{
    inscriptionsCount: number;
    brc20TokensCount: number;
    lastInscriptionNumber: number;
    lastBlockHeight: number;
  }>> {
    return this.request(`/stats`);
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createOrdinalsClient(options?: OrdinalsClientOptions): OrdinalsClient {
  return new OrdinalsClient(options);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse inscription ID into components
 */
export function parseInscriptionId(id: string): { txid: string; index: number } | null {
  const match = id.match(/^([a-f0-9]{64})i(\d+)$/i);
  if (!match) return null;
  return { txid: match[1], index: parseInt(match[2], 10) };
}

/**
 * Create inscription ID from components
 */
export function createInscriptionId(txid: string, index: number): string {
  return `${txid}i${index}`;
}

/**
 * Determine sat rarity from sat number
 */
export function getSatRarity(satNumber: number): SatRarity {
  // Mythic: First sat (sat 0)
  if (satNumber === 0) return 'mythic';

  // Legendary: First sat of each cycle (every 2,016,000 blocks)
  const SATS_PER_CYCLE = 2_100_000_000_000_000n / 6n;
  if (BigInt(satNumber) % SATS_PER_CYCLE === 0n) return 'legendary';

  // Epic: First sat of each halving epoch
  const HALVING_SATS = [
    0n,
    1_050_000_000_000_000n,
    1_575_000_000_000_000n,
    1_837_500_000_000_000n,
  ];
  if (HALVING_SATS.includes(BigInt(satNumber))) return 'epic';

  // Rare: First sat of each difficulty adjustment (every 2016 blocks)
  const SATS_PER_ADJUSTMENT = 50_000_000n * 2016n;
  if (BigInt(satNumber) % SATS_PER_ADJUSTMENT === 0n) return 'rare';

  // Uncommon: First sat of each block
  const SATS_PER_BLOCK = 50_000_000n;
  if (BigInt(satNumber) % SATS_PER_BLOCK === 0n) return 'uncommon';

  return 'common';
}

/**
 * Parse BRC-20 inscription content
 */
export function parseBRC20Content(content: string): {
  p: string;
  op: 'deploy' | 'mint' | 'transfer';
  tick: string;
  amt?: string;
  max?: string;
  lim?: string;
  dec?: string;
} | null {
  try {
    const json = JSON.parse(content);
    if (json.p !== 'brc-20') return null;
    return json;
  } catch {
    return null;
  }
}

/**
 * Create BRC-20 deploy inscription content
 */
export function createBRC20Deploy(
  ticker: string,
  maxSupply: string,
  mintLimit?: string,
  decimals?: number
): string {
  return JSON.stringify({
    p: 'brc-20',
    op: 'deploy',
    tick: ticker,
    max: maxSupply,
    lim: mintLimit || maxSupply,
    dec: decimals?.toString() || '18',
  });
}

/**
 * Create BRC-20 mint inscription content
 */
export function createBRC20Mint(ticker: string, amount: string): string {
  return JSON.stringify({
    p: 'brc-20',
    op: 'mint',
    tick: ticker,
    amt: amount,
  });
}

/**
 * Create BRC-20 transfer inscription content
 */
export function createBRC20Transfer(ticker: string, amount: string): string {
  return JSON.stringify({
    p: 'brc-20',
    op: 'transfer',
    tick: ticker,
    amt: amount,
  });
}
