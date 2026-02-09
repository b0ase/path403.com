/**
 * @b0ase/handcash
 *
 * Unified HandCash integration for all b0ase apps.
 *
 * This package provides:
 * - Server-side service for payments and wallet operations
 * - Client-side auth service for OAuth flow
 * - React provider and hooks for state management
 * - Shared types across the ecosystem
 *
 * @example Server-side usage (API routes, server actions)
 * ```typescript
 * import { HandCashServer, handcashServer } from '@b0ase/handcash/server';
 *
 * // Use singleton
 * const profile = await handcashServer.getUserProfile(authToken);
 *
 * // Or create instance with custom config
 * const server = new HandCashServer({
 *   appId: process.env.HANDCASH_APP_ID!,
 *   appSecret: process.env.HANDCASH_APP_SECRET!,
 * });
 * ```
 *
 * @example Client-side usage (OAuth flow)
 * ```typescript
 * import { HandCashClient } from '@b0ase/handcash/client';
 *
 * const client = new HandCashClient({ appId: 'your-app-id' });
 *
 * // Start OAuth
 * window.location.href = client.getOAuthUrl();
 *
 * // Handle callback
 * const result = await client.handleOAuthCallback(code);
 * ```
 *
 * @example React usage (provider and hooks)
 * ```tsx
 * import { HandCashProvider, useHandCash } from '@b0ase/handcash/provider';
 *
 * // Wrap your app
 * <HandCashProvider appId="your-app-id">
 *   <App />
 * </HandCashProvider>
 *
 * // Use the hook
 * const { isAuthenticated, profile, balance, signIn, sendPayment } = useHandCash();
 * ```
 *
 * @packageDocumentation
 */

// Re-export all types
export * from './types';

// Re-export server module
export { HandCashServer, handcashServer } from './server';

// Re-export client module
export { HandCashClient, createHandCashClient } from './client';

// Re-export provider module
export {
  HandCashProvider,
  useHandCash,
  HandCashConnectButton,
  HandCashProfileDisplay,
} from './provider';
