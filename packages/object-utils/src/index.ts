/**
 * @b0ase/object-utils
 *
 * Object utilities: deep clone, merge, pick, omit, diff, and more.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Generic object type */
export type PlainObject = Record<string, unknown>;

/** Path type for nested access */
export type Path = string | (string | number)[];

/** Diff result */
export interface DiffResult {
  added: PlainObject;
  removed: PlainObject;
  changed: PlainObject;
  unchanged: PlainObject;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is a plain object
 */
export function isPlainObject(value: unknown): value is PlainObject {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if value is not empty
 */
export function isNotEmpty<T>(value: T): value is NonNullable<T> {
  return !isEmpty(value);
}

// ============================================================================
// Deep Clone
// ============================================================================

/**
 * Deep clone an object
 */
export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof Map) {
    return new Map(Array.from(value.entries()).map(([k, v]) => [deepClone(k), deepClone(v)])) as T;
  }

  if (value instanceof Set) {
    return new Set(Array.from(value).map((item) => deepClone(item))) as T;
  }

  const result: PlainObject = {};
  for (const key of Object.keys(value)) {
    result[key] = deepClone((value as PlainObject)[key]);
  }
  return result as T;
}

/**
 * Shallow clone an object
 */
export function shallowClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return [...value] as T;
  }

  return { ...value };
}

// ============================================================================
// Deep Merge
// ============================================================================

/**
 * Deep merge objects
 */
export function deepMerge<T extends PlainObject>(...objects: Partial<T>[]): T {
  const result: PlainObject = {};

  for (const obj of objects) {
    if (!obj) continue;

    for (const key of Object.keys(obj)) {
      const targetValue = result[key];
      const sourceValue = obj[key];

      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        result[key] = [...targetValue, ...sourceValue];
      } else if (sourceValue !== undefined) {
        result[key] = deepClone(sourceValue);
      }
    }
  }

  return result as T;
}

/**
 * Shallow merge objects
 */
export function shallowMerge<T extends PlainObject>(...objects: Partial<T>[]): T {
  return Object.assign({}, ...objects) as T;
}

// ============================================================================
// Pick & Omit
// ============================================================================

/**
 * Pick specified keys from object
 */
export function pick<T extends PlainObject, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specified keys from object
 */
export function omit<T extends PlainObject, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

/**
 * Pick keys by predicate
 */
export function pickBy<T extends PlainObject>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value as T[keyof T], key as keyof T)) {
      (result as PlainObject)[key] = value;
    }
  }
  return result;
}

/**
 * Omit keys by predicate
 */
export function omitBy<T extends PlainObject>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  return pickBy(obj, (value, key) => !predicate(value, key));
}

// ============================================================================
// Deep Access
// ============================================================================

/**
 * Get value at path
 */
export function get<T = unknown>(obj: PlainObject, path: Path, defaultValue?: T): T | undefined {
  const keys = typeof path === 'string' ? path.split('.') : path;
  let result: unknown = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = (result as PlainObject)[key];
  }

  return (result === undefined ? defaultValue : result) as T | undefined;
}

/**
 * Set value at path
 */
export function set<T extends PlainObject>(obj: T, path: Path, value: unknown): T {
  const keys = typeof path === 'string' ? path.split('.') : path;
  const result = deepClone(obj);
  let current: PlainObject = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || !isPlainObject(current[key])) {
      current[key] = typeof keys[i + 1] === 'number' ? [] : {};
    }
    current = current[key] as PlainObject;
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

/**
 * Check if path exists in object
 */
export function has(obj: PlainObject, path: Path): boolean {
  const keys = typeof path === 'string' ? path.split('.') : path;
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return false;
    }
    if (!(key in (current as PlainObject))) {
      return false;
    }
    current = (current as PlainObject)[key];
  }

  return true;
}

/**
 * Delete value at path
 */
export function unset<T extends PlainObject>(obj: T, path: Path): T {
  const keys = typeof path === 'string' ? path.split('.') : path;
  const result = deepClone(obj);
  let current: PlainObject = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      return result;
    }
    current = current[key] as PlainObject;
  }

  delete current[keys[keys.length - 1]];
  return result;
}

// ============================================================================
// Object Transformation
// ============================================================================

/**
 * Map object values
 */
export function mapValues<T extends PlainObject, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = fn(value as T[keyof T], key as keyof T);
  }
  return result;
}

/**
 * Map object keys
 */
export function mapKeys<T extends PlainObject>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => string
): PlainObject {
  const result: PlainObject = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = fn(key as keyof T, value as T[keyof T]);
    result[newKey] = value;
  }
  return result;
}

/**
 * Filter object entries
 */
export function filterEntries<T extends PlainObject>(
  obj: T,
  predicate: (key: keyof T, value: T[keyof T]) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key as keyof T, value as T[keyof T])) {
      (result as PlainObject)[key] = value;
    }
  }
  return result;
}

/**
 * Flatten nested object
 */
export function flatten(obj: PlainObject, delimiter: string = '.'): PlainObject {
  const result: PlainObject = {};

  function recurse(current: PlainObject, prefix: string): void {
    for (const [key, value] of Object.entries(current)) {
      const newKey = prefix ? `${prefix}${delimiter}${key}` : key;
      if (isPlainObject(value)) {
        recurse(value, newKey);
      } else {
        result[newKey] = value;
      }
    }
  }

  recurse(obj, '');
  return result;
}

/**
 * Unflatten object
 */
export function unflatten(obj: PlainObject, delimiter: string = '.'): PlainObject {
  const result: PlainObject = {};

  for (const [key, value] of Object.entries(obj)) {
    const keys = key.split(delimiter);
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k] as PlainObject;
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}

// ============================================================================
// Comparison
// ============================================================================

/**
 * Deep equality check
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (a === null || b === null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as PlainObject);
    const keysB = Object.keys(b as PlainObject);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) =>
      deepEqual((a as PlainObject)[key], (b as PlainObject)[key])
    );
  }

  return false;
}

/**
 * Get diff between two objects
 */
export function diff(a: PlainObject, b: PlainObject): DiffResult {
  const added: PlainObject = {};
  const removed: PlainObject = {};
  const changed: PlainObject = {};
  const unchanged: PlainObject = {};

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const inA = key in a;
    const inB = key in b;

    if (inA && !inB) {
      removed[key] = a[key];
    } else if (!inA && inB) {
      added[key] = b[key];
    } else if (deepEqual(a[key], b[key])) {
      unchanged[key] = a[key];
    } else {
      changed[key] = { from: a[key], to: b[key] };
    }
  }

  return { added, removed, changed, unchanged };
}

// ============================================================================
// Object Creation
// ============================================================================

/**
 * Create object from entries
 */
export function fromEntries<K extends string, V>(entries: [K, V][]): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * Create object from keys with default value
 */
export function fromKeys<K extends string, V>(keys: K[], value: V): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const key of keys) {
    result[key] = value;
  }
  return result;
}

/**
 * Create object from keys with value factory
 */
export function fromKeysBy<K extends string, V>(keys: K[], fn: (key: K) => V): Record<K, V> {
  const result = {} as Record<K, V>;
  for (const key of keys) {
    result[key] = fn(key);
  }
  return result;
}

/**
 * Invert object keys and values
 */
export function invert<T extends PlainObject>(obj: T): PlainObject {
  const result: PlainObject = {};
  for (const [key, value] of Object.entries(obj)) {
    result[String(value)] = key;
  }
  return result;
}

// ============================================================================
// Null/Undefined Handling
// ============================================================================

/**
 * Remove null and undefined values
 */
export function compact<T extends PlainObject>(obj: T): Partial<T> {
  return pickBy(obj, (value) => value !== null && value !== undefined) as Partial<T>;
}

/**
 * Remove falsy values
 */
export function compactFalsy<T extends PlainObject>(obj: T): Partial<T> {
  return pickBy(obj, (value) => Boolean(value)) as Partial<T>;
}

/**
 * Set default values for undefined keys
 */
export function defaults<T extends PlainObject>(obj: Partial<T>, defaultValues: T): T {
  const result = { ...defaultValues };
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      (result as PlainObject)[key] = value;
    }
  }
  return result;
}

// ============================================================================
// Iteration
// ============================================================================

/**
 * For each entry in object
 */
export function forEachEntry<T extends PlainObject>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => void
): void {
  for (const [key, value] of Object.entries(obj)) {
    fn(key as keyof T, value as T[keyof T]);
  }
}

/**
 * Get entries as array
 */
export function entries<T extends PlainObject>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>;
}

/**
 * Get keys as array
 */
export function keys<T extends PlainObject>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Get values as array
 */
export function values<T extends PlainObject>(obj: T): Array<T[keyof T]> {
  return Object.values(obj) as Array<T[keyof T]>;
}
