/**
 * API Route Middleware
 *
 * Provides reusable middleware for protecting endpoints with:
 * - Authentication verification (Supabase)
 * - Request validation (Zod)
 * - Error handling
 * - Rate limiting (placeholder)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { handleAPIError } from './error-handler';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth';

export interface AuthSession {
  user?: {
    id: string;
    email?: string;
    user_metadata?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Wrap an API route handler with error handling
 *
 * Usage:
 * ```typescript
 * export const GET = withErrorHandler(async (req) => {
 *   const data = await fetchData();
 *   return NextResponse.json({ data });
 * });
 * ```
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error('API Route Error:', error);
      return handleAPIError(error);
    }
  };
}

/**
 * Require authentication for an API route
 *
 * Usage:
 * ```typescript
 * export const GET = requireAuth(async (req, user) => {
 *   const userId = user.id;
 *   return NextResponse.json({ userId });
 * });
 * ```
 */
export function requireAuth(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return withErrorHandler(async (req: NextRequest) => {
    try {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        logger.warn('Unauthorized API access attempt');
        return NextResponse.json(
          { error: 'Unauthorized', code: 'NO_USER' },
          { status: 401 }
        );
      }

      return handler(req, user);
    } catch (error) {
      logger.error('Auth error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }
  });
}

/**
 * Require admin role for an API route
 *
 * Usage:
 * ```typescript
 * export const DELETE = requireAdmin(async (req, user) => {
 *   // Admin-only logic
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function requireAdmin(
  handler: (req: NextRequest, user: any) => Promise<NextResponse>
) {
  return withErrorHandler(async (req: NextRequest) => {
    try {
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'NO_USER' },
          { status: 401 }
        );
      }

      const isAdmin = isAdminEmail(user.email || '');
      if (!isAdmin) {
        logger.warn(`Non-admin access attempt for admin endpoint: ${req.nextUrl.pathname}`);
        return NextResponse.json(
          { error: 'Forbidden', code: 'ADMIN_REQUIRED' },
          { status: 403 }
        );
      }

      return handler(req, user);
    } catch (error) {
      logger.error('Auth error:', error);
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 401 }
      );
    }
  });
}

/**
 * Validate request body with Zod schema
 *
 * Usage:
 * ```typescript
 * const bodySchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 *
 * export const POST = validateBody(bodySchema, async (req, session, body) => {
 *   // body is typed and validated
 *   return NextResponse.json({ email: body.email });
 * });
 * ```
 */
export function validateBody<T>(
  schema: ZodSchema,
  handler: (req: NextRequest, body: T) => Promise<NextResponse>
) {
  return withErrorHandler(async (req: NextRequest) => {
    try {
      const bodyData = await req.json();
      const validated = schema.parse(bodyData);
      return handler(req, validated as T);
    } catch (error) {
      return handleAPIError(error);
    }
  });
}

/**
 * Require auth AND validate body
 *
 * Usage:
 * ```typescript
 * export const POST = requireAuthAndValidate(
 *   bodySchema,
 *   async (req, user, body) => {
 *     // Authenticated and body is validated
 *     return NextResponse.json({ userId: user.id });
 *   }
 * );
 * ```
 */
export function requireAuthAndValidate<T>(
  schema: ZodSchema,
  handler: (req: NextRequest, user: any, body: T) => Promise<NextResponse>
) {
  return withErrorHandler(async (req: NextRequest) => {
    try {
      // Check auth
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'NO_USER' },
          { status: 401 }
        );
      }

      // Validate body
      const bodyData = await req.json();
      const validated = schema.parse(bodyData);
      return handler(req, user, validated as T);
    } catch (error) {
      return handleAPIError(error);
    }
  });
}

/**
 * Rate limiting middleware
 * Re-exported from @/lib/rate-limit for convenience
 */
export { withRateLimit, rateLimitPresets, checkRateLimit } from '@/lib/rate-limit';

/**
 * Require specific role(s) for an API route
 */
export function requireRole(...roles: string[]) {
  return (handler: (req: NextRequest, user: any) => Promise<NextResponse>) => {
    return withErrorHandler(async (req: NextRequest) => {
      try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          return NextResponse.json(
            { error: 'Unauthorized', code: 'NO_USER' },
            { status: 401 }
          );
        }

        const userRole = user.user_metadata?.role;
        if (!userRole || !roles.includes(userRole)) {
          logger.warn(`Insufficient permissions for endpoint: ${req.nextUrl.pathname}`);
          return NextResponse.json(
            { error: 'Forbidden', code: 'INSUFFICIENT_PERMISSIONS' },
            { status: 403 }
          );
        }

        return handler(req, user);
      } catch (error) {
        logger.error('Auth error:', error);
        return NextResponse.json(
          { error: 'Authentication error' },
          { status: 401 }
        );
      }
    });
  };
}
