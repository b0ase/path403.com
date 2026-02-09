/**
 * @b0ase/logger
 *
 * Structured logging with levels, namespaces, and transports.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Log levels */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Log level numeric values */
export const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

/** Log entry */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  namespace: string;
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
}

/** Transport function */
export type Transport = (entry: LogEntry) => void | Promise<void>;

/** Logger options */
export interface LoggerOptions {
  namespace?: string;
  level?: LogLevel;
  transports?: Transport[];
  context?: Record<string, unknown>;
  enabled?: boolean;
}

/** Formatter function */
export type Formatter = (entry: LogEntry) => string;

// ============================================================================
// Default Formatters
// ============================================================================

export const formatters = {
  simple: (entry: LogEntry): string => {
    const time = entry.timestamp.split('T')[1]?.split('.')[0] || entry.timestamp;
    const ns = entry.namespace ? `[${entry.namespace}]` : '';
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    const error = entry.error ? ` Error: ${entry.error.message}` : '';
    return `${time} ${entry.level.toUpperCase().padEnd(5)} ${ns} ${entry.message}${data}${error}`;
  },

  json: (entry: LogEntry): string => {
    return JSON.stringify({
      ...entry,
      error: entry.error ? { message: entry.error.message, stack: entry.error.stack } : undefined,
    });
  },

  pretty: (entry: LogEntry): string => {
    const colors: Record<LogLevel, string> = {
      trace: '\x1b[90m',
      debug: '\x1b[36m',
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      fatal: '\x1b[35m',
    };
    const reset = '\x1b[0m';
    const color = colors[entry.level];
    const time = entry.timestamp.split('T')[1]?.split('.')[0] || entry.timestamp;
    const ns = entry.namespace ? `${color}[${entry.namespace}]${reset}` : '';
    const data = entry.data ? `\n  ${JSON.stringify(entry.data, null, 2)}` : '';
    const error = entry.error ? `\n  ${entry.error.stack || entry.error.message}` : '';
    return `${time} ${color}${entry.level.toUpperCase().padEnd(5)}${reset} ${ns} ${entry.message}${data}${error}`;
  },
};

// ============================================================================
// Default Transports
// ============================================================================

export const transports = {
  console: (formatter: Formatter = formatters.simple): Transport => {
    return (entry: LogEntry) => {
      const output = formatter(entry);
      if (entry.level === 'error' || entry.level === 'fatal') {
        console.error(output);
      } else if (entry.level === 'warn') {
        console.warn(output);
      } else if (entry.level === 'debug' || entry.level === 'trace') {
        console.debug(output);
      } else {
        console.log(output);
      }
    };
  },

  memory: (buffer: LogEntry[], maxSize: number = 1000): Transport => {
    return (entry: LogEntry) => {
      buffer.push(entry);
      if (buffer.length > maxSize) {
        buffer.shift();
      }
    };
  },

  callback: (fn: (entry: LogEntry) => void): Transport => fn,
};

// ============================================================================
// Logger Class
// ============================================================================

export class Logger {
  private namespace: string;
  private level: LogLevel;
  private transports: Transport[];
  private context: Record<string, unknown>;
  private enabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.namespace = options.namespace || '';
    this.level = options.level || 'info';
    this.transports = options.transports || [transports.console(formatters.simple)];
    this.context = options.context || {};
    this.enabled = options.enabled !== false;
  }

  // ==========================================================================
  // Configuration
  // ==========================================================================

  setLevel(level: LogLevel): this {
    this.level = level;
    return this;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  enable(): this {
    this.enabled = true;
    return this;
  }

  disable(): this {
    this.enabled = false;
    return this;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  addTransport(transport: Transport): this {
    this.transports.push(transport);
    return this;
  }

  clearTransports(): this {
    this.transports = [];
    return this;
  }

  setContext(context: Record<string, unknown>): this {
    this.context = context;
    return this;
  }

  addContext(context: Record<string, unknown>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  // ==========================================================================
  // Child Loggers
  // ==========================================================================

  child(namespace: string, options?: Partial<LoggerOptions>): Logger {
    const childNamespace = this.namespace ? `${this.namespace}:${namespace}` : namespace;
    return new Logger({
      namespace: childNamespace,
      level: options?.level || this.level,
      transports: options?.transports || this.transports,
      context: { ...this.context, ...options?.context },
      enabled: options?.enabled ?? this.enabled,
    });
  }

  // ==========================================================================
  // Logging Methods
  // ==========================================================================

  private shouldLog(level: LogLevel): boolean {
    return this.enabled && LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      namespace: this.namespace,
      message,
      data: data ? { ...this.context, ...data } : Object.keys(this.context).length > 0 ? this.context : undefined,
      error,
    };

    for (const transport of this.transports) {
      try {
        transport(entry);
      } catch {
        // Silently ignore transport errors
      }
    }
  }

  trace(message: string, data?: Record<string, unknown>): void {
    this.log('trace', message, data);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | Record<string, unknown>, data?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.log('error', message, data, error);
    } else {
      this.log('error', message, error);
    }
  }

  fatal(message: string, error?: Error | Record<string, unknown>, data?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.log('fatal', message, data, error);
    } else {
      this.log('fatal', message, error);
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  time(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.debug(`${label} completed`, { duration, durationMs: duration });
    };
  }

  async timed<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const end = this.time(label);
    try {
      const result = await fn();
      end();
      return result;
    } catch (err) {
      this.error(`${label} failed`, err instanceof Error ? err : undefined);
      throw err;
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createLogger(options?: LoggerOptions): Logger {
  return new Logger(options);
}

// ============================================================================
// Global Logger Registry
// ============================================================================

const loggerRegistry = new Map<string, Logger>();

export function getLogger(namespace: string, options?: LoggerOptions): Logger {
  let logger = loggerRegistry.get(namespace);
  if (!logger) {
    logger = createLogger({ ...options, namespace });
    loggerRegistry.set(namespace, logger);
  }
  return logger;
}

export function setGlobalLevel(level: LogLevel): void {
  for (const logger of loggerRegistry.values()) {
    logger.setLevel(level);
  }
}

export function enableAll(): void {
  for (const logger of loggerRegistry.values()) {
    logger.enable();
  }
}

export function disableAll(): void {
  for (const logger of loggerRegistry.values()) {
    logger.disable();
  }
}

export function clearLoggers(): void {
  loggerRegistry.clear();
}

// ============================================================================
// Default Export
// ============================================================================

export const log = createLogger({ namespace: 'app' });
