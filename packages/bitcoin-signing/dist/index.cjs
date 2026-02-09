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
  BITCOIN_SIGNED_MESSAGE_PREFIX: () => BITCOIN_SIGNED_MESSAGE_PREFIX,
  BSV_SIGNED_MESSAGE_PREFIX: () => BSV_SIGNED_MESSAGE_PREFIX,
  createAuthChallenge: () => createAuthChallenge,
  createSigningRequest: () => createSigningRequest,
  formatAsBitcoinSignedMessage: () => formatAsBitcoinSignedMessage,
  formatMessageForSigning: () => formatMessageForSigning,
  formatSignedMessage: () => formatSignedMessage,
  generateNonce: () => generateNonce,
  getMessageHash: () => getMessageHash,
  parseSignedMessageString: () => parseSignedMessageString,
  verifyAddressFormat: () => verifyAddressFormat,
  verifySignatureFormat: () => verifySignatureFormat
});
module.exports = __toCommonJS(index_exports);
var BITCOIN_SIGNED_MESSAGE_PREFIX = "Bitcoin Signed Message:\n";
var BSV_SIGNED_MESSAGE_PREFIX = "Bitcoin Signed Message:\n";
function generateNonce(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function createSigningRequest(options) {
  const now = /* @__PURE__ */ new Date();
  return {
    message: options.message,
    address: options.address,
    purpose: options.purpose,
    timestamp: now,
    nonce: generateNonce(),
    expiresAt: options.expiresInMs ? new Date(now.getTime() + options.expiresInMs) : void 0
  };
}
function formatMessageForSigning(message, options) {
  let formatted = message;
  if (options?.prefix) {
    formatted = `${options.prefix}${formatted}`;
  }
  if (options?.includeTimestamp) {
    formatted = `${formatted}
Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`;
  }
  if (options?.includeNonce) {
    const nonce = options.nonce || generateNonce();
    formatted = `${formatted}
Nonce: ${nonce}`;
  }
  return formatted;
}
function formatSignedMessage(options) {
  return {
    message: options.message,
    address: options.address,
    signature: options.signature,
    encoding: options.encoding || "base64",
    algorithm: options.algorithm || "ecdsa",
    signedAt: /* @__PURE__ */ new Date(),
    publicKey: options.publicKey
  };
}
function verifySignatureFormat(signature, encoding = "base64") {
  if (!signature || signature.length === 0) {
    return { valid: false, error: "Empty signature" };
  }
  switch (encoding) {
    case "base64":
      if (!/^[A-Za-z0-9+/]+=*$/.test(signature)) {
        return { valid: false, error: "Invalid base64 encoding" };
      }
      if (signature.length < 80 || signature.length > 100) {
        return { valid: false, error: "Unexpected signature length for base64" };
      }
      break;
    case "hex":
      if (!/^[0-9a-fA-F]+$/.test(signature)) {
        return { valid: false, error: "Invalid hex encoding" };
      }
      if (signature.length < 128 || signature.length > 150) {
        return { valid: false, error: "Unexpected signature length for hex" };
      }
      break;
    case "der":
      if (!/^[0-9a-fA-F]+$/.test(signature)) {
        return { valid: false, error: "Invalid DER encoding (should be hex)" };
      }
      if (signature.length < 140 || signature.length > 160) {
        return { valid: false, error: "Unexpected DER signature length" };
      }
      break;
  }
  return { valid: true };
}
function verifyAddressFormat(address) {
  if (!address || address.length === 0) {
    return { valid: false, error: "Empty address" };
  }
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return { valid: true, type: "legacy" };
  }
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return { valid: true, type: "legacy" };
  }
  if (/^bc1q[a-z0-9]{38,58}$/.test(address)) {
    return { valid: true, type: "bech32" };
  }
  if (/^bc1p[a-z0-9]{38,58}$/.test(address)) {
    return { valid: true, type: "bech32m" };
  }
  return { valid: false, error: "Unrecognized address format" };
}
function parseSignedMessageString(signedMessageStr) {
  const lines = signedMessageStr.trim().split("\n");
  let address;
  let message;
  let signature;
  let inMessage = false;
  let messageLines = [];
  for (const line of lines) {
    if (line.startsWith("-----BEGIN BITCOIN SIGNED MESSAGE-----")) {
      inMessage = true;
      continue;
    }
    if (line.startsWith("-----BEGIN SIGNATURE-----")) {
      inMessage = false;
      message = messageLines.join("\n");
      continue;
    }
    if (line.startsWith("-----END BITCOIN SIGNED MESSAGE-----")) {
      continue;
    }
    if (inMessage) {
      messageLines.push(line);
    } else if (!address && line.length > 0 && !line.startsWith("-----")) {
      address = line;
    } else if (address && !signature && line.length > 0 && !line.startsWith("-----")) {
      signature = line;
    }
  }
  if (!address || !message || !signature) {
    return { error: "Could not parse signed message format" };
  }
  return { address, message, signature };
}
function formatAsBitcoinSignedMessage(message, address, signature) {
  return `-----BEGIN BITCOIN SIGNED MESSAGE-----
${message}
-----BEGIN SIGNATURE-----
${address}
${signature}
-----END BITCOIN SIGNED MESSAGE-----`;
}
function getMessageHash(message) {
  const prefixed = `${BSV_SIGNED_MESSAGE_PREFIX}${message}`;
  return `hash:${prefixed.length}:${message.substring(0, 8)}...`;
}
function createAuthChallenge(options) {
  const nonce = generateNonce(32);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const action = options.action || "authenticate";
  const challenge = [
    `${options.domain} wants you to sign in with your Bitcoin address:`,
    options.address,
    "",
    `Action: ${action}`,
    `Nonce: ${nonce}`,
    `Issued At: ${timestamp}`
  ].join("\n");
  const request = createSigningRequest({
    message: challenge,
    address: options.address,
    purpose: action,
    expiresInMs: options.expiresInMs || 5 * 60 * 1e3
    // 5 minutes default
  });
  return { challenge, request };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BITCOIN_SIGNED_MESSAGE_PREFIX,
  BSV_SIGNED_MESSAGE_PREFIX,
  createAuthChallenge,
  createSigningRequest,
  formatAsBitcoinSignedMessage,
  formatMessageForSigning,
  formatSignedMessage,
  generateNonce,
  getMessageHash,
  parseSignedMessageString,
  verifyAddressFormat,
  verifySignatureFormat
});
//# sourceMappingURL=index.cjs.map