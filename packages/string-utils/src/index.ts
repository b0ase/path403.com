/**
 * @b0ase/string-utils
 *
 * String utilities: case conversion, truncation, slugify, template, and more.
 *
 * @packageDocumentation
 */

// ============================================================================
// Case Conversion
// ============================================================================

/**
 * Convert to camelCase
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toLowerCase());
}

/**
 * Convert to PascalCase
 */
export function pascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Convert to snake_case
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .replace(/^_/, '')
    .toLowerCase();
}

/**
 * Convert to kebab-case
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
}

/**
 * Convert to CONSTANT_CASE
 */
export function constantCase(str: string): string {
  return snakeCase(str).toUpperCase();
}

/**
 * Convert to Title Case
 */
export function titleCase(str: string): string {
  return str
    .replace(/[-_\s]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert to Sentence case
 */
export function sentenceCase(str: string): string {
  const result = str.replace(/[-_\s]+/g, ' ').toLowerCase();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// ============================================================================
// Truncation
// ============================================================================

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Truncate in the middle
 */
export function truncateMiddle(str: string, length: number, separator: string = '...'): string {
  if (str.length <= length) return str;
  const chars = length - separator.length;
  const start = Math.ceil(chars / 2);
  const end = Math.floor(chars / 2);
  return str.slice(0, start) + separator + str.slice(-end);
}

/**
 * Truncate words
 */
export function truncateWords(str: string, count: number, suffix: string = '...'): string {
  const words = str.split(/\s+/);
  if (words.length <= count) return str;
  return words.slice(0, count).join(' ') + suffix;
}

// ============================================================================
// Slugify
// ============================================================================

/**
 * Convert string to URL-friendly slug
 */
export function slugify(str: string, separator: string = '-'): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_]+/g, separator) // Replace spaces and underscores
    .replace(new RegExp(`${separator}+`, 'g'), separator) // Remove duplicate separators
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), ''); // Trim separators
}

/**
 * Convert slug back to readable string
 */
export function unslugify(str: string): string {
  return str.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ============================================================================
// Template
// ============================================================================

/**
 * Simple template string interpolation
 */
export function template(str: string, data: Record<string, unknown>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = data[key];
    return value !== undefined ? String(value) : '';
  });
}

/**
 * Template with fallback values
 */
export function templateWithFallback(
  str: string,
  data: Record<string, unknown>,
  fallback: string = ''
): string {
  return str.replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, (_, key, defaultValue) => {
    const value = data[key];
    if (value !== undefined) return String(value);
    if (defaultValue !== undefined) return defaultValue;
    return fallback;
  });
}

// ============================================================================
// Padding
// ============================================================================

/**
 * Pad string on the left
 */
export function padLeft(str: string, length: number, char: string = ' '): string {
  if (str.length >= length) return str;
  return char.repeat(length - str.length) + str;
}

/**
 * Pad string on the right
 */
export function padRight(str: string, length: number, char: string = ' '): string {
  if (str.length >= length) return str;
  return str + char.repeat(length - str.length);
}

/**
 * Pad string on both sides
 */
export function padCenter(str: string, length: number, char: string = ' '): string {
  if (str.length >= length) return str;
  const total = length - str.length;
  const left = Math.floor(total / 2);
  const right = total - left;
  return char.repeat(left) + str + char.repeat(right);
}

// ============================================================================
// Trimming
// ============================================================================

/**
 * Trim specific characters from string
 */
export function trimChars(str: string, chars: string): string {
  const regex = new RegExp(`^[${escapeRegex(chars)}]+|[${escapeRegex(chars)}]+$`, 'g');
  return str.replace(regex, '');
}

/**
 * Trim specific characters from start
 */
export function trimStart(str: string, chars: string): string {
  const regex = new RegExp(`^[${escapeRegex(chars)}]+`);
  return str.replace(regex, '');
}

/**
 * Trim specific characters from end
 */
export function trimEnd(str: string, chars: string): string {
  const regex = new RegExp(`[${escapeRegex(chars)}]+$`);
  return str.replace(regex, '');
}

// ============================================================================
// Search & Replace
// ============================================================================

/**
 * Count occurrences of substring
 */
export function countOccurrences(str: string, search: string): number {
  if (!search) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(search, pos)) !== -1) {
    count++;
    pos += search.length;
  }
  return count;
}

/**
 * Replace all occurrences
 */
export function replaceAll(str: string, search: string, replacement: string): string {
  return str.split(search).join(replacement);
}

/**
 * Remove all occurrences
 */
export function remove(str: string, search: string | RegExp): string {
  if (typeof search === 'string') {
    return replaceAll(str, search, '');
  }
  return str.replace(new RegExp(search.source, 'g'), '');
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if string is empty or whitespace
 */
export function isBlank(str: string | null | undefined): boolean {
  return str === null || str === undefined || str.trim() === '';
}

/**
 * Check if string is not empty
 */
export function isNotBlank(str: string | null | undefined): str is string {
  return !isBlank(str);
}

/**
 * Check if string contains only letters
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * Check if string contains only numbers
 */
export function isNumeric(str: string): boolean {
  return /^[0-9]+$/.test(str);
}

/**
 * Check if string contains only letters and numbers
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if string is a valid email
 */
export function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

/**
 * Check if string is a valid URL
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is a valid UUID
 */
export function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// ============================================================================
// Escape & Encode
// ============================================================================

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (c) => map[c] || c);
}

/**
 * Unescape HTML special characters
 */
export function unescapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return str.replace(/&(amp|lt|gt|quot|#39);/g, (match) => map[match] || match);
}

/**
 * Escape regex special characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// Generation
// ============================================================================

/**
 * Generate random string
 */
export function random(length: number, chars?: string): string {
  const defaultChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const characters = chars || defaultChars;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate random alphanumeric string
 */
export function randomAlphanumeric(length: number): string {
  return random(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}

/**
 * Generate random hex string
 */
export function randomHex(length: number): string {
  return random(length, '0123456789abcdef');
}

// ============================================================================
// Splitting
// ============================================================================

/**
 * Split string into lines
 */
export function lines(str: string): string[] {
  return str.split(/\r?\n/);
}

/**
 * Split string into words
 */
export function words(str: string): string[] {
  return str.match(/\b\w+\b/g) || [];
}

/**
 * Split string into chunks
 */
export function chunk(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// Comparison
// ============================================================================

/**
 * Case-insensitive comparison
 */
export function equalsIgnoreCase(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/**
 * Natural sort comparison
 */
export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// ============================================================================
// Misc
// ============================================================================

/**
 * Reverse string
 */
export function reverse(str: string): string {
  return [...str].reverse().join('');
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Lowercase first letter
 */
export function uncapitalize(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Repeat string n times
 */
export function repeat(str: string, n: number): string {
  return str.repeat(n);
}

/**
 * Strip HTML tags
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extract initials from name
 */
export function initials(str: string, count: number = 2): string {
  return words(str)
    .slice(0, count)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

/**
 * Wrap text at specified width
 */
export function wrap(str: string, width: number): string {
  const regex = new RegExp(`(.{1,${width}})(\\s|$)`, 'g');
  return str.replace(regex, '$1\n').trim();
}
