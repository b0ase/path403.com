import { NextRequest, NextResponse } from 'next/server';
import {
  deriveWalletFromSignature,
  SIGN_MESSAGES,
} from '@/lib/address-derivation';
import { supabase, isDbConnected } from '@/lib/supabase';

// POST /api/account/derive
// Derives a user's on-chain address from their HandCash signature
// Returns the WIF private key on first derivation (user should save it!)
export async function POST(request: NextRequest) {
  try {
    const handle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!handle || provider !== 'handcash') {
      return NextResponse.json(
        { error: 'HandCash connection required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { signature } = body;

    if (!signature) {
      const ts = new Date().toISOString();
      return NextResponse.json(
        {
          error: 'Signature required',
          message: SIGN_MESSAGES.derive(handle, ts),
          timestamp: ts,
        },
        { status: 400 }
      );
    }

    // Derive full wallet from signature (includes WIF)
    const wallet = deriveWalletFromSignature(signature, handle);

    // Check if this wallet already exists
    let isNewWallet = true;
    let holderId: string | null = null;

    if (isDbConnected() && supabase) {
      // Check if user already has a derived wallet (case-insensitive)
      const { data: existingWallet } = await supabase
        .from('user_wallets')
        .select('id, address')
        .ilike('handle', handle)
        .single();

      if (existingWallet) {
        isNewWallet = false;

        // Verify the signature produces the same address
        if (existingWallet.address !== wallet.address) {
          return NextResponse.json(
            {
              error: 'Signature mismatch',
              details: 'This signature produces a different address than your existing wallet. Make sure you sign the exact message.',
              expectedAddress: existingWallet.address,
              derivedAddress: wallet.address,
            },
            { status: 400 }
          );
        }
      }

      // Get or create holder record
      const { data: holder } = await supabase
        .from('path402_holders')
        .select('id')
        .eq('handle', handle)
        .single();

      if (holder) {
        holderId = holder.id;

        // Update holder with ordinals address
        await supabase
          .from('path402_holders')
          .update({
            ordinals_address: wallet.address,
            updated_at: new Date().toISOString(),
          })
          .eq('id', holder.id);
      }

      // Store wallet if new
      if (isNewWallet) {
        await supabase.from('user_wallets').insert({
          handle,
          address: wallet.address,
          public_key: wallet.publicKey,
          encrypted_wif: wallet.encryptedWif,
          encryption_salt: wallet.encryptionSalt,
          holder_id: holderId,
        });
      } else {
        // Update last accessed
        await supabase
          .from('user_wallets')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('handle', handle);
      }
    }

    // Build response
    const response: Record<string, unknown> = {
      success: true,
      address: wallet.address,
      publicKey: wallet.publicKey,
      handle,
      isNewWallet,
      tier: 1, // Tier 1 = no KYC, basic holder
      capabilities: {
        receive: true,
        hold: true,
        transfer: true,
        stake: false, // Requires KYC
        dividends: false, // Requires staking
        voting: false, // Requires staking
      },
    };

    // Only return WIF on first derivation!
    // User MUST save this - we cannot decrypt it without their signature
    if (isNewWallet) {
      response.wif = wallet.wif;
      response.warning = 'SAVE YOUR PRIVATE KEY! This is the only time it will be shown. You can recover it later by signing the same message.';
      response.message = 'New wallet created. Your private key (WIF) is shown above. Save it securely!';
    } else {
      response.message = 'Wallet verified. Your address has been confirmed.';
      response.recoveryNote = 'Need your private key? Use the Export function which will ask you to sign a message.';
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deriving address:', error);
    return NextResponse.json(
      { error: 'Failed to derive address', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET /api/account/derive
// Returns the message to sign for address derivation
export async function GET(request: NextRequest) {
  const handle = request.headers.get('x-wallet-handle');

  if (!handle) {
    return NextResponse.json(
      { error: 'Handle required' },
      { status: 400 }
    );
  }

  const timestamp = new Date().toISOString();
  const message = SIGN_MESSAGES.derive(handle, timestamp);

  // Check if user already has a wallet (case-insensitive)
  let hasExistingWallet = false;
  let existingAddress: string | null = null;

  if (isDbConnected() && supabase) {
    const { data: existing } = await supabase
      .from('user_wallets')
      .select('address')
      .ilike('handle', handle)
      .single();

    if (existing) {
      hasExistingWallet = true;
      existingAddress = existing.address;
    }
  }

  return NextResponse.json({
    message,
    timestamp,
    hasExistingWallet,
    existingAddress,
    instructions: hasExistingWallet
      ? [
          '1. Sign this message to verify ownership of your wallet',
          '2. Your existing address will be confirmed',
          '3. Use Export Private Key if you need your WIF',
        ]
      : [
          '1. Sign this message with your HandCash wallet',
          '2. A unique BSV address will be derived from your signature',
          '3. IMPORTANT: Save the private key (WIF) shown after signing!',
          '4. You control this address - PATH402 never has your unencrypted keys',
        ],
  });
}
