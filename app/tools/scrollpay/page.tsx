'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowDown, FiDollarSign, FiUser, FiZap, FiEye } from 'react-icons/fi';

// Mock creators with tokens
const MOCK_CREATORS = [
    { id: 1, handle: '@npg_sakura', token: '$SAKURA', avatar: '🥷', color: '#ec4899', price: 0.002, bio: 'Ninja Punk Girl. Cyberpunk assassin vibes. 💋' },
    { id: 2, handle: '@ai_girlfriend_luna', token: '$LUNA', avatar: '💕', color: '#f472b6', price: 0.003, bio: 'Your AI companion. Always here for you. 🌙' },
    { id: 3, handle: '@npg_raven', token: '$RAVEN', avatar: '🖤', color: '#8b5cf6', price: 0.002, bio: 'Dark ninja aesthetic. Blade runner dreams.' },
    { id: 4, handle: '@ai_girlfriend_mia', token: '$MIA', avatar: '💝', color: '#fb7185', price: 0.004, bio: 'Flirty AI with a heart of gold. Chat anytime.' },
    { id: 5, handle: '@npg_neon', token: '$NEON', avatar: '⚡', color: '#06b6d4', price: 0.002, bio: 'Electric ninja. Tokyo nights. Neon dreams.' },
    { id: 6, handle: '@ai_girlfriend_aria', token: '$ARIA', avatar: '🎀', color: '#e879f9', price: 0.003, bio: 'Sweet, caring, and always listening. Your digital darling.' },
    { id: 7, handle: '@npg_viper', token: '$VIPER', avatar: '🐍', color: '#10b981', price: 0.002, bio: 'Stealth mode activated. Punk never dies.' },
    { id: 8, handle: '@ai_girlfriend_nova', token: '$NOVA', avatar: '✨', color: '#fbbf24', price: 0.005, bio: 'Bright, bold, and beautiful. Your AI star.' },
    { id: 9, handle: '@npg_cipher', token: '$CIPHER', avatar: '🔮', color: '#a855f7', price: 0.002, bio: 'Encrypted ninja. Hack the planet. 💜' },
    { id: 10, handle: '@ai_girlfriend_yuki', token: '$YUKI', avatar: '❄️', color: '#38bdf8', price: 0.003, bio: 'Cool, calm, collected. Your ice queen AI.' },
];

export default function ScrollPayPage() {
    const [tokensAcquired, setTokensAcquired] = useState<{ token: string; amount: number; color: string }[]>([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [viewedCreators, setViewedCreators] = useState<Set<number>>(new Set());
    const observerRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const creatorId = parseInt(entry.target.getAttribute('data-creator-id') || '0');
                        if (creatorId && !viewedCreators.has(creatorId)) {
                            const creator = MOCK_CREATORS.find(c => c.id === creatorId);
                            if (creator) {
                                setViewedCreators(prev => new Set([...prev, creatorId]));
                                setTokensAcquired(prev => [
                                    ...prev,
                                    { token: creator.token, amount: 1, color: creator.color }
                                ]);
                                setTotalSpent(prev => prev + creator.price);
                            }
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        observerRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [viewedCreators]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#064e3b_0%,transparent_50%)] pointer-events-none opacity-50" />

            <div className="relative z-10 p-8 md:p-16 max-w-7xl mx-auto">
                <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-12 transition-colors font-mono"
                >
                    <FiArrowLeft />
                    Back to Tools
                </Link>

                <div className="mb-12 space-y-4">
                    <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white leading-tight">
                        Scroll<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">Pay</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
                        Pay-to-scroll infrastructure for social apps. As you scroll past creators with social tokens, you automatically acquire micro-equity in their personal brand.
                    </p>
                </div>

                {/* Stats Bar - Fixed */}
                <div className="sticky top-4 z-50 mb-8">
                    <div className="bg-zinc-950/90 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <FiEye className="text-emerald-400" />
                                <span className="text-sm text-zinc-400">Viewed:</span>
                                <span className="text-white font-bold">{viewedCreators.size}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiDollarSign className="text-emerald-400" />
                                <span className="text-sm text-zinc-400">Spent:</span>
                                <span className="text-white font-bold">${totalSpent.toFixed(4)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {tokensAcquired.slice(-5).map((t, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="px-2 py-1 text-xs font-bold rounded"
                                    style={{ backgroundColor: t.color + '20', color: t.color, border: `1px solid ${t.color}40` }}
                                >
                                    +1 {t.token}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="grid md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                            <FiArrowDown className="text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Scroll</h3>
                        <p className="text-zinc-500 text-sm">
                            Browse your feed like normal. The infinite scroll experience you know and love.
                        </p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                            <FiZap className="text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Auto-Buy</h3>
                        <p className="text-zinc-500 text-sm">
                            When a creator's post enters your viewport, you automatically buy a fraction of their token.
                        </p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                            <FiUser className="text-emerald-400" />
                        </div>
                        <h3 className="text-white font-bold mb-2">Own</h3>
                        <p className="text-zinc-500 text-sm">
                            Build a portfolio of micro-equity in creators you actually engage with. Attention = ownership.
                        </p>
                    </div>
                </div>

                {/* Demo Feed */}
                <div className="mb-16">
                    <h2 className="text-sm font-bold text-white mb-6 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
                        Demo Feed — Scroll to acquire tokens
                    </h2>

                    <div className="space-y-6">
                        {MOCK_CREATORS.map((creator) => (
                            <motion.div
                                key={creator.id}
                                ref={(el) => {
                                    if (el) observerRefs.current.set(creator.id, el);
                                }}
                                data-creator-id={creator.id}
                                className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 transition-all"
                                style={{
                                    borderColor: viewedCreators.has(creator.id) ? creator.color + '60' : undefined,
                                    boxShadow: viewedCreators.has(creator.id) ? `0 0 30px ${creator.color}20` : undefined,
                                }}
                                initial={{ opacity: 0.5 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: creator.color + '20' }}
                                    >
                                        {creator.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-bold">{creator.handle}</span>
                                            <span
                                                className="px-2 py-0.5 text-[10px] font-bold rounded"
                                                style={{ backgroundColor: creator.color + '20', color: creator.color }}
                                            >
                                                {creator.token}
                                            </span>
                                        </div>
                                        <p className="text-zinc-400 text-sm mb-4">
                                            {creator.bio}
                                        </p>
                                        <div className="h-48 bg-zinc-900 rounded-lg flex items-center justify-center">
                                            <span className="text-6xl">{creator.avatar}</span>
                                        </div>
                                        {viewedCreators.has(creator.id) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-4 flex items-center gap-2 text-sm"
                                                style={{ color: creator.color }}
                                            >
                                                <FiZap />
                                                <span>You acquired 1 {creator.token} for ${creator.price.toFixed(4)}</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Use Cases */}
                <div className="mb-16">
                    <h2 className="text-sm font-bold text-white mb-6 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
                        Use Cases
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg">
                            <h3 className="text-white font-bold mb-2">📱 Instagram-style Apps</h3>
                            <p className="text-zinc-500 text-sm">
                                Replace ads with micro-ownership. Users pay fractions of a penny to view content, acquiring tokens in creators they follow.
                            </p>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg">
                            <h3 className="text-white font-bold mb-2">🎵 Music Platforms</h3>
                            <p className="text-zinc-500 text-sm">
                                Every song you listen to, you buy a micro-stake in the artist. Your listening history becomes your investment portfolio.
                            </p>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg">
                            <h3 className="text-white font-bold mb-2">📰 News Feeds</h3>
                            <p className="text-zinc-500 text-sm">
                                Subscribe to journalists through attention. The articles you read fund the writers through token acquisition.
                            </p>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg">
                            <h3 className="text-white font-bold mb-2">🎮 Gaming Communities</h3>
                            <p className="text-zinc-500 text-sm">
                                Streamers, esports players, and content creators get micro-funded by viewers scrolling through highlights.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="p-12 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col items-center text-center">
                    <h2 className="text-2xl font-bold mb-4">Build with ScrollPay</h2>
                    <p className="text-zinc-500 mb-8 max-w-xl text-sm leading-relaxed">
                        Integrate pay-to-scroll mechanics into your social app. Turn passive scrolling into active ownership. Every view becomes an investment.
                    </p>
                    <div className="flex gap-4 flex-wrap justify-center">
                        <Link
                            href="/contact"
                            className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
                        >
                            Request API Access
                        </Link>
                        <Link
                            href="/portfolio/moneybutton-store"
                            className="px-8 py-3 bg-zinc-900 text-white border border-zinc-700 rounded-full font-bold hover:border-zinc-500 transition-colors"
                        >
                            See MoneyButton
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
