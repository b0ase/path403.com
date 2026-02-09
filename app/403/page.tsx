'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiShield, FiHome, FiLock } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import { useNavbar } from '@/components/NavbarProvider';

const WireframeAnimation = dynamic(
    () => import('@/components/landing/WireframeAnimation'),
    {
        ssr: false,
        loading: () => <div className="w-full h-full bg-transparent" />
    }
);

export default function Forbidden() {
    const [isClient, setIsClient] = useState(false);
    const { isDark } = useNavbar();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative overflow-hidden`}>
            {/* Three.js Background Animation */}
            <div className="fixed inset-0 z-0">
                <WireframeAnimation
                    isDark={isDark}
                    colorTheme={isDark ? 'black' : 'white'}
                    colorIntense={false}
                    structured={true}
                    animationExpanded={false}
                    shadeLevel={2}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-2xl"
                >
                    {/* 403 */}
                    <h1
                        className="text-9xl md:text-[12rem] font-black leading-none mb-4 tracking-tighter"
                        style={{
                            fontFamily: 'var(--font-space-grotesk)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        403
                    </h1>

                    {/* Error Message */}
                    <h2
                        className={`text-2xl md:text-3xl font-bold mb-4 uppercase tracking-wide flex items-center justify-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}
                        style={{ fontFamily: 'var(--font-space-grotesk)' }}
                    >
                        <FiShield className="mb-1" />
                        Access Denied
                    </h2>

                    <p
                        className={`text-base md:text-lg mb-8 ${isDark ? 'text-white/70' : 'text-black/70'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        You do not have permission to access this resource. <br />
                        Please contact the administrator or login with appropriate credentials.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/"
                            className={`group flex items-center gap-2 px-8 py-4 rounded-full transition-all text-sm font-bold uppercase tracking-wider ${isDark
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-black text-white hover:bg-gray-800'
                                }`}
                        >
                            <FiHome size={16} />
                            <span>Return Home</span>
                        </Link>

                        <Link
                            href="/login"
                            className={`group flex items-center gap-2 px-8 py-4 rounded-full border transition-all text-sm font-bold uppercase tracking-wider ${isDark
                                ? 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white'
                                : 'border-black/20 hover:border-black/40 bg-black/5 hover:bg-black/10 text-black'
                                }`}
                        >
                            <FiLock size={16} />
                            <span>Login</span>
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <p className={`text-xs uppercase tracking-widest mb-4 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                            Helpful Links:
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {['Support', 'Contact', 'Terms'].map((page) => (
                                <Link
                                    key={page}
                                    href={`/${page.toLowerCase()}`}
                                    className={`text-xs uppercase font-bold px-4 py-2 rounded-full border transition-all ${isDark
                                        ? 'border-zinc-800 hover:border-zinc-600 hover:bg-white/5 text-zinc-400 hover:text-white'
                                        : 'border-zinc-200 hover:border-zinc-400 hover:bg-black/5 text-zinc-600 hover:text-black'
                                        }`}
                                >
                                    {page}
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
