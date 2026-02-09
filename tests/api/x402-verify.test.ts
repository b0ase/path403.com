import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const {
  checkNonceMock,
  verifyPaymentMock,
  createInscriptionMock,
  fees,
} = vi.hoisted(() => ({
  checkNonceMock: vi.fn(),
  verifyPaymentMock: vi.fn(),
  createInscriptionMock: vi.fn(),
  fees: { verification: 200, inscription: 500 },
}));

vi.mock('@/lib/x402', () => ({
  checkNonce: checkNonceMock,
  verifyPayment: verifyPaymentMock,
  createInscription: createInscriptionMock,
  FEES: fees,
}));

function buildRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/x402/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const basePayload = {
  signature: 'sig',
  authorization: {
    from: '0xFROM',
    to: '0xTO',
    value: '100',
    nonce: 'nonce-1',
  },
};

describe('/api/x402/verify', () => {
  it('rejects unsupported version', async () => {
    const { POST } = await import('@/app/api/x402/verify/route');
    const response = await POST(buildRequest({
      x402Version: 2,
      scheme: 'exact',
      network: 'bsv',
      payload: basePayload,
    }));

    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.valid).toBe(false);
  });

  it('rejects reused nonce', async () => {
    const { POST } = await import('@/app/api/x402/verify/route');
    checkNonceMock.mockResolvedValue(false);

    const response = await POST(buildRequest({
      x402Version: 1,
      scheme: 'exact',
      network: 'bsv',
      payload: basePayload,
    }));

    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.invalidReason).toBe('Nonce already used');
  });

  it('returns invalid when verification fails', async () => {
    const { POST } = await import('@/app/api/x402/verify/route');
    checkNonceMock.mockResolvedValue(true);
    verifyPaymentMock.mockResolvedValue({
      valid: false,
      invalidReason: 'Payment not found',
    });

    const response = await POST(buildRequest({
      x402Version: 1,
      scheme: 'exact',
      network: 'bsv',
      payload: basePayload,
    }));

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.valid).toBe(false);
    expect(payload.invalidReason).toBe('Payment not found');
  });

  it('returns inscription data on success', async () => {
    const { POST } = await import('@/app/api/x402/verify/route');
    checkNonceMock.mockResolvedValue(true);
    verifyPaymentMock.mockResolvedValue({
      valid: true,
      txId: 'origin-tx',
      amount: 100,
      sender: '0xFROM',
      recipient: '0xTO',
    });
    createInscriptionMock.mockResolvedValue({
      success: true,
      inscriptionId: 'insc123',
      txId: 'inscTx',
    });

    const response = await POST(buildRequest({
      x402Version: 1,
      scheme: 'exact',
      network: 'bsv',
      payload: basePayload,
      txId: 'origin-tx',
      asset: 'BSV',
    }));

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.valid).toBe(true);
    expect(payload.inscriptionId).toBe('insc123');
    expect(payload.fee.total).toBe(fees.verification + fees.inscription);
  });

  it('skips inscription when inscribe=false', async () => {
    const { POST } = await import('@/app/api/x402/verify/route');
    checkNonceMock.mockResolvedValue(true);
    verifyPaymentMock.mockResolvedValue({
      valid: true,
      txId: 'origin-tx',
      amount: 100,
      sender: '0xFROM',
      recipient: '0xTO',
    });
    createInscriptionMock.mockResolvedValue({
      success: true,
      inscriptionId: 'insc123',
      txId: 'inscTx',
    });

    const response = await POST(buildRequest({
      x402Version: 1,
      scheme: 'exact',
      network: 'bsv',
      payload: basePayload,
      txId: 'origin-tx',
      asset: 'BSV',
      inscribe: false,
    }));

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.valid).toBe(true);
    expect(payload.inscriptionId).toBeUndefined();
    expect(payload.fee.total).toBe(fees.verification);
  });

  it('fails when inscribe is true but txId is missing', async () => {
    const { POST } = await import('@/app/api/x402/verify/route');
    checkNonceMock.mockResolvedValue(true);
    verifyPaymentMock.mockResolvedValue({
      valid: true,
      amount: 100,
      sender: '0xFROM',
      recipient: '0xTO',
    });

    const response = await POST(buildRequest({
      x402Version: 1,
      scheme: 'exact',
      network: 'bsv',
      payload: basePayload,
      asset: 'BSV',
    }));

    const payload = await response.json();
    expect(response.status).toBe(400);
    expect(payload.valid).toBe(false);
    expect(payload.invalidReason).toBe('Missing origin txId for inscription');
  });
});
