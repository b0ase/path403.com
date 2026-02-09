/**
 * Centralized exports for all React contexts
 *
 * Usage:
 *   import { CartContext, useCart } from '@/lib/contexts';
 *   import { ChatContext, useChatContext } from '@/lib/contexts';
 *   import { YoursWalletProvider, useYoursWalletContext } from '@/lib/contexts';
 *   import { StudioProvider, useStudio } from '@/lib/contexts';
 */

// Export all contexts
export { CartContext, CartProvider, useCart } from './CartContext';
export { ChatContext, ChatProvider, useChatContext } from './ChatContext';
export { YoursWalletContext, YoursWalletProvider, useYoursWalletContext } from './YoursWalletContext';
export { MusicContext, MusicProvider } from './MusicContext';
export { StudioProvider, useStudio } from './StudioContext';

// Re-export types
export type { CartItem, CartState } from './CartContext';
