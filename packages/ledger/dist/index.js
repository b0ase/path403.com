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
  Ledger: () => Ledger,
  createLedger: () => createLedger
});
module.exports = __toCommonJS(index_exports);

// src/ledger.ts
var Ledger = class {
  constructor(config) {
    this.prisma = config.prisma;
    this.config = config;
  }
  // ============================================================================
  // Token Operations
  // ============================================================================
  /**
   * Get a token by ID or ticker
   */
  async getToken(idOrTicker) {
    const token = await this.prisma.venture_tokens.findFirst({
      where: {
        OR: [{ id: idOrTicker }, { ticker: idOrTicker }]
      }
    });
    if (!token) return null;
    return this.mapToken(token);
  }
  /**
   * Get all tokens
   */
  async getTokens(options) {
    const tokens = await this.prisma.venture_tokens.findMany({
      where: options?.activeOnly ? { is_active: true } : void 0,
      orderBy: { ticker: "asc" }
    });
    return tokens.map(this.mapToken);
  }
  /**
   * Register a new token
   */
  async registerToken(data) {
    const token = await this.prisma.venture_tokens.create({
      data: {
        ticker: data.ticker,
        name: data.name,
        description: data.description,
        total_supply: data.totalSupply || 1000000000n,
        price_usd: data.priceUsd || 0.01,
        blockchain: data.blockchain || this.config.defaultBlockchain || "BSV",
        portfolio_slug: data.portfolioSlug,
        tokens_available: data.totalSupply || 1000000000n
      }
    });
    return this.mapToken(token);
  }
  // ============================================================================
  // Balance Operations
  // ============================================================================
  /**
   * Get a user's balance for a specific token
   */
  async getBalance(userId, tokenId) {
    const balance = await this.prisma.user_token_balances.findUnique({
      where: {
        user_id_token_id: {
          user_id: userId,
          token_id: tokenId
        }
      },
      include: {
        venture_token: true
      }
    });
    if (!balance) return null;
    return this.mapBalance(balance);
  }
  /**
   * Get all balances for a user
   */
  async getBalances(userId) {
    const balances = await this.prisma.user_token_balances.findMany({
      where: { user_id: userId },
      include: { venture_token: true }
    });
    return balances.map(this.mapBalance);
  }
  /**
   * Get user's full portfolio with USD/GBP values
   */
  async getPortfolio(userId) {
    const balances = await this.getBalances(userId);
    let totalValueUsd = 0;
    for (const balance of balances) {
      const token = await this.getToken(balance.tokenId);
      if (token) {
        const tokenRecord = await this.prisma.venture_tokens.findUnique({
          where: { id: balance.tokenId }
        });
        if (tokenRecord?.price_usd) {
          const value = Number(balance.balance) * Number(tokenRecord.price_usd) / Math.pow(10, 8);
          totalValueUsd += value;
        }
      }
    }
    return {
      userId,
      balances,
      totalValueUsd,
      totalValueGbp: totalValueUsd * 0.79,
      // Approximate conversion
      lastUpdated: /* @__PURE__ */ new Date()
    };
  }
  /**
   * Get all holders of a token
   */
  async getHolders(query) {
    const balances = await this.prisma.user_token_balances.findMany({
      where: {
        token_id: query.tokenId,
        balance: query.minBalance ? { gte: query.minBalance } : { gt: 0 }
      },
      include: { venture_token: true },
      orderBy: { balance: "desc" },
      take: query.limit || 100,
      skip: query.offset || 0
    });
    return balances.map(this.mapBalance);
  }
  // ============================================================================
  // Transaction Operations
  // ============================================================================
  /**
   * Record a generic transaction
   */
  async recordTransaction(input) {
    return await this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.token_transactions.create({
        data: {
          from_address: input.fromAddress,
          to_address: input.toAddress,
          from_shareholder_id: input.fromUserId,
          to_shareholder_id: input.toUserId,
          token_amount: input.amount,
          transaction_type: input.type,
          transaction_hash: input.txid,
          purpose: input.notes,
          notes: JSON.stringify(input.metadata),
          is_verified: input.txid ? false : true
        }
      });
      await this.updateBalances(tx, input);
      return this.mapTransaction(txRecord, input);
    });
  }
  /**
   * Record a token purchase
   */
  async recordPurchase(input) {
    return await this.prisma.$transaction(async (tx) => {
      const purchase = await tx.token_purchases.create({
        data: {
          user_id: input.userId,
          token_id: input.tokenId,
          token_amount: input.tokenAmount,
          usd_amount: input.usdAmount,
          price_per_token: input.pricePerToken,
          payment_method: input.paymentMethod,
          payment_currency: input.paymentCurrency || "USD",
          payment_amount: input.paymentAmount || input.usdAmount,
          stripe_session_id: input.stripeSessionId,
          crypto_txid: input.cryptoTxid,
          status: "confirmed",
          confirmed_at: /* @__PURE__ */ new Date(),
          notes: input.notes
        }
      });
      await this.creditBalance(tx, input.userId, input.tokenId, input.tokenAmount, {
        type: "purchased",
        investedUsd: input.usdAmount,
        price: input.pricePerToken
      });
      await tx.venture_tokens.update({
        where: { id: input.tokenId },
        data: {
          tokens_sold: { increment: input.tokenAmount },
          tokens_available: { decrement: input.tokenAmount },
          treasury_balance: { increment: input.usdAmount }
        }
      });
      return {
        id: purchase.id,
        userId: input.userId,
        tokenId: input.tokenId,
        ticker: "",
        type: "purchase",
        amount: input.tokenAmount,
        priceUsd: input.pricePerToken,
        valueUsd: input.usdAmount,
        paymentMethod: input.paymentMethod,
        paymentAmount: input.paymentAmount || input.usdAmount,
        paymentCurrency: input.paymentCurrency || "USD",
        stripeSessionId: input.stripeSessionId,
        status: "confirmed",
        createdAt: purchase.created_at,
        confirmedAt: purchase.confirmed_at
      };
    });
  }
  /**
   * Transfer tokens between users
   */
  async transfer(input) {
    return await this.prisma.$transaction(async (tx) => {
      const senderBalance = await tx.user_token_balances.findUnique({
        where: {
          user_id_token_id: {
            user_id: input.fromUserId,
            token_id: input.tokenId
          }
        }
      });
      if (!senderBalance || senderBalance.balance < input.amount) {
        throw new Error("Insufficient balance");
      }
      await this.debitBalance(tx, input.fromUserId, input.tokenId, input.amount, {
        type: "sent"
      });
      await this.creditBalance(tx, input.toUserId, input.tokenId, input.amount, {
        type: "received"
      });
      const txRecord = await tx.token_transactions.create({
        data: {
          from_shareholder_id: input.fromUserId,
          to_shareholder_id: input.toUserId,
          token_amount: input.amount,
          transaction_type: "transfer",
          purpose: input.notes,
          is_verified: true
        }
      });
      return this.mapTransaction(txRecord, {
        userId: input.fromUserId,
        tokenId: input.tokenId,
        type: "transfer_out",
        amount: input.amount,
        toUserId: input.toUserId
      });
    });
  }
  /**
   * Request a withdrawal to on-chain wallet
   */
  async requestWithdrawal(input) {
    const balance = await this.getBalance(input.userId, input.tokenId);
    if (!balance || balance.availableBalance < input.amount) {
      throw new Error("Insufficient available balance");
    }
    const token = await this.getToken(input.tokenId);
    if (!token) {
      throw new Error("Token not found");
    }
    const withdrawal = await this.prisma.withdrawal_requests.create({
      data: {
        user_id: input.userId,
        token_id: input.tokenId,
        amount: input.amount,
        destination: input.destination,
        blockchain: input.blockchain || token.blockchain,
        status: "pending",
        notes: input.notes
      }
    });
    return {
      id: withdrawal.id,
      userId: withdrawal.user_id,
      tokenId: withdrawal.token_id,
      ticker: token.ticker,
      amount: BigInt(withdrawal.amount),
      destination: withdrawal.destination,
      blockchain: withdrawal.blockchain,
      status: withdrawal.status,
      createdAt: withdrawal.created_at
    };
  }
  /**
   * Get transaction history
   */
  async getTransactions(query) {
    const where = {};
    if (query.userId) {
      where.OR = [
        { from_shareholder_id: query.userId },
        { to_shareholder_id: query.userId }
      ];
    }
    if (query.type) {
      where.transaction_type = Array.isArray(query.type) ? { in: query.type } : query.type;
    }
    if (query.fromDate || query.toDate) {
      where.created_at = {};
      if (query.fromDate) where.created_at.gte = query.fromDate;
      if (query.toDate) where.created_at.lte = query.toDate;
    }
    const transactions = await this.prisma.token_transactions.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: query.limit || 50,
      skip: query.offset || 0
    });
    return transactions.map(
      (tx) => this.mapTransaction(tx, {
        userId: query.userId || "",
        tokenId: "",
        type: tx.transaction_type,
        amount: BigInt(tx.token_amount)
      })
    );
  }
  // ============================================================================
  // Dividend Operations
  // ============================================================================
  /**
   * Get pending dividends for a user
   */
  async getPendingDividends(userId) {
    const shareholders = await this.prisma.cap_table_shareholders.findMany({
      where: {
        OR: [{ email: userId }, { profiles: { id: userId } }]
      }
    });
    if (shareholders.length === 0) return [];
    const shareholderIds = shareholders.map((s) => s.id);
    const payments = await this.prisma.dividend_payments.findMany({
      where: {
        shareholder_id: { in: shareholderIds },
        status: "pending"
      },
      include: {
        dividend_distributions: true
      }
    });
    return payments.map((p) => ({
      id: p.id,
      distributionId: p.distribution_id,
      userId,
      eligibleTokens: BigInt(p.eligible_tokens),
      paymentAmount: Number(p.payment_amount),
      currency: p.currency,
      status: p.status
    }));
  }
  // ============================================================================
  // Private Helpers
  // ============================================================================
  async creditBalance(tx, userId, tokenId, amount, options) {
    await tx.user_token_balances.upsert({
      where: {
        user_id_token_id: {
          user_id: userId,
          token_id: tokenId
        }
      },
      create: {
        user_id: userId,
        token_id: tokenId,
        balance: amount,
        total_purchased: options.type === "purchased" ? amount : 0n,
        total_received: options.type === "received" ? amount : 0n,
        total_invested_usd: options.investedUsd || 0,
        average_buy_price: options.price || 0
      },
      update: {
        balance: { increment: amount },
        total_purchased: options.type === "purchased" ? { increment: amount } : void 0,
        total_received: options.type === "received" ? { increment: amount } : void 0,
        total_invested_usd: options.investedUsd ? { increment: options.investedUsd } : void 0
      }
    });
  }
  async debitBalance(tx, userId, tokenId, amount, options) {
    await tx.user_token_balances.update({
      where: {
        user_id_token_id: {
          user_id: userId,
          token_id: tokenId
        }
      },
      data: {
        balance: { decrement: amount },
        total_sent: options.type === "sent" ? { increment: amount } : void 0,
        total_withdrawn: options.type === "withdrawn" ? { increment: amount } : void 0
      }
    });
  }
  async updateBalances(tx, input) {
    const { userId, tokenId, type, amount, fromUserId, toUserId } = input;
    switch (type) {
      case "purchase":
      case "deposit":
      case "airdrop":
      case "mint":
        await this.creditBalance(tx, userId, tokenId, amount, {
          type: type === "purchase" ? "purchased" : "received"
        });
        break;
      case "sale":
      case "withdrawal":
      case "burn":
        await this.debitBalance(tx, userId, tokenId, amount, {
          type: type === "withdrawal" ? "withdrawn" : "sent"
        });
        break;
      case "transfer_in":
        await this.creditBalance(tx, userId, tokenId, amount, { type: "received" });
        break;
      case "transfer_out":
        await this.debitBalance(tx, userId, tokenId, amount, { type: "sent" });
        break;
    }
  }
  mapToken(record) {
    return {
      id: record.id,
      ticker: record.ticker,
      name: record.name,
      description: record.description,
      standard: record.blockchain === "BSV" ? "1sat" : "internal",
      type: "fungible",
      totalSupply: BigInt(record.total_supply || 0),
      decimals: 8,
      blockchain: record.blockchain || "BSV",
      deployTxid: record.deploy_txid,
      isDeployed: record.is_deployed || false
    };
  }
  mapBalance(record) {
    const balance = BigInt(record.balance || 0);
    return {
      userId: record.user_id,
      tokenId: record.token_id,
      ticker: record.venture_token?.ticker || "",
      balance,
      pendingIn: 0n,
      pendingOut: 0n,
      availableBalance: balance,
      totalPurchased: BigInt(record.total_purchased || 0),
      totalReceived: BigInt(record.total_received || 0),
      totalSent: BigInt(record.total_sent || 0),
      totalWithdrawn: BigInt(record.total_withdrawn || 0),
      averageBuyPrice: record.average_buy_price ? Number(record.average_buy_price) : void 0,
      totalInvestedUsd: record.total_invested_usd ? Number(record.total_invested_usd) : void 0
    };
  }
  mapTransaction(record, input) {
    return {
      id: record.id,
      userId: input.userId || record.from_shareholder_id || record.to_shareholder_id,
      tokenId: input.tokenId || "",
      ticker: "",
      type: record.transaction_type || input.type,
      amount: BigInt(record.token_amount || input.amount || 0),
      txid: record.transaction_hash,
      blockHeight: record.block_number ? Number(record.block_number) : void 0,
      fromAddress: record.from_address,
      toAddress: record.to_address,
      fromUserId: record.from_shareholder_id,
      toUserId: record.to_shareholder_id,
      status: record.is_verified ? "confirmed" : "pending",
      notes: record.purpose,
      createdAt: record.created_at,
      confirmedAt: record.verified_at
    };
  }
};
function createLedger(config) {
  return new Ledger(config);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Ledger,
  createLedger
});
