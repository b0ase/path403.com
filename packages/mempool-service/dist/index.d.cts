/**
 * @b0ase/mempool-service
 *
 * Mempool monitoring service with fee estimation and transaction tracking.
 *
 * @packageDocumentation
 */
/** Network type */
type Network = 'mainnet' | 'testnet' | 'signet';
/** Fee rates in sat/vB */
interface FeeRates {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
}
/** Mempool info */
interface MempoolInfo {
    count: number;
    vsize: number;
    totalFee: number;
    feeHistogram: Array<[number, number]>;
}
/** Transaction status */
interface TxStatus {
    confirmed: boolean;
    blockHeight?: number;
    blockHash?: string;
    blockTime?: number;
}
/** Transaction details */
interface Transaction {
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
interface TxInput {
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
interface TxOutput {
    scriptpubkey: string;
    scriptpubkeyAsm: string;
    scriptpubkeyType: string;
    scriptpubkeyAddress?: string;
    value: number;
}
/** Block details */
interface Block {
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
interface AddressInfo {
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
interface UTXO {
    txid: string;
    vout: number;
    status: TxStatus;
    value: number;
}
/** WebSocket message */
interface WSMessage {
    type: 'block' | 'tx' | 'address-tx' | 'mempool';
    data: unknown;
}
/** Client options */
interface MempoolClientOptions {
    network?: Network;
    baseUrl?: string;
    wsUrl?: string;
    timeout?: number;
}
/** Event types */
type MempoolEvent = 'block' | 'tx' | 'address-tx' | 'connected' | 'disconnected' | 'error';
/** Event listener */
type MempoolEventListener = (data: unknown) => void;
declare const NETWORK_URLS: Record<Network, {
    api: string;
    ws: string;
}>;
declare class MempoolClient {
    private network;
    private baseUrl;
    private wsUrl;
    private timeout;
    private ws;
    private listeners;
    private subscriptions;
    constructor(options?: MempoolClientOptions);
    private request;
    getFeeRates(): Promise<FeeRates>;
    getMempoolBlocks(): Promise<Array<{
        blockSize: number;
        blockVSize: number;
        feeRange: number[];
    }>>;
    getMempoolInfo(): Promise<MempoolInfo>;
    getMempoolTxids(): Promise<string[]>;
    getRecentMempoolTxs(): Promise<Transaction[]>;
    getTransaction(txid: string): Promise<Transaction>;
    getTxStatus(txid: string): Promise<TxStatus>;
    getTxHex(txid: string): Promise<string>;
    getTxRaw(txid: string): Promise<Uint8Array>;
    broadcastTx(txHex: string): Promise<string>;
    getTxOutspends(txid: string): Promise<Array<{
        spent: boolean;
        txid?: string;
        vin?: number;
    }>>;
    getAddressInfo(address: string): Promise<AddressInfo>;
    getAddressTxs(address: string): Promise<Transaction[]>;
    getAddressTxsChain(address: string, lastTxid?: string): Promise<Transaction[]>;
    getAddressTxsMempool(address: string): Promise<Transaction[]>;
    getAddressUtxos(address: string): Promise<UTXO[]>;
    getBlock(hash: string): Promise<Block>;
    getBlockHeader(hash: string): Promise<string>;
    getBlockHeight(hash: string): Promise<number>;
    getBlockTxids(hash: string): Promise<string[]>;
    getBlockTxs(hash: string, startIndex?: number): Promise<Transaction[]>;
    getBlockHashByHeight(height: number): Promise<string>;
    getTipHeight(): Promise<number>;
    getTipHash(): Promise<string>;
    getRecentBlocks(): Promise<Block[]>;
    getDifficultyAdjustment(): Promise<{
        progressPercent: number;
        difficultyChange: number;
        estimatedRetargetDate: number;
        remainingBlocks: number;
        remainingTime: number;
        previousRetarget: number;
        nextRetargetHeight: number;
        timeAvg: number;
        timeOffset: number;
    }>;
    getHashrate(timePeriod?: '1m' | '3m' | '6m' | '1y' | '2y' | '3y'): Promise<{
        hashrates: Array<{
            timestamp: number;
            avgHashrate: number;
        }>;
        difficulty: Array<{
            timestamp: number;
            difficulty: number;
        }>;
        currentHashrate: number;
        currentDifficulty: number;
    }>;
    connect(): void;
    disconnect(): void;
    private send;
    private resubscribe;
    subscribeBlocks(): void;
    subscribeMempool(): void;
    subscribeAddress(address: string): void;
    unsubscribeAddress(address: string): void;
    on(event: MempoolEvent, listener: MempoolEventListener): () => void;
    off(event: MempoolEvent, listener: MempoolEventListener): void;
    private emit;
    waitForConfirmation(txid: string, options?: {
        timeout?: number;
        pollInterval?: number;
    }): Promise<TxStatus>;
    estimateFee(vsize: number, priority?: 'fastest' | 'halfHour' | 'hour' | 'economy'): Promise<number>;
}
declare function createMempoolClient(options?: MempoolClientOptions): MempoolClient;
/**
 * Calculate transaction virtual size
 */
declare function calculateVSize(weight: number): number;
/**
 * Calculate fee rate from transaction
 */
declare function calculateFeeRate(fee: number, vsize: number): number;
/**
 * Format satoshis as BTC
 */
declare function satsToBtc(sats: number): string;
/**
 * Format BTC as satoshis
 */
declare function btcToSats(btc: number): number;

export { type AddressInfo, type Block, type FeeRates, MempoolClient, type MempoolClientOptions, type MempoolEvent, type MempoolEventListener, type MempoolInfo, NETWORK_URLS, type Network, type Transaction, type TxInput, type TxOutput, type TxStatus, type UTXO, type WSMessage, btcToSats, calculateFeeRate, calculateVSize, createMempoolClient, satsToBtc };
