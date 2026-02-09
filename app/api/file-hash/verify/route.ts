/**
 * File Hash Verification API
 *
 * Verifies a file hash by checking if it exists on the BSV blockchain.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Transaction } from '@bsv/sdk';

const WHATSONCHAIN_API = 'https://api.whatsonchain.com/v1/bsv/main';
const FETCH_TIMEOUT_MS = 30000;

interface VerificationResult {
  found: boolean;
  hash?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  hashedAt?: string;
  inscribedAt?: string;
  txid?: string;
  blockchainExplorerUrl?: string;
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Validate SHA-256 hash format
 */
function isValidSHA256(hash: string): boolean {
  return /^[a-f0-9]{64}$/i.test(hash);
}

/**
 * Verify a file hash inscription by transaction ID
 */
async function verifyByTxid(txid: string): Promise<VerificationResult> {
  try {
    const url = `${WHATSONCHAIN_API}/tx/${txid}/hex`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      return { found: false };
    }

    const txHex = await response.text();
    const tx = Transaction.fromHex(txHex);

    // Look for OP_RETURN output with our protocol
    for (const output of tx.outputs) {
      const script = output.lockingScript;
      const chunks = script.chunks;

      // Check if OP_RETURN (opcode 106)
      if (chunks.length > 0 && chunks[0].op === 106) {
        // Check protocol identifier
        if (chunks.length >= 3) {
          const protocol = chunks[1].data?.toString('utf8');
          if (protocol === 'b0ase-file-hash') {
            const dataChunk = chunks[3]?.data?.toString('utf8');
            if (dataChunk) {
              try {
                const data = JSON.parse(dataChunk);
                return {
                  found: true,
                  hash: data.hash,
                  fileName: data.fileName,
                  fileSize: data.fileSize,
                  fileType: data.fileType,
                  hashedAt: data.hashedAt,
                  inscribedAt: data.inscribedAt,
                  txid,
                  blockchainExplorerUrl: `https://whatsonchain.com/tx/${txid}`,
                };
              } catch {
                // JSON parse failed, continue checking other outputs
              }
            }
          }
        }
      }
    }

    return { found: false };
  } catch (error) {
    console.error('[file-hash] Verify by txid error:', error);
    return { found: false };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hash = searchParams.get('hash');
    const txid = searchParams.get('txid');

    // Must provide either hash or txid
    if (!hash && !txid) {
      return NextResponse.json(
        { error: 'Provide either hash or txid parameter' },
        { status: 400 }
      );
    }

    // Verify by transaction ID
    if (txid) {
      const result = await verifyByTxid(txid);
      return NextResponse.json(result);
    }

    // Verify by hash - validate format first
    if (hash && !isValidSHA256(hash)) {
      return NextResponse.json(
        { error: 'Invalid SHA-256 hash format' },
        { status: 400 }
      );
    }

    // Note: Searching by hash would require an indexer.
    // For now, we only support verification by txid.
    // Users should save their txid as proof.
    return NextResponse.json({
      found: false,
      message: 'Hash search requires transaction ID. Use the certificate you received when inscribing.',
    });
  } catch (error: any) {
    console.error('[file-hash] Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify file hash' },
      { status: 500 }
    );
  }
}
