/**
 * @b0ase/string-utils
 *
 * String utilities: case conversion, truncation, slugify, template, and more.
 *
 * @packageDocumentation
 */
/**
 * Convert to camelCase
 */
declare function camelCase(str: string): string;
/**
 * Convert to PascalCase
 */
declare function pascalCase(str: string): string;
/**
 * Convert to snake_case
 */
declare function snakeCase(str: string): string;
/**
 * Convert to kebab-case
 */
declare function kebabCase(str: string): string;
/**
 * Convert to CONSTANT_CASE
 */
declare function constantCase(str: string): string;
/**
 * Convert to Title Case
 */
declare function titleCase(str: string): string;
/**
 * Convert to Sentence case
 */
declare function sentenceCase(str: string): string;
/**
 * Truncate string with ellipsis
 */
declare function truncate(str: string, length: number, suffix?: string): string;
/**
 * Truncate in the middle
 */
declare function truncateMiddle(str: string, length: number, separator?: string): string;
/**
 * Truncate words
 */
declare function truncateWords(str: string, count: number, suffix?: string): string;
/**
 * Convert string to URL-friendly slug
 */
declare function slugify(str: string, separator?: string): string;
/**
 * Convert slug back to readable string
 */
declare function unslugify(str: string): string;
/**
 * Simple template string interpolation
 */
declare function template(str: string, data: Record<string, unknown>): string;
/**
 * Template with fallback values
 */
declare function templateWithFallback(str: string, data: Record<string, unknown>, fallback?: string): string;
/**
 * Pad string on the left
 */
declare function padLeft(str: string, length: number, char?: string): string;
/**
 * Pad string on the right
 */
declare function padRight(str: string, length: number, char?: string): string;
/**
 * Pad string on both sides
 */
declare function padCenter(str: string, length: number, char?: string): string;
/**
 * Trim specific characters from string
 */
declare function trimChars(str: string, chars: string): string;
/**
 * Trim specific characters from start
 */
declare function trimStart(str: string, chars: string): string;
/**
 * Trim specific characters from end
 */
declare function trimEnd(str: string, chars: string): string;
/**
 * Count occurrences of substring
 */
declare function countOccurrences(str: string, search: string): number;
/**
 * Replace all occurrences
 */
declare function replaceAll(str: string, search: string, replacement: string): string;
/**
 * Remove all occurrences
 */
declare function remove(str: string, search: string | RegExp): string;
/**
 * Check if string is empty or whitespace
 */
declare function isBlank(str: string | null | undefined): boolean;
/**
 * Check if string is not empty
 */
declare function isNotBlank(str: string | null | undefined): str is string;
/**
 * Check if string contains only letters
 */
declare function isAlpha(str: string): boolean;
/**
 * Check if string contains only numbers
 */
declare function isNumeric(str: string): boolean;
/**
 * Check if string contains only letters and numbers
 */
declare function isAlphanumeric(str: string): boolean;
/**
 * Check if string is a valid email
 */
declare function isEmail(str: string): boolean;
/**
 * Check if string is a valid URL
 */
declare function isUrl(str: string): boolean;
/**
 * Check if string is a valid UUID
 */
declare function isUuid(str: string): boolean;
/**
 * Escape HTML special characters
 */
declare function escapeHtml(str: string): string;
/**
 * Unescape HTML special characters
 */
declare function unescapeHtml(str: string): string;
/**
 * Escape regex special characters
 */
declare function escapeRegex(str: string): string;
/**
 * Generate random string
 */
declare function random(length: number, chars?: string): string;
/**
 * Generate random alphanumeric string
 */
declare function randomAlphanumeric(length: number): string;
/**
 * Generate random hex string
 */
declare function randomHex(length: number): string;
/**
 * Split string into lines
 */
declare function lines(str: string): string[];
/**
 * Split string into words
 */
declare function words(str: string): string[];
/**
 * Split string into chunks
 */
declare function chunk(str: string, size: number): string[];
/**
 * Case-insensitive comparison
 */
declare function equalsIgnoreCase(a: string, b: string): boolean;
/**
 * Natural sort comparison
 */
declare function naturalCompare(a: string, b: string): number;
/**
 * Reverse string
 */
declare function reverse(str: string): string;
/**
 * Capitalize first letter
 */
declare function capitalize(str: string): string;
/**
 * Lowercase first letter
 */
declare function uncapitalize(str: string): string;
/**
 * Repeat string n times
 */
declare function repeat(str: string, n: number): string;
/**
 * Strip HTML tags
 */
declare function stripHtml(str: string): string;
/**
 * Normalize whitespace
 */
declare function normalizeWhitespace(str: string): string;
/**
 * Extract initials from name
 */
declare function initials(str: string, count?: number): string;
/**
 * Wrap text at specified width
 */
declare function wrap(str: string, width: number): string;

export { camelCase, capitalize, chunk, constantCase, countOccurrences, equalsIgnoreCase, escapeHtml, escapeRegex, initials, isAlpha, isAlphanumeric, isBlank, isEmail, isNotBlank, isNumeric, isUrl, isUuid, kebabCase, lines, naturalCompare, normalizeWhitespace, padCenter, padLeft, padRight, pascalCase, random, randomAlphanumeric, randomHex, remove, repeat, replaceAll, reverse, sentenceCase, slugify, snakeCase, stripHtml, template, templateWithFallback, titleCase, trimChars, trimEnd, trimStart, truncate, truncateMiddle, truncateWords, uncapitalize, unescapeHtml, unslugify, words, wrap };
