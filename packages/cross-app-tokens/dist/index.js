// src/index.ts
var TokenRegistry = class {
  constructor() {
    this.tokens = /* @__PURE__ */ new Map();
    this.appTokens = /* @__PURE__ */ new Map();
    this.verificationCallbacks = /* @__PURE__ */ new Map();
  }
  registerToken(token) {
    this.tokens.set(token.id, token);
    for (const app of token.apps) {
      if (!this.appTokens.has(app.appId)) {
        this.appTokens.set(app.appId, /* @__PURE__ */ new Set());
      }
      this.appTokens.get(app.appId).add(token.id);
    }
  }
  getToken(id) {
    return this.tokens.get(id);
  }
  getTokenBySymbol(symbol, blockchain) {
    for (const token of this.tokens.values()) {
      if (token.symbol.toLowerCase() === symbol.toLowerCase()) {
        if (!blockchain || token.blockchain === blockchain) {
          return token;
        }
      }
    }
    return void 0;
  }
  getTokenByContract(address, blockchain) {
    for (const token of this.tokens.values()) {
      if (token.blockchain === blockchain && token.contractAddress?.toLowerCase() === address.toLowerCase()) {
        return token;
      }
    }
    return void 0;
  }
  getTokensForApp(appId) {
    const tokenIds = this.appTokens.get(appId);
    if (!tokenIds) return [];
    return Array.from(tokenIds).map((id) => this.tokens.get(id)).filter((t) => !!t);
  }
  getTokensByBlockchain(blockchain) {
    return Array.from(this.tokens.values()).filter((t) => t.blockchain === blockchain);
  }
  getVerifiedTokens() {
    return Array.from(this.tokens.values()).filter(
      (t) => t.verification.status === "verified" || t.verification.status === "trusted"
    );
  }
  registerApp(tokenId, app) {
    const token = this.tokens.get(tokenId);
    if (!token) {
      throw new Error(`Token not found: ${tokenId}`);
    }
    const existingIndex = token.apps.findIndex((a) => a.appId === app.appId);
    if (existingIndex >= 0) {
      token.apps[existingIndex] = app;
    } else {
      token.apps.push(app);
    }
    if (!this.appTokens.has(app.appId)) {
      this.appTokens.set(app.appId, /* @__PURE__ */ new Set());
    }
    this.appTokens.get(app.appId).add(tokenId);
    token.updatedAt = /* @__PURE__ */ new Date();
  }
  revokeApp(tokenId, appId) {
    const token = this.tokens.get(tokenId);
    if (!token) return;
    const app = token.apps.find((a) => a.appId === appId);
    if (app) {
      app.status = "revoked";
      token.updatedAt = /* @__PURE__ */ new Date();
    }
  }
  setVerificationCallback(standard, callback) {
    this.verificationCallbacks.set(standard, callback);
  }
  async verifyToken(tokenId) {
    const token = this.tokens.get(tokenId);
    if (!token) return false;
    const callback = this.verificationCallbacks.get(token.standard);
    if (!callback) {
      token.verification.status = "pending";
      token.updatedAt = /* @__PURE__ */ new Date();
      return true;
    }
    try {
      const verified = await callback(token);
      token.verification.status = verified ? "verified" : "unverified";
      token.verification.verifiedAt = verified ? /* @__PURE__ */ new Date() : void 0;
      token.updatedAt = /* @__PURE__ */ new Date();
      return verified;
    } catch {
      token.verification.status = "unverified";
      token.updatedAt = /* @__PURE__ */ new Date();
      return false;
    }
  }
  getAllTokens() {
    return Array.from(this.tokens.values());
  }
  getStats() {
    const tokens = this.getAllTokens();
    const byBlockchain = {};
    const byStandard = {};
    let verified = 0;
    for (const token of tokens) {
      byBlockchain[token.blockchain] = (byBlockchain[token.blockchain] || 0) + 1;
      byStandard[token.standard] = (byStandard[token.standard] || 0) + 1;
      if (token.verification.status === "verified" || token.verification.status === "trusted") {
        verified++;
      }
    }
    return {
      total: tokens.length,
      byBlockchain,
      byStandard,
      verified
    };
  }
};
var PortableTokenManager = class {
  constructor(registry) {
    this.registry = registry;
  }
  createPortableToken(tokenId, holderAddress, amount, sourceApp, signCallback) {
    const token = this.registry.getToken(tokenId);
    if (!token) {
      throw new Error(`Token not found: ${tokenId}`);
    }
    const nonce = this.generateNonce();
    const timestamp = Date.now();
    const message = this.createSignatureMessage(token, holderAddress, amount, nonce, timestamp);
    return signCallback(message).then((signature) => {
      const proof = this.createProof(token, holderAddress, amount, nonce, timestamp, signature);
      return {
        version: "1.0",
        token: {
          id: token.id,
          symbol: token.symbol,
          name: token.name,
          standard: token.standard,
          blockchain: token.blockchain,
          contract: token.contractAddress
        },
        holder: {
          address: holderAddress,
          signature
        },
        amount: amount.toString(),
        nonce,
        timestamp,
        sourceApp,
        proof
      };
    });
  }
  verifyPortableToken(portable) {
    if (portable.version !== "1.0") {
      return false;
    }
    const age = Date.now() - portable.timestamp;
    if (age > 5 * 60 * 1e3) {
      return false;
    }
    const token = this.registry.getToken(portable.token.id);
    if (!token) {
      return false;
    }
    const expectedProof = this.createProof(
      token,
      portable.holder.address,
      BigInt(portable.amount),
      portable.nonce,
      portable.timestamp,
      portable.holder.signature
    );
    return expectedProof === portable.proof;
  }
  importPortableToken(portable, targetApp) {
    if (!this.verifyPortableToken(portable)) {
      return null;
    }
    const token = this.registry.getToken(portable.token.id);
    if (!token) {
      return null;
    }
    const appReg = token.apps.find((a) => a.appId === targetApp);
    if (!appReg || appReg.status !== "active") {
      this.registry.registerApp(token.id, {
        appId: targetApp,
        appName: targetApp,
        domain: targetApp,
        registeredAt: /* @__PURE__ */ new Date(),
        permissions: ["read"],
        status: "active"
      });
    }
    return token;
  }
  generateNonce() {
    const array = new Uint8Array(16);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  createSignatureMessage(token, address, amount, nonce, timestamp) {
    return [
      `Cross-App Token Transfer`,
      `Token: ${token.symbol} (${token.id})`,
      `Amount: ${amount.toString()}`,
      `Holder: ${address}`,
      `Nonce: ${nonce}`,
      `Timestamp: ${timestamp}`
    ].join("\n");
  }
  createProof(token, address, amount, nonce, timestamp, signature) {
    const data = `${token.id}:${address}:${amount}:${nonce}:${timestamp}:${signature}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `proof_${Math.abs(hash).toString(16)}`;
  }
};
function createTokenRegistry() {
  return new TokenRegistry();
}
function createPortableTokenManager(registry) {
  return new PortableTokenManager(registry);
}
function createToken(input) {
  const id = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = /* @__PURE__ */ new Date();
  return {
    id,
    symbol: input.symbol,
    name: input.name,
    standard: input.standard,
    type: input.type,
    blockchain: input.blockchain,
    contractAddress: input.contractAddress,
    inscriptionId: input.inscriptionId,
    decimals: input.decimals ?? (input.type === "fungible" ? 8 : 0),
    totalSupply: input.totalSupply,
    issuer: {
      ...input.issuer,
      verified: false
    },
    metadata: {
      ...input.metadata
    },
    verification: {
      status: "unverified"
    },
    apps: [],
    createdAt: now,
    updatedAt: now
  };
}
function getStandardForBlockchain(blockchain) {
  const standards = {
    bsv: ["bsv-20", "bsv-21", "ordinals"],
    bitcoin: ["brc-20", "ordinals"],
    ethereum: ["erc-20", "erc-721", "erc-1155"],
    solana: ["spl", "metaplex"],
    polygon: ["erc-20", "erc-721", "erc-1155"],
    base: ["erc-20", "erc-721", "erc-1155"]
  };
  return standards[blockchain] || [];
}
function isNFTStandard(standard) {
  return ["erc-721", "erc-1155", "metaplex", "ordinals", "bsv-21"].includes(standard);
}
function isFungibleStandard(standard) {
  return ["bsv-20", "brc-20", "erc-20", "spl"].includes(standard);
}
function formatTokenAmount(amount, decimals) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(decimals, "0");
  const trimmedFraction = fractionStr.replace(/0+$/, "");
  return `${whole}.${trimmedFraction}`;
}
function parseTokenAmount(amount, decimals) {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
function getBlockchainExplorer(blockchain) {
  const explorers = {
    bsv: "https://whatsonchain.com",
    bitcoin: "https://mempool.space",
    ethereum: "https://etherscan.io",
    solana: "https://solscan.io",
    polygon: "https://polygonscan.com",
    base: "https://basescan.org"
  };
  return explorers[blockchain];
}
function getTokenUrl(token) {
  const explorer = getBlockchainExplorer(token.blockchain);
  if (token.contractAddress) {
    if (token.blockchain === "ethereum" || token.blockchain === "polygon" || token.blockchain === "base") {
      return `${explorer}/token/${token.contractAddress}`;
    }
    if (token.blockchain === "solana") {
      return `${explorer}/token/${token.contractAddress}`;
    }
  }
  if (token.inscriptionId) {
    if (token.blockchain === "bsv") {
      return `${explorer}/tx/${token.inscriptionId}`;
    }
    if (token.blockchain === "bitcoin") {
      return `https://ordinals.com/inscription/${token.inscriptionId}`;
    }
  }
  return void 0;
}
export {
  PortableTokenManager,
  TokenRegistry,
  createPortableTokenManager,
  createToken,
  createTokenRegistry,
  formatTokenAmount,
  getBlockchainExplorer,
  getStandardForBlockchain,
  getTokenUrl,
  isFungibleStandard,
  isNFTStandard,
  parseTokenAmount
};
//# sourceMappingURL=index.js.map