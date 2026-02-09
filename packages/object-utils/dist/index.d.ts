/**
 * @b0ase/object-utils
 *
 * Object utilities: deep clone, merge, pick, omit, diff, and more.
 *
 * @packageDocumentation
 */
/** Generic object type */
type PlainObject = Record<string, unknown>;
/** Path type for nested access */
type Path = string | (string | number)[];
/** Diff result */
interface DiffResult {
    added: PlainObject;
    removed: PlainObject;
    changed: PlainObject;
    unchanged: PlainObject;
}
/**
 * Check if value is a plain object
 */
declare function isPlainObject(value: unknown): value is PlainObject;
/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
declare function isEmpty(value: unknown): boolean;
/**
 * Check if value is not empty
 */
declare function isNotEmpty<T>(value: T): value is NonNullable<T>;
/**
 * Deep clone an object
 */
declare function deepClone<T>(value: T): T;
/**
 * Shallow clone an object
 */
declare function shallowClone<T>(value: T): T;
/**
 * Deep merge objects
 */
declare function deepMerge<T extends PlainObject>(...objects: Partial<T>[]): T;
/**
 * Shallow merge objects
 */
declare function shallowMerge<T extends PlainObject>(...objects: Partial<T>[]): T;
/**
 * Pick specified keys from object
 */
declare function pick<T extends PlainObject, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Omit specified keys from object
 */
declare function omit<T extends PlainObject, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * Pick keys by predicate
 */
declare function pickBy<T extends PlainObject>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T>;
/**
 * Omit keys by predicate
 */
declare function omitBy<T extends PlainObject>(obj: T, predicate: (value: T[keyof T], key: keyof T) => boolean): Partial<T>;
/**
 * Get value at path
 */
declare function get<T = unknown>(obj: PlainObject, path: Path, defaultValue?: T): T | undefined;
/**
 * Set value at path
 */
declare function set<T extends PlainObject>(obj: T, path: Path, value: unknown): T;
/**
 * Check if path exists in object
 */
declare function has(obj: PlainObject, path: Path): boolean;
/**
 * Delete value at path
 */
declare function unset<T extends PlainObject>(obj: T, path: Path): T;
/**
 * Map object values
 */
declare function mapValues<T extends PlainObject, R>(obj: T, fn: (value: T[keyof T], key: keyof T) => R): Record<keyof T, R>;
/**
 * Map object keys
 */
declare function mapKeys<T extends PlainObject>(obj: T, fn: (key: keyof T, value: T[keyof T]) => string): PlainObject;
/**
 * Filter object entries
 */
declare function filterEntries<T extends PlainObject>(obj: T, predicate: (key: keyof T, value: T[keyof T]) => boolean): Partial<T>;
/**
 * Flatten nested object
 */
declare function flatten(obj: PlainObject, delimiter?: string): PlainObject;
/**
 * Unflatten object
 */
declare function unflatten(obj: PlainObject, delimiter?: string): PlainObject;
/**
 * Deep equality check
 */
declare function deepEqual(a: unknown, b: unknown): boolean;
/**
 * Get diff between two objects
 */
declare function diff(a: PlainObject, b: PlainObject): DiffResult;
/**
 * Create object from entries
 */
declare function fromEntries<K extends string, V>(entries: [K, V][]): Record<K, V>;
/**
 * Create object from keys with default value
 */
declare function fromKeys<K extends string, V>(keys: K[], value: V): Record<K, V>;
/**
 * Create object from keys with value factory
 */
declare function fromKeysBy<K extends string, V>(keys: K[], fn: (key: K) => V): Record<K, V>;
/**
 * Invert object keys and values
 */
declare function invert<T extends PlainObject>(obj: T): PlainObject;
/**
 * Remove null and undefined values
 */
declare function compact<T extends PlainObject>(obj: T): Partial<T>;
/**
 * Remove falsy values
 */
declare function compactFalsy<T extends PlainObject>(obj: T): Partial<T>;
/**
 * Set default values for undefined keys
 */
declare function defaults<T extends PlainObject>(obj: Partial<T>, defaultValues: T): T;
/**
 * For each entry in object
 */
declare function forEachEntry<T extends PlainObject>(obj: T, fn: (key: keyof T, value: T[keyof T]) => void): void;
/**
 * Get entries as array
 */
declare function entries<T extends PlainObject>(obj: T): Array<[keyof T, T[keyof T]]>;
/**
 * Get keys as array
 */
declare function keys<T extends PlainObject>(obj: T): Array<keyof T>;
/**
 * Get values as array
 */
declare function values<T extends PlainObject>(obj: T): Array<T[keyof T]>;

export { type DiffResult, type Path, type PlainObject, compact, compactFalsy, deepClone, deepEqual, deepMerge, defaults, diff, entries, filterEntries, flatten, forEachEntry, fromEntries, fromKeys, fromKeysBy, get, has, invert, isEmpty, isNotEmpty, isPlainObject, keys, mapKeys, mapValues, omit, omitBy, pick, pickBy, set, shallowClone, shallowMerge, unflatten, unset, values };
