/**
 * @b0ase/storage-adapter
 *
 * Unified storage interface for localStorage, sessionStorage, IndexedDB, and memory.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Storage adapter interface */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  has(key: string): Promise<boolean>;
}

/** Storage options */
export interface StorageOptions {
  ttl?: number; // Time to live in milliseconds
  namespace?: string;
}

/** Stored item wrapper with metadata */
interface StoredItem<T> {
  value: T;
  expires?: number;
  createdAt: number;
}

// ============================================================================
// Memory Storage Adapter
// ============================================================================

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, StoredItem<unknown>>();
  private namespace: string;

  constructor(namespace: string = '') {
    this.namespace = namespace;
  }

  private getKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const item = this.store.get(fullKey) as StoredItem<T> | undefined;

    if (!item) return null;

    if (item.expires && Date.now() > item.expires) {
      this.store.delete(fullKey);
      return null;
    }

    return item.value;
  }

  async set<T>(key: string, value: T, options?: StorageOptions): Promise<void> {
    const fullKey = this.getKey(key);
    const item: StoredItem<T> = {
      value,
      createdAt: Date.now(),
      expires: options?.ttl ? Date.now() + options.ttl : undefined,
    };
    this.store.set(fullKey, item);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(this.getKey(key));
  }

  async clear(): Promise<void> {
    if (this.namespace) {
      for (const key of this.store.keys()) {
        if (key.startsWith(`${this.namespace}:`)) {
          this.store.delete(key);
        }
      }
    } else {
      this.store.clear();
    }
  }

  async keys(): Promise<string[]> {
    const prefix = this.namespace ? `${this.namespace}:` : '';
    const result: string[] = [];

    for (const key of this.store.keys()) {
      if (!this.namespace || key.startsWith(prefix)) {
        result.push(this.namespace ? key.slice(prefix.length) : key);
      }
    }

    return result;
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }
}

// ============================================================================
// Web Storage Adapter (localStorage / sessionStorage)
// ============================================================================

export class WebStorageAdapter implements StorageAdapter {
  private storage: Storage;
  private namespace: string;

  constructor(storage: Storage, namespace: string = '') {
    this.storage = storage;
    this.namespace = namespace;
  }

  private getKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const raw = this.storage.getItem(fullKey);

    if (!raw) return null;

    try {
      const item = JSON.parse(raw) as StoredItem<T>;

      if (item.expires && Date.now() > item.expires) {
        this.storage.removeItem(fullKey);
        return null;
      }

      return item.value;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: StorageOptions): Promise<void> {
    const fullKey = this.getKey(key);
    const item: StoredItem<T> = {
      value,
      createdAt: Date.now(),
      expires: options?.ttl ? Date.now() + options.ttl : undefined,
    };
    this.storage.setItem(fullKey, JSON.stringify(item));
  }

  async delete(key: string): Promise<void> {
    this.storage.removeItem(this.getKey(key));
  }

  async clear(): Promise<void> {
    if (this.namespace) {
      const prefix = `${this.namespace}:`;
      const keysToDelete: string[] = [];

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.storage.removeItem(key);
      }
    } else {
      this.storage.clear();
    }
  }

  async keys(): Promise<string[]> {
    const prefix = this.namespace ? `${this.namespace}:` : '';
    const result: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && (!this.namespace || key.startsWith(prefix))) {
        result.push(this.namespace ? key.slice(prefix.length) : key);
      }
    }

    return result;
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }
}

// ============================================================================
// IndexedDB Storage Adapter
// ============================================================================

export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private namespace: string;

  constructor(dbName: string = 'b0ase-storage', storeName: string = 'keyvalue', namespace: string = '') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.namespace = namespace;
  }

  private getKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDB();
    const fullKey = this.getKey(key);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fullKey);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const result = request.result as { key: string; item: StoredItem<T> } | undefined;

        if (!result) {
          resolve(null);
          return;
        }

        if (result.item.expires && Date.now() > result.item.expires) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(result.item.value);
      };
    });
  }

  async set<T>(key: string, value: T, options?: StorageOptions): Promise<void> {
    const db = await this.getDB();
    const fullKey = this.getKey(key);

    const item: StoredItem<T> = {
      value,
      createdAt: Date.now(),
      expires: options?.ttl ? Date.now() + options.ttl : undefined,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key: fullKey, item });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    const db = await this.getDB();
    const fullKey = this.getKey(key);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(fullKey);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (this.namespace) {
      const keys = await this.keys();
      for (const key of keys) {
        await this.delete(key);
      }
    } else {
      const db = await this.getDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  }

  async keys(): Promise<string[]> {
    const db = await this.getDB();
    const prefix = this.namespace ? `${this.namespace}:` : '';

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const allKeys = request.result as string[];
        const result = allKeys
          .filter((key) => !this.namespace || key.startsWith(prefix))
          .map((key) => (this.namespace ? key.slice(prefix.length) : key));
        resolve(result);
      };
    });
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// ============================================================================
// Unified Storage Manager
// ============================================================================

export type StorageType = 'memory' | 'local' | 'session' | 'indexeddb';

export interface StorageManagerOptions {
  type?: StorageType;
  namespace?: string;
  fallback?: StorageType;
}

export class StorageManager implements StorageAdapter {
  private adapter: StorageAdapter;

  constructor(options: StorageManagerOptions = {}) {
    this.adapter = createStorageAdapter(options);
  }

  async get<T>(key: string): Promise<T | null> {
    return this.adapter.get<T>(key);
  }

  async set<T>(key: string, value: T, options?: StorageOptions): Promise<void> {
    return this.adapter.set(key, value, options);
  }

  async delete(key: string): Promise<void> {
    return this.adapter.delete(key);
  }

  async clear(): Promise<void> {
    return this.adapter.clear();
  }

  async keys(): Promise<string[]> {
    return this.adapter.keys();
  }

  async has(key: string): Promise<boolean> {
    return this.adapter.has(key);
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  async getOrSet<T>(key: string, factory: () => T | Promise<T>, options?: StorageOptions): Promise<T> {
    const existing = await this.get<T>(key);
    if (existing !== null) return existing;

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async update<T>(key: string, updater: (current: T | null) => T): Promise<T> {
    const current = await this.get<T>(key);
    const updated = updater(current);
    await this.set(key, updated);
    return updated;
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    return this.update<number>(key, (current) => (current || 0) + amount);
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    return this.update<number>(key, (current) => (current || 0) - amount);
  }

  async append<T>(key: string, item: T): Promise<T[]> {
    return this.update<T[]>(key, (current) => [...(current || []), item]);
  }

  async getMultiple<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    for (const key of keys) {
      results.set(key, await this.get<T>(key));
    }
    return results;
  }

  async setMultiple<T>(entries: Array<[string, T]>, options?: StorageOptions): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, options);
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function isIndexedDBAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof indexedDB !== 'undefined';
}

export function createStorageAdapter(options: StorageManagerOptions = {}): StorageAdapter {
  const { type = 'memory', namespace = '', fallback = 'memory' } = options;

  const createAdapter = (storageType: StorageType): StorageAdapter | null => {
    switch (storageType) {
      case 'local':
        if (isStorageAvailable('localStorage')) {
          return new WebStorageAdapter(localStorage, namespace);
        }
        return null;

      case 'session':
        if (isStorageAvailable('sessionStorage')) {
          return new WebStorageAdapter(sessionStorage, namespace);
        }
        return null;

      case 'indexeddb':
        if (isIndexedDBAvailable()) {
          return new IndexedDBAdapter('b0ase-storage', 'keyvalue', namespace);
        }
        return null;

      case 'memory':
      default:
        return new MemoryStorageAdapter(namespace);
    }
  };

  const adapter = createAdapter(type);
  if (adapter) return adapter;

  const fallbackAdapter = createAdapter(fallback);
  if (fallbackAdapter) return fallbackAdapter;

  return new MemoryStorageAdapter(namespace);
}

export function createStorageManager(options?: StorageManagerOptions): StorageManager {
  return new StorageManager(options);
}

// ============================================================================
// Singleton Instances
// ============================================================================

let defaultStorage: StorageManager | null = null;

export function getStorage(options?: StorageManagerOptions): StorageManager {
  if (!defaultStorage) {
    defaultStorage = createStorageManager(options);
  }
  return defaultStorage;
}

export function resetStorage(): void {
  defaultStorage = null;
}
