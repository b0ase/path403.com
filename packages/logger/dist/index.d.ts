/**
 * @b0ase/logger
 *
 * Structured logging with levels, namespaces, and transports.
 *
 * @packageDocumentation
 */
/** Log levels */
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
/** Log level numeric values */
declare const LOG_LEVELS: Record<LogLevel, number>;
/** Log entry */
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    namespace: string;
    message: string;
    data?: Record<string, unknown>;
    error?: Error;
}
/** Transport function */
type Transport = (entry: LogEntry) => void | Promise<void>;
/** Logger options */
interface LoggerOptions {
    namespace?: string;
    level?: LogLevel;
    transports?: Transport[];
    context?: Record<string, unknown>;
    enabled?: boolean;
}
/** Formatter function */
type Formatter = (entry: LogEntry) => string;
declare const formatters: {
    simple: (entry: LogEntry) => string;
    json: (entry: LogEntry) => string;
    pretty: (entry: LogEntry) => string;
};
declare const transports: {
    console: (formatter?: Formatter) => Transport;
    memory: (buffer: LogEntry[], maxSize?: number) => Transport;
    callback: (fn: (entry: LogEntry) => void) => Transport;
};
declare class Logger {
    private namespace;
    private level;
    private transports;
    private context;
    private enabled;
    constructor(options?: LoggerOptions);
    setLevel(level: LogLevel): this;
    getLevel(): LogLevel;
    enable(): this;
    disable(): this;
    isEnabled(): boolean;
    addTransport(transport: Transport): this;
    clearTransports(): this;
    setContext(context: Record<string, unknown>): this;
    addContext(context: Record<string, unknown>): this;
    child(namespace: string, options?: Partial<LoggerOptions>): Logger;
    private shouldLog;
    private log;
    trace(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, error?: Error | Record<string, unknown>, data?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | Record<string, unknown>, data?: Record<string, unknown>): void;
    time(label: string): () => void;
    timed<T>(label: string, fn: () => Promise<T>): Promise<T>;
}
declare function createLogger(options?: LoggerOptions): Logger;
declare function getLogger(namespace: string, options?: LoggerOptions): Logger;
declare function setGlobalLevel(level: LogLevel): void;
declare function enableAll(): void;
declare function disableAll(): void;
declare function clearLoggers(): void;
declare const log: Logger;

export { type Formatter, LOG_LEVELS, type LogEntry, type LogLevel, Logger, type LoggerOptions, type Transport, clearLoggers, createLogger, disableAll, enableAll, formatters, getLogger, log, setGlobalLevel, transports };
