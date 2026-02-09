'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiCopy, FiCheck, FiDownload, FiDollarSign, FiShare2, FiShield, FiGithub } from 'react-icons/fi';
import Head from 'next/head';

type ManifestForm = {
    projectName: string;
    description: string;
    repoUrl: string;
    license: string;
    website: string;
    ticker: string;
    supply: number;
    contractAddress: string;
    treasuryWallet: string;
    model: 'DIVIDEND' | 'BUYBACK_BURN';
    upstreamEnabled: boolean;
    upstreamBeneficiaries: Array<{ repo: string; allocation_percent: number; type: 'EQUITY' | 'REVENUE' }>;
};

const INITIAL_FORM: ManifestForm = {
    projectName: '',
    description: '',
    repoUrl: '',
    license: 'MIT',
    website: '',
    ticker: '',
    supply: 100000,
    contractAddress: '', // This would ideally come from a minting step, but manual entry for now
    treasuryWallet: '',
    model: 'DIVIDEND',
    upstreamEnabled: false,
    upstreamBeneficiaries: [],
};

export default function ManifestGeneratorPage() {
    const [form, setForm] = useState<ManifestForm>(INITIAL_FORM);
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);

    // NEW: Parse query params using useSearchParams
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    React.useEffect(() => {
        if (!searchParams) return;
        const repoParam = searchParams.get('repo');
        if (repoParam) {
            setForm(prev => ({
                ...prev,
                repoUrl: repoParam
            }));
        }
    }, []);

    const updateForm = (key: keyof ManifestForm, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const addBeneficiary = () => {
        setForm(prev => ({
            ...prev,
            upstreamBeneficiaries: [
                ...prev.upstreamBeneficiaries,
                { repo: '', allocation_percent: 5, type: 'EQUITY' }
            ]
        }));
    };

    const updateBeneficiary = (index: number, field: string, value: any) => {
        const newBeneficiaries = [...form.upstreamBeneficiaries];
        newBeneficiaries[index] = { ...newBeneficiaries[index], [field]: value };
        setForm(prev => ({ ...prev, upstreamBeneficiaries: newBeneficiaries }));
    };

    const removeBeneficiary = (index: number) => {
        const newBeneficiaries = form.upstreamBeneficiaries.filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, upstreamBeneficiaries: newBeneficiaries }));
    };

    const generateJSON = () => {
        const json = {
            version: "1.0",
            project: {
                name: form.projectName,
                description: form.description,
                repo_url: form.repoUrl,
                license: form.license,
                website: form.website || undefined,
            },
            asset: {
                ticker: form.ticker.toUpperCase(),
                supply: Number(form.supply),
                chain: "BSV",
                protocol: "BSV-20",
                contract_address: form.contractAddress || "PENDING_MINT",
            },
            economics: {
                treasury_wallet: form.treasuryWallet,
                model: form.model,
                payout_frequency: "QUARTERLY"
            },
            upstream_covenant: form.upstreamEnabled ? {
                enabled: true,
                description: "Standard Upstream Covenant",
                beneficiaries: form.upstreamBeneficiaries
            } : undefined,
            governance: {
                method: "OWNER_DICTATORSHIP",
                statement: "Token holders are entitled to economic rights but hold no governance power over code merges."
            }
        };
        return JSON.stringify(json, null, 2);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateJSON());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800 pb-24">
            <div className="w-full px-4 md:px-8 py-8">
                <header className="mb-16 border-b border-zinc-900 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-2 h-2 bg-blue-500 animate-pulse"></span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">SYSTEM_TOOL_01</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">
                        REPO_MANIFEST_GENERATOR
                    </h1>
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-2">
                        INITIALIZE_YOUR_REPOSITORY_ASSET_CLASS
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form Side */}
                    <div className="space-y-12">
                        {/* Step 1: Project Identity */}
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-white border-l-2 border-blue-500 pl-4">
                                01. Identity Matrix
                            </h2>
                            <div className="space-y-6 pl-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Project Name</label>
                                    <input
                                        type="text"
                                        value={form.projectName}
                                        onChange={(e) => updateForm('projectName', e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:border-white focus:outline-none transition-colors placeholder-zinc-700"
                                        placeholder="e.g. b0ase Core"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => updateForm('description', e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:border-white focus:outline-none transition-colors h-24 placeholder-zinc-700 resize-none"
                                        placeholder="Short description of the value proposition..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">GitHub Repo URL</label>
                                        <input
                                            type="text"
                                            value={form.repoUrl}
                                            onChange={(e) => updateForm('repoUrl', e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:border-white focus:outline-none transition-colors placeholder-zinc-700"
                                            placeholder="https://github.com/..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">License</label>
                                        <select
                                            value={form.license}
                                            onChange={(e) => updateForm('license', e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:border-white focus:outline-none appearance-none rounded-none cursor-pointer"
                                        >
                                            <option value="MIT">MIT</option>
                                            <option value="GPL-3.0">GPL-3.0</option>
                                            <option value="Apache-2.0">Apache-2.0</option>
                                            <option value="BSL-1.1">BSL-1.1 (Business Source)</option>
                                            <option value="UNLICENSED">Proprietary</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Step 2: Economics */}
                        <section>
                            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-white border-l-2 border-emerald-500 pl-4">
                                02. Economic Engine
                            </h2>
                            <div className="space-y-6 pl-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Asset Ticker</label>
                                        <input
                                            type="text"
                                            value={form.ticker}
                                            onChange={(e) => updateForm('ticker', e.target.value.toUpperCase())}
                                            className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:border-white focus:outline-none transition-colors placeholder-zinc-700 font-mono"
                                            placeholder="TICKER"
                                            maxLength={5}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Max Supply</label>
                                        <input
                                            type="number"
                                            value={form.supply}
                                            onChange={(e) => updateForm('supply', e.target.value)}
                                            className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:border-white focus:outline-none transition-colors placeholder-zinc-700 font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Treasury Wallet (BSV)</label>
                                    <input
                                        type="text"
                                        value={form.treasuryWallet}
                                        onChange={(e) => updateForm('treasuryWallet', e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 p-4 text-sm focus:border-white focus:outline-none transition-colors placeholder-zinc-700 font-mono text-emerald-500"
                                        placeholder="1Bv..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Distribution Model</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => updateForm('model', 'DIVIDEND')}
                                            className={`p-4 border text-xs font-bold uppercase tracking-wide transition-all ${form.model === 'DIVIDEND' ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                                        >
                                            Dividend
                                        </button>
                                        <button
                                            onClick={() => updateForm('model', 'BUYBACK_BURN')}
                                            className={`p-4 border text-xs font-bold uppercase tracking-wide transition-all ${form.model === 'BUYBACK_BURN' ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                                        >
                                            Buyback & Burn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Step 3: Upstream Covenant */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white border-l-2 border-purple-500 pl-4">
                                    03. Upstream Covenant
                                </h2>
                                <button
                                    onClick={() => updateForm('upstreamEnabled', !form.upstreamEnabled)}
                                    className={`text-[9px] font-bold uppercase px-3 py-1 border transition-colors ${form.upstreamEnabled ? 'bg-purple-900/20 text-purple-400 border-purple-900' : 'bg-zinc-900 text-zinc-600 border-zinc-800'}`}
                                >
                                    {form.upstreamEnabled ? 'ENABLED' : 'DISABLED'}
                                </button>
                            </div>

                            {form.upstreamEnabled && (
                                <div className="pl-4 space-y-6">
                                    <p className="text-xs text-zinc-500 leading-relaxed border-l border-zinc-800 pl-4 py-2">
                                        The Upstream Covenant allows you to automatically allocate equity or revenue to the projects you depend on. This builds the "Graph of Value".
                                    </p>

                                    {form.upstreamBeneficiaries.map((b, i) => (
                                        <div key={i} className="bg-zinc-950 border border-zinc-800 p-4 grid grid-cols-12 gap-4 items-start animate-fadeIn">
                                            <div className="col-span-12 md:col-span-6 space-y-1">
                                                <label className="text-[9px] uppercase text-zinc-600 font-bold block">Repo URL</label>
                                                <input
                                                    type="text"
                                                    value={b.repo}
                                                    onChange={(e) => updateBeneficiary(i, 'repo', e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 p-2 text-xs font-mono text-zinc-300 focus:border-purple-500 focus:outline-none"
                                                    placeholder="https://github.com/..."
                                                />
                                            </div>
                                            <div className="col-span-6 md:col-span-2 space-y-1">
                                                <label className="text-[9px] uppercase text-zinc-600 font-bold block">Pct %</label>
                                                <input
                                                    type="number"
                                                    value={b.allocation_percent}
                                                    onChange={(e) => updateBeneficiary(i, 'allocation_percent', Number(e.target.value))}
                                                    className="w-full bg-black border border-zinc-800 p-2 text-xs font-mono text-zinc-300 focus:border-purple-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="col-span-6 md:col-span-3 space-y-1">
                                                <label className="text-[9px] uppercase text-zinc-600 font-bold block">Type</label>
                                                <select
                                                    value={b.type}
                                                    onChange={(e) => updateBeneficiary(i, 'type', e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 p-2 text-xs font-mono text-zinc-300 focus:border-purple-500 focus:outline-none appearance-none rounded-none"
                                                >
                                                    <option value="EQUITY">Equity (Token)</option>
                                                    <option value="REVENUE">Revenue (Cash)</option>
                                                </select>
                                            </div>
                                            <div className="col-span-12 md:col-span-1 flex items-end justify-end h-full">
                                                <button onClick={() => removeBeneficiary(i)} className="text-zinc-600 hover:text-red-500 p-2">×</button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addBeneficiary}
                                        className="w-full py-4 border border-dashed border-zinc-800 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-colors"
                                    >
                                        + Add Beneficiary
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Code Side (Sticky) */}
                    <div className="lg:sticky lg:top-8 h-fit">
                        <div className="border border-zinc-800 bg-black">
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
                                <div className="flex items-center gap-2">
                                    <FiCode className="text-zinc-500" />
                                    <span className="text-xs font-mono text-zinc-300">token.json</span>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {copied ? <span className="text-emerald-500">COPIED</span> : <span>COPY_FILE</span>}
                                    {copied ? <FiCheck size={14} className="text-emerald-500" /> : <FiCopy size={14} />}
                                </button>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <pre className="text-xs font-mono text-zinc-400 p-6 leading-relaxed">
                                    {generateJSON()}
                                </pre>
                            </div>
                            <div className="border-t border-zinc-800 p-6 bg-zinc-950/50">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">INSTRUCTIONS</h3>
                                <ol className="text-xs text-zinc-400 space-y-3 font-mono list-decimal list-inside marker:text-zinc-600">
                                    <li>Copy the code above.</li>
                                    <li>Create a file named <code className="bg-zinc-900 border border-zinc-800 px-1 text-white">token.json</code> in the root of your repository.</li>
                                    <li>Commit and push to the <code className="text-white">main</code> or <code className="text-white">master</code> branch.</li>
                                    <li>Visit <code className="text-white">b0ase.com/pay/github/[you]/[repo]</code> to verify.</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
