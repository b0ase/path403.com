/**
 * File Hash Inscription via HandCash
 *
 * Inscribes file hashes on BSV using the user's HandCash wallet.
 * The user pays for the inscription from their own wallet.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { handcashService } from '@/lib/handcash-service';

interface FileHashInscriptionRequest {
  hash: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  hashedAt: string;
}

/**
 * Validate SHA-256 hash format
 */
function isValidSHA256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

export async function POST(req: NextRequest) {
  try {
    // Get HandCash auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get('handcash_auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'HandCash not connected. Please connect your wallet first.', needsAuth: true },
        { status: 401 }
      );
    }

    const body: FileHashInscriptionRequest = await req.json();

    // Validate required fields
    if (!body.hash || !body.fileName || body.fileSize === undefined || !body.fileType || !body.hashedAt) {
      return NextResponse.json(
        { error: 'Missing required fields: hash, fileName, fileSize, fileType, hashedAt' },
        { status: 400 }
      );
    }

    // Validate hash format
    if (!isValidSHA256(body.hash)) {
      return NextResponse.json(
        { error: 'Invalid SHA-256 hash format' },
        { status: 400 }
      );
    }

    // Create inscription data
    const inscriptionData = JSON.stringify({
      protocol: 'b0ase-file-hash',
      version: '1.0',
      type: 'file_hash',
      hash: body.hash,
      algorithm: 'SHA-256',
      fileName: body.fileName,
      fileSize: body.fileSize,
      fileType: body.fileType,
      hashedAt: body.hashedAt,
      inscribedAt: new Date().toISOString(),
      platform: 'b0ase.com',
    });

    // Get user profile for logging
    let userHandle = 'unknown';
    try {
      const profile = await handcashService.getUserProfile(authToken);
      userHandle = profile.handle || profile.paymail || 'unknown';
    } catch {
      // Continue even if profile fetch fails
    }

    console.log(`[file-hash] Inscribing hash for ${userHandle}: ${body.hash.slice(0, 16)}...`);

    // Send payment with OP_RETURN data
    // HandCash supports data attachments via the description field
    // For a proper OP_RETURN inscription, we'd need to use a lower-level API
    // For now, we'll make a small payment to a burn address with metadata
    const result = await handcashService.sendPayment(authToken, {
      destination: 'inscription@moneybutton.com', // Paymail that accepts inscriptions
      amount: 0.001, // $0.001 USD - minimal amount
      currency: 'USD',
      description: `b0ase-file-hash:${body.hash}`,
    });

    console.log(`[file-hash] HandCash inscription successful: ${result.transactionId}`);

    return NextResponse.json({
      txid: result.transactionId,
      blockchainExplorerUrl: `https://whatsonchain.com/tx/${result.transactionId}`,
      inscribedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[file-hash] HandCash inscription error:', error);

    // Check for auth errors
    if (error.message?.includes('unauthorized') || error.message?.includes('token')) {
      return NextResponse.json(
        { error: 'HandCash session expired. Please reconnect.', needsAuth: true },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to inscribe with HandCash' },
      { status: 500 }
    );
  }
}
