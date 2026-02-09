// src/index.ts
var MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
var MAX_RECIPIENTS = 50;
var MAX_SUBJECT_LENGTH = 200;
var DEFAULT_FOLDERS = [
  { id: "inbox", name: "Inbox", type: "inbox", unreadCount: 0, totalCount: 0 },
  { id: "sent", name: "Sent", type: "sent", unreadCount: 0, totalCount: 0 },
  { id: "drafts", name: "Drafts", type: "drafts", unreadCount: 0, totalCount: 0 },
  { id: "trash", name: "Trash", type: "trash", unreadCount: 0, totalCount: 0 },
  { id: "spam", name: "Spam", type: "spam", unreadCount: 0, totalCount: 0 }
];
var BlockchainEmailClient = class {
  constructor(options) {
    this.emails = /* @__PURE__ */ new Map();
    this.threads = /* @__PURE__ */ new Map();
    this.folders = /* @__PURE__ */ new Map();
    this.filters = /* @__PURE__ */ new Map();
    this.listeners = /* @__PURE__ */ new Map();
    this.options = {
      paymail: options.paymail,
      privateKey: options.privateKey || "",
      publicKey: options.publicKey || "",
      apiEndpoint: options.apiEndpoint || "https://bmail.network/api",
      autoSync: options.autoSync ?? true,
      syncInterval: options.syncInterval || 6e4
    };
    this.settings = {
      defaultEncryption: "none"
    };
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
  async send(params) {
    const to = this.normalizeRecipients(params.to);
    const cc = params.cc ? this.normalizeRecipients(params.cc) : void 0;
    const bcc = params.bcc ? this.normalizeRecipients(params.bcc) : void 0;
    this.validateEmail(to, cc, bcc, params.subject);
    const email = {
      id: this.generateId("email"),
      from: this.parseAddress(this.options.paymail),
      to,
      cc,
      bcc,
      subject: params.subject,
      body: params.body,
      bodyHtml: params.bodyHtml,
      priority: params.priority || "normal",
      status: "queued",
      encryption: params.encryption || this.settings.defaultEncryption,
      createdAt: Date.now(),
      replyTo: params.replyTo,
      threadId: params.replyTo ? this.getEmailThreadId(params.replyTo) : this.generateId("thread")
    };
    if (params.attachments?.length) {
      email.attachments = params.attachments.map((att) => ({
        id: this.generateId("att"),
        filename: att.filename,
        mimeType: att.mimeType,
        size: att.content.length,
        content: att.content
      }));
    }
    if (email.encryption !== "none") {
      await this.encryptEmail(email);
    }
    const txid = await this.broadcastEmail(email);
    email.txid = txid;
    email.status = "sent";
    email.sentAt = Date.now();
    this.emails.set(email.id, email);
    this.updateThread(email);
    this.updateFolderCount("sent", 1);
    this.emit("sent", email);
    return email;
  }
  async reply(originalId, params) {
    const original = this.emails.get(originalId);
    if (!original) {
      throw new Error("Original email not found");
    }
    return this.send({
      ...params,
      to: original.from.address,
      replyTo: originalId,
      subject: params.subject || `Re: ${original.subject}`
    });
  }
  async replyAll(originalId, params) {
    const original = this.emails.get(originalId);
    if (!original) {
      throw new Error("Original email not found");
    }
    const recipients = original.to.filter((addr) => addr.address !== this.options.paymail).map((addr) => addr.address);
    return this.send({
      ...params,
      to: original.from.address,
      cc: recipients,
      replyTo: originalId,
      subject: params.subject || `Re: ${original.subject}`
    });
  }
  async forward(originalId, to) {
    const original = this.emails.get(originalId);
    if (!original) {
      throw new Error("Original email not found");
    }
    return this.send({
      to,
      subject: `Fwd: ${original.subject}`,
      body: this.formatForwardBody(original),
      bodyHtml: original.bodyHtml,
      attachments: original.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        mimeType: att.mimeType
      }))
    });
  }
  // ==========================================================================
  // Drafts
  // ==========================================================================
  async saveDraft(params) {
    const id = params.id || this.generateId("email");
    const existing = this.emails.get(id);
    const draft = {
      id,
      from: this.parseAddress(this.options.paymail),
      to: params.to ? this.normalizeRecipients(params.to) : [],
      cc: params.cc ? this.normalizeRecipients(params.cc) : void 0,
      bcc: params.bcc ? this.normalizeRecipients(params.bcc) : void 0,
      subject: params.subject || "",
      body: params.body || "",
      bodyHtml: params.bodyHtml,
      priority: params.priority || "normal",
      status: "draft",
      encryption: params.encryption || this.settings.defaultEncryption,
      createdAt: existing?.createdAt || Date.now(),
      replyTo: params.replyTo
    };
    this.emails.set(id, draft);
    if (!existing) {
      this.updateFolderCount("drafts", 1);
    }
    return draft;
  }
  async sendDraft(draftId) {
    const draft = this.emails.get(draftId);
    if (!draft || draft.status !== "draft") {
      throw new Error("Draft not found");
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
        mimeType: att.mimeType
      })),
      priority: draft.priority,
      encryption: draft.encryption,
      replyTo: draft.replyTo
    });
    this.emails.delete(draftId);
    this.updateFolderCount("drafts", -1);
    return email;
  }
  deleteDraft(draftId) {
    const draft = this.emails.get(draftId);
    if (!draft || draft.status !== "draft") {
      return false;
    }
    this.emails.delete(draftId);
    this.updateFolderCount("drafts", -1);
    return true;
  }
  // ==========================================================================
  // Reading Emails
  // ==========================================================================
  getEmail(id) {
    return this.emails.get(id);
  }
  async markAsRead(id) {
    const email = this.emails.get(id);
    if (!email) return;
    if (!email.readAt) {
      email.readAt = Date.now();
      email.status = "read";
      this.updateFolderCount("inbox", 0, -1);
      this.emit("read", email);
    }
  }
  async markAsUnread(id) {
    const email = this.emails.get(id);
    if (!email) return;
    if (email.readAt) {
      email.readAt = void 0;
      email.status = "delivered";
      this.updateFolderCount("inbox", 0, 1);
    }
  }
  // ==========================================================================
  // Folders
  // ==========================================================================
  getFolders() {
    return Array.from(this.folders.values());
  }
  getFolder(id) {
    return this.folders.get(id);
  }
  createFolder(name) {
    const id = this.generateId("folder");
    const folder = {
      id,
      name,
      type: "custom",
      unreadCount: 0,
      totalCount: 0
    };
    this.folders.set(id, folder);
    return folder;
  }
  deleteFolder(id) {
    const folder = this.folders.get(id);
    if (!folder || folder.type !== "custom") {
      return false;
    }
    return this.folders.delete(id);
  }
  getEmailsByFolder(folderId) {
    const emails = Array.from(this.emails.values());
    switch (folderId) {
      case "inbox":
        return emails.filter(
          (e) => e.status !== "draft" && e.to.some((addr) => addr.address === this.options.paymail)
        );
      case "sent":
        return emails.filter((e) => e.status === "sent" && e.from.address === this.options.paymail);
      case "drafts":
        return emails.filter((e) => e.status === "draft");
      default:
        return emails;
    }
  }
  // ==========================================================================
  // Threads
  // ==========================================================================
  getThread(id) {
    return this.threads.get(id);
  }
  getThreads() {
    return Array.from(this.threads.values()).sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }
  // ==========================================================================
  // Filters
  // ==========================================================================
  createFilter(rule) {
    const filter = {
      ...rule,
      id: this.generateId("filter")
    };
    this.filters.set(filter.id, filter);
    return filter;
  }
  updateFilter(id, updates) {
    const filter = this.filters.get(id);
    if (!filter) return null;
    Object.assign(filter, updates);
    return filter;
  }
  deleteFilter(id) {
    return this.filters.delete(id);
  }
  getFilters() {
    return Array.from(this.filters.values());
  }
  // ==========================================================================
  // Settings
  // ==========================================================================
  getSettings() {
    return { ...this.settings };
  }
  updateSettings(updates) {
    Object.assign(this.settings, updates);
  }
  // ==========================================================================
  // Sync
  // ==========================================================================
  async sync() {
    const newCount = 0;
    this.emit("sync", { count: newCount });
    return newCount;
  }
  startSync() {
    if (this.syncTimer) return;
    this.syncTimer = setInterval(() => this.sync(), this.options.syncInterval);
  }
  stopSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = void 0;
    }
  }
  // ==========================================================================
  // Events
  // ==========================================================================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }
  emit(event, data) {
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
  normalizeRecipients(input) {
    const addresses = Array.isArray(input) ? input : [input];
    return addresses.map((addr) => this.parseAddress(addr));
  }
  parseAddress(input) {
    const match = input.match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return {
        name: match[1].trim(),
        address: match[2].trim(),
        isPaymail: match[2].includes("@")
      };
    }
    return {
      address: input.trim(),
      isPaymail: input.includes("@")
    };
  }
  validateEmail(to, cc, bcc, subject) {
    const totalRecipients = to.length + (cc?.length || 0) + (bcc?.length || 0);
    if (totalRecipients === 0) {
      throw new Error("At least one recipient is required");
    }
    if (totalRecipients > MAX_RECIPIENTS) {
      throw new Error(`Maximum ${MAX_RECIPIENTS} recipients allowed`);
    }
    if (subject && subject.length > MAX_SUBJECT_LENGTH) {
      throw new Error(`Subject cannot exceed ${MAX_SUBJECT_LENGTH} characters`);
    }
  }
  async encryptEmail(email) {
    email.headers = {
      ...email.headers,
      "X-Encrypted": email.encryption
    };
  }
  async broadcastEmail(email) {
    return `tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  updateThread(email) {
    const threadId = email.threadId;
    let thread = this.threads.get(threadId);
    if (!thread) {
      thread = {
        id: threadId,
        subject: email.subject.replace(/^(Re:|Fwd:)\s*/gi, ""),
        participants: [],
        messages: [],
        lastMessageAt: email.createdAt,
        unreadCount: 0
      };
      this.threads.set(threadId, thread);
    }
    thread.messages.push(email);
    thread.lastMessageAt = email.sentAt || email.createdAt;
    const addresses = [email.from, ...email.to, ...email.cc || []];
    for (const addr of addresses) {
      if (!thread.participants.some((p) => p.address === addr.address)) {
        thread.participants.push(addr);
      }
    }
  }
  getEmailThreadId(emailId) {
    const email = this.emails.get(emailId);
    return email?.threadId;
  }
  updateFolderCount(folderId, totalDelta, unreadDelta = 0) {
    const folder = this.folders.get(folderId);
    if (folder) {
      folder.totalCount += totalDelta;
      folder.unreadCount += unreadDelta;
    }
  }
  formatForwardBody(original) {
    return `
---------- Forwarded message ---------
From: ${original.from.name || ""} <${original.from.address}>
Date: ${new Date(original.sentAt || original.createdAt).toLocaleString()}
Subject: ${original.subject}
To: ${original.to.map((a) => a.address).join(", ")}

${original.body}
`;
  }
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
  destroy() {
    this.stopSync();
    this.emails.clear();
    this.threads.clear();
    this.listeners.clear();
  }
};
function createEmailClient(options) {
  return new BlockchainEmailClient(options);
}
function isPaymail(address) {
  return /^[a-z0-9._-]+@[a-z0-9.-]+$/i.test(address);
}
function getPaymailDomain(paymail) {
  const match = paymail.match(/@(.+)$/);
  return match ? match[1] : null;
}
function formatAddress(address) {
  if (address.name) {
    return `${address.name} <${address.address}>`;
  }
  return address.address;
}
function parseAddresses(input) {
  return input.split(/[,;]/).map((addr) => {
    const match = addr.trim().match(/^(.+?)\s*<(.+)>$/);
    if (match) {
      return {
        name: match[1].trim(),
        address: match[2].trim(),
        isPaymail: match[2].includes("@")
      };
    }
    return {
      address: addr.trim(),
      isPaymail: addr.includes("@")
    };
  });
}
function createMailtoLink(params) {
  const query = new URLSearchParams();
  if (params.subject) query.set("subject", params.subject);
  if (params.body) query.set("body", params.body);
  if (params.cc) query.set("cc", params.cc);
  if (params.bcc) query.set("bcc", params.bcc);
  const queryStr = query.toString();
  return `mailto:${params.to}${queryStr ? "?" + queryStr : ""}`;
}
export {
  BlockchainEmailClient,
  DEFAULT_FOLDERS,
  MAX_ATTACHMENT_SIZE,
  MAX_RECIPIENTS,
  MAX_SUBJECT_LENGTH,
  createEmailClient,
  createMailtoLink,
  formatAddress,
  getPaymailDomain,
  isPaymail,
  parseAddresses
};
//# sourceMappingURL=index.js.map