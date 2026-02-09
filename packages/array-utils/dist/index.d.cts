/**
 * @b0ase/array-utils
 *
 * Array utilities: groupBy, chunk, unique, flatten, sort, and more.
 *
 * @packageDocumentation
 */
/** Comparator function */
type Comparator<T> = (a: T, b: T) => number;
/** Key selector function */
type KeySelector<T, K> = (item: T, index: number) => K;
/** Predicate function */
type Predicate<T> = (item: T, index: number) => boolean;
/**
 * Group array by key
 */
declare function groupBy<T, K extends string | number>(arr: T[], keyFn: KeySelector<T, K>): Record<K, T[]>;
/**
 * Count items by key
 */
declare function countBy<T, K extends string | number>(arr: T[], keyFn: KeySelector<T, K>): Record<K, number>;
/**
 * Partition array into two based on predicate
 */
declare function partition<T>(arr: T[], predicate: Predicate<T>): [T[], T[]];
/**
 * Split array into chunks of specified size
 */
declare function chunk<T>(arr: T[], size: number): T[][];
/**
 * Split array into n equal parts
 */
declare function splitInto<T>(arr: T[], n: number): T[][];
/**
 * Get unique values
 */
declare function unique<T>(arr: T[]): T[];
/**
 * Get unique values by key
 */
declare function uniqueBy<T, K>(arr: T[], keyFn: KeySelector<T, K>): T[];
/**
 * Get duplicate values
 */
declare function duplicates<T>(arr: T[]): T[];
/**
 * Flatten nested arrays one level
 */
declare function flatten<T>(arr: T[][]): T[];
/**
 * Flatten nested arrays deeply
 */
declare function flattenDeep<T>(arr: unknown[]): T[];
/**
 * Flatten and map in one pass
 */
declare function flatMap<T, R>(arr: T[], fn: (item: T, index: number) => R[]): R[];
/**
 * Sort array by key (ascending)
 */
declare function sortBy<T, K>(arr: T[], keyFn: KeySelector<T, K>): T[];
/**
 * Sort array by key (descending)
 */
declare function sortByDesc<T, K>(arr: T[], keyFn: KeySelector<T, K>): T[];
/**
 * Sort array by multiple keys
 */
declare function sortByMultiple<T>(arr: T[], comparators: Comparator<T>[]): T[];
/**
 * Reverse array (immutable)
 */
declare function reverse<T>(arr: T[]): T[];
/**
 * Shuffle array
 */
declare function shuffle<T>(arr: T[]): T[];
/**
 * Get first n items
 */
declare function take<T>(arr: T[], n: number): T[];
/**
 * Get last n items
 */
declare function takeLast<T>(arr: T[], n: number): T[];
/**
 * Skip first n items
 */
declare function skip<T>(arr: T[], n: number): T[];
/**
 * Skip last n items
 */
declare function skipLast<T>(arr: T[], n: number): T[];
/**
 * Get first item or undefined
 */
declare function first<T>(arr: T[]): T | undefined;
/**
 * Get last item or undefined
 */
declare function last<T>(arr: T[]): T | undefined;
/**
 * Get item at index (supports negative indices)
 */
declare function at<T>(arr: T[], index: number): T | undefined;
/**
 * Get random item
 */
declare function sample<T>(arr: T[]): T | undefined;
/**
 * Get n random items
 */
declare function sampleSize<T>(arr: T[], n: number): T[];
/**
 * Find item by predicate
 */
declare function find<T>(arr: T[], predicate: Predicate<T>): T | undefined;
/**
 * Find last item by predicate
 */
declare function findLast<T>(arr: T[], predicate: Predicate<T>): T | undefined;
/**
 * Find index by predicate
 */
declare function findIndex<T>(arr: T[], predicate: Predicate<T>): number;
/**
 * Find last index by predicate
 */
declare function findLastIndex<T>(arr: T[], predicate: Predicate<T>): number;
/**
 * Check if array includes item
 */
declare function includes<T>(arr: T[], item: T): boolean;
/**
 * Check if any item matches predicate
 */
declare function some<T>(arr: T[], predicate: Predicate<T>): boolean;
/**
 * Check if all items match predicate
 */
declare function every<T>(arr: T[], predicate: Predicate<T>): boolean;
/**
 * Check if none match predicate
 */
declare function none<T>(arr: T[], predicate: Predicate<T>): boolean;
/**
 * Get intersection of arrays
 */
declare function intersection<T>(...arrays: T[][]): T[];
/**
 * Get union of arrays
 */
declare function union<T>(...arrays: T[][]): T[];
/**
 * Get difference (items in first but not in second)
 */
declare function difference<T>(arr: T[], exclude: T[]): T[];
/**
 * Get symmetric difference (items in either but not both)
 */
declare function symmetricDifference<T>(a: T[], b: T[]): T[];
/**
 * Compact array (remove falsy values)
 */
declare function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[];
/**
 * Zip multiple arrays together
 */
declare function zip<T>(...arrays: T[][]): T[][];
/**
 * Unzip array of tuples
 */
declare function unzip<T>(arr: T[][]): T[][];
/**
 * Create object from key-value pairs
 */
declare function keyBy<T, K extends string | number>(arr: T[], keyFn: KeySelector<T, K>): Record<K, T>;
/**
 * Sum array of numbers
 */
declare function sum(arr: number[]): number;
/**
 * Sum by key
 */
declare function sumBy<T>(arr: T[], fn: (item: T) => number): number;
/**
 * Get average
 */
declare function average(arr: number[]): number;
/**
 * Get minimum value
 */
declare function min(arr: number[]): number | undefined;
/**
 * Get minimum by key
 */
declare function minBy<T>(arr: T[], fn: (item: T) => number): T | undefined;
/**
 * Get maximum value
 */
declare function max(arr: number[]): number | undefined;
/**
 * Get maximum by key
 */
declare function maxBy<T>(arr: T[], fn: (item: T) => number): T | undefined;
/**
 * Create range of numbers
 */
declare function range(start: number, end: number, step?: number): number[];
/**
 * Insert item at index (immutable)
 */
declare function insert<T>(arr: T[], index: number, item: T): T[];
/**
 * Remove item at index (immutable)
 */
declare function removeAt<T>(arr: T[], index: number): T[];
/**
 * Remove first occurrence of item (immutable)
 */
declare function remove<T>(arr: T[], item: T): T[];
/**
 * Replace item at index (immutable)
 */
declare function replaceAt<T>(arr: T[], index: number, item: T): T[];
/**
 * Move item from one index to another (immutable)
 */
declare function move<T>(arr: T[], from: number, to: number): T[];

export { type Comparator, type KeySelector, type Predicate, at, average, chunk, compact, countBy, difference, duplicates, every, find, findIndex, findLast, findLastIndex, first, flatMap, flatten, flattenDeep, groupBy, includes, insert, intersection, keyBy, last, max, maxBy, min, minBy, move, none, partition, range, remove, removeAt, replaceAt, reverse, sample, sampleSize, shuffle, skip, skipLast, some, sortBy, sortByDesc, sortByMultiple, splitInto, sum, sumBy, symmetricDifference, take, takeLast, union, unique, uniqueBy, unzip, zip };
