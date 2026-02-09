'use client';

import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle, FiFigma, FiLayout, FiMaximize, FiZap } from 'react-icons/fi';
import Link from 'next/link';
import { useNavbar } from '@/components/NavbarProvider';

export default function UIUXServicePage() {
    const { isDark } = useNavbar();

    return (
        <div className={`min-h-screen pt-24 pb-20 transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                {/* Back Link */}
                <Link href="/services" className="inline-flex items-center gap-2 text-zinc-500 hover:text-blue-500 transition-colors mb-12 font-mono text-xs uppercase tracking-widest">
                    <FiArrowLeft /> Back to Services
                </Link>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="text-blue-500 font-mono text-xs font-bold tracking-[0.35em] uppercase mb-4">
                            Premium Intelligence & Design
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
                            UI/UX <span className="text-blue-500">_</span><br />
                            DESIGN
                        </h1>
                        <p className={`text-xl md:text-2xl leading-relaxed mb-10 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            We treat the interface as the primary business logic. Our design philosophy centers on **Agentic Workflows** and high-precision interactions that convert users into loyalists.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/contact" className="px-8 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all active:scale-95">
                                Book Design Audit
                            </Link>
                            <Link href="/blog/ui-ux-is-business-logic" className={`px-8 py-4 font-black uppercase text-xs tracking-widest rounded-xl border transition-all ${isDark ? 'border-zinc-800 hover:bg-zinc-900' : 'border-zinc-200 hover:bg-zinc-100'} text-blue-500`}>
                                Why UI is Logic
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <div className={`aspect-square rounded-3xl overflow-hidden border p-4 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                            <div className={`w-full h-full rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center relative overflow-hidden`}>
                                <FiLayout className="text-[10rem] text-blue-500/20 absolute -bottom-10 -right-10 rotate-12" />
                                <FiMaximize className="text-[8rem] text-blue-500/30 absolute top-10 left-10 -rotate-12" />
                                <motion.div
                                    className={`z-10 p-8 rounded-2xl shadow-2xl border max-w-sm ${isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200'}`}
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500" />
                                        <div className={`h-4 w-32 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                                    </div>
                                    <div className={`h-4 w-full rounded-full mb-2 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                                    <div className={`h-4 w-2/3 rounded-full mb-6 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                                    <div className="flex gap-2 text-[8px] font-mono opacity-50">
                                        <span>// AI_AGENT_RELIANCE: 0.99</span>
                                        <span>// TRACE_ID: b0-f1</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Specific Value Propositions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
                    {[
                        { icon: FiZap, title: "The Third Audience", desc: "We design for Humans, Search, and AI Agents simultaneously." },
                        { icon: FiLayout, title: "Agentic Flows", desc: "Optimizing UIs for autonomous agents and conversational logic." },
                        { icon: FiMaximize, title: "Crypto-Verification", desc: "Establishing trust through cryptographic proofs, not just pixels." },
                        { icon: FiCheckCircle, title: "Economic Models", desc: "Visualizing Bonding Curves and complex logic natively in the UI." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className={`p-8 rounded-2xl border transition-all ${isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                        >
                            <item.icon className="text-3xl text-blue-500 mb-6" />
                            <h3 className="text-xl font-black mb-3">{item.title}</h3>
                            <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Deliverables Section */}
                <div className={`p-12 md:p-20 rounded-[3rem] overflow-hidden relative ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-100'}`}>
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">WHAT YOU RECEIVE<span className="text-blue-500">.</span></h2>
                            <div className="space-y-6">
                                {[
                                    "AI-Readable (Third Audience) Component Schemas",
                                    "High-Fidelity Interactive Prototypes",
                                    "Cross-Platform Design System (Tokens, Icons, Components)",
                                    "Motion Studies for Deterministic Interactions",
                                    "Cryptographic Verification UI Components"
                                ].map((text, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        </div>
                                        <span className="font-medium text-lg">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={`p-8 rounded-2xl border aspect-video flex flex-col justify-center ${isDark ? 'bg-black border-zinc-800 shadow-2xl shadow-blue-500/10' : 'bg-white border-zinc-200 shadow-2xl'}`}>
                            <div className="font-mono text-blue-500 text-xs mb-8 tracking-widest">AGENT_MANIFEST v2.1.0</div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">intent-declaration</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-blue-500">EXPLICIT</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">trust-verification</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono">ed25519-sig: 0x...</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-zinc-500">bonding-curve-id</span>
                                    <span className="font-mono">bc_001_seed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
