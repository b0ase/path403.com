/**
 * @b0ase/blockchain-email
 *
 * On-chain email system with blockchain-backed message storage and paymail integration.
 *
 * @packageDocumentation
 */
/** Email priority levels */
type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';
/** Email status */
type EmailStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
/** Encryption method */
type EncryptionMethod = 'none' | 'ecies' | 'aes-256';
/** Email address (paymail or traditional) */
interface EmailAddress {
    address: string;
    name?: string;
    publicKey?: string;
    isPaymail: boolean;
}
/** Email attachment */
interface EmailAttachment {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
    content: string;
    txid?: string;
}
/** Email message */
interface Email {
    id: string;
    from: EmailAddress;
    to: EmailAddress[];
    cc?: EmailAddress[];
    bcc?: EmailAddress[];
    subject: string;
    body: string;
    bodyHtml?: string;
    attachments?: EmailAttachment[];
    priority: EmailPriority;
    status: EmailStatus;
    encryption: EncryptionMethod;
    createdAt: number;
    sentAt?: number;
    readAt?: number;
    txid?: string;
    replyTo?: string;
    threadId?: string;
    headers?: Record<string, string>;
}
/** Email thread */
interface EmailThread {
    id: string;
    subject: string;
    participants: EmailAddress[];
    messages: Email[];
    lastMessageAt: number;
    unreadCount: number;
}
/** Mailbox folder */
interface Folder {
    id: string;
    name: string;
    type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
    unreadCount: number;
    totalCount: number;
}
/** Email filter rule */
interface FilterRule {
    id: string;
    name: string;
    conditions: FilterCondition[];
    actions: FilterAction[];
    enabled: boolean;
}
/** Filter condition */
interface FilterCondition {
    field: 'from' | 'to' | 'subject' | 'body';
    operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matches';
    value: string;
}
/** Filter action */
interface FilterAction {
    type: 'moveTo' | 'markRead' | 'markSpam' | 'delete' | 'forward' | 'label';
    value?: string;
}
/** Mailbox settings */
interface MailboxSettings {
    signature?: string;
    autoReply?: {
        enabled: boolean;
        message: string;
        startDate?: number;
        endDate?: number;
    };
    forwardTo?: string;
    defaultEncryption: EncryptionMethod;
}
/** Email client options */
interface EmailClientOptions {
    paymail: string;
    privateKey?: string;
    publicKey?: string;
    apiEndpoint?: string;
    autoSync?: boolean;
    syncInterval?: number;
}
/** Send email params */
interface SendEmailParams {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    body: string;
    bodyHtml?: string;
    attachments?: Array<{
        filename: string;
        content: string;
        mimeType: string;
    }>;
    priority?: EmailPriority;
    encryption?: EncryptionMethod;
    replyTo?: string;
}
/** Compose draft params */
interface ComposeDraftParams extends Partial<SendEmailParams> {
    id?: string;
}
declare const MAX_ATTACHMENT_SIZE: number;
declare const MAX_RECIPIENTS = 50;
declare const MAX_SUBJECT_LENGTH = 200;
declare const DEFAULT_FOLDERS: Folder[];
declare class BlockchainEmailClient {
    private options;
    private emails;
    private threads;
    private folders;
    private filters;
    private settings;
    private syncTimer?;
    private listeners;
    constructor(options: EmailClientOptions);
    send(params: SendEmailParams): Promise<Email>;
    reply(originalId: string, params: Omit<SendEmailParams, 'to'>): Promise<Email>;
    replyAll(originalId: string, params: Omit<SendEmailParams, 'to' | 'cc'>): Promise<Email>;
    forward(originalId: string, to: string | string[]): Promise<Email>;
    saveDraft(params: ComposeDraftParams): Promise<Email>;
    sendDraft(draftId: string): Promise<Email>;
    deleteDraft(draftId: string): boolean;
    getEmail(id: string): Email | undefined;
    markAsRead(id: string): Promise<void>;
    markAsUnread(id: string): Promise<void>;
    getFolders(): Folder[];
    getFolder(id: string): Folder | undefined;
    createFolder(name: string): Folder;
    deleteFolder(id: string): boolean;
    getEmailsByFolder(folderId: string): Email[];
    getThread(id: string): EmailThread | undefined;
    getThreads(): EmailThread[];
    createFilter(rule: Omit<FilterRule, 'id'>): FilterRule;
    updateFilter(id: string, updates: Partial<FilterRule>): FilterRule | null;
    deleteFilter(id: string): boolean;
    getFilters(): FilterRule[];
    getSettings(): MailboxSettings;
    updateSettings(updates: Partial<MailboxSettings>): void;
    sync(): Promise<number>;
    startSync(): void;
    stopSync(): void;
    on(event: string, callback: (data: unknown) => void): () => void;
    off(event: string, callback: (data: unknown) => void): void;
    private emit;
    private normalizeRecipients;
    private parseAddress;
    private validateEmail;
    private encryptEmail;
    private broadcastEmail;
    private updateThread;
    private getEmailThreadId;
    private updateFolderCount;
    private formatForwardBody;
    private generateId;
    destroy(): void;
}
declare function createEmailClient(options: EmailClientOptions): BlockchainEmailClient;
/**
 * Check if string is valid paymail address
 */
declare function isPaymail(address: string): boolean;
/**
 * Extract domain from paymail
 */
declare function getPaymailDomain(paymail: string): string | null;
/**
 * Format email address for display
 */
declare function formatAddress(address: EmailAddress): string;
/**
 * Parse email addresses from string
 */
declare function parseAddresses(input: string): EmailAddress[];
/**
 * Create mailto link
 */
declare function createMailtoLink(params: {
    to: string;
    subject?: string;
    body?: string;
    cc?: string;
    bcc?: string;
}): string;

export { BlockchainEmailClient, type ComposeDraftParams, DEFAULT_FOLDERS, type Email, type EmailAddress, type EmailAttachment, type EmailClientOptions, type EmailPriority, type EmailStatus, type EmailThread, type EncryptionMethod, type FilterAction, type FilterCondition, type FilterRule, type Folder, MAX_ATTACHMENT_SIZE, MAX_RECIPIENTS, MAX_SUBJECT_LENGTH, type MailboxSettings, type SendEmailParams, createEmailClient, createMailtoLink, formatAddress, getPaymailDomain, isPaymail, parseAddresses };
