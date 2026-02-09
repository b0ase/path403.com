'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '@/lib/data';

interface TokenAssetButtonProps {
    ticker: string;
    isCompany?: boolean;
    size?: number;
}

export const TokenAssetButton: React.FC<TokenAssetButtonProps> = ({
    ticker,
    isCompany = false,
    size = 48
}) => {
    // Find project image if available
    const project = portfolioData.projects.find(p =>
        p.tokenName?.replace('$', '').toUpperCase() === ticker.toUpperCase()
    );

    const bgImage = project?.cardImageUrls?.[0];

    // Company theme: yellow/gold
    // Project theme: neutral/branded
    const containerStyle = isCompany
        ? 'bg-yellow-600/20 border-yellow-500/30'
        : 'bg-zinc-800 border-zinc-700/50';

    const textStyle = isCompany ? 'text-yellow-500' : 'text-zinc-400';

    return (
        <motion.div
            className={`relative rounded-lg flex items-center justify-center overflow-hidden border ${containerStyle}`}
            style={{ width: size, height: size }}
            whileHover={{ scale: 1.05 }}
        >
            {bgImage ? (
                <>
                    <img
                        src={bgImage}
                        alt={ticker}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </>
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-50`} />
            )}

            <span className={`relative z-10 font-bold uppercase tracking-tighter ${textStyle}`} style={{ fontSize: size * 0.25 }}>
                {ticker.substring(0, 4)}
            </span>

            {/* Glass catch */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </motion.div>
    );
};
