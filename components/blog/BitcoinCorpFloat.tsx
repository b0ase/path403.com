'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink, FiShield } from 'react-icons/fi';
import Link from 'next/link';

const BUTTON_SIZE = 90;
const ACCENT = '#38bdf8'; // sky-400

// Real tranches from thebitcoincorporation.website
// 1bn total supply, geometric price scaling, linear quantity scaling
const BCORP_TRANCHES = [
    { tranche: 1, equity: '1%', tokens: '10,000,000', price: '£1,000', pricePerToken: '£0.0001', status: 'open' },
    { tranche: 2, equity: '2%', tokens: '20,000,000', price: '£10,000', pricePerToken: '£0.0005', status: 'current' },
    { tranche: 3, equity: '3%', tokens: '30,000,000', price: '£100,000', pricePerToken: '£0.0033', status: 'upcoming' },
    { tranche: 4, equity: '4%', tokens: '40,000,000', price: '£1,000,000', pricePerToken: '£0.025', status: 'upcoming' },
];

export default function BitcoinCorpFloat() {
    const [showPanel, setShowPanel] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, #0c2d4a 0%, #081a2e 40%, #040d17 100%)',
                        boxShadow: `0 0 20px rgba(56, 189, 248, 0.4), 0 0 40px rgba(56, 189, 248, 0.2), inset 0 0 0 3px rgba(56, 189, 248, 0.7), inset 0 -8px 15px rgba(0,0,0,0.4), inset 0 8px 15px rgba(255,255,255,0.08)`,
                    }}
                >
                    <div
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-4 rounded-full opacity-30"
                        style={{ background: 'radial-gradient(ellipse, rgba(56,189,248,0.8) 0%, transparent 70%)' }}
                    />
                    <span
                        className="font-black text-[26px] leading-none relative z-10"
                        style={{ color: ACCENT, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                        B
                    </span>
                    <span
                        className="font-bold text-[7px] tracking-[0.15em] uppercase relative z-10"
                        style={{ color: ACCENT, opacity: 0.7 }}
                    >
                        $BCORP
                    </span>
                </div>
            </motion.div>

            {/* Panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setShowPanel(false)}
                        />

                        <motion.div
                            className="relative w-full max-w-2xl bg-zinc-950 rounded-xl overflow-hidden"
                            style={{ border: `1px solid rgba(56, 189, 248, 0.3)` }}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div
                                className="p-6 border-b border-zinc-800"
                                style={{ background: `linear-gradient(to right, rgba(56, 189, 248, 0.08), transparent)` }}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 flex items-center justify-center font-black text-black text-xl rounded"
                                                style={{ backgroundColor: ACCENT }}
                                            >
                                                B
                                            </div>
                                            <span style={{ color: ACCENT, textShadow: `0 0 20px rgba(56, 189, 248, 0.5)` }}>
                                                BITCOIN CORPORATION
                                            </span>
                                        </h2>
                                        <p className="text-zinc-400 mt-2 text-sm">
                                            Fork the code, fork the token. 1,000,000,000 $BCORP tokens. First 10% offered in four tranches.
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

                            {/* KYC Notice */}
                            <div className="mx-6 mt-6 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
                                <FiShield className="text-amber-400 flex-shrink-0" size={18} />
                                <div>
                                    <p className="text-amber-400 font-bold text-xs uppercase tracking-wider">$401 KYC Required</p>
                                    <p className="text-zinc-500 text-xs mt-0.5">$BCORP is a registered security. Identity verification required before purchase.</p>
                                </div>
                            </div>

                            {/* Tranche Grid */}
                            <div className="p-6">
                                <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-3">Tranche Structure — Geometric Pricing</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {BCORP_TRANCHES.map((t, index) => (
                                        <motion.div
                                            key={t.tranche}
                                            className={`relative p-4 border rounded-lg text-left bg-zinc-900/50 ${
                                                t.status === 'current'
                                                    ? 'border-sky-500/50 bg-sky-900/10'
                                                    : 'border-zinc-800'
                                            }`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            {t.status === 'current' && (
                                                <div className="absolute -top-2 right-3 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-sky-500 text-black">
                                                    Current
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="font-black text-lg" style={{ color: ACCENT }}>
                                                    {t.equity}
                                                </div>
                                                <div className="text-[10px] font-mono text-zinc-600 uppercase">
                                                    Tranche {t.tranche}
                                                </div>
                                            </div>
                                            <div className="text-white text-2xl font-bold mt-1">
                                                {t.price}
                                            </div>
                                            <div className="text-zinc-500 text-xs mt-1 font-mono">
                                                {t.tokens} tokens @ {t.pricePerToken}/ea
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Links */}
                                <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-wrap gap-4">
                                    <a
                                        href="https://thebitcoincorporation.website"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm flex items-center gap-2 transition-colors hover:opacity-80"
                                        style={{ color: ACCENT }}
                                    >
                                        thebitcoincorporation.website
                                        <FiExternalLink size={14} />
                                    </a>
                                    <Link
                                        href="/blog/bitcoin-corporation-model"
                                        className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                                    >
                                        Read the model
                                        <FiExternalLink size={14} />
                                    </Link>
                                </div>

                                <p className="text-zinc-600 text-xs mt-4">
                                    $BCORP is a $401-wrapped security token. KYC/AML verification required.
                                    Contact hello@b0ase.com for investor enquiries.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );

    if (!mounted) return null;
    return createPortal(floatContent, document.body);
}
