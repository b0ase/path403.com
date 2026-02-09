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

// ============================================================================
// Types
// ============================================================================

/** Blockchain/chain type */
export type Chain =
  | 'bsv'
  | 'bitcoin'
  | 'ethereum'
  | 'solana'
  | 'polygon'
  | 'arbitrum'
  | 'base'
  | 'avalanche';

/** Asset type */
export type AssetType =
  | 'native'     // Native coin (BSV, ETH, SOL)
  | 'token'      // Fungible token (ERC-20, SPL, BSV-20)
  | 'nft'        // Non-fungible token
  | 'ordinal';   // Bitcoin ordinal/inscription

/** Balance status */
export type BalanceStatus = 'confirmed' | 'pending' | 'unconfirmed';

/** Wallet balance */
export interface WalletBalance {
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
export interface UTXO {
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
export interface TokenHolding {
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
export interface NFTHolding {
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
export interface WalletSummary {
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
export interface PortfolioAllocation {
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

// ============================================================================
// Constants
// ============================================================================

/** Chain display names */
export const CHAIN_NAMES: Record<Chain, string> = {
  bsv: 'Bitcoin SV',
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  solana: 'Solana',
  polygon: 'Polygon',
  arbitrum: 'Arbitrum',
  base: 'Base',
  avalanche: 'Avalanche',
};

/** Chain native symbols */
export const CHAIN_SYMBOLS: Record<Chain, string> = {
  bsv: 'BSV',
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  polygon: 'MATIC',
  arbitrum: 'ETH',
  base: 'ETH',
  avalanche: 'AVAX',
};

/** Chain explorers */
export const CHAIN_EXPLORERS: Record<Chain, string> = {
  bsv: 'https://whatsonchain.com',
  bitcoin: 'https://mempool.space',
  ethereum: 'https://etherscan.io',
  solana: 'https://solscan.io',
  polygon: 'https://polygonscan.com',
  arbitrum: 'https://arbiscan.io',
  base: 'https://basescan.org',
  avalanche: 'https://snowtrace.io',
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format balance for display
 */
export function formatBalance(
  balance: number,
  decimals: number = 8,
  options?: { maxDecimals?: number; compact?: boolean }
): string {
  const maxDecimals = options?.maxDecimals ?? decimals;

  if (options?.compact && balance >= 1000000) {
    return `${(balance / 1000000).toFixed(2)}M`;
  }
  if (options?.compact && balance >= 1000) {
    return `${(balance / 1000).toFixed(2)}K`;
  }

  // Determine significant decimals
  let displayDecimals = maxDecimals;
  if (balance >= 1000) displayDecimals = Math.min(2, maxDecimals);
  else if (balance >= 1) displayDecimals = Math.min(4, maxDecimals);
  else if (balance >= 0.0001) displayDecimals = Math.min(6, maxDecimals);

  return balance.toFixed(displayDecimals);
}

/**
 * Format USD value
 */
export function formatUsdValue(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Calculate total portfolio value
 */
export function calculatePortfolioValue(balances: WalletBalance[]): number {
  return balances.reduce((sum, b) => sum + (b.usdValue || 0), 0);
}

/**
 * Aggregate balances by symbol
 */
export function aggregateBalances(
  balances: WalletBalance[]
): Map<string, WalletBalance> {
  const aggregated = new Map<string, WalletBalance>();

  for (const balance of balances) {
    const key = `${balance.chain}:${balance.symbol}`;
    const existing = aggregated.get(key);

    if (existing) {
      existing.balance += balance.balance;
      existing.usdValue = (existing.usdValue || 0) + (balance.usdValue || 0);
    } else {
      aggregated.set(key, { ...balance });
    }
  }

  return aggregated;
}

/**
 * Calculate portfolio allocation
 */
export function calculateAllocation(
  balances: WalletBalance[]
): PortfolioAllocation[] {
  const totalValue = calculatePortfolioValue(balances);
  if (totalValue === 0) return [];

  return balances
    .filter((b) => b.usdValue && b.usdValue > 0)
    .map((b) => ({
      symbol: b.symbol,
      chain: b.chain,
      valueUsd: b.usdValue!,
      percentage: (b.usdValue! / totalValue) * 100,
      assetType: b.assetType || 'native',
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd);
}

/**
 * Create wallet summary
 */
export function createWalletSummary(
  balances: WalletBalance[],
  tokens: TokenHolding[] = [],
  nftCount: number = 0
): WalletSummary {
  const nativeBalances = balances.filter(
    (b) => !b.assetType || b.assetType === 'native'
  );
  const activeChains = [...new Set(balances.map((b) => b.chain))];

  return {
    totalValueUsd: calculatePortfolioValue(balances),
    nativeBalances,
    tokens,
    nftCount,
    activeChains,
    updatedAt: new Date(),
  };
}

/**
 * Convert satoshis to BSV
 */
export function satsToBsv(sats: number): number {
  return sats / 100000000;
}

/**
 * Convert BSV to satoshis
 */
export function bsvToSats(bsv: number): number {
  return Math.round(bsv * 100000000);
}

/**
 * Convert wei to ETH
 */
export function weiToEth(wei: bigint): number {
  return Number(wei) / 1e18;
}

/**
 * Convert ETH to wei
 */
export function ethToWei(eth: number): bigint {
  return BigInt(Math.round(eth * 1e18));
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.round(sol * 1e9);
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(chain: Chain, address: string): string {
  const base = CHAIN_EXPLORERS[chain];
  switch (chain) {
    case 'bsv':
      return `${base}/address/${address}`;
    case 'bitcoin':
      return `${base}/address/${address}`;
    case 'ethereum':
    case 'polygon':
    case 'arbitrum':
    case 'base':
    case 'avalanche':
      return `${base}/address/${address}`;
    case 'solana':
      return `${base}/account/${address}`;
    default:
      return `${base}/address/${address}`;
  }
}

/**
 * Get explorer URL for transaction
 */
export function getTxExplorerUrl(chain: Chain, txid: string): string {
  const base = CHAIN_EXPLORERS[chain];
  switch (chain) {
    case 'bsv':
      return `${base}/tx/${txid}`;
    case 'bitcoin':
      return `${base}/tx/${txid}`;
    case 'ethereum':
    case 'polygon':
    case 'arbitrum':
    case 'base':
    case 'avalanche':
      return `${base}/tx/${txid}`;
    case 'solana':
      return `${base}/tx/${txid}`;
    default:
      return `${base}/tx/${txid}`;
  }
}
