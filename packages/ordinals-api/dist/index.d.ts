/**
 * @b0ase/ordinals-api
 *
 * Ordinals indexer API client for inscriptions and BRC-20 tokens.
 *
 * @packageDocumentation
 */
/** Inscription data */
interface Inscription {
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
interface InscriptionContent {
    id: string;
    contentType: string;
    content: Uint8Array;
    text?: string;
}
/** BRC-20 token info */
interface BRC20Token {
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
interface BRC20Balance {
    ticker: string;
    availableBalance: string;
    transferableBalance: string;
    overallBalance: string;
}
/** BRC-20 transfer */
interface BRC20Transfer {
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
interface SatDetails {
    number: number;
    name: string;
    rarity: SatRarity;
    block: number;
    offset: number;
    coinbaseHeight: number;
    inscriptions: string[];
}
/** Sat rarity levels */
type SatRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
/** API response wrapper */
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    total?: number;
    offset?: number;
    limit?: number;
}
/** Pagination options */
interface PaginationOptions {
    offset?: number;
    limit?: number;
    [key: string]: unknown;
}
/** Search options */
interface SearchOptions extends PaginationOptions {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/** Client options */
interface OrdinalsClientOptions {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
    retries?: number;
}
declare const DEFAULT_CONFIG: Required<OrdinalsClientOptions>;
/** Alternative API endpoints */
declare const API_ENDPOINTS: {
    hiro: string;
    ordapi: string;
    ordiscan: string;
    bestinslot: string;
};
declare class OrdinalsClient {
    private config;
    constructor(options?: OrdinalsClientOptions);
    private request;
    private sleep;
    private buildQuery;
    getInscription(id: string): Promise<ApiResponse<Inscription>>;
    getInscriptions(options?: SearchOptions): Promise<ApiResponse<Inscription[]>>;
    getInscriptionsByAddress(address: string, options?: PaginationOptions): Promise<ApiResponse<Inscription[]>>;
    getInscriptionContent(id: string): Promise<ApiResponse<InscriptionContent>>;
    getInscriptionsByBlock(blockHeight: number, options?: PaginationOptions): Promise<ApiResponse<Inscription[]>>;
    searchInscriptions(params: {
        contentType?: string;
        fromNumber?: number;
        toNumber?: number;
        fromBlock?: number;
        toBlock?: number;
    } & PaginationOptions): Promise<ApiResponse<Inscription[]>>;
    getBRC20Tokens(options?: PaginationOptions): Promise<ApiResponse<BRC20Token[]>>;
    getBRC20Token(ticker: string): Promise<ApiResponse<BRC20Token>>;
    getBRC20Balances(address: string, options?: PaginationOptions): Promise<ApiResponse<BRC20Balance[]>>;
    getBRC20Balance(address: string, ticker: string): Promise<ApiResponse<BRC20Balance>>;
    getBRC20Transfers(ticker: string, options?: PaginationOptions): Promise<ApiResponse<BRC20Transfer[]>>;
    getBRC20Holders(ticker: string, options?: PaginationOptions): Promise<ApiResponse<Array<{
        address: string;
        balance: string;
    }>>>;
    getSat(satNumber: number): Promise<ApiResponse<SatDetails>>;
    getSatByName(name: string): Promise<ApiResponse<SatDetails>>;
    getSatInscriptions(satNumber: number, options?: PaginationOptions): Promise<ApiResponse<Inscription[]>>;
    getStats(): Promise<ApiResponse<{
        inscriptionsCount: number;
        brc20TokensCount: number;
        lastInscriptionNumber: number;
        lastBlockHeight: number;
    }>>;
}
declare function createOrdinalsClient(options?: OrdinalsClientOptions): OrdinalsClient;
/**
 * Parse inscription ID into components
 */
declare function parseInscriptionId(id: string): {
    txid: string;
    index: number;
} | null;
/**
 * Create inscription ID from components
 */
declare function createInscriptionId(txid: string, index: number): string;
/**
 * Determine sat rarity from sat number
 */
declare function getSatRarity(satNumber: number): SatRarity;
/**
 * Parse BRC-20 inscription content
 */
declare function parseBRC20Content(content: string): {
    p: string;
    op: 'deploy' | 'mint' | 'transfer';
    tick: string;
    amt?: string;
    max?: string;
    lim?: string;
    dec?: string;
} | null;
/**
 * Create BRC-20 deploy inscription content
 */
declare function createBRC20Deploy(ticker: string, maxSupply: string, mintLimit?: string, decimals?: number): string;
/**
 * Create BRC-20 mint inscription content
 */
declare function createBRC20Mint(ticker: string, amount: string): string;
/**
 * Create BRC-20 transfer inscription content
 */
declare function createBRC20Transfer(ticker: string, amount: string): string;

export { API_ENDPOINTS, type ApiResponse, type BRC20Balance, type BRC20Token, type BRC20Transfer, DEFAULT_CONFIG, type Inscription, type InscriptionContent, OrdinalsClient, type OrdinalsClientOptions, type PaginationOptions, type SatDetails, type SatRarity, type SearchOptions, createBRC20Deploy, createBRC20Mint, createBRC20Transfer, createInscriptionId, createOrdinalsClient, getSatRarity, parseBRC20Content, parseInscriptionId };
