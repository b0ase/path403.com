/**
 * @b0ase/storage-adapter
 *
 * Unified storage interface for localStorage, sessionStorage, IndexedDB, and memory.
 *
 * @packageDocumentation
 */
/** Storage adapter interface */
interface StorageAdapter {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    has(key: string): Promise<boolean>;
}
/** Storage options */
interface StorageOptions {
    ttl?: number;
    namespace?: string;
}
declare class MemoryStorageAdapter implements StorageAdapter {
    private store;
    private namespace;
    constructor(namespace?: string);
    private getKey;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    has(key: string): Promise<boolean>;
}
declare class WebStorageAdapter implements StorageAdapter {
    private storage;
    private namespace;
    constructor(storage: Storage, namespace?: string);
    private getKey;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    has(key: string): Promise<boolean>;
}
declare class IndexedDBAdapter implements StorageAdapter {
    private dbName;
    private storeName;
    private db;
    private namespace;
    constructor(dbName?: string, storeName?: string, namespace?: string);
    private getKey;
    private getDB;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    has(key: string): Promise<boolean>;
    close(): void;
}
type StorageType = 'memory' | 'local' | 'session' | 'indexeddb';
interface StorageManagerOptions {
    type?: StorageType;
    namespace?: string;
    fallback?: StorageType;
}
declare class StorageManager implements StorageAdapter {
    private adapter;
    constructor(options?: StorageManagerOptions);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: StorageOptions): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
    has(key: string): Promise<boolean>;
    getOrSet<T>(key: string, factory: () => T | Promise<T>, options?: StorageOptions): Promise<T>;
    update<T>(key: string, updater: (current: T | null) => T): Promise<T>;
    increment(key: string, amount?: number): Promise<number>;
    decrement(key: string, amount?: number): Promise<number>;
    append<T>(key: string, item: T): Promise<T[]>;
    getMultiple<T>(keys: string[]): Promise<Map<string, T | null>>;
    setMultiple<T>(entries: Array<[string, T]>, options?: StorageOptions): Promise<void>;
}
declare function createStorageAdapter(options?: StorageManagerOptions): StorageAdapter;
declare function createStorageManager(options?: StorageManagerOptions): StorageManager;
declare function getStorage(options?: StorageManagerOptions): StorageManager;
declare function resetStorage(): void;

export { IndexedDBAdapter, MemoryStorageAdapter, type StorageAdapter, StorageManager, type StorageManagerOptions, type StorageOptions, type StorageType, WebStorageAdapter, createStorageAdapter, createStorageManager, getStorage, resetStorage };
