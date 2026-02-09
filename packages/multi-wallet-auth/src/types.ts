/**
 * Wallet Types
 *
 * Shared type definitions for multi-wallet authentication.
 */

// ============================================================================
// Provider Types
// ============================================================================

/** Supported wallet providers */
export type WalletProvider = 'handcash' | 'yours' | 'phantom' | 'metamask';

/** Blockchain networks */
export type Chain = 'bsv' | 'ethereum' | 'solana';

/** Provider to chain mapping */
export const PROVIDER_CHAINS: Record<WalletProvider, Chain> = {
  handcash: 'bsv',
  yours: 'bsv',
  phantom: 'solana',
  metamask: 'ethereum',
};

// ============================================================================
// Wallet State Types
// ============================================================================

/** Connected wallet state */
export interface WalletState {
  /** Whether any wallet is connected */
  isConnected: boolean;
  /** Currently connected provider */
  provider: WalletProvider | null;
  /** Wallet address (handle for HandCash, address for others) */
  address: string | null;
  /** Public key for signing/encryption (if available) */
  publicKey: string | null;
  /** Chain of connected wallet */
  chain: Chain | null;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Error message if connection failed */
  error: string | null;
}

/** Wallet context with actions */
export interface WalletContext extends WalletState {
  /** Connect to a specific wallet */
  connect: (provider: WalletProvider) => Promise<void>;
  /** Disconnect current wallet */
  disconnect: () => Promise<void>;
  /** Sign a message (if supported) */
  signMessage?: (message: string) => Promise<string>;
}

// ============================================================================
// Provider-Specific Types
// ============================================================================

/** HandCash profile from OAuth */
export interface HandCashProfile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string;
}

/** Yours wallet addresses */
export interface YoursAddresses {
  bsvAddress: string;
  ordAddress: string;
  identityAddress: string;
}

/** Phantom wallet response */
export interface PhantomResponse {
  publicKey: {
    toString: () => string;
  };
}

/** MetaMask accounts response */
export type MetaMaskAccounts = string[];

// ============================================================================
// Server Types
// ============================================================================

/** Wallet auth request body */
export interface WalletAuthRequest {
  provider: WalletProvider;
  address: string;
  signature?: string;
  message?: string;
}

/** Wallet auth response */
export interface WalletAuthResponse {
  success: boolean;
  unifiedUserId?: string;
  error?: string;
}

/** Session data stored in cookies/tokens */
export interface WalletSession {
  provider: WalletProvider;
  address: string;
  chain: Chain;
  unifiedUserId?: string;
}

// ============================================================================
// Window Augmentation
// ============================================================================

declare global {
  interface Window {
    /** Phantom wallet (Solana) */
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<PhantomResponse>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: unknown) => void) => void;
      off: (event: string, callback: (args: unknown) => void) => void;
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: Uint8Array }>;
    };

    /** MetaMask wallet (Ethereum) */
    ethereum?: {
      isMetaMask?: boolean;
      request: <T = unknown>(args: { method: string; params?: unknown[] }) => Promise<T>;
      on: (event: string, callback: (args: unknown) => void) => void;
      removeListener: (event: string, callback: (args: unknown) => void) => void;
      selectedAddress?: string;
      chainId?: string;
    };

    /** HandCash extension (if available) */
    handcash?: {
      connect: () => Promise<{ cashaddr: string; pubkey: string }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (args: unknown) => void) => void;
      off: (event: string, callback: (args: unknown) => void) => void;
    };
  }
}

export {};
