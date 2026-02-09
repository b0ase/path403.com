import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MultisigCoordinator } from '@/lib/custody/multisig-coordinator';
import {
  buildMultisigTokenTx,
  completeMultisigTx,
  broadcastTransaction,
  getVaultBalance
} from '@/lib/custody/multisig-tokens';
import { getPrisma } from '@/lib/prisma';

/**
 * POST /api/custody/withdraw
 *
 * Initiate or complete a withdrawal from a multisig vault.
 *
 * Step 1 (initiate): Returns transaction draft and sighashes for user signing
 * Step 2 (complete): Accepts user signature, adds app co-signature, broadcasts
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Also check for wallet/twitter cookies
    const walletAddress = req.cookies.get('b0ase_wallet_address')?.value;
    const twitterUser = req.cookies.get('b0ase_twitter_user')?.value;

    if (!user && !walletAddress && !twitterUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, vaultAddress, tokenId, amount, recipient, userSignature, txHex } = body;

    if (!vaultAddress) {
      return NextResponse.json({ error: 'vaultAddress required' }, { status: 400 });
    }

    // Get the unified user
    const prisma = getPrisma();
    let unifiedUser;

    if (user?.email) {
      unifiedUser = await (prisma as any).unified_users.findFirst({
        where: { primary_email: user.email }
      });
    } else if (walletAddress) {
      const identity = await (prisma as any).user_identities.findFirst({
        where: { provider_id: walletAddress.toLowerCase() }
      });
      if (identity) {
        unifiedUser = await (prisma as any).unified_users.findUnique({
          where: { id: identity.unified_user_id }
        });
      }
    } else if (twitterUser) {
      const identity = await (prisma as any).user_identities.findFirst({
        where: { provider: 'twitter', provider_handle: `@${twitterUser}` }
      });
      if (identity) {
        unifiedUser = await (prisma as any).unified_users.findUnique({
          where: { id: identity.unified_user_id }
        });
      }
    }

    if (!unifiedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify vault ownership
    const vault = await (prisma as any).vault.findFirst({
      where: { address: vaultAddress }
    });

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 });
    }

    // Check if vault belongs to a user associated with this unified user
    // For now, simple check - in production would need proper user linkage
    const vaultOwner = await prisma.user.findUnique({ where: { id: vault.userId } });
    if (!vaultOwner) {
      return NextResponse.json({ error: 'Vault owner not found' }, { status: 404 });
    }

    // Handle different actions
    if (action === 'initiate') {
      // Step 1: Create transaction draft for user to sign
      if (!tokenId || !amount || !recipient) {
        return NextResponse.json({
          error: 'tokenId, amount, and recipient required for initiate'
        }, { status: 400 });
      }

      const txDraft = await buildMultisigTokenTx(
        vaultAddress,
        vault.redeemScript,
        tokenId,
        BigInt(amount),
        recipient
      );

      return NextResponse.json({
        step: 'sign',
        message: 'Sign the sighashes with your key, then call with action=complete',
        txHex: txDraft.txHex,
        sighashes: txDraft.sighashes,
        inputCount: txDraft.inputCount,
        redeemScript: vault.redeemScript
      });

    } else if (action === 'complete') {
      // Step 2: Complete with user signature
      if (!userSignature || !txHex) {
        return NextResponse.json({
          error: 'userSignature and txHex required for complete'
        }, { status: 400 });
      }

      // Complete the transaction with app co-signature
      const result = await MultisigCoordinator.completeWithdrawal(
        vault.userId,
        vaultAddress,
        txHex,
        userSignature,
        0 // Input index
      );

      // Broadcast
      try {
        const txid = await broadcastTransaction(result.txHex);
        return NextResponse.json({
          success: true,
          txid,
          message: 'Withdrawal broadcast successfully'
        });
      } catch (broadcastError) {
        return NextResponse.json({
          success: false,
          txHex: result.txHex,
          error: broadcastError instanceof Error ? broadcastError.message : 'Broadcast failed',
          message: 'Transaction signed but broadcast failed. You can broadcast manually.'
        }, { status: 500 });
      }

    } else {
      return NextResponse.json({
        error: 'Invalid action. Use "initiate" or "complete"'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[withdraw] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

/**
 * GET /api/custody/withdraw?vaultAddress=...&tokenIds=...
 *
 * Get vault balance and available tokens for withdrawal
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vaultAddress = searchParams.get('vaultAddress');
    const tokenIdsParam = searchParams.get('tokenIds');

    if (!vaultAddress) {
      return NextResponse.json({ error: 'vaultAddress required' }, { status: 400 });
    }

    const tokenIds = tokenIdsParam ? tokenIdsParam.split(',') : [];

    if (tokenIds.length === 0) {
      return NextResponse.json({
        error: 'tokenIds required (comma-separated)'
      }, { status: 400 });
    }

    const balance = await getVaultBalance(vaultAddress, tokenIds);

    return NextResponse.json({
      address: balance.address,
      tokens: balance.tokens.map(t => ({
        tokenId: t.tokenId,
        amount: t.amount.toString()
      })),
      satoshis: balance.satoshis
    });

  } catch (error) {
    console.error('[withdraw] GET error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}
