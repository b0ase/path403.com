import { NextRequest, NextResponse } from 'next/server';
import { supabase, isDbConnected } from '@/lib/supabase';

/**
 * POST /api/account/store-wallet
 *
 * Stores a client-side derived wallet. The server NEVER sees the WIF.
 * Only receives: address, publicKey, encryptedWif, encryptionSalt
 */
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
    const { address, publicKey, encryptedWif, encryptionSalt } = body;

    // Validate required fields
    if (!address || !encryptedWif || !encryptionSalt) {
      return NextResponse.json(
        { error: 'Missing required fields: address, encryptedWif, encryptionSalt' },
        { status: 400 }
      );
    }

    // Validate address format (BSV P2PKH starts with 1)
    if (!address.match(/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/)) {
      return NextResponse.json(
        { error: 'Invalid BSV address format' },
        { status: 400 }
      );
    }

    if (!isDbConnected() || !supabase) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    // Check if user already has a wallet (case-insensitive)
    const { data: existingWallet } = await supabase
      .from('user_wallets')
      .select('id, address')
      .ilike('handle', handle)
      .single();

    if (existingWallet) {
      // Wallet already exists - don't overwrite
      return NextResponse.json({
        success: true,
        message: 'Wallet already exists',
        address: existingWallet.address,
        isExisting: true,
      });
    }

    // Get or check holder record
    const { data: holder } = await supabase
      .from('path402_holders')
      .select('id')
      .ilike('handle', handle)
      .single();

    // Store the wallet (server NEVER sees the WIF - only encrypted version)
    const { error: insertError } = await supabase.from('user_wallets').insert({
      handle: handle.toLowerCase(), // Normalize handle
      address,
      public_key: publicKey,
      encrypted_wif: encryptedWif,
      encryption_salt: encryptionSalt,
      holder_id: holder?.id || null,
    });

    if (insertError) {
      console.error('Failed to store wallet:', insertError);
      return NextResponse.json(
        { error: 'Failed to store wallet', details: insertError.message },
        { status: 500 }
      );
    }

    // Update holder with ordinals address if exists
    if (holder) {
      await supabase
        .from('path402_holders')
        .update({
          ordinals_address: address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', holder.id);
    }

    return NextResponse.json({
      success: true,
      address,
      message: 'Wallet stored securely. Your private key was generated in your browser and never sent to our servers.',
    });
  } catch (error) {
    console.error('Error storing wallet:', error);
    return NextResponse.json(
      { error: 'Failed to store wallet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
