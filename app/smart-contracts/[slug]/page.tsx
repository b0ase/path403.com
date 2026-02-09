'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FiArrowLeft, FiCode, FiTerminal, FiPlay, FiCheckCircle,
    FiCopy, FiBox, FiActivity, FiServer
} from 'react-icons/fi';
import {
    Coins, Users, Vote, Clock, Shield, Percent, Lock, FileCode
} from 'lucide-react';
import { smartContractTemplates } from '@/lib/data';

// Map icons
const icons = {
    Coins, Users, Vote, Clock, Shield, Percent, Lock
};

export default function SmartContractDetailPage() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState<'overview' | 'code'>('overview');
    const [showCopied, setShowCopied] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    const slug = params?.slug as string;
    const template = smartContractTemplates.find(t => t.slug === slug);

    if (!template) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Contract Not Found</h1>
                    <Link href="/smart-contracts" className="text-emerald-400 hover:underline">
                        Return to Library
                    </Link>
                </div>
            </div>
        );
    }

    const Icon = icons[template.iconName as keyof typeof icons] || FileCode;

    const handleCopy = () => {
        navigator.clipboard.writeText(template.codeSnippet);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    const handleDeploy = () => {
        setIsDeploying(true);
        setTimeout(() => {
            setIsDeploying(false);
            alert("Deployment simulation complete. In a real app, this would trigger a transaction.");
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
            <div className="px-4 md:px-8 py-12">

                {/* Nav */}
                <Link href="/smart-contracts" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors text-sm font-mono uppercase tracking-wider">
                    <FiArrowLeft /> Back to Library
                </Link>

                {/* Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-zinc-800 pb-8 mb-12">
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hidden md:block">
                            <Icon className="w-12 h-12 text-zinc-200" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">{template.title}</h1>
                            <p className="text-zinc-500 text-lg md:text-xl max-w-2xl">{template.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded border border-emerald-500/20">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Ready to Deploy</span>
                        </div>
                        <div className="px-3 py-1.5 border-l border-zinc-700 text-[10px] font-mono text-zinc-500">
                            v1.0.0
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Tabs */}
                        <div className="flex border-b border-zinc-800">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-3 font-bold uppercase text-sm tracking-wider border-b-2 transition-colors ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('code')}
                                className={`px-6 py-3 font-bold uppercase text-sm tracking-wider border-b-2 transition-colors ${activeTab === 'code' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                            >
                                <span className="flex items-center gap-2"><FiCode /> Source Code</span>
                            </button>
                        </div>

                        {activeTab === 'overview' ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <section>
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-500 mb-4">Description</h3>
                                    <p className="text-zinc-300 leading-relaxed text-lg bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50">
                                        {template.detailedDescription}
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-500 mb-4">Core Features</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {template.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                                                <FiCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-zinc-300 text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative group"
                            >
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors"
                                        title="Copy to Clipboard"
                                    >
                                        {showCopied ? <FiCheckCircle className="text-emerald-500" /> : <FiCopy />}
                                    </button>
                                </div>
                                <pre className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300 selection:bg-zinc-800 shadow-inner">
                                    <code>{template.codeSnippet}</code>
                                </pre>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar Controls */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl backdrop-blur-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                                    <FiTerminal /> Deployment Console
                                </h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Network</span>
                                        <span className="font-mono text-zinc-300">BSV Mainnet</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Compiler</span>
                                        <span className="font-mono text-zinc-300">sCrypt v1.2</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Est. Fee</span>
                                        <span className="font-mono text-emerald-400">0.000004 BSV</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDeploy}
                                    disabled={isDeploying}
                                    className={`w-full py-4 font-black uppercase tracking-widest text-sm rounded transition-all flex items-center justify-center gap-2 ${isDeploying
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                                        }`}
                                >
                                    {isDeploying ? (
                                        <><FiActivity className="animate-spin" /> Compiling...</>
                                    ) : (
                                        <><FiPlay /> Deploy Contract</>
                                    )}
                                </button>

                                <div className="mt-4 text-center">
                                    <p className="text-[10px] text-zinc-600">
                                        By deploying, you agree to the Automated Execution terms.
                                    </p>
                                </div>
                            </div>

                            {/* Stats / Metrics Placeholder */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg text-center">
                                    <FiServer className="mx-auto mb-2 text-zinc-600" />
                                    <div className="text-xl font-bold font-mono">24ms</div>
                                    <div className="text-[10px] uppercase text-zinc-500">Latency</div>
                                </div>
                                <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg text-center">
                                    <FiBox className="mx-auto mb-2 text-zinc-600" />
                                    <div className="text-xl font-bold font-mono">1.2kb</div>
                                    <div className="text-[10px] uppercase text-zinc-500">Size</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
