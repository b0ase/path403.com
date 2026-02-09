import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyBsvPaymentTx } from '@/lib/bsv-verify';

const mockTx = {
  txid: 'abc123',
  vout: [
    {
      value: 0.0001, // 10,000 sats
      scriptPubKey: {
        addresses: ['1PAY'],
      },
    },
    {
      value: 0.00005,
      scriptPubKey: {
        addresses: ['1OTHER'],
      },
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('verifyBsvPaymentTx', () => {
  it('sums outputs to the expected address', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => mockTx,
    })) as unknown as typeof fetch);

    const result = await verifyBsvPaymentTx({
      txId: 'abc123',
      expectedAddress: '1PAY',
      minSats: 5_000,
    });

    expect(result.valid).toBe(true);
    expect(result.paidSats).toBe(10_000);
  });

  it('fails when payment is below minimum', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => mockTx,
    })) as unknown as typeof fetch);

    const result = await verifyBsvPaymentTx({
      txId: 'abc123',
      expectedAddress: '1PAY',
      minSats: 20_000,
    });

    expect(result.valid).toBe(false);
    expect(result.paidSats).toBe(10_000);
  });
});
