// src/index.ts
var BRC100_PROTOCOL = "brc-100";
var BRC100Builder = class {
  /**
   * Create a deploy inscription
   */
  static deploy(options) {
    const inscription = {
      p: BRC100_PROTOCOL,
      op: "deploy",
      tick: options.tick.toLowerCase(),
      max: options.max.toString()
    };
    if (options.lim !== void 0) {
      inscription.lim = options.lim.toString();
    }
    if (options.dec !== void 0) {
      inscription.dec = options.dec.toString();
    }
    if (options.selfMint !== void 0 && options.selfMint > BigInt(0)) {
      inscription.self = options.selfMint.toString();
    }
    if (options.description) {
      inscription.desc = options.description;
    }
    if (options.icon) {
      inscription.icon = options.icon;
    }
    if (options.attributes) {
      inscription.attr = options.attributes;
    }
    return inscription;
  }
  /**
   * Create a mint inscription
   */
  static mint(tick, amount) {
    return {
      p: BRC100_PROTOCOL,
      op: "mint",
      tick: tick.toLowerCase(),
      amt: amount.toString()
    };
  }
  /**
   * Create a transfer inscription
   */
  static transfer(tick, amount, to) {
    const inscription = {
      p: BRC100_PROTOCOL,
      op: "transfer",
      tick: tick.toLowerCase(),
      amt: amount.toString()
    };
    if (to) {
      inscription.to = to;
    }
    return inscription;
  }
  /**
   * Create a burn inscription
   */
  static burn(tick, amount) {
    return {
      p: BRC100_PROTOCOL,
      op: "burn",
      tick: tick.toLowerCase(),
      amt: amount.toString()
    };
  }
  /**
   * Serialize inscription to JSON
   */
  static serialize(inscription) {
    return JSON.stringify(inscription);
  }
  /**
   * Parse inscription from JSON
   */
  static parse(json) {
    try {
      const data = JSON.parse(json);
      if (data.p !== BRC100_PROTOCOL) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }
};
var BRC100TokenManager = class {
  constructor() {
    this.tokens = /* @__PURE__ */ new Map();
    this.balances = /* @__PURE__ */ new Map();
    this.transfers = /* @__PURE__ */ new Map();
    this.events = [];
  }
  /**
   * Deploy a new token
   */
  deployToken(inscription, inscriptionId, deployer, blockHeight) {
    const tick = inscription.tick.toLowerCase();
    if (this.tokens.has(tick)) {
      return null;
    }
    if (tick.length < 4 || tick.length > 5) {
      return null;
    }
    const max = BigInt(inscription.max);
    const lim = inscription.lim ? BigInt(inscription.lim) : max;
    const dec = inscription.dec ? parseInt(inscription.dec) : 18;
    const selfMint = inscription.self ? BigInt(inscription.self) : BigInt(0);
    if (selfMint > max) {
      return null;
    }
    const token = {
      tick,
      max,
      lim,
      dec,
      minted: selfMint,
      burned: BigInt(0),
      holders: selfMint > BigInt(0) ? 1 : 0,
      state: "active",
      deployInscription: inscriptionId,
      deployer,
      deployHeight: blockHeight,
      selfMint,
      description: inscription.desc,
      icon: inscription.icon,
      attributes: inscription.attr || {
        mintable: true,
        burnable: true,
        transferable: true
      },
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.tokens.set(tick, token);
    if (selfMint > BigInt(0)) {
      this.updateBalance(tick, deployer, selfMint, BigInt(0));
    }
    return token;
  }
  /**
   * Mint tokens
   */
  mint(inscription, inscriptionId, minter, blockHeight, txid) {
    const tick = inscription.tick.toLowerCase();
    const token = this.tokens.get(tick);
    if (!token) return false;
    if (token.state !== "active") return false;
    if (!token.attributes.mintable) return false;
    const amount = BigInt(inscription.amt);
    if (amount > token.lim) return false;
    if (token.minted + amount > token.max) return false;
    token.minted += amount;
    token.updatedAt = /* @__PURE__ */ new Date();
    if (token.minted >= token.max) {
      token.state = "completed";
    }
    this.updateBalance(tick, minter, amount, BigInt(0));
    this.events.push({
      type: "mint",
      tick,
      amount,
      to: minter,
      inscriptionId,
      txid,
      blockHeight,
      timestamp: /* @__PURE__ */ new Date()
    });
    return true;
  }
  /**
   * Create a transfer inscription
   */
  inscribeTransfer(inscription, inscriptionId, owner) {
    const tick = inscription.tick.toLowerCase();
    const token = this.tokens.get(tick);
    if (!token) return null;
    if (!token.attributes.transferable) return null;
    const amount = BigInt(inscription.amt);
    const balance = this.getBalance(tick, owner);
    if (!balance || balance.available < amount) return null;
    balance.available -= amount;
    balance.transferable += amount;
    balance.lastUpdated = /* @__PURE__ */ new Date();
    const transfer = {
      inscriptionId,
      tick,
      amount,
      from: owner,
      to: inscription.to,
      status: "inscribed",
      inscribedAt: /* @__PURE__ */ new Date()
    };
    this.transfers.set(inscriptionId, transfer);
    return transfer;
  }
  /**
   * Execute a transfer
   */
  executeTransfer(inscriptionId, recipient, txid, blockHeight) {
    const transfer = this.transfers.get(inscriptionId);
    if (!transfer) return false;
    if (transfer.status !== "inscribed") return false;
    const finalRecipient = transfer.to || recipient;
    const senderBalance = this.getBalance(transfer.tick, transfer.from);
    if (senderBalance) {
      senderBalance.transferable -= transfer.amount;
      senderBalance.total -= transfer.amount;
      senderBalance.lastUpdated = /* @__PURE__ */ new Date();
    }
    this.updateBalance(transfer.tick, finalRecipient, transfer.amount, BigInt(0));
    transfer.status = "transferred";
    transfer.to = finalRecipient;
    transfer.transferredAt = /* @__PURE__ */ new Date();
    this.events.push({
      type: "transfer",
      tick: transfer.tick,
      amount: transfer.amount,
      from: transfer.from,
      to: finalRecipient,
      inscriptionId,
      txid,
      blockHeight,
      timestamp: /* @__PURE__ */ new Date()
    });
    return true;
  }
  /**
   * Burn tokens
   */
  burn(inscription, inscriptionId, owner, txid, blockHeight) {
    const tick = inscription.tick.toLowerCase();
    const token = this.tokens.get(tick);
    if (!token) return false;
    if (!token.attributes.burnable) return false;
    const amount = BigInt(inscription.amt);
    const balance = this.getBalance(tick, owner);
    if (!balance || balance.available < amount) return false;
    balance.available -= amount;
    balance.total -= amount;
    balance.lastUpdated = /* @__PURE__ */ new Date();
    token.burned += amount;
    token.updatedAt = /* @__PURE__ */ new Date();
    this.events.push({
      type: "burn",
      tick,
      amount,
      from: owner,
      inscriptionId,
      txid,
      blockHeight,
      timestamp: /* @__PURE__ */ new Date()
    });
    return true;
  }
  /**
   * Get token info
   */
  getToken(tick) {
    return this.tokens.get(tick.toLowerCase());
  }
  /**
   * Get all tokens
   */
  getAllTokens() {
    return Array.from(this.tokens.values());
  }
  /**
   * Get balance for an address
   */
  getBalance(tick, address) {
    return this.balances.get(tick.toLowerCase())?.get(address);
  }
  /**
   * Get all balances for an address
   */
  getBalances(address) {
    const balances = [];
    for (const tickBalances of this.balances.values()) {
      const balance = tickBalances.get(address);
      if (balance && balance.total > BigInt(0)) {
        balances.push(balance);
      }
    }
    return balances;
  }
  /**
   * Get token events
   */
  getEvents(tick, limit) {
    let events = this.events;
    if (tick) {
      events = events.filter((e) => e.tick === tick.toLowerCase());
    }
    events = events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (limit) {
      events = events.slice(0, limit);
    }
    return events;
  }
  /**
   * Get transfer inscription
   */
  getTransfer(inscriptionId) {
    return this.transfers.get(inscriptionId);
  }
  /**
   * Update balance helper
   */
  updateBalance(tick, address, available, transferable) {
    if (!this.balances.has(tick)) {
      this.balances.set(tick, /* @__PURE__ */ new Map());
    }
    const tickBalances = this.balances.get(tick);
    const existing = tickBalances.get(address);
    if (existing) {
      existing.available += available;
      existing.transferable += transferable;
      existing.total = existing.available + existing.transferable;
      existing.lastUpdated = /* @__PURE__ */ new Date();
    } else {
      tickBalances.set(address, {
        tick,
        address,
        available,
        transferable,
        total: available + transferable,
        lastUpdated: /* @__PURE__ */ new Date()
      });
      const token = this.tokens.get(tick);
      if (token) {
        token.holders++;
      }
    }
  }
};
function createBRC100Manager() {
  return new BRC100TokenManager();
}
function validateTick(tick) {
  if (tick.length < 4) {
    return { valid: false, error: "Tick must be at least 4 characters" };
  }
  if (tick.length > 5) {
    return { valid: false, error: "Tick must be at most 5 characters" };
  }
  if (!/^[a-zA-Z0-9]+$/.test(tick)) {
    return { valid: false, error: "Tick must be alphanumeric" };
  }
  return { valid: true };
}
function formatBRC100Amount(amount, decimals) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(decimals, "0");
  return `${whole}.${fractionStr.replace(/0+$/, "")}`;
}
function parseBRC100Amount(amount, decimals) {
  const [whole, fraction = ""] = amount.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
function calculateMintProgress(token) {
  if (token.max === BigInt(0)) return 100;
  return Number(token.minted * BigInt(1e4) / token.max) / 100;
}
function getCirculatingSupply(token) {
  return token.minted - token.burned;
}
export {
  BRC100Builder,
  BRC100TokenManager,
  BRC100_PROTOCOL,
  calculateMintProgress,
  createBRC100Manager,
  formatBRC100Amount,
  getCirculatingSupply,
  parseBRC100Amount,
  validateTick
};
//# sourceMappingURL=index.js.map