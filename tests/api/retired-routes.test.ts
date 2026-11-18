import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

// 18 Nov 2026 security retirement: these routes trusted an unauthenticated header to hand out keys or move value.
const RETIRED: Record<string, string[]> = {
  'app/api/wallet/export/route.ts': ['GET', 'POST'],
  'app/api/wallet/encrypted/route.ts': ['GET'],
  'app/api/wallet/register/route.ts': ['GET', 'POST'],
  'app/api/account/derive/route.ts': ['GET', 'POST'],
  'app/api/account/store-wallet/route.ts': ['POST'],
  'app/api/token/withdraw/route.ts': ['GET', 'POST'],
  'app/api/token/buy/route.ts': ['POST'],
  'app/api/token/confirm/route.ts': ['POST'],
  'app/api/stake/route.ts': ['GET', 'POST'],
  'app/api/stake/claim/route.ts': ['GET', 'POST'],
  'app/api/dividends/distribute/route.ts': ['GET', 'POST'],
  'app/api/dividends/pending/route.ts': ['GET'],
  'app/api/tokens/transfer/route.ts': ['POST'],
  'app/api/tokens/[address]/stream/route.ts': ['GET', 'POST'],
  'app/api/tokens/[address]/bridge/route.ts': ['POST'],
  'app/api/domain/verify-inscribe/route.ts': ['POST'],
  'app/api/uhrp/advertise/route.ts': ['POST'],
  'app/api/x402/inscription/route.ts': ['POST'],
  'app/api/tokens/route.ts': ['POST'],
  'app/api/tokens/[address]/route.ts': ['POST'],
};

// A request that would have passed the old checks: a handle, admin and bridge secrets, a payment txid, a signature.
function attackRequest(method: string) {
  const headers = {
    'content-type': 'application/json',
    'x-wallet-handle': 'someone',
    'x-wallet-provider': 'handcash',
    'x-admin-key': '',
    'x-bridge-secret': '',
    'x-bsv-payment-txid': 'a'.repeat(64),
  };
  const body = JSON.stringify({
    signature: 'sig', handle: 'someone', amount: 1, recipient: 'other', to: 'other', address: '$example.com',
    name: 'x', issuer_address: '1abc', poolAmount: 1, purchaseId: 'p', txId: 'a'.repeat(64), action: 'stake',
  });
  return new NextRequest('https://example.com/api/x', { method, headers, body: method === 'GET' ? undefined : body });
}

const ctx = { params: Promise.resolve({ address: '$example.com' }) };

describe('retired routes answer 410 to everything', () => {
  for (const [file, methods] of Object.entries(RETIRED)) {
    if (!existsSync(file)) continue;
    for (const method of methods) {
      it(`${method} ${file}`, async () => {
        const mod = await import(/* @vite-ignore */ join(process.cwd(), file));
        const handler = mod[method] as (req: NextRequest, c: unknown) => Promise<Response> | Response;
        expect(typeof handler).toBe('function');
        const res = await handler(attackRequest(method), ctx);
        expect(res.status).toBe(410);
        expect(await res.json()).toEqual({ error: 'This endpoint is retired.' });
        expect(res.headers.get('cache-control')).toBe('no-store');
      });
    }
  }

  it('fully retired route files keep no logic (no db, keys, env or headers)', () => {
    for (const file of Object.keys(RETIRED)) {
      // POST-only retirements keep their read-only GET
      if (!existsSync(file) || ['app/api/tokens/route.ts', 'app/api/tokens/[address]/route.ts', 'app/api/x402/inscription/route.ts'].includes(file)) continue;
      const src = readFileSync(file, 'utf8');
      expect(src).not.toMatch(/supabase|process\.env|headers\.get|decryptWif|createClient|from\('/);
    }
  });

  it('the WIF helpers and their fallback key are gone from the source', () => {
    expect(existsSync('lib/address-derivation.ts')).toBe(false);
    expect(existsSync('lib/client-wallet.ts')).toBe(false);
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => {
        const p = join(dir, n);
        if (n === 'node_modules' || n.startsWith('.')) return [];
        return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|js|mjs)$/.test(n) ? [p] : [];
      });
    for (const f of [...walk('app'), ...walk('lib')]) {
      const src = readFileSync(f, 'utf8');
      expect(src, f).not.toContain('path402-wif-encryption');
      expect(src, f).not.toMatch(/address-derivation|client-wallet|decryptWif|encryptWif/);
    }
  });
});
