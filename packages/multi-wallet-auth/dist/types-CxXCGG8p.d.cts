/**
 * Wallet Types
 *
 * Shared type definitions for multi-wallet authentication.
 */
/** Supported wallet providers */
type WalletProvider = 'handcash' | 'yours' | 'phantom' | 'metamask';
/** Blockchain networks */
type Chain = 'bsv' | 'ethereum' | 'solana';
/** Provider to chain mapping */
declare const PROVIDER_CHAINS: Record<WalletProvider, Chain>;
/** Connected wallet state */
interface WalletState {
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
interface WalletContext extends WalletState {
    /** Connect to a specific wallet */
    connect: (provider: WalletProvider) => Promise<void>;
    /** Disconnect current wallet */
    disconnect: () => Promise<void>;
    /** Sign a message (if supported) */
    signMessage?: (message: string) => Promise<string>;
}
/** HandCash profile from OAuth */
interface HandCashProfile {
    id: string;
    handle: string;
    displayName: string;
    avatarUrl?: string;
}
/** Yours wallet addresses */
interface YoursAddresses {
    bsvAddress: string;
    ordAddress: string;
    identityAddress: string;
}
/** Phantom wallet response */
interface PhantomResponse {
    publicKey: {
        toString: () => string;
    };
}
/** MetaMask accounts response */
type MetaMaskAccounts = string[];
/** Wallet auth request body */
interface WalletAuthRequest {
    provider: WalletProvider;
    address: string;
    signature?: string;
    message?: string;
}
/** Wallet auth response */
interface WalletAuthResponse {
    success: boolean;
    unifiedUserId?: string;
    error?: string;
}
/** Session data stored in cookies/tokens */
interface WalletSession {
    provider: WalletProvider;
    address: string;
    chain: Chain;
    unifiedUserId?: string;
}
declare global {
    interface Window {
        /** Phantom wallet (Solana) */
        solana?: {
            isPhantom?: boolean;
            connect: () => Promise<PhantomResponse>;
            disconnect: () => Promise<void>;
            on: (event: string, callback: (args: unknown) => void) => void;
            off: (event: string, callback: (args: unknown) => void) => void;
            signMessage: (message: Uint8Array, encoding: string) => Promise<{
                signature: Uint8Array;
            }>;
        };
        /** MetaMask wallet (Ethereum) */
        ethereum?: {
            isMetaMask?: boolean;
            request: <T = unknown>(args: {
                method: string;
                params?: unknown[];
            }) => Promise<T>;
            on: (event: string, callback: (args: unknown) => void) => void;
            removeListener: (event: string, callback: (args: unknown) => void) => void;
            selectedAddress?: string;
            chainId?: string;
        };
        /** HandCash extension (if available) */
        handcash?: {
            connect: () => Promise<{
                cashaddr: string;
                pubkey: string;
            }>;
            disconnect: () => Promise<void>;
            on: (event: string, callback: (args: unknown) => void) => void;
            off: (event: string, callback: (args: unknown) => void) => void;
        };
    }
}

export { type Chain as C, type HandCashProfile as H, type MetaMaskAccounts as M, PROVIDER_CHAINS as P, type WalletAuthRequest as W, type YoursAddresses as Y, type PhantomResponse as a, type WalletAuthResponse as b, type WalletContext as c, type WalletProvider as d, type WalletSession as e, type WalletState as f };
