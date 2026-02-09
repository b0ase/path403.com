/**
 * @b0ase/chat-contracts
 *
 * Chat payment contracts and message monetization utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Payment model */
export type PaymentModel =
  | 'per-message'
  | 'per-word'
  | 'per-character'
  | 'per-minute'
  | 'subscription'
  | 'tip'
  | 'unlock';

/** Contract status */
export type ContractStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'expired'
  | 'cancelled';

/** Message type */
export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'link'
  | 'embed'
  | 'reaction'
  | 'system';

/** Payment status */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

/** Currency type */
export type Currency =
  | 'BSV'
  | 'BTC'
  | 'ETH'
  | 'SOL'
  | 'USDT'
  | 'USDC'
  | 'USD'
  | 'GBP'
  | 'EUR';

/** Participant role */
export type ParticipantRole =
  | 'creator'
  | 'recipient'
  | 'moderator'
  | 'subscriber'
  | 'viewer';

/** Chat participant */
export interface ChatParticipant {
  id: string;
  walletAddress?: string;
  displayName: string;
  avatar?: string;
  role: ParticipantRole;
  joinedAt: Date;
  isVerified: boolean;
}

/** Rate structure */
export interface RateStructure {
  model: PaymentModel;
  amount: bigint;
  currency: Currency;
  minimumPayment?: bigint;
  maximumPayment?: bigint;
  freeAllowance?: number;
}

/** Chat contract */
export interface ChatContract {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  rates: RateStructure[];
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  participants: ChatParticipant[];
  totalEarnings: bigint;
  totalMessages: number;
  metadata?: Record<string, unknown>;
}

/** Message payment */
export interface MessagePayment {
  id: string;
  messageId: string;
  contractId: string;
  senderId: string;
  recipientId: string;
  amount: bigint;
  currency: Currency;
  status: PaymentStatus;
  txid?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

/** Chat message */
export interface ChatMessage {
  id: string;
  contractId: string;
  senderId: string;
  type: MessageType;
  content: string;
  attachments?: MessageAttachment[];
  payment?: MessagePayment;
  isPaid: boolean;
  isLocked: boolean;
  createdAt: Date;
  editedAt?: Date;
  reactions?: MessageReaction[];
}

/** Message attachment */
export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
  unlockPrice?: bigint;
}

/** Message reaction */
export interface MessageReaction {
  emoji: string;
  userId: string;
  tipAmount?: bigint;
  createdAt: Date;
}

/** Subscription tier */
export interface SubscriptionTier {
  id: string;
  name: string;
  price: bigint;
  currency: Currency;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  benefits: string[];
  maxMessages?: number;
  prioritySupport: boolean;
}

/** User subscription */
export interface UserSubscription {
  id: string;
  userId: string;
  contractId: string;
  tierId: string;
  status: 'active' | 'cancelled' | 'expired';
  startedAt: Date;
  expiresAt: Date;
  renewsAt?: Date;
  paymentHistory: MessagePayment[];
}

/** Earnings summary */
export interface EarningsSummary {
  contractId: string;
  period: 'day' | 'week' | 'month' | 'all';
  totalMessages: number;
  paidMessages: number;
  totalEarnings: bigint;
  currency: Currency;
  topPayingUsers: Array<{ userId: string; amount: bigint }>;
  messageBreakdown: Record<MessageType, number>;
}

/** Contract settings */
export interface ContractSettings {
  allowTips: boolean;
  tipMinimum?: bigint;
  tipMaximum?: bigint;
  allowReactions: boolean;
  paidReactions: boolean;
  reactionPrice?: bigint;
  allowAttachments: boolean;
  attachmentSizeLimit: number;
  contentModeration: boolean;
  autoUnlock: boolean;
  unlockDelay?: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONTRACT_SETTINGS: ContractSettings = {
  allowTips: true,
  tipMinimum: 100n, // 100 satoshis
  allowReactions: true,
  paidReactions: false,
  allowAttachments: true,
  attachmentSizeLimit: 10 * 1024 * 1024, // 10MB
  contentModeration: true,
  autoUnlock: false,
};

export const DEFAULT_RATE: RateStructure = {
  model: 'per-message',
  amount: 1000n, // 1000 satoshis
  currency: 'BSV',
  minimumPayment: 100n,
};

// ============================================================================
// Chat Contract Manager
// ============================================================================

export class ChatContractManager {
  private contracts: Map<string, ChatContract> = new Map();
  private messages: Map<string, ChatMessage[]> = new Map();
  private payments: Map<string, MessagePayment[]> = new Map();
  private subscriptions: Map<string, UserSubscription[]> = new Map();
  private listeners: Set<(event: ContractEvent) => void> = new Set();

  // ==========================================================================
  // Contract Management
  // ==========================================================================

  createContract(
    creatorId: string,
    title: string,
    rates: RateStructure[] = [DEFAULT_RATE],
    settings?: Partial<ContractSettings>
  ): ChatContract {
    const id = generateContractId();
    const now = new Date();

    const contract: ChatContract = {
      id,
      creatorId,
      title,
      rates,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      participants: [
        {
          id: creatorId,
          displayName: 'Creator',
          role: 'creator',
          joinedAt: now,
          isVerified: false,
        },
      ],
      totalEarnings: 0n,
      totalMessages: 0,
      metadata: { settings: { ...DEFAULT_CONTRACT_SETTINGS, ...settings } },
    };

    this.contracts.set(id, contract);
    this.messages.set(id, []);
    this.payments.set(id, []);
    this.emit({ type: 'contract_created', contract });

    return contract;
  }

  getContract(contractId: string): ChatContract | undefined {
    return this.contracts.get(contractId);
  }

  updateContract(contractId: string, updates: Partial<ChatContract>): ChatContract | null {
    const contract = this.contracts.get(contractId);
    if (!contract) return null;

    const updated: ChatContract = {
      ...contract,
      ...updates,
      id: contract.id,
      creatorId: contract.creatorId,
      createdAt: contract.createdAt,
      updatedAt: new Date(),
    };

    this.contracts.set(contractId, updated);
    this.emit({ type: 'contract_updated', contract: updated });

    return updated;
  }

  activateContract(contractId: string): boolean {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.status !== 'draft') return false;

    contract.status = 'active';
    contract.updatedAt = new Date();
    this.emit({ type: 'contract_activated', contract });

    return true;
  }

  pauseContract(contractId: string): boolean {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.status !== 'active') return false;

    contract.status = 'paused';
    contract.updatedAt = new Date();
    this.emit({ type: 'contract_paused', contract });

    return true;
  }

  // ==========================================================================
  // Participant Management
  // ==========================================================================

  addParticipant(contractId: string, participant: Omit<ChatParticipant, 'joinedAt'>): boolean {
    const contract = this.contracts.get(contractId);
    if (!contract) return false;

    const exists = contract.participants.some(p => p.id === participant.id);
    if (exists) return false;

    contract.participants.push({
      ...participant,
      joinedAt: new Date(),
    });
    contract.updatedAt = new Date();

    this.emit({ type: 'participant_joined', contractId, participantId: participant.id });
    return true;
  }

  removeParticipant(contractId: string, participantId: string): boolean {
    const contract = this.contracts.get(contractId);
    if (!contract) return false;

    const index = contract.participants.findIndex(p => p.id === participantId);
    if (index < 0) return false;

    contract.participants.splice(index, 1);
    contract.updatedAt = new Date();

    this.emit({ type: 'participant_left', contractId, participantId });
    return true;
  }

  // ==========================================================================
  // Message Management
  // ==========================================================================

  async sendMessage(
    contractId: string,
    senderId: string,
    content: string,
    type: MessageType = 'text',
    attachments?: MessageAttachment[]
  ): Promise<ChatMessage | null> {
    const contract = this.contracts.get(contractId);
    if (!contract || contract.status !== 'active') return null;

    const participant = contract.participants.find(p => p.id === senderId);
    if (!participant) return null;

    const messageId = generateMessageId();
    const now = new Date();

    // Calculate payment required
    const payment = await this.calculatePayment(contract, content, type, attachments);
    const isPaid = payment === null || participant.role === 'creator';

    const message: ChatMessage = {
      id: messageId,
      contractId,
      senderId,
      type,
      content,
      attachments,
      isPaid,
      isLocked: !isPaid,
      createdAt: now,
    };

    // Store message
    const messages = this.messages.get(contractId) || [];
    messages.push(message);
    this.messages.set(contractId, messages);

    // Update contract stats
    contract.totalMessages++;
    contract.updatedAt = now;

    this.emit({ type: 'message_sent', contractId, message });
    return message;
  }

  private async calculatePayment(
    contract: ChatContract,
    content: string,
    type: MessageType,
    attachments?: MessageAttachment[]
  ): Promise<MessagePayment | null> {
    const rate = contract.rates[0];
    if (!rate) return null;

    let amount: bigint;

    switch (rate.model) {
      case 'per-message':
        amount = rate.amount;
        break;
      case 'per-word':
        amount = rate.amount * BigInt(content.split(/\s+/).length);
        break;
      case 'per-character':
        amount = rate.amount * BigInt(content.length);
        break;
      default:
        amount = rate.amount;
    }

    // Apply minimum
    if (rate.minimumPayment && amount < rate.minimumPayment) {
      amount = rate.minimumPayment;
    }

    // Apply maximum
    if (rate.maximumPayment && amount > rate.maximumPayment) {
      amount = rate.maximumPayment;
    }

    return {
      id: generatePaymentId(),
      messageId: '',
      contractId: contract.id,
      senderId: '',
      recipientId: contract.creatorId,
      amount,
      currency: rate.currency,
      status: 'pending',
      createdAt: new Date(),
    };
  }

  getMessages(contractId: string, limit?: number, before?: Date): ChatMessage[] {
    let messages = this.messages.get(contractId) || [];

    if (before) {
      messages = messages.filter(m => m.createdAt < before);
    }

    if (limit) {
      messages = messages.slice(-limit);
    }

    return messages;
  }

  unlockMessage(contractId: string, messageId: string, payment: MessagePayment): boolean {
    const messages = this.messages.get(contractId);
    if (!messages) return false;

    const message = messages.find(m => m.id === messageId);
    if (!message || message.isPaid) return false;

    message.isPaid = true;
    message.isLocked = false;
    message.payment = payment;

    // Update earnings
    const contract = this.contracts.get(contractId);
    if (contract) {
      contract.totalEarnings += payment.amount;
      contract.updatedAt = new Date();
    }

    // Store payment
    const payments = this.payments.get(contractId) || [];
    payments.push(payment);
    this.payments.set(contractId, payments);

    this.emit({ type: 'message_unlocked', contractId, messageId, payment });
    return true;
  }

  // ==========================================================================
  // Tips and Reactions
  // ==========================================================================

  sendTip(
    contractId: string,
    senderId: string,
    recipientId: string,
    amount: bigint,
    currency: Currency = 'BSV',
    messageId?: string
  ): MessagePayment {
    const payment: MessagePayment = {
      id: generatePaymentId(),
      messageId: messageId || '',
      contractId,
      senderId,
      recipientId,
      amount,
      currency,
      status: 'pending',
      createdAt: new Date(),
    };

    const payments = this.payments.get(contractId) || [];
    payments.push(payment);
    this.payments.set(contractId, payments);

    this.emit({ type: 'tip_sent', contractId, payment });
    return payment;
  }

  addReaction(
    contractId: string,
    messageId: string,
    userId: string,
    emoji: string,
    tipAmount?: bigint
  ): boolean {
    const messages = this.messages.get(contractId);
    if (!messages) return false;

    const message = messages.find(m => m.id === messageId);
    if (!message) return false;

    if (!message.reactions) {
      message.reactions = [];
    }

    message.reactions.push({
      emoji,
      userId,
      tipAmount,
      createdAt: new Date(),
    });

    this.emit({ type: 'reaction_added', contractId, messageId, emoji, userId });
    return true;
  }

  // ==========================================================================
  // Subscriptions
  // ==========================================================================

  createSubscription(
    userId: string,
    contractId: string,
    tier: SubscriptionTier
  ): UserSubscription {
    const now = new Date();
    const expiresAt = new Date(now);

    switch (tier.interval) {
      case 'daily':
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case 'weekly':
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      case 'monthly':
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        break;
      case 'yearly':
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        break;
    }

    const subscription: UserSubscription = {
      id: generateSubscriptionId(),
      userId,
      contractId,
      tierId: tier.id,
      status: 'active',
      startedAt: now,
      expiresAt,
      renewsAt: expiresAt,
      paymentHistory: [],
    };

    const subs = this.subscriptions.get(userId) || [];
    subs.push(subscription);
    this.subscriptions.set(userId, subs);

    this.emit({ type: 'subscription_created', subscription });
    return subscription;
  }

  getUserSubscriptions(userId: string): UserSubscription[] {
    return this.subscriptions.get(userId) || [];
  }

  hasActiveSubscription(userId: string, contractId: string): boolean {
    const subs = this.subscriptions.get(userId) || [];
    return subs.some(
      s =>
        s.contractId === contractId &&
        s.status === 'active' &&
        s.expiresAt > new Date()
    );
  }

  // ==========================================================================
  // Analytics
  // ==========================================================================

  getEarningsSummary(
    contractId: string,
    period: 'day' | 'week' | 'month' | 'all' = 'all'
  ): EarningsSummary {
    const contract = this.contracts.get(contractId);
    const payments = this.payments.get(contractId) || [];
    const messages = this.messages.get(contractId) || [];

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const periodPayments = payments.filter(p => p.createdAt >= startDate);
    const periodMessages = messages.filter(m => m.createdAt >= startDate);

    const userTotals = new Map<string, bigint>();
    for (const payment of periodPayments) {
      const current = userTotals.get(payment.senderId) || 0n;
      userTotals.set(payment.senderId, current + payment.amount);
    }

    const messageBreakdown: Record<MessageType, number> = {
      text: 0,
      image: 0,
      video: 0,
      audio: 0,
      file: 0,
      link: 0,
      embed: 0,
      reaction: 0,
      system: 0,
    };

    for (const message of periodMessages) {
      messageBreakdown[message.type]++;
    }

    return {
      contractId,
      period,
      totalMessages: periodMessages.length,
      paidMessages: periodMessages.filter(m => m.isPaid).length,
      totalEarnings: periodPayments.reduce((sum, p) => sum + p.amount, 0n),
      currency: contract?.rates[0]?.currency || 'BSV',
      topPayingUsers: Array.from(userTotals.entries())
        .map(([userId, amount]) => ({ userId, amount }))
        .sort((a, b) => (b.amount > a.amount ? 1 : -1))
        .slice(0, 10),
      messageBreakdown,
    };
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(callback: (event: ContractEvent) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private emit(event: ContractEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

/** Contract event */
export type ContractEvent =
  | { type: 'contract_created'; contract: ChatContract }
  | { type: 'contract_updated'; contract: ChatContract }
  | { type: 'contract_activated'; contract: ChatContract }
  | { type: 'contract_paused'; contract: ChatContract }
  | { type: 'participant_joined'; contractId: string; participantId: string }
  | { type: 'participant_left'; contractId: string; participantId: string }
  | { type: 'message_sent'; contractId: string; message: ChatMessage }
  | { type: 'message_unlocked'; contractId: string; messageId: string; payment: MessagePayment }
  | { type: 'tip_sent'; contractId: string; payment: MessagePayment }
  | { type: 'reaction_added'; contractId: string; messageId: string; emoji: string; userId: string }
  | { type: 'subscription_created'; subscription: UserSubscription };

// ============================================================================
// Factory Functions
// ============================================================================

export function createChatContractManager(): ChatContractManager {
  return new ChatContractManager();
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateContractId(): string {
  return `contract_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function generatePaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function generateSubscriptionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function formatPaymentAmount(amount: bigint, currency: Currency): string {
  const num = Number(amount);

  switch (currency) {
    case 'BSV':
    case 'BTC':
      if (num < 100000) return `${num} sats`;
      return `${(num / 100000000).toFixed(8)} ${currency}`;
    case 'ETH':
      return `${(num / 1e18).toFixed(6)} ETH`;
    case 'SOL':
      return `${(num / 1e9).toFixed(4)} SOL`;
    case 'USD':
    case 'GBP':
    case 'EUR':
      return `${(num / 100).toFixed(2)} ${currency}`;
    default:
      return `${num} ${currency}`;
  }
}

export function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

export function calculateCharacterCount(text: string): number {
  return text.length;
}

export function estimateMessageCost(
  content: string,
  rate: RateStructure
): bigint {
  let amount: bigint;

  switch (rate.model) {
    case 'per-message':
      amount = rate.amount;
      break;
    case 'per-word':
      amount = rate.amount * BigInt(calculateWordCount(content));
      break;
    case 'per-character':
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

export function isSubscriptionActive(subscription: UserSubscription): boolean {
  return subscription.status === 'active' && subscription.expiresAt > new Date();
}

export function getNextRenewalDate(subscription: UserSubscription): Date | null {
  if (subscription.status !== 'active') return null;
  return subscription.renewsAt || null;
}
