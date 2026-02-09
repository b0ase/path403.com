/**
 * @b0ase/wallet-view
 *
 * Unified wallet balance display types and utilities.
 *
 * @example
 * ```typescript
 * import {
 *   WalletBalance,
 *   formatBalance,
 *   aggregateBalances,
 *   calculatePortfolioValue,
 * } from '@b0ase/wallet-view';
 *
 * const balances: WalletBalance[] = [
 *   { chain: 'bsv', symbol: 'BSV', balance: 1.5, usdValue: 75 },
 *   { chain: 'ethereum', symbol: 'ETH', balance: 0.5, usdValue: 1250 },
 * ];
 *
 * const total = calculatePortfolioValue(balances);
 * console.log(`Total: $${total}`); // Total: $1325
 * ```
 *
 * @packageDocumentation
 */
/** Blockchain/chain type */
type Chain = 'bsv' | 'bitcoin' | 'ethereum' | 'solana' | 'polygon' | 'arbitrum' | 'base' | 'avalanche';
/** Asset type */
type AssetType = 'native' | 'token' | 'nft' | 'ordinal';
/** Balance status */
type BalanceStatus = 'confirmed' | 'pending' | 'unconfirmed';
/** Wallet balance */
interface WalletBalance {
    /** Chain */
    chain: Chain;
    /** Token/asset symbol */
    symbol: string;
    /** Token name */
    name?: string;
    /** Balance amount */
    balance: number;
    /** Decimal places */
    decimals?: number;
    /** USD value */
    usdValue?: number;
    /** Asset type */
    assetType?: AssetType;
    /** Contract address (for tokens) */
    contractAddress?: string;
    /** Token logo URL */
    logoUrl?: string;
    /** Balance status */
    status?: BalanceStatus;
    /** Last updated */
    updatedAt?: Date;
}
/** UTXO (Unspent Transaction Output) */
interface UTXO {
    /** Transaction ID */
    txid: string;
    /** Output index */
    vout: number;
    /** Amount in satoshis */
    satoshis: number;
    /** Script (hex) */
    script?: string;
    /** Is confirmed */
    confirmed: boolean;
    /** Block height */
    blockHeight?: number;
    /** Confirmations */
    confirmations?: number;
}
/** Token holding */
interface TokenHolding {
    /** Token symbol */
    symbol: string;
    /** Token name */
    name: string;
    /** Balance */
    balance: bigint;
    /** Decimals */
    decimals: number;
    /** Contract address */
    contractAddress?: string;
    /** Token standard */
    standard?: 'bsv-20' | 'erc-20' | 'erc-721' | 'erc-1155' | 'spl';
    /** Logo URL */
    logoUrl?: string;
    /** USD price per token */
    priceUsd?: number;
    /** Total USD value */
    valueUsd?: number;
}
/** NFT/Ordinal holding */
interface NFTHolding {
    /** Collection name */
    collection?: string;
    /** Token ID */
    tokenId: string;
    /** Name */
    name?: string;
    /** Description */
    description?: string;
    /** Image URL */
    imageUrl?: string;
    /** Content type */
    contentType?: string;
    /** Inscription ID (for ordinals) */
    inscriptionId?: string;
    /** Floor price */
    floorPriceUsd?: number;
    /** Chain */
    chain: Chain;
}
/** Wallet summary */
interface WalletSummary {
    /** Total USD value */
    totalValueUsd: number;
    /** Native coin balances */
    nativeBalances: WalletBalance[];
    /** Token holdings */
    tokens: TokenHolding[];
    /** NFT count */
    nftCount: number;
    /** Chains with balances */
    activeChains: Chain[];
    /** Last updated */
    updatedAt: Date;
}
/** Portfolio allocation */
interface PortfolioAllocation {
    /** Asset symbol */
    symbol: string;
    /** Chain */
    chain: Chain;
    /** USD value */
    valueUsd: number;
    /** Percentage of portfolio */
    percentage: number;
    /** Asset type */
    assetType: AssetType;
}
/** Chain display names */
declare const CHAIN_NAMES: Record<Chain, string>;
/** Chain native symbols */
declare const CHAIN_SYMBOLS: Record<Chain, string>;
/** Chain explorers */
declare const CHAIN_EXPLORERS: Record<Chain, string>;
/**
 * Format balance for display
 */
declare function formatBalance(balance: number, decimals?: number, options?: {
    maxDecimals?: number;
    compact?: boolean;
}): string;
/**
 * Format USD value
 */
declare function formatUsdValue(value: number): string;
/**
 * Calculate total portfolio value
 */
declare function calculatePortfolioValue(balances: WalletBalance[]): number;
/**
 * Aggregate balances by symbol
 */
declare function aggregateBalances(balances: WalletBalance[]): Map<string, WalletBalance>;
/**
 * Calculate portfolio allocation
 */
declare function calculateAllocation(balances: WalletBalance[]): PortfolioAllocation[];
/**
 * Create wallet summary
 */
declare function createWalletSummary(balances: WalletBalance[], tokens?: TokenHolding[], nftCount?: number): WalletSummary;
/**
 * Convert satoshis to BSV
 */
declare function satsToBsv(sats: number): number;
/**
 * Convert BSV to satoshis
 */
declare function bsvToSats(bsv: number): number;
/**
 * Convert wei to ETH
 */
declare function weiToEth(wei: bigint): number;
/**
 * Convert ETH to wei
 */
declare function ethToWei(eth: number): bigint;
/**
 * Convert lamports to SOL
 */
declare function lamportsToSol(lamports: number): number;
/**
 * Convert SOL to lamports
 */
declare function solToLamports(sol: number): number;
/**
 * Get explorer URL for address
 */
declare function getAddressExplorerUrl(chain: Chain, address: string): string;
/**
 * Get explorer URL for transaction
 */
declare function getTxExplorerUrl(chain: Chain, txid: string): string;

export { type AssetType, type BalanceStatus, CHAIN_EXPLORERS, CHAIN_NAMES, CHAIN_SYMBOLS, type Chain, type NFTHolding, type PortfolioAllocation, type TokenHolding, type UTXO, type WalletBalance, type WalletSummary, aggregateBalances, bsvToSats, calculateAllocation, calculatePortfolioValue, createWalletSummary, ethToWei, formatBalance, formatUsdValue, getAddressExplorerUrl, getTxExplorerUrl, lamportsToSol, satsToBsv, solToLamports, weiToEth };
