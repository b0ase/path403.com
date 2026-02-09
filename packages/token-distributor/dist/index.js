// src/index.ts
var DEFAULT_SETTINGS = {
  batchSize: 100,
  retryAttempts: 3,
  retryDelay: 5e3,
  minConfirmations: 1,
  allowDuplicates: false,
  validateAddresses: true,
  notifyRecipients: false
};
var TokenDistributor = class {
  constructor() {
    this.distributions = /* @__PURE__ */ new Map();
  }
  /**
   * Set the send callback for executing transfers
   */
  setSendCallback(callback) {
    this.sendCallback = callback;
  }
  /**
   * Create a new distribution
   */
  createDistribution(config, createdBy) {
    const id = this.generateId("dist");
    const settings = { ...DEFAULT_SETTINGS, ...config.settings };
    const recipients = this.calculateAmounts(
      config.recipients,
      config.type,
      config.totalAmount,
      config.tiers
    );
    const distribution = {
      id,
      name: config.name,
      tokenId: config.tokenId,
      tokenSymbol: config.tokenSymbol,
      totalAmount: config.totalAmount,
      distributedAmount: BigInt(0),
      type: config.type,
      status: config.scheduledAt ? "scheduled" : "draft",
      recipients,
      scheduledAt: config.scheduledAt,
      createdBy,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      settings
    };
    this.distributions.set(id, distribution);
    return distribution;
  }
  /**
   * Calculate amounts for each recipient
   */
  calculateAmounts(inputs, type, totalAmount, tiers) {
    const recipients = inputs.map((input) => ({
      id: this.generateId("rcpt"),
      address: input.address,
      email: input.email,
      name: input.name,
      amount: BigInt(0),
      weight: input.weight,
      tier: input.tier,
      status: "pending"
    }));
    switch (type) {
      case "equal": {
        const equalAmount = totalAmount / BigInt(recipients.length);
        for (const r of recipients) {
          r.amount = equalAmount;
        }
        break;
      }
      case "fixed": {
        for (let i = 0; i < recipients.length; i++) {
          recipients[i].amount = inputs[i].amount || BigInt(0);
        }
        break;
      }
      case "weighted": {
        const totalWeight = inputs.reduce((sum, i) => sum + (i.weight || 1), 0);
        for (let i = 0; i < recipients.length; i++) {
          const weight = inputs[i].weight || 1;
          recipients[i].amount = totalAmount * BigInt(Math.floor(weight * 1e3)) / BigInt(Math.floor(totalWeight * 1e3));
        }
        break;
      }
      case "proportional": {
        const totalInputAmount = inputs.reduce(
          (sum, i) => sum + (i.amount || BigInt(0)),
          BigInt(0)
        );
        if (totalInputAmount > BigInt(0)) {
          for (let i = 0; i < recipients.length; i++) {
            const inputAmount = inputs[i].amount || BigInt(0);
            recipients[i].amount = totalAmount * inputAmount / totalInputAmount;
          }
        }
        break;
      }
      case "tiered": {
        if (!tiers) break;
        for (let i = 0; i < recipients.length; i++) {
          const tierName = inputs[i].tier;
          const tier = tiers.find((t) => t.name === tierName);
          if (tier) {
            if (tier.fixedAmount) {
              recipients[i].amount = tier.fixedAmount;
            } else if (tier.percentage) {
              recipients[i].amount = totalAmount * BigInt(Math.floor(tier.percentage * 100)) / BigInt(1e4);
            }
          }
        }
        break;
      }
      case "random": {
        let remaining = totalAmount;
        const shuffled = [...recipients].sort(() => Math.random() - 0.5);
        for (let i = 0; i < shuffled.length - 1; i++) {
          const maxAmount = remaining / BigInt(shuffled.length - i);
          const randomAmount = BigInt(Math.floor(Math.random() * Number(maxAmount * BigInt(2))));
          shuffled[i].amount = randomAmount > remaining ? remaining : randomAmount;
          remaining -= shuffled[i].amount;
        }
        shuffled[shuffled.length - 1].amount = remaining;
        break;
      }
    }
    return recipients;
  }
  /**
   * Start a distribution
   */
  async startDistribution(distributionId) {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) {
      throw new Error(`Distribution not found: ${distributionId}`);
    }
    if (distribution.status !== "draft" && distribution.status !== "scheduled") {
      throw new Error(`Cannot start distribution with status: ${distribution.status}`);
    }
    if (!this.sendCallback) {
      throw new Error("Send callback not configured");
    }
    distribution.status = "processing";
    distribution.startedAt = /* @__PURE__ */ new Date();
    distribution.updatedAt = /* @__PURE__ */ new Date();
    await this.processDistribution(distribution);
  }
  /**
   * Process distribution in batches
   */
  async processDistribution(distribution) {
    const { recipients, settings, tokenId } = distribution;
    const batches = this.createBatches(recipients, settings.batchSize);
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      await this.processBatch(distribution, batch, i);
      if (distribution.status === "cancelled") {
        break;
      }
    }
    const failedCount = recipients.filter((r) => r.status === "failed").length;
    distribution.status = failedCount === recipients.length ? "failed" : "completed";
    distribution.completedAt = /* @__PURE__ */ new Date();
    distribution.updatedAt = /* @__PURE__ */ new Date();
    distribution.distributedAmount = recipients.filter((r) => r.status === "confirmed" || r.status === "sent").reduce((sum, r) => sum + r.amount, BigInt(0));
  }
  /**
   * Process a single batch
   */
  async processBatch(distribution, batch, batchIndex) {
    const result = {
      batchIndex,
      recipients: batch,
      successCount: 0,
      failCount: 0,
      txids: []
    };
    for (const recipient of batch) {
      recipient.status = "processing";
      for (let attempt = 0; attempt < distribution.settings.retryAttempts; attempt++) {
        try {
          const txid = await this.sendCallback(recipient, distribution.tokenId);
          recipient.txid = txid;
          recipient.status = "sent";
          recipient.processedAt = /* @__PURE__ */ new Date();
          result.successCount++;
          result.txids.push(txid);
          break;
        } catch (error) {
          if (attempt === distribution.settings.retryAttempts - 1) {
            recipient.status = "failed";
            recipient.error = error instanceof Error ? error.message : "Unknown error";
            recipient.processedAt = /* @__PURE__ */ new Date();
            result.failCount++;
          } else {
            await this.delay(distribution.settings.retryDelay);
          }
        }
      }
    }
    distribution.updatedAt = /* @__PURE__ */ new Date();
    return result;
  }
  /**
   * Cancel a distribution
   */
  cancelDistribution(distributionId) {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) {
      throw new Error(`Distribution not found: ${distributionId}`);
    }
    if (distribution.status === "completed" || distribution.status === "failed") {
      throw new Error("Cannot cancel completed distribution");
    }
    distribution.status = "cancelled";
    distribution.updatedAt = /* @__PURE__ */ new Date();
  }
  /**
   * Get distribution by ID
   */
  getDistribution(distributionId) {
    return this.distributions.get(distributionId);
  }
  /**
   * Get distribution progress
   */
  getProgress(distributionId) {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) return void 0;
    const { recipients } = distribution;
    const total = recipients.length;
    const pending = recipients.filter((r) => r.status === "pending").length;
    const processing = recipients.filter((r) => r.status === "processing").length;
    const sent = recipients.filter((r) => r.status === "sent").length;
    const confirmed = recipients.filter((r) => r.status === "confirmed").length;
    const failed = recipients.filter((r) => r.status === "failed").length;
    const completed = sent + confirmed;
    const percentage = total > 0 ? completed / total * 100 : 0;
    return { total, pending, processing, sent, confirmed, failed, percentage };
  }
  /**
   * Get all distributions
   */
  getAllDistributions() {
    return Array.from(this.distributions.values());
  }
  /**
   * Get distribution summary
   */
  getSummary(distributionId) {
    const distribution = this.distributions.get(distributionId);
    if (!distribution) return void 0;
    const progress = this.getProgress(distributionId);
    return {
      id: distribution.id,
      name: distribution.name,
      status: distribution.status,
      tokenSymbol: distribution.tokenSymbol,
      totalAmount: distribution.totalAmount.toString(),
      recipientCount: distribution.recipients.length,
      progress,
      createdAt: distribution.createdAt,
      completedAt: distribution.completedAt
    };
  }
  /**
   * Create batches from recipients
   */
  createBatches(recipients, batchSize) {
    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }
    return batches;
  }
  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Generate unique ID
   */
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
};
function createTokenDistributor() {
  return new TokenDistributor();
}
function validateAddress(address, blockchain) {
  if (!address || address.length < 10) return false;
  if (blockchain === "bsv" || blockchain === "bitcoin") {
    return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  }
  if (blockchain === "ethereum" || blockchain === "evm") {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  if (blockchain === "solana") {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }
  return true;
}
function formatDistributionAmount(amount, decimals = 8) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === BigInt(0)) {
    return whole.toString();
  }
  const fractionStr = fraction.toString().padStart(decimals, "0");
  return `${whole}.${fractionStr.replace(/0+$/, "")}`;
}
function parseCSVRecipients(csv) {
  const lines = csv.trim().split("\n");
  const recipients = [];
  for (const line of lines) {
    const parts = line.split(",").map((p) => p.trim());
    if (parts.length >= 1 && parts[0]) {
      recipients.push({
        address: parts[0],
        amount: parts[1] ? BigInt(parts[1]) : void 0,
        email: parts[2] || void 0,
        name: parts[3] || void 0
      });
    }
  }
  return recipients;
}
function exportRecipientsCSV(recipients) {
  const header = "address,amount,status,txid,error";
  const lines = recipients.map(
    (r) => `${r.address},${r.amount.toString()},${r.status},${r.txid || ""},${r.error || ""}`
  );
  return [header, ...lines].join("\n");
}
export {
  DEFAULT_SETTINGS,
  TokenDistributor,
  createTokenDistributor,
  exportRecipientsCSV,
  formatDistributionAmount,
  parseCSVRecipients,
  validateAddress
};
//# sourceMappingURL=index.js.map