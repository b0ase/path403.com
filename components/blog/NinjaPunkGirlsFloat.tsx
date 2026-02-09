'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

const BUTTON_SIZE = 80;
const INVESTMENT_TIERS = [
    { tokens: 1, pennies: 1, price: '$0.01', label: '1 Token', description: 'Try it out' },
    { tokens: 100, pennies: 10, price: '$0.10', label: '100 Tokens', description: 'Starter pack' },
    { tokens: 10000, pennies: 100, price: '$1.00', label: '10K Tokens', description: 'Early believer' },
    { tokens: 100000, pennies: 1000, price: '$10.00', label: '100K Tokens', description: 'Serious investor' },
    { tokens: 1000000, pennies: 10000, price: '$100.00', label: '1M Tokens', description: 'Whale mode' },
];

export default function NinjaPunkGirlsFloat() {
    const [showPanel, setShowPanel] = useState(false);
    const [position, setPosition] = useState({ x: 100, y: 300 });
    const [velocity, setVelocity] = useState({ x: -1.3, y: 1.1 });
    const [mounted, setMounted] = useState(false);
    const animationRef = useRef<number | null>(null);

    // DVD-logo style floating animation
    const animate = useCallback(() => {
        if (showPanel) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        setPosition(prev => {
            let newX = prev.x + velocity.x;
            let newY = prev.y + velocity.y;
            let newVelX = velocity.x;
            let newVelY = velocity.y;

            const maxX = window.innerWidth - BUTTON_SIZE - 20;
            const maxY = window.innerHeight - BUTTON_SIZE - 20;
            const minX = 20;
            const minY = 100;

            if (newX <= minX || newX >= maxX) {
                newVelX = -velocity.x * (0.9 + Math.random() * 0.2);
                newX = newX <= minX ? minX : maxX;
            }
            if (newY <= minY || newY >= maxY) {
                newVelY = -velocity.y * (0.9 + Math.random() * 0.2);
                newY = newY <= minY ? minY : maxY;
            }

            if (newVelX !== velocity.x || newVelY !== velocity.y) {
                setVelocity({ x: newVelX, y: newVelY });
            }

            return { x: newX, y: newY };
        });

        animationRef.current = requestAnimationFrame(animate);
    }, [velocity, showPanel]);

    useEffect(() => {
        // Random starting position (different from BTC Sheets)
        setPosition({
            x: Math.random() * (window.innerWidth - BUTTON_SIZE - 200) + 100,
            y: Math.random() * (window.innerHeight - BUTTON_SIZE - 400) + 250,
        });
        // Random starting velocity
        setVelocity({
            x: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
            y: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
        });
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate]);

    const handleInvest = (tier: typeof INVESTMENT_TIERS[0]) => {
        // Redirect to the NPG portfolio page with investment intent
        window.open(`/portfolio/ninjapunkgirls-com?invest=${tier.tokens}`, '_blank');
    };

    const floatContent = (
        <>
            {/* Floating Button */}
            <motion.div
                className="fixed z-50 cursor-pointer"
                style={{
                    left: position.x,
                    top: position.y,
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPanel(true)}
            >
                <div
                    className="w-full h-full rounded-xl flex items-center justify-center relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)',
                        boxShadow: '0 0 30px rgba(236, 72, 153, 0.4), 0 0 60px rgba(236, 72, 153, 0.2)',
                    }}
                >
                    {/* Ninja star pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0l2 8h8l-6 5 2 7-6-4-6 4 2-7-6-5h8z' fill='%23fff' fill-opacity='0.3'/%3E%3C/svg%3E")`,
                            backgroundSize: '20px 20px',
                        }}
                    />
                    {/* Icon */}
                    <div className="relative z-10 text-white font-bold text-xs text-center leading-tight">
                        <div className="text-2xl mb-0.5">🥷</div>
                        <div>NPG</div>
                        <div className="text-[8px] opacity-80">Girls</div>
                    </div>
                </div>
                {/* Pulsing ring */}
                <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-pink-400"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                />
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
                            className="relative w-full max-w-2xl bg-zinc-950 border border-pink-500/30 rounded-xl overflow-hidden"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-pink-500/10 to-transparent">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <span className="text-3xl">🥷</span>
                                            Invest in Ninja Punk Girls
                                        </h2>
                                        <p className="text-zinc-400 mt-2 text-sm">
                                            Join the cyberpunk revolution. $NPG tokens give you ownership in the NFT ecosystem and community.
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
                                            className="group relative p-4 border border-zinc-800 rounded-lg hover:border-pink-500/50 transition-all text-left bg-zinc-900/50 hover:bg-pink-500/5"
                                            onClick={() => handleInvest(tier)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="text-pink-400 font-bold text-lg">
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
                                            <div className="absolute inset-0 rounded-lg bg-pink-500/0 group-hover:bg-pink-500/5 transition-colors" />
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Links */}
                                <div className="mt-6 pt-6 border-t border-zinc-800 flex flex-wrap gap-4">
                                    <Link
                                        href="/portfolio/ninjapunkgirls-com"
                                        className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-2 transition-colors"
                                    >
                                        Learn more about Ninja Punk Girls
                                        <FiExternalLink size={14} />
                                    </Link>
                                    <a
                                        href="https://ninjapunkgirls.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-zinc-400 hover:text-white text-sm flex items-center gap-2 transition-colors"
                                    >
                                        Visit ninjapunkgirls.com
                                        <FiExternalLink size={14} />
                                    </a>
                                </div>

                                {/* Disclaimer */}
                                <p className="text-zinc-600 text-xs mt-4">
                                    Tokens represent utility rights in the Ninja Punk Girls ecosystem.
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
