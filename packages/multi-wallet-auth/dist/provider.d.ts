import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { d as WalletProvider, c as WalletContext } from './types-CxXCGG8p.js';
export { C as Chain, f as WalletState } from './types-CxXCGG8p.js';

/**
 * Use the wallet context
 *
 * @example
 * ```tsx
 * const { isConnected, address, connect, disconnect } = useWallet();
 *
 * if (isConnected) {
 *   return <div>Connected: {address}</div>;
 * }
 *
 * return <button onClick={() => connect('handcash')}>Connect</button>;
 * ```
 */
declare function useWallet(): WalletContext;
interface MultiWalletProviderProps {
    children: ReactNode;
    /** HandCash OAuth redirect URL (defaults to /api/auth/handcash) */
    handcashAuthUrl?: string;
    /** Whether to persist wallet selection to localStorage */
    persistSelection?: boolean;
    /** Storage key for persisted wallet */
    storageKey?: string;
    /** Callback when wallet connects */
    onConnect?: (provider: WalletProvider, address: string) => void;
    /** Callback when wallet disconnects */
    onDisconnect?: () => void;
    /** Callback on connection error */
    onError?: (error: Error) => void;
}
/**
 * Multi-Wallet Provider
 *
 * Wraps your app to provide unified wallet authentication.
 *
 * @example
 * ```tsx
 * import { MultiWalletProvider } from '@b0ase/multi-wallet-auth/provider';
 *
 * function App() {
 *   return (
 *     <MultiWalletProvider handcashAuthUrl="/api/auth/handcash">
 *       <YourApp />
 *     </MultiWalletProvider>
 *   );
 * }
 * ```
 */
declare function MultiWalletProvider({ children, handcashAuthUrl, persistSelection, storageKey, onConnect, onDisconnect, onError, }: MultiWalletProviderProps): react_jsx_runtime.JSX.Element;

export { MultiWalletProvider, type MultiWalletProviderProps, WalletContext, WalletProvider as WalletProviderType, MultiWalletProvider as default, useWallet };
