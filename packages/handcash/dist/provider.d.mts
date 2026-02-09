import * as react_jsx_runtime from 'react/jsx-runtime';
import { ReactNode } from 'react';
import { l as HandCashProfile, g as HandCashContextType } from './types-oh6C3t2b.mjs';
export { H as HandCashAsset, a as HandCashAuthError, b as HandCashAuthResponse, c as HandCashAuthState, d as HandCashBalance, e as HandCashClientConfig, f as HandCashConfig, h as HandCashDemoModeError, i as HandCashError, j as HandCashItem, k as HandCashPrivateProfile, m as HandCashPublicProfile, M as MultiPaymentParams, P as PaymentDestination, n as PaymentResult, S as SinglePaymentParams, o as SpendableBalance, T as TransferItemsParams, p as TransferResult } from './types-oh6C3t2b.mjs';

/**
 * Hook to access HandCash functionality.
 * Must be used within a HandCashProvider.
 */
declare function useHandCash(): HandCashContextType;
interface HandCashProviderProps {
    children: ReactNode;
    appId: string;
    redirectUri?: string;
    permissions?: string[];
    /**
     * Enable mock mode for development.
     * When true, signIn() will use mock authentication.
     */
    mockMode?: boolean;
    /**
     * Custom mock profile data for development.
     */
    mockProfile?: Partial<HandCashProfile>;
    /**
     * Callback when authentication state changes.
     */
    onAuthChange?: (isAuthenticated: boolean, profile: HandCashProfile | null) => void;
}
declare function HandCashProvider({ children, appId, redirectUri, permissions, mockMode, mockProfile, onAuthChange, }: HandCashProviderProps): react_jsx_runtime.JSX.Element;
/**
 * Simple connect button component
 */
interface ConnectButtonProps {
    className?: string;
    children?: ReactNode;
}
declare function HandCashConnectButton({ className, children }: ConnectButtonProps): react_jsx_runtime.JSX.Element;
/**
 * Display user profile when authenticated
 */
interface ProfileDisplayProps {
    className?: string;
    showBalance?: boolean;
}
declare function HandCashProfileDisplay({ className, showBalance }: ProfileDisplayProps): react_jsx_runtime.JSX.Element | null;

export { HandCashConnectButton, HandCashContextType, HandCashProfile, HandCashProfileDisplay, HandCashProvider, useHandCash };
