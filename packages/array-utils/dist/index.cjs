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
  at: () => at,
  average: () => average,
  chunk: () => chunk,
  compact: () => compact,
  countBy: () => countBy,
  difference: () => difference,
  duplicates: () => duplicates,
  every: () => every,
  find: () => find,
  findIndex: () => findIndex,
  findLast: () => findLast,
  findLastIndex: () => findLastIndex,
  first: () => first,
  flatMap: () => flatMap,
  flatten: () => flatten,
  flattenDeep: () => flattenDeep,
  groupBy: () => groupBy,
  includes: () => includes,
  insert: () => insert,
  intersection: () => intersection,
  keyBy: () => keyBy,
  last: () => last,
  max: () => max,
  maxBy: () => maxBy,
  min: () => min,
  minBy: () => minBy,
  move: () => move,
  none: () => none,
  partition: () => partition,
  range: () => range,
  remove: () => remove,
  removeAt: () => removeAt,
  replaceAt: () => replaceAt,
  reverse: () => reverse,
  sample: () => sample,
  sampleSize: () => sampleSize,
  shuffle: () => shuffle,
  skip: () => skip,
  skipLast: () => skipLast,
  some: () => some,
  sortBy: () => sortBy,
  sortByDesc: () => sortByDesc,
  sortByMultiple: () => sortByMultiple,
  splitInto: () => splitInto,
  sum: () => sum,
  sumBy: () => sumBy,
  symmetricDifference: () => symmetricDifference,
  take: () => take,
  takeLast: () => takeLast,
  union: () => union,
  unique: () => unique,
  uniqueBy: () => uniqueBy,
  unzip: () => unzip,
  zip: () => zip
});
module.exports = __toCommonJS(index_exports);
function groupBy(arr, keyFn) {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    if (!(key in result)) {
      result[key] = [];
    }
    result[key].push(arr[i]);
  }
  return result;
}
function countBy(arr, keyFn) {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}
function partition(arr, predicate) {
  const pass = [];
  const fail = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i)) {
      pass.push(arr[i]);
    } else {
      fail.push(arr[i]);
    }
  }
  return [pass, fail];
}
function chunk(arr, size) {
  if (size <= 0) return [];
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
function splitInto(arr, n) {
  if (n <= 0) return [];
  const size = Math.ceil(arr.length / n);
  return chunk(arr, size);
}
function unique(arr) {
  return [...new Set(arr)];
}
function uniqueBy(arr, keyFn) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(arr[i]);
    }
  }
  return result;
}
function duplicates(arr) {
  const seen = /* @__PURE__ */ new Set();
  const dupes = /* @__PURE__ */ new Set();
  for (const item of arr) {
    if (seen.has(item)) {
      dupes.add(item);
    } else {
      seen.add(item);
    }
  }
  return [...dupes];
}
function flatten(arr) {
  return arr.flat();
}
function flattenDeep(arr) {
  return arr.flat(Infinity);
}
function flatMap(arr, fn) {
  return arr.flatMap(fn);
}
function sortBy(arr, keyFn) {
  return [...arr].sort((a, b) => {
    const keyA = keyFn(a, 0);
    const keyB = keyFn(b, 0);
    if (keyA < keyB) return -1;
    if (keyA > keyB) return 1;
    return 0;
  });
}
function sortByDesc(arr, keyFn) {
  return [...arr].sort((a, b) => {
    const keyA = keyFn(a, 0);
    const keyB = keyFn(b, 0);
    if (keyA > keyB) return -1;
    if (keyA < keyB) return 1;
    return 0;
  });
}
function sortByMultiple(arr, comparators) {
  return [...arr].sort((a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}
function reverse(arr) {
  return [...arr].reverse();
}
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function take(arr, n) {
  return arr.slice(0, n);
}
function takeLast(arr, n) {
  return arr.slice(-n);
}
function skip(arr, n) {
  return arr.slice(n);
}
function skipLast(arr, n) {
  return arr.slice(0, -n || void 0);
}
function first(arr) {
  return arr[0];
}
function last(arr) {
  return arr[arr.length - 1];
}
function at(arr, index) {
  const i = index < 0 ? arr.length + index : index;
  return arr[i];
}
function sample(arr) {
  if (arr.length === 0) return void 0;
  return arr[Math.floor(Math.random() * arr.length)];
}
function sampleSize(arr, n) {
  return shuffle(arr).slice(0, n);
}
function find(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i)) {
      return arr[i];
    }
  }
  return void 0;
}
function findLast(arr, predicate) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i)) {
      return arr[i];
    }
  }
  return void 0;
}
function findIndex(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i)) {
      return i;
    }
  }
  return -1;
}
function findLastIndex(arr, predicate) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i], i)) {
      return i;
    }
  }
  return -1;
}
function includes(arr, item) {
  return arr.includes(item);
}
function some(arr, predicate) {
  return arr.some((item, index) => predicate(item, index));
}
function every(arr, predicate) {
  return arr.every((item, index) => predicate(item, index));
}
function none(arr, predicate) {
  return !some(arr, predicate);
}
function intersection(...arrays) {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return [...arrays[0]];
  const [first2, ...rest] = arrays;
  const sets = rest.map((arr) => new Set(arr));
  return first2.filter((item) => sets.every((set) => set.has(item)));
}
function union(...arrays) {
  return unique(arrays.flat());
}
function difference(arr, exclude) {
  const excludeSet = new Set(exclude);
  return arr.filter((item) => !excludeSet.has(item));
}
function symmetricDifference(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  return [
    ...a.filter((item) => !setB.has(item)),
    ...b.filter((item) => !setA.has(item))
  ];
}
function compact(arr) {
  return arr.filter(Boolean);
}
function zip(...arrays) {
  const maxLength = Math.max(...arrays.map((arr) => arr.length));
  const result = [];
  for (let i = 0; i < maxLength; i++) {
    result.push(arrays.map((arr) => arr[i]));
  }
  return result;
}
function unzip(arr) {
  if (arr.length === 0) return [];
  const maxLength = Math.max(...arr.map((tuple) => tuple.length));
  const result = Array.from({ length: maxLength }, () => []);
  for (const tuple of arr) {
    for (let i = 0; i < maxLength; i++) {
      result[i].push(tuple[i]);
    }
  }
  return result;
}
function keyBy(arr, keyFn) {
  const result = {};
  for (let i = 0; i < arr.length; i++) {
    const key = keyFn(arr[i], i);
    result[key] = arr[i];
  }
  return result;
}
function sum(arr) {
  return arr.reduce((acc, val) => acc + val, 0);
}
function sumBy(arr, fn) {
  return arr.reduce((acc, item) => acc + fn(item), 0);
}
function average(arr) {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
}
function min(arr) {
  if (arr.length === 0) return void 0;
  return Math.min(...arr);
}
function minBy(arr, fn) {
  if (arr.length === 0) return void 0;
  return arr.reduce((min2, item) => fn(item) < fn(min2) ? item : min2);
}
function max(arr) {
  if (arr.length === 0) return void 0;
  return Math.max(...arr);
}
function maxBy(arr, fn) {
  if (arr.length === 0) return void 0;
  return arr.reduce((max2, item) => fn(item) > fn(max2) ? item : max2);
}
function range(start, end, step = 1) {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}
function insert(arr, index, item) {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}
function removeAt(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
function remove(arr, item) {
  const index = arr.indexOf(item);
  if (index === -1) return [...arr];
  return removeAt(arr, index);
}
function replaceAt(arr, index, item) {
  return [...arr.slice(0, index), item, ...arr.slice(index + 1)];
}
function move(arr, from, to) {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  at,
  average,
  chunk,
  compact,
  countBy,
  difference,
  duplicates,
  every,
  find,
  findIndex,
  findLast,
  findLastIndex,
  first,
  flatMap,
  flatten,
  flattenDeep,
  groupBy,
  includes,
  insert,
  intersection,
  keyBy,
  last,
  max,
  maxBy,
  min,
  minBy,
  move,
  none,
  partition,
  range,
  remove,
  removeAt,
  replaceAt,
  reverse,
  sample,
  sampleSize,
  shuffle,
  skip,
  skipLast,
  some,
  sortBy,
  sortByDesc,
  sortByMultiple,
  splitInto,
  sum,
  sumBy,
  symmetricDifference,
  take,
  takeLast,
  union,
  unique,
  uniqueBy,
  unzip,
  zip
});
//# sourceMappingURL=index.cjs.map