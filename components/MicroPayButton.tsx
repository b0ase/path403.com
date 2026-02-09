'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface MicroPayButtonProps {
    children: React.ReactNode;
    onClick?: () => void | Promise<void>;
    className?: string;
    disabled?: boolean;
    // Optional: override default price/reward
    priceUSD?: number;
    tokenReward?: number;
    // Optional: skip payment for certain actions
    freeAction?: boolean;
}

// Micropayment: 1¢ = 1 $BOASE per click
const DEFAULT_PRICE = 0.01;
const DEFAULT_REWARD = 1;

export default function MicroPayButton({
    children,
    onClick,
    className = '',
    disabled = false,
    priceUSD = DEFAULT_PRICE,
    tokenReward = DEFAULT_REWARD,
    freeAction = false,
}: MicroPayButtonProps) {
    const [isPaying, setIsPaying] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();

        if (disabled || isPaying) return;

        // Free actions bypass payment
        if (freeAction) {
            if (onClick) await onClick();
            return;
        }

        setIsPaying(true);
        setError(null);

        try {
            // Process micropayment
            const res = await fetch('/api/micropay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceUSD, tokenReward }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === 'NO_WALLET') {
                    // Redirect to connect wallet
                    window.location.href = `/paywall?returnTo=${encodeURIComponent(window.location.pathname)}`;
                    return;
                }
                if (data.code === 'INSUFFICIENT_FUNDS') {
                    setError('Insufficient funds. Please top up your HandCash wallet.');
                    return;
                }
                throw new Error(data.error || 'Payment failed');
            }

            // Show reward animation
            setShowReward(true);
            setTimeout(() => setShowReward(false), 1500);

            // Execute the actual onClick after payment succeeds
            if (onClick) {
                await onClick();
            }
        } catch (err: any) {
            console.error('Micropayment failed:', err);
            setError(err.message);
        } finally {
            setIsPaying(false);
        }
    }, [disabled, isPaying, freeAction, onClick, priceUSD, tokenReward]);

    return (
        <div className="relative inline-block">
            <button
                onClick={handleClick}
                disabled={disabled || isPaying}
                className={`relative ${className} ${isPaying ? 'opacity-75 cursor-wait' : ''}`}
            >
                {isPaying ? (
                    <span className="flex items-center gap-2">
                        <motion.span
                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full inline-block"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        />
                        <span className="opacity-70">Processing...</span>
                    </span>
                ) : (
                    children
                )}
            </button>

            {/* Token reward animation */}
            {showReward && (
                <motion.div
                    className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -20 }}
                    exit={{ opacity: 0 }}
                >
                    <span className="text-yellow-400 font-mono text-sm font-bold whitespace-nowrap bg-black/80 px-2 py-1 rounded">
                        +{tokenReward} $BOASE
                    </span>
                </motion.div>
            )}

            {/* Error tooltip */}
            {error && (
                <motion.div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-red-500/90 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-2 opacity-70 hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// HOC to wrap any component with micropayment
export function withMicroPay<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    microPayProps?: Partial<MicroPayButtonProps>
) {
    return function MicroPayWrapped(props: P & { onClick?: () => void }) {
        return (
            <MicroPayButton {...microPayProps} onClick={props.onClick}>
                <WrappedComponent {...props} />
            </MicroPayButton>
        );
    };
}
