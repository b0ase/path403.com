/**
 * @b0ase/wallet-adapter
 *
 * Unified wallet adapter for multi-chain connections.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Supported blockchain */
export type Blockchain =
  | 'bsv'
  | 'bitcoin'
  | 'ethereum'
  | 'polygon'
  | 'arbitrum'
  | 'optimism'
  | 'base'
  | 'solana'
  | 'avalanche';

/** Wallet type */
export type WalletType =
  | 'handcash'
  | 'yours'
  | 'panda'
  | 'twetch'
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'
  | 'rainbow'
  | 'phantom'
  | 'solflare'
  | 'backpack'
  | 'ledger'
  | 'trezor';

/** Connection status */
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

/** Transaction status */
export type TransactionStatus =
  | 'pending'
  | 'submitted'
  | 'confirmed'
  | 'failed';

/** Network type */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet' | 'regtest';

/** Wallet capabilities */
export interface WalletCapabilities {
  signMessage: boolean;
  signTransaction: boolean;
  signTypedData: boolean;
  sendTransaction: boolean;
  encrypt: boolean;
  decrypt: boolean;
  switchNetwork: boolean;
  watchAsset: boolean;
}

/** Wallet info */
export interface WalletInfo {
  type: WalletType;
  name: string;
  icon: string;
  blockchain: Blockchain[];
  capabilities: WalletCapabilities;
  downloadUrl?: string;
  installed?: boolean;
}

/** Connected account */
export interface ConnectedAccount {
  address: string;
  publicKey?: string;
  paymail?: string;
  displayName?: string;
  avatar?: string;
  blockchain: Blockchain;
  network: NetworkType;
}

/** Wallet state */
export interface WalletState {
  status: ConnectionStatus;
  wallet: WalletInfo | null;
  account: ConnectedAccount | null;
  error: string | null;
  isConnecting: boolean;
  isConnected: boolean;
}

/** Transaction request */
export interface TransactionRequest {
  to: string;
  value?: bigint;
  data?: string;
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
}

/** BSV transaction request */
export interface BSVTransactionRequest {
  outputs: Array<{
    to: string;
    satoshis: bigint;
    script?: string;
  }>;
  inputs?: Array<{
    txid: string;
    vout: number;
    satoshis: bigint;
    script?: string;
  }>;
  changeAddress?: string;
}

/** Sign message request */
export interface SignMessageRequest {
  message: string;
  address?: string;
}

/** Sign typed data request */
export interface SignTypedDataRequest {
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
}

/** Transaction result */
export interface TransactionResult {
  hash: string;
  status: TransactionStatus;
  blockNumber?: number;
  confirmations?: number;
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  error?: string;
}

/** Signature result */
export interface SignatureResult {
  signature: string;
  address: string;
  message: string;
  recoveryId?: number;
}

/** Balance */
export interface Balance {
  native: bigint;
  nativeSymbol: string;
  nativeDecimals: number;
  tokens?: TokenBalance[];
}

/** Token balance */
export interface TokenBalance {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: bigint;
  logo?: string;
}

/** Network info */
export interface NetworkInfo {
  chainId: number | string;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl?: string;
  explorerUrl?: string;
}

// ============================================================================
// Wallet Registry
// ============================================================================

export const WALLET_REGISTRY: Record<WalletType, WalletInfo> = {
  handcash: {
    type: 'handcash',
    name: 'HandCash',
    icon: 'https://handcash.io/favicon.ico',
    blockchain: ['bsv'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: false,
      sendTransaction: true,
      encrypt: true,
      decrypt: true,
      switchNetwork: false,
      watchAsset: false,
    },
    downloadUrl: 'https://handcash.io',
  },
  yours: {
    type: 'yours',
    name: 'Yours Wallet',
    icon: 'https://yours.org/favicon.ico',
    blockchain: ['bsv'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: false,
      sendTransaction: true,
      encrypt: true,
      decrypt: true,
      switchNetwork: false,
      watchAsset: false,
    },
    downloadUrl: 'https://yours.org',
  },
  panda: {
    type: 'panda',
    name: 'Panda Wallet',
    icon: 'https://panda.org/favicon.ico',
    blockchain: ['bsv'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: false,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: false,
      watchAsset: false,
    },
  },
  twetch: {
    type: 'twetch',
    name: 'Twetch Wallet',
    icon: 'https://twetch.com/favicon.ico',
    blockchain: ['bsv'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: false,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: false,
      watchAsset: false,
    },
    downloadUrl: 'https://twetch.com',
  },
  metamask: {
    type: 'metamask',
    name: 'MetaMask',
    icon: 'https://metamask.io/favicon.ico',
    blockchain: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: true,
      sendTransaction: true,
      encrypt: true,
      decrypt: true,
      switchNetwork: true,
      watchAsset: true,
    },
    downloadUrl: 'https://metamask.io',
  },
  walletconnect: {
    type: 'walletconnect',
    name: 'WalletConnect',
    icon: 'https://walletconnect.org/favicon.ico',
    blockchain: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: true,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: true,
      watchAsset: false,
    },
  },
  coinbase: {
    type: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'https://coinbase.com/favicon.ico',
    blockchain: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: true,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: true,
      watchAsset: true,
    },
    downloadUrl: 'https://coinbase.com/wallet',
  },
  rainbow: {
    type: 'rainbow',
    name: 'Rainbow',
    icon: 'https://rainbow.me/favicon.ico',
    blockchain: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: true,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: true,
      watchAsset: false,
    },
    downloadUrl: 'https://rainbow.me',
  },
  phantom: {
    type: 'phantom',
    name: 'Phantom',
    icon: 'https://phantom.app/favicon.ico',
    blockchain: ['solana', 'ethereum', 'polygon'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: false,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: true,
      watchAsset: false,
    },
    downloadUrl: 'https://phantom.app',
  },
  solflare: {
    type: 'solflare',
    name: 'Solflare',
    icon: 'https://solflare.com/favicon.ico',
    blockchain: ['solana'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: false,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: true,
      watchAsset: false,
    },
    downloadUrl: 'https://solflare.com',
  },
  backpack: {
    type: 'backpack',
    name: 'Backpack',
    icon: 'https://backpack.app/favicon.ico',
    blockchain: ['solana', 'ethereum'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: false,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: true,
      watchAsset: false,
    },
    downloadUrl: 'https://backpack.app',
  },
  ledger: {
    type: 'ledger',
    name: 'Ledger',
    icon: 'https://ledger.com/favicon.ico',
    blockchain: ['bsv', 'bitcoin', 'ethereum', 'solana'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: true,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: false,
      watchAsset: false,
    },
    downloadUrl: 'https://ledger.com',
  },
  trezor: {
    type: 'trezor',
    name: 'Trezor',
    icon: 'https://trezor.io/favicon.ico',
    blockchain: ['bitcoin', 'ethereum'],
    capabilities: {
      signMessage: true,
      signTransaction: true,
      signTypedData: true,
      sendTransaction: true,
      encrypt: false,
      decrypt: false,
      switchNetwork: false,
      watchAsset: false,
    },
    downloadUrl: 'https://trezor.io',
  },
};

// ============================================================================
// Wallet Adapter
// ============================================================================

export interface WalletAdapter {
  readonly type: WalletType;
  readonly info: WalletInfo;

  connect(options?: ConnectOptions): Promise<ConnectedAccount>;
  disconnect(): Promise<void>;
  getAccount(): ConnectedAccount | null;
  getBalance(): Promise<Balance>;

  signMessage(request: SignMessageRequest): Promise<SignatureResult>;
  signTransaction(request: TransactionRequest | BSVTransactionRequest): Promise<string>;
  sendTransaction(request: TransactionRequest | BSVTransactionRequest): Promise<TransactionResult>;

  signTypedData?(request: SignTypedDataRequest): Promise<SignatureResult>;
  switchNetwork?(chainId: number | string): Promise<void>;
  watchAsset?(asset: { address: string; symbol: string; decimals: number; image?: string }): Promise<boolean>;

  on(event: WalletEvent, callback: WalletEventCallback): () => void;
}

/** Connect options */
export interface ConnectOptions {
  network?: NetworkType;
  chainId?: number | string;
  forceReconnect?: boolean;
}

/** Wallet event */
export type WalletEvent =
  | 'connect'
  | 'disconnect'
  | 'accountsChanged'
  | 'chainChanged'
  | 'error';

/** Wallet event callback */
export type WalletEventCallback = (data: unknown) => void;

// ============================================================================
// Wallet Manager
// ============================================================================

export class WalletManager {
  private state: WalletState;
  private adapter: WalletAdapter | null = null;
  private listeners: Set<(state: WalletState) => void> = new Set();
  private eventCleanups: Array<() => void> = [];

  constructor() {
    this.state = {
      status: 'disconnected',
      wallet: null,
      account: null,
      error: null,
      isConnecting: false,
      isConnected: false,
    };
  }

  // ==========================================================================
  // State
  // ==========================================================================

  getState(): WalletState {
    return { ...this.state };
  }

  subscribe(callback: (state: WalletState) => void): () => void {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  private updateState(updates: Partial<WalletState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  // ==========================================================================
  // Connection
  // ==========================================================================

  async connect(adapter: WalletAdapter, options?: ConnectOptions): Promise<ConnectedAccount> {
    this.updateState({
      status: 'connecting',
      isConnecting: true,
      error: null,
    });

    try {
      // Clean up previous adapter
      if (this.adapter) {
        await this.disconnect();
      }

      // Store adapter
      this.adapter = adapter;

      // Set up event listeners
      this.setupEventListeners();

      // Connect
      const account = await adapter.connect(options);

      this.updateState({
        status: 'connected',
        wallet: adapter.info,
        account,
        isConnecting: false,
        isConnected: true,
      });

      return account;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed';
      this.updateState({
        status: 'error',
        error: message,
        isConnecting: false,
        isConnected: false,
      });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.adapter) {
      // Clean up event listeners
      for (const cleanup of this.eventCleanups) {
        cleanup();
      }
      this.eventCleanups = [];

      await this.adapter.disconnect();
      this.adapter = null;
    }

    this.updateState({
      status: 'disconnected',
      wallet: null,
      account: null,
      error: null,
      isConnecting: false,
      isConnected: false,
    });
  }

  private setupEventListeners(): void {
    if (!this.adapter) return;

    const cleanup1 = this.adapter.on('disconnect', () => {
      this.updateState({
        status: 'disconnected',
        account: null,
        isConnected: false,
      });
    });

    const cleanup2 = this.adapter.on('accountsChanged', (accounts) => {
      if (Array.isArray(accounts) && accounts.length > 0) {
        const account = this.adapter?.getAccount();
        if (account) {
          this.updateState({ account });
        }
      } else {
        this.updateState({
          status: 'disconnected',
          account: null,
          isConnected: false,
        });
      }
    });

    const cleanup3 = this.adapter.on('chainChanged', () => {
      const account = this.adapter?.getAccount();
      if (account) {
        this.updateState({ account });
      }
    });

    const cleanup4 = this.adapter.on('error', (error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.updateState({ error: message, status: 'error' });
    });

    this.eventCleanups.push(cleanup1, cleanup2, cleanup3, cleanup4);
  }

  // ==========================================================================
  // Operations
  // ==========================================================================

  async getBalance(): Promise<Balance> {
    if (!this.adapter) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.getBalance();
  }

  async signMessage(request: SignMessageRequest): Promise<SignatureResult> {
    if (!this.adapter) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.signMessage(request);
  }

  async signTransaction(request: TransactionRequest | BSVTransactionRequest): Promise<string> {
    if (!this.adapter) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.signTransaction(request);
  }

  async sendTransaction(request: TransactionRequest | BSVTransactionRequest): Promise<TransactionResult> {
    if (!this.adapter) {
      throw new Error('Wallet not connected');
    }
    return this.adapter.sendTransaction(request);
  }

  async signTypedData(request: SignTypedDataRequest): Promise<SignatureResult> {
    if (!this.adapter?.signTypedData) {
      throw new Error('Wallet does not support typed data signing');
    }
    return this.adapter.signTypedData(request);
  }

  async switchNetwork(chainId: number | string): Promise<void> {
    if (!this.adapter?.switchNetwork) {
      throw new Error('Wallet does not support network switching');
    }
    return this.adapter.switchNetwork(chainId);
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  getAdapter(): WalletAdapter | null {
    return this.adapter;
  }

  isConnected(): boolean {
    return this.state.isConnected;
  }

  getAccount(): ConnectedAccount | null {
    return this.state.account;
  }

  getWalletInfo(): WalletInfo | null {
    return this.state.wallet;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createWalletManager(): WalletManager {
  return new WalletManager();
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getWalletsForBlockchain(blockchain: Blockchain): WalletInfo[] {
  return Object.values(WALLET_REGISTRY).filter(w => w.blockchain.includes(blockchain));
}

export function getWalletInfo(type: WalletType): WalletInfo {
  return WALLET_REGISTRY[type];
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatBalance(balance: bigint, decimals: number, maxDecimals: number = 4): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const fraction = balance % divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionStr = fraction.toString().padStart(decimals, '0');
  const trimmed = fractionStr.slice(0, maxDecimals).replace(/0+$/, '');

  if (!trimmed) {
    return whole.toString();
  }

  return `${whole}.${trimmed}`;
}

export function parseAmount(amount: string, decimals: number): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole || '0') * BigInt(10 ** decimals) + BigInt(paddedFraction || '0');
}

export function isValidAddress(address: string, blockchain: Blockchain): boolean {
  switch (blockchain) {
    case 'ethereum':
    case 'polygon':
    case 'arbitrum':
    case 'optimism':
    case 'base':
    case 'avalanche':
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case 'solana':
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    case 'bitcoin':
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,89}$/.test(address);
    case 'bsv':
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
    default:
      return address.length > 0;
  }
}

export function getExplorerUrl(blockchain: Blockchain, network: NetworkType, txHash: string): string {
  const explorers: Record<Blockchain, Record<NetworkType, string>> = {
    bsv: {
      mainnet: `https://whatsonchain.com/tx/${txHash}`,
      testnet: `https://test.whatsonchain.com/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
    bitcoin: {
      mainnet: `https://mempool.space/tx/${txHash}`,
      testnet: `https://mempool.space/testnet/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
    ethereum: {
      mainnet: `https://etherscan.io/tx/${txHash}`,
      testnet: `https://sepolia.etherscan.io/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
    polygon: {
      mainnet: `https://polygonscan.com/tx/${txHash}`,
      testnet: `https://mumbai.polygonscan.com/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
    arbitrum: {
      mainnet: `https://arbiscan.io/tx/${txHash}`,
      testnet: `https://sepolia.arbiscan.io/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
    optimism: {
      mainnet: `https://optimistic.etherscan.io/tx/${txHash}`,
      testnet: `https://sepolia-optimism.etherscan.io/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
    base: {
      mainnet: `https://basescan.org/tx/${txHash}`,
      testnet: `https://sepolia.basescan.org/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
    solana: {
      mainnet: `https://solscan.io/tx/${txHash}`,
      testnet: `https://solscan.io/tx/${txHash}?cluster=testnet`,
      devnet: `https://solscan.io/tx/${txHash}?cluster=devnet`,
      regtest: '',
    },
    avalanche: {
      mainnet: `https://snowtrace.io/tx/${txHash}`,
      testnet: `https://testnet.snowtrace.io/tx/${txHash}`,
      devnet: '',
      regtest: '',
    },
  };

  return explorers[blockchain]?.[network] || '';
}

export function getChainId(blockchain: Blockchain, network: NetworkType): number | null {
  const chainIds: Record<Blockchain, Record<NetworkType, number | null>> = {
    bsv: { mainnet: null, testnet: null, devnet: null, regtest: null },
    bitcoin: { mainnet: null, testnet: null, devnet: null, regtest: null },
    ethereum: { mainnet: 1, testnet: 11155111, devnet: null, regtest: null },
    polygon: { mainnet: 137, testnet: 80001, devnet: null, regtest: null },
    arbitrum: { mainnet: 42161, testnet: 421614, devnet: null, regtest: null },
    optimism: { mainnet: 10, testnet: 11155420, devnet: null, regtest: null },
    base: { mainnet: 8453, testnet: 84532, devnet: null, regtest: null },
    solana: { mainnet: null, testnet: null, devnet: null, regtest: null },
    avalanche: { mainnet: 43114, testnet: 43113, devnet: null, regtest: null },
  };

  return chainIds[blockchain]?.[network] ?? null;
}
