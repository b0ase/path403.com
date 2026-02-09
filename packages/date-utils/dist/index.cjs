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
  MS_PER_DAY: () => MS_PER_DAY,
  MS_PER_HOUR: () => MS_PER_HOUR,
  MS_PER_MINUTE: () => MS_PER_MINUTE,
  MS_PER_SECOND: () => MS_PER_SECOND,
  MS_PER_WEEK: () => MS_PER_WEEK,
  SECONDS_PER_DAY: () => SECONDS_PER_DAY,
  SECONDS_PER_HOUR: () => SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE: () => SECONDS_PER_MINUTE,
  SECONDS_PER_WEEK: () => SECONDS_PER_WEEK,
  add: () => add,
  daysBetween: () => daysBetween,
  diff: () => diff,
  eachDayOfInterval: () => eachDayOfInterval,
  endOf: () => endOf,
  format: () => format,
  formatDuration: () => formatDuration,
  formatRelative: () => formatRelative,
  getDate: () => getDate,
  getDay: () => getDay,
  getHours: () => getHours,
  getMinutes: () => getMinutes,
  getMonth: () => getMonth,
  getRange: () => getRange,
  getSeconds: () => getSeconds,
  getTimestamp: () => getTimestamp,
  getYear: () => getYear,
  isAfter: () => isAfter,
  isBefore: () => isBefore,
  isBetween: () => isBetween,
  isFuture: () => isFuture,
  isPast: () => isPast,
  isSame: () => isSame,
  isToday: () => isToday,
  isTomorrow: () => isTomorrow,
  isValidDate: () => isValidDate,
  isYesterday: () => isYesterday,
  now: () => now,
  parseDuration: () => parseDuration,
  parseISO: () => parseISO,
  rangesOverlap: () => rangesOverlap,
  startOf: () => startOf,
  subtract: () => subtract,
  timeAgo: () => timeAgo,
  toDate: () => toDate,
  toISODate: () => toISODate,
  toISOString: () => toISOString,
  toISOTime: () => toISOTime,
  today: () => today,
  tomorrow: () => tomorrow,
  yesterday: () => yesterday
});
module.exports = __toCommonJS(index_exports);
var MS_PER_SECOND = 1e3;
var MS_PER_MINUTE = MS_PER_SECOND * 60;
var MS_PER_HOUR = MS_PER_MINUTE * 60;
var MS_PER_DAY = MS_PER_HOUR * 24;
var MS_PER_WEEK = MS_PER_DAY * 7;
var SECONDS_PER_MINUTE = 60;
var SECONDS_PER_HOUR = 3600;
var SECONDS_PER_DAY = 86400;
var SECONDS_PER_WEEK = 604800;
function toDate(input) {
  if (input instanceof Date) {
    return new Date(input);
  }
  if (typeof input === "number") {
    return new Date(input);
  }
  return new Date(input);
}
function isValidDate(input) {
  const date = toDate(input);
  return !isNaN(date.getTime());
}
function parseISO(input) {
  return new Date(input);
}
function format(input, pattern) {
  const date = toDate(input);
  const tokens = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MM: String(date.getMonth() + 1).padStart(2, "0"),
    M: String(date.getMonth() + 1),
    DD: String(date.getDate()).padStart(2, "0"),
    D: String(date.getDate()),
    HH: String(date.getHours()).padStart(2, "0"),
    H: String(date.getHours()),
    hh: String(date.getHours() % 12 || 12).padStart(2, "0"),
    h: String(date.getHours() % 12 || 12),
    mm: String(date.getMinutes()).padStart(2, "0"),
    m: String(date.getMinutes()),
    ss: String(date.getSeconds()).padStart(2, "0"),
    s: String(date.getSeconds()),
    SSS: String(date.getMilliseconds()).padStart(3, "0"),
    A: date.getHours() < 12 ? "AM" : "PM",
    a: date.getHours() < 12 ? "am" : "pm"
  };
  let result = pattern;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, "g"), value);
  }
  return result;
}
function toISOString(input) {
  return toDate(input).toISOString();
}
function toISODate(input) {
  return format(input, "YYYY-MM-DD");
}
function toISOTime(input) {
  return format(input, "HH:mm:ss");
}
function formatRelative(input, base = /* @__PURE__ */ new Date()) {
  const date = toDate(input);
  const baseDate = toDate(base);
  const diff2 = date.getTime() - baseDate.getTime();
  const absDiff = Math.abs(diff2);
  const isPast2 = diff2 < 0;
  const units = [
    { unit: "second", ms: MS_PER_SECOND, max: 60 },
    { unit: "minute", ms: MS_PER_MINUTE, max: 60 },
    { unit: "hour", ms: MS_PER_HOUR, max: 24 },
    { unit: "day", ms: MS_PER_DAY, max: 30 },
    { unit: "month", ms: MS_PER_DAY * 30, max: 12 },
    { unit: "year", ms: MS_PER_DAY * 365, max: Infinity }
  ];
  for (const { unit, ms, max } of units) {
    const value = Math.floor(absDiff / ms);
    if (value < max) {
      if (value === 0 && unit === "second") {
        return "just now";
      }
      const plural = value === 1 ? "" : "s";
      return isPast2 ? `${value} ${unit}${plural} ago` : `in ${value} ${unit}${plural}`;
    }
  }
  return format(date, "YYYY-MM-DD");
}
function timeAgo(input) {
  return formatRelative(input, /* @__PURE__ */ new Date());
}
function add(input, duration) {
  const date = toDate(input);
  if (duration.years) {
    date.setFullYear(date.getFullYear() + duration.years);
  }
  if (duration.months) {
    date.setMonth(date.getMonth() + duration.months);
  }
  if (duration.weeks) {
    date.setDate(date.getDate() + duration.weeks * 7);
  }
  if (duration.days) {
    date.setDate(date.getDate() + duration.days);
  }
  if (duration.hours) {
    date.setHours(date.getHours() + duration.hours);
  }
  if (duration.minutes) {
    date.setMinutes(date.getMinutes() + duration.minutes);
  }
  if (duration.seconds) {
    date.setSeconds(date.getSeconds() + duration.seconds);
  }
  if (duration.milliseconds) {
    date.setMilliseconds(date.getMilliseconds() + duration.milliseconds);
  }
  return date;
}
function subtract(input, duration) {
  const negated = {};
  for (const [key, value] of Object.entries(duration)) {
    if (value !== void 0) {
      negated[key] = -value;
    }
  }
  return add(input, negated);
}
function startOf(input, unit) {
  const date = toDate(input);
  switch (unit) {
    case "year":
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
      break;
    case "month":
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      break;
    case "week":
      date.setDate(date.getDate() - date.getDay());
      date.setHours(0, 0, 0, 0);
      break;
    case "day":
      date.setHours(0, 0, 0, 0);
      break;
    case "hour":
      date.setMinutes(0, 0, 0);
      break;
    case "minute":
      date.setSeconds(0, 0);
      break;
    case "second":
      date.setMilliseconds(0);
      break;
  }
  return date;
}
function endOf(input, unit) {
  const date = toDate(input);
  switch (unit) {
    case "year":
      date.setMonth(11, 31);
      date.setHours(23, 59, 59, 999);
      break;
    case "month":
      date.setMonth(date.getMonth() + 1, 0);
      date.setHours(23, 59, 59, 999);
      break;
    case "week":
      date.setDate(date.getDate() + (6 - date.getDay()));
      date.setHours(23, 59, 59, 999);
      break;
    case "day":
      date.setHours(23, 59, 59, 999);
      break;
    case "hour":
      date.setMinutes(59, 59, 999);
      break;
    case "minute":
      date.setSeconds(59, 999);
      break;
    case "second":
      date.setMilliseconds(999);
      break;
  }
  return date;
}
function isBefore(input, other) {
  return toDate(input).getTime() < toDate(other).getTime();
}
function isAfter(input, other) {
  return toDate(input).getTime() > toDate(other).getTime();
}
function isSame(input, other, unit) {
  const date1 = toDate(input);
  const date2 = toDate(other);
  if (!unit) {
    return date1.getTime() === date2.getTime();
  }
  return startOf(date1, unit).getTime() === startOf(date2, unit).getTime();
}
function isBetween(input, start, end, inclusive = true) {
  const date = toDate(input).getTime();
  const startTime = toDate(start).getTime();
  const endTime = toDate(end).getTime();
  if (inclusive) {
    return date >= startTime && date <= endTime;
  }
  return date > startTime && date < endTime;
}
function isToday(input) {
  return isSame(input, /* @__PURE__ */ new Date(), "day");
}
function isYesterday(input) {
  return isSame(input, subtract(/* @__PURE__ */ new Date(), { days: 1 }), "day");
}
function isTomorrow(input) {
  return isSame(input, add(/* @__PURE__ */ new Date(), { days: 1 }), "day");
}
function isPast(input) {
  return isBefore(input, /* @__PURE__ */ new Date());
}
function isFuture(input) {
  return isAfter(input, /* @__PURE__ */ new Date());
}
function diff(input, other, unit = "millisecond") {
  const ms = toDate(input).getTime() - toDate(other).getTime();
  switch (unit) {
    case "year":
      return Math.floor(ms / (MS_PER_DAY * 365));
    case "month":
      return Math.floor(ms / (MS_PER_DAY * 30));
    case "week":
      return Math.floor(ms / MS_PER_WEEK);
    case "day":
      return Math.floor(ms / MS_PER_DAY);
    case "hour":
      return Math.floor(ms / MS_PER_HOUR);
    case "minute":
      return Math.floor(ms / MS_PER_MINUTE);
    case "second":
      return Math.floor(ms / MS_PER_SECOND);
    case "millisecond":
    default:
      return ms;
  }
}
function daysBetween(input, other) {
  return Math.abs(diff(input, other, "day"));
}
function formatDuration(ms) {
  const abs = Math.abs(ms);
  if (abs < MS_PER_SECOND) {
    return `${abs}ms`;
  }
  if (abs < MS_PER_MINUTE) {
    return `${(abs / MS_PER_SECOND).toFixed(1)}s`;
  }
  if (abs < MS_PER_HOUR) {
    const minutes = Math.floor(abs / MS_PER_MINUTE);
    const seconds = Math.floor(abs % MS_PER_MINUTE / MS_PER_SECOND);
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  if (abs < MS_PER_DAY) {
    const hours2 = Math.floor(abs / MS_PER_HOUR);
    const minutes = Math.floor(abs % MS_PER_HOUR / MS_PER_MINUTE);
    return minutes > 0 ? `${hours2}h ${minutes}m` : `${hours2}h`;
  }
  const days = Math.floor(abs / MS_PER_DAY);
  const hours = Math.floor(abs % MS_PER_DAY / MS_PER_HOUR);
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}
function parseDuration(input) {
  const regex = /(\d+)(ms|s|m|h|d|w)/g;
  let total = 0;
  let match;
  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case "ms":
        total += value;
        break;
      case "s":
        total += value * MS_PER_SECOND;
        break;
      case "m":
        total += value * MS_PER_MINUTE;
        break;
      case "h":
        total += value * MS_PER_HOUR;
        break;
      case "d":
        total += value * MS_PER_DAY;
        break;
      case "w":
        total += value * MS_PER_WEEK;
        break;
    }
  }
  return total;
}
function getRange(start, end) {
  return {
    start: toDate(start),
    end: toDate(end)
  };
}
function eachDayOfInterval(start, end) {
  const startDate = startOf(start, "day");
  const endDate = startOf(end, "day");
  const days = [];
  let current = startDate;
  while (current <= endDate) {
    days.push(new Date(current));
    current = add(current, { days: 1 });
  }
  return days;
}
function rangesOverlap(a, b) {
  return a.start <= b.end && a.end >= b.start;
}
function getYear(input) {
  return toDate(input).getFullYear();
}
function getMonth(input) {
  return toDate(input).getMonth();
}
function getDate(input) {
  return toDate(input).getDate();
}
function getDay(input) {
  return toDate(input).getDay();
}
function getHours(input) {
  return toDate(input).getHours();
}
function getMinutes(input) {
  return toDate(input).getMinutes();
}
function getSeconds(input) {
  return toDate(input).getSeconds();
}
function getTimestamp(input) {
  return toDate(input).getTime();
}
function now() {
  return /* @__PURE__ */ new Date();
}
function today() {
  return startOf(/* @__PURE__ */ new Date(), "day");
}
function tomorrow() {
  return startOf(add(/* @__PURE__ */ new Date(), { days: 1 }), "day");
}
function yesterday() {
  return startOf(subtract(/* @__PURE__ */ new Date(), { days: 1 }), "day");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_SECOND,
  MS_PER_WEEK,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
  SECONDS_PER_WEEK,
  add,
  daysBetween,
  diff,
  eachDayOfInterval,
  endOf,
  format,
  formatDuration,
  formatRelative,
  getDate,
  getDay,
  getHours,
  getMinutes,
  getMonth,
  getRange,
  getSeconds,
  getTimestamp,
  getYear,
  isAfter,
  isBefore,
  isBetween,
  isFuture,
  isPast,
  isSame,
  isToday,
  isTomorrow,
  isValidDate,
  isYesterday,
  now,
  parseDuration,
  parseISO,
  rangesOverlap,
  startOf,
  subtract,
  timeAgo,
  toDate,
  toISODate,
  toISOString,
  toISOTime,
  today,
  tomorrow,
  yesterday
});
//# sourceMappingURL=index.cjs.map