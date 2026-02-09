import { NextRequest, NextResponse } from 'next/server';
import { supabase, isDbConnected } from '@/lib/supabase';

/**
 * GET /api/wallet/encrypted
 *
 * Returns the encrypted wallet data for client-side decryption.
 * The server NEVER decrypts the WIF - only the client can do that.
 */
export async function GET(request: NextRequest) {
  try {
    const handle = request.headers.get('x-wallet-handle');
    const provider = request.headers.get('x-wallet-provider');

    if (!handle || provider !== 'handcash') {
      return NextResponse.json(
        { error: 'HandCash connection required' },
        { status: 401 }
      );
    }

    if (!isDbConnected() || !supabase) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 503 }
      );
    }

    // Get encrypted wallet data (case-insensitive)
    const { data: wallet, error } = await supabase
      .from('user_wallets')
      .select('address, encrypted_wif, encryption_salt')
      .ilike('handle', handle)
      .single();

    if (error || !wallet) {
      return NextResponse.json(
        {
          error: 'Wallet not found',
          details: 'You need to derive an address first.',
        },
        { status: 404 }
      );
    }

    // Return encrypted data - client will decrypt
    // Server NEVER decrypts the WIF
    return NextResponse.json({
      address: wallet.address,
      encryptedWif: wallet.encrypted_wif,
      encryptionSalt: wallet.encryption_salt,
      message: 'Decrypt this client-side using your handle. The server cannot decrypt your private key.',
    });
  } catch (error) {
    console.error('Error fetching encrypted wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
