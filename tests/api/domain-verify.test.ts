import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { verifyMock } = vi.hoisted(() => ({
  verifyMock: vi.fn(),
}));

vi.mock('@/lib/domain-verification', () => ({
  verifyDomainOwnershipDetailed: verifyMock,
}));

describe('/api/domain/verify', () => {
  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('@/app/api/domain/verify/route');
    const request = new NextRequest('http://localhost/api/domain/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com' }),
    });

    const response = await POST(request);
    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.error).toContain('domain, handle, and issuer_address');
  });

  it('returns verification details on success', async () => {
    const { POST } = await import('@/app/api/domain/verify/route');
    verifyMock.mockResolvedValue({
      ok: true,
      dns: { ok: true },
      http: { ok: true },
      onchain: { ok: true },
    });

    const request = new NextRequest('http://localhost/api/domain/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        domain: 'example.com',
        handle: '@alice',
        issuer_address: '1ABC',
      }),
    });

    const response = await POST(request);
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.dns.ok).toBe(true);
  });
});
