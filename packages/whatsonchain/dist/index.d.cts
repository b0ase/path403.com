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
/** Network type */
type Network = 'main' | 'test' | 'stn';
/** Address balance */
interface AddressBalance {
    confirmed: number;
    unconfirmed: number;
}
/** UTXO */
interface UTXO {
    tx_hash: string;
    tx_pos: number;
    value: number;
    height: number;
}
/** Transaction output */
interface TxOutput {
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
interface TxInput {
    txid: string;
    vout: number;
    scriptSig: {
        asm: string;
        hex: string;
    };
    sequence: number;
}
/** Transaction */
interface Transaction {
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
interface BlockHeader {
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
interface ChainInfo {
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
interface ExchangeRate {
    currency: string;
    rate: number;
}
/** Client configuration */
interface WocConfig {
    network: Network;
    apiKey?: string;
    timeout?: number;
}
/**
 * WhatsOnChain API Client
 */
declare class WhatsOnChain {
    private baseUrl;
    private apiKey?;
    private timeout;
    constructor(config: WocConfig);
    /**
     * Fetch with timeout and error handling
     */
    private fetch;
    /**
     * Get chain info
     */
    getChainInfo(): Promise<ChainInfo>;
    /**
     * Get current block height
     */
    getBlockHeight(): Promise<number>;
    /**
     * Get address balance
     */
    getAddressBalance(address: string): Promise<AddressBalance>;
    /**
     * Get address UTXOs
     */
    getAddressUtxos(address: string): Promise<UTXO[]>;
    /**
     * Get address history (transaction hashes)
     */
    getAddressHistory(address: string): Promise<{
        tx_hash: string;
    }[]>;
    /**
     * Check if address has been used
     */
    isAddressUsed(address: string): Promise<boolean>;
    /**
     * Get transaction by ID
     */
    getTransaction(txid: string): Promise<Transaction>;
    /**
     * Get raw transaction hex
     */
    getRawTransaction(txid: string): Promise<string>;
    /**
     * Broadcast raw transaction
     */
    broadcastTx(txhex: string): Promise<string>;
    /**
     * Get transaction confirmations
     */
    getConfirmations(txid: string): Promise<number>;
    /**
     * Check if transaction is confirmed
     */
    isConfirmed(txid: string, minConfirmations?: number): Promise<boolean>;
    /**
     * Get block header by hash
     */
    getBlockHeader(hash: string): Promise<BlockHeader>;
    /**
     * Get block header by height
     */
    getBlockHeaderByHeight(height: number): Promise<BlockHeader>;
    /**
     * Get BSV exchange rate
     */
    getExchangeRate(): Promise<ExchangeRate>;
    /**
     * Get BSV price in USD
     */
    getBsvPriceUsd(): Promise<number>;
    /**
     * Get explorer URL for transaction
     */
    getTxUrl(txid: string): string;
    /**
     * Get explorer URL for address
     */
    getAddressUrl(address: string): string;
    /**
     * Get explorer URL for block
     */
    getBlockUrl(hashOrHeight: string | number): string;
}
/**
 * Create mainnet client
 */
declare function createMainnetClient(apiKey?: string): WhatsOnChain;
/**
 * Create testnet client
 */
declare function createTestnetClient(apiKey?: string): WhatsOnChain;
/**
 * Create client for any network
 */
declare function createClient(network: Network, apiKey?: string): WhatsOnChain;
/**
 * Convert satoshis to BSV
 */
declare function satsToBsv(sats: number): number;
/**
 * Convert BSV to satoshis
 */
declare function bsvToSats(bsv: number): number;
/**
 * Format satoshis as BSV string
 */
declare function formatBsv(sats: number, decimals?: number): string;
/**
 * Validate BSV address format (basic check)
 */
declare function isValidAddress(address: string): boolean;
/**
 * Validate transaction ID format
 */
declare function isValidTxid(txid: string): boolean;

export { type AddressBalance, type BlockHeader, type ChainInfo, type ExchangeRate, type Network, type Transaction, type TxInput, type TxOutput, type UTXO, WhatsOnChain, type WocConfig, bsvToSats, createClient, createMainnetClient, createTestnetClient, formatBsv, isValidAddress, isValidTxid, satsToBsv };
