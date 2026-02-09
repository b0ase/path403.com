// Domain ownership verification for $address issuance

import { verifyDomainSignatureOnChain } from './bsv-domain-proof';

const DEFAULT_DOH = 'https://cloudflare-dns.com/dns-query';

export async function verifyDomainOwnership(
  domain: string,
  handle: string,
  issuerAddress: string
): Promise<boolean> {
  const details = await verifyDomainOwnershipDetailed(domain, handle, issuerAddress);
  return details.ok;
}

export async function verifyDomainOwnershipDetailed(
  domain: string,
  handle: string,
  issuerAddress: string
): Promise<{
  ok: boolean;
  dns: { ok: boolean; domain_signature_tx_id?: string; domain_signature?: string; domain_message?: string };
  http: { ok: boolean; domain_signature_tx_id?: string; domain_signature?: string; domain_message?: string };
  onchain: { ok: boolean; tx_id?: string };
}> {
  const required = (process.env.PATH402_DOMAIN_VERIFY_REQUIRED || 'true').toLowerCase() === 'true';

  if (!required) {
    return {
      ok: true,
      dns: { ok: true },
      http: { ok: true },
      onchain: { ok: true },
    };
  }

  if (!domain || !handle || !issuerAddress) {
    return {
      ok: false,
      dns: { ok: false },
      http: { ok: false },
      onchain: { ok: false },
    };
  }

  const dns = await verifyViaDns(domain, handle, issuerAddress);
  const http = await verifyViaWellKnown(domain, handle, issuerAddress);

  const txId = http.domain_signature_tx_id || dns.domain_signature_tx_id;
  const signature = http.domain_signature || dns.domain_signature;

  let onchainOk = false;
  if (dns.ok && http.ok && txId && signature) {
    onchainOk = await verifyDomainSignatureOnChain({
      domain,
      issuerAddress,
      txId,
      signature,
      message: http.domain_message || dns.domain_message,
    });
  }

  return {
    ok: dns.ok && http.ok && onchainOk,
    dns,
    http,
    onchain: { ok: onchainOk, tx_id: txId },
  };
}

async function verifyViaDns(
  domain: string,
  handle: string,
  issuerAddress: string
): Promise<{
  ok: boolean;
  domain_signature_tx_id?: string;
  domain_signature?: string;
  domain_message?: string;
}> {
  const name = `_path402.${domain}`;
  const url = `${DEFAULT_DOH}?name=${encodeURIComponent(name)}&type=TXT`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/dns-json',
      },
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    const answers: Array<{ data: string }> = data.Answer || [];

    let handleOk = false;
    let addressOk = false;
    let signatureTx: string | undefined;
    let signature: string | undefined;
    let message: string | undefined;

    for (const a of answers) {
      const txt = stripTxt(a.data);
      if (matchesHandle(txt, handle)) handleOk = true;
      if (matchesIssuerAddress(txt, issuerAddress)) addressOk = true;

      if (txt.startsWith('domain_signature_tx_id=')) {
        signatureTx = txt.split('=')[1]?.trim();
      }
      if (txt.startsWith('domain_signature=')) {
        signature = txt.split('=')[1]?.trim();
      }
      if (txt.startsWith('domain_message=')) {
        message = txt.split('=')[1]?.trim();
      }
    }

    return {
      ok: handleOk && addressOk,
      domain_signature_tx_id: signatureTx,
      domain_signature: signature,
      domain_message: message,
    };
  } catch (error) {
    console.error('[domain-verify] DNS check failed:', error);
    return { ok: false };
  }
}

async function verifyViaWellKnown(
  domain: string,
  handle: string,
  issuerAddress: string
): Promise<{
  ok: boolean;
  domain_signature_tx_id?: string;
  domain_signature?: string;
  domain_message?: string;
}> {
  const url = `https://${domain}/.well-known/path402.json`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return { ok: false };
    const data = await res.json();

    const candidates = [
      data.issuer,
      data.issuer_handle,
      data.owner,
      data.handle,
    ].filter(Boolean);

    let handleOk = candidates.some((c) => matchesHandle(String(c), handle));

    const addressCandidates = [
      data.issuer_address,
      data.address,
      data.owner_address,
    ].filter(Boolean);

    const addressOk = addressCandidates.some((a: string) => matchesIssuerAddress(String(a), issuerAddress));

    if (Array.isArray(data.handles)) {
      if (data.handles.some((h: string) => matchesHandle(String(h), handle))) {
        handleOk = true;
      }
    }

    const signatureTx = data.domain_signature_tx_id || data.signature_tx_id || data.tx_id;
    const signature = data.domain_signature || data.signature;
    const message = data.domain_message || data.message;

    return {
      ok: handleOk && addressOk,
      domain_signature_tx_id: signatureTx,
      domain_signature: signature,
      domain_message: message,
    };
  } catch (error) {
    console.error('[domain-verify] well-known check failed:', error);
    return { ok: false };
  }
}

function stripTxt(txt: string): string {
  // TXT records may be quoted
  if (txt.startsWith('"') && txt.endsWith('"')) {
    return txt.slice(1, -1);
  }
  return txt;
}

function matchesHandle(value: string, handle: string): boolean {
  const normalized = value.trim();
  const target = handle.trim();
  if (!normalized) return false;

  if (normalized === target) return true;
  if (normalized === `path402=${target}`) return true;
  if (normalized === `path402:${target}`) return true;
  return normalized.includes(target);
}

function matchesIssuerAddress(value: string, issuerAddress: string): boolean {
  const normalized = value.trim();
  const target = issuerAddress.trim();
  if (!normalized) return false;

  if (normalized === target) return true;
  if (normalized === `issuer_address=${target}`) return true;
  if (normalized === `issuer:${target}`) return true;
  return normalized.includes(target);
}
