/**
 * @b0ase/yours-wallet
 *
 * Yours Wallet integration for BSV payments, auth, and ordinals.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Yours Wallet provider interface (injected window.yours) */
export interface YoursProvider {
  isReady: boolean;
  connect(): Promise<YoursIdentity>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  getAddresses(): Promise<YoursAddresses>;
  getBalance(): Promise<YoursBalance>;
  getOrdinals(): Promise<YoursOrdinal[]>;
  sendBsv(params: SendBsvParams): Promise<SendBsvResult>;
  transferOrdinal(params: TransferOrdinalParams): Promise<TransferOrdinalResult>;
  signMessage(params: SignMessageParams): Promise<SignMessageResult>;
  broadcast(params: BroadcastParams): Promise<BroadcastResult>;
  getSignatures(params: GetSignaturesParams): Promise<GetSignaturesResult>;
  getSocialProfile(): Promise<YoursSocialProfile | null>;
  getExchangeRate(): Promise<number>;
  on(event: YoursEvent, callback: YoursEventCallback): void;
  off(event: YoursEvent, callback: YoursEventCallback): void;
}

/** Yours identity */
export interface YoursIdentity {
  paymail: string;
  pubKey: string;
  addresses: YoursAddresses;
}

/** Yours addresses */
export interface YoursAddresses {
  bsvAddress: string;
  ordAddress: string;
  identityAddress: string;
}

/** Yours balance */
export interface YoursBalance {
  bsv: number;      // In satoshis
  usd: number;      // In cents
  satoshis: number;
}

/** Yours ordinal */
export interface YoursOrdinal {
  origin: string;
  outpoint: string;
  contentType: string;
  contentLength: number;
  inscriptionNumber?: number;
  collection?: {
    name: string;
    description?: string;
    image?: string;
  };
  map?: Record<string, string>;
}

/** Send BSV params */
export interface SendBsvParams {
  satoshis: number;
  address?: string;
  paymail?: string;
  data?: string[];
  script?: string;
}

/** Send BSV result */
export interface SendBsvResult {
  txid: string;
  rawtx: string;
}

/** Transfer ordinal params */
export interface TransferOrdinalParams {
  origin: string;
  address?: string;
  paymail?: string;
}

/** Transfer ordinal result */
export interface TransferOrdinalResult {
  txid: string;
  rawtx: string;
}

/** Sign message params */
export interface SignMessageParams {
  message: string;
  encoding?: 'utf8' | 'hex' | 'base64';
}

/** Sign message result */
export interface SignMessageResult {
  message: string;
  sig: string;
  address: string;
  pubKey: string;
}

/** Broadcast params */
export interface BroadcastParams {
  rawtx: string;
}

/** Broadcast result */
export interface BroadcastResult {
  txid: string;
}

/** Get signatures params */
export interface GetSignaturesParams {
  rawtx: string;
  sigRequests: SignatureRequest[];
}

/** Signature request */
export interface SignatureRequest {
  prevTxid: string;
  outputIndex: number;
  inputIndex: number;
  satoshis: number;
  script?: string;
  sigHashType?: number;
  csIdx?: number;
}

/** Get signatures result */
export interface GetSignaturesResult {
  rawtx: string;
  sigResponses: SignatureResponse[];
}

/** Signature response */
export interface SignatureResponse {
  sig: string;
  pubKey: string;
  inputIndex: number;
}

/** Social profile */
export interface YoursSocialProfile {
  displayName: string;
  avatar?: string;
  banner?: string;
  description?: string;
}

/** Yours events */
export type YoursEvent = 'connect' | 'disconnect' | 'networkChange' | 'accountChange';

/** Event callback */
export type YoursEventCallback = (data?: unknown) => void;

/** Connection state */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/** Wallet options */
export interface YoursWalletOptions {
  autoConnect?: boolean;
  onConnect?: (identity: YoursIdentity) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Constants
// ============================================================================

export const YOURS_EXTENSION_ID = 'yours-wallet';
export const YOURS_WALLET_URL = 'https://yours.org';
export const YOURS_CHROME_STORE_URL = 'https://chromewebstore.google.com/detail/yours-wallet/mlbnicldlpdimbjdcncnklfempedeipj';

// ============================================================================
// Yours Wallet Manager
// ============================================================================

export class YoursWallet {
  private provider: YoursProvider | null = null;
  private identity: YoursIdentity | null = null;
  private state: ConnectionState = 'disconnected';
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();
  private options: YoursWalletOptions;

  constructor(options: YoursWalletOptions = {}) {
    this.options = options;
    this.detectProvider();
  }

  // ==========================================================================
  // Provider Detection
  // ==========================================================================

  private detectProvider(): void {
    if (typeof window !== 'undefined') {
      const win = window as unknown as { yours?: YoursProvider };
      if (win.yours) {
        this.provider = win.yours;
        this.setupEventListeners();

        if (this.options.autoConnect) {
          this.connect().catch(() => {});
        }
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.provider) return;

    this.provider.on('connect', (data) => {
      this.state = 'connected';
      this.emit('connect', data);
    });

    this.provider.on('disconnect', () => {
      this.state = 'disconnected';
      this.identity = null;
      this.emit('disconnect', undefined);
      this.options.onDisconnect?.();
    });

    this.provider.on('accountChange', (data) => {
      this.emit('accountChange', data);
    });
  }

  // ==========================================================================
  // Connection
  // ==========================================================================

  isInstalled(): boolean {
    return this.provider !== null;
  }

  isConnected(): boolean {
    return this.state === 'connected' && this.identity !== null;
  }

  getState(): ConnectionState {
    return this.state;
  }

  getIdentity(): YoursIdentity | null {
    return this.identity;
  }

  async connect(): Promise<YoursIdentity> {
    if (!this.provider) {
      throw new Error('Yours Wallet not installed');
    }

    this.state = 'connecting';
    this.emit('stateChange', this.state);

    try {
      this.identity = await this.provider.connect();
      this.state = 'connected';
      this.emit('stateChange', this.state);
      this.emit('connect', this.identity);
      this.options.onConnect?.(this.identity);
      return this.identity;
    } catch (error) {
      this.state = 'error';
      this.emit('stateChange', this.state);
      const err = error instanceof Error ? error : new Error(String(error));
      this.options.onError?.(err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.provider) return;

    await this.provider.disconnect();
    this.identity = null;
    this.state = 'disconnected';
    this.emit('stateChange', this.state);
    this.emit('disconnect', undefined);
    this.options.onDisconnect?.();
  }

  // ==========================================================================
  // Account Information
  // ==========================================================================

  async getAddresses(): Promise<YoursAddresses> {
    this.ensureConnected();
    return this.provider!.getAddresses();
  }

  async getBalance(): Promise<YoursBalance> {
    this.ensureConnected();
    return this.provider!.getBalance();
  }

  async getOrdinals(): Promise<YoursOrdinal[]> {
    this.ensureConnected();
    return this.provider!.getOrdinals();
  }

  async getSocialProfile(): Promise<YoursSocialProfile | null> {
    this.ensureConnected();
    return this.provider!.getSocialProfile();
  }

  async getExchangeRate(): Promise<number> {
    this.ensureConnected();
    return this.provider!.getExchangeRate();
  }

  // ==========================================================================
  // Transactions
  // ==========================================================================

  async sendBsv(params: SendBsvParams): Promise<SendBsvResult> {
    this.ensureConnected();
    return this.provider!.sendBsv(params);
  }

  async sendToAddress(address: string, satoshis: number): Promise<SendBsvResult> {
    return this.sendBsv({ address, satoshis });
  }

  async sendToPaymail(paymail: string, satoshis: number): Promise<SendBsvResult> {
    return this.sendBsv({ paymail, satoshis });
  }

  async sendWithData(satoshis: number, data: string[], address?: string): Promise<SendBsvResult> {
    return this.sendBsv({ satoshis, data, address });
  }

  async transferOrdinal(params: TransferOrdinalParams): Promise<TransferOrdinalResult> {
    this.ensureConnected();
    return this.provider!.transferOrdinal(params);
  }

  async sendOrdinalToAddress(origin: string, address: string): Promise<TransferOrdinalResult> {
    return this.transferOrdinal({ origin, address });
  }

  async sendOrdinalToPaymail(origin: string, paymail: string): Promise<TransferOrdinalResult> {
    return this.transferOrdinal({ origin, paymail });
  }

  // ==========================================================================
  // Signing
  // ==========================================================================

  async signMessage(message: string, encoding?: 'utf8' | 'hex' | 'base64'): Promise<SignMessageResult> {
    this.ensureConnected();
    return this.provider!.signMessage({ message, encoding });
  }

  async getSignatures(rawtx: string, sigRequests: SignatureRequest[]): Promise<GetSignaturesResult> {
    this.ensureConnected();
    return this.provider!.getSignatures({ rawtx, sigRequests });
  }

  // ==========================================================================
  // Broadcasting
  // ==========================================================================

  async broadcast(rawtx: string): Promise<BroadcastResult> {
    this.ensureConnected();
    return this.provider!.broadcast({ rawtx });
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(event: string, callback: (data?: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: (data?: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: unknown): void {
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
  // Helpers
  // ==========================================================================

  private ensureConnected(): void {
    if (!this.provider) {
      throw new Error('Yours Wallet not installed');
    }
    if (!this.isConnected()) {
      throw new Error('Yours Wallet not connected');
    }
  }

  getPaymail(): string | null {
    return this.identity?.paymail || null;
  }

  getBsvAddress(): string | null {
    return this.identity?.addresses.bsvAddress || null;
  }

  getOrdAddress(): string | null {
    return this.identity?.addresses.ordAddress || null;
  }

  getIdentityAddress(): string | null {
    return this.identity?.addresses.identityAddress || null;
  }

  getPubKey(): string | null {
    return this.identity?.pubKey || null;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createYoursWallet(options?: YoursWalletOptions): YoursWallet {
  return new YoursWallet(options);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if Yours Wallet is installed
 */
export function isYoursInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as { yours?: YoursProvider };
  return !!win.yours;
}

/**
 * Get Yours Wallet provider directly
 */
export function getYoursProvider(): YoursProvider | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as { yours?: YoursProvider };
  return win.yours || null;
}

/**
 * Wait for Yours Wallet to be ready
 */
export async function waitForYours(timeout: number = 3000): Promise<YoursProvider> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const provider = getYoursProvider();
    if (provider?.isReady) {
      return provider;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error('Yours Wallet not found');
}

/**
 * Parse paymail address
 */
export function parsePaymail(paymail: string): { alias: string; domain: string } | null {
  const match = paymail.match(/^([^@]+)@([^@]+)$/);
  if (!match) return null;
  return { alias: match[1], domain: match[2] };
}

/**
 * Validate paymail address
 */
export function isValidPaymail(paymail: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(paymail);
}

/**
 * Format satoshis for display
 */
export function formatSatoshis(sats: number): string {
  if (sats >= 100_000_000) {
    return `${(sats / 100_000_000).toFixed(8)} BSV`;
  }
  if (sats >= 1000) {
    return `${(sats / 1000).toFixed(2)}k sats`;
  }
  return `${sats} sats`;
}

/**
 * Calculate USD value from satoshis
 */
export function satsToUsd(sats: number, exchangeRate: number): number {
  return (sats / 100_000_000) * exchangeRate;
}

/**
 * Calculate satoshis from USD value
 */
export function usdToSats(usd: number, exchangeRate: number): number {
  return Math.round((usd / exchangeRate) * 100_000_000);
}

// ============================================================================
// React Hook (for reference - would need React as peer dep)
// ============================================================================

/**
 * Example hook usage (would be in separate file with React dependency):
 *
 * export function useYoursWallet(options?: YoursWalletOptions) {
 *   const [wallet] = useState(() => createYoursWallet(options));
 *   const [state, setState] = useState(wallet.getState());
 *   const [identity, setIdentity] = useState(wallet.getIdentity());
 *
 *   useEffect(() => {
 *     const unsubState = wallet.on('stateChange', setState);
 *     const unsubConnect = wallet.on('connect', setIdentity);
 *     const unsubDisconnect = wallet.on('disconnect', () => setIdentity(null));
 *     return () => { unsubState(); unsubConnect(); unsubDisconnect(); };
 *   }, [wallet]);
 *
 *   return { wallet, state, identity, isConnected: wallet.isConnected() };
 * }
 */
