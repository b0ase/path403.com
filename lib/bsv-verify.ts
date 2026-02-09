// BSV transaction verification helpers (Whatsonchain)

const WOC_API = 'https://api.whatsonchain.com/v1/bsv/main';

export interface BsvTxOutput {
  value: number; // BSV
  scriptPubKey?: {
    addresses?: string[];
    hex?: string;
  };
}

export interface BsvTx {
  txid: string;
  blockheight?: number;
  confirmations?: number;
  vout: BsvTxOutput[];
}

export async function fetchBsvTx(txId: string): Promise<BsvTx | null> {
  try {
    const res = await fetch(`${WOC_API}/tx/${txId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('[bsv-verify] fetch tx error:', error);
    return null;
  }
}

export async function verifyBsvPaymentTx(params: {
  txId: string;
  expectedAddress: string;
  minSats: number;
}): Promise<{ valid: boolean; paidSats: number }> {
  const { txId, expectedAddress, minSats } = params;
  const tx = await fetchBsvTx(txId);
  if (!tx || !tx.vout) {
    return { valid: false, paidSats: 0 };
  }

  let paidSats = 0;
  for (const vout of tx.vout) {
    const addresses = vout.scriptPubKey?.addresses || [];
    if (addresses.includes(expectedAddress)) {
      paidSats += Math.round(vout.value * 1e8);
    }
  }

  return { valid: paidSats >= minSats, paidSats };
}
