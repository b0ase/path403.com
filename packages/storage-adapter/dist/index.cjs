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
  IndexedDBAdapter: () => IndexedDBAdapter,
  MemoryStorageAdapter: () => MemoryStorageAdapter,
  StorageManager: () => StorageManager,
  WebStorageAdapter: () => WebStorageAdapter,
  createStorageAdapter: () => createStorageAdapter,
  createStorageManager: () => createStorageManager,
  getStorage: () => getStorage,
  resetStorage: () => resetStorage
});
module.exports = __toCommonJS(index_exports);
var MemoryStorageAdapter = class {
  constructor(namespace = "") {
    this.store = /* @__PURE__ */ new Map();
    this.namespace = namespace;
  }
  getKey(key) {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }
  async get(key) {
    const fullKey = this.getKey(key);
    const item = this.store.get(fullKey);
    if (!item) return null;
    if (item.expires && Date.now() > item.expires) {
      this.store.delete(fullKey);
      return null;
    }
    return item.value;
  }
  async set(key, value, options) {
    const fullKey = this.getKey(key);
    const item = {
      value,
      createdAt: Date.now(),
      expires: options?.ttl ? Date.now() + options.ttl : void 0
    };
    this.store.set(fullKey, item);
  }
  async delete(key) {
    this.store.delete(this.getKey(key));
  }
  async clear() {
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
  async keys() {
    const prefix = this.namespace ? `${this.namespace}:` : "";
    const result = [];
    for (const key of this.store.keys()) {
      if (!this.namespace || key.startsWith(prefix)) {
        result.push(this.namespace ? key.slice(prefix.length) : key);
      }
    }
    return result;
  }
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }
};
var WebStorageAdapter = class {
  constructor(storage, namespace = "") {
    this.storage = storage;
    this.namespace = namespace;
  }
  getKey(key) {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }
  async get(key) {
    const fullKey = this.getKey(key);
    const raw = this.storage.getItem(fullKey);
    if (!raw) return null;
    try {
      const item = JSON.parse(raw);
      if (item.expires && Date.now() > item.expires) {
        this.storage.removeItem(fullKey);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  }
  async set(key, value, options) {
    const fullKey = this.getKey(key);
    const item = {
      value,
      createdAt: Date.now(),
      expires: options?.ttl ? Date.now() + options.ttl : void 0
    };
    this.storage.setItem(fullKey, JSON.stringify(item));
  }
  async delete(key) {
    this.storage.removeItem(this.getKey(key));
  }
  async clear() {
    if (this.namespace) {
      const prefix = `${this.namespace}:`;
      const keysToDelete = [];
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
  async keys() {
    const prefix = this.namespace ? `${this.namespace}:` : "";
    const result = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && (!this.namespace || key.startsWith(prefix))) {
        result.push(this.namespace ? key.slice(prefix.length) : key);
      }
    }
    return result;
  }
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }
};
var IndexedDBAdapter = class {
  constructor(dbName = "b0ase-storage", storeName = "keyvalue", namespace = "") {
    this.db = null;
    this.dbName = dbName;
    this.storeName = storeName;
    this.namespace = namespace;
  }
  getKey(key) {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }
  async getDB() {
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
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
    });
  }
  async get(key) {
    const db = await this.getDB();
    const fullKey = this.getKey(key);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fullKey);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
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
  async set(key, value, options) {
    const db = await this.getDB();
    const fullKey = this.getKey(key);
    const item = {
      value,
      createdAt: Date.now(),
      expires: options?.ttl ? Date.now() + options.ttl : void 0
    };
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key: fullKey, item });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async delete(key) {
    const db = await this.getDB();
    const fullKey = this.getKey(key);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(fullKey);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async clear() {
    if (this.namespace) {
      const keys = await this.keys();
      for (const key of keys) {
        await this.delete(key);
      }
    } else {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  }
  async keys() {
    const db = await this.getDB();
    const prefix = this.namespace ? `${this.namespace}:` : "";
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const allKeys = request.result;
        const result = allKeys.filter((key) => !this.namespace || key.startsWith(prefix)).map((key) => this.namespace ? key.slice(prefix.length) : key);
        resolve(result);
      };
    });
  }
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
};
var StorageManager = class {
  constructor(options = {}) {
    this.adapter = createStorageAdapter(options);
  }
  async get(key) {
    return this.adapter.get(key);
  }
  async set(key, value, options) {
    return this.adapter.set(key, value, options);
  }
  async delete(key) {
    return this.adapter.delete(key);
  }
  async clear() {
    return this.adapter.clear();
  }
  async keys() {
    return this.adapter.keys();
  }
  async has(key) {
    return this.adapter.has(key);
  }
  // ==========================================================================
  // Utility Methods
  // ==========================================================================
  async getOrSet(key, factory, options) {
    const existing = await this.get(key);
    if (existing !== null) return existing;
    const value = await factory();
    await this.set(key, value, options);
    return value;
  }
  async update(key, updater) {
    const current = await this.get(key);
    const updated = updater(current);
    await this.set(key, updated);
    return updated;
  }
  async increment(key, amount = 1) {
    return this.update(key, (current) => (current || 0) + amount);
  }
  async decrement(key, amount = 1) {
    return this.update(key, (current) => (current || 0) - amount);
  }
  async append(key, item) {
    return this.update(key, (current) => [...current || [], item]);
  }
  async getMultiple(keys) {
    const results = /* @__PURE__ */ new Map();
    for (const key of keys) {
      results.set(key, await this.get(key));
    }
    return results;
  }
  async setMultiple(entries, options) {
    for (const [key, value] of entries) {
      await this.set(key, value, options);
    }
  }
};
function isStorageAvailable(type) {
  if (typeof window === "undefined") return false;
  try {
    const storage = window[type];
    const testKey = "__storage_test__";
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
function isIndexedDBAvailable() {
  if (typeof window === "undefined") return false;
  return typeof indexedDB !== "undefined";
}
function createStorageAdapter(options = {}) {
  const { type = "memory", namespace = "", fallback = "memory" } = options;
  const createAdapter = (storageType) => {
    switch (storageType) {
      case "local":
        if (isStorageAvailable("localStorage")) {
          return new WebStorageAdapter(localStorage, namespace);
        }
        return null;
      case "session":
        if (isStorageAvailable("sessionStorage")) {
          return new WebStorageAdapter(sessionStorage, namespace);
        }
        return null;
      case "indexeddb":
        if (isIndexedDBAvailable()) {
          return new IndexedDBAdapter("b0ase-storage", "keyvalue", namespace);
        }
        return null;
      case "memory":
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
function createStorageManager(options) {
  return new StorageManager(options);
}
var defaultStorage = null;
function getStorage(options) {
  if (!defaultStorage) {
    defaultStorage = createStorageManager(options);
  }
  return defaultStorage;
}
function resetStorage() {
  defaultStorage = null;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  IndexedDBAdapter,
  MemoryStorageAdapter,
  StorageManager,
  WebStorageAdapter,
  createStorageAdapter,
  createStorageManager,
  getStorage,
  resetStorage
});
//# sourceMappingURL=index.cjs.map