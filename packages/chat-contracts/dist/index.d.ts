/**
 * @b0ase/chat-contracts
 *
 * Chat payment contracts and message monetization utilities.
 *
 * @packageDocumentation
 */
/** Payment model */
type PaymentModel = 'per-message' | 'per-word' | 'per-character' | 'per-minute' | 'subscription' | 'tip' | 'unlock';
/** Contract status */
type ContractStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'expired' | 'cancelled';
/** Message type */
type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'link' | 'embed' | 'reaction' | 'system';
/** Payment status */
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
/** Currency type */
type Currency = 'BSV' | 'BTC' | 'ETH' | 'SOL' | 'USDT' | 'USDC' | 'USD' | 'GBP' | 'EUR';
/** Participant role */
type ParticipantRole = 'creator' | 'recipient' | 'moderator' | 'subscriber' | 'viewer';
/** Chat participant */
interface ChatParticipant {
    id: string;
    walletAddress?: string;
    displayName: string;
    avatar?: string;
    role: ParticipantRole;
    joinedAt: Date;
    isVerified: boolean;
}
/** Rate structure */
interface RateStructure {
    model: PaymentModel;
    amount: bigint;
    currency: Currency;
    minimumPayment?: bigint;
    maximumPayment?: bigint;
    freeAllowance?: number;
}
/** Chat contract */
interface ChatContract {
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
interface MessagePayment {
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
interface ChatMessage {
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
interface MessageAttachment {
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
interface MessageReaction {
    emoji: string;
    userId: string;
    tipAmount?: bigint;
    createdAt: Date;
}
/** Subscription tier */
interface SubscriptionTier {
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
interface UserSubscription {
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
interface EarningsSummary {
    contractId: string;
    period: 'day' | 'week' | 'month' | 'all';
    totalMessages: number;
    paidMessages: number;
    totalEarnings: bigint;
    currency: Currency;
    topPayingUsers: Array<{
        userId: string;
        amount: bigint;
    }>;
    messageBreakdown: Record<MessageType, number>;
}
/** Contract settings */
interface ContractSettings {
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
declare const DEFAULT_CONTRACT_SETTINGS: ContractSettings;
declare const DEFAULT_RATE: RateStructure;
declare class ChatContractManager {
    private contracts;
    private messages;
    private payments;
    private subscriptions;
    private listeners;
    createContract(creatorId: string, title: string, rates?: RateStructure[], settings?: Partial<ContractSettings>): ChatContract;
    getContract(contractId: string): ChatContract | undefined;
    updateContract(contractId: string, updates: Partial<ChatContract>): ChatContract | null;
    activateContract(contractId: string): boolean;
    pauseContract(contractId: string): boolean;
    addParticipant(contractId: string, participant: Omit<ChatParticipant, 'joinedAt'>): boolean;
    removeParticipant(contractId: string, participantId: string): boolean;
    sendMessage(contractId: string, senderId: string, content: string, type?: MessageType, attachments?: MessageAttachment[]): Promise<ChatMessage | null>;
    private calculatePayment;
    getMessages(contractId: string, limit?: number, before?: Date): ChatMessage[];
    unlockMessage(contractId: string, messageId: string, payment: MessagePayment): boolean;
    sendTip(contractId: string, senderId: string, recipientId: string, amount: bigint, currency?: Currency, messageId?: string): MessagePayment;
    addReaction(contractId: string, messageId: string, userId: string, emoji: string, tipAmount?: bigint): boolean;
    createSubscription(userId: string, contractId: string, tier: SubscriptionTier): UserSubscription;
    getUserSubscriptions(userId: string): UserSubscription[];
    hasActiveSubscription(userId: string, contractId: string): boolean;
    getEarningsSummary(contractId: string, period?: 'day' | 'week' | 'month' | 'all'): EarningsSummary;
    on(callback: (event: ContractEvent) => void): () => void;
    private emit;
}
/** Contract event */
type ContractEvent = {
    type: 'contract_created';
    contract: ChatContract;
} | {
    type: 'contract_updated';
    contract: ChatContract;
} | {
    type: 'contract_activated';
    contract: ChatContract;
} | {
    type: 'contract_paused';
    contract: ChatContract;
} | {
    type: 'participant_joined';
    contractId: string;
    participantId: string;
} | {
    type: 'participant_left';
    contractId: string;
    participantId: string;
} | {
    type: 'message_sent';
    contractId: string;
    message: ChatMessage;
} | {
    type: 'message_unlocked';
    contractId: string;
    messageId: string;
    payment: MessagePayment;
} | {
    type: 'tip_sent';
    contractId: string;
    payment: MessagePayment;
} | {
    type: 'reaction_added';
    contractId: string;
    messageId: string;
    emoji: string;
    userId: string;
} | {
    type: 'subscription_created';
    subscription: UserSubscription;
};
declare function createChatContractManager(): ChatContractManager;
declare function formatPaymentAmount(amount: bigint, currency: Currency): string;
declare function calculateWordCount(text: string): number;
declare function calculateCharacterCount(text: string): number;
declare function estimateMessageCost(content: string, rate: RateStructure): bigint;
declare function isSubscriptionActive(subscription: UserSubscription): boolean;
declare function getNextRenewalDate(subscription: UserSubscription): Date | null;

export { type ChatContract, ChatContractManager, type ChatMessage, type ChatParticipant, type ContractEvent, type ContractSettings, type ContractStatus, type Currency, DEFAULT_CONTRACT_SETTINGS, DEFAULT_RATE, type EarningsSummary, type MessageAttachment, type MessagePayment, type MessageReaction, type MessageType, type ParticipantRole, type PaymentModel, type PaymentStatus, type RateStructure, type SubscriptionTier, type UserSubscription, calculateCharacterCount, calculateWordCount, createChatContractManager, estimateMessageCost, formatPaymentAmount, getNextRenewalDate, isSubscriptionActive };
