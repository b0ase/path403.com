// src/index.ts
function isPlainObject(value) {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
function isEmpty(value) {
  if (value === null || value === void 0) return true;
  if (typeof value === "string") return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isPlainObject(value)) return Object.keys(value).length === 0;
  return false;
}
function isNotEmpty(value) {
  return !isEmpty(value);
}
function deepClone(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }
  if (value instanceof Date) {
    return new Date(value.getTime());
  }
  if (value instanceof Map) {
    return new Map(Array.from(value.entries()).map(([k, v]) => [deepClone(k), deepClone(v)]));
  }
  if (value instanceof Set) {
    return new Set(Array.from(value).map((item) => deepClone(item)));
  }
  const result = {};
  for (const key of Object.keys(value)) {
    result[key] = deepClone(value[key]);
  }
  return result;
}
function shallowClone(value) {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return [...value];
  }
  return { ...value };
}
function deepMerge(...objects) {
  const result = {};
  for (const obj of objects) {
    if (!obj) continue;
    for (const key of Object.keys(obj)) {
      const targetValue = result[key];
      const sourceValue = obj[key];
      if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        result[key] = [...targetValue, ...sourceValue];
      } else if (sourceValue !== void 0) {
        result[key] = deepClone(sourceValue);
      }
    }
  }
  return result;
}
function shallowMerge(...objects) {
  return Object.assign({}, ...objects);
}
function pick(obj, keys2) {
  const result = {};
  for (const key of keys2) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
function omit(obj, keys2) {
  const result = { ...obj };
  for (const key of keys2) {
    delete result[key];
  }
  return result;
}
function pickBy(obj, predicate) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(value, key)) {
      result[key] = value;
    }
  }
  return result;
}
function omitBy(obj, predicate) {
  return pickBy(obj, (value, key) => !predicate(value, key));
}
function get(obj, path, defaultValue) {
  const keys2 = typeof path === "string" ? path.split(".") : path;
  let result = obj;
  for (const key of keys2) {
    if (result === null || result === void 0) {
      return defaultValue;
    }
    result = result[key];
  }
  return result === void 0 ? defaultValue : result;
}
function set(obj, path, value) {
  const keys2 = typeof path === "string" ? path.split(".") : path;
  const result = deepClone(obj);
  let current = result;
  for (let i = 0; i < keys2.length - 1; i++) {
    const key = keys2[i];
    if (!(key in current) || !isPlainObject(current[key])) {
      current[key] = typeof keys2[i + 1] === "number" ? [] : {};
    }
    current = current[key];
  }
  current[keys2[keys2.length - 1]] = value;
  return result;
}
function has(obj, path) {
  const keys2 = typeof path === "string" ? path.split(".") : path;
  let current = obj;
  for (const key of keys2) {
    if (current === null || current === void 0) {
      return false;
    }
    if (!(key in current)) {
      return false;
    }
    current = current[key];
  }
  return true;
}
function unset(obj, path) {
  const keys2 = typeof path === "string" ? path.split(".") : path;
  const result = deepClone(obj);
  let current = result;
  for (let i = 0; i < keys2.length - 1; i++) {
    const key = keys2[i];
    if (!(key in current)) {
      return result;
    }
    current = current[key];
  }
  delete current[keys2[keys2.length - 1]];
  return result;
}
function mapValues(obj, fn) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = fn(value, key);
  }
  return result;
}
function mapKeys(obj, fn) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = fn(key, value);
    result[newKey] = value;
  }
  return result;
}
function filterEntries(obj, predicate) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, value)) {
      result[key] = value;
    }
  }
  return result;
}
function flatten(obj, delimiter = ".") {
  const result = {};
  function recurse(current, prefix) {
    for (const [key, value] of Object.entries(current)) {
      const newKey = prefix ? `${prefix}${delimiter}${key}` : key;
      if (isPlainObject(value)) {
        recurse(value, newKey);
      } else {
        result[newKey] = value;
      }
    }
  }
  recurse(obj, "");
  return result;
}
function unflatten(obj, delimiter = ".") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const keys2 = key.split(delimiter);
    let current = result;
    for (let i = 0; i < keys2.length - 1; i++) {
      const k = keys2[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }
    current[keys2[keys2.length - 1]] = value;
  }
  return result;
}
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(
      (key) => deepEqual(a[key], b[key])
    );
  }
  return false;
}
function diff(a, b) {
  const added = {};
  const removed = {};
  const changed = {};
  const unchanged = {};
  const allKeys = /* @__PURE__ */ new Set([...Object.keys(a), ...Object.keys(b)]);
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
function fromEntries(entries2) {
  return Object.fromEntries(entries2);
}
function fromKeys(keys2, value) {
  const result = {};
  for (const key of keys2) {
    result[key] = value;
  }
  return result;
}
function fromKeysBy(keys2, fn) {
  const result = {};
  for (const key of keys2) {
    result[key] = fn(key);
  }
  return result;
}
function invert(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[String(value)] = key;
  }
  return result;
}
function compact(obj) {
  return pickBy(obj, (value) => value !== null && value !== void 0);
}
function compactFalsy(obj) {
  return pickBy(obj, (value) => Boolean(value));
}
function defaults(obj, defaultValues) {
  const result = { ...defaultValues };
  for (const [key, value] of Object.entries(obj)) {
    if (value !== void 0) {
      result[key] = value;
    }
  }
  return result;
}
function forEachEntry(obj, fn) {
  for (const [key, value] of Object.entries(obj)) {
    fn(key, value);
  }
}
function entries(obj) {
  return Object.entries(obj);
}
function keys(obj) {
  return Object.keys(obj);
}
function values(obj) {
  return Object.values(obj);
}
export {
  compact,
  compactFalsy,
  deepClone,
  deepEqual,
  deepMerge,
  defaults,
  diff,
  entries,
  filterEntries,
  flatten,
  forEachEntry,
  fromEntries,
  fromKeys,
  fromKeysBy,
  get,
  has,
  invert,
  isEmpty,
  isNotEmpty,
  isPlainObject,
  keys,
  mapKeys,
  mapValues,
  omit,
  omitBy,
  pick,
  pickBy,
  set,
  shallowClone,
  shallowMerge,
  unflatten,
  unset,
  values
};
//# sourceMappingURL=index.js.map