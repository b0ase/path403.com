/**
 * @b0ase/date-utils
 *
 * Date utilities: formatting, parsing, relative time, and comparisons.
 *
 * @packageDocumentation
 */
/** Date input type */
type DateInput = Date | string | number;
/** Duration units */
type DurationUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
/** Duration object */
interface Duration {
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
interface DateRange {
    start: Date;
    end: Date;
}
declare const MS_PER_SECOND = 1000;
declare const MS_PER_MINUTE: number;
declare const MS_PER_HOUR: number;
declare const MS_PER_DAY: number;
declare const MS_PER_WEEK: number;
declare const SECONDS_PER_MINUTE = 60;
declare const SECONDS_PER_HOUR = 3600;
declare const SECONDS_PER_DAY = 86400;
declare const SECONDS_PER_WEEK = 604800;
/**
 * Parse date input to Date object
 */
declare function toDate(input: DateInput): Date;
/**
 * Check if input is a valid date
 */
declare function isValidDate(input: DateInput): boolean;
/**
 * Parse ISO string
 */
declare function parseISO(input: string): Date;
/**
 * Format date with pattern
 * Supports: YYYY, MM, DD, HH, mm, ss, SSS
 */
declare function format(input: DateInput, pattern: string): string;
/**
 * Format to ISO string
 */
declare function toISOString(input: DateInput): string;
/**
 * Format to ISO date (YYYY-MM-DD)
 */
declare function toISODate(input: DateInput): string;
/**
 * Format to ISO time (HH:mm:ss)
 */
declare function toISOTime(input: DateInput): string;
/**
 * Get relative time string
 */
declare function formatRelative(input: DateInput, base?: DateInput): string;
/**
 * Get time ago string (always past)
 */
declare function timeAgo(input: DateInput): string;
/**
 * Add duration to date
 */
declare function add(input: DateInput, duration: Duration): Date;
/**
 * Subtract duration from date
 */
declare function subtract(input: DateInput, duration: Duration): Date;
/**
 * Get start of unit
 */
declare function startOf(input: DateInput, unit: DurationUnit): Date;
/**
 * Get end of unit
 */
declare function endOf(input: DateInput, unit: DurationUnit): Date;
/**
 * Check if date is before another
 */
declare function isBefore(input: DateInput, other: DateInput): boolean;
/**
 * Check if date is after another
 */
declare function isAfter(input: DateInput, other: DateInput): boolean;
/**
 * Check if date is same as another (to the millisecond)
 */
declare function isSame(input: DateInput, other: DateInput, unit?: DurationUnit): boolean;
/**
 * Check if date is between two dates
 */
declare function isBetween(input: DateInput, start: DateInput, end: DateInput, inclusive?: boolean): boolean;
/**
 * Check if date is today
 */
declare function isToday(input: DateInput): boolean;
/**
 * Check if date is yesterday
 */
declare function isYesterday(input: DateInput): boolean;
/**
 * Check if date is tomorrow
 */
declare function isTomorrow(input: DateInput): boolean;
/**
 * Check if date is in the past
 */
declare function isPast(input: DateInput): boolean;
/**
 * Check if date is in the future
 */
declare function isFuture(input: DateInput): boolean;
/**
 * Get difference between two dates
 */
declare function diff(input: DateInput, other: DateInput, unit?: DurationUnit): number;
/**
 * Get days between two dates
 */
declare function daysBetween(input: DateInput, other: DateInput): number;
/**
 * Format duration in milliseconds to human readable string
 */
declare function formatDuration(ms: number): string;
/**
 * Parse duration string to milliseconds
 * Supports: 1d, 2h, 30m, 45s, 100ms
 */
declare function parseDuration(input: string): number;
/**
 * Get date range
 */
declare function getRange(start: DateInput, end: DateInput): DateRange;
/**
 * Generate array of dates between start and end
 */
declare function eachDayOfInterval(start: DateInput, end: DateInput): Date[];
/**
 * Check if ranges overlap
 */
declare function rangesOverlap(a: DateRange, b: DateRange): boolean;
declare function getYear(input: DateInput): number;
declare function getMonth(input: DateInput): number;
declare function getDate(input: DateInput): number;
declare function getDay(input: DateInput): number;
declare function getHours(input: DateInput): number;
declare function getMinutes(input: DateInput): number;
declare function getSeconds(input: DateInput): number;
declare function getTimestamp(input: DateInput): number;
declare function now(): Date;
declare function today(): Date;
declare function tomorrow(): Date;
declare function yesterday(): Date;

export { type DateInput, type DateRange, type Duration, type DurationUnit, MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND, MS_PER_WEEK, SECONDS_PER_DAY, SECONDS_PER_HOUR, SECONDS_PER_MINUTE, SECONDS_PER_WEEK, add, daysBetween, diff, eachDayOfInterval, endOf, format, formatDuration, formatRelative, getDate, getDay, getHours, getMinutes, getMonth, getRange, getSeconds, getTimestamp, getYear, isAfter, isBefore, isBetween, isFuture, isPast, isSame, isToday, isTomorrow, isValidDate, isYesterday, now, parseDuration, parseISO, rangesOverlap, startOf, subtract, timeAgo, toDate, toISODate, toISOString, toISOTime, today, tomorrow, yesterday };
