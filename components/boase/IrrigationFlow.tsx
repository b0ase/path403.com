'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData, Project } from '@/lib/data';

// UI Primitives: atomic building blocks from /tools page
const UI_PRIMITIVES = [
    // Built by b0ase
    { id: 'video-gen', title: 'Video Gen', href: '/video/editor/generator' },
    { id: 'tx-broadcaster', title: 'TX Broadcaster', href: '/tx-broadcaster' },
    { id: 'money-buttons', title: 'Money Buttons', href: '/buttons' },
    { id: 'video-studio', title: 'Video Studio', href: '/video/editor/studio' },
    { id: 'chaos-mixer', title: 'Chaos Mixer', href: '/video/editor' },
    { id: 'auto-book', title: 'Auto-Book', href: '/tools/auto-book' },
    { id: 'graphic-designer', title: 'Graphic Designer', href: '/tools/graphic-designer' },
    { id: 'scada', title: 'SCADA', href: '/tools/scada' },
    { id: 'scrollpay', title: 'ScrollPay', href: '/tools/scrollpay' },
    { id: 'button-creator', title: 'Button Creator', href: '/tools/button-graphic-creator' },
    { id: 'bsv-scripts', title: 'BSV Scripts', href: '/tools/scripts' },
    { id: 'course-maker', title: 'Course Maker', href: '/tools/video-course-maker' },
    // Token Management
    { id: 'registry', title: 'Registry', href: '/tools/registry' },
    { id: 'mint', title: 'Mint', href: '/tools/mint' },
    { id: 'cap-table', title: 'Cap Table', href: '/tools/cap' },
    { id: 'dividends-tool', title: 'Dividends', href: '/tools/dividends' },
    { id: 'kyc', title: 'KYC Verify', href: '/tools/verify' },
    { id: 'transfers', title: 'Transfers', href: '/tools/transfer' },
    { id: 'id-tokeniser', title: 'ID Tokeniser', href: '/tools/id-tokeniser' },
];

// Code Primitives: npm packages from @b0ase/* monorepo (62 packages)
const CODE_PRIMITIVES = {
    'Wallets & Auth': [
        { id: 'handcash', title: 'handcash', desc: 'HandCash wallet integration' },
        { id: 'yours-wallet', title: 'yours-wallet', desc: 'Yours wallet for BSV-20' },
        { id: 'multi-wallet-auth', title: 'multi-wallet-auth', desc: 'Unified auth across wallets' },
        { id: 'wallet-adapter', title: 'wallet-adapter', desc: 'Wallet abstraction layer' },
        { id: 'unified-auth-ui', title: 'unified-auth-ui', desc: 'Auth UI components' },
        { id: 'wallet-view', title: 'wallet-view', desc: 'Wallet display components' },
    ],
    'Payments & Finance': [
        { id: 'payments', title: 'payments', desc: 'Payment processing' },
        { id: 'bonding-curve', title: 'bonding-curve', desc: 'Token pricing curves' },
        { id: 'dividend-engine', title: 'dividend-engine', desc: 'Dividend distribution' },
        { id: 'price-service', title: 'price-service', desc: 'Real-time pricing' },
        { id: 'stripe-bsv-bridge', title: 'stripe-bsv-bridge', desc: 'Fiat to crypto bridge' },
        { id: 'ledger', title: 'ledger', desc: 'Transaction ledger' },
        { id: 'market-table', title: 'market-table', desc: 'Market data display' },
        { id: 'x402-revenue', title: 'x402-revenue', desc: 'HTTP 402 micropayments' },
    ],
    'Blockchain': [
        { id: 'tx-builder', title: 'tx-builder', desc: 'Transaction construction' },
        { id: 'crypto-utils', title: 'crypto-utils', desc: 'Encryption utilities' },
        { id: 'bitcoin-signing', title: 'bitcoin-signing', desc: 'Message signing' },
        { id: 'whatsonchain', title: 'whatsonchain', desc: 'Blockchain explorer API' },
        { id: 'ordinals-api', title: 'ordinals-api', desc: 'Ordinals/1Sat integration' },
        { id: 'mempool-service', title: 'mempool-service', desc: 'Mempool monitoring' },
        { id: 'chain-publish', title: 'chain-publish', desc: 'On-chain publishing' },
        { id: 'brc100-tokens', title: 'brc100-tokens', desc: 'BRC-100 token standard' },
        { id: 'cross-app-tokens', title: 'cross-app-tokens', desc: 'Cross-app token sharing' },
        { id: 'blockchain-dns', title: 'blockchain-dns', desc: 'Decentralized DNS' },
        { id: 'blockchain-email', title: 'blockchain-email', desc: 'On-chain email' },
    ],
    'Storage': [
        { id: 'storage-adapter', title: 'storage-adapter', desc: 'Unified storage interface' },
        { id: 'storage-options', title: 'storage-options', desc: 'Storage method selection' },
        { id: 'dropblocks', title: 'dropblocks', desc: 'Decentralized file storage' },
        { id: 'inscription-service', title: 'inscription-service', desc: 'On-chain inscriptions' },
        { id: 'version-tree', title: 'version-tree', desc: 'Document versioning' },
    ],
    'Tokens & Orgs': [
        { id: 'token-distributor', title: 'token-distributor', desc: 'Airdrop & distribution' },
        { id: 'governance', title: 'governance', desc: 'Voting & proposals' },
        { id: 'org', title: 'org', desc: 'Organization management' },
        { id: 'task-contracts', title: 'task-contracts', desc: 'Task-based payments' },
        { id: 'chat-contracts', title: 'chat-contracts', desc: 'Chat-based agreements' },
    ],
    'UI Components': [
        { id: 'flow-canvas', title: 'flow-canvas', desc: 'Visual workflow builder' },
        { id: 'utxo-viz', title: 'utxo-viz', desc: 'UTXO visualization' },
        { id: 'network-graph', title: 'network-graph', desc: 'Network topology' },
        { id: 'nft-container', title: 'nft-container', desc: 'NFT display container' },
        { id: 'nft-minting-modal', title: 'nft-minting-modal', desc: 'NFT creation flow' },
        { id: 'tokenization-modal', title: 'tokenization-modal', desc: 'Asset tokenization' },
        { id: 'shareholder-ui', title: 'shareholder-ui', desc: 'Investor dashboard' },
    ],
    'Core Infrastructure': [
        { id: 'api-client', title: 'api-client', desc: 'HTTP client wrapper' },
        { id: 'logger', title: 'logger', desc: 'Structured logging' },
        { id: 'validation', title: 'validation', desc: 'Schema validation' },
        { id: 'event-emitter', title: 'event-emitter', desc: 'Typed events' },
        { id: 'rate-limiter', title: 'rate-limiter', desc: 'API rate limiting' },
        { id: 'queue-manager', title: 'queue-manager', desc: 'Job queue processing' },
        { id: 'state-machine', title: 'state-machine', desc: 'State management' },
        { id: 'http-status', title: 'http-status', desc: 'HTTP status codes' },
        { id: 'supabase-types', title: 'supabase-types', desc: 'Database types' },
        { id: 'supabase-service', title: 'supabase-service', desc: 'Supabase client' },
    ],
    'Utilities': [
        { id: 'array-utils', title: 'array-utils', desc: 'Array helpers' },
        { id: 'object-utils', title: 'object-utils', desc: 'Object helpers' },
        { id: 'string-utils', title: 'string-utils', desc: 'String helpers' },
        { id: 'date-utils', title: 'date-utils', desc: 'Date helpers' },
        { id: 'color-utils', title: 'color-utils', desc: 'Color manipulation' },
        { id: 'promise-utils', title: 'promise-utils', desc: 'Async helpers' },
        { id: 'retry-utils', title: 'retry-utils', desc: 'Retry strategies' },
    ],
    'Special': [
        { id: 'dopamine', title: 'dopamine', desc: 'Gamification engine' },
        { id: 'os-shell', title: 'os-shell', desc: 'Terminal interface' },
        { id: 'steganography', title: 'steganography', desc: 'Hidden data in images' },
    ],
};

// Count total code primitives
const TOTAL_CODE_PRIMITIVES = Object.values(CODE_PRIMITIVES).flat().length;

export default function IrrigationFlow() {
    // Group projects
    const groups = useMemo(() => {
        const bitcoinApps: Project[] = [];
        const npgApps: Project[] = [];
        const tools: Project[] = [];
        const ventures: Project[] = [];

        portfolioData.projects.forEach(project => {
            const slug = project.slug.toLowerCase();
            const title = project.title.toLowerCase();

            // Exclude group container items
            if (slug === 'bitcoin-os') return;

            // Tools Logic
            if (
                slug.includes('divvy') ||
                slug.includes('repository') ||
                slug.includes('workflow') ||
                slug.includes('tool') ||
                slug.includes('utility') ||
                slug.includes('moneybutton') ||
                slug.includes('bitcdn') ||
                slug.includes('bitdns') ||
                slug.includes('api') ||
                slug.includes('kintsugi') ||
                slug.includes('index') ||
                slug.includes('cashhandle') ||
                slug.includes('penshun') || // BitPension (slug: penshun)
                slug.includes('weight') ||
                slug.includes('penny') || // PennyPics
                slug.includes('yourcash') ||
                slug.includes('dns-dex') || // DNS DEX
                slug.includes('bsvex') ||
                slug.includes('floop') ||
                slug.includes('cashboard') ||
                slug.includes('senseii') ||
                slug.includes('tribify') || // Tribify
                slug.includes('websitestrategy') || // Website Strategy Pro
                slug.includes('wordpress') || // Wordpress Design London
                slug.includes('future-of-blockchain') || // Future of Blockchain
                title.toLowerCase().includes('api')
            ) {
                tools.push(project);
            }
            // Bitcoin OS Logic
            else if (
                (slug.includes('bitcoin') ||
                    title.toLowerCase().includes('bitcoin') ||
                    ['bsv21'].includes(slug))
            ) {
                bitcoinApps.push(project);
            }
            // NPG Logic
            else if (
                slug.includes('ninja') ||
                slug.includes('npg') ||
                slug.includes('ninja') ||
                slug.includes('npg') ||
                slug.includes('lilith') ||
                slug.includes('cherry') ||
                slug.includes('void') ||
                slug.includes('vex') ||
                slug.includes('shot') ||
                slug.includes('comic') ||
                slug.includes('aivj') ||
                slug.includes('zero') || // Zero Dice
                slug.includes('dice') ||
                slug.includes('tribes') || // AI Tribes
                slug.includes('audex') || // Audex
                slug.includes('hyper') || // HyperFlix - entertainment/marketing
                slug.includes('v01d')    // v01d Store (note spelling in slug)
            ) {
                npgApps.push(project);
            }
            // Ventures Logic
            else {
                ventures.push(project);
            }
        });

        // Alphabetize all groups
        const sortAlpha = (a: Project, b: Project) => a.title.localeCompare(b.title);

        // Custom sort for Bitcoin OS: Pin 'Bitcoin Corporation' to top, then 'Bitcoin Apps', then alpha others
        bitcoinApps.sort((a, b) => {
            if (a.title === 'Bitcoin Corporation') return -1;
            if (b.title === 'Bitcoin Corporation') return 1;
            if (a.title === 'Bitcoin Apps') return -1;
            if (b.title === 'Bitcoin Apps') return 1;
            return sortAlpha(a, b);
        });

        // Custom sort for NPG: Pin 'Ninja Punk Girls' to top
        npgApps.sort((a, b) => {
            if (a.title === 'Ninja Punk Girls') return -1;
            if (b.title === 'Ninja Punk Girls') return 1;
            return sortAlpha(a, b);
        });

        tools.sort(sortAlpha);
        ventures.sort(sortAlpha);

        return { bitcoinApps, npgApps, tools, ventures };
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">

            {/* Top Layer: Main Token & Info */}
            {/* Top Layer: Main Token & Info */}
            <div className="flex flex-col w-full mb-12">
                {/* Header Text - Left Aligned & Compact */}
                <div className="text-left mb-8 max-w-3xl">
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                        The Irrigation Model
                    </h2>
                    <p className="text-orange-500 text-xs font-mono uppercase tracking-[0.4em] mb-4">Proprietary Revenue Architecture</p>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                        b0ase builds apps and businesses with dividend-bearing shares, like <span className="text-orange-400">Bitcoin OS</span> and <span className="text-pink-400">NPG</span>, which in turn incubate projects with their own tokenized equity. This creates a multi-layered yield stream that automatically irrigates upwards to $BOASE holders.
                    </p>
                </div>

                {/* $BOASE Receiver Bar */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0.9 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="w-full relative"
                >
                    {/* The Bar */}
                    <div className="w-full h-24 bg-gradient-to-r from-yellow-900/20 via-yellow-600/20 to-yellow-900/20 border border-yellow-500/30 rounded-xl flex items-center justify-between px-8 md:px-16 relative overflow-hidden backdrop-blur-sm">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-[shimmer_3s_infinite]" />

                        <div className="flex flex-col relative z-10">
                            <span className="text-3xl font-black text-white tracking-tight">$BOASE</span>
                            <span className="text-[10px] text-yellow-500 font-mono tracking-widest uppercase">Master Yield Token</span>
                        </div>

                        <div className="flex flex-col items-end relative z-10">
                            <span className="text-2xl font-bold text-yellow-400">100%</span>
                            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Revenue Flow</span>
                        </div>
                    </div>

                    {/* Connection Nodes (Invisible targets for arrows below) */}
                    <div className="absolute -bottom-4 left-0 w-full flex justify-around px-4 opacity-0">
                        <div className="w-2 h-2 bg-red-500" /> {/* Debug markers if needed */}
                        <div className="w-2 h-2 bg-red-500" />
                        <div className="w-2 h-2 bg-red-500" />
                        <div className="w-2 h-2 bg-red-500" />
                        <div className="w-2 h-2 bg-red-500" />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Layer: Token Categories & Stacks */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-16">

                {/* PRIMITIVES Group - FIRST: Atomic building blocks (UI + Code) */}
                <PrimitivesColumn containerVariants={containerVariants} itemVariants={itemVariants} />

                {/* Tools Group (Revenue -> Stack) - SECOND: Composed from primitives */}
                <motion.div
                    className="flex flex-col items-center"
                >
                    <StreamConnector color="text-gray-500" icon="split" direction="up" />

                    {/* Token Header Node */}
                    <div className="mb-6 mt-2 relative z-10">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-600 bg-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(100,100,100,0.3)]">
                            <h4 className="text-lg font-bold text-gray-300">Revenue</h4>
                            <div className="text-[9px] text-gray-500 mt-1">DISTRIBUTION</div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0.5 h-6 bg-gray-600/50" />
                    </div>

                    <div className="flex flex-col items-center w-full mt-2">
                        <h3 className="text-xl font-bold text-gray-400 mb-2 uppercase tracking-widest">
                            Tools <span className="text-sm opacity-60">({groups.tools.length})</span>
                        </h3>
                        <div className="text-[10px] text-gray-500/60 mb-4 font-mono">UTILITY LAYER</div>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex flex-col gap-2 w-full p-4 border border-gray-600/30 rounded-xl bg-gray-900/40 min-h-[300px]"
                        >
                            {groups.tools.map((app) => (
                                <motion.div
                                    key={app.id}
                                    variants={itemVariants}
                                    className="w-full bg-black/40 border border-gray-600/30 p-2 rounded flex items-center justify-between group hover:border-gray-400 transition-colors"
                                >
                                    <span className="text-xs font-mono text-gray-400 truncate">{app.title}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bitcoin OS Group ($bCorp -> Stack) */}
                <motion.div
                    className="flex flex-col items-center"
                >
                    <StreamConnector color="text-orange-500" direction="up" />

                    {/* Token Header Node */}
                    <div className="mb-6 mt-2 relative z-10">
                        <div className="w-24 h-24 rounded-full border-2 border-orange-500 bg-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                            <h4 className="text-xl font-black text-white">$bCorp</h4>
                        </div>
                        {/* Connector down to stack (visual only) */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0.5 h-6 bg-orange-500/50" />
                    </div>

                    <div className="flex flex-col items-center w-full mt-2">
                        <h3 className="text-xl font-bold text-orange-400 mb-2 uppercase tracking-widest">
                            Bitcoin OS <span className="text-sm opacity-60">({groups.bitcoinApps.length})</span>
                        </h3>
                        <div className="text-[10px] text-orange-500/60 mb-4 font-mono">OPERATING SYSTEM</div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex flex-col gap-2 w-full p-4 border-2 border-orange-500/20 rounded-xl bg-orange-950/10 min-h-[300px] relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-50" />
                            {groups.bitcoinApps.map((app) => (
                                <motion.div
                                    key={app.id}
                                    variants={itemVariants}
                                    className={`w-full p-2 rounded flex items-center justify-between group transition-colors ${app.title === 'Bitcoin Apps' || app.title === 'Bitcoin Corporation'
                                        ? 'bg-orange-500/20 border-2 border-orange-500 text-orange-200'
                                        : 'bg-black/60 border border-orange-500/30 hover:border-orange-400 text-gray-300'
                                        }`}
                                >
                                    <span className="text-xs font-mono truncate">
                                        {app.title}
                                        {app.title === 'Bitcoin Apps' && <span className="ml-2 opacity-70 text-[10px] uppercase tracking-wider border border-orange-500/50 px-1 rounded">STORE</span>}
                                        {app.title === 'Bitcoin Corporation' && <span className="ml-2 opacity-70 text-[10px] uppercase tracking-wider border border-orange-500/50 px-1 rounded">CORP</span>}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* NPG Apps Group ($NPG -> Stack) */}
                <motion.div
                    className="flex flex-col items-center"
                >
                    <StreamConnector color="text-pink-500" direction="up" />

                    {/* Token Header Node */}
                    <div className="mb-6 mt-2 relative z-10">
                        <div className="w-24 h-24 rounded-full border-2 border-pink-500 bg-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                            <h4 className="text-xl font-black text-white">$NPG</h4>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0.5 h-6 bg-pink-500/50" />
                    </div>

                    <div className="flex flex-col items-center w-full mt-2">
                        <h3 className="text-xl font-bold text-pink-400 mb-2 uppercase tracking-widest">
                            NPG Apps <span className="text-sm opacity-60">({groups.npgApps.length})</span>
                        </h3>
                        <div className="text-[10px] text-pink-500/60 mb-4 font-mono">ENTERTAINMENT FRANCHISE</div>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex flex-col gap-2 w-full p-4 border border-pink-500/20 rounded-xl bg-pink-950/10 min-h-[300px]"
                        >
                            {groups.npgApps.map((app) => (
                                <motion.div
                                    key={app.id}
                                    variants={itemVariants}
                                    className={`w-full p-2 rounded flex items-center justify-between group transition-colors ${app.title === 'Ninja Punk Girls'
                                        ? 'bg-pink-500/20 border-2 border-pink-500 text-pink-200'
                                        : 'bg-black/60 border border-pink-500/30 hover:border-pink-400 text-gray-300'
                                        }`}
                                >
                                    <span className="text-xs font-mono truncate">
                                        {app.title}
                                        {app.title === 'Ninja Punk Girls' && <span className="ml-2 opacity-70 text-[10px] uppercase tracking-wider border border-pink-500/50 px-1 rounded">COMPANY</span>}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Clients Group (Client -> Stack) */}
                <motion.div
                    className="flex flex-col items-center"
                >
                    <StreamConnector color="text-cyan-500" direction="up" />

                    {/* Token Header Node */}
                    <div className="mb-6 mt-2 relative z-10">
                        <div className="w-24 h-24 rounded-full border-2 border-cyan-500 bg-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            <h4 className="text-xl font-black text-white">Client</h4>
                            <div className="text-[9px] text-cyan-400 mt-1">INCUBATOR</div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0.5 h-6 bg-cyan-500/50" />
                    </div>

                    <div className="flex flex-col items-center w-full mt-2">
                        <h3 className="text-xl font-bold text-cyan-400 mb-2 uppercase tracking-widest">
                            Clients <span className="text-sm opacity-60">({groups.ventures.length})</span>
                        </h3>
                        <div className="text-[10px] text-cyan-500/60 mb-4 font-mono">INCUBATION POOL</div>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex flex-col gap-2 w-full p-4 border border-cyan-500/20 rounded-xl bg-cyan-950/10 min-h-[300px]"
                        >
                            {groups.ventures.map((app) => (
                                <motion.div
                                    key={app.id}
                                    variants={itemVariants}
                                    className="w-full bg-black/40 border border-cyan-500/30 p-2 rounded flex items-center justify-between group hover:border-cyan-400 transition-colors"
                                >
                                    <span className="text-xs font-mono text-gray-300 truncate">{app.title}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            </div>

        </div>
    );
}

// Primitives Column Component - Shows both UI and Code primitives
function PrimitivesColumn({ containerVariants, itemVariants }: { containerVariants: object, itemVariants: object }) {
    const [showCode, setShowCode] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    return (
        <motion.div className="flex flex-col items-center">
            <StreamConnector color="text-emerald-500" direction="up" />

            {/* Token Header Node */}
            <div className="mb-6 mt-2 relative z-10">
                <div className="w-24 h-24 rounded-full border-2 border-emerald-500 bg-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <h4 className="text-lg font-bold text-emerald-300">Atomic</h4>
                    <div className="text-[9px] text-emerald-500 mt-1">BUILDING</div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-0.5 h-6 bg-emerald-500/50" />
            </div>

            <div className="flex flex-col items-center w-full mt-2">
                <h3 className="text-lg font-bold text-emerald-400 mb-2 uppercase tracking-widest">
                    Primitives <span className="text-sm opacity-60">({UI_PRIMITIVES.length + TOTAL_CODE_PRIMITIVES})</span>
                </h3>
                <div className="text-[10px] text-emerald-500/60 mb-2 font-mono">ATOMIC LAYER</div>

                {/* Toggle between UI and Code */}
                <div className="flex gap-1 mb-3 p-1 bg-black/60 rounded-lg border border-emerald-500/30">
                    <button
                        onClick={() => setShowCode(false)}
                        className={`px-2 py-1 text-[10px] font-mono uppercase rounded transition-colors ${!showCode ? 'bg-emerald-500/30 text-emerald-300' : 'text-emerald-500/60 hover:text-emerald-400'}`}
                    >
                        UI ({UI_PRIMITIVES.length})
                    </button>
                    <button
                        onClick={() => setShowCode(true)}
                        className={`px-2 py-1 text-[10px] font-mono uppercase rounded transition-colors ${showCode ? 'bg-lime-500/30 text-lime-300' : 'text-lime-500/60 hover:text-lime-400'}`}
                    >
                        Code ({TOTAL_CODE_PRIMITIVES})
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {!showCode ? (
                        /* UI Primitives */
                        <motion.div
                            key="ui"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex flex-col gap-1 w-full p-3 border-2 border-emerald-500/30 rounded-xl bg-emerald-950/10 min-h-[300px] max-h-[500px] overflow-y-auto relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
                            {UI_PRIMITIVES.map((primitive) => (
                                <motion.a
                                    key={primitive.id}
                                    href={primitive.href}
                                    variants={itemVariants}
                                    className="w-full bg-black/40 border border-emerald-500/30 p-1.5 rounded flex items-center justify-between group hover:border-emerald-400 hover:bg-emerald-950/30 transition-colors"
                                >
                                    <span className="text-[10px] font-mono text-emerald-300 truncate">{primitive.title}</span>
                                </motion.a>
                            ))}
                        </motion.div>
                    ) : (
                        /* Code Primitives */
                        <motion.div
                            key="code"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col gap-1 w-full p-3 border-2 border-lime-500/30 rounded-xl bg-lime-950/10 min-h-[300px] max-h-[500px] overflow-y-auto relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-500/50 to-transparent opacity-50" />
                            <div className="text-[9px] text-lime-400/60 font-mono mb-2 text-center">@b0ase/* npm packages</div>

                            {Object.entries(CODE_PRIMITIVES).map(([category, packages]) => (
                                <div key={category} className="mb-1">
                                    <button
                                        onClick={() => toggleCategory(category)}
                                        className="w-full flex items-center justify-between p-1.5 bg-lime-900/20 border border-lime-500/20 rounded text-[9px] font-mono text-lime-400 hover:border-lime-400/50 transition-colors"
                                    >
                                        <span>{category}</span>
                                        <span className="flex items-center gap-1">
                                            <span className="text-lime-500/60">{packages.length}</span>
                                            <svg
                                                className={`w-3 h-3 transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </button>

                                    <AnimatePresence>
                                        {expandedCategories.has(category) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex flex-col gap-0.5 pl-2 pt-1">
                                                    {packages.map((pkg) => (
                                                        <div
                                                            key={pkg.id}
                                                            className="w-full bg-black/40 border border-lime-500/20 p-1 rounded text-[8px] font-mono text-lime-300/80 hover:border-lime-400/40 transition-colors"
                                                            title={pkg.desc}
                                                        >
                                                            {pkg.title}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Simple vertical connector animation
function StreamConnector({ color, icon, direction = 'down' }: { color: string, icon?: 'split', direction?: 'up' | 'down' }) {
    return (
        <div className={`flex flex-col items-center justify-center h-16 w-full overflow-hidden ${color} relative transform ${direction === 'up' ? 'rotate-180' : ''}`}>
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="opacity-50"
            >
                <svg width="20" height="40" viewBox="0 0 20 40">
                    <path d="M10 0 L10 40" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M0 30 L10 40 L20 30" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </motion.div>
            {icon === 'split' && (
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 p-1 rounded-full border border-gray-600 z-10 ${direction === 'up' ? 'rotate-180' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M2 12h20" />
                        <circle cx="12" cy="12" r="10" className="opacity-20" />
                    </svg>
                </div>
            )}
        </div>
    );
}

function StreamConnectorVertical({ color, height }: { color: string, height: string }) {
    return (
        <div className={`flex flex-col items-center justify-center ${height} w-full overflow-hidden ${color} relative -mt-4 -mb-4 z-0`}>
            <motion.div
                animate={{ y: [-20, 20] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="opacity-50"
            >
                <svg width="4" height="100%" viewBox="0 0 4 100" preserveAspectRatio="none">
                    <line x1="2" y1="0" x2="2" y2="100" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
            </motion.div>
            {/* Arrow head */}
            <div className="absolute bottom-0">
                <svg width="20" height="20" viewBox="0 0 20 20">
                    <path d="M0 10 L10 20 L20 10" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
            </div>
        </div>
    );
}
