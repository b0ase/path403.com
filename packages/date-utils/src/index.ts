/**
 * @b0ase/date-utils
 *
 * Date utilities: formatting, parsing, relative time, and comparisons.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Date input type */
export type DateInput = Date | string | number;

/** Duration units */
export type DurationUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

/** Duration object */
export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/** Date range */
export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================================
// Constants
// ============================================================================

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;
export const MS_PER_WEEK = MS_PER_DAY * 7;

export const SECONDS_PER_MINUTE = 60;
export const SECONDS_PER_HOUR = 3600;
export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_WEEK = 604800;

// ============================================================================
// Parsing
// ============================================================================

/**
 * Parse date input to Date object
 */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) {
    return new Date(input);
  }
  if (typeof input === 'number') {
    return new Date(input);
  }
  return new Date(input);
}

/**
 * Check if input is a valid date
 */
export function isValidDate(input: DateInput): boolean {
  const date = toDate(input);
  return !isNaN(date.getTime());
}

/**
 * Parse ISO string
 */
export function parseISO(input: string): Date {
  return new Date(input);
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * Format date with pattern
 * Supports: YYYY, MM, DD, HH, mm, ss, SSS
 */
export function format(input: DateInput, pattern: string): string {
  const date = toDate(input);

  const tokens: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    YY: String(date.getFullYear()).slice(-2),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    M: String(date.getMonth() + 1),
    DD: String(date.getDate()).padStart(2, '0'),
    D: String(date.getDate()),
    HH: String(date.getHours()).padStart(2, '0'),
    H: String(date.getHours()),
    hh: String(date.getHours() % 12 || 12).padStart(2, '0'),
    h: String(date.getHours() % 12 || 12),
    mm: String(date.getMinutes()).padStart(2, '0'),
    m: String(date.getMinutes()),
    ss: String(date.getSeconds()).padStart(2, '0'),
    s: String(date.getSeconds()),
    SSS: String(date.getMilliseconds()).padStart(3, '0'),
    A: date.getHours() < 12 ? 'AM' : 'PM',
    a: date.getHours() < 12 ? 'am' : 'pm',
  };

  let result = pattern;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }

  return result;
}

/**
 * Format to ISO string
 */
export function toISOString(input: DateInput): string {
  return toDate(input).toISOString();
}

/**
 * Format to ISO date (YYYY-MM-DD)
 */
export function toISODate(input: DateInput): string {
  return format(input, 'YYYY-MM-DD');
}

/**
 * Format to ISO time (HH:mm:ss)
 */
export function toISOTime(input: DateInput): string {
  return format(input, 'HH:mm:ss');
}

// ============================================================================
// Relative Time
// ============================================================================

/**
 * Get relative time string
 */
export function formatRelative(input: DateInput, base: DateInput = new Date()): string {
  const date = toDate(input);
  const baseDate = toDate(base);
  const diff = date.getTime() - baseDate.getTime();
  const absDiff = Math.abs(diff);
  const isPast = diff < 0;

  const units: Array<{ unit: string; ms: number; max: number }> = [
    { unit: 'second', ms: MS_PER_SECOND, max: 60 },
    { unit: 'minute', ms: MS_PER_MINUTE, max: 60 },
    { unit: 'hour', ms: MS_PER_HOUR, max: 24 },
    { unit: 'day', ms: MS_PER_DAY, max: 30 },
    { unit: 'month', ms: MS_PER_DAY * 30, max: 12 },
    { unit: 'year', ms: MS_PER_DAY * 365, max: Infinity },
  ];

  for (const { unit, ms, max } of units) {
    const value = Math.floor(absDiff / ms);
    if (value < max) {
      if (value === 0 && unit === 'second') {
        return 'just now';
      }
      const plural = value === 1 ? '' : 's';
      return isPast
        ? `${value} ${unit}${plural} ago`
        : `in ${value} ${unit}${plural}`;
    }
  }

  return format(date, 'YYYY-MM-DD');
}

/**
 * Get time ago string (always past)
 */
export function timeAgo(input: DateInput): string {
  return formatRelative(input, new Date());
}

// ============================================================================
// Manipulation
// ============================================================================

/**
 * Add duration to date
 */
export function add(input: DateInput, duration: Duration): Date {
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

/**
 * Subtract duration from date
 */
export function subtract(input: DateInput, duration: Duration): Date {
  const negated: Duration = {};
  for (const [key, value] of Object.entries(duration)) {
    if (value !== undefined) {
      (negated as Record<string, number>)[key] = -value;
    }
  }
  return add(input, negated);
}

/**
 * Get start of unit
 */
export function startOf(input: DateInput, unit: DurationUnit): Date {
  const date = toDate(input);

  switch (unit) {
    case 'year':
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
      break;
    case 'month':
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      break;
    case 'week':
      date.setDate(date.getDate() - date.getDay());
      date.setHours(0, 0, 0, 0);
      break;
    case 'day':
      date.setHours(0, 0, 0, 0);
      break;
    case 'hour':
      date.setMinutes(0, 0, 0);
      break;
    case 'minute':
      date.setSeconds(0, 0);
      break;
    case 'second':
      date.setMilliseconds(0);
      break;
  }

  return date;
}

/**
 * Get end of unit
 */
export function endOf(input: DateInput, unit: DurationUnit): Date {
  const date = toDate(input);

  switch (unit) {
    case 'year':
      date.setMonth(11, 31);
      date.setHours(23, 59, 59, 999);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1, 0);
      date.setHours(23, 59, 59, 999);
      break;
    case 'week':
      date.setDate(date.getDate() + (6 - date.getDay()));
      date.setHours(23, 59, 59, 999);
      break;
    case 'day':
      date.setHours(23, 59, 59, 999);
      break;
    case 'hour':
      date.setMinutes(59, 59, 999);
      break;
    case 'minute':
      date.setSeconds(59, 999);
      break;
    case 'second':
      date.setMilliseconds(999);
      break;
  }

  return date;
}

// ============================================================================
// Comparisons
// ============================================================================

/**
 * Check if date is before another
 */
export function isBefore(input: DateInput, other: DateInput): boolean {
  return toDate(input).getTime() < toDate(other).getTime();
}

/**
 * Check if date is after another
 */
export function isAfter(input: DateInput, other: DateInput): boolean {
  return toDate(input).getTime() > toDate(other).getTime();
}

/**
 * Check if date is same as another (to the millisecond)
 */
export function isSame(input: DateInput, other: DateInput, unit?: DurationUnit): boolean {
  const date1 = toDate(input);
  const date2 = toDate(other);

  if (!unit) {
    return date1.getTime() === date2.getTime();
  }

  return startOf(date1, unit).getTime() === startOf(date2, unit).getTime();
}

/**
 * Check if date is between two dates
 */
export function isBetween(
  input: DateInput,
  start: DateInput,
  end: DateInput,
  inclusive: boolean = true
): boolean {
  const date = toDate(input).getTime();
  const startTime = toDate(start).getTime();
  const endTime = toDate(end).getTime();

  if (inclusive) {
    return date >= startTime && date <= endTime;
  }
  return date > startTime && date < endTime;
}

/**
 * Check if date is today
 */
export function isToday(input: DateInput): boolean {
  return isSame(input, new Date(), 'day');
}

/**
 * Check if date is yesterday
 */
export function isYesterday(input: DateInput): boolean {
  return isSame(input, subtract(new Date(), { days: 1 }), 'day');
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(input: DateInput): boolean {
  return isSame(input, add(new Date(), { days: 1 }), 'day');
}

/**
 * Check if date is in the past
 */
export function isPast(input: DateInput): boolean {
  return isBefore(input, new Date());
}

/**
 * Check if date is in the future
 */
export function isFuture(input: DateInput): boolean {
  return isAfter(input, new Date());
}

// ============================================================================
// Difference
// ============================================================================

/**
 * Get difference between two dates
 */
export function diff(input: DateInput, other: DateInput, unit: DurationUnit = 'millisecond'): number {
  const ms = toDate(input).getTime() - toDate(other).getTime();

  switch (unit) {
    case 'year':
      return Math.floor(ms / (MS_PER_DAY * 365));
    case 'month':
      return Math.floor(ms / (MS_PER_DAY * 30));
    case 'week':
      return Math.floor(ms / MS_PER_WEEK);
    case 'day':
      return Math.floor(ms / MS_PER_DAY);
    case 'hour':
      return Math.floor(ms / MS_PER_HOUR);
    case 'minute':
      return Math.floor(ms / MS_PER_MINUTE);
    case 'second':
      return Math.floor(ms / MS_PER_SECOND);
    case 'millisecond':
    default:
      return ms;
  }
}

/**
 * Get days between two dates
 */
export function daysBetween(input: DateInput, other: DateInput): number {
  return Math.abs(diff(input, other, 'day'));
}

// ============================================================================
// Duration Formatting
// ============================================================================

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  const abs = Math.abs(ms);

  if (abs < MS_PER_SECOND) {
    return `${abs}ms`;
  }
  if (abs < MS_PER_MINUTE) {
    return `${(abs / MS_PER_SECOND).toFixed(1)}s`;
  }
  if (abs < MS_PER_HOUR) {
    const minutes = Math.floor(abs / MS_PER_MINUTE);
    const seconds = Math.floor((abs % MS_PER_MINUTE) / MS_PER_SECOND);
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  if (abs < MS_PER_DAY) {
    const hours = Math.floor(abs / MS_PER_HOUR);
    const minutes = Math.floor((abs % MS_PER_HOUR) / MS_PER_MINUTE);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  const days = Math.floor(abs / MS_PER_DAY);
  const hours = Math.floor((abs % MS_PER_DAY) / MS_PER_HOUR);
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

/**
 * Parse duration string to milliseconds
 * Supports: 1d, 2h, 30m, 45s, 100ms
 */
export function parseDuration(input: string): number {
  const regex = /(\d+)(ms|s|m|h|d|w)/g;
  let total = 0;
  let match;

  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'ms':
        total += value;
        break;
      case 's':
        total += value * MS_PER_SECOND;
        break;
      case 'm':
        total += value * MS_PER_MINUTE;
        break;
      case 'h':
        total += value * MS_PER_HOUR;
        break;
      case 'd':
        total += value * MS_PER_DAY;
        break;
      case 'w':
        total += value * MS_PER_WEEK;
        break;
    }
  }

  return total;
}

// ============================================================================
// Range Utilities
// ============================================================================

/**
 * Get date range
 */
export function getRange(start: DateInput, end: DateInput): DateRange {
  return {
    start: toDate(start),
    end: toDate(end),
  };
}

/**
 * Generate array of dates between start and end
 */
export function eachDayOfInterval(start: DateInput, end: DateInput): Date[] {
  const startDate = startOf(start, 'day');
  const endDate = startOf(end, 'day');
  const days: Date[] = [];

  let current = startDate;
  while (current <= endDate) {
    days.push(new Date(current));
    current = add(current, { days: 1 });
  }

  return days;
}

/**
 * Check if ranges overlap
 */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.start <= b.end && a.end >= b.start;
}

// ============================================================================
// Getters
// ============================================================================

export function getYear(input: DateInput): number {
  return toDate(input).getFullYear();
}

export function getMonth(input: DateInput): number {
  return toDate(input).getMonth();
}

export function getDate(input: DateInput): number {
  return toDate(input).getDate();
}

export function getDay(input: DateInput): number {
  return toDate(input).getDay();
}

export function getHours(input: DateInput): number {
  return toDate(input).getHours();
}

export function getMinutes(input: DateInput): number {
  return toDate(input).getMinutes();
}

export function getSeconds(input: DateInput): number {
  return toDate(input).getSeconds();
}

export function getTimestamp(input: DateInput): number {
  return toDate(input).getTime();
}

// ============================================================================
// Factory Functions
// ============================================================================

export function now(): Date {
  return new Date();
}

export function today(): Date {
  return startOf(new Date(), 'day');
}

export function tomorrow(): Date {
  return startOf(add(new Date(), { days: 1 }), 'day');
}

export function yesterday(): Date {
  return startOf(subtract(new Date(), { days: 1 }), 'day');
}
