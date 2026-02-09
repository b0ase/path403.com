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
  buildPaginatedResponse: () => buildPaginatedResponse,
  calculateOffset: () => calculateOffset,
  camelCaseKeys: () => camelCaseKeys,
  generateSlug: () => generateSlug,
  isUUID: () => isUUID,
  parseSortString: () => parseSortString,
  parseTimestamp: () => parseTimestamp,
  snakeCaseKeys: () => snakeCaseKeys,
  toCamelCase: () => toCamelCase,
  toSnakeCase: () => toSnakeCase,
  toTimestamp: () => toTimestamp,
  transformKeys: () => transformKeys
});
module.exports = __toCommonJS(index_exports);
function buildPaginatedResponse(data, total, params) {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages
  };
}
function calculateOffset(page, limit) {
  return (page - 1) * limit;
}
function parseSortString(sort) {
  return sort.split(",").map((s) => {
    const [field, direction] = s.trim().split(":");
    return {
      field: field.trim(),
      direction: direction?.trim().toLowerCase() === "desc" ? "desc" : "asc"
    };
  });
}
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
function transformKeys(obj, transformer) {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[transformer(key)] = obj[key];
  }
  return result;
}
function snakeCaseKeys(obj) {
  return transformKeys(obj, toSnakeCase);
}
function camelCaseKeys(obj) {
  return transformKeys(obj, toCamelCase);
}
function isUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function parseTimestamp(timestamp) {
  return new Date(timestamp);
}
function toTimestamp(date) {
  return date.toISOString();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildPaginatedResponse,
  calculateOffset,
  camelCaseKeys,
  generateSlug,
  isUUID,
  parseSortString,
  parseTimestamp,
  snakeCaseKeys,
  toCamelCase,
  toSnakeCase,
  toTimestamp,
  transformKeys
});
//# sourceMappingURL=index.cjs.map