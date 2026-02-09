/**
 * @b0ase/array-utils
 *
 * Array utilities: groupBy, chunk, unique, flatten, sort, and more.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Comparator function */
export type Comparator<T> = (a: T, b: T) => number;

/** Key selector function */
export type KeySelector<T, K> = (item: T, index: number) => K;

/** Predicate function */
export type Predicate<T> = (item: T, index: number) => boolean;

// ============================================================================
// Grouping
// ============================================================================

/**
 * Group array by key
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: KeySelector<T, K>
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;

  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    if (!(key in result)) {
      result[key] = [];
    }
    result[key].push(arr[i]);
  }

  return result;
}

/**
 * Count items by key
 */
export function countBy<T, K extends string | number>(
  arr: T[],
  keyFn: KeySelector<T, K>
): Record<K, number> {
  const result = {} as Record<K, number>;

  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    result[key] = (result[key] || 0) + 1;
  }

  return result;
}

/**
 * Partition array into two based on predicate
 */
export function partition<T>(arr: T[], predicate: Predicate<T>): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i)) {
      pass.push(arr[i]);
    } else {
      fail.push(arr[i]);
    }
  }

  return [pass, fail];
}

// ============================================================================
// Chunking
// ============================================================================

/**
 * Split array into chunks of specified size
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [];

  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Split array into n equal parts
 */
export function splitInto<T>(arr: T[], n: number): T[][] {
  if (n <= 0) return [];

  const size = Math.ceil(arr.length / n);
  return chunk(arr, size);
}

// ============================================================================
// Uniqueness
// ============================================================================

/**
 * Get unique values
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Get unique values by key
 */
export function uniqueBy<T, K>(arr: T[], keyFn: KeySelector<T, K>): T[] {
  const seen = new Set<K>();
  const result: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(arr[i]);
    }
  }

  return result;
}

/**
 * Get duplicate values
 */
export function duplicates<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const dupes = new Set<T>();

  for (const item of arr) {
    if (seen.has(item)) {
      dupes.add(item);
    } else {
      seen.add(item);
    }
  }

  return [...dupes];
}

// ============================================================================
// Flattening
// ============================================================================

/**
 * Flatten nested arrays one level
 */
export function flatten<T>(arr: T[][]): T[] {
  return arr.flat();
}

/**
 * Flatten nested arrays deeply
 */
export function flattenDeep<T>(arr: unknown[]): T[] {
  return arr.flat(Infinity) as T[];
}

/**
 * Flatten and map in one pass
 */
export function flatMap<T, R>(arr: T[], fn: (item: T, index: number) => R[]): R[] {
  return arr.flatMap(fn);
}

// ============================================================================
// Sorting
// ============================================================================

/**
 * Sort array by key (ascending)
 */
export function sortBy<T, K>(arr: T[], keyFn: KeySelector<T, K>): T[] {
  return [...arr].sort((a, b) => {
    const keyA = keyFn(a, 0);
    const keyB = keyFn(b, 0);
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
}

/**
 * Sort array by key (descending)
 */
export function sortByDesc<T, K>(arr: T[], keyFn: KeySelector<T, K>): T[] {
  return [...arr].sort((a, b) => {
    const keyA = keyFn(a, 0);
    const keyB = keyFn(b, 0);
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
}

/**
 * Sort array by multiple keys
 */
export function sortByMultiple<T>(arr: T[], comparators: Comparator<T>[]): T[] {
  return [...arr].sort((a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

/**
 * Reverse array (immutable)
 */
export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

/**
 * Shuffle array
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ============================================================================
// Selection
// ============================================================================

/**
 * Get first n items
 */
export function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

/**
 * Get last n items
 */
export function takeLast<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

/**
 * Skip first n items
 */
export function skip<T>(arr: T[], n: number): T[] {
  return arr.slice(n);
}

/**
 * Skip last n items
 */
export function skipLast<T>(arr: T[], n: number): T[] {
  return arr.slice(0, -n || undefined);
}

/**
 * Get first item or undefined
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

/**
 * Get last item or undefined
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * Get item at index (supports negative indices)
 */
export function at<T>(arr: T[], index: number): T | undefined {
  const i = index < 0 ? arr.length + index : index;
  return arr[i];
}

/**
 * Get random item
 */
export function sample<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get n random items
 */
export function sampleSize<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

// ============================================================================
// Search
// ============================================================================

/**
 * Find item by predicate
 */
export function find<T>(arr: T[], predicate: Predicate<T>): T | undefined {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i)) {
      return arr[i];
    }
  }
  return undefined;
}

/**
 * Find last item by predicate
 */
export function findLast<T>(arr: T[], predicate: Predicate<T>): T | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i)) {
      return arr[i];
    }
  }
  return undefined;
}

/**
 * Find index by predicate
 */
export function findIndex<T>(arr: T[], predicate: Predicate<T>): number {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i)) {
      return i;
    }
  }
  return -1;
}

/**
 * Find last index by predicate
 */
export function findLastIndex<T>(arr: T[], predicate: Predicate<T>): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i)) {
      return i;
    }
  }
  return -1;
}

/**
 * Check if array includes item
 */
export function includes<T>(arr: T[], item: T): boolean {
  return arr.includes(item);
}

/**
 * Check if any item matches predicate
 */
export function some<T>(arr: T[], predicate: Predicate<T>): boolean {
  return arr.some((item, index) => predicate(item, index));
}

/**
 * Check if all items match predicate
 */
export function every<T>(arr: T[], predicate: Predicate<T>): boolean {
  return arr.every((item, index) => predicate(item, index));
}

/**
 * Check if none match predicate
 */
export function none<T>(arr: T[], predicate: Predicate<T>): boolean {
  return !some(arr, predicate);
}

// ============================================================================
// Set Operations
// ============================================================================

/**
 * Get intersection of arrays
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return [...arrays[0]];

  const [first, ...rest] = arrays;
  const sets = rest.map((arr) => new Set(arr));

  return first.filter((item) => sets.every((set) => set.has(item)));
}

/**
 * Get union of arrays
 */
export function union<T>(...arrays: T[][]): T[] {
  return unique(arrays.flat());
}

/**
 * Get difference (items in first but not in second)
 */
export function difference<T>(arr: T[], exclude: T[]): T[] {
  const excludeSet = new Set(exclude);
  return arr.filter((item) => !excludeSet.has(item));
}

/**
 * Get symmetric difference (items in either but not both)
 */
export function symmetricDifference<T>(a: T[], b: T[]): T[] {
  const setA = new Set(a);
  const setB = new Set(b);
  return [
    ...a.filter((item) => !setB.has(item)),
    ...b.filter((item) => !setA.has(item)),
  ];
}

// ============================================================================
// Transformation
// ============================================================================

/**
 * Compact array (remove falsy values)
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * Zip multiple arrays together
 */
export function zip<T>(...arrays: T[][]): T[][] {
  const maxLength = Math.max(...arrays.map((arr) => arr.length));
  const result: T[][] = [];

  for (let i = 0; i < maxLength; i++) {
    result.push(arrays.map((arr) => arr[i]));
  }

  return result;
}

/**
 * Unzip array of tuples
 */
export function unzip<T>(arr: T[][]): T[][] {
  if (arr.length === 0) return [];
  const maxLength = Math.max(...arr.map((tuple) => tuple.length));
  const result: T[][] = Array.from({ length: maxLength }, () => []);

  for (const tuple of arr) {
    for (let i = 0; i < maxLength; i++) {
      result[i].push(tuple[i]);
    }
  }

  return result;
}

/**
 * Create object from key-value pairs
 */
export function keyBy<T, K extends string | number>(
  arr: T[],
  keyFn: KeySelector<T, K>
): Record<K, T> {
  const result = {} as Record<K, T>;
  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    result[key] = arr[i];
  }
  return result;
}

// ============================================================================
// Numeric Operations
// ============================================================================

/**
 * Sum array of numbers
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, val) => acc + val, 0);
}

/**
 * Sum by key
 */
export function sumBy<T>(arr: T[], fn: (item: T) => number): number {
  return arr.reduce((acc, item) => acc + fn(item), 0);
}

/**
 * Get average
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}

/**
 * Get minimum value
 */
export function min(arr: number[]): number | undefined {
  if (arr.length === 0) return undefined;
  return Math.min(...arr);
}

/**
 * Get minimum by key
 */
export function minBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((min, item) => (fn(item) < fn(min) ? item : min));
}

/**
 * Get maximum value
 */
export function max(arr: number[]): number | undefined {
  if (arr.length === 0) return undefined;
  return Math.max(...arr);
}

/**
 * Get maximum by key
 */
export function maxBy<T>(arr: T[], fn: (item: T) => number): T | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((max, item) => (fn(item) > fn(max) ? item : max));
}

/**
 * Create range of numbers
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

// ============================================================================
// Insertion & Removal
// ============================================================================

/**
 * Insert item at index (immutable)
 */
export function insert<T>(arr: T[], index: number, item: T): T[] {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}

/**
 * Remove item at index (immutable)
 */
export function removeAt<T>(arr: T[], index: number): T[] {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

/**
 * Remove first occurrence of item (immutable)
 */
export function remove<T>(arr: T[], item: T): T[] {
  const index = arr.indexOf(item);
  if (index === -1) return [...arr];
  return removeAt(arr, index);
}

/**
 * Replace item at index (immutable)
 */
export function replaceAt<T>(arr: T[], index: number, item: T): T[] {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)];
}

/**
 * Move item from one index to another (immutable)
 */
export function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}
