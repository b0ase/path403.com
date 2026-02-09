/**
 * Rate Limiting Module
 *
 * In-memory rate limiter for API routes.
 * For production multi-instance deployments, replace with Redis-based limiter.
 */

import { NextRequest, NextResponse } from 'next/server';

// Store: IP -> { count, resetTime }
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  maxRequests: number;    // Max requests per window
  windowMs: number;       // Time window in milliseconds
  keyGenerator?: (req: NextRequest) => string;  // Custom key generator
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  message?: string;       // Custom error message
}

const defaultOptions: RateLimitOptions = {
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  message: 'Too many requests, please try again later.',
};

/**
 * Get client IP from request
 */
function getClientIP(req: NextRequest): string {
  // Check common proxy headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Vercel-specific header
  const vercelIP = req.headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    return vercelIP.split(',')[0].trim();
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Check rate limit and return result
 */
export function checkRateLimit(
  req: NextRequest,
  options: Partial<RateLimitOptions> = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const opts = { ...defaultOptions, ...options };
  const key = opts.keyGenerator ? opts.keyGenerator(req) : getClientIP(req);

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + opts.windowMs,
    });
    return {
      allowed: true,
      remaining: opts.maxRequests - 1,
      resetTime: now + opts.windowMs,
    };
  }

  if (record.count >= opts.maxRequests) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count += 1;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: opts.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limit middleware wrapper for API routes
 *
 * Usage:
 * ```typescript
 * import { withRateLimit } from '@/lib/rate-limit';
 *
 * export const GET = withRateLimit(
 *   async (req) => {
 *     return NextResponse.json({ data: 'hello' });
 *   },
 *   { maxRequests: 10, windowMs: 60000 }
 * );
 * ```
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: Partial<RateLimitOptions> = {}
): (req: NextRequest) => Promise<NextResponse> {
  const opts = { ...defaultOptions, ...options };

  return async (req: NextRequest) => {
    const result = checkRateLimit(req, opts);

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: opts.message,
          code: 'RATE_LIMITED',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': opts.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = await handler(req);

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', opts.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

    return response;
  };
}

/**
 * Preset rate limit configurations
 */
export const rateLimitPresets = {
  // Strict: 10 requests per minute (for sensitive endpoints)
  strict: { maxRequests: 10, windowMs: 60 * 1000 },

  // Standard: 60 requests per minute
  standard: { maxRequests: 60, windowMs: 60 * 1000 },

  // Relaxed: 200 requests per minute
  relaxed: { maxRequests: 200, windowMs: 60 * 1000 },

  // Auth: 5 requests per 15 minutes (for login/signup)
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },

  // API: 100 requests per minute (for general API use)
  api: { maxRequests: 100, windowMs: 60 * 1000 },
};

/**
 * Create a rate limiter with custom key (e.g., per user instead of per IP)
 */
export function createUserRateLimiter(options: Partial<RateLimitOptions> = {}) {
  return (userId: string) => {
    return withRateLimit(
      async (req) => NextResponse.next(),
      {
        ...options,
        keyGenerator: () => `user:${userId}`,
      }
    );
  };
}
