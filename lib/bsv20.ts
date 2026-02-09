// BSV-20 On-Chain Token Integration
// Queries the GorillaPool/1SatOrdinals indexer for real token state

import { TOKEN_CONFIG } from './types';

const ORDINALS_API = 'https://ordinals.gorillapool.io/api';

export interface OnChainHolder {
  address: string;
  balance: number;
}

export interface OnChainTokenState {
  id: string;
  symbol: string;
  totalSupply: number;
  decimals: number;
  holders: OnChainHolder[];
  totalHolders: number;
  fundAddress: string;
  height: number;
}

// Fetch token metadata from chain
export async function getTokenInfo(): Promise<OnChainTokenState | null> {
  try {
    const response = await fetch(
      `${ORDINALS_API}/bsv20/id/${TOKEN_CONFIG.inscriptionId}`
    );

    if (!response.ok) {
      console.error('Failed to fetch token info:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      id: TOKEN_CONFIG.inscriptionId,
      symbol: data.tick || data.sym || TOKEN_CONFIG.symbol,
      totalSupply: parseInt(data.max || data.amt || '0'),
      decimals: parseInt(data.dec || '0'),
      holders: [],
      totalHolders: data.accounts || 0,
      fundAddress: data.fundAddress || '',
      height: data.height || 0,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

// Fetch all holders and balances from chain
export async function getOnChainHolders(): Promise<OnChainHolder[]> {
  try {
    const response = await fetch(
      `${ORDINALS_API}/bsv20/id/${TOKEN_CONFIG.inscriptionId}/holders`
    );

    if (!response.ok) {
      console.error('Failed to fetch holders:', response.status);
      return [];
    }

    const data = await response.json();

    // API returns array of { address, balance } or similar structure
    if (Array.isArray(data)) {
      return data.map((h: { address?: string; pkHash?: string; balance?: number; amt?: string }) => ({
        address: h.address || h.pkHash || '',
        balance: parseInt(String(h.balance || h.amt || '0')),
      }));
    }

    // Single holder response
    if (data.address || data.pkHash) {
      return [{
        address: data.address || data.pkHash,
        balance: parseInt(String(data.balance || data.amt || '0')),
      }];
    }

    return [];
  } catch (error) {
    console.error('Error fetching holders:', error);
    return [];
  }
}

// Get balance for a specific address
export async function getOnChainBalance(address: string): Promise<number> {
  const holders = await getOnChainHolders();
  const holder = holders.find(h => h.address === address);
  return holder?.balance || 0;
}

// Calculate treasury balance (total supply minus all holder balances except treasury)
export async function getOnChainTreasuryBalance(treasuryAddress: string): Promise<{
  treasuryBalance: number;
  totalCirculating: number;
  holders: OnChainHolder[];
}> {
  const holders = await getOnChainHolders();

  const treasuryHolder = holders.find(h => h.address === treasuryAddress);
  const otherHolders = holders.filter(h => h.address !== treasuryAddress);

  const totalCirculating = otherHolders.reduce((sum, h) => sum + h.balance, 0);
  const treasuryBalance = treasuryHolder?.balance || (TOKEN_CONFIG.totalSupply - totalCirculating);

  return {
    treasuryBalance,
    totalCirculating,
    holders: otherHolders,
  };
}

// Get full on-chain token state
export async function getOnChainState(): Promise<{
  token: OnChainTokenState | null;
  holders: OnChainHolder[];
  treasuryAddress: string;
  treasuryBalance: number;
  circulatingSupply: number;
}> {
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || '1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1';

  const [token, holders] = await Promise.all([
    getTokenInfo(),
    getOnChainHolders(),
  ]);

  const treasuryHolder = holders.find(h => h.address === TREASURY_ADDRESS);
  const circulatingHolders = holders.filter(h => h.address !== TREASURY_ADDRESS);
  const circulatingSupply = circulatingHolders.reduce((sum, h) => sum + h.balance, 0);
  const treasuryBalance = treasuryHolder?.balance || (TOKEN_CONFIG.totalSupply - circulatingSupply);

  return {
    token,
    holders: circulatingHolders,
    treasuryAddress: TREASURY_ADDRESS,
    treasuryBalance,
    circulatingSupply,
  };
}

// Compare on-chain state with database state
export async function compareWithDatabase(dbHolders: Array<{ address: string; balance: number }>): Promise<{
  inSync: boolean;
  discrepancies: Array<{
    address: string;
    onChain: number;
    database: number;
    difference: number;
  }>;
}> {
  const onChainHolders = await getOnChainHolders();
  const discrepancies: Array<{
    address: string;
    onChain: number;
    database: number;
    difference: number;
  }> = [];

  // Check each database holder against on-chain
  for (const dbHolder of dbHolders) {
    const onChainHolder = onChainHolders.find(h => h.address === dbHolder.address);
    const onChainBalance = onChainHolder?.balance || 0;

    if (onChainBalance !== dbHolder.balance) {
      discrepancies.push({
        address: dbHolder.address,
        onChain: onChainBalance,
        database: dbHolder.balance,
        difference: dbHolder.balance - onChainBalance,
      });
    }
  }

  // Check for on-chain holders not in database
  for (const onChainHolder of onChainHolders) {
    const dbHolder = dbHolders.find(h => h.address === onChainHolder.address);
    if (!dbHolder && onChainHolder.balance > 0) {
      discrepancies.push({
        address: onChainHolder.address,
        onChain: onChainHolder.balance,
        database: 0,
        difference: -onChainHolder.balance,
      });
    }
  }

  return {
    inSync: discrepancies.length === 0,
    discrepancies,
  };
}
