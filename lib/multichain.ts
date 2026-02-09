/**
 * Multi-Chain Token Aggregation for b0ase.com
 *
 * Aggregates token holdings across BSV, ETH, and SOL chains.
 * Companies can tokenize shares on multiple chains; this aggregates user holdings.
 */

// Chain types
export type Chain = 'bsv' | 'eth' | 'sol';

// Token holding on a specific chain
export interface ChainHolding {
  chain: Chain;
  address: string;
  balance: bigint;
  tokenContract: string;
  lastUpdated: Date;
}

// Aggregated holdings for a token across all chains
export interface AggregatedHolding {
  tokenSymbol: string;
  totalBalance: bigint;
  holdings: ChainHolding[];
  percentage?: number; // Percentage of total supply
}

// User's complete portfolio
export interface UserPortfolio {
  wallets: {
    bsv?: string;
    eth?: string;
    sol?: string;
  };
  holdings: AggregatedHolding[];
  totalValueUsd?: number;
  lastUpdated: Date;
}

// Token contract addresses across chains
export interface MultiChainToken {
  symbol: string;
  name: string;
  totalSupply: bigint;
  contracts: {
    bsv?: string; // BSV21 token ID
    eth?: string; // ERC-20 address
    sol?: string; // SPL token address
  };
}

// Known multi-chain tokens
export const MULTICHAIN_TOKENS: MultiChainToken[] = [
  {
    symbol: 'BOASE',
    name: 'Boase Corporation',
    totalSupply: BigInt(1_000_000_000),
    contracts: {
      bsv: 'c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
      // eth: '0x...', // To be deployed
      // sol: '...', // To be deployed
    }
  }
];

/**
 * Fetch BSV token balance from GorillaPool
 */
async function fetchBsvBalance(address: string, tokenId: string): Promise<bigint> {
  try {
    const response = await fetch(
      `https://ordinals.gorillapool.io/api/bsv20/${address}/unspent?id=${tokenId}`
    );

    if (!response.ok) return BigInt(0);

    const data = await response.json();
    if (!Array.isArray(data)) return BigInt(0);

    return data.reduce(
      (sum: bigint, utxo: { amt?: string }) => sum + BigInt(utxo.amt || '0'),
      BigInt(0)
    );
  } catch (error) {
    console.error('[multichain] BSV balance fetch error:', error);
    return BigInt(0);
  }
}

/**
 * Fetch ETH ERC-20 token balance
 */
async function fetchEthBalance(address: string, tokenContract: string): Promise<bigint> {
  try {
    // Use Etherscan API or direct RPC
    const rpcUrl = process.env.ETH_RPC_URL || 'https://eth.llamarpc.com';

    // ERC-20 balanceOf function signature
    const data = `0x70a08231000000000000000000000000${address.slice(2).padStart(64, '0')}`;

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: tokenContract, data }, 'latest'],
        id: 1
      })
    });

    const result = await response.json();
    if (result.result && result.result !== '0x') {
      return BigInt(result.result);
    }

    return BigInt(0);
  } catch (error) {
    console.error('[multichain] ETH balance fetch error:', error);
    return BigInt(0);
  }
}

/**
 * Fetch SOL SPL token balance
 */
async function fetchSolBalance(address: string, tokenMint: string): Promise<bigint> {
  try {
    const rpcUrl = process.env.SOL_RPC_URL || 'https://api.mainnet-beta.solana.com';

    // Get token accounts for owner
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { mint: tokenMint },
          { encoding: 'jsonParsed' }
        ],
        id: 1
      })
    });

    const result = await response.json();
    if (result.result?.value?.length > 0) {
      const balance = result.result.value[0].account.data.parsed.info.tokenAmount.amount;
      return BigInt(balance);
    }

    return BigInt(0);
  } catch (error) {
    console.error('[multichain] SOL balance fetch error:', error);
    return BigInt(0);
  }
}

/**
 * Fetch holdings for a token across all chains
 */
export async function fetchTokenHoldings(
  token: MultiChainToken,
  wallets: { bsv?: string; eth?: string; sol?: string }
): Promise<AggregatedHolding> {
  const holdings: ChainHolding[] = [];
  let totalBalance = BigInt(0);

  // Fetch BSV balance
  if (wallets.bsv && token.contracts.bsv) {
    const balance = await fetchBsvBalance(wallets.bsv, token.contracts.bsv);
    if (balance > 0) {
      holdings.push({
        chain: 'bsv',
        address: wallets.bsv,
        balance,
        tokenContract: token.contracts.bsv,
        lastUpdated: new Date()
      });
      totalBalance += balance;
    }
  }

  // Fetch ETH balance
  if (wallets.eth && token.contracts.eth) {
    const balance = await fetchEthBalance(wallets.eth, token.contracts.eth);
    if (balance > 0) {
      holdings.push({
        chain: 'eth',
        address: wallets.eth,
        balance,
        tokenContract: token.contracts.eth,
        lastUpdated: new Date()
      });
      totalBalance += balance;
    }
  }

  // Fetch SOL balance
  if (wallets.sol && token.contracts.sol) {
    const balance = await fetchSolBalance(wallets.sol, token.contracts.sol);
    if (balance > 0) {
      holdings.push({
        chain: 'sol',
        address: wallets.sol,
        balance,
        tokenContract: token.contracts.sol,
        lastUpdated: new Date()
      });
      totalBalance += balance;
    }
  }

  const percentage = token.totalSupply > 0
    ? Number((totalBalance * BigInt(10000)) / token.totalSupply) / 100
    : 0;

  return {
    tokenSymbol: token.symbol,
    totalBalance,
    holdings,
    percentage
  };
}

/**
 * Fetch complete portfolio for a user
 */
export async function fetchUserPortfolio(
  wallets: { bsv?: string; eth?: string; sol?: string }
): Promise<UserPortfolio> {
  const holdings: AggregatedHolding[] = [];

  // Fetch all known multi-chain tokens
  for (const token of MULTICHAIN_TOKENS) {
    const holding = await fetchTokenHoldings(token, wallets);
    if (holding.totalBalance > 0) {
      holdings.push(holding);
    }
  }

  return {
    wallets,
    holdings,
    lastUpdated: new Date()
  };
}

/**
 * Get voting power across all chains
 */
export function calculateVotingPower(holdings: AggregatedHolding[]): bigint {
  return holdings.reduce((sum, h) => sum + h.totalBalance, BigInt(0));
}

/**
 * Format balance for display
 */
export function formatBalance(balance: bigint, decimals: number = 0): string {
  const value = Number(balance) / Math.pow(10, decimals);

  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;

  return value.toLocaleString();
}

/**
 * Chain display info
 */
export const CHAIN_INFO: Record<Chain, { name: string; color: string; icon: string }> = {
  bsv: { name: 'Bitcoin SV', color: '#EAB300', icon: 'BSV' },
  eth: { name: 'Ethereum', color: '#627EEA', icon: 'ETH' },
  sol: { name: 'Solana', color: '#9945FF', icon: 'SOL' }
};
