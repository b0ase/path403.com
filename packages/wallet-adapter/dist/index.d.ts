/**
 * @b0ase/wallet-adapter
 *
 * Unified wallet adapter for multi-chain connections.
 *
 * @packageDocumentation
 */
/** Supported blockchain */
type Blockchain = 'bsv' | 'bitcoin' | 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'solana' | 'avalanche';
/** Wallet type */
type WalletType = 'handcash' | 'yours' | 'panda' | 'twetch' | 'metamask' | 'walletconnect' | 'coinbase' | 'rainbow' | 'phantom' | 'solflare' | 'backpack' | 'ledger' | 'trezor';
/** Connection status */
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
/** Transaction status */
type TransactionStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';
/** Network type */
type NetworkType = 'mainnet' | 'testnet' | 'devnet' | 'regtest';
/** Wallet capabilities */
interface WalletCapabilities {
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
interface WalletInfo {
    type: WalletType;
    name: string;
    icon: string;
    blockchain: Blockchain[];
    capabilities: WalletCapabilities;
    downloadUrl?: string;
    installed?: boolean;
}
/** Connected account */
interface ConnectedAccount {
    address: string;
    publicKey?: string;
    paymail?: string;
    displayName?: string;
    avatar?: string;
    blockchain: Blockchain;
    network: NetworkType;
}
/** Wallet state */
interface WalletState {
    status: ConnectionStatus;
    wallet: WalletInfo | null;
    account: ConnectedAccount | null;
    error: string | null;
    isConnecting: boolean;
    isConnected: boolean;
}
/** Transaction request */
interface TransactionRequest {
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
interface BSVTransactionRequest {
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
interface SignMessageRequest {
    message: string;
    address?: string;
}
/** Sign typed data request */
interface SignTypedDataRequest {
    domain: {
        name?: string;
        version?: string;
        chainId?: number;
        verifyingContract?: string;
    };
    types: Record<string, Array<{
        name: string;
        type: string;
    }>>;
    primaryType: string;
    message: Record<string, unknown>;
}
/** Transaction result */
interface TransactionResult {
    hash: string;
    status: TransactionStatus;
    blockNumber?: number;
    confirmations?: number;
    gasUsed?: bigint;
    effectiveGasPrice?: bigint;
    error?: string;
}
/** Signature result */
interface SignatureResult {
    signature: string;
    address: string;
    message: string;
    recoveryId?: number;
}
/** Balance */
interface Balance {
    native: bigint;
    nativeSymbol: string;
    nativeDecimals: number;
    tokens?: TokenBalance[];
}
/** Token balance */
interface TokenBalance {
    contractAddress: string;
    symbol: string;
    name: string;
    decimals: number;
    balance: bigint;
    logo?: string;
}
/** Network info */
interface NetworkInfo {
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
declare const WALLET_REGISTRY: Record<WalletType, WalletInfo>;
interface WalletAdapter {
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
    watchAsset?(asset: {
        address: string;
        symbol: string;
        decimals: number;
        image?: string;
    }): Promise<boolean>;
    on(event: WalletEvent, callback: WalletEventCallback): () => void;
}
/** Connect options */
interface ConnectOptions {
    network?: NetworkType;
    chainId?: number | string;
    forceReconnect?: boolean;
}
/** Wallet event */
type WalletEvent = 'connect' | 'disconnect' | 'accountsChanged' | 'chainChanged' | 'error';
/** Wallet event callback */
type WalletEventCallback = (data: unknown) => void;
declare class WalletManager {
    private state;
    private adapter;
    private listeners;
    private eventCleanups;
    constructor();
    getState(): WalletState;
    subscribe(callback: (state: WalletState) => void): () => void;
    private notify;
    private updateState;
    connect(adapter: WalletAdapter, options?: ConnectOptions): Promise<ConnectedAccount>;
    disconnect(): Promise<void>;
    private setupEventListeners;
    getBalance(): Promise<Balance>;
    signMessage(request: SignMessageRequest): Promise<SignatureResult>;
    signTransaction(request: TransactionRequest | BSVTransactionRequest): Promise<string>;
    sendTransaction(request: TransactionRequest | BSVTransactionRequest): Promise<TransactionResult>;
    signTypedData(request: SignTypedDataRequest): Promise<SignatureResult>;
    switchNetwork(chainId: number | string): Promise<void>;
    getAdapter(): WalletAdapter | null;
    isConnected(): boolean;
    getAccount(): ConnectedAccount | null;
    getWalletInfo(): WalletInfo | null;
}
declare function createWalletManager(): WalletManager;
declare function getWalletsForBlockchain(blockchain: Blockchain): WalletInfo[];
declare function getWalletInfo(type: WalletType): WalletInfo;
declare function shortenAddress(address: string, chars?: number): string;
declare function formatBalance(balance: bigint, decimals: number, maxDecimals?: number): string;
declare function parseAmount(amount: string, decimals: number): bigint;
declare function isValidAddress(address: string, blockchain: Blockchain): boolean;
declare function getExplorerUrl(blockchain: Blockchain, network: NetworkType, txHash: string): string;
declare function getChainId(blockchain: Blockchain, network: NetworkType): number | null;

export { type BSVTransactionRequest, type Balance, type Blockchain, type ConnectOptions, type ConnectedAccount, type ConnectionStatus, type NetworkInfo, type NetworkType, type SignMessageRequest, type SignTypedDataRequest, type SignatureResult, type TokenBalance, type TransactionRequest, type TransactionResult, type TransactionStatus, WALLET_REGISTRY, type WalletAdapter, type WalletCapabilities, type WalletEvent, type WalletEventCallback, type WalletInfo, WalletManager, type WalletState, type WalletType, createWalletManager, formatBalance, getChainId, getExplorerUrl, getWalletInfo, getWalletsForBlockchain, isValidAddress, parseAmount, shortenAddress };
