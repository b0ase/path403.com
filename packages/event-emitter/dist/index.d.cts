/**
 * @b0ase/event-emitter
 *
 * Type-safe event emitter with async support.
 *
 * @packageDocumentation
 */
/** Event listener function */
type EventListener<T = unknown> = (data: T) => void | Promise<void>;
/** Listener options */
interface ListenerOptions {
    once?: boolean;
    prepend?: boolean;
}
/** Emitter options */
interface EmitterOptions {
    maxListeners?: number;
    captureRejections?: boolean;
}
/** Emitter stats */
interface EmitterStats {
    eventCount: number;
    listenerCount: number;
    events: Array<{
        name: string;
        listeners: number;
    }>;
}
declare const DEFAULT_MAX_LISTENERS = 10;
declare class EventEmitter<T extends Record<string, unknown> = Record<string, unknown>> {
    private _listeners;
    private maxListeners;
    private captureRejections;
    constructor(options?: EmitterOptions);
    on<K extends keyof T & string>(event: K, listener: EventListener<T[K]>, options?: ListenerOptions): this;
    once<K extends keyof T & string>(event: K, listener: EventListener<T[K]>): this;
    off<K extends keyof T & string>(event: K, listener: EventListener<T[K]>): this;
    emit<K extends keyof T & string>(event: K, data: T[K]): boolean;
    emitAsync<K extends keyof T & string>(event: K, data: T[K]): Promise<boolean>;
    emitParallel<K extends keyof T & string>(event: K, data: T[K]): Promise<boolean>;
    addListener<K extends keyof T & string>(event: K, listener: EventListener<T[K]>, options?: ListenerOptions): this;
    removeListener<K extends keyof T & string>(event: K, listener: EventListener<T[K]>): this;
    removeAllListeners(event?: string): this;
    listenerCount(event: string): number;
    getListeners(event: string): EventListener[];
    eventNames(): string[];
    getMaxListeners(): number;
    setMaxListeners(n: number): this;
    getStats(): EmitterStats;
    waitFor<K extends keyof T & string>(event: K, options?: {
        timeout?: number;
    }): Promise<T[K]>;
}
declare function createEventEmitter<T extends Record<string, unknown> = Record<string, unknown>>(options?: EmitterOptions): EventEmitter<T>;
declare class EventBus extends EventEmitter<Record<string, unknown>> {
    private static instances;
    static getInstance(name?: string): EventBus;
    static resetInstance(name?: string): void;
    static resetAll(): void;
}
declare function once<T>(emitter: EventEmitter<Record<string, T>>, event: string): Promise<T>;
declare function onceWithTimeout<T>(emitter: EventEmitter<Record<string, T>>, event: string, timeoutMs: number): Promise<T>;

export { DEFAULT_MAX_LISTENERS, type EmitterOptions, type EmitterStats, EventBus, EventEmitter, type EventListener, type ListenerOptions, createEventEmitter, once, onceWithTimeout };
