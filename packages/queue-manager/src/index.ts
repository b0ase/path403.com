/**
 * @b0ase/queue-manager
 *
 * Job queue with priority, delay, retries, and concurrency control.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Job status */
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/** Job priority */
export type Priority = 'low' | 'normal' | 'high' | 'critical';

/** Priority numeric values */
export const PRIORITY_VALUES: Record<Priority, number> = {
  low: 1,
  normal: 5,
  high: 10,
  critical: 100,
};

/** Job options */
export interface JobOptions {
  priority?: Priority;
  delay?: number;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  metadata?: Record<string, unknown>;
}

/** Job definition */
export interface Job<T = unknown, R = unknown> {
  id: string;
  data: T;
  status: JobStatus;
  priority: Priority;
  attempts: number;
  maxRetries: number;
  createdAt: number;
  scheduledAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: R;
  error?: Error;
  metadata?: Record<string, unknown>;
}

/** Job handler function */
export type JobHandler<T = unknown, R = unknown> = (data: T, job: Job<T, R>) => Promise<R>;

/** Queue options */
export interface QueueOptions {
  concurrency?: number;
  defaultPriority?: Priority;
  defaultRetries?: number;
  defaultRetryDelay?: number;
  defaultTimeout?: number;
}

/** Queue events */
export type QueueEvent = 'job:added' | 'job:started' | 'job:completed' | 'job:failed' | 'job:retry' | 'queue:empty' | 'queue:drained';

/** Event listener */
export type QueueEventListener<T = unknown, R = unknown> = (job: Job<T, R>) => void;

/** Queue stats */
export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

// ============================================================================
// Job Queue
// ============================================================================

export class JobQueue<T = unknown, R = unknown> {
  private jobs: Map<string, Job<T, R>> = new Map();
  private pending: Job<T, R>[] = [];
  private processing: Set<string> = new Set();
  private handler: JobHandler<T, R>;
  private options: Required<QueueOptions>;
  private paused = false;
  private listeners: Map<QueueEvent, Set<QueueEventListener<T, R>>> = new Map();
  private jobIdCounter = 0;

  constructor(handler: JobHandler<T, R>, options: QueueOptions = {}) {
    this.handler = handler;
    this.options = {
      concurrency: options.concurrency ?? 1,
      defaultPriority: options.defaultPriority ?? 'normal',
      defaultRetries: options.defaultRetries ?? 0,
      defaultRetryDelay: options.defaultRetryDelay ?? 1000,
      defaultTimeout: options.defaultTimeout ?? 0,
    };
  }

  // ==========================================================================
  // Job Management
  // ==========================================================================

  add(data: T, options: JobOptions = {}): Job<T, R> {
    const id = this.generateId();
    const now = Date.now();
    const delay = options.delay ?? 0;

    const job: Job<T, R> = {
      id,
      data,
      status: 'pending',
      priority: options.priority ?? this.options.defaultPriority,
      attempts: 0,
      maxRetries: options.maxRetries ?? this.options.defaultRetries,
      createdAt: now,
      scheduledAt: now + delay,
      metadata: options.metadata,
    };

    this.jobs.set(id, job);
    this.insertByPriority(job);
    this.emit('job:added', job);

    if (!this.paused) {
      this.process();
    }

    return job;
  }

  addBulk(items: Array<{ data: T; options?: JobOptions }>): Job<T, R>[] {
    return items.map(({ data, options }) => this.add(data, options));
  }

  getJob(id: string): Job<T, R> | undefined {
    return this.jobs.get(id);
  }

  removeJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === 'processing') {
      return false; // Cannot remove processing job
    }

    this.pending = this.pending.filter((j) => j.id !== id);
    this.jobs.delete(id);
    return true;
  }

  cancelJob(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    if (job.status === 'processing') {
      return false; // Cannot cancel processing job
    }

    job.status = 'cancelled';
    this.pending = this.pending.filter((j) => j.id !== id);
    return true;
  }

  // ==========================================================================
  // Queue Control
  // ==========================================================================

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
    this.process();
  }

  isPaused(): boolean {
    return this.paused;
  }

  clear(): void {
    for (const job of this.pending) {
      job.status = 'cancelled';
    }
    this.pending = [];
  }

  // ==========================================================================
  // Processing
  // ==========================================================================

  private async process(): Promise<void> {
    if (this.paused) return;

    while (
      this.processing.size < this.options.concurrency &&
      this.pending.length > 0
    ) {
      const job = this.getNextJob();
      if (!job) break;

      this.processJob(job);
    }
  }

  private getNextJob(): Job<T, R> | undefined {
    const now = Date.now();

    for (let i = 0; i < this.pending.length; i++) {
      const job = this.pending[i];
      if (job.scheduledAt <= now) {
        this.pending.splice(i, 1);
        return job;
      }
    }

    // Schedule delayed job processing
    if (this.pending.length > 0) {
      const nextJob = this.pending[0];
      const delay = nextJob.scheduledAt - now;
      setTimeout(() => this.process(), delay);
    }

    return undefined;
  }

  private async processJob(job: Job<T, R>): Promise<void> {
    job.status = 'processing';
    job.startedAt = Date.now();
    job.attempts++;
    this.processing.add(job.id);

    this.emit('job:started', job);

    try {
      let result: R;

      if (this.options.defaultTimeout > 0) {
        result = await this.withTimeout(
          this.handler(job.data, job),
          this.options.defaultTimeout
        );
      } else {
        result = await this.handler(job.data, job);
      }

      job.status = 'completed';
      job.completedAt = Date.now();
      job.result = result;

      this.emit('job:completed', job);
    } catch (error) {
      job.error = error instanceof Error ? error : new Error(String(error));

      if (job.attempts < job.maxRetries + 1) {
        // Retry
        job.status = 'pending';
        job.scheduledAt = Date.now() + this.options.defaultRetryDelay;
        this.insertByPriority(job);
        this.emit('job:retry', job);
      } else {
        // Failed permanently
        job.status = 'failed';
        job.completedAt = Date.now();
        this.emit('job:failed', job);
      }
    } finally {
      this.processing.delete(job.id);

      if (this.pending.length === 0 && this.processing.size === 0) {
        this.emit('queue:drained', job);
      } else if (this.pending.length === 0) {
        this.emit('queue:empty', job);
      }

      this.process();
    }
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Job timeout after ${ms}ms`));
      }, ms);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  // ==========================================================================
  // Priority Sorting
  // ==========================================================================

  private insertByPriority(job: Job<T, R>): void {
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

  on(event: QueueEvent, listener: QueueEventListener<T, R>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => this.off(event, listener);
  }

  off(event: QueueEvent, listener: QueueEventListener<T, R>): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: QueueEvent, job: Job<T, R>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(job);
        } catch {
          // Ignore listener errors
        }
      }
    }
  }

  // ==========================================================================
  // Stats
  // ==========================================================================

  getStats(): QueueStats {
    let pending = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      switch (job.status) {
        case 'pending':
          pending++;
          break;
        case 'completed':
          completed++;
          break;
        case 'failed':
          failed++;
          break;
      }
    }

    return {
      pending,
      processing: this.processing.size,
      completed,
      failed,
      total: this.jobs.size,
    };
  }

  getPending(): Job<T, R>[] {
    return [...this.pending];
  }

  getProcessing(): Job<T, R>[] {
    return Array.from(this.processing)
      .map((id) => this.jobs.get(id))
      .filter((j): j is Job<T, R> => j !== undefined);
  }

  getCompleted(): Job<T, R>[] {
    return Array.from(this.jobs.values()).filter((j) => j.status === 'completed');
  }

  getFailed(): Job<T, R>[] {
    return Array.from(this.jobs.values()).filter((j) => j.status === 'failed');
  }

  // ==========================================================================
  // Utilities
  // ==========================================================================

  private generateId(): string {
    return `job_${Date.now()}_${++this.jobIdCounter}`;
  }

  async drain(): Promise<void> {
    if (this.pending.length === 0 && this.processing.size === 0) {
      return;
    }

    return new Promise((resolve) => {
      const unsubscribe = this.on('queue:drained', () => {
        unsubscribe();
        resolve();
      });
    });
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createQueue<T = unknown, R = unknown>(
  handler: JobHandler<T, R>,
  options?: QueueOptions
): JobQueue<T, R> {
  return new JobQueue<T, R>(handler, options);
}

// ============================================================================
// Simple FIFO Queue
// ============================================================================

export class SimpleQueue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// ============================================================================
// Priority Queue
// ============================================================================

export class PriorityQueue<T> {
  private items: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number = 0): void {
    const entry = { item, priority };
    const index = this.items.findIndex((e) => e.priority < priority);

    if (index === -1) {
      this.items.push(entry);
    } else {
      this.items.splice(index, 0, entry);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  peek(): T | undefined {
    return this.items[0]?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

// ============================================================================
// Deque (Double-ended queue)
// ============================================================================

export class Deque<T> {
  private items: T[] = [];

  pushFront(item: T): void {
    this.items.unshift(item);
  }

  pushBack(item: T): void {
    this.items.push(item);
  }

  popFront(): T | undefined {
    return this.items.shift();
  }

  popBack(): T | undefined {
    return this.items.pop();
  }

  peekFront(): T | undefined {
    return this.items[0];
  }

  peekBack(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}
