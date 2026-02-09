/**
 * @b0ase/blockchain-email
 *
 * On-chain email system with blockchain-backed message storage and paymail integration.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Email priority levels */
export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Email status */
export type EmailStatus = 'draft' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

/** Encryption method */
export type EncryptionMethod = 'none' | 'ecies' | 'aes-256';

/** Email address (paymail or traditional) */
export interface EmailAddress {
  address: string;
  name?: string;
  publicKey?: string;
  isPaymail: boolean;
}

/** Email attachment */
export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  content: string; // Base64 encoded
  txid?: string; // On-chain reference
}

/** Email message */
export interface Email {
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
export interface EmailThread {
  id: string;
  subject: string;
  participants: EmailAddress[];
  messages: Email[];
  lastMessageAt: number;
  unreadCount: number;
}

/** Mailbox folder */
export interface Folder {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';
  unreadCount: number;
  totalCount: number;
}

/** Email filter rule */
export interface FilterRule {
  id: string;
  name: string;
  conditions: FilterCondition[];
  actions: FilterAction[];
  enabled: boolean;
}

/** Filter condition */
export interface FilterCondition {
  field: 'from' | 'to' | 'subject' | 'body';
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matches';
  value: string;
}

/** Filter action */
export interface FilterAction {
  type: 'moveTo' | 'markRead' | 'markSpam' | 'delete' | 'forward' | 'label';
  value?: string;
}

/** Mailbox settings */
export interface MailboxSettings {
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
export interface EmailClientOptions {
  paymail: string;
  privateKey?: string;
  publicKey?: string;
  apiEndpoint?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

/** Send email params */
export interface SendEmailParams {
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
export interface ComposeDraftParams extends Partial<SendEmailParams> {
  id?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_RECIPIENTS = 50;
export const MAX_SUBJECT_LENGTH = 200;
export const DEFAULT_FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Inbox', type: 'inbox', unreadCount: 0, totalCount: 0 },
  { id: 'sent', name: 'Sent', type: 'sent', unreadCount: 0, totalCount: 0 },
  { id: 'drafts', name: 'Drafts', type: 'drafts', unreadCount: 0, totalCount: 0 },
  { id: 'trash', name: 'Trash', type: 'trash', unreadCount: 0, totalCount: 0 },
  { id: 'spam', name: 'Spam', type: 'spam', unreadCount: 0, totalCount: 0 },
];

// ============================================================================
// Blockchain Email Client
// ============================================================================

export class BlockchainEmailClient {
  private options: Required<EmailClientOptions>;
  private emails: Map<string, Email> = new Map();
  private threads: Map<string, EmailThread> = new Map();
  private folders: Map<string, Folder> = new Map();
  private filters: Map<string, FilterRule> = new Map();
  private settings: MailboxSettings;
  private syncTimer?: ReturnType<typeof setInterval>;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();

  constructor(options: EmailClientOptions) {
    this.options = {
      paymail: options.paymail,
      privateKey: options.privateKey || '',
      publicKey: options.publicKey || '',
      apiEndpoint: options.apiEndpoint || 'https://bmail.network/api',
      autoSync: options.autoSync ?? true,
      syncInterval: options.syncInterval || 60000,
    };

    this.settings = {
      defaultEncryption: 'none',
    };

    // Initialize default folders
    for (const folder of DEFAULT_FOLDERS) {
      this.folders.set(folder.id, { ...folder });
    }

    if (this.options.autoSync) {
      this.startSync();
    }
  }

  // ==========================================================================
  // Sending Emails
  // ==========================================================================

  async send(params: SendEmailParams): Promise<Email> {
    const to = this.normalizeRecipients(params.to);
    const cc = params.cc ? this.normalizeRecipients(params.cc) : undefined;
    const bcc = params.bcc ? this.normalizeRecipients(params.bcc) : undefined;

    this.validateEmail(to, cc, bcc, params.subject);

    const email: Email = {
      id: this.generateId('email'),
      from: this.parseAddress(this.options.paymail),
      to,
      cc,
      bcc,
      subject: params.subject,
      body: params.body,
      bodyHtml: params.bodyHtml,
      priority: params.priority || 'normal',
      status: 'queued',
      encryption: params.encryption || this.settings.defaultEncryption,
      createdAt: Date.now(),
      replyTo: params.replyTo,
      threadId: params.replyTo ? this.getEmailThreadId(params.replyTo) : this.generateId('thread'),
    };

    // Handle attachments
    if (params.attachments?.length) {
      email.attachments = params.attachments.map((att) => ({
        id: this.generateId('att'),
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.content.length,
        content: att.content,
      }));
    }

    // Encrypt if needed
    if (email.encryption !== 'none') {
      await this.encryptEmail(email);
    }

    // Send to blockchain
    const txid = await this.broadcastEmail(email);
    email.txid = txid;
    email.status = 'sent';
    email.sentAt = Date.now();

    this.emails.set(email.id, email);
    this.updateThread(email);
    this.updateFolderCount('sent', 1);

    this.emit('sent', email);
    return email;
  }

  async reply(originalId: string, params: Omit<SendEmailParams, 'to'>): Promise<Email> {
    const original = this.emails.get(originalId);
    if (!original) {
      throw new Error('Original email not found');
    }

    return this.send({
      ...params,
      to: original.from.address,
      replyTo: originalId,
      subject: params.subject || `Re: ${original.subject}`,
    });
  }

  async replyAll(originalId: string, params: Omit<SendEmailParams, 'to' | 'cc'>): Promise<Email> {
    const original = this.emails.get(originalId);
    if (!original) {
      throw new Error('Original email not found');
    }

    const recipients = original.to
      .filter((addr) => addr.address !== this.options.paymail)
      .map((addr) => addr.address);

    return this.send({
      ...params,
      to: original.from.address,
      cc: recipients,
      replyTo: originalId,
      subject: params.subject || `Re: ${original.subject}`,
    });
  }

  async forward(originalId: string, to: string | string[]): Promise<Email> {
    const original = this.emails.get(originalId);
    if (!original) {
      throw new Error('Original email not found');
    }

    return this.send({
      to,
      subject: `Fwd: ${original.subject}`,
      body: this.formatForwardBody(original),
      bodyHtml: original.bodyHtml,
      attachments: original.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        mimeType: att.mimeType,
      })),
    });
  }

  // ==========================================================================
  // Drafts
  // ==========================================================================

  async saveDraft(params: ComposeDraftParams): Promise<Email> {
    const id = params.id || this.generateId('email');
    const existing = this.emails.get(id);

    const draft: Email = {
      id,
      from: this.parseAddress(this.options.paymail),
      to: params.to ? this.normalizeRecipients(params.to) : [],
      cc: params.cc ? this.normalizeRecipients(params.cc) : undefined,
      bcc: params.bcc ? this.normalizeRecipients(params.bcc) : undefined,
      subject: params.subject || '',
      body: params.body || '',
      bodyHtml: params.bodyHtml,
      priority: params.priority || 'normal',
      status: 'draft',
      encryption: params.encryption || this.settings.defaultEncryption,
      createdAt: existing?.createdAt || Date.now(),
      replyTo: params.replyTo,
    };

    this.emails.set(id, draft);

    if (!existing) {
      this.updateFolderCount('drafts', 1);
    }

    return draft;
  }

  async sendDraft(draftId: string): Promise<Email> {
    const draft = this.emails.get(draftId);
    if (!draft || draft.status !== 'draft') {
      throw new Error('Draft not found');
    }

    const email = await this.send({
      to: draft.to.map((a) => a.address),
      cc: draft.cc?.map((a) => a.address),
      bcc: draft.bcc?.map((a) => a.address),
      subject: draft.subject,
      body: draft.body,
      bodyHtml: draft.bodyHtml,
      attachments: draft.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        mimeType: att.mimeType,
      })),
      priority: draft.priority,
      encryption: draft.encryption,
      replyTo: draft.replyTo,
    });

    this.emails.delete(draftId);
    this.updateFolderCount('drafts', -1);

    return email;
  }

  deleteDraft(draftId: string): boolean {
    const draft = this.emails.get(draftId);
    if (!draft || draft.status !== 'draft') {
      return false;
    }

    this.emails.delete(draftId);
    this.updateFolderCount('drafts', -1);
    return true;
  }

  // ==========================================================================
  // Reading Emails
  // ==========================================================================

  getEmail(id: string): Email | undefined {
    return this.emails.get(id);
  }

  async markAsRead(id: string): Promise<void> {
    const email = this.emails.get(id);
    if (!email) return;

    if (!email.readAt) {
      email.readAt = Date.now();
      email.status = 'read';
      this.updateFolderCount('inbox', 0, -1);
      this.emit('read', email);
    }
  }

  async markAsUnread(id: string): Promise<void> {
    const email = this.emails.get(id);
    if (!email) return;

    if (email.readAt) {
      email.readAt = undefined;
      email.status = 'delivered';
      this.updateFolderCount('inbox', 0, 1);
    }
  }

  // ==========================================================================
  // Folders
  // ==========================================================================

  getFolders(): Folder[] {
    return Array.from(this.folders.values());
  }

  getFolder(id: string): Folder | undefined {
    return this.folders.get(id);
  }

  createFolder(name: string): Folder {
    const id = this.generateId('folder');
    const folder: Folder = {
      id,
      name,
      type: 'custom',
      unreadCount: 0,
      totalCount: 0,
    };
    this.folders.set(id, folder);
    return folder;
  }

  deleteFolder(id: string): boolean {
    const folder = this.folders.get(id);
    if (!folder || folder.type !== 'custom') {
      return false;
    }
    return this.folders.delete(id);
  }

  getEmailsByFolder(folderId: string): Email[] {
    const emails = Array.from(this.emails.values());

    switch (folderId) {
      case 'inbox':
        return emails.filter(
          (e) => e.status !== 'draft' && e.to.some((addr) => addr.address === this.options.paymail)
        );
      case 'sent':
        return emails.filter((e) => e.status === 'sent' && e.from.address === this.options.paymail);
      case 'drafts':
        return emails.filter((e) => e.status === 'draft');
      default:
        return emails;
    }
  }

  // ==========================================================================
  // Threads
  // ==========================================================================

  getThread(id: string): EmailThread | undefined {
    return this.threads.get(id);
  }

  getThreads(): EmailThread[] {
    return Array.from(this.threads.values()).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }

  // ==========================================================================
  // Filters
  // ==========================================================================

  createFilter(rule: Omit<FilterRule, 'id'>): FilterRule {
    const filter: FilterRule = {
      ...rule,
      id: this.generateId('filter'),
    };
    this.filters.set(filter.id, filter);
    return filter;
  }

  updateFilter(id: string, updates: Partial<FilterRule>): FilterRule | null {
    const filter = this.filters.get(id);
    if (!filter) return null;

    Object.assign(filter, updates);
    return filter;
  }

  deleteFilter(id: string): boolean {
    return this.filters.delete(id);
  }

  getFilters(): FilterRule[] {
    return Array.from(this.filters.values());
  }

  // ==========================================================================
  // Settings
  // ==========================================================================

  getSettings(): MailboxSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<MailboxSettings>): void {
    Object.assign(this.settings, updates);
  }

  // ==========================================================================
  // Sync
  // ==========================================================================

  async sync(): Promise<number> {
    // In production, fetch new emails from blockchain/API
    // For now, simulate sync
    const newCount = 0;

    this.emit('sync', { count: newCount });
    return newCount;
  }

  startSync(): void {
    if (this.syncTimer) return;
    this.syncTimer = setInterval(() => this.sync(), this.options.syncInterval);
  }

  stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
  }

  // ==========================================================================
  // Events
  // ==========================================================================

  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: (data: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(data);
      }
    }
  }

  // ==========================================================================
  // Helpers
  // ==========================================================================

  private normalizeRecipients(input: string | string[]): EmailAddress[] {
    const addresses = Array.isArray(input) ? input : [input];
    return addresses.map((addr) => this.parseAddress(addr));
  }

  private parseAddress(input: string): EmailAddress {
    const match = input.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return {
        name: match[1].trim(),
        address: match[2].trim(),
        isPaymail: match[2].includes('@'),
      };
    }
    return {
      address: input.trim(),
      isPaymail: input.includes('@'),
    };
  }

  private validateEmail(
    to: EmailAddress[],
    cc?: EmailAddress[],
    bcc?: EmailAddress[],
    subject?: string
  ): void {
    const totalRecipients = to.length + (cc?.length || 0) + (bcc?.length || 0);

    if (totalRecipients === 0) {
      throw new Error('At least one recipient is required');
    }

    if (totalRecipients > MAX_RECIPIENTS) {
      throw new Error(`Maximum ${MAX_RECIPIENTS} recipients allowed`);
    }

    if (subject && subject.length > MAX_SUBJECT_LENGTH) {
      throw new Error(`Subject cannot exceed ${MAX_SUBJECT_LENGTH} characters`);
    }
  }

  private async encryptEmail(email: Email): Promise<void> {
    // In production, encrypt body and attachments
    // For now, mark as encrypted
    email.headers = {
      ...email.headers,
      'X-Encrypted': email.encryption,
    };
  }

  private async broadcastEmail(email: Email): Promise<string> {
    // In production, broadcast to blockchain
    // For now, return mock txid
    return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  private updateThread(email: Email): void {
    const threadId = email.threadId!;
    let thread = this.threads.get(threadId);

    if (!thread) {
      thread = {
        id: threadId,
        subject: email.subject.replace(/^(Re:|Fwd:)\s*/gi, ''),
        participants: [],
        messages: [],
        lastMessageAt: email.createdAt,
        unreadCount: 0,
      };
      this.threads.set(threadId, thread);
    }

    thread.messages.push(email);
    thread.lastMessageAt = email.sentAt || email.createdAt;

    // Update participants
    const addresses = [email.from, ...email.to, ...(email.cc || [])];
    for (const addr of addresses) {
      if (!thread.participants.some((p) => p.address === addr.address)) {
        thread.participants.push(addr);
      }
    }
  }

  private getEmailThreadId(emailId: string): string | undefined {
    const email = this.emails.get(emailId);
    return email?.threadId;
  }

  private updateFolderCount(folderId: string, totalDelta: number, unreadDelta: number = 0): void {
    const folder = this.folders.get(folderId);
    if (folder) {
      folder.totalCount += totalDelta;
      folder.unreadCount += unreadDelta;
    }
  }

  private formatForwardBody(original: Email): string {
    return `
---------- Forwarded message ---------
From: ${original.from.name || ''} <${original.from.address}>
Date: ${new Date(original.sentAt || original.createdAt).toLocaleString()}
Subject: ${original.subject}
To: ${original.to.map((a) => a.address).join(', ')}

${original.body}
`;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  destroy(): void {
    this.stopSync();
    this.emails.clear();
    this.threads.clear();
    this.listeners.clear();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createEmailClient(options: EmailClientOptions): BlockchainEmailClient {
  return new BlockchainEmailClient(options);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if string is valid paymail address
 */
export function isPaymail(address: string): boolean {
  return /^[a-z0-9._-]+@[a-z0-9.-]+$/i.test(address);
}

/**
 * Extract domain from paymail
 */
export function getPaymailDomain(paymail: string): string | null {
  const match = paymail.match(/@(.+)$/);
  return match ? match[1] : null;
}

/**
 * Format email address for display
 */
export function formatAddress(address: EmailAddress): string {
  if (address.name) {
    return `${address.name} <${address.address}>`;
  }
  return address.address;
}

/**
 * Parse email addresses from string
 */
export function parseAddresses(input: string): EmailAddress[] {
  return input.split(/[,;]/).map((addr) => {
    const match = addr.trim().match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return {
        name: match[1].trim(),
        address: match[2].trim(),
        isPaymail: match[2].includes('@'),
      };
    }
    return {
      address: addr.trim(),
      isPaymail: addr.includes('@'),
    };
  });
}

/**
 * Create mailto link
 */
export function createMailtoLink(params: {
  to: string;
  subject?: string;
  body?: string;
  cc?: string;
  bcc?: string;
}): string {
  const query = new URLSearchParams();
  if (params.subject) query.set('subject', params.subject);
  if (params.body) query.set('body', params.body);
  if (params.cc) query.set('cc', params.cc);
  if (params.bcc) query.set('bcc', params.bcc);

  const queryStr = query.toString();
  return `mailto:${params.to}${queryStr ? '?' + queryStr : ''}`;
}
