// On-chain domain signature verification (BSV ordinals payload)

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bsv = require('bsv');

const { Tx, Br, Bsm, Address } = bsv;

const WOC_API = 'https://api.whatsonchain.com/v1/bsv/main';

export interface DomainSignaturePayload {
  p?: string;
  op?: string;
  domain?: string;
  issuer_address?: string;
  message?: string;
  signature?: string;
}

export async function fetchTxHex(txId: string): Promise<string | null> {
  try {
    const res = await fetch(`${WOC_API}/tx/${txId}/hex`);
    if (!res.ok) return null;
    const hex = await res.text();
    return hex.replace(/"/g, '').trim();
  } catch (error) {
    console.error('[domain-proof] fetch tx hex failed:', error);
    return null;
  }
}

export function extractOrdPayloadFromTxHex(txHex: string): string | null {
  try {
    const tx = new Tx().fromBr(new Br(Buffer.from(txHex, 'hex')));

    for (const out of tx.txOuts) {
      const chunks = out.script.chunks || [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        if (chunk.buf && chunk.buf.toString('utf8') === 'ord') {
          // Find the 0x00 separator after content-type
          for (let j = i + 1; j < chunks.length - 1; j++) {
            if (chunks[j].opCodeNum === 0x00 && chunks[j + 1]?.buf) {
              return chunks[j + 1].buf.toString('utf8');
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[domain-proof] extract payload failed:', error);
  }

  return null;
}

export function verifyBsvMessageSignature(params: {
  message: string;
  signature: string;
  address: string;
}): boolean {
  try {
    const { message, signature, address } = params;
    const addr = Address.fromString(address);
    return Bsm.verify(Buffer.from(message, 'utf8'), signature, addr);
  } catch (error) {
    console.error('[domain-proof] signature verify failed:', error);
    return false;
  }
}

export function isValidBsvAddress(address: string): boolean {
  try {
    Address.fromString(address);
    return true;
  } catch {
    return false;
  }
}

export async function verifyDomainSignatureOnChain(params: {
  domain: string;
  issuerAddress: string;
  txId: string;
  signature?: string;
  message?: string;
}): Promise<boolean> {
  const { domain, issuerAddress, txId, signature, message } = params;
  if (!domain || !issuerAddress || !txId) return false;

  const txHex = await fetchTxHex(txId);
  if (!txHex) return false;

  const payloadRaw = extractOrdPayloadFromTxHex(txHex);
  if (!payloadRaw) return false;

  let payload: DomainSignaturePayload;
  try {
    payload = JSON.parse(payloadRaw) as DomainSignaturePayload;
  } catch {
    return false;
  }

  if (payload.p && payload.p !== '$402') return false;
  if (payload.op && payload.op !== 'domain-verify') return false;

  const payloadDomain = payload.domain || '';
  const payloadAddress = payload.issuer_address || '';
  const payloadSig = payload.signature || signature || '';
  const payloadMsg = payload.message || message || `path402-domain:${domain}`;

  if (payloadDomain !== domain) return false;
  if (payloadAddress !== issuerAddress) return false;
  if (!payloadSig) return false;

  return verifyBsvMessageSignature({
    message: payloadMsg,
    signature: payloadSig,
    address: issuerAddress,
  });
}
