import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const {
  mockSupabase,
  sessionsQuery,
  holdingsQuery,
  getTokenMock,
  verifyMock,
} = vi.hoisted(() => {
  const createSupabaseQuery = () => {
    const query: {
      select: ReturnType<typeof vi.fn>;
      eq: ReturnType<typeof vi.fn>;
      single: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      insert: ReturnType<typeof vi.fn>;
    } = {
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
      update: vi.fn(),
      insert: vi.fn(),
    };

    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.single.mockResolvedValue({ data: null });
    query.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({}) });
    query.insert.mockResolvedValue({});

    return query;
  };

  const sessionsQuery = createSupabaseQuery();
  const holdingsQuery = createSupabaseQuery();
  const paymentsQuery = createSupabaseQuery();

  const mockSupabase = {
    from: vi.fn((table: string) => {
      if (table === 'token_usage_sessions') return sessionsQuery;
      if (table === 'token_holdings') return holdingsQuery;
      if (table === 'token_usage_payments') return paymentsQuery;
      return createSupabaseQuery();
    }),
  };

  return {
    mockSupabase,
    sessionsQuery,
    holdingsQuery,
    getTokenMock: vi.fn(),
    verifyMock: vi.fn(),
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabase,
}));

vi.mock('@/lib/tokens', () => ({
  getToken: getTokenMock,
}));

vi.mock('@/lib/bsv-verify', () => ({
  verifyBsvPaymentTx: verifyMock,
}));

vi.mock('@/lib/store', () => ({
  PAYMENT_ADDRESS: '1PAY',
}));

describe('/api/tokens/[address]/stream', () => {
  it('returns 401 when missing handle', async () => {
    const { GET } = await import('@/app/api/tokens/[address]/stream/route');
    const request = new NextRequest('http://localhost/api/tokens/%24alice/stream');
    const response = await GET(request, { params: Promise.resolve({ address: '$alice' }) });
    expect(response.status).toBe(401);
  });

  it('returns 402 when payment tx id missing', async () => {
    const { POST } = await import('@/app/api/tokens/[address]/stream/route');
    getTokenMock.mockResolvedValue({
      address: '$alice',
      access_mode: 'usage',
      usage_pricing: {
        unit_ms: 1000,
        price_sats_per_unit: 100,
        accepted_networks: ['bsv'],
      },
    });

    const request = new NextRequest('http://localhost/api/tokens/%24alice/stream', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-wallet-handle': 'alice',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ address: '$alice' }) });
    const payload = await response.json();
    expect(response.status).toBe(402);
    expect(payload.error).toBe('Payment required');
  });

  it('requires token holdings when access mode is token', async () => {
    const { POST } = await import('@/app/api/tokens/[address]/stream/route');
    getTokenMock.mockResolvedValue({
      address: '$alice',
      access_mode: 'token',
      usage_pricing: {
        unit_ms: 1000,
        price_sats_per_unit: 100,
        accepted_networks: ['bsv'],
      },
    });
    holdingsQuery.single.mockResolvedValue({ data: null });

    const request = new NextRequest('http://localhost/api/tokens/%24alice/stream', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-wallet-handle': 'alice',
      },
      body: JSON.stringify({ payment_tx_id: 'tx123' }),
    });

    const response = await POST(request, { params: Promise.resolve({ address: '$alice' }) });
    const payload = await response.json();
    expect(response.status).toBe(402);
    expect(payload.error).toBe('Token required');
  });

  it('grants access window on valid payment', async () => {
    const { POST } = await import('@/app/api/tokens/[address]/stream/route');
    getTokenMock.mockResolvedValue({
      address: '$alice',
      access_mode: 'usage',
      issuer_address: '1ISSUER',
      usage_pricing: {
        unit_ms: 1000,
        price_sats_per_unit: 100,
        accepted_networks: ['bsv'],
      },
    });
    sessionsQuery.single.mockResolvedValue({ data: null });
    verifyMock.mockResolvedValue({ valid: true, paidSats: 500 });

    const request = new NextRequest('http://localhost/api/tokens/%24alice/stream', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-wallet-handle': 'alice',
      },
      body: JSON.stringify({ payment_tx_id: 'tx123' }),
    });

    const response = await POST(request, { params: Promise.resolve({ address: '$alice' }) });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.paid_sats).toBe(500);
    expect(payload.grant_ms).toBe(5000);
  });
});
