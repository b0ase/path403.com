'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaTelegram, FaLock, FaCheckCircle, FaRocket, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import { FiZap, FiUser } from 'react-icons/fi';
import PublicNavbar from '@/components/PublicNavbar';
import { useAuth } from '@/components/Providers';
import { useUserHandle } from '@/hooks/useUserHandle';
import dynamic from 'next/dynamic';

// Reuse the wireframe animation for consistency
const WireframeAnimation = dynamic(
    () => import('@/components/landing/WireframeAnimation'),
    { ssr: false }
);

export default function TelegramPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const { handle: handcashHandle } = useUserHandle();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!loading && (isAuthenticated || handcashHandle)) {
            setIsVerified(true);
        }
    }, [isAuthenticated, handcashHandle, loading]);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-sky-500/30">
            <PublicNavbar />

            {/* Hero Section */}
            <main className="relative pt-20 pb-32 overflow-hidden">
                {/* Background Animation */}
                <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                    <WireframeAnimation isDark={true} colorTheme="blue" />
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest mb-6">
                                <FaTelegram /> Private Channel Access
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white via-sky-400 to-white bg-clip-text text-transparent">
                                JOIN THE B0ASE<br />INNER CIRCLE
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                Unlock exclusive insights, early project access, and direct collaboration opportunities in our verified private community.
                            </p>
                        </motion.div>

                        {/* Verification Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group"
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-3xl rounded-full -ml-32 -mb-32" />

                            <div className="relative z-10">
                                <AnimatePresence mode="wait">
                                    {!isVerified ? (
                                        <motion.div
                                            key="unverified"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="text-center"
                                        >
                                            <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-gray-700 group-hover:border-sky-500/50 transition-colors duration-500">
                                                <FaLock className="text-3xl text-gray-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
                                            <p className="text-gray-500 mb-10 max-w-md mx-auto italic">
                                                Access to the private group is restricted to b0ase members. Please verify your identity to reveal the invitation link.
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <a
                                                    href="/api/auth/handcash"
                                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-600/20 active:scale-95"
                                                >
                                                    <FiZap size={20} />
                                                    Verify with HandCash
                                                </a>
                                                <Link
                                                    href="/login?redirect=/telegram"
                                                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 transition-all active:scale-95"
                                                >
                                                    <FiUser size={20} />
                                                    Legacy Login
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="verified"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="text-center"
                                        >
                                            <div className="w-20 h-20 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-sky-500/30">
                                                <FaCheckCircle className="text-4xl text-sky-400" />
                                            </div>
                                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Identity Verified</h2>
                                            {handcashHandle && (
                                                <p className="text-sky-400 font-mono text-sm mb-6">${handcashHandle}</p>
                                            )}
                                            <p className="text-gray-400 mb-10 max-w-md mx-auto leading-relaxed">
                                                Welcome to the inner circle. You now have access to our private Telegram community.
                                            </p>

                                            <a
                                                href="https://t.me/+PLACEHOLDER" // User should replace this with actual link
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-4 px-10 py-5 bg-sky-500 hover:bg-sky-400 text-black font-black uppercase tracking-tighter rounded-2xl transition-all shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40 active:scale-95 group/btn"
                                            >
                                                Join Private Group
                                                <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Benefits Grid */}
                        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <FaShieldAlt className="text-sky-400" />,
                                    title: "VIP Content",
                                    desc: "Exclusive alpha on upcoming projects and market trends."
                                },
                                {
                                    icon: <FaRocket className="text-purple-400" />,
                                    title: "Fast Track",
                                    desc: "Priority support and direct collaboration with our designers."
                                },
                                {
                                    icon: <FaTelegram className="text-blue-400" />,
                                    title: "Community",
                                    desc: "A strictly curated network of builders and visionaries."
                                }
                            ].map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors"
                                >
                                    <div className="text-2xl mb-4">{benefit.icon}</div>
                                    <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Branding */}
            <footer className="py-12 border-t border-white/5 text-center">
                <p className="text-gray-600 text-xs font-mono uppercase tracking-[0.2em]">
                    &copy; 2026 B0ASE.COM // SECURED GATEWAY
                </p>
            </footer>
        </div>
    );
}
