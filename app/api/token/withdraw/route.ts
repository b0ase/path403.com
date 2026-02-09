import { NextRequest, NextResponse } from 'next/server';
import { getHolder, updateHolderBalance } from '@/lib/store';
import { supabase, isDbConnected } from '@/lib/supabase';
import { verifySignatureOwnership, SIGN_MESSAGES } from '@/lib/address-derivation';
import { createTransferTransaction } from '@/lib/bsv20-transfer';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';

// Broadcast a transaction
async function broadcastTransaction(txHex: string): Promise<string> {
  const response = await fetch(`${WHATSONCHAIN_API}/tx/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txhex: txHex }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Broadcast failed: ${error}`);
  }

  const txId = await response.text();
  return txId.replace(/"/g, '');
}

// GET /api/token/withdraw - Get message to sign for withdrawal
export async function GET(request: NextRequest) {
  const handle = request.headers.get('x-wallet-handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle required' }, { status: 400 });
  }

  // Check if user has a wallet
  if (!isDbConnected() || !supabase) {
    return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
  }

  const { data: wallet } = await supabase
    .from('user_wallets')
    .select('address')
    .eq('handle', handle)
    .single();

  if (!wallet) {
    return NextResponse.json({
      error: 'No wallet found',
      details: 'You need to derive an ordinals address first.',
      deriveUrl: '/api/account/derive',
    }, { status: 404 });
  }

  // Get holder balance
  const holder = await getHolder(undefined, handle);
  const availableBalance = holder ? holder.balance - holder.stakedBalance : 0;

  return NextResponse.json({
    address: wallet.address,
    availableBalance,
    instructions: [
      '1. Specify amount and destination address',
      '2. Sign the withdrawal message with HandCash',
      '3. POST the signature to complete the withdrawal',
      '4. Tokens will be transferred on-chain to destination',
    ],
  });
}

// POST /api/token/withdraw - Execute withdrawal with signature
export async function POST(request: NextRequest) {
  try {
    const handle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!handle || provider !== 'handcash') {
      return NextResponse.json({ error: 'HandCash connection required' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, destination, signature, timestamp } = body;

    // Validate inputs
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!destination) {
      return NextResponse.json({ error: 'Destination address required' }, { status: 400 });
    }

    // Validate BSV address format (simple check)
    if (!destination.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      return NextResponse.json({ error: 'Invalid BSV address format' }, { status: 400 });
    }

    if (!signature) {
      const ts = timestamp || new Date().toISOString();
      return NextResponse.json({
        error: 'Signature required',
        message: SIGN_MESSAGES.withdraw(amount, destination, ts),
        timestamp: ts,
      }, { status: 400 });
    }

    // Get holder and check balance
    const holder = await getHolder(undefined, handle);
    if (!holder) {
      return NextResponse.json({ error: 'No tokens held' }, { status: 400 });
    }

    const availableBalance = holder.balance - holder.stakedBalance;
    if (amount > availableBalance) {
      return NextResponse.json({
        error: 'Insufficient available balance',
        details: 'Unstake tokens first if needed.',
        availableBalance,
        requestedAmount: amount,
      }, { status: 400 });
    }

    // Get user's wallet
    if (!isDbConnected() || !supabase) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
    }

    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('address, encrypted_wif, encryption_salt')
      .eq('handle', handle)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({
        error: 'Wallet not found',
        details: 'Derive your ordinals address first in Account settings.',
      }, { status: 404 });
    }

    // Verify signature ownership
    if (!verifySignatureOwnership(signature, handle, wallet.address)) {
      return NextResponse.json({
        error: 'Invalid signature',
        details: 'The signature does not match your wallet.',
      }, { status: 403 });
    }

    // Transfer from TREASURY to user's destination
    // The user's signature proves they own this database balance
    // The treasury key is used to send the on-chain tokens
    const treasuryWIF = process.env.TREASURY_PRIVATE_KEY;
    if (!treasuryWIF) {
      return NextResponse.json({
        error: 'Treasury not configured',
        details: 'Contact support - treasury private key is missing.',
      }, { status: 500 });
    }

    // Create and sign the transfer transaction from treasury
    let txHex: string;
    let txId: string;
    try {
      const result = await createTransferTransaction(amount, destination, treasuryWIF);
      txHex = result.txHex;
      txId = result.txId;
    } catch (txError) {
      console.error('Transaction creation failed:', txError);
      return NextResponse.json({
        error: 'Transaction creation failed',
        details: txError instanceof Error ? txError.message : 'Unknown error',
      }, { status: 500 });
    }

    // Broadcast the transaction
    let broadcastTxId: string;
    try {
      broadcastTxId = await broadcastTransaction(txHex);
    } catch (broadcastError) {
      console.error('Broadcast failed:', broadcastError);
      return NextResponse.json({
        error: 'Broadcast failed',
        details: broadcastError instanceof Error ? broadcastError.message : 'Unknown error',
        txId, // Return the txId even if broadcast failed, for debugging
      }, { status: 500 });
    }

    // Update database balance (subtract the withdrawn amount)
    await updateHolderBalance(holder.id, -amount);

    // Record the transfer in path402_transfers (source of truth for on-chain positions)
    await supabase.from('path402_transfers').insert({
      holder_id: holder.id,
      to_address: destination,
      amount,
      tx_id: broadcastTxId,
      status: 'confirmed',
    });

    console.log(`Recorded withdrawal transfer: ${amount} to ${destination} (tx: ${broadcastTxId})`);

    return NextResponse.json({
      success: true,
      txId: broadcastTxId,
      amount,
      destination,
      fromAddress: wallet.address,
      newBalance: holder.balance - amount,
      explorerUrl: `https://whatsonchain.com/tx/${broadcastTxId}`,
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json({
      error: 'Withdrawal failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
