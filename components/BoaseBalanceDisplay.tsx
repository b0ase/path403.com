'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useBoaseBalance } from '@/hooks/useBoaseBalance';
import { FiRefreshCw } from 'react-icons/fi';

interface BoaseBalanceDisplayProps {
    className?: string;
    showStaked?: boolean;
    compact?: boolean;
}

export default function BoaseBalanceDisplay({
    className = '',
    showStaked = false,
    compact = false,
}: BoaseBalanceDisplayProps) {
    const { handle, balance, staked, available, isLoading, refresh } = useBoaseBalance();

    if (!handle) {
        return null; // Don't show if not connected
    }

    if (compact) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-yellow-400 font-mono text-sm font-bold">
                    {isLoading ? '...' : balance.toLocaleString()}
                </span>
                <span className="text-yellow-400/60 text-xs">$BOASE</span>
            </div>
        );
    }

    return (
        <div className={`bg-black/50 border border-yellow-500/30 rounded-lg p-3 ${className}`}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-yellow-500/60 uppercase tracking-wider font-mono">
                    $BOASE Balance
                </span>
                <button
                    onClick={refresh}
                    disabled={isLoading}
                    className="text-yellow-500/60 hover:text-yellow-400 transition-colors"
                >
                    <motion.div
                        animate={isLoading ? { rotate: 360 } : {}}
                        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                    >
                        <FiRefreshCw size={12} />
                    </motion.div>
                </button>
            </div>

            <div className="text-2xl font-black text-yellow-400 font-mono">
                {isLoading ? '...' : balance.toLocaleString()}
            </div>

            {showStaked && staked > 0 && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-yellow-500/20 text-xs">
                    <span className="text-zinc-500">Staked:</span>
                    <span className="text-yellow-400/80 font-mono">{staked.toLocaleString()}</span>
                    <span className="text-zinc-600">|</span>
                    <span className="text-zinc-500">Available:</span>
                    <span className="text-yellow-400 font-mono">{available.toLocaleString()}</span>
                </div>
            )}

            <div className="text-[10px] text-zinc-600 mt-1">
                @{handle}
            </div>
        </div>
    );
}
