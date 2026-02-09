/**
 * MoneyButton Pay-to-Download Constants
 * Configuration for the paid download marketplace
 */

// Platform HandCash handle - receives 5% of each sale
export const PLATFORM_HANDCASH_HANDLE = 'THEMONEYBUTTON';

// Fee split configuration
export const FEE_SPLIT = {
  SELLER_PERCENTAGE: 0.95, // 95% to seller
  PLATFORM_PERCENTAGE: 0.05, // 5% to platform
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  MAX_FILE_SIZE_DISPLAY: '500MB',
} as const;

// Price limits
export const PRICE_LIMITS = {
  MIN_PRICE_USD: 0.01,
  MAX_PRICE_USD: 10000,
} as const;

// Token pricing - b0ase.com incubate standard
// Founders set their own token price - no limits
export const TOKEN_PRICING = {
  DEFAULT_PRICE_USD: 0.01, // $0.01 per token (b0ase.com incubate standard)
} as const;

/**
 * Calculate tokens from USD amount
 * @param amountUsd - Amount in USD
 * @param tokenPriceUsd - Price per token (default: $0.01)
 * @returns Number of tokens (floored to whole tokens)
 */
export function calculateTokensFromUsd(amountUsd: number, tokenPriceUsd: number = TOKEN_PRICING.DEFAULT_PRICE_USD): number {
  return Math.floor(amountUsd / tokenPriceUsd);
}

/**
 * Calculate USD value from tokens
 * @param tokens - Number of tokens
 * @param tokenPriceUsd - Price per token (default: $0.01)
 * @returns Value in USD
 */
export function calculateUsdFromTokens(tokens: number, tokenPriceUsd: number = TOKEN_PRICING.DEFAULT_PRICE_USD): number {
  return tokens * tokenPriceUsd;
}

// Download token settings
export const DOWNLOAD_TOKEN = {
  EXPIRY_HOURS: 24 * 7, // 7 days
  MAX_DOWNLOADS: 5,
} as const;

// Allowed file types
export const ALLOWED_FILE_TYPES = [
  // Documents
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',

  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',

  // Archives
  'application/zip',
  'application/x-zip-compressed',

  // Other
  'application/octet-stream',
] as const;

// Supabase storage bucket
export const STORAGE_BUCKET = 'paid-downloads';

// Signed URL expiry for downloads (in seconds)
export const SIGNED_URL_EXPIRY = 15 * 60; // 15 minutes

/**
 * Calculate fee split for a given price
 */
export function calculateFeeSplit(priceUsd: number) {
  const sellerAmount = Number((priceUsd * FEE_SPLIT.SELLER_PERCENTAGE).toFixed(2));
  const platformAmount = Number((priceUsd * FEE_SPLIT.PLATFORM_PERCENTAGE).toFixed(2));

  // Ensure amounts add up to total (handle rounding)
  const total = sellerAmount + platformAmount;
  const difference = Number((priceUsd - total).toFixed(2));

  return {
    sellerAmount: sellerAmount + difference, // Give any rounding difference to seller
    platformAmount,
    total: priceUsd,
  };
}

/**
 * Generate a secure download token
 */
export function generateDownloadToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Get download token expiry date
 */
export function getTokenExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + DOWNLOAD_TOKEN.EXPIRY_HOURS);
  return expiry;
}

/**
 * Validate HandCash handle format
 */
export function isValidHandcashHandle(handle: string): boolean {
  // HandCash handles are alphanumeric, 3-20 chars
  return /^[a-zA-Z0-9]{3,20}$/.test(handle);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Format price for display
 */
export function formatPrice(priceUsd: number): string {
  return `$${priceUsd.toFixed(2)}`;
}
