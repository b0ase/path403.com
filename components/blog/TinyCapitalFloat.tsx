'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

const BUTTON_SIZE = 90;
const GOLD = '#d4af37';

const TINY_TRANCHES = [
    { tranche: 1, equity: '1%', price: '$0.01', label: 'A penny', description: 'Signal interest' },
    { tranche: 2, equity: '2%', price: '$0.10', label: 'Ten pence', description: 'Early believer' },
    { tranche: 3, equity: '3%', price: '$1.00', label: 'A dollar', description: 'Committed' },
    { tranche: 4, equity: '4%', price: '$10.00', label: 'Ten dollars', description: 'Serious stake' },
    { tranche: 5, equity: '5%', price: '$100.00', label: 'A hundred', description: 'Major partner' },
    { tranche: 6, equity: '6%', price: '$1,000.00', label: 'A thousand', description: 'Lead investor' },
];

export default function TinyCapitalFloat() {
    const [showPanel, setShowPanel] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInvest = (tranche: typeof TINY_TRANCHES[0]) => {
        window.open(`/invest/tiny-capital-partners?tranche=${tranche.tranche}`, '_blank');
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
                        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #2a2520 0%, #1a1610 40%, #0d0b08 100%)',
                        boxShadow: `0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3), inset 0 0 0 3px rgba(212, 175, 55, 0.8), inset 0 -8px 15px rgba(0,0,0,0.4), inset 0 8px 15px rgba(255,255,255,0.1)`,
                    }}
                >
                    {/* Top highlight for dome effect */}
                    <div
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-4 rounded-full opacity-30"
                        style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.8) 0%, transparent 70%)' }}
                    />
                    <span
                        className="font-black text-[32px] leading-none relative z-10"
                        style={{ color: GOLD, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                        T
                    </span>
                    <span
                        className="font-bold text-[8px] tracking-[0.2em] uppercase relative z-10"
                        style={{ color: GOLD, opacity: 0.7 }}
                    >
                        $TINY
                    </span>
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
                            className="relative w-full max-w-2xl bg-zinc-950 rounded-xl overflow-hidden"
                            style={{ border: `1px solid rgba(212, 175, 55, 0.3)` }}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div
                                className="p-6 border-b border-zinc-800"
                                style={{ background: `linear-gradient(to right, rgba(212, 175, 55, 0.1), transparent)` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 flex items-center justify-center font-black text-black text-xl"
                                                style={{ backgroundColor: GOLD }}
                                            >
                                                T
                                            </div>
                                            <span style={{ color: GOLD, textShadow: `0 0 20px rgba(212, 175, 55, 0.5)` }}>
                                                TINY CAPITAL PARTNERS
                                            </span>
                                        </h2>
                                        <p className="text-zinc-400 mt-2 text-sm">
                                            Small stakes. Absolute signal. Buy $TINY tokens to participate in the zero-capital venture fund.
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

                            {/* Tranche Grid */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {TINY_TRANCHES.map((tier, index) => (
                                        <motion.button
                                            key={tier.tranche}
                                            className="group relative p-4 border border-zinc-800 rounded-lg hover:border-yellow-600/50 transition-all text-left bg-zinc-900/50 hover:bg-yellow-900/10"
                                            onClick={() => handleInvest(tier)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div
                                                    className="font-black text-lg uppercase"
                                                    style={{ color: GOLD }}
                                                >
                                                    {tier.equity}
                                                </div>
                                                <div className="text-[10px] font-mono text-zinc-600 uppercase">
                                                    Tranche {tier.tranche}
                                                </div>
                                            </div>
                                            <div className="text-white text-2xl font-bold mt-1">
                                                {tier.price}
                                            </div>
                                            <div className="text-zinc-500 text-xs mt-1">
                                                {tier.label}
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
                                        href="/blog/tiny-capital-partners"
                                        className="text-sm flex items-center gap-2 transition-colors hover:opacity-80"
                                        style={{ color: GOLD }}
                                    >
                                        Read the full offer
                                        <FiExternalLink size={14} />
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                                    >
                                        Get in touch
                                        <FiExternalLink size={14} />
                                    </Link>
                                </div>

                                {/* Disclaimer */}
                                <p className="text-zinc-600 text-xs mt-4">
                                    $TINY tokens represent participation in the Tiny Capital Partners fund.
                                    Wallet integration coming soon. This is not financial advice.
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
