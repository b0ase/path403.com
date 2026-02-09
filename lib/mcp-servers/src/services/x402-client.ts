/**
 * x402 API Client
 *
 * HTTP client for PATH402.com x402 facilitator endpoints.
 * Handles verification, settlement, inscription lookup, and discovery.
 */

import type {
  X402VerifyRequest,
  X402VerifyResponse,
  X402SettleRequest,
  X402SettleResponse,
  X402InscriptionResponse,
  X402FacilitatorStats,
  X402Discovery,
  SupportedNetwork,
} from '../types/x402.js';

// ── Configuration ──────────────────────────────────────────────────

const DEFAULT_FACILITATOR_URL = 'https://path402.com';
const REQUEST_TIMEOUT_MS = 30000;

function getFacilitatorUrl(): string {
  return process.env.PATH402_API_URL || DEFAULT_FACILITATOR_URL;
}

// ── HTTP Helper ────────────────────────────────────────────────────

interface FetchOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  timeout?: number;
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { method = 'GET', body, timeout = REQUEST_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'path402-mcp-server/1.0.0',
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Verify Payment ─────────────────────────────────────────────────

/**
 * Verify a payment signature from any supported chain.
 * Optionally inscribes verification proof on BSV.
 */
export async function verifyPayment(
  request: X402VerifyRequest
): Promise<X402VerifyResponse> {
  const baseUrl = getFacilitatorUrl();
  const url = `${baseUrl}/api/x402/verify`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: request,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        valid: false,
        invalidReason: error.invalidReason || error.error || `HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        valid: false,
        invalidReason: 'Request timeout - facilitator did not respond',
      };
    }
    return {
      valid: false,
      invalidReason: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ── Settle Payment ─────────────────────────────────────────────────

/**
 * Settle a payment. Can settle on origin chain or BSV (cheapest).
 * Returns settlement transaction and inscription details.
 */
export async function settlePayment(
  request: X402SettleRequest
): Promise<X402SettleResponse> {
  const baseUrl = getFacilitatorUrl();
  const url = `${baseUrl}/api/x402/settle`;

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: request,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: error.error || `HTTP ${response.status}`,
      };
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout - facilitator did not respond',
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ── Get Inscription ────────────────────────────────────────────────

/**
 * Retrieve an inscription by ID.
 * Returns the full inscription proof and explorer link.
 */
export async function getInscription(
  inscriptionId: string
): Promise<X402InscriptionResponse | null> {
  const baseUrl = getFacilitatorUrl();
  const url = `${baseUrl}/api/x402/inscription/${encodeURIComponent(inscriptionId)}`;

  try {
    const response = await fetchWithTimeout(url);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error(`[x402-client] Inscription lookup failed: HTTP ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[x402-client] Inscription lookup error:', error);
    return null;
  }
}

// ── Get Stats ──────────────────────────────────────────────────────

/**
 * Get facilitator statistics including inscription counts,
 * fees collected, and supported networks.
 */
export async function getStats(): Promise<X402FacilitatorStats | null> {
  const baseUrl = getFacilitatorUrl();
  const url = `${baseUrl}/api/x402/stats`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.error(`[x402-client] Stats fetch failed: HTTP ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[x402-client] Stats fetch error:', error);
    return null;
  }
}

// ── Get Discovery Document ─────────────────────────────────────────

/**
 * Fetch the facilitator's discovery document.
 * Contains supported networks, fees, endpoints, and token info.
 */
export async function getDiscovery(
  facilitatorUrl?: string
): Promise<X402Discovery | null> {
  const baseUrl = facilitatorUrl || getFacilitatorUrl();
  const url = `${baseUrl}/.well-known/x402.json`;

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.error(`[x402-client] Discovery fetch failed: HTTP ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('[x402-client] Discovery fetch error:', error);
    return null;
  }
}

// ── Fee Estimation ─────────────────────────────────────────────────

/**
 * Estimate fees for settling a payment on different chains.
 * Returns comparison showing cheapest option.
 */
export function estimateFees(amountSats: number): {
  bsv: number;
  base: number;
  solana: number;
  ethereum: number;
  cheapest: SupportedNetwork;
} {
  // Fee calculations based on current network conditions
  const bsv = 500 + Math.ceil(amountSats * 0.001);      // Inscription + 0.1%
  const base = Math.max(100, Math.ceil(amountSats * 0.001));   // ~0.1%
  const solana = Math.max(50, Math.ceil(amountSats * 0.0005)); // ~0.05%
  const ethereum = Math.max(5000, Math.ceil(amountSats * 0.005)); // ~0.5%

  // Determine cheapest (BSV inscription is fixed cost, better for large amounts)
  let cheapest: SupportedNetwork = 'bsv';
  let lowestFee = bsv;

  if (base < lowestFee) {
    lowestFee = base;
    cheapest = 'base';
  }
  if (solana < lowestFee) {
    lowestFee = solana;
    cheapest = 'solana';
  }
  // Ethereum is usually most expensive, but include for completeness
  if (ethereum < lowestFee) {
    cheapest = 'ethereum';
  }

  return { bsv, base, solana, ethereum, cheapest };
}

// ── Network Validation ─────────────────────────────────────────────

const SUPPORTED_NETWORKS: SupportedNetwork[] = ['bsv', 'base', 'solana', 'ethereum'];

export function isValidNetwork(network: string): network is SupportedNetwork {
  return SUPPORTED_NETWORKS.includes(network as SupportedNetwork);
}

// ── Export ─────────────────────────────────────────────────────────

export const x402Client = {
  verifyPayment,
  settlePayment,
  getInscription,
  getStats,
  getDiscovery,
  estimateFees,
  isValidNetwork,
  getFacilitatorUrl,
} as const;
