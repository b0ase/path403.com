/**
 * Token Verification for Boardroom Voting
 *
 * Verifies token ownership for voting power calculation.
 * Supports:
 * - BSV21 on-chain tokens (GorillaPool API)
 * - Cap table shareholders (database equity)
 * - Tokenized repositories (database)
 * - Issued project tokens (database)
 */

import { MULTICHAIN_TOKENS } from '@/lib/multichain';
import { getTokenHoldings, TokenHolding } from './token-holdings';

export interface TokenBalance {
  tokenId: string;
  symbol: string;
  balance: bigint;
  address: string;
  chain: 'bsv' | 'eth' | 'sol';
}

export interface VotingPowerResult {
  verified: boolean;
  votingPower: bigint;
  tokenBalance: bigint;
  tokenSymbol: string;
  address: string;
  source: 'onchain' | 'cap_table' | 'database' | 'combined';
  ownershipPercentage?: number; // For cap table shareholders
  error?: string;
}

// Cache token balances for 5 minutes to avoid excessive API calls
const balanceCache = new Map<string, { balance: bigint; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Fetch BSV21 token balance from GorillaPool
 */
async function fetchBsv21Balance(address: string, tokenId: string): Promise<bigint> {
  // Check cache first
  const cacheKey = `${address}:${tokenId}`;
  const cached = balanceCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.balance;
  }

  try {
    const response = await fetch(
      `https://ordinals.gorillapool.io/api/bsv20/${address}/unspent?id=${tokenId}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        balanceCache.set(cacheKey, { balance: BigInt(0), timestamp: Date.now() });
        return BigInt(0);
      }
      throw new Error(`GorillaPool API error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      balanceCache.set(cacheKey, { balance: BigInt(0), timestamp: Date.now() });
      return BigInt(0);
    }

    const balance = data.reduce(
      (sum: bigint, utxo: { amt?: string }) => sum + BigInt(utxo.amt || '0'),
      BigInt(0)
    );

    // Cache the result
    balanceCache.set(cacheKey, { balance, timestamp: Date.now() });

    return balance;
  } catch (error) {
    console.error('[token-verification] BSV balance fetch error:', error);
    return BigInt(0);
  }
}

/**
 * Get the default token for voting (BOASE)
 */
export function getDefaultVotingToken(): { tokenId: string; symbol: string } {
  const boase = MULTICHAIN_TOKENS.find(t => t.symbol === 'BOASE');
  return {
    tokenId: boase?.contracts.bsv || 'c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
    symbol: 'BOASE'
  };
}

/**
 * Verify voting power for a wallet address
 *
 * Checks multiple sources for token holdings:
 * 1. On-chain BSV21 balance (GorillaPool API)
 * 2. Cap table shareholders (database equity)
 * 3. Tokenized repositories and issued tokens (database)
 *
 * For $BOASE specifically, cap table ownership % is used for voting weight.
 *
 * @param walletAddress The voter's wallet address
 * @param requiredToken Optional specific token to check (defaults to BOASE)
 * @returns Verified voting power based on combined holdings
 */
export async function verifyVotingPower(
  walletAddress: string,
  requiredToken?: string
): Promise<VotingPowerResult> {
  try {
    // Determine which token to check
    let tokenId: string;
    let tokenSymbol: string;

    if (requiredToken) {
      // Look up the token
      const token = MULTICHAIN_TOKENS.find(
        t => t.symbol === requiredToken || t.contracts.bsv === requiredToken
      );
      if (token && token.contracts.bsv) {
        tokenId = token.contracts.bsv;
        tokenSymbol = token.symbol;
      } else {
        // Assume requiredToken is a BSV21 token ID
        tokenId = requiredToken;
        tokenSymbol = 'UNKNOWN';
      }
    } else {
      // Use default voting token (BOASE)
      const defaultToken = getDefaultVotingToken();
      tokenId = defaultToken.tokenId;
      tokenSymbol = defaultToken.symbol;
    }

    // For BOASE token, check both on-chain AND cap table
    // Cap table shareholders get voting power based on ownership percentage
    if (tokenSymbol.toUpperCase() === 'BOASE') {
      // Check database holdings (cap table, etc.)
      const dbHoldings = await getTokenHoldings(walletAddress);
      const boaseHolding = dbHoldings.find(
        h => h.symbol.toUpperCase() === 'BOASE' && h.type === 'equity'
      );

      if (boaseHolding && boaseHolding.balance > 0) {
        // Cap table shareholder - use ownership percentage as voting weight
        // Convert ownership % to voting power (1% = 1,000,000 voting power)
        const ownershipPct = boaseHolding.ownershipPercentage || 0;
        const votingPower = BigInt(Math.floor(ownershipPct * 1_000_000));
        const tokenBalance = BigInt(Math.floor(boaseHolding.balance));

        return {
          verified: true,
          votingPower,
          tokenBalance,
          tokenSymbol: 'BOASE',
          address: walletAddress,
          source: 'cap_table',
          ownershipPercentage: ownershipPct
        };
      }

      // Not in cap table - check on-chain BSV21 balance
      const onchainBalance = await fetchBsv21Balance(walletAddress, tokenId);
      if (onchainBalance > BigInt(0)) {
        return {
          verified: true,
          votingPower: onchainBalance,
          tokenBalance: onchainBalance,
          tokenSymbol: 'BOASE',
          address: walletAddress,
          source: 'onchain'
        };
      }

      // No BOASE holdings found
      return {
        verified: false,
        votingPower: BigInt(0),
        tokenBalance: BigInt(0),
        tokenSymbol: 'BOASE',
        address: walletAddress,
        source: 'onchain',
        error: `No BOASE tokens found. Join the cap table or acquire tokens on-chain.`
      };
    }

    // For other tokens, check database holdings first, then on-chain
    const dbHoldings = await getTokenHoldings(walletAddress);
    const matchingHolding = dbHoldings.find(
      h => h.symbol.toUpperCase() === tokenSymbol.toUpperCase()
    );

    if (matchingHolding && matchingHolding.balance > 0) {
      return {
        verified: true,
        votingPower: BigInt(Math.floor(matchingHolding.balance)),
        tokenBalance: BigInt(Math.floor(matchingHolding.balance)),
        tokenSymbol: matchingHolding.symbol,
        address: walletAddress,
        source: 'database'
      };
    }

    // Check on-chain balance
    const balance = await fetchBsv21Balance(walletAddress, tokenId);

    if (balance <= BigInt(0)) {
      return {
        verified: false,
        votingPower: BigInt(0),
        tokenBalance: BigInt(0),
        tokenSymbol,
        address: walletAddress,
        source: 'onchain',
        error: `No ${tokenSymbol} tokens found at address ${walletAddress}`
      };
    }

    return {
      verified: true,
      votingPower: balance,
      tokenBalance: balance,
      tokenSymbol,
      address: walletAddress,
      source: 'onchain'
    };

  } catch (error) {
    console.error('[token-verification] Error:', error);
    return {
      verified: false,
      votingPower: BigInt(0),
      tokenBalance: BigInt(0),
      tokenSymbol: 'UNKNOWN',
      address: walletAddress,
      source: 'onchain',
      error: error instanceof Error ? error.message : 'Verification failed'
    };
  }
}

/**
 * Check if an address meets minimum token requirement
 */
export async function meetsTokenRequirement(
  walletAddress: string,
  tokenId: string,
  minimumBalance: bigint
): Promise<{ meets: boolean; balance: bigint; required: bigint }> {
  const balance = await fetchBsv21Balance(walletAddress, tokenId);
  return {
    meets: balance >= minimumBalance,
    balance,
    required: minimumBalance
  };
}

/**
 * Get voting power for multiple addresses (for delegation)
 */
export async function getTotalVotingPower(
  addresses: string[],
  tokenId?: string
): Promise<bigint> {
  const token = tokenId || getDefaultVotingToken().tokenId;

  const balances = await Promise.all(
    addresses.map(addr => fetchBsv21Balance(addr, token))
  );

  return balances.reduce((sum, bal) => sum + bal, BigInt(0));
}

/**
 * Clear the balance cache (useful for testing or force refresh)
 */
export function clearBalanceCache(): void {
  balanceCache.clear();
}

/**
 * Format voting power for display
 */
export function formatVotingPower(power: bigint): string {
  const value = Number(power);

  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;

  return value.toLocaleString();
}
