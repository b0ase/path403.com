import { NextRequest, NextResponse } from 'next/server';
import {
  fetchUserPortfolio,
  fetchTokenHoldings,
  MULTICHAIN_TOKENS,
  calculateVotingPower,
  formatBalance
} from '@/lib/multichain';

/**
 * GET /api/portfolio
 *
 * Fetch aggregated token holdings across all chains
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Get wallet addresses from query params or cookies
    const bsvWallet = searchParams.get('bsv') || req.cookies.get('b0ase_wallet_address')?.value;
    const ethWallet = searchParams.get('eth');
    const solWallet = searchParams.get('sol');

    // Get wallet provider from cookie to determine which chain
    const walletProvider = req.cookies.get('b0ase_wallet_provider')?.value;

    // Build wallets object based on what's available
    const wallets: { bsv?: string; eth?: string; sol?: string } = {};

    if (bsvWallet && (walletProvider === 'yours' || searchParams.has('bsv'))) {
      wallets.bsv = bsvWallet;
    }
    if (ethWallet || walletProvider === 'metamask') {
      wallets.eth = ethWallet || bsvWallet; // MetaMask stores address in same cookie
    }
    if (solWallet || walletProvider === 'phantom') {
      wallets.sol = solWallet || bsvWallet; // Phantom stores address in same cookie
    }

    if (!wallets.bsv && !wallets.eth && !wallets.sol) {
      return NextResponse.json({
        error: 'No wallet addresses provided',
        wallets: {},
        holdings: [],
        votingPower: '0'
      });
    }

    // Fetch portfolio
    const portfolio = await fetchUserPortfolio(wallets);

    // Calculate total voting power
    const votingPower = calculateVotingPower(portfolio.holdings);

    return NextResponse.json({
      wallets: portfolio.wallets,
      holdings: portfolio.holdings.map(h => ({
        tokenSymbol: h.tokenSymbol,
        totalBalance: h.totalBalance.toString(),
        formattedBalance: formatBalance(h.totalBalance),
        percentage: h.percentage,
        chains: h.holdings.map(ch => ({
          chain: ch.chain,
          address: ch.address,
          balance: ch.balance.toString(),
          formattedBalance: formatBalance(ch.balance),
          tokenContract: ch.tokenContract
        }))
      })),
      votingPower: votingPower.toString(),
      formattedVotingPower: formatBalance(votingPower),
      lastUpdated: portfolio.lastUpdated.toISOString()
    });

  } catch (error) {
    console.error('[portfolio] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch portfolio'
    }, { status: 500 });
  }
}

/**
 * POST /api/portfolio
 *
 * Register wallet addresses for a user
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bsv, eth, sol, userId } = body;

    // For now, just fetch the portfolio with provided addresses
    const wallets = { bsv, eth, sol };

    if (!bsv && !eth && !sol) {
      return NextResponse.json({ error: 'At least one wallet address required' }, { status: 400 });
    }

    const portfolio = await fetchUserPortfolio(wallets);
    const votingPower = calculateVotingPower(portfolio.holdings);

    return NextResponse.json({
      success: true,
      wallets,
      holdingsCount: portfolio.holdings.length,
      votingPower: votingPower.toString(),
      formattedVotingPower: formatBalance(votingPower)
    });

  } catch (error) {
    console.error('[portfolio] POST error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to register wallets'
    }, { status: 500 });
  }
}
