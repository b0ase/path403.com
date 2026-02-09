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
  DEFAULT_MAX_LISTENERS: () => DEFAULT_MAX_LISTENERS,
  EventBus: () => EventBus,
  EventEmitter: () => EventEmitter,
  createEventEmitter: () => createEventEmitter,
  once: () => once,
  onceWithTimeout: () => onceWithTimeout
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_MAX_LISTENERS = 10;
var EventEmitter = class {
  constructor(options) {
    this._listeners = /* @__PURE__ */ new Map();
    this.maxListeners = options?.maxListeners ?? DEFAULT_MAX_LISTENERS;
    this.captureRejections = options?.captureRejections ?? false;
  }
  // ==========================================================================
  // Core Methods
  // ==========================================================================
  on(event, listener, options) {
    return this.addListener(event, listener, { ...options, once: false });
  }
  once(event, listener) {
    return this.addListener(event, listener, { once: true });
  }
  off(event, listener) {
    return this.removeListener(event, listener);
  }
  emit(event, data) {
    const entries = this._listeners.get(event);
    if (!entries || entries.length === 0) {
      return false;
    }
    const toRemove = [];
    for (const entry of entries) {
      try {
        const result = entry.listener(data);
        if (this.captureRejections && result instanceof Promise) {
          result.catch((err) => {
            this.emit("error", err);
          });
        }
      } catch (err) {
        if (this.captureRejections) {
          this.emit("error", err);
        } else {
          throw err;
        }
      }
      if (entry.once) {
        toRemove.push(entry.listener);
      }
    }
    for (const listener of toRemove) {
      this.removeListener(event, listener);
    }
    return true;
  }
  async emitAsync(event, data) {
    const entries = this._listeners.get(event);
    if (!entries || entries.length === 0) {
      return false;
    }
    const toRemove = [];
    for (const entry of entries) {
      try {
        await entry.listener(data);
      } catch (err) {
        if (this.captureRejections) {
          this.emit("error", err);
        } else {
          throw err;
        }
      }
      if (entry.once) {
        toRemove.push(entry.listener);
      }
    }
    for (const listener of toRemove) {
      this.removeListener(event, listener);
    }
    return true;
  }
  async emitParallel(event, data) {
    const entries = this._listeners.get(event);
    if (!entries || entries.length === 0) {
      return false;
    }
    const promises = entries.map(async (entry) => {
      try {
        await entry.listener(data);
        return { entry, error: null };
      } catch (err) {
        return { entry, error: err };
      }
    });
    const results = await Promise.all(promises);
    const toRemove = [];
    for (const { entry, error } of results) {
      if (error) {
        if (this.captureRejections) {
          this.emit("error", error);
        } else {
          throw error;
        }
      }
      if (entry.once) {
        toRemove.push(entry.listener);
      }
    }
    for (const listener of toRemove) {
      this.removeListener(event, listener);
    }
    return true;
  }
  // ==========================================================================
  // Listener Management
  // ==========================================================================
  addListener(event, listener, options) {
    let entries = this._listeners.get(event);
    if (!entries) {
      entries = [];
      this._listeners.set(event, entries);
    }
    if (entries.length >= this.maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: Possible memory leak detected. ${entries.length + 1} listeners added to event "${event}".`
      );
    }
    const entry = {
      listener,
      once: options?.once ?? false
    };
    if (options?.prepend) {
      entries.unshift(entry);
    } else {
      entries.push(entry);
    }
    return this;
  }
  removeListener(event, listener) {
    const entries = this._listeners.get(event);
    if (!entries) return this;
    const index = entries.findIndex((e) => e.listener === listener);
    if (index !== -1) {
      entries.splice(index, 1);
    }
    if (entries.length === 0) {
      this._listeners.delete(event);
    }
    return this;
  }
  removeAllListeners(event) {
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
  listenerCount(event) {
    return this._listeners.get(event)?.length ?? 0;
  }
  getListeners(event) {
    return (this._listeners.get(event) ?? []).map((e) => e.listener);
  }
  eventNames() {
    return Array.from(this._listeners.keys());
  }
  getMaxListeners() {
    return this.maxListeners;
  }
  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }
  getStats() {
    const events = [];
    let totalListeners = 0;
    for (const [name, entries] of this._listeners) {
      events.push({ name, listeners: entries.length });
      totalListeners += entries.length;
    }
    return {
      eventCount: this._listeners.size,
      listenerCount: totalListeners,
      events
    };
  }
  // ==========================================================================
  // Promise-based Helpers
  // ==========================================================================
  waitFor(event, options) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const listener = (data) => {
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
};
function createEventEmitter(options) {
  return new EventEmitter(options);
}
var _EventBus = class _EventBus extends EventEmitter {
  static getInstance(name = "default") {
    let instance = _EventBus.instances.get(name);
    if (!instance) {
      instance = new _EventBus();
      _EventBus.instances.set(name, instance);
    }
    return instance;
  }
  static resetInstance(name = "default") {
    const instance = _EventBus.instances.get(name);
    if (instance) {
      instance.removeAllListeners();
      _EventBus.instances.delete(name);
    }
  }
  static resetAll() {
    for (const instance of _EventBus.instances.values()) {
      instance.removeAllListeners();
    }
    _EventBus.instances.clear();
  }
};
_EventBus.instances = /* @__PURE__ */ new Map();
var EventBus = _EventBus;
function once(emitter, event) {
  return new Promise((resolve) => {
    emitter.once(event, (data) => {
      resolve(data);
    });
  });
}
function onceWithTimeout(emitter, event, timeoutMs) {
  return Promise.race([
    once(emitter, event),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout waiting for "${event}"`)), timeoutMs);
    })
  ]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_MAX_LISTENERS,
  EventBus,
  EventEmitter,
  createEventEmitter,
  once,
  onceWithTimeout
});
//# sourceMappingURL=index.cjs.map