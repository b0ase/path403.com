// src/index.ts
var LOG_LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60
};
var formatters = {
  simple: (entry) => {
    const time = entry.timestamp.split("T")[1]?.split(".")[0] || entry.timestamp;
    const ns = entry.namespace ? `[${entry.namespace}]` : "";
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
    const error = entry.error ? ` Error: ${entry.error.message}` : "";
    return `${time} ${entry.level.toUpperCase().padEnd(5)} ${ns} ${entry.message}${data}${error}`;
  },
  json: (entry) => {
    return JSON.stringify({
      ...entry,
      error: entry.error ? { message: entry.error.message, stack: entry.error.stack } : void 0
    });
  },
  pretty: (entry) => {
    const colors = {
      trace: "\x1B[90m",
      debug: "\x1B[36m",
      info: "\x1B[32m",
      warn: "\x1B[33m",
      error: "\x1B[31m",
      fatal: "\x1B[35m"
    };
    const reset = "\x1B[0m";
    const color = colors[entry.level];
    const time = entry.timestamp.split("T")[1]?.split(".")[0] || entry.timestamp;
    const ns = entry.namespace ? `${color}[${entry.namespace}]${reset}` : "";
    const data = entry.data ? `
  ${JSON.stringify(entry.data, null, 2)}` : "";
    const error = entry.error ? `
  ${entry.error.stack || entry.error.message}` : "";
    return `${time} ${color}${entry.level.toUpperCase().padEnd(5)}${reset} ${ns} ${entry.message}${data}${error}`;
  }
};
var transports = {
  console: (formatter = formatters.simple) => {
    return (entry) => {
      const output = formatter(entry);
      if (entry.level === "error" || entry.level === "fatal") {
        console.error(output);
      } else if (entry.level === "warn") {
        console.warn(output);
      } else if (entry.level === "debug" || entry.level === "trace") {
        console.debug(output);
      } else {
        console.log(output);
      }
    };
  },
  memory: (buffer, maxSize = 1e3) => {
    return (entry) => {
      buffer.push(entry);
      if (buffer.length > maxSize) {
        buffer.shift();
      }
    };
  },
  callback: (fn) => fn
};
var Logger = class _Logger {
  constructor(options = {}) {
    this.namespace = options.namespace || "";
    this.level = options.level || "info";
    this.transports = options.transports || [transports.console(formatters.simple)];
    this.context = options.context || {};
    this.enabled = options.enabled !== false;
  }
  // ==========================================================================
  // Configuration
  // ==========================================================================
  setLevel(level) {
    this.level = level;
    return this;
  }
  getLevel() {
    return this.level;
  }
  enable() {
    this.enabled = true;
    return this;
  }
  disable() {
    this.enabled = false;
    return this;
  }
  isEnabled() {
    return this.enabled;
  }
  addTransport(transport) {
    this.transports.push(transport);
    return this;
  }
  clearTransports() {
    this.transports = [];
    return this;
  }
  setContext(context) {
    this.context = context;
    return this;
  }
  addContext(context) {
    this.context = { ...this.context, ...context };
    return this;
  }
  // ==========================================================================
  // Child Loggers
  // ==========================================================================
  child(namespace, options) {
    const childNamespace = this.namespace ? `${this.namespace}:${namespace}` : namespace;
    return new _Logger({
      namespace: childNamespace,
      level: options?.level || this.level,
      transports: options?.transports || this.transports,
      context: { ...this.context, ...options?.context },
      enabled: options?.enabled ?? this.enabled
    });
  }
  // ==========================================================================
  // Logging Methods
  // ==========================================================================
  shouldLog(level) {
    return this.enabled && LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }
  log(level, message, data, error) {
    if (!this.shouldLog(level)) return;
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      namespace: this.namespace,
      message,
      data: data ? { ...this.context, ...data } : Object.keys(this.context).length > 0 ? this.context : void 0,
      error
    };
    for (const transport of this.transports) {
      try {
        transport(entry);
      } catch {
      }
    }
  }
  trace(message, data) {
    this.log("trace", message, data);
  }
  debug(message, data) {
    this.log("debug", message, data);
  }
  info(message, data) {
    this.log("info", message, data);
  }
  warn(message, data) {
    this.log("warn", message, data);
  }
  error(message, error, data) {
    if (error instanceof Error) {
      this.log("error", message, data, error);
    } else {
      this.log("error", message, error);
    }
  }
  fatal(message, error, data) {
    if (error instanceof Error) {
      this.log("fatal", message, data, error);
    } else {
      this.log("fatal", message, error);
    }
  }
  // ==========================================================================
  // Utility Methods
  // ==========================================================================
  time(label) {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { duration, durationMs: duration });
    };
  }
  async timed(label, fn) {
    const end = this.time(label);
    try {
      const result = await fn();
      end();
      return result;
    } catch (err) {
      this.error(`${label} failed`, err instanceof Error ? err : void 0);
      throw err;
    }
  }
};
function createLogger(options) {
  return new Logger(options);
}
var loggerRegistry = /* @__PURE__ */ new Map();
function getLogger(namespace, options) {
  let logger = loggerRegistry.get(namespace);
  if (!logger) {
    logger = createLogger({ ...options, namespace });
    loggerRegistry.set(namespace, logger);
  }
  return logger;
}
function setGlobalLevel(level) {
  for (const logger of loggerRegistry.values()) {
    logger.setLevel(level);
  }
}
function enableAll() {
  for (const logger of loggerRegistry.values()) {
    logger.enable();
  }
}
function disableAll() {
  for (const logger of loggerRegistry.values()) {
    logger.disable();
  }
}
function clearLoggers() {
  loggerRegistry.clear();
}
var log = createLogger({ namespace: "app" });
export {
  LOG_LEVELS,
  Logger,
  clearLoggers,
  createLogger,
  disableAll,
  enableAll,
  formatters,
  getLogger,
  log,
  setGlobalLevel,
  transports
};
//# sourceMappingURL=index.js.map