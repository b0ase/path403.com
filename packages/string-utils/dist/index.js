// src/index.ts
function camelCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^./, (c) => c.toLowerCase());
}
function pascalCase(str) {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^./, (c) => c.toUpperCase());
}
function snakeCase(str) {
  return str.replace(/([A-Z])/g, "_$1").replace(/[-\s]+/g, "_").replace(/^_/, "").toLowerCase();
}
function kebabCase(str) {
  return str.replace(/([A-Z])/g, "-$1").replace(/[_\s]+/g, "-").replace(/^-/, "").toLowerCase();
}
function constantCase(str) {
  return snakeCase(str).toUpperCase();
}
function titleCase(str) {
  return str.replace(/[-_\s]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function sentenceCase(str) {
  const result = str.replace(/[-_\s]+/g, " ").toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}
function truncate(str, length, suffix = "...") {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}
function truncateMiddle(str, length, separator = "...") {
  if (str.length <= length) return str;
  const chars = length - separator.length;
  const start = Math.ceil(chars / 2);
  const end = Math.floor(chars / 2);
  return str.slice(0, start) + separator + str.slice(-end);
}
function truncateWords(str, count, suffix = "...") {
  const words2 = str.split(/\s+/);
  if (words2.length <= count) return str;
  return words2.slice(0, count).join(" ") + suffix;
}
function slugify(str, separator = "-") {
  return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, separator).replace(new RegExp(`${separator}+`, "g"), separator).replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
}
function unslugify(str) {
  return str.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function template(str, data) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    return value !== void 0 ? String(value) : "";
  });
}
function templateWithFallback(str, data, fallback = "") {
  return str.replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, (_, key, defaultValue) => {
    const value = data[key];
    if (value !== void 0) return String(value);
    if (defaultValue !== void 0) return defaultValue;
    return fallback;
  });
}
function padLeft(str, length, char = " ") {
  if (str.length >= length) return str;
  return char.repeat(length - str.length) + str;
}
function padRight(str, length, char = " ") {
  if (str.length >= length) return str;
  return str + char.repeat(length - str.length);
}
function padCenter(str, length, char = " ") {
  if (str.length >= length) return str;
  const total = length - str.length;
  const left = Math.floor(total / 2);
  const right = total - left;
  return char.repeat(left) + str + char.repeat(right);
}
function trimChars(str, chars) {
  const regex = new RegExp(`^[${escapeRegex(chars)}]+|[${escapeRegex(chars)}]+$`, "g");
  return str.replace(regex, "");
}
function trimStart(str, chars) {
  const regex = new RegExp(`^[${escapeRegex(chars)}]+`);
  return str.replace(regex, "");
}
function trimEnd(str, chars) {
  const regex = new RegExp(`[${escapeRegex(chars)}]+$`);
  return str.replace(regex, "");
}
function countOccurrences(str, search) {
  if (!search) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(search, pos)) !== -1) {
    count++;
    pos += search.length;
  }
  return count;
}
function replaceAll(str, search, replacement) {
  return str.split(search).join(replacement);
}
function remove(str, search) {
  if (typeof search === "string") {
    return replaceAll(str, search, "");
  }
  return str.replace(new RegExp(search.source, "g"), "");
}
function isBlank(str) {
  return str === null || str === void 0 || str.trim() === "";
}
function isNotBlank(str) {
  return !isBlank(str);
}
function isAlpha(str) {
  return /^[a-zA-Z]+$/.test(str);
}
function isNumeric(str) {
  return /^[0-9]+$/.test(str);
}
function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}
function isEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}
function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
function isUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}
function escapeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return str.replace(/[&<>"']/g, (c) => map[c] || c);
}
function unescapeHtml(str) {
  const map = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'"
  };
  return str.replace(/&(amp|lt|gt|quot|#39);/g, (match) => map[match] || match);
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function random(length, chars) {
  const defaultChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const characters = chars || defaultChars;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
function randomAlphanumeric(length) {
  return random(length, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
}
function randomHex(length) {
  return random(length, "0123456789abcdef");
}
function lines(str) {
  return str.split(/\r?\n/);
}
function words(str) {
  return str.match(/\b\w+\b/g) || [];
}
function chunk(str, size) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}
function equalsIgnoreCase(a, b) {
  return a.toLowerCase() === b.toLowerCase();
}
function naturalCompare(a, b) {
  return a.localeCompare(b, void 0, { numeric: true, sensitivity: "base" });
}
function reverse(str) {
  return [...str].reverse().join("");
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function uncapitalize(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
function repeat(str, n) {
  return str.repeat(n);
}
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "");
}
function normalizeWhitespace(str) {
  return str.replace(/\s+/g, " ").trim();
}
function initials(str, count = 2) {
  return words(str).slice(0, count).map((w) => w.charAt(0).toUpperCase()).join("");
}
function wrap(str, width) {
  const regex = new RegExp(`(.{1,${width}})(\\s|$)`, "g");
  return str.replace(regex, "$1\n").trim();
}
export {
  camelCase,
  capitalize,
  chunk,
  constantCase,
  countOccurrences,
  equalsIgnoreCase,
  escapeHtml,
  escapeRegex,
  initials,
  isAlpha,
  isAlphanumeric,
  isBlank,
  isEmail,
  isNotBlank,
  isNumeric,
  isUrl,
  isUuid,
  kebabCase,
  lines,
  naturalCompare,
  normalizeWhitespace,
  padCenter,
  padLeft,
  padRight,
  pascalCase,
  random,
  randomAlphanumeric,
  randomHex,
  remove,
  repeat,
  replaceAll,
  reverse,
  sentenceCase,
  slugify,
  snakeCase,
  stripHtml,
  template,
  templateWithFallback,
  titleCase,
  trimChars,
  trimEnd,
  trimStart,
  truncate,
  truncateMiddle,
  truncateWords,
  uncapitalize,
  unescapeHtml,
  unslugify,
  words,
  wrap
};
//# sourceMappingURL=index.js.map