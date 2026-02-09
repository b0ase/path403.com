'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

const BUTTON_SIZE = 90;
const MONEYBUTTON_IMAGE = '/images/clientprojects/moneybutton-store/moneybutton2_icon.png';

const INVESTMENT_TIERS = [
    { tokens: 1, pennies: 1, price: '$0.01', label: '1 Token', description: 'Try it out' },
    { tokens: 100, pennies: 10, price: '$0.10', label: '100 Tokens', description: 'Starter pack' },
    { tokens: 10000, pennies: 100, price: '$1.00', label: '10K Tokens', description: 'Early believer' },
    { tokens: 100000, pennies: 1000, price: '$10.00', label: '100K Tokens', description: 'Serious investor' },
    { tokens: 1000000, pennies: 10000, price: '$100.00', label: '1M Tokens', description: 'Whale mode' },
    { tokens: 10000000, pennies: 100000, price: '$1,000.00', label: '10M Tokens', description: 'Major investor' },
];

export default function MoneyButtonFloat() {
    const [showPanel, setShowPanel] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInvest = (tier: typeof INVESTMENT_TIERS[0]) => {
        window.open(`/portfolio/moneybutton-store?invest=${tier.tokens}`, '_blank');
    };

    const floatContent = (
        <>
            {/* Fixed Button - Bottom Right */}
            <motion.div
                className="cursor-pointer"
                style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '48px',
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                    zIndex: 9999,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPanel(true)}
            >
                <div
                    className="w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden"
                    style={{
                        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #3a3f55 0%, #252838 40%, #1a1c2a 100%)',
                        boxShadow: '0 0 20px rgba(255, 70, 100, 0.5), 0 0 40px rgba(255, 70, 100, 0.3), inset 0 0 0 3px rgba(255, 70, 100, 0.8), inset 0 -8px 15px rgba(0,0,0,0.4), inset 0 8px 15px rgba(255,255,255,0.1)',
                    }}
                >
                    {/* Top highlight for dome effect */}
                    <div
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-4 rounded-full opacity-30"
                        style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.8) 0%, transparent 70%)' }}
                    />
                    <span className="text-white font-bold text-[8px] tracking-[0.2em] uppercase relative z-10">THE</span>
                    <span className="text-yellow-400 font-black text-[14px] leading-none uppercase relative z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>MONEY</span>
                    <span className="text-white font-bold text-[12px] leading-none uppercase relative z-10" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>BUTTON</span>
                    <span className="text-yellow-400 text-[10px] mt-0.5 relative z-10">$</span>
                </div>
            </motion.div>

            {/* Investment Panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowPanel(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            className="relative w-full max-w-2xl bg-zinc-950 border border-yellow-500/30 rounded-xl overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-yellow-500/10 to-transparent">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black flex items-center gap-3">
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                <Image src={MONEYBUTTON_IMAGE} alt="THE MONEY BUTTON" fill className="object-cover" />
                                            </div>
                                            <span className="text-yellow-400" style={{ textShadow: '0 0 20px rgba(234, 179, 8, 0.5)' }}>THE MONEY BUTTON</span>
                                        </h2>
                                        <p className="text-zinc-400 mt-2 text-sm">
                                            Own a piece of the future of payments. MoneyButton tokens give you equity in the platform and dividends paid in Bitcoin.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowPanel(false)}
                                        className="text-zinc-500 hover:text-white transition-colors p-2"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Investment Tiers */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {INVESTMENT_TIERS.map((tier, index) => (
                                        <motion.button
                                            key={tier.tokens}
                                            className="group relative p-4 border border-zinc-800 rounded-lg hover:border-yellow-500/50 transition-all text-left bg-zinc-900/50 hover:bg-yellow-500/5"
                                            onClick={() => handleInvest(tier)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="text-yellow-400 font-black text-lg uppercase">
                                                {tier.label}
                                            </div>
                                            <div className="text-white text-2xl font-bold mt-1">
                                                {tier.price}
                                            </div>
                                            <div className="text-zinc-500 text-xs mt-1">
                                                {tier.pennies} {tier.pennies === 1 ? 'penny' : 'pennies'}
                                            </div>
                                            <div className="text-zinc-400 text-sm mt-2">
                                                {tier.description}
                                            </div>
                                            {/* Hover glow */}
                                            <div className="absolute inset-0 rounded-lg bg-yellow-500/0 group-hover:bg-yellow-500/5 transition-colors" />
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Links */}
                                <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-wrap gap-4">
                                    <Link
                                        href="/portfolio/moneybutton-store"
                                        className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-2 transition-colors"
                                    >
                                        Learn more about THE MONEY BUTTON
                                        <FiExternalLink size={14} />
                                    </Link>
                                    <Link
                                        href="/moneybuttons"
                                        className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                                    >
                                        Browse MoneyButtons
                                        <FiExternalLink size={14} />
                                    </Link>
                                </div>

                                {/* Disclaimer */}
                                <p className="text-zinc-600 text-xs mt-4">
                                    Tokens represent utility rights in the MoneyButton platform.
                                    This is not financial advice. Please read our terms before investing.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    // Use portal to render outside ContentCard's backdrop-blur container
    if (!mounted) return null;
    return createPortal(floatContent, document.body);
}
