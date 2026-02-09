"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ADDRESS_VERSIONS: () => ADDRESS_VERSIONS,
  BASE58_ALPHABET: () => BASE58_ALPHABET,
  HEX_CHARS: () => HEX_CHARS,
  addressToHash160: () => addressToHash160,
  base58CheckDecode: () => base58CheckDecode,
  base58CheckEncode: () => base58CheckEncode,
  base58Decode: () => base58Decode,
  base58Encode: () => base58Encode,
  base64Decode: () => base64Decode,
  base64Encode: () => base64Encode,
  base64UrlDecode: () => base64UrlDecode,
  base64UrlEncode: () => base64UrlEncode,
  bytesToHex: () => bytesToHex,
  constantTimeCompare: () => constantTimeCompare,
  generateId: () => generateId,
  getAddressType: () => getAddressType,
  hash160: () => hash160,
  hash160Hex: () => hash160Hex,
  hexToBytes: () => hexToBytes,
  isValidAddress: () => isValidAddress,
  isValidBase58: () => isValidBase58,
  isValidBase58Check: () => isValidBase58Check,
  isValidHex: () => isValidHex,
  isValidWIF: () => isValidWIF,
  privateKeyToWIF: () => privateKeyToWIF,
  publicKeyToAddress: () => publicKeyToAddress,
  randomBytes: () => randomBytes,
  randomHex: () => randomHex,
  reverseHex: () => reverseHex,
  ripemd160: () => ripemd160,
  secureZero: () => secureZero,
  sha256: () => sha256,
  sha256Hex: () => sha256Hex,
  sha256d: () => sha256d,
  wifToPrivateKey: () => wifToPrivateKey
});
module.exports = __toCommonJS(index_exports);
var BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var HEX_CHARS = "0123456789abcdef";
var ADDRESS_VERSIONS = {
  mainnet: {
    p2pkh: 0,
    p2sh: 5,
    wif: 128
  },
  testnet: {
    p2pkh: 111,
    p2sh: 196,
    wif: 239
  }
};
function hexToBytes(hex) {
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function isValidHex(str) {
  if (str.length % 2 !== 0) return false;
  return /^[0-9a-fA-F]*$/.test(str);
}
function reverseHex(hex) {
  const bytes = hex.match(/.{2}/g) || [];
  return bytes.reverse().join("");
}
function base64Encode(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
function base64Decode(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
function base64UrlEncode(bytes) {
  return base64Encode(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return base64Decode(base64);
}
function base58Encode(bytes) {
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }
  let result = "";
  while (num > 0n) {
    const remainder = Number(num % 58n);
    num = num / 58n;
    result = BASE58_ALPHABET[remainder] + result;
  }
  for (const byte of bytes) {
    if (byte !== 0) break;
    result = "1" + result;
  }
  return result || "1";
}
function base58Decode(str) {
  let num = 0n;
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base58 character: ${char}`);
    }
    num = num * 58n + BigInt(index);
  }
  const hex = num.toString(16).padStart(2, "0");
  const bytes = hexToBytes(hex.length % 2 ? "0" + hex : hex);
  let leadingZeros = 0;
  for (const char of str) {
    if (char !== "1") break;
    leadingZeros++;
  }
  const result = new Uint8Array(leadingZeros + bytes.length);
  result.set(bytes, leadingZeros);
  return result;
}
function isValidBase58(str) {
  for (const char of str) {
    if (BASE58_ALPHABET.indexOf(char) === -1) {
      return false;
    }
  }
  return true;
}
function base58CheckEncode(payload) {
  const checksum = sha256d(payload).slice(0, 4);
  const data = new Uint8Array(payload.length + 4);
  data.set(payload);
  data.set(checksum, payload.length);
  return base58Encode(data);
}
function base58CheckDecode(str) {
  const data = base58Decode(str);
  if (data.length < 5) {
    throw new Error("Invalid base58check string");
  }
  const payload = data.slice(0, -4);
  const checksum = data.slice(-4);
  const expectedChecksum = sha256d(payload).slice(0, 4);
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== expectedChecksum[i]) {
      throw new Error("Invalid checksum");
    }
  }
  return payload;
}
function isValidBase58Check(str) {
  try {
    base58CheckDecode(str);
    return true;
  } catch {
    return false;
  }
}
var SHA256_K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_H = new Uint32Array([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
function rotr(x, n) {
  return (x >>> n | x << 32 - n) >>> 0;
}
function sha256(data) {
  const bitLength = data.length * 8;
  const paddingLength = (64 - (data.length + 9) % 64) % 64;
  const paddedLength = data.length + 1 + paddingLength + 8;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength, false);
  const h = new Uint32Array(SHA256_H);
  const w = new Uint32Array(64);
  for (let i = 0; i < paddedLength; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ w[j - 15] >>> 3;
      const s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ w[j - 2] >>> 10;
      w[j] = w[j - 16] + s0 + w[j - 7] + s1 >>> 0;
    }
    let a = h[0], b = h[1], c = h[2], d = h[3];
    let e = h[4], f = h[5], g = h[6], hh = h[7];
    for (let j = 0; j < 64; j++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = e & f ^ ~e & g;
      const temp1 = hh + S1 + ch + SHA256_K[j] + w[j] >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = a & b ^ a & c ^ b & c;
      const temp2 = S0 + maj >>> 0;
      hh = g;
      g = f;
      f = e;
      e = d + temp1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = temp1 + temp2 >>> 0;
    }
    h[0] = h[0] + a >>> 0;
    h[1] = h[1] + b >>> 0;
    h[2] = h[2] + c >>> 0;
    h[3] = h[3] + d >>> 0;
    h[4] = h[4] + e >>> 0;
    h[5] = h[5] + f >>> 0;
    h[6] = h[6] + g >>> 0;
    h[7] = h[7] + hh >>> 0;
  }
  const result = new Uint8Array(32);
  const resultView = new DataView(result.buffer);
  for (let i = 0; i < 8; i++) {
    resultView.setUint32(i * 4, h[i], false);
  }
  return result;
}
function sha256d(data) {
  return sha256(sha256(data));
}
function sha256Hex(data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  return bytesToHex(sha256(bytes));
}
var RIPEMD160_RL = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  7,
  4,
  13,
  1,
  10,
  6,
  15,
  3,
  12,
  0,
  9,
  5,
  2,
  14,
  11,
  8,
  3,
  10,
  14,
  4,
  9,
  15,
  8,
  1,
  2,
  7,
  0,
  6,
  13,
  11,
  5,
  12,
  1,
  9,
  11,
  10,
  0,
  8,
  12,
  4,
  13,
  3,
  7,
  15,
  14,
  5,
  6,
  2,
  4,
  0,
  5,
  9,
  7,
  12,
  2,
  10,
  14,
  1,
  3,
  8,
  11,
  6,
  15,
  13
];
var RIPEMD160_RR = [
  5,
  14,
  7,
  0,
  9,
  2,
  11,
  4,
  13,
  6,
  15,
  8,
  1,
  10,
  3,
  12,
  6,
  11,
  3,
  7,
  0,
  13,
  5,
  10,
  14,
  15,
  8,
  12,
  4,
  9,
  1,
  2,
  15,
  5,
  1,
  3,
  7,
  14,
  6,
  9,
  11,
  8,
  12,
  2,
  10,
  0,
  4,
  13,
  8,
  6,
  4,
  1,
  3,
  11,
  15,
  0,
  5,
  12,
  2,
  13,
  9,
  7,
  10,
  14,
  12,
  15,
  10,
  4,
  1,
  5,
  8,
  7,
  6,
  2,
  13,
  14,
  0,
  3,
  9,
  11
];
var RIPEMD160_SL = [
  11,
  14,
  15,
  12,
  5,
  8,
  7,
  9,
  11,
  13,
  14,
  15,
  6,
  7,
  9,
  8,
  7,
  6,
  8,
  13,
  11,
  9,
  7,
  15,
  7,
  12,
  15,
  9,
  11,
  7,
  13,
  12,
  11,
  13,
  6,
  7,
  14,
  9,
  13,
  15,
  14,
  8,
  13,
  6,
  5,
  12,
  7,
  5,
  11,
  12,
  14,
  15,
  14,
  15,
  9,
  8,
  9,
  14,
  5,
  6,
  8,
  6,
  5,
  12,
  9,
  15,
  5,
  11,
  6,
  8,
  13,
  12,
  5,
  12,
  13,
  14,
  11,
  8,
  5,
  6
];
var RIPEMD160_SR = [
  8,
  9,
  9,
  11,
  13,
  15,
  15,
  5,
  7,
  7,
  8,
  11,
  14,
  14,
  12,
  6,
  9,
  13,
  15,
  7,
  12,
  8,
  9,
  11,
  7,
  7,
  12,
  7,
  6,
  15,
  13,
  11,
  9,
  7,
  15,
  11,
  8,
  6,
  6,
  14,
  12,
  13,
  5,
  14,
  13,
  13,
  7,
  5,
  15,
  5,
  8,
  11,
  14,
  14,
  6,
  14,
  6,
  9,
  12,
  9,
  12,
  5,
  15,
  8,
  8,
  5,
  12,
  9,
  12,
  5,
  14,
  6,
  8,
  13,
  6,
  5,
  15,
  13,
  11,
  11
];
function rotl(x, n) {
  return (x << n | x >>> 32 - n) >>> 0;
}
function ripemd160(data) {
  const bitLength = data.length * 8;
  const paddingLength = (64 - (data.length + 9) % 64) % 64;
  const paddedLength = data.length + 1 + paddingLength + 8;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 128;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, bitLength, true);
  let h0 = 1732584193;
  let h1 = 4023233417;
  let h2 = 2562383102;
  let h3 = 271733878;
  let h4 = 3285377520;
  for (let i = 0; i < paddedLength; i += 64) {
    const w = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, true);
    }
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;
    for (let j = 0; j < 80; j++) {
      let fl, kl, fr, kr;
      if (j < 16) {
        fl = bl ^ cl ^ dl;
        kl = 0;
        fr = br ^ (cr | ~dr);
        kr = 1352829926;
      } else if (j < 32) {
        fl = bl & cl | ~bl & dl;
        kl = 1518500249;
        fr = br & dr | cr & ~dr;
        kr = 1548603684;
      } else if (j < 48) {
        fl = (bl | ~cl) ^ dl;
        kl = 1859775393;
        fr = (br | ~cr) ^ dr;
        kr = 1836072691;
      } else if (j < 64) {
        fl = bl & dl | cl & ~dl;
        kl = 2400959708;
        fr = br & cr | ~br & dr;
        kr = 2053994217;
      } else {
        fl = bl ^ (cl | ~dl);
        kl = 2840853838;
        fr = br ^ cr ^ dr;
        kr = 0;
      }
      let t2 = al + fl + w[RIPEMD160_RL[j]] + kl >>> 0;
      t2 = rotl(t2, RIPEMD160_SL[j]) + el >>> 0;
      al = el;
      el = dl;
      dl = rotl(cl, 10);
      cl = bl;
      bl = t2;
      t2 = ar + fr + w[RIPEMD160_RR[j]] + kr >>> 0;
      t2 = rotl(t2, RIPEMD160_SR[j]) + er >>> 0;
      ar = er;
      er = dr;
      dr = rotl(cr, 10);
      cr = br;
      br = t2;
    }
    const t = h1 + cl + dr >>> 0;
    h1 = h2 + dl + er >>> 0;
    h2 = h3 + el + ar >>> 0;
    h3 = h4 + al + br >>> 0;
    h4 = h0 + bl + cr >>> 0;
    h0 = t;
  }
  const result = new Uint8Array(20);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, h0, true);
  resultView.setUint32(4, h1, true);
  resultView.setUint32(8, h2, true);
  resultView.setUint32(12, h3, true);
  resultView.setUint32(16, h4, true);
  return result;
}
function hash160(data) {
  return ripemd160(sha256(data));
}
function hash160Hex(data) {
  const bytes = typeof data === "string" ? hexToBytes(data) : data;
  return bytesToHex(hash160(bytes));
}
function publicKeyToAddress(publicKey, network = "mainnet") {
  const pubKeyBytes = hexToBytes(publicKey);
  const hash = hash160(pubKeyBytes);
  const version = ADDRESS_VERSIONS[network].p2pkh;
  const payload = new Uint8Array(21);
  payload[0] = version;
  payload.set(hash, 1);
  return base58CheckEncode(payload);
}
function addressToHash160(address) {
  const decoded = base58CheckDecode(address);
  return bytesToHex(decoded.slice(1));
}
function isValidAddress(address, network) {
  try {
    const decoded = base58CheckDecode(address);
    if (decoded.length !== 21) return false;
    const version = decoded[0];
    if (network) {
      return version === ADDRESS_VERSIONS[network].p2pkh || version === ADDRESS_VERSIONS[network].p2sh;
    }
    return Object.values(ADDRESS_VERSIONS).some(
      (n) => n.p2pkh === version || n.p2sh === version
    );
  } catch {
    return false;
  }
}
function getAddressType(address) {
  try {
    const decoded = base58CheckDecode(address);
    const version = decoded[0];
    for (const network of Object.values(ADDRESS_VERSIONS)) {
      if (version === network.p2pkh) return "p2pkh";
      if (version === network.p2sh) return "p2sh";
    }
    return null;
  } catch {
    return null;
  }
}
function privateKeyToWIF(privateKey, compressed = true, network = "mainnet") {
  const keyBytes = hexToBytes(privateKey);
  const version = ADDRESS_VERSIONS[network].wif;
  const payload = new Uint8Array(compressed ? 34 : 33);
  payload[0] = version;
  payload.set(keyBytes, 1);
  if (compressed) {
    payload[33] = 1;
  }
  return base58CheckEncode(payload);
}
function wifToPrivateKey(wif) {
  const decoded = base58CheckDecode(wif);
  const version = decoded[0];
  let network;
  if (version === ADDRESS_VERSIONS.mainnet.wif) {
    network = "mainnet";
  } else if (version === ADDRESS_VERSIONS.testnet.wif) {
    network = "testnet";
  } else {
    throw new Error("Invalid WIF version");
  }
  const compressed = decoded.length === 34 && decoded[33] === 1;
  const privateKey = bytesToHex(decoded.slice(1, 33));
  return { privateKey, compressed, network };
}
function isValidWIF(wif) {
  try {
    wifToPrivateKey(wif);
    return true;
  } catch {
    return false;
  }
}
function randomBytes(length) {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}
function randomHex(length) {
  return bytesToHex(randomBytes(length));
}
function generateId(length = 16) {
  const bytes = randomBytes(length);
  return bytesToHex(bytes);
}
function constantTimeCompare(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}
function secureZero(data) {
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ADDRESS_VERSIONS,
  BASE58_ALPHABET,
  HEX_CHARS,
  addressToHash160,
  base58CheckDecode,
  base58CheckEncode,
  base58Decode,
  base58Encode,
  base64Decode,
  base64Encode,
  base64UrlDecode,
  base64UrlEncode,
  bytesToHex,
  constantTimeCompare,
  generateId,
  getAddressType,
  hash160,
  hash160Hex,
  hexToBytes,
  isValidAddress,
  isValidBase58,
  isValidBase58Check,
  isValidHex,
  isValidWIF,
  privateKeyToWIF,
  publicKeyToAddress,
  randomBytes,
  randomHex,
  reverseHex,
  ripemd160,
  secureZero,
  sha256,
  sha256Hex,
  sha256d,
  wifToPrivateKey
});
//# sourceMappingURL=index.cjs.map