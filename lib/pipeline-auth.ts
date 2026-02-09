/**
 * Pipeline API Authentication
 *
 * Validates requests from the Kintsugi agent.
 * Uses a simple API key check via Authorization header.
 */

import { NextRequest } from 'next/server';

const PIPELINE_API_KEY = process.env.PIPELINE_API_KEY;

export interface PipelineAuthResult {
  authenticated: boolean;
  isAgent: boolean;  // true if request is from Kintsugi agent
  error?: string;
}

/**
 * Authenticate a pipeline API request
 *
 * Accepts either:
 * - Authorization: Bearer <PIPELINE_API_KEY> (for Kintsugi agent)
 * - Valid user session (for human users via dashboard)
 */
export function authenticatePipelineRequest(request: NextRequest): PipelineAuthResult {
  const authHeader = request.headers.get('Authorization');
  const gatewayHeader = request.headers.get('X-Gateway-Request');

  // Check for API key (agent requests)
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    if (!PIPELINE_API_KEY) {
      console.warn('[pipeline-auth] PIPELINE_API_KEY not configured');
      return {
        authenticated: false,
        isAgent: false,
        error: 'Pipeline API key not configured on server',
      };
    }

    if (token === PIPELINE_API_KEY) {
      return {
        authenticated: true,
        isAgent: true,
      };
    }

    return {
      authenticated: false,
      isAgent: false,
      error: 'Invalid API key',
    };
  }

  // Check for gateway header (requests proxied through gateway)
  if (gatewayHeader === 'true') {
    // Gateway has already authenticated with its own key
    // This header is only set by our gateway, not by external requests
    return {
      authenticated: true,
      isAgent: true,
    };
  }

  // No API key - will fall through to user session auth in the route
  return {
    authenticated: false,
    isAgent: false,
  };
}

/**
 * Check if a request has valid pipeline authentication
 * For use in route handlers
 */
export function requirePipelineAuth(request: NextRequest): PipelineAuthResult {
  const result = authenticatePipelineRequest(request);

  if (result.authenticated) {
    return result;
  }

  // If no API key, the route should check for user session
  return {
    authenticated: false,
    isAgent: false,
  };
}
