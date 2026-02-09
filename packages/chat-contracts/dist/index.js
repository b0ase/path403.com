// src/index.ts
var DEFAULT_CONTRACT_SETTINGS = {
  allowTips: true,
  tipMinimum: 100n,
  // 100 satoshis
  allowReactions: true,
  paidReactions: false,
  allowAttachments: true,
  attachmentSizeLimit: 10 * 1024 * 1024,
  // 10MB
  contentModeration: true,
  autoUnlock: false
};
var DEFAULT_RATE = {
  model: "per-message",
  amount: 1000n,
  // 1000 satoshis
  currency: "BSV",
  minimumPayment: 100n
};
var ChatContractManager = class {
  constructor() {
    this.contracts = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.payments = /* @__PURE__ */ new Map();
    this.subscriptions = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Set();
  }
  // ==========================================================================
  // Contract Management
  // ==========================================================================
  createContract(creatorId, title, rates = [DEFAULT_RATE], settings) {
    const id = generateContractId();
    const now = /* @__PURE__ */ new Date();
    const contract = {
      id,
      creatorId,
      title,
      rates,
      status: "draft",
      createdAt: now,
      updatedAt: now,
      participants: [
        {
          id: creatorId,
          displayName: "Creator",
          role: "creator",
          joinedAt: now,
          isVerified: false
        }
      ],
      totalEarnings: 0n,
      totalMessages: 0,
      metadata: { settings: { ...DEFAULT_CONTRACT_SETTINGS, ...settings } }
    };
    this.contracts.set(id, contract);
    this.messages.set(id, []);
    this.payments.set(id, []);
    this.emit({ type: "contract_created", contract });
    return contract;
  }
  getContract(contractId) {
    return this.contracts.get(contractId);
  }
  updateContract(contractId, updates) {
    const contract = this.contracts.get(contractId);
    if (!contract) return null;
    const updated = {
      ...contract,
      ...updates,
      id: contract.id,
      creatorId: contract.creatorId,
      createdAt: contract.createdAt,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.contracts.set(contractId, updated);
    this.emit({ type: "contract_updated", contract: updated });
    return updated;
  }
  activateContract(contractId) {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.status !== "draft") return false;
    contract.status = "active";
    contract.updatedAt = /* @__PURE__ */ new Date();
    this.emit({ type: "contract_activated", contract });
    return true;
  }
  pauseContract(contractId) {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.status !== "active") return false;
    contract.status = "paused";
    contract.updatedAt = /* @__PURE__ */ new Date();
    this.emit({ type: "contract_paused", contract });
    return true;
  }
  // ==========================================================================
  // Participant Management
  // ==========================================================================
  addParticipant(contractId, participant) {
    const contract = this.contracts.get(contractId);
    if (!contract) return false;
    const exists = contract.participants.some((p) => p.id === participant.id);
    if (exists) return false;
    contract.participants.push({
      ...participant,
      joinedAt: /* @__PURE__ */ new Date()
    });
    contract.updatedAt = /* @__PURE__ */ new Date();
    this.emit({ type: "participant_joined", contractId, participantId: participant.id });
    return true;
  }
  removeParticipant(contractId, participantId) {
    const contract = this.contracts.get(contractId);
    if (!contract) return false;
    const index = contract.participants.findIndex((p) => p.id === participantId);
    if (index < 0) return false;
    contract.participants.splice(index, 1);
    contract.updatedAt = /* @__PURE__ */ new Date();
    this.emit({ type: "participant_left", contractId, participantId });
    return true;
  }
  // ==========================================================================
  // Message Management
  // ==========================================================================
  async sendMessage(contractId, senderId, content, type = "text", attachments) {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.status !== "active") return null;
    const participant = contract.participants.find((p) => p.id === senderId);
    if (!participant) return null;
    const messageId = generateMessageId();
    const now = /* @__PURE__ */ new Date();
    const payment = await this.calculatePayment(contract, content, type, attachments);
    const isPaid = payment === null || participant.role === "creator";
    const message = {
      id: messageId,
      contractId,
      senderId,
      type,
      content,
      attachments,
      isPaid,
      isLocked: !isPaid,
      createdAt: now
    };
    const messages = this.messages.get(contractId) || [];
    messages.push(message);
    this.messages.set(contractId, messages);
    contract.totalMessages++;
    contract.updatedAt = now;
    this.emit({ type: "message_sent", contractId, message });
    return message;
  }
  async calculatePayment(contract, content, type, attachments) {
    const rate = contract.rates[0];
    if (!rate) return null;
    let amount;
    switch (rate.model) {
      case "per-message":
        amount = rate.amount;
        break;
      case "per-word":
        amount = rate.amount * BigInt(content.split(/\s+/).length);
        break;
      case "per-character":
        amount = rate.amount * BigInt(content.length);
        break;
      default:
        amount = rate.amount;
    }
    if (rate.minimumPayment && amount < rate.minimumPayment) {
      amount = rate.minimumPayment;
    }
    if (rate.maximumPayment && amount > rate.maximumPayment) {
      amount = rate.maximumPayment;
    }
    return {
      id: generatePaymentId(),
      messageId: "",
      contractId: contract.id,
      senderId: "",
      recipientId: contract.creatorId,
      amount,
      currency: rate.currency,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  getMessages(contractId, limit, before) {
    let messages = this.messages.get(contractId) || [];
    if (before) {
      messages = messages.filter((m) => m.createdAt < before);
    }
    if (limit) {
      messages = messages.slice(-limit);
    }
    return messages;
  }
  unlockMessage(contractId, messageId, payment) {
    const messages = this.messages.get(contractId);
    if (!messages) return false;
    const message = messages.find((m) => m.id === messageId);
    if (!message || message.isPaid) return false;
    message.isPaid = true;
    message.isLocked = false;
    message.payment = payment;
    const contract = this.contracts.get(contractId);
    if (contract) {
      contract.totalEarnings += payment.amount;
      contract.updatedAt = /* @__PURE__ */ new Date();
    }
    const payments = this.payments.get(contractId) || [];
    payments.push(payment);
    this.payments.set(contractId, payments);
    this.emit({ type: "message_unlocked", contractId, messageId, payment });
    return true;
  }
  // ==========================================================================
  // Tips and Reactions
  // ==========================================================================
  sendTip(contractId, senderId, recipientId, amount, currency = "BSV", messageId) {
    const payment = {
      id: generatePaymentId(),
      messageId: messageId || "",
      contractId,
      senderId,
      recipientId,
      amount,
      currency,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    const payments = this.payments.get(contractId) || [];
    payments.push(payment);
    this.payments.set(contractId, payments);
    this.emit({ type: "tip_sent", contractId, payment });
    return payment;
  }
  addReaction(contractId, messageId, userId, emoji, tipAmount) {
    const messages = this.messages.get(contractId);
    if (!messages) return false;
    const message = messages.find((m) => m.id === messageId);
    if (!message) return false;
    if (!message.reactions) {
      message.reactions = [];
    }
    message.reactions.push({
      emoji,
      userId,
      tipAmount,
      createdAt: /* @__PURE__ */ new Date()
    });
    this.emit({ type: "reaction_added", contractId, messageId, emoji, userId });
    return true;
  }
  // ==========================================================================
  // Subscriptions
  // ==========================================================================
  createSubscription(userId, contractId, tier) {
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now);
    switch (tier.interval) {
      case "daily":
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case "weekly":
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case "monthly":
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        break;
      case "yearly":
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        break;
    }
    const subscription = {
      id: generateSubscriptionId(),
      userId,
      contractId,
      tierId: tier.id,
      status: "active",
      startedAt: now,
      expiresAt,
      renewsAt: expiresAt,
      paymentHistory: []
    };
    const subs = this.subscriptions.get(userId) || [];
    subs.push(subscription);
    this.subscriptions.set(userId, subs);
    this.emit({ type: "subscription_created", subscription });
    return subscription;
  }
  getUserSubscriptions(userId) {
    return this.subscriptions.get(userId) || [];
  }
  hasActiveSubscription(userId, contractId) {
    const subs = this.subscriptions.get(userId) || [];
    return subs.some(
      (s) => s.contractId === contractId && s.status === "active" && s.expiresAt > /* @__PURE__ */ new Date()
    );
  }
  // ==========================================================================
  // Analytics
  // ==========================================================================
  getEarningsSummary(contractId, period = "all") {
    const contract = this.contracts.get(contractId);
    const payments = this.payments.get(contractId) || [];
    const messages = this.messages.get(contractId) || [];
    const now = /* @__PURE__ */ new Date();
    let startDate;
    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
        break;
      default:
        startDate = /* @__PURE__ */ new Date(0);
    }
    const periodPayments = payments.filter((p) => p.createdAt >= startDate);
    const periodMessages = messages.filter((m) => m.createdAt >= startDate);
    const userTotals = /* @__PURE__ */ new Map();
    for (const payment of periodPayments) {
      const current = userTotals.get(payment.senderId) || 0n;
      userTotals.set(payment.senderId, current + payment.amount);
    }
    const messageBreakdown = {
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
      file: 0,
      link: 0,
      embed: 0,
      reaction: 0,
      system: 0
    };
    for (const message of periodMessages) {
      messageBreakdown[message.type]++;
    }
    return {
      contractId,
      period,
      totalMessages: periodMessages.length,
      paidMessages: periodMessages.filter((m) => m.isPaid).length,
      totalEarnings: periodPayments.reduce((sum, p) => sum + p.amount, 0n),
      currency: contract?.rates[0]?.currency || "BSV",
      topPayingUsers: Array.from(userTotals.entries()).map(([userId, amount]) => ({ userId, amount })).sort((a, b) => b.amount > a.amount ? 1 : -1).slice(0, 10),
      messageBreakdown
    };
  }
  // ==========================================================================
  // Events
  // ==========================================================================
  on(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  emit(event) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
};
function createChatContractManager() {
  return new ChatContractManager();
}
function generateContractId() {
  return `contract_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
function generatePaymentId() {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
function generateSubscriptionId() {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
function formatPaymentAmount(amount, currency) {
  const num = Number(amount);
  switch (currency) {
    case "BSV":
    case "BTC":
      if (num < 1e5) return `${num} sats`;
      return `${(num / 1e8).toFixed(8)} ${currency}`;
    case "ETH":
      return `${(num / 1e18).toFixed(6)} ETH`;
    case "SOL":
      return `${(num / 1e9).toFixed(4)} SOL`;
    case "USD":
    case "GBP":
    case "EUR":
      return `${(num / 100).toFixed(2)} ${currency}`;
    default:
      return `${num} ${currency}`;
  }
}
function calculateWordCount(text) {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}
function calculateCharacterCount(text) {
  return text.length;
}
function estimateMessageCost(content, rate) {
  let amount;
  switch (rate.model) {
    case "per-message":
      amount = rate.amount;
      break;
    case "per-word":
      amount = rate.amount * BigInt(calculateWordCount(content));
      break;
    case "per-character":
      amount = rate.amount * BigInt(calculateCharacterCount(content));
      break;
    default:
      amount = rate.amount;
  }
  if (rate.minimumPayment && amount < rate.minimumPayment) {
    return rate.minimumPayment;
  }
  if (rate.maximumPayment && amount > rate.maximumPayment) {
    return rate.maximumPayment;
  }
  return amount;
}
function isSubscriptionActive(subscription) {
  return subscription.status === "active" && subscription.expiresAt > /* @__PURE__ */ new Date();
}
function getNextRenewalDate(subscription) {
  if (subscription.status !== "active") return null;
  return subscription.renewsAt || null;
}
export {
  ChatContractManager,
  DEFAULT_CONTRACT_SETTINGS,
  DEFAULT_RATE,
  calculateCharacterCount,
  calculateWordCount,
  createChatContractManager,
  estimateMessageCost,
  formatPaymentAmount,
  getNextRenewalDate,
  isSubscriptionActive
};
//# sourceMappingURL=index.js.map