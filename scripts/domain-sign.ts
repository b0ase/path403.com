#!/usr/bin/env node
/**
 * Sign a PATH402 domain verification message using a BSV WIF.
 *
 * Usage:
 *   node scripts/domain-sign.ts --wif <WIF> --domain example.com
 *
 * Output:
 *   message, signature (base64)
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bsv = require('bsv');

const { PrivKey, KeyPair, Bsm } = bsv;

function getArg(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function main() {
  const wif = getArg('--wif');
  const domain = getArg('--domain');
  const messageArg = getArg('--message');

  if (!wif || !domain) {
    console.error('Usage: node scripts/domain-sign.ts --wif <WIF> --domain example.com [--message "..."]');
    process.exit(1);
  }

  const message = messageArg || `path402-domain:${domain}`;

  const privKey = PrivKey.fromWif(wif);
  const keyPair = KeyPair.fromPrivKey(privKey);
  const signature = Bsm.sign(Buffer.from(message, 'utf8'), keyPair);

  console.log(JSON.stringify({ message, signature }, null, 2));
}

main();
