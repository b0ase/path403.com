// src/index.ts
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
export {
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
};
//# sourceMappingURL=index.js.map