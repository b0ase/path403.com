'use client';

import { useParams, useRouter } from 'next/navigation';
import { portfolioData, Project as PortfolioProject } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowLeft, Activity, Rocket, TrendingUp, BarChart3, Lock, Sparkles, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProjectButtonPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const project = portfolioData.projects.find(p => p.slug === slug);

    const [status, setStatus] = useState<'idle' | 'coming_soon'>('idle');

    if (!project) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-black mb-4">PROJECT NOT FOUND</h1>
                <button 
                    onClick={() => router.push('/mint')}
                    className="flex items-center gap-2 text-sky-400 hover:text-sky-300"
                >
                    <ArrowLeft size={20} /> Back to MintPad
                </button>
            </div>
        );
    }

    const curveIcons = {
        LINEAR: TrendingUp,
        EXPONENTIAL: Rocket,
        LOGARITHMIC: Activity,
        SIGMOID: BarChart3
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-sky-500/30">
            
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <button 
                    onClick={() => router.push('/mint')}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Projects</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left Side: Project Info */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-4 mb-6 text-sky-400">
                                <span className="text-xs font-black uppercase tracking-widest border border-sky-400/20 px-3 py-1 rounded-full bg-sky-400/5">
                                    Project Details
                                </span>
                                <span className="text-xs font-black uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-white/5 text-gray-400">
                                    {project.status}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-none">
                                {project.title}
                            </h1>
                            <p className="text-xl text-gray-400 leading-relaxed font-medium">
                                {project.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Token Name</p>
                                <p className="text-2xl font-black text-sky-400 italic uppercase">
                                    {project.tokenName || `$${project.slug.toUpperCase().slice(0, 4)}`}
                                </p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Network</p>
                                <p className="text-2xl font-black text-white italic uppercase">Bitcoin SV</p>
                            </div>
                        </div>

                        {project.cardImageUrls?.[0] && (
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10">
                                <Image 
                                    src={project.cardImageUrls[0]} 
                                    alt={project.title} 
                                    fill 
                                    className="object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>
                        )}
                    </div>

                    {/* Right Side: Interaction */}
                    <div className="sticky top-32">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 md:p-12 rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 relative overflow-hidden"
                        >
                            {/* Decorative Grid */}
                            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                                 style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                            <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black uppercase tracking-tight italic">Execute Mint</h2>
                                    <p className="text-gray-500 font-medium">Interact with the core to generate tokens.</p>
                                </div>

                                {/* The Button */}
                                <div className="relative group">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -inset-8 bg-sky-500/20 blur-3xl rounded-full"
                                    />
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setStatus('coming_soon')}
                                        className="relative w-48 h-48 rounded-full bg-black border-4 border-sky-500 shadow-[0_0_50px_rgba(14,165,233,0.3)] flex items-center justify-center group-hover:shadow-[0_0_80px_rgba(14,165,233,0.5)] transition-all duration-500"
                                    >
                                        <div className="absolute inset-2 rounded-full border border-sky-500/30 border-dashed animate-spin-slow" />
                                        <div className="flex flex-col items-center gap-2">
                                            <Plus size={48} className="text-sky-400" />
                                            <span className="text-sm font-black uppercase tracking-widest text-sky-400 italic">Press</span>
                                        </div>
                                    </motion.button>
                                </div>

                                <div className="w-full space-y-6">
                                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</p>
                                            <p className="font-bold text-sky-400 uppercase tracking-tight italic">Awaiting Launch</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Minted</p>
                                            <p className="font-bold text-white uppercase tracking-tight italic">0 / 1B</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/10 flex items-center gap-3">
                                        <Lock size={16} className="text-sky-400" />
                                        <p className="text-xs text-sky-400/80 font-medium text-left">
                                            HandCash authentication required for secure token distribution and ownership verification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Status Message Overlay */}
                        <AnimatePresence>
                            {status === 'coming_soon' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="mt-6 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center relative overflow-hidden"
                                >
                                    <motion.div 
                                        animate={{ x: [-100, 400] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
                                    />
                                    <div className="relative z-10 flex flex-col items-center gap-2">
                                        <Sparkles className="text-amber-500" size={24} />
                                        <h3 className="font-black uppercase tracking-widest italic text-amber-500">System Initializing</h3>
                                        <p className="text-sm text-amber-500/70 font-bold uppercase tracking-tight">
                                            The Bonding Curve engine for {project.title} is coming soon.
                                        </p>
                                        <button 
                                            onClick={() => setStatus('idle')}
                                            className="mt-4 text-[10px] underline uppercase font-black text-amber-500/50 hover:text-amber-500 transition-colors"
                                        >
                                            Dismiss Notice
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
}
