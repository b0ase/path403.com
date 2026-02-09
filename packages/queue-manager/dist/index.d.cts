/**
 * @b0ase/queue-manager
 *
 * Job queue with priority, delay, retries, and concurrency control.
 *
 * @packageDocumentation
 */
/** Job status */
type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
/** Job priority */
type Priority = 'low' | 'normal' | 'high' | 'critical';
/** Priority numeric values */
declare const PRIORITY_VALUES: Record<Priority, number>;
/** Job options */
interface JobOptions {
    priority?: Priority;
    delay?: number;
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
    metadata?: Record<string, unknown>;
}
/** Job definition */
interface Job<T = unknown, R = unknown> {
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
type JobHandler<T = unknown, R = unknown> = (data: T, job: Job<T, R>) => Promise<R>;
/** Queue options */
interface QueueOptions {
    concurrency?: number;
    defaultPriority?: Priority;
    defaultRetries?: number;
    defaultRetryDelay?: number;
    defaultTimeout?: number;
}
/** Queue events */
type QueueEvent = 'job:added' | 'job:started' | 'job:completed' | 'job:failed' | 'job:retry' | 'queue:empty' | 'queue:drained';
/** Event listener */
type QueueEventListener<T = unknown, R = unknown> = (job: Job<T, R>) => void;
/** Queue stats */
interface QueueStats {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
}
declare class JobQueue<T = unknown, R = unknown> {
    private jobs;
    private pending;
    private processing;
    private handler;
    private options;
    private paused;
    private listeners;
    private jobIdCounter;
    constructor(handler: JobHandler<T, R>, options?: QueueOptions);
    add(data: T, options?: JobOptions): Job<T, R>;
    addBulk(items: Array<{
        data: T;
        options?: JobOptions;
    }>): Job<T, R>[];
    getJob(id: string): Job<T, R> | undefined;
    removeJob(id: string): boolean;
    cancelJob(id: string): boolean;
    pause(): void;
    resume(): void;
    isPaused(): boolean;
    clear(): void;
    private process;
    private getNextJob;
    private processJob;
    private withTimeout;
    private insertByPriority;
    on(event: QueueEvent, listener: QueueEventListener<T, R>): () => void;
    off(event: QueueEvent, listener: QueueEventListener<T, R>): void;
    private emit;
    getStats(): QueueStats;
    getPending(): Job<T, R>[];
    getProcessing(): Job<T, R>[];
    getCompleted(): Job<T, R>[];
    getFailed(): Job<T, R>[];
    private generateId;
    drain(): Promise<void>;
}
declare function createQueue<T = unknown, R = unknown>(handler: JobHandler<T, R>, options?: QueueOptions): JobQueue<T, R>;
declare class SimpleQueue<T> {
    private items;
    enqueue(item: T): void;
    dequeue(): T | undefined;
    peek(): T | undefined;
    isEmpty(): boolean;
    size(): number;
    clear(): void;
    toArray(): T[];
}
declare class PriorityQueue<T> {
    private items;
    enqueue(item: T, priority?: number): void;
    dequeue(): T | undefined;
    peek(): T | undefined;
    isEmpty(): boolean;
    size(): number;
    clear(): void;
}
declare class Deque<T> {
    private items;
    pushFront(item: T): void;
    pushBack(item: T): void;
    popFront(): T | undefined;
    popBack(): T | undefined;
    peekFront(): T | undefined;
    peekBack(): T | undefined;
    isEmpty(): boolean;
    size(): number;
    clear(): void;
    toArray(): T[];
}

export { Deque, type Job, type JobHandler, type JobOptions, JobQueue, type JobStatus, PRIORITY_VALUES, type Priority, PriorityQueue, type QueueEvent, type QueueEventListener, type QueueOptions, type QueueStats, SimpleQueue, createQueue };
