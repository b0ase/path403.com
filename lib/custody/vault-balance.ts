/**
 * Vault Balance Fetching
 *
 * Fetches BSV and token balances for vault addresses
 */

export interface VaultAsset {
  type: 'bsv' | 'token';
  symbol: string;
  name: string;
  balance: string;
  formattedBalance: string;
  tokenId?: string;
  usdValue?: number;
}

export interface VaultBalance {
  address: string;
  bsvBalance: number;
  formattedBsv: string;
  tokens: VaultAsset[];
  lastUpdated: Date;
}

/**
 * Fetch BSV balance for an address
 */
async function fetchBsvBalance(address: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.whatsonchain.com/v1/bsv/main/address/${address}/balance`
    );

    if (!response.ok) {
      return 0;
    }

    const data = await response.json();
    // Balance is in satoshis, convert to BSV
    return (data.confirmed + data.unconfirmed) / 100_000_000;
  } catch (error) {
    console.error('[vault-balance] BSV balance fetch error:', error);
    return 0;
  }
}

/**
 * Fetch token balances for an address
 */
async function fetchTokenBalances(address: string): Promise<VaultAsset[]> {
  try {
    // Fetch from GorillaPool
    const response = await fetch(
      `https://ordinals.gorillapool.io/api/bsv20/${address}/balance`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((token: any) => ({
      type: 'token' as const,
      symbol: token.tick || token.sym || 'UNKNOWN',
      name: token.tick || token.sym || 'Unknown Token',
      balance: token.all?.confirmed || '0',
      formattedBalance: formatTokenBalance(token.all?.confirmed || '0'),
      tokenId: token.id
    }));
  } catch (error) {
    console.error('[vault-balance] Token balance fetch error:', error);
    return [];
  }
}

/**
 * Format token balance for display
 */
function formatTokenBalance(balance: string): string {
  const value = parseFloat(balance);

  if (isNaN(value)) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`;

  return value.toLocaleString();
}

/**
 * Format BSV balance for display
 */
function formatBsvBalance(balance: number): string {
  if (balance >= 1000) return `${balance.toFixed(2)} BSV`;
  if (balance >= 1) return `${balance.toFixed(4)} BSV`;
  if (balance > 0) return `${(balance * 100_000_000).toFixed(0)} sats`;
  return '0 BSV';
}

/**
 * Fetch complete vault balance
 */
export async function fetchVaultBalance(address: string): Promise<VaultBalance> {
  const [bsvBalance, tokens] = await Promise.all([
    fetchBsvBalance(address),
    fetchTokenBalances(address)
  ]);

  return {
    address,
    bsvBalance,
    formattedBsv: formatBsvBalance(bsvBalance),
    tokens,
    lastUpdated: new Date()
  };
}

/**
 * Fetch transaction history for an address
 */
export interface VaultTransaction {
  txid: string;
  type: 'incoming' | 'outgoing';
  amount: string;
  symbol: string;
  timestamp: Date;
  confirmations: number;
}

export async function fetchVaultTransactions(address: string): Promise<VaultTransaction[]> {
  try {
    const response = await fetch(
      `https://api.whatsonchain.com/v1/bsv/main/address/${address}/history`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    // Get transaction details for each
    const transactions: VaultTransaction[] = [];

    for (const tx of data.slice(0, 20)) { // Limit to 20 most recent
      try {
        const txResponse = await fetch(
          `https://api.whatsonchain.com/v1/bsv/main/tx/${tx.tx_hash}`
        );

        if (!txResponse.ok) continue;

        const txData = await txResponse.json();

        // Determine if incoming or outgoing
        const isIncoming = txData.vout?.some((out: any) =>
          out.scriptPubKey?.addresses?.includes(address)
        );

        // Calculate amount (simplified)
        let amount = 0;
        if (isIncoming) {
          txData.vout?.forEach((out: any) => {
            if (out.scriptPubKey?.addresses?.includes(address)) {
              amount += out.value;
            }
          });
        }

        transactions.push({
          txid: tx.tx_hash,
          type: isIncoming ? 'incoming' : 'outgoing',
          amount: amount.toFixed(8),
          symbol: 'BSV',
          timestamp: txData.time ? new Date(txData.time * 1000) : new Date(),
          confirmations: txData.confirmations || 0
        });
      } catch (e) {
        // Skip failed transaction fetches
      }
    }

    return transactions;
  } catch (error) {
    console.error('[vault-balance] Transaction fetch error:', error);
    return [];
  }
}
