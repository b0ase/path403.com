/**
 * Unified API Error Handling
 *
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { logger } from '@/lib/logger';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Handle API errors and return consistent error responses
 */
export function handleAPIError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    logger.warn('API Validation Error:', error.errors);
    return NextResponse.json(
      {
        error: 'Validation Error',
        details: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (error instanceof APIError) {
    logger.warn(`API Error [${error.code}]:`, error.message);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  // Unknown errors (don't expose internal details to client)
  logger.error('Unhandled API error:', error);
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Common API error types
 */
export const APIErrors = {
  unauthorized: () => new APIError('Unauthorized', 401, 'UNAUTHORIZED'),
  forbidden: () => new APIError('Forbidden', 403, 'FORBIDDEN'),
  notFound: (resource?: string) =>
    new APIError(resource ? `${resource} not found` : 'Not found', 404, 'NOT_FOUND'),
  badRequest: (message: string) => new APIError(message, 400, 'BAD_REQUEST'),
  conflict: (message: string) => new APIError(message, 409, 'CONFLICT'),
  tooManyRequests: () => new APIError('Too many requests', 429, 'RATE_LIMIT'),
  internalError: (message: string = 'Internal server error') =>
    new APIError(message, 500, 'INTERNAL_ERROR'),
};
