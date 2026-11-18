import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

// 18 Nov 2026 blanket retirement: the proxy answers 410 for every /api request except these read-only public GETs.
const OPEN_API_GETS = ['/api/token/stats', '/api/token/onchain', '/api/token/cap-table', '/api/price/bsv', '/api/tokens'];
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

async function gate(): Promise<(req: NextRequest) => Response | Promise<Response>> {
  const file = existsSync('proxy.ts') ? 'proxy.ts' : 'middleware.ts';
  const mod = await import(/* @vite-ignore */ join(process.cwd(), file));
  return mod.proxy ?? mod.middleware;
}

function routeFiles(dir = 'app/api'): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? routeFiles(p) : n === 'route.ts' ? [p] : [];
  });
}

// app/api/client/strands/[id]/broadcast/route.ts -> /api/client/strands/x/broadcast
const urlPath = (file: string) => '/' + file.replace(/^app\//, '').replace(/\/route\.ts$/, '').replace(/\[\.{0,3}[^\]]+\]/g, 'x');

function req(path: string, method: string, headers: Record<string, string> = {}) {
  return new NextRequest(`https://example.com${path}`, {
    method,
    headers: { 'content-type': 'application/json', host: 'example.com', ...headers },
    body: method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify({ verification: { status: 'approved' }, txId: 'a'.repeat(64) }),
  });
}

const isRetired = async (res: Response) =>
  res.status === 410 && (await res.json()).error === 'This endpoint is retired.' && res.headers.get('cache-control') === 'no-store';

describe('blanket /api retirement in the proxy', () => {
  const files = routeFiles();

  it('finds the route files', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('every route file x every exported method is 410, except the allowlisted GETs', async () => {
    const proxy = await gate();
    const failures: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      const methods = METHODS.filter((m) => new RegExp(`export\\s+(async\\s+function|const)\\s+${m}\\b`).test(src));
      const path = urlPath(file);
      for (const method of methods) {
        const res = await proxy(req(path, method));
        const open = method === 'GET' && OPEN_API_GETS.includes(path);
        if (open ? res.status === 410 : !(await isRetired(res))) failures.push(`${method} ${path} -> ${res.status}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('allowlisted paths are GET-only and exact', async () => {
    const proxy = await gate();
    for (const path of OPEN_API_GETS) {
      expect((await proxy(req(path, 'GET'))).status).not.toBe(410);
      for (const m of ['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']) {
        expect(await isRetired(await proxy(req(path, m))), `${m} ${path}`).toBe(true);
      }
      for (const variant of [`${path}/`, `${path}/x`, path.toUpperCase(), path.replace('/api/', '/api/%74')]) {
        expect(await isRetired(await proxy(req(variant, 'GET'))), variant).toBe(true);
      }
    }
    expect(await isRetired(await proxy(req('/api', 'GET')))).toBe(true);
    expect(await isRetired(await proxy(req('/api/does-not-exist', 'GET')))).toBe(true);
  });

  it('forged identity gets nowhere: Veriff webhook "approved" and a strand broadcast with a forged hc_handle cookie', async () => {
    const proxy = await gate();
    expect(await isRetired(await proxy(req('/api/auth/kyc/veriff/webhook', 'POST', { 'x-hmac-signature': 'forged' })))).toBe(true);
    for (const method of ['POST', 'DELETE']) {
      const res = await proxy(req('/api/client/strands/x/broadcast', method, { cookie: 'hc_handle=victim', 'x-wallet-handle': 'victim' }));
      expect(await isRetired(res)).toBe(true);
    }
    expect(await isRetired(await proxy(req('/api/client/identity', 'GET', { cookie: 'hc_handle=victim' })))).toBe(true);
    expect(await isRetired(await proxy(req('/api/x402/settle', 'POST')))).toBe(true);
  });

  it('the proxy runs on every path except static assets (so /API and encoded variants reach it)', () => {
    const src = readFileSync(existsSync('proxy.ts') ? 'proxy.ts' : 'middleware.ts', 'utf8');
    expect(src).toContain("matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']");
  });

  it('non-/api paths pass through untouched', async () => {
    const proxy = await gate();
    for (const path of ['/about', '/apiary', '/.well-known/$402.json']) {
      expect((await proxy(req(path, 'GET'))).status, path).not.toBe(410);
    }
  });
});
