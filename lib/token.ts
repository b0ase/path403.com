/**
 * Token utilities ported from @path402/core for web client use.
 * Uses Web Crypto API (no Node.js crypto dependency).
 */

const RESERVED_SYMBOLS = ['402', 'BSV', 'BTC', 'ETH', 'SOL', 'USDT', 'USDC'];

export function validateSymbol(symbol: string): { valid: boolean; error?: string } {
  if (!symbol.startsWith('$')) {
    return { valid: false, error: 'Symbol must start with $' };
  }
  const name = symbol.slice(1);
  if (name.length < 1 || name.length > 20) {
    return { valid: false, error: 'Symbol must be 1-20 characters after $' };
  }
  if (!/^[A-Z0-9_]+$/.test(name)) {
    return { valid: false, error: 'Symbol must contain only A-Z, 0-9, or _' };
  }
  if (RESERVED_SYMBOLS.includes(name)) {
    return { valid: false, error: `${symbol} is a reserved symbol` };
  }
  return { valid: true };
}

export async function generateTokenId(symbol: string, issuerAddress: string): Promise<string> {
  const data = `path402:${symbol}:${issuerAddress}`;
  const encoded = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatSupply(raw: string, decimals: number): string {
  const n = BigInt(raw);
  const divisor = BigInt(10 ** decimals);
  const whole = n / divisor;
  return whole.toLocaleString();
}

export function generateBSV21Inscription(symbol: string, supply: string, decimals: number, accessRate: number): string {
  return JSON.stringify({
    p: 'bsv-21',
    op: 'deploy',
    tick: symbol,
    max: supply,
    dec: decimals.toString(),
    path402: {
      accessRate,
      protocol: 'path402',
      version: '1.0.0',
    },
    metadata: {
      name: symbol.slice(1),
      description: `Access token for ${symbol.slice(1)}`,
    },
  });
}
