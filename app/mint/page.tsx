'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Sparkles, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Rocket, Activity, BarChart3, X, Globe, Server, Coins, Github, FileJson, User, Shield, BadgeCheck, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { portfolioData, Project as PortfolioProject } from '@/lib/data';
import Image from 'next/image';
import { sortProjects } from '@/lib/utils';
import ManifestGeneratorPage from '@/app/tool/manifest-generator/page';

type CurveType = 'LINEAR' | 'EXPONENTIAL' | 'LOGARITHMIC' | 'SIGMOID';

import { useUserHandle } from '@/hooks/useUserHandle';

export default function MintPage() {
    const router = useRouter();

    // User Data
    const { handle: userHandle, isClient } = useUserHandle();
    const loadingUser = !isClient;

    // View State: 'PROJECT', 'REPO', 'DEVELOPER', or 'COMPANY'
    const [viewMode, setViewMode] = useState<'PROJECT' | 'REPO' | 'DEVELOPER' | 'COMPANY'>('REPO');

    // Form State (Project)
    const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
    const [supply, setSupply] = useState('1000000000');

    // Curve & Price State
    const [selectedCurve, setSelectedCurve] = useState<CurveType | null>(null);
    const [initialPrice, setInitialPrice] = useState("0.0001");
    const [finalPrice, setFinalPrice] = useState("100");

    // Status State
    const [status, setStatus] = useState<'idle' | 'deploying' | 'saving' | 'success' | 'error' | 'already_minted' | 'insufficient_funds' | 'coming_soon'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    // Modal State
    const [activeCurveId, setActiveCurveId] = useState<string | null>(null);

    const curves = [
        {
            id: 'LINEAR',
            name: 'Linear',
            description: 'Token distribution decreases at a constant rate.',
            longDescription: 'A straightforward distribution model. Early supporters receive more tokens per press, scaling down steadily until the final tokens are sold one-to-one. Transparent and predictable for both creator and shareholders.',
            icon: TrendingUp,
            color: 'from-blue-500 to-cyan-500',
            visual: 'M 10 90 L 90 10',
            endY: 10
        },
        {
            id: 'EXPONENTIAL',
            name: 'Moonshot',
            description: 'Generous early distribution, steep decline later.',
            longDescription: 'Maximizes rewards for early believers. The first wave of supporters receives the lion\'s share of tokens, creating strong incentives for early adoption and viral word-of-mouth. Later supporters pay premium prices.',
            icon: Rocket,
            color: 'from-purple-500 to-pink-500',
            visual: 'M 10 90 Q 50 90 90 10',
            endY: 10
        },
        {
            id: 'LOGARITHMIC',
            name: 'Stable',
            description: 'Quick initial adjustment, then consistent distribution.',
            longDescription: 'Optimized for long-term utility. Distribution adjusts rapidly at launch, then stabilizes. This ensures your token remains accessible and functional as a medium of exchange, rather than purely speculative.',
            icon: Activity,
            color: 'from-green-500 to-emerald-500',
            visual: 'M 10 90 Q 10 50 90 40',
            endY: 40
        },
        {
            id: 'SIGMOID',
            name: 'S-Curve',
            description: 'Measured start, growth phase, mature plateau.',
            longDescription: 'Mirrors the classic adoption lifecycle. Early believers are rewarded, the growth phase captures momentum, and maturity ensures stability. A balanced model for sustainable shareholder base building.',
            icon: BarChart3,
            color: 'from-orange-500 to-yellow-500',
            visual: 'M 10 90 C 40 90 60 10 90 10',
            endY: 10
        }
    ];

    const handleMintClick = () => {
        if (!userHandle) {
            alert("Please sign in with HandCash first");
            return;
        }
        if (viewMode === 'PROJECT') {
            if (!selectedProject || !selectedCurve) return;
            setStatus('coming_soon');
        }
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-sky-500 animate-pulse">Initializing MintPad...</div>
            </div>
        );
    }

    // Special Route for Repo View Mode to render the generator directly inside the layout
    if (viewMode === 'REPO') {
        return (
            <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
                <div className="w-full">
                    {/* Standardized Header */}
                    <motion.div
                        className="px-4 md:px-8 pt-8 pb-8 border-b border-gray-800"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                                <Coins className="text-4xl md:text-6xl text-white w-12 h-12 md:w-16 md:h-16" />
                            </div>
                            <div className="flex items-end gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold font-mono text-white leading-none tracking-tighter">
                                    MINT
                                </h1>
                                <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                                    LAUNCHPAD
                                </div>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <button
                                onClick={() => setViewMode('REPO')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'REPO' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Github size={16} /> Repository
                            </button>
                            <button
                                onClick={() => setViewMode('DEVELOPER')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'DEVELOPER' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <User size={16} /> Developer
                            </button>
                            <button
                                onClick={() => setViewMode('PROJECT')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'PROJECT' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Sparkles size={16} /> Project
                            </button>
                            <button
                                onClick={() => setViewMode('COMPANY')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'COMPANY' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Building2 size={16} /> Company
                            </button>
                        </div>
                    </motion.div>

                    {/* Content */}
                    <ManifestGeneratorPage />
                </div>
            </div>
        );
    }

    // Developer Tokenization View
    if (viewMode === 'DEVELOPER') {
        return (
            <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
                <div className="w-full">
                    {/* Standardized Header */}
                    <motion.div
                        className="px-4 md:px-8 pt-8 pb-8 border-b border-gray-800"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                                <Coins className="text-4xl md:text-6xl text-white w-12 h-12 md:w-16 md:h-16" />
                            </div>
                            <div className="flex items-end gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold font-mono text-white leading-none tracking-tighter">
                                    MINT
                                </h1>
                                <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                                    LAUNCHPAD
                                </div>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <button
                                onClick={() => setViewMode('REPO')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'REPO' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Github size={16} /> Repository
                            </button>
                            <button
                                onClick={() => setViewMode('DEVELOPER')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'DEVELOPER' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <User size={16} /> Developer
                            </button>
                            <button
                                onClick={() => setViewMode('PROJECT')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'PROJECT' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Sparkles size={16} /> Project
                            </button>
                            <button
                                onClick={() => setViewMode('COMPANY')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'COMPANY' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Building2 size={16} /> Company
                            </button>
                        </div>
                    </motion.div>

                    {/* Developer Tokenization Content */}
                    <div className="px-4 md:px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left: Info & Requirements */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">Tokenize Yourself</h2>
                                    <p className="text-zinc-400 leading-relaxed">
                                        Create a personal token backed by your skills, reputation, and future earnings.
                                        Investors can support your work and share in your success.
                                    </p>
                                </div>

                                {/* Requirements */}
                                <div className="border border-zinc-800 p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <Shield size={16} /> Requirements
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Github size={12} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">GitHub Connected</div>
                                                <div className="text-xs text-zinc-500">Account must be 90+ days old with 3+ public repos</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <BadgeCheck size={12} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">KYC Verification</div>
                                                <div className="text-xs text-zinc-500">Government ID + proof of address required</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <FileJson size={12} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">Open to All Supporters</div>
                                                <div className="text-xs text-zinc-500">Peer-funding available to anyone who believes in you</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Peer Funding Notice */}
                                <div className="border border-emerald-500/30 bg-emerald-500/5 p-6">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="text-emerald-500 flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-bold text-emerald-500 mb-2">Peer Funding Model</h4>
                                            <p className="text-xs text-zinc-400 leading-relaxed">
                                                Developer tokens enable crowdfunding from your community. Supporters invest in your
                                                potential and share in your success. Basic ID verification required for larger amounts.
                                                Full transparency on terms and token economics.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* What You Get */}
                                <div className="border border-zinc-800 p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">What Investors Get</h3>
                                    <ul className="space-y-2 text-sm text-zinc-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            Revenue share from your contract work
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            Governance rights on major decisions
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            Priority access to your services
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            Tradeable on secondary markets
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right: Action Panel */}
                            <div className="space-y-6">
                                <div className="border border-zinc-800 bg-zinc-900/50 p-8">
                                    <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-center">Get Started</h3>

                                    {/* Step 1: GitHub */}
                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-between p-4 border border-zinc-700 bg-zinc-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">1</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Connect GitHub</div>
                                                    <div className="text-xs text-zinc-500">Verify your developer identity</div>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-xs font-bold uppercase transition-colors">
                                                Connect
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-zinc-700/50 bg-zinc-800/30 opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">2</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Complete KYC</div>
                                                    <div className="text-xs text-zinc-500">Identity verification required</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 uppercase">Locked</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-zinc-700/50 bg-zinc-800/30 opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">3</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Configure Token</div>
                                                    <div className="text-xs text-zinc-500">Set terms and economics</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 uppercase">Locked</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-zinc-700/50 bg-zinc-800/30 opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">4</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Launch Token</div>
                                                    <div className="text-xs text-zinc-500">Go live on the market</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 uppercase">Locked</span>
                                        </div>
                                    </div>

                                    <div className="text-center text-xs text-zinc-600">
                                        By proceeding you agree to our terms of service and acknowledge the risks involved in securities offerings.
                                    </div>
                                </div>

                                {/* Stats Preview */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-zinc-800 p-4 text-center">
                                        <div className="text-2xl font-bold">$2.4M</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Raised</div>
                                    </div>
                                    <div className="border border-zinc-800 p-4 text-center">
                                        <div className="text-2xl font-bold">47</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Tokenized Devs</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Company Tokenization View
    if (viewMode === 'COMPANY') {
        return (
            <div className="min-h-screen bg-black text-white selection:bg-zinc-800">
                <div className="w-full">
                    {/* Standardized Header */}
                    <motion.div
                        className="px-4 md:px-8 pt-8 pb-8 border-b border-gray-800"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                                <Coins className="text-4xl md:text-6xl text-white w-12 h-12 md:w-16 md:h-16" />
                            </div>
                            <div className="flex items-end gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold font-mono text-white leading-none tracking-tighter">
                                    MINT
                                </h1>
                                <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                                    LAUNCHPAD
                                </div>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <button
                                onClick={() => setViewMode('REPO')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'REPO' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Github size={16} /> Repository
                            </button>
                            <button
                                onClick={() => setViewMode('DEVELOPER')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'DEVELOPER' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <User size={16} /> Developer
                            </button>
                            <button
                                onClick={() => setViewMode('PROJECT')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'PROJECT' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Sparkles size={16} /> Project
                            </button>
                            <button
                                onClick={() => setViewMode('COMPANY')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'COMPANY' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Building2 size={16} /> Company
                            </button>
                        </div>
                    </motion.div>

                    {/* Company Tokenization Content */}
                    <div className="px-4 md:px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Left: Info & Requirements */}
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">Tokenize Your Company</h2>
                                    <p className="text-zinc-400 leading-relaxed">
                                        Issue equity tokens for your registered company. Enable community ownership,
                                        crowdfunding, and transparent cap table management on the blockchain.
                                    </p>
                                </div>

                                {/* Requirements */}
                                <div className="border border-zinc-800 p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <Shield size={16} /> Requirements
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Building2 size={12} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">Registered Business</div>
                                                <div className="text-xs text-zinc-500">LLC, Corp, or equivalent in your jurisdiction</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <BadgeCheck size={12} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">Director Verification</div>
                                                <div className="text-xs text-zinc-500">Proof of authority to issue equity</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <FileJson size={12} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">Cap Table Documentation</div>
                                                <div className="text-xs text-zinc-500">Current shareholding structure required</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Crowdfunding Notice */}
                                <div className="border border-yellow-500/30 bg-yellow-500/5 p-6">
                                    <div className="flex items-start gap-3">
                                        <Globe className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-bold text-yellow-500 mb-2">Crowdfunding Platform</h4>
                                            <p className="text-xs text-zinc-400 leading-relaxed">
                                                We operate as a peer-to-peer funding platform. Token sales are open to all supporters.
                                                ID verification may be required for investments above certain thresholds depending on
                                                your jurisdiction. We help you stay compliant while keeping it accessible.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <div className="border border-zinc-800 p-6 space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">What Token Holders Get</h3>
                                    <ul className="space-y-2 text-sm text-zinc-400">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            Equity ownership in your company
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            Dividend distributions (if applicable)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            Voting rights via boardroom
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            24/7 trading on secondary market
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Right: Action Panel */}
                            <div className="space-y-6">
                                <div className="border border-zinc-800 bg-zinc-900/50 p-8">
                                    <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-center">Get Started</h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center justify-between p-4 border border-zinc-700 bg-zinc-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">1</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Register Company</div>
                                                    <div className="text-xs text-zinc-500">Submit business registration docs</div>
                                                </div>
                                            </div>
                                            <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase transition-colors">
                                                Start
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-zinc-700/50 bg-zinc-800/30 opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">2</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Verify Directors</div>
                                                    <div className="text-xs text-zinc-500">KYC for authorized signers</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 uppercase">Locked</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-zinc-700/50 bg-zinc-800/30 opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">3</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Configure Tokens</div>
                                                    <div className="text-xs text-zinc-500">Set supply, pricing, vesting</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 uppercase">Locked</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-zinc-700/50 bg-zinc-800/30 opacity-50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold">4</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">Launch Offering</div>
                                                    <div className="text-xs text-zinc-500">Go live on the exchange</div>
                                                </div>
                                            </div>
                                            <span className="text-xs text-zinc-600 uppercase">Locked</span>
                                        </div>
                                    </div>

                                    <div className="text-center text-xs text-zinc-600">
                                        Companies must agree to ongoing reporting requirements and transparent governance.
                                    </div>
                                </div>

                                {/* Stats Preview */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="border border-zinc-800 p-4 text-center">
                                        <div className="text-2xl font-bold">$8.2M</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Total Raised</div>
                                    </div>
                                    <div className="border border-zinc-800 p-4 text-center">
                                        <div className="text-2xl font-bold">12</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Listed Companies</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-black text-white relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.section
                className="px-4 md:px-8 py-8 relative w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
            >
                <div className="w-full">
                    {/* Standardized Header */}
                    <motion.div
                        className="mb-12 border-b border-gray-800 pb-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
                                <Coins className="text-4xl md:text-6xl text-white w-12 h-12 md:w-16 md:h-16" />
                            </div>
                            <div className="flex items-end gap-4">
                                <h1 className="text-4xl md:text-6xl font-bold font-mono text-white leading-none tracking-tighter">
                                    MINT
                                </h1>
                                <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                                    LAUNCHPAD
                                </div>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <button
                                onClick={() => setViewMode('REPO')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'REPO' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Github size={16} /> Repository
                            </button>
                            <button
                                onClick={() => setViewMode('DEVELOPER')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'DEVELOPER' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <User size={16} /> Developer
                            </button>
                            <button
                                onClick={() => setViewMode('PROJECT')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'PROJECT' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Sparkles size={16} /> Project
                            </button>
                            <button
                                onClick={() => setViewMode('COMPANY')}
                                className={`flex items-center gap-2 px-6 py-3 border font-mono text-xs uppercase tracking-widest transition-all ${viewMode === 'COMPANY' ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600'}`}
                            >
                                <Building2 size={16} /> Company
                            </button>
                        </div>
                    </motion.div>


                    {/* Project Selection */}
                    <div className="mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold font-mono uppercase tracking-widest text-gray-500">1. Select Project</h2>
                            <span className="text-sky-400 text-sm font-bold font-mono border border-sky-400/30 px-3 py-1 uppercase">
                                {portfolioData.projects.length} Available
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {sortProjects(portfolioData.projects).map((project) => (
                                <motion.button
                                    key={project.slug}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(`/mint/launch/${project.slug}`)}
                                    className={`relative p-4 border-2 text-left transition-all overflow-hidden group ${selectedProject?.slug === project.slug
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : 'border-white/5 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 bg-black overflow-hidden border border-white/10 flex-shrink-0 relative">
                                            {project.cardImageUrls && project.cardImageUrls[0] ? (
                                                <Image src={project.cardImageUrls[0]} alt={project.title} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 font-mono">ID</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold font-mono text-white truncate">{project.title}</h3>
                                            <p className="text-[10px] text-sky-400 uppercase tracking-wider font-bold font-mono truncate">
                                                {project.tokenName || `$${project.slug.toUpperCase().slice(0, 4)}`}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3 leading-relaxed min-h-[4rem] font-mono">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] uppercase font-bold font-mono border border-white/5 px-2 py-0.5 text-gray-500">
                                            {project.status}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Curve Selection */}
                    <div className={`transition-all duration-500 ${selectedProject ? 'opacity-100' : 'opacity-20 grayscale pointer-events-none'}`}>
                        <h2 className="text-2xl font-bold font-mono text-center mb-10 uppercase tracking-widest text-gray-500">2. Select Pricing Strategy</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            {curves.map((curve) => (
                                <motion.button
                                    key={curve.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveCurveId(curve.id)}
                                    className={`relative p-6 border-2 text-left transition-all h-full flex flex-col min-h-[300px] ${selectedCurve === curve.id
                                        ? `border-white bg-gradient-to-br ${curve.color} bg-opacity-10 shadow-[0_0_30px_rgba(255,255,255,0.2)]`
                                        : 'border-white/5 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 bg-gradient-to-br ${curve.color}`}>
                                            <curve.icon className="w-6 h-6 text-white" />
                                        </div>
                                        {selectedCurve === curve.id && (
                                            <CheckCircle className="w-6 h-6 text-white fill-current" />
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold font-mono uppercase tracking-tight mb-2">{curve.name}</h3>
                                    <p className="text-xs text-gray-400 mb-6 flex-grow font-mono">{curve.description}</p>

                                    <div className="mt-auto w-full bg-black/40 p-3 relative overflow-hidden border border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all">
                                        <div className="h-16 w-full relative">
                                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <path
                                                    d={curve.visual}
                                                    fill="none"
                                                    stroke="url(#gradient)"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                                                        <stop offset="100%" stopColor="white" stopOpacity="1" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Final Mint Button Area */}
                        <div className="flex flex-col items-center justify-center pb-20">
                            {!userHandle ? (
                                <div className="text-center p-8 bg-white/5 border border-white/10 max-w-xl w-full">
                                    <Wallet className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold font-mono mb-2">Connect Your Wallet</h3>
                                    <p className="text-gray-400 mb-6 font-mono">You need to sign in with HandCash to mint tokens for your projects.</p>
                                    <button
                                        onClick={() => window.location.href = '/api/auth/handcash'}
                                        className="px-12 py-4 bg-sky-500 hover:bg-sky-400 text-white font-black font-mono uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20"
                                    >
                                        Connect HandCash
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <button
                                        onClick={handleMintClick}
                                        disabled={!selectedProject || !selectedCurve || status === 'coming_soon'}
                                        className="px-20 py-8 bg-white text-black font-black font-mono text-3xl uppercase tracking-tighter hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)] transform hover:scale-105 flex items-center gap-6"
                                    >
                                        {status === 'coming_soon' ? 'Mints Live Soon' : 'Deploy Assets'}
                                        <Rocket className="w-8 h-8" />
                                    </button>

                                    {status === 'coming_soon' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-center p-4 bg-sky-500/10 border border-sky-500/30 max-w-md"
                                        >
                                            <p className="text-sky-400 font-bold font-mono uppercase tracking-widest text-sm mb-1">Status: Pre-Release</p>
                                            <p className="text-gray-400 text-xs font-mono">Awaiting final approval from $BOASE governing signature. Your configuration has been saved.</p>
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Modal */}
                    {activeCurveId && curves.find(c => c.id === activeCurveId) && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setActiveCurveId(null)}></div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gray-900 border border-white/10 w-full max-w-2xl relative z-10 overflow-hidden shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Content - Simplified for b0ase.com */}
                                <div className={`p-8 bg-gradient-to-br ${curves.find(c => c.id === activeCurveId)?.color} relative overflow-hidden`}>
                                    <button onClick={() => setActiveCurveId(null)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white transition-colors z-20">
                                        <X className="w-6 h-6" />
                                    </button>

                                    <div className="relative z-10">
                                        <div className="bg-black/20 backdrop-blur-md p-3 w-fit mb-4">
                                            {(() => {
                                                const Icon = curves.find(c => c.id === activeCurveId)?.icon || Activity;
                                                return <Icon className="w-8 h-8 text-white" />;
                                            })()}
                                        </div>
                                        <h3 className="text-3xl font-black font-mono uppercase tracking-tighter text-white mb-4">
                                            {curves.find(c => c.id === activeCurveId)?.name} Strategy
                                        </h3>
                                        <p className="text-white/90 text-sm leading-relaxed bg-black/30 backdrop-blur-sm p-4 font-mono">
                                            {curves.find(c => c.id === activeCurveId)?.longDescription}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="p-4 bg-black/40 border border-white/5">
                                            <label className="text-[10px] font-bold font-mono text-gray-500 uppercase block mb-1">Starting Price</label>
                                            <div className="text-xl font-black font-mono text-sky-400">{initialPrice} BSV</div>
                                        </div>
                                        <div className="p-4 bg-black/40 border border-white/5">
                                            <label className="text-[10px] font-bold font-mono text-gray-500 uppercase block mb-1">Final Price</label>
                                            <div className="text-xl font-black font-mono text-purple-400">{finalPrice} BSV</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedCurve(activeCurveId as CurveType);
                                            setActiveCurveId(null);
                                        }}
                                        className="w-full py-5 bg-white text-black font-black font-mono text-xl transition-all uppercase tracking-widest hover:bg-gray-200"
                                    >
                                        Confirm Strategy
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </motion.section>
        </motion.div>
    );
}