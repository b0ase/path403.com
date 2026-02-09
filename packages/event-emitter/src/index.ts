/**
 * @b0ase/event-emitter
 *
 * Type-safe event emitter with async support.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Event listener function */
export type EventListener<T = unknown> = (data: T) => void | Promise<void>;

/** Listener options */
export interface ListenerOptions {
  once?: boolean;
  prepend?: boolean;
}

/** Listener entry */
interface ListenerEntry<T = unknown> {
  listener: EventListener<T>;
  once: boolean;
}

/** Emitter options */
export interface EmitterOptions {
  maxListeners?: number;
  captureRejections?: boolean;
}

/** Emitter stats */
export interface EmitterStats {
  eventCount: number;
  listenerCount: number;
  events: Array<{ name: string; listeners: number }>;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_MAX_LISTENERS = 10;

// ============================================================================
// Event Emitter
// ============================================================================

export class EventEmitter<T extends Record<string, unknown> = Record<string, unknown>> {
  private _listeners: Map<string, ListenerEntry[]> = new Map();
  private maxListeners: number;
  private captureRejections: boolean;

  constructor(options?: EmitterOptions) {
    this.maxListeners = options?.maxListeners ?? DEFAULT_MAX_LISTENERS;
    this.captureRejections = options?.captureRejections ?? false;
  }

  // ==========================================================================
  // Core Methods
  // ==========================================================================

  on<K extends keyof T & string>(
    event: K,
    listener: EventListener<T[K]>,
    options?: ListenerOptions
  ): this {
    return this.addListener(event, listener, { ...options, once: false });
  }

  once<K extends keyof T & string>(
    event: K,
    listener: EventListener<T[K]>
  ): this {
    return this.addListener(event, listener, { once: true });
  }

  off<K extends keyof T & string>(event: K, listener: EventListener<T[K]>): this {
    return this.removeListener(event, listener);
  }

  emit<K extends keyof T & string>(event: K, data: T[K]): boolean {
    const entries = this._listeners.get(event);
    if (!entries || entries.length === 0) {
      return false;
    }

    const toRemove: EventListener[] = [];

    for (const entry of entries) {
      try {
        const result = entry.listener(data);

        if (this.captureRejections && result instanceof Promise) {
          result.catch(err => {
            this.emit('error' as K, err as T[K]);
          });
        }
      } catch (err) {
        if (this.captureRejections) {
          this.emit('error' as K, err as T[K]);
        } else {
          throw err;
        }
      }

      if (entry.once) {
        toRemove.push(entry.listener);
      }
    }

    for (const listener of toRemove) {
      this.removeListener(event, listener as EventListener<T[K]>);
    }

    return true;
  }

  async emitAsync<K extends keyof T & string>(event: K, data: T[K]): Promise<boolean> {
    const entries = this._listeners.get(event);
    if (!entries || entries.length === 0) {
      return false;
    }

    const toRemove: EventListener[] = [];

    for (const entry of entries) {
      try {
        await entry.listener(data);
      } catch (err) {
        if (this.captureRejections) {
          this.emit('error' as K, err as T[K]);
        } else {
          throw err;
        }
      }

      if (entry.once) {
        toRemove.push(entry.listener);
      }
    }

    for (const listener of toRemove) {
      this.removeListener(event, listener as EventListener<T[K]>);
    }

    return true;
  }

  async emitParallel<K extends keyof T & string>(event: K, data: T[K]): Promise<boolean> {
    const entries = this._listeners.get(event);
    if (!entries || entries.length === 0) {
      return false;
    }

    const promises = entries.map(async entry => {
      try {
        await entry.listener(data);
        return { entry, error: null };
      } catch (err) {
        return { entry, error: err };
      }
    });

    const results = await Promise.all(promises);

    const toRemove: EventListener[] = [];
    for (const { entry, error } of results) {
      if (error) {
        if (this.captureRejections) {
          this.emit('error' as K, error as T[K]);
        } else {
          throw error;
        }
      }
      if (entry.once) {
        toRemove.push(entry.listener);
      }
    }

    for (const listener of toRemove) {
      this.removeListener(event, listener as EventListener<T[K]>);
    }

    return true;
  }

  // ==========================================================================
  // Listener Management
  // ==========================================================================

  addListener<K extends keyof T & string>(
    event: K,
    listener: EventListener<T[K]>,
    options?: ListenerOptions
  ): this {
    let entries = this._listeners.get(event);
    if (!entries) {
      entries = [];
      this._listeners.set(event, entries);
    }

    // Check max listeners
    if (entries.length >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible memory leak detected. ` +
        `${entries.length + 1} listeners added to event "${event}".`
      );
    }

    const entry: ListenerEntry = {
      listener: listener as EventListener,
      once: options?.once ?? false,
    };

    if (options?.prepend) {
      entries.unshift(entry);
    } else {
      entries.push(entry);
    }

    return this;
  }

  removeListener<K extends keyof T & string>(event: K, listener: EventListener<T[K]>): this {
    const entries = this._listeners.get(event);
    if (!entries) return this;

    const index = entries.findIndex(e => e.listener === listener);
    if (index !== -1) {
      entries.splice(index, 1);
    }

    if (entries.length === 0) {
      this._listeners.delete(event);
    }

    return this;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
    return this;
  }

  // ==========================================================================
  // Inspection
  // ==========================================================================

  listenerCount(event: string): number {
    return this._listeners.get(event)?.length ?? 0;
  }

  getListeners(event: string): EventListener[] {
    return (this._listeners.get(event) ?? []).map(e => e.listener);
  }

  eventNames(): string[] {
    return Array.from(this._listeners.keys());
  }

  getMaxListeners(): number {
    return this.maxListeners;
  }

  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  getStats(): EmitterStats {
    const events: Array<{ name: string; listeners: number }> = [];
    let totalListeners = 0;

    for (const [name, entries] of this._listeners) {
      events.push({ name, listeners: entries.length });
      totalListeners += entries.length;
    }

    return {
      eventCount: this._listeners.size,
      listenerCount: totalListeners,
      events,
    };
  }

  // ==========================================================================
  // Promise-based Helpers
  // ==========================================================================

  waitFor<K extends keyof T & string>(
    event: K,
    options?: { timeout?: number }
  ): Promise<T[K]> {
    return new Promise((resolve, reject) => {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      const listener: EventListener<T[K]> = (data) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        this.off(event, listener);
        resolve(data);
      };

      this.on(event, listener);

      if (options?.timeout) {
        timeoutId = setTimeout(() => {
          this.off(event, listener);
          reject(new Error(`Timeout waiting for event "${event}"`));
        }, options.timeout);
      }
    });
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createEventEmitter<T extends Record<string, unknown> = Record<string, unknown>>(
  options?: EmitterOptions
): EventEmitter<T> {
  return new EventEmitter<T>(options);
}

// ============================================================================
// Event Bus (Singleton pattern)
// ============================================================================

export class EventBus extends EventEmitter<Record<string, unknown>> {
  private static instances: Map<string, EventBus> = new Map();

  static getInstance(name: string = 'default'): EventBus {
    let instance = EventBus.instances.get(name);
    if (!instance) {
      instance = new EventBus();
      EventBus.instances.set(name, instance);
    }
    return instance;
  }

  static resetInstance(name: string = 'default'): void {
    const instance = EventBus.instances.get(name);
    if (instance) {
      instance.removeAllListeners();
      EventBus.instances.delete(name);
    }
  }

  static resetAll(): void {
    for (const instance of EventBus.instances.values()) {
      instance.removeAllListeners();
    }
    EventBus.instances.clear();
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function once<T>(
  emitter: EventEmitter<Record<string, T>>,
  event: string
): Promise<T> {
  return new Promise((resolve) => {
    emitter.once(event, (data: T) => {
      resolve(data);
    });
  });
}

export function onceWithTimeout<T>(
  emitter: EventEmitter<Record<string, T>>,
  event: string,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    once(emitter, event),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout waiting for "${event}"`)), timeoutMs);
    }),
  ]);
}
