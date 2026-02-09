/**
 * Unified Token Holdings Service
 *
 * Checks user token holdings across all b0ase token systems:
 * - Cap table shareholders ($BOASE equity)
 * - Tokenized repositories (repo tokens)
 * - Issued tokens (project tokens)
 * - On-chain BSV21 balances (GorillaPool API)
 *
 * Used by boardroom for token-gated access and shareholder meeting rooms.
 */

import { getPrisma } from '@/lib/prisma';
import { MULTICHAIN_TOKENS } from '@/lib/multichain';

export type TokenType = 'equity' | 'repo' | 'project' | 'onchain';
export type Blockchain = 'BSV' | 'ETH' | 'SOL';

export interface TokenHolding {
  symbol: string;
  type: TokenType;
  balance: number;
  blockchain?: Blockchain;
  // For equity tokens
  ownershipPercentage?: number;
  // For repo tokens
  repoFullName?: string;
  // Metadata
  name?: string;
  verified: boolean;
}

export interface TokenGateConfig {
  symbol: string;
  type: TokenType;
  minBalance?: number;
  minOwnershipPercent?: number; // For equity tokens
  blockchain?: Blockchain;
}

export interface TokenGateResult {
  hasAccess: boolean;
  holdings: TokenHolding[];
  missingRequirements: string[];
}

/**
 * Get all token holdings for a wallet address
 */
export async function getTokenHoldings(walletAddress: string): Promise<TokenHolding[]> {
  const holdings: TokenHolding[] = [];

  // Normalize wallet address
  const normalizedWallet = walletAddress.toLowerCase();

  // 1. Check cap table shareholders ($BOASE equity)
  const equityHoldings = await getEquityHoldings(normalizedWallet);
  holdings.push(...equityHoldings);

  // 2. Check tokenized repositories (repo tokens owned by user)
  const repoHoldings = await getRepoTokenHoldings(normalizedWallet);
  holdings.push(...repoHoldings);

  // 3. Check issued/project tokens
  const projectHoldings = await getProjectTokenHoldings(normalizedWallet);
  holdings.push(...projectHoldings);

  // 4. On-chain BSV21 balance verification
  const onchainHoldings = await getOnchainBsvHoldings(walletAddress);

  // Merge on-chain holdings, avoiding duplicates from database
  for (const onchain of onchainHoldings) {
    const existingIndex = holdings.findIndex(
      h => h.symbol.toUpperCase() === onchain.symbol.toUpperCase()
    );
    if (existingIndex === -1) {
      // New token not in database
      holdings.push(onchain);
    } else {
      // Token exists - use higher balance (on-chain may be more current)
      if (onchain.balance > holdings[existingIndex].balance) {
        holdings[existingIndex].balance = onchain.balance;
        holdings[existingIndex].verified = true;
      }
    }
  }

  return holdings;
}

/**
 * Check equity holdings from cap_table_shareholders
 */
async function getEquityHoldings(walletAddress: string): Promise<TokenHolding[]> {
  const prisma = getPrisma();

  // Prisma needs OR logic for case-insensitive/variant checking
  const shareholders = await prisma.cap_table_shareholders.findMany({
    where: {
      status: 'active',
      wallet_address: { equals: walletAddress, mode: 'insensitive' }
    },
    select: {
      token_balance: true,
      ownership_percentage: true,
      full_name: true,
      status: true
    }
  });

  if (!shareholders || !shareholders.length) {
    return [];
  }

  return shareholders.map(s => ({
    symbol: 'BOASE',
    type: 'equity' as TokenType,
    balance: Number(s.token_balance) || 0,
    ownershipPercentage: Number(s.ownership_percentage) || 0,
    blockchain: 'BSV' as Blockchain,
    name: '$BOASE Equity Token',
    verified: true, // Cap table is authoritative
  }));
}

/**
 * Check repo token holdings from tokenized_repositories
 * User owns repo tokens if they're the unified_user who tokenized it
 */
async function getRepoTokenHoldings(walletAddress: string): Promise<TokenHolding[]> {
  const prisma = getPrisma();

  try {
    // First find the unified user by wallet address
    // using raw prisma access for dynamic models if needed, or typed if models exist
    // Checking previous file content suggests models exist on `prisma` but were cast to `any`
    // I will try strictly typed first, fallback to any if TS complains (since I can't check types)
    // Actually, safe access via `as any` is better here since I haven't fully verified schema types
    const p = prisma as any;

    const vault = await p.vault?.findFirst({
      where: {
        address: { contains: walletAddress, mode: 'insensitive' },
      },
      select: { userId: true },
    });

    if (!vault?.userId) {
      // Also check if wallet is linked directly to a user identity
      const identity = await p.user_identities?.findFirst({
        where: {
          provider_user_id: { contains: walletAddress, mode: 'insensitive' },
        },
        select: { unified_user_id: true },
      });

      if (!identity?.unified_user_id) {
        return [];
      }
    }

    const userId = vault?.userId;

    // Get tokenized repos owned by this user
    const repos = await p.tokenized_repositories?.findMany({
      where: {
        unified_user_id: userId,
        token_status: 'minted',
      },
      select: {
        token_symbol: true,
        token_name: true,
        token_supply: true,
        github_full_name: true,
        verification_level: true,
      },
    });

    if (!repos?.length) {
      return [];
    }

    return repos.map((r: any) => ({
      symbol: r.token_symbol,
      type: 'repo' as TokenType,
      balance: parseFloat(r.token_supply) || 0,
      blockchain: 'BSV' as Blockchain,
      name: r.token_name,
      repoFullName: r.github_full_name,
      verified: r.verification_level === 'verified_owner',
    }));
  } catch (error) {
    console.error('[token-holdings] Error fetching repo holdings:', error);
    return [];
  }
}

/**
 * Check project token holdings from issued_tokens
 */
async function getProjectTokenHoldings(walletAddress: string): Promise<TokenHolding[]> {
  const prisma = getPrisma();

  // Check if user has any issued token balances
  try {
    // issued_tokens model might be missing from Prisma schema, use raw query to be safe
    // Note: We need to cast the result to the expected shape
    const tokens = await prisma.$queryRaw<any[]>`
      SELECT symbol, name, blockchain, total_supply 
      FROM issued_tokens 
      WHERE creator_wallet ILIKE ${walletAddress}
    `;

    if (!tokens?.length) {
      return [];
    }

    return tokens.map((t: any) => ({
      symbol: t.symbol,
      type: 'project' as TokenType,
      balance: parseFloat(t.total_supply) || 0, // Creator owns full supply initially
      blockchain: t.blockchain as Blockchain,
      name: t.name,
      verified: true,
    }));
  } catch (e) {
    console.error('[token-holdings] Error fetching issued tokens:', e);
    // Table might not exist or connection error
    return [];
  }
}

// Cache for on-chain balances (5 minute TTL)
const onchainCache = new Map<string, { holdings: TokenHolding[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Check on-chain BSV21 token holdings via GorillaPool API
 * This checks for tokens the wallet actually holds on the BSV blockchain
 */
async function getOnchainBsvHoldings(walletAddress: string): Promise<TokenHolding[]> {
  // Check cache first
  const cached = onchainCache.get(walletAddress);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.holdings;
  }

  const holdings: TokenHolding[] = [];

  try {
    // Check all known BSV tokens from MULTICHAIN_TOKENS
    const bsvTokens = MULTICHAIN_TOKENS.filter(t => t.contracts.bsv);

    for (const token of bsvTokens) {
      const bsvContractId = token.contracts.bsv!; // Filtered above
      const balance = await fetchBsv21Balance(walletAddress, bsvContractId);
      if (balance > 0) {
        holdings.push({
          symbol: token.symbol,
          type: 'onchain' as TokenType,
          balance,
          blockchain: 'BSV' as Blockchain,
          name: token.name,
          verified: true,
        });
      }
    }

    // Also check for any BSV-20 tokens the wallet might hold
    // by querying the general unspent endpoint
    const additionalTokens = await fetchAllBsv20Tokens(walletAddress);
    for (const token of additionalTokens) {
      // Only add if not already in the list
      if (!holdings.find(h => h.symbol.toUpperCase() === token.symbol.toUpperCase())) {
        holdings.push(token);
      }
    }

    // Cache the results
    onchainCache.set(walletAddress, { holdings, timestamp: Date.now() });

  } catch (error) {
    console.error('[token-holdings] Error fetching on-chain BSV holdings:', error);
  }

  return holdings;
}

/**
 * Fetch BSV21 token balance from GorillaPool
 */
async function fetchBsv21Balance(address: string, tokenId: string): Promise<number> {
  try {
    const response = await fetch(
      `https://ordinals.gorillapool.io/api/bsv20/${address}/unspent?id=${tokenId}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      if (response.status === 404) return 0;
      throw new Error(`GorillaPool API error: ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) return 0;

    // Sum all UTXO amounts
    return data.reduce(
      (sum: number, utxo: { amt?: string }) => sum + parseFloat(utxo.amt || '0'),
      0
    );
  } catch (error) {
    console.error('[token-holdings] BSV21 balance fetch error:', error);
    return 0;
  }
}

/**
 * Fetch all BSV-20 tokens held by an address
 * This discovers tokens not in our known list
 */
async function fetchAllBsv20Tokens(address: string): Promise<TokenHolding[]> {
  const holdings: TokenHolding[] = [];

  try {
    // Query for all BSV-20 tokens the address holds
    const response = await fetch(
      `https://ordinals.gorillapool.io/api/bsv20/${address}/balance`,
      { next: { revalidate: 300 } }
    );

    if (!response.ok) {
      if (response.status === 404) return [];
      return [];
    }

    const data = await response.json();

    // data is an array of { tick: string, all: { confirmed: string, pending: string }, listed: {...} }
    if (Array.isArray(data)) {
      for (const item of data) {
        const balance = parseFloat(item.all?.confirmed || '0');
        if (balance > 0 && item.tick) {
          holdings.push({
            symbol: item.tick.toUpperCase(),
            type: 'onchain' as TokenType,
            balance,
            blockchain: 'BSV' as Blockchain,
            name: item.tick,
            verified: true,
          });
        }
      }
    }
  } catch (error) {
    // Don't fail silently - this is optional discovery
    console.log('[token-holdings] Could not fetch all BSV-20 tokens:', error);
  }

  return holdings;
}

/**
 * Clear the on-chain holdings cache (for testing or force refresh)
 */
export function clearOnchainCache(): void {
  onchainCache.clear();
}

/**
 * Check if a wallet meets token gate requirements
 */
export async function checkTokenGate(
  walletAddress: string,
  requirements: TokenGateConfig[]
): Promise<TokenGateResult> {
  const holdings = await getTokenHoldings(walletAddress);
  const missingRequirements: string[] = [];

  // Check each requirement
  for (const req of requirements) {
    const holding = holdings.find(h =>
      h.symbol.toUpperCase() === req.symbol.toUpperCase() &&
      (req.type ? h.type === req.type : true) &&
      (req.blockchain ? h.blockchain === req.blockchain : true)
    );

    if (!holding) {
      missingRequirements.push(`Must hold ${req.symbol}`);
      continue;
    }

    // Check minimum balance
    if (req.minBalance && holding.balance < req.minBalance) {
      missingRequirements.push(
        `Need at least ${req.minBalance} ${req.symbol} (have ${holding.balance})`
      );
      continue;
    }

    // Check minimum ownership percentage (for equity)
    if (req.minOwnershipPercent && holding.type === 'equity') {
      const ownershipPct = holding.ownershipPercentage || 0;
      if (ownershipPct < req.minOwnershipPercent) {
        missingRequirements.push(
          `Need at least ${req.minOwnershipPercent}% ownership (have ${ownershipPct}%)`
        );
      }
    }
  }

  return {
    hasAccess: missingRequirements.length === 0,
    holdings,
    missingRequirements,
  };
}

/**
 * Get token symbols a wallet holds (simplified for room filtering)
 */
export async function getHeldTokenSymbols(walletAddress: string): Promise<string[]> {
  const holdings = await getTokenHoldings(walletAddress);
  return holdings
    .filter(h => h.balance > 0)
    .map(h => h.symbol.toUpperCase());
}

/**
 * Create default boardroom for $BOASE shareholders
 */
export async function ensureBoaseShareholderRoom(): Promise<void> {
  const prisma = getPrisma() as any; // Using any for dynamic access

  try {
    // Check if room exists
    const existing = await prisma.chat_rooms?.findUnique({
      where: { id: 'boase-shareholders' }
    });

    if (!existing) {
      await prisma.chat_rooms?.create({
        data: {
          id: 'boase-shareholders',
          name: '$BOASE Shareholders',
          description: 'Exclusive chat for verified $BOASE token holders. Discuss governance, dividends, and company direction.',
          required_tokens: ['BOASE'],
          is_active: true,
          token_type: 'equity',
          min_balance: 0,
          created_by_wallet: 'system',
        }
      });
    }
  } catch (error) {
    console.error('[token-holdings] Failed to create BOASE shareholders room:', error);
  }
}

/**
 * Create shareholder meeting rooms for all tokens a wallet holds
 * This auto-generates persistent chat rooms (shareholder meetings) for each token
 */
export async function createShareholderMeetingRooms(walletAddress: string): Promise<string[]> {
  const prisma = getPrisma() as any;
  const holdings = await getTokenHoldings(walletAddress);
  const createdRooms: string[] = [];

  for (const holding of holdings) {
    if (holding.balance <= 0) continue;

    const roomId = `${holding.symbol.toLowerCase()}-shareholders`;
    const roomName = `$${holding.symbol} Shareholders`;

    // Determine room description based on token type
    let description = '';
    switch (holding.type) {
      case 'equity':
        description = `Shareholder meeting room for $${holding.symbol} equity holders. Discuss governance, dividends, and company direction.`;
        break;
      case 'repo':
        description = `Token holder meeting for ${holding.repoFullName || holding.symbol}. Discuss development roadmap and contributor rewards.`;
        break;
      case 'project':
        description = `Project token holder meeting for $${holding.symbol}. Coordinate with other holders.`;
        break;
      case 'onchain':
        description = `On-chain token holder meeting for $${holding.symbol}. Chat with other verified token holders.`;
        break;
    }

    try {
      const existing = await prisma.chat_rooms?.findUnique({
        where: { id: roomId }
      });

      if (!existing) {
        await prisma.chat_rooms?.create({
          data: {
            id: roomId,
            name: roomName,
            description,
            required_tokens: [holding.symbol.toUpperCase()],
            is_active: true,
            token_type: holding.type,
            min_balance: 0,
            created_by_wallet: 'system',
          }
        });
        createdRooms.push(roomId);
      }
    } catch (error) {
      console.error(`[token-holdings] Failed to create room for ${holding.symbol}:`, error);
    }
  }

  return createdRooms;
}

/**
 * Get all shareholder meeting rooms a wallet has access to
 * Returns rooms the user can access based on their token holdings
 */
export async function getAccessibleMeetingRooms(walletAddress: string): Promise<{
  rooms: Array<{
    id: string;
    name: string;
    description: string;
    tokenSymbol: string;
    userBalance: number;
  }>;
  holdings: TokenHolding[];
}> {
  const prisma = getPrisma() as any;
  const holdings = await getTokenHoldings(walletAddress);
  const heldSymbols = holdings.filter(h => h.balance > 0).map(h => h.symbol.toUpperCase());

  try {
    // Get all active chat rooms
    const allRooms = await prisma.chat_rooms?.findMany({
      where: { is_active: true }
    });

    if (!allRooms) {
      return { rooms: [], holdings };
    }

    // Filter to rooms the user has access to
    const accessibleRooms = allRooms
      .filter((room: any) => {
        // General room is always accessible
        if (room.id === 'general') return true;

        // Check if user holds any required token
        const requiredTokens = room.required_tokens || [];
        return requiredTokens.some((token: string) => heldSymbols.includes(token.toUpperCase()));
      })
      .map((room: any) => {
        // Find the user's balance for this room's token
        const requiredTokens = room.required_tokens || [];
        const matchingHolding = holdings.find(h =>
          requiredTokens.some((t: string) => t.toUpperCase() === h.symbol.toUpperCase())
        );

        return {
          id: room.id,
          name: room.name,
          description: room.description,
          tokenSymbol: requiredTokens[0] || 'GENERAL',
          userBalance: matchingHolding?.balance || 0,
        };
      });

    return { rooms: accessibleRooms, holdings };
  } catch (e) {
    console.error('Error fetching accessible rooms:', e);
    return { rooms: [], holdings };
  }
}
