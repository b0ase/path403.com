/**
 * @b0ase/yours-wallet
 *
 * Yours Wallet integration for BSV payments, auth, and ordinals.
 *
 * @packageDocumentation
 */
/** Yours Wallet provider interface (injected window.yours) */
interface YoursProvider {
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
interface YoursIdentity {
    paymail: string;
    pubKey: string;
    addresses: YoursAddresses;
}
/** Yours addresses */
interface YoursAddresses {
    bsvAddress: string;
    ordAddress: string;
    identityAddress: string;
}
/** Yours balance */
interface YoursBalance {
    bsv: number;
    usd: number;
    satoshis: number;
}
/** Yours ordinal */
interface YoursOrdinal {
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
interface SendBsvParams {
    satoshis: number;
    address?: string;
    paymail?: string;
    data?: string[];
    script?: string;
}
/** Send BSV result */
interface SendBsvResult {
    txid: string;
    rawtx: string;
}
/** Transfer ordinal params */
interface TransferOrdinalParams {
    origin: string;
    address?: string;
    paymail?: string;
}
/** Transfer ordinal result */
interface TransferOrdinalResult {
    txid: string;
    rawtx: string;
}
/** Sign message params */
interface SignMessageParams {
    message: string;
    encoding?: 'utf8' | 'hex' | 'base64';
}
/** Sign message result */
interface SignMessageResult {
    message: string;
    sig: string;
    address: string;
    pubKey: string;
}
/** Broadcast params */
interface BroadcastParams {
    rawtx: string;
}
/** Broadcast result */
interface BroadcastResult {
    txid: string;
}
/** Get signatures params */
interface GetSignaturesParams {
    rawtx: string;
    sigRequests: SignatureRequest[];
}
/** Signature request */
interface SignatureRequest {
    prevTxid: string;
    outputIndex: number;
    inputIndex: number;
    satoshis: number;
    script?: string;
    sigHashType?: number;
    csIdx?: number;
}
/** Get signatures result */
interface GetSignaturesResult {
    rawtx: string;
    sigResponses: SignatureResponse[];
}
/** Signature response */
interface SignatureResponse {
    sig: string;
    pubKey: string;
    inputIndex: number;
}
/** Social profile */
interface YoursSocialProfile {
    displayName: string;
    avatar?: string;
    banner?: string;
    description?: string;
}
/** Yours events */
type YoursEvent = 'connect' | 'disconnect' | 'networkChange' | 'accountChange';
/** Event callback */
type YoursEventCallback = (data?: unknown) => void;
/** Connection state */
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
/** Wallet options */
interface YoursWalletOptions {
    autoConnect?: boolean;
    onConnect?: (identity: YoursIdentity) => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}
declare const YOURS_EXTENSION_ID = "yours-wallet";
declare const YOURS_WALLET_URL = "https://yours.org";
declare const YOURS_CHROME_STORE_URL = "https://chromewebstore.google.com/detail/yours-wallet/mlbnicldlpdimbjdcncnklfempedeipj";
declare class YoursWallet {
    private provider;
    private identity;
    private state;
    private listeners;
    private options;
    constructor(options?: YoursWalletOptions);
    private detectProvider;
    private setupEventListeners;
    isInstalled(): boolean;
    isConnected(): boolean;
    getState(): ConnectionState;
    getIdentity(): YoursIdentity | null;
    connect(): Promise<YoursIdentity>;
    disconnect(): Promise<void>;
    getAddresses(): Promise<YoursAddresses>;
    getBalance(): Promise<YoursBalance>;
    getOrdinals(): Promise<YoursOrdinal[]>;
    getSocialProfile(): Promise<YoursSocialProfile | null>;
    getExchangeRate(): Promise<number>;
    sendBsv(params: SendBsvParams): Promise<SendBsvResult>;
    sendToAddress(address: string, satoshis: number): Promise<SendBsvResult>;
    sendToPaymail(paymail: string, satoshis: number): Promise<SendBsvResult>;
    sendWithData(satoshis: number, data: string[], address?: string): Promise<SendBsvResult>;
    transferOrdinal(params: TransferOrdinalParams): Promise<TransferOrdinalResult>;
    sendOrdinalToAddress(origin: string, address: string): Promise<TransferOrdinalResult>;
    sendOrdinalToPaymail(origin: string, paymail: string): Promise<TransferOrdinalResult>;
    signMessage(message: string, encoding?: 'utf8' | 'hex' | 'base64'): Promise<SignMessageResult>;
    getSignatures(rawtx: string, sigRequests: SignatureRequest[]): Promise<GetSignaturesResult>;
    broadcast(rawtx: string): Promise<BroadcastResult>;
    on(event: string, callback: (data?: unknown) => void): () => void;
    off(event: string, callback: (data?: unknown) => void): void;
    private emit;
    private ensureConnected;
    getPaymail(): string | null;
    getBsvAddress(): string | null;
    getOrdAddress(): string | null;
    getIdentityAddress(): string | null;
    getPubKey(): string | null;
}
declare function createYoursWallet(options?: YoursWalletOptions): YoursWallet;
/**
 * Check if Yours Wallet is installed
 */
declare function isYoursInstalled(): boolean;
/**
 * Get Yours Wallet provider directly
 */
declare function getYoursProvider(): YoursProvider | null;
/**
 * Wait for Yours Wallet to be ready
 */
declare function waitForYours(timeout?: number): Promise<YoursProvider>;
/**
 * Parse paymail address
 */
declare function parsePaymail(paymail: string): {
    alias: string;
    domain: string;
} | null;
/**
 * Validate paymail address
 */
declare function isValidPaymail(paymail: string): boolean;
/**
 * Format satoshis for display
 */
declare function formatSatoshis(sats: number): string;
/**
 * Calculate USD value from satoshis
 */
declare function satsToUsd(sats: number, exchangeRate: number): number;
/**
 * Calculate satoshis from USD value
 */
declare function usdToSats(usd: number, exchangeRate: number): number;

export { type BroadcastParams, type BroadcastResult, type ConnectionState, type GetSignaturesParams, type GetSignaturesResult, type SendBsvParams, type SendBsvResult, type SignMessageParams, type SignMessageResult, type SignatureRequest, type SignatureResponse, type TransferOrdinalParams, type TransferOrdinalResult, YOURS_CHROME_STORE_URL, YOURS_EXTENSION_ID, YOURS_WALLET_URL, type YoursAddresses, type YoursBalance, type YoursEvent, type YoursEventCallback, type YoursIdentity, type YoursOrdinal, type YoursProvider, type YoursSocialProfile, YoursWallet, type YoursWalletOptions, createYoursWallet, formatSatoshis, getYoursProvider, isValidPaymail, isYoursInstalled, parsePaymail, satsToUsd, usdToSats, waitForYours };
