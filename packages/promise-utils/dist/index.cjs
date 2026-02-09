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
  PromisePool: () => PromisePool,
  allSettled: () => allSettled,
  batch: () => batch,
  cancellable: () => cancellable,
  createPool: () => createPool,
  debounce: () => debounce,
  deferred: () => deferred,
  filterAsync: () => filterAsync,
  firstFulfilled: () => firstFulfilled,
  mapAsync: () => mapAsync,
  memoize: () => memoize,
  pool: () => pool,
  race: () => race,
  retryUntil: () => retryUntil,
  sleep: () => sleep,
  throttle: () => throttle,
  waitFor: () => waitFor
});
module.exports = __toCommonJS(index_exports);
function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function cancellable(promise) {
  let cancelled = false;
  let rejectFn;
  const wrappedPromise = new Promise((resolve, reject) => {
    rejectFn = reject;
    promise.then((value) => {
      if (!cancelled) resolve(value);
    }).catch((error) => {
      if (!cancelled) reject(error);
    });
  });
  return {
    promise: wrappedPromise,
    cancel: () => {
      cancelled = true;
      rejectFn(new Error("Cancelled"));
    }
  };
}
function debounce(fn, wait) {
  let timeout = null;
  let pending = null;
  return (...args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    if (!pending) {
      pending = deferred();
    }
    const currentPending = pending;
    timeout = setTimeout(async () => {
      timeout = null;
      pending = null;
      try {
        const result = await fn(...args);
        currentPending.resolve(result);
      } catch (error) {
        currentPending.reject(error);
      }
    }, wait);
    return currentPending.promise;
  };
}
function throttle(fn, limit) {
  let lastRun = 0;
  let pending = null;
  return async (...args) => {
    const now = Date.now();
    if (pending) {
      return pending;
    }
    if (now - lastRun >= limit) {
      lastRun = now;
      return fn(...args);
    }
    const delay = limit - (now - lastRun);
    pending = sleep(delay).then(() => {
      pending = null;
      lastRun = Date.now();
      return fn(...args);
    });
    return pending;
  };
}
var PromisePool = class {
  constructor(concurrency = 5) {
    this.running = 0;
    this.queue = [];
    this.concurrency = concurrency;
  }
  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.runNext();
    });
  }
  async runNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    const task = this.queue.shift();
    if (!task) return;
    this.running++;
    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.running--;
      this.runNext();
    }
  }
  getStats() {
    return {
      running: this.running,
      queued: this.queue.length,
      concurrency: this.concurrency
    };
  }
  setConcurrency(n) {
    this.concurrency = n;
    for (let i = 0; i < n - this.running; i++) {
      this.runNext();
    }
  }
};
async function pool(tasks, concurrency = 5) {
  const promisePool = new PromisePool(concurrency);
  return Promise.all(tasks.map((task) => promisePool.add(task)));
}
async function allSettled(tasks, concurrency) {
  const wrapped = tasks.map(
    (task) => () => task().then((value) => ({ status: "fulfilled", value })).catch((reason) => ({ status: "rejected", reason }))
  );
  if (concurrency) {
    return pool(wrapped, concurrency);
  }
  return Promise.all(wrapped.map((fn) => fn()));
}
function batch(fn, options = {}) {
  const { maxSize = 100, maxWait = 10 } = options;
  let queue = [];
  let timeout = null;
  const flush = async () => {
    const currentQueue = queue;
    queue = [];
    timeout = null;
    if (currentQueue.length === 0) return;
    const keys = currentQueue.map((item) => item.key);
    try {
      const results = await fn(keys);
      for (const item of currentQueue) {
        const value = results.get(item.key);
        if (value !== void 0) {
          item.deferred.resolve(value);
        } else {
          item.deferred.reject(new Error(`No result for key: ${String(item.key)}`));
        }
      }
    } catch (error) {
      for (const item of currentQueue) {
        item.deferred.reject(error);
      }
    }
  };
  return (key) => {
    const d = deferred();
    queue.push({ key, deferred: d });
    if (queue.length >= maxSize) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      flush();
    } else if (!timeout) {
      timeout = setTimeout(flush, maxWait);
    }
    return d.promise;
  };
}
function memoize(fn, options = {}) {
  const { keyFn = (...args) => JSON.stringify(args), ttl, maxSize = 1e3 } = options;
  const cache = /* @__PURE__ */ new Map();
  return async (...args) => {
    const key = keyFn(...args);
    const cached = cache.get(key);
    if (cached) {
      if (!cached.expires || cached.expires > Date.now()) {
        return cached.value;
      }
      cache.delete(key);
    }
    const value = await fn(...args);
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }
    cache.set(key, {
      value,
      expires: ttl ? Date.now() + ttl : void 0
    });
    return value;
  };
}
async function race(tasks, onCancel) {
  return new Promise((resolve, reject) => {
    let settled = false;
    tasks.forEach((task, index) => {
      task().then((value) => {
        if (!settled) {
          settled = true;
          resolve(value);
          tasks.forEach((_, i) => {
            if (i !== index && onCancel) {
              onCancel(i);
            }
          });
        }
      }).catch((error) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
      });
    });
  });
}
async function firstFulfilled(tasks) {
  const errors = [];
  return new Promise((resolve, reject) => {
    let pending = tasks.length;
    tasks.forEach((task) => {
      task().then(resolve).catch((error) => {
        errors.push(error);
        pending--;
        if (pending === 0) {
          reject(new AggregateError(errors, "All promises rejected"));
        }
      });
    });
  });
}
async function waitFor(condition, options = {}) {
  const { interval = 100, timeout = 3e4 } = options;
  const start = Date.now();
  while (true) {
    if (await condition()) {
      return;
    }
    if (Date.now() - start > timeout) {
      throw new Error("waitFor timeout");
    }
    await sleep(interval);
  }
}
async function retryUntil(fn, predicate, options = {}) {
  const { maxAttempts = 10, delay = 1e3 } = options;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (predicate(result)) {
      return result;
    }
    if (attempt < maxAttempts) {
      await sleep(delay);
    }
  }
  throw new Error("retryUntil max attempts reached");
}
async function mapAsync(items, fn, concurrency = 5) {
  const tasks = items.map((item, index) => () => fn(item, index));
  return pool(tasks, concurrency);
}
async function filterAsync(items, predicate, concurrency = 5) {
  const results = await mapAsync(
    items,
    async (item, index) => ({ item, keep: await predicate(item, index) }),
    concurrency
  );
  return results.filter((r) => r.keep).map((r) => r.item);
}
function createPool(concurrency) {
  return new PromisePool(concurrency);
}
var AggregateError = class extends Error {
  constructor(errors, message) {
    super(message);
    this.name = "AggregateError";
    this.errors = errors;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PromisePool,
  allSettled,
  batch,
  cancellable,
  createPool,
  debounce,
  deferred,
  filterAsync,
  firstFulfilled,
  mapAsync,
  memoize,
  pool,
  race,
  retryUntil,
  sleep,
  throttle,
  waitFor
});
//# sourceMappingURL=index.cjs.map