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
  Deque: () => Deque,
  JobQueue: () => JobQueue,
  PRIORITY_VALUES: () => PRIORITY_VALUES,
  PriorityQueue: () => PriorityQueue,
  SimpleQueue: () => SimpleQueue,
  createQueue: () => createQueue
});
module.exports = __toCommonJS(index_exports);
var PRIORITY_VALUES = {
  low: 1,
  normal: 5,
  high: 10,
  critical: 100
};
var JobQueue = class {
  constructor(handler, options = {}) {
    this.jobs = /* @__PURE__ */ new Map();
    this.pending = [];
    this.processing = /* @__PURE__ */ new Set();
    this.paused = false;
    this.listeners = /* @__PURE__ */ new Map();
    this.jobIdCounter = 0;
    this.handler = handler;
    this.options = {
      concurrency: options.concurrency ?? 1,
      defaultPriority: options.defaultPriority ?? "normal",
      defaultRetries: options.defaultRetries ?? 0,
      defaultRetryDelay: options.defaultRetryDelay ?? 1e3,
      defaultTimeout: options.defaultTimeout ?? 0
    };
  }
  // ==========================================================================
  // Job Management
  // ==========================================================================
  add(data, options = {}) {
    const id = this.generateId();
    const now = Date.now();
    const delay = options.delay ?? 0;
    const job = {
      id,
      data,
      status: "pending",
      priority: options.priority ?? this.options.defaultPriority,
      attempts: 0,
      maxRetries: options.maxRetries ?? this.options.defaultRetries,
      createdAt: now,
      scheduledAt: now + delay,
      metadata: options.metadata
    };
    this.jobs.set(id, job);
    this.insertByPriority(job);
    this.emit("job:added", job);
    if (!this.paused) {
      this.process();
    }
    return job;
  }
  addBulk(items) {
    return items.map(({ data, options }) => this.add(data, options));
  }
  getJob(id) {
    return this.jobs.get(id);
  }
  removeJob(id) {
    const job = this.jobs.get(id);
    if (!job) return false;
    if (job.status === "processing") {
      return false;
    }
    this.pending = this.pending.filter((j) => j.id !== id);
    this.jobs.delete(id);
    return true;
  }
  cancelJob(id) {
    const job = this.jobs.get(id);
    if (!job) return false;
    if (job.status === "processing") {
      return false;
    }
    job.status = "cancelled";
    this.pending = this.pending.filter((j) => j.id !== id);
    return true;
  }
  // ==========================================================================
  // Queue Control
  // ==========================================================================
  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
    this.process();
  }
  isPaused() {
    return this.paused;
  }
  clear() {
    for (const job of this.pending) {
      job.status = "cancelled";
    }
    this.pending = [];
  }
  // ==========================================================================
  // Processing
  // ==========================================================================
  async process() {
    if (this.paused) return;
    while (this.processing.size < this.options.concurrency && this.pending.length > 0) {
      const job = this.getNextJob();
      if (!job) break;
      this.processJob(job);
    }
  }
  getNextJob() {
    const now = Date.now();
    for (let i = 0; i < this.pending.length; i++) {
      const job = this.pending[i];
      if (job.scheduledAt <= now) {
        this.pending.splice(i, 1);
        return job;
      }
    }
    if (this.pending.length > 0) {
      const nextJob = this.pending[0];
      const delay = nextJob.scheduledAt - now;
      setTimeout(() => this.process(), delay);
    }
    return void 0;
  }
  async processJob(job) {
    job.status = "processing";
    job.startedAt = Date.now();
    job.attempts++;
    this.processing.add(job.id);
    this.emit("job:started", job);
    try {
      let result;
      if (this.options.defaultTimeout > 0) {
        result = await this.withTimeout(
          this.handler(job.data, job),
          this.options.defaultTimeout
        );
      } else {
        result = await this.handler(job.data, job);
      }
      job.status = "completed";
      job.completedAt = Date.now();
      job.result = result;
      this.emit("job:completed", job);
    } catch (error) {
      job.error = error instanceof Error ? error : new Error(String(error));
      if (job.attempts < job.maxRetries + 1) {
        job.status = "pending";
        job.scheduledAt = Date.now() + this.options.defaultRetryDelay;
        this.insertByPriority(job);
        this.emit("job:retry", job);
      } else {
        job.status = "failed";
        job.completedAt = Date.now();
        this.emit("job:failed", job);
      }
    } finally {
      this.processing.delete(job.id);
      if (this.pending.length === 0 && this.processing.size === 0) {
        this.emit("queue:drained", job);
      } else if (this.pending.length === 0) {
        this.emit("queue:empty", job);
      }
      this.process();
    }
  }
  async withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Job timeout after ${ms}ms`));
      }, ms);
      promise.then((result) => {
        clearTimeout(timer);
        resolve(result);
      }).catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  }
  // ==========================================================================
  // Priority Sorting
  // ==========================================================================
  insertByPriority(job) {
    const jobPriority = PRIORITY_VALUES[job.priority];
    const insertIndex = this.pending.findIndex(
      (j) => PRIORITY_VALUES[j.priority] < jobPriority
    );
    if (insertIndex === -1) {
      this.pending.push(job);
    } else {
      this.pending.splice(insertIndex, 0, job);
    }
  }
  // ==========================================================================
  // Events
  // ==========================================================================
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }
  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
  }
  emit(event, job) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(job);
        } catch {
        }
      }
    }
  }
  // ==========================================================================
  // Stats
  // ==========================================================================
  getStats() {
    let pending = 0;
    let completed = 0;
    let failed = 0;
    for (const job of this.jobs.values()) {
      switch (job.status) {
        case "pending":
          pending++;
          break;
        case "completed":
          completed++;
          break;
        case "failed":
          failed++;
          break;
      }
    }
    return {
      pending,
      processing: this.processing.size,
      completed,
      failed,
      total: this.jobs.size
    };
  }
  getPending() {
    return [...this.pending];
  }
  getProcessing() {
    return Array.from(this.processing).map((id) => this.jobs.get(id)).filter((j) => j !== void 0);
  }
  getCompleted() {
    return Array.from(this.jobs.values()).filter((j) => j.status === "completed");
  }
  getFailed() {
    return Array.from(this.jobs.values()).filter((j) => j.status === "failed");
  }
  // ==========================================================================
  // Utilities
  // ==========================================================================
  generateId() {
    return `job_${Date.now()}_${++this.jobIdCounter}`;
  }
  async drain() {
    if (this.pending.length === 0 && this.processing.size === 0) {
      return;
    }
    return new Promise((resolve) => {
      const unsubscribe = this.on("queue:drained", () => {
        unsubscribe();
        resolve();
      });
    });
  }
};
function createQueue(handler, options) {
  return new JobQueue(handler, options);
}
var SimpleQueue = class {
  constructor() {
    this.items = [];
  }
  enqueue(item) {
    this.items.push(item);
  }
  dequeue() {
    return this.items.shift();
  }
  peek() {
    return this.items[0];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  size() {
    return this.items.length;
  }
  clear() {
    this.items = [];
  }
  toArray() {
    return [...this.items];
  }
};
var PriorityQueue = class {
  constructor() {
    this.items = [];
  }
  enqueue(item, priority = 0) {
    const entry = { item, priority };
    const index = this.items.findIndex((e) => e.priority < priority);
    if (index === -1) {
      this.items.push(entry);
    } else {
      this.items.splice(index, 0, entry);
    }
  }
  dequeue() {
    return this.items.shift()?.item;
  }
  peek() {
    return this.items[0]?.item;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  size() {
    return this.items.length;
  }
  clear() {
    this.items = [];
  }
};
var Deque = class {
  constructor() {
    this.items = [];
  }
  pushFront(item) {
    this.items.unshift(item);
  }
  pushBack(item) {
    this.items.push(item);
  }
  popFront() {
    return this.items.shift();
  }
  popBack() {
    return this.items.pop();
  }
  peekFront() {
    return this.items[0];
  }
  peekBack() {
    return this.items[this.items.length - 1];
  }
  isEmpty() {
    return this.items.length === 0;
  }
  size() {
    return this.items.length;
  }
  clear() {
    this.items = [];
  }
  toArray() {
    return [...this.items];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Deque,
  JobQueue,
  PRIORITY_VALUES,
  PriorityQueue,
  SimpleQueue,
  createQueue
});
//# sourceMappingURL=index.cjs.map