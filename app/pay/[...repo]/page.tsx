'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiCheck, FiCopy, FiExternalLink, FiDollarSign, FiAlertTriangle, FiCode, FiArrowRight } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { fetchRepoManifest, type RepoManifest } from '@/lib/repo-manifest';
import { useUserHandle } from '@/hooks/useUserHandle';

export default function RepoPayPage() {
    const params = useParams();
    const [manifest, setManifest] = useState<RepoManifest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Smart Payment State
    const { handle: userHandle } = useUserHandle();
    const [amount, setAmount] = useState('10');
    const [paying, setPaying] = useState(false);
    const [paymentResult, setPaymentResult] = useState<any>(null);

    // Parse repo from params
    const repoPath = Array.isArray(params?.repo) ? params.repo : [];
    // Expecting /pay/github/owner/repo -> ['github', 'owner', 'repo']
    const host = repoPath[0];
    const owner = repoPath[1];
    const repoName = repoPath[2];

    const isValidUrl = host === 'github' && owner && repoName;
    const repoUrl = isValidUrl ? `https://github.com/${owner}/${repoName}` : '';

    useEffect(() => {
        async function loadManifest() {
            if (!isValidUrl) {
                setError('INVALID_REPOSITORY_PARAMETERS');
                setLoading(false);
                return;
            }

            try {
                const data = await fetchRepoManifest(repoUrl);
                if (data) {
                    setManifest(data);
                    // BACKGROUND_SYNC: Index this repo into the database
                    fetch('/api/repos/index', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ repoUrl })
                    }).catch(console.error); // Non-blocking, just log error if fails
                } else {
                    setError('MANIFEST_NOT_FOUND: token.json MISSING_OR_INVALID');
                }
            } catch (err) {
                setError('CONNECTION_FAILURE_TO_REPOSITORY_NODE');
            } finally {
                setLoading(false);
            }
        }

        loadManifest();
    }, [repoUrl, isValidUrl]);

    const handleCopy = () => {
        if (manifest?.economics.treasury_wallet) {
            navigator.clipboard.writeText(manifest.economics.treasury_wallet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSmartPay = async () => {
        setPaying(true);
        setError(null);
        try {
            const res = await fetch('/api/pay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoUrl: repoUrl,
                    amount: parseFloat(amount),
                    currency: 'USD'
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Payment failed');

            setPaymentResult(data);
        } catch (err: any) {
            console.error(err);
            // TODO: We should show a user-friendly error in the payment box, NOT replace the whole page with error.
            // For now, let's just log it or reuse 'error' state but checking how it renders.
            // The main error state replaces the whole page content which is bad.
            // Let's alert for now.
            alert(`Payment Failed: ${err.message}`);
        } finally {
            setPaying(false);
        }
    };

    if (!isValidUrl) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono p-4">
                <div className="border border-red-900 bg-red-950/20 p-8 max-w-md w-full">
                    <h1 className="text-xl font-bold uppercase text-red-500 mb-4">ERROR_400: INVALID_TARGET</h1>
                    <p className="text-xs text-red-400 mb-6">THE_URL_PARAMETERS_PROVIDED_DO_NOT_RESOLVE_TO_A_VALID_REPOSITORY_PATH.</p>
                    <div className="bg-black border border-red-900 p-4 text-[10px] text-zinc-500">
                        EXPECTED_FORMAT: /pay/github/[OWNER]/[REPO]
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-zinc-800">
            <div className="max-w-4xl mx-auto p-4 md:p-12">

                {/* Header */}
                <header className="mb-16 border-b border-zinc-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">SECURE_PAYMENT_GATEWAY</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter">
                            REPOSITORY_CONTRIBUTION_NODE
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-widest">
                        <span>PROTOCOL:</span>
                        <span className="text-white">BRTS-1</span>
                    </div>
                </header>

                {loading ? (
                    <div className="border border-zinc-900 bg-zinc-950/30 p-12 text-center">
                        <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-none animate-spin mx-auto mb-6"></div>
                        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500 animate-pulse">ESTABLISHING_UPLINK_TO_GITHUB_API...</p>
                    </div>
                ) : error ? (
                    <div className="border border-red-900 bg-red-950/10 p-12">
                        <div className="flex items-start gap-6">
                            <FiAlertTriangle size={32} className="text-red-500 shrink-0" />
                            <div>
                                <h2 className="text-xl font-bold uppercase text-red-500 mb-2">CONNECTION_REFUSED</h2>
                                <p className="font-mono text-xs uppercase text-red-400 mb-6">{error}</p>
                                <div className="bg-black border border-red-900/50 p-6">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">TROUBLESHOOTING_LOG:</p>
                                    <ul className="text-xs text-zinc-400 space-y-2 font-mono list-disc list-inside">
                                        <li>Verify repository exists at <a href={repoUrl} target="_blank" className="underline hover:text-white">{repoUrl}</a></li>
                                        <li>Ensure <code className="bg-red-900/20 px-1 text-red-300">token.json</code> exists in the root directory</li>
                                        <li>Check if the manifest follows the BRTS-1 Schema</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : manifest ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800"
                    >
                        {/* Left Column: Project Info */}
                        <div className="bg-black p-8 md:p-12 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                        <FiCode size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold uppercase tracking-tight">{manifest.project.name}</h2>
                                        <a href={manifest.project.repo_url} target="_blank" className="text-xs font-mono text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-1 mt-1 transition-colors">
                                            <FiGithub /> {owner}/{repoName} <FiExternalLink />
                                        </a>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-3 font-mono">PROJECT_DESCRIPTION</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
                                            {manifest.project.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2 font-mono">ASSET_CLASS</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-white">{manifest.asset.ticker}</span>
                                                <span className="text-[9px] px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 uppercase font-mono">{manifest.asset.protocol}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-2 font-mono">ECONOMIC_MODEL</h3>
                                            <div className="text-sm font-mono text-white">{manifest.economics.model}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {manifest.upstream_covenant?.enabled && (
                                <div className="mt-12 pt-12 border-t border-zinc-900">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-4 font-mono flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-none"></span>
                                        UPSTREAM_COVENANT_ACTIVE
                                    </h3>
                                    <div className="space-y-3">
                                        {manifest.upstream_covenant.beneficiaries?.map((b, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs border border-zinc-900 p-3 bg-zinc-950/50">
                                                <span className="font-mono text-zinc-400 truncate max-w-[180px]">{b.repo.replace('https://github.com/', '')}</span>
                                                <span className="font-mono font-bold text-white">{b.allocation_percent}% {b.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Payment & Treasury */}
                        <div className="bg-zinc-950 p-8 md:p-12 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2 py-1">Treasury Node Verified</span>
                            </div>

                            <div className="flex-grow flex flex-col justify-center">
                                {!userHandle ? (
                                    <div className="text-center space-y-6">
                                        <div className="bg-blue-900/10 border border-blue-900/30 p-6 rounded-lg">
                                            <h3 className="text-lg font-bold text-blue-400 mb-2 uppercase">Connect Wallet</h3>
                                            <p className="text-xs text-zinc-400 mb-6">
                                                Connect your HandCash wallet to enable smart payments that respect the Upstream Covenant splits automatically.
                                            </p>
                                            <a href="/api/auth/handcash" className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-blue-500 transition-colors">
                                                Connect HandCash
                                            </a>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-900"></div></div>
                                            <div className="relative flex justify-center"><span className="bg-zinc-950 px-2 text-zinc-600 text-xs uppercase tracking-widest">Or Pay Manually</span></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-900/30 p-8 border border-zinc-800 mb-8">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            Smart Contribution
                                        </h3>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block tracking-widest">Amount (USD)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                                    <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        className="w-full bg-black border border-zinc-700 p-4 pl-8 text-xl font-mono text-white focus:border-emerald-500 focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {paymentResult ? (
                                                <div className="bg-emerald-900/20 border border-emerald-900 p-4 text-center animate-fadeIn">
                                                    <FiCheck className="mx-auto text-emerald-500 text-2xl mb-2" />
                                                    <p className="text-emerald-400 font-bold uppercase tracking-wide">Payment Successful</p>
                                                    <p className="text-[10px] text-emerald-600 font-mono mt-1 break-all">{paymentResult.transactionId}</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={handleSmartPay}
                                                    disabled={paying}
                                                    className="w-full bg-emerald-600 text-white py-4 font-bold uppercase tracking-widest hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {paying ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            Confirm Contribution <FiArrowRight />
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Manual Fallback */}
                                <div className={`text-center transition-opacity ${userHandle ? 'opacity-50 hover:opacity-100' : ''}`}>
                                    <div className="bg-white p-2 inline-block mb-4">
                                        <QRCodeSVG
                                            value={manifest.economics.treasury_wallet}
                                            size={120}
                                            level="L"
                                            includeMargin={false}
                                        />
                                    </div>
                                    <div className="w-full max-w-xs mx-auto">
                                        <div className="flex items-center gap-2 mb-2 group justify-center">
                                            <code className="text-[10px] font-mono bg-black border border-zinc-800 p-2 text-zinc-500 break-all group-hover:text-zinc-300 transition-colors">
                                                {manifest.economics.treasury_wallet}
                                            </code>
                                            <button onClick={handleCopy} className="text-zinc-500 hover:text-white"><FiCopy /></button>
                                        </div>
                                        <p className="text-[9px] text-zinc-700 font-mono uppercase tracking-widest">
                                            Manual transfers do {manifest.upstream_covenant?.enabled ? <span className="text-red-900 font-bold">NOT</span> : ''} automatically split funds.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : null}

                {/* Footer */}
                <div className="mt-8 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                    <span>SECURE_CONNECTION_ESTABLISHED</span>
                    <span className="flex items-center gap-1">POWERED_BY_B0ASE <div className="w-1.5 h-1.5 bg-zinc-600"></div></span>
                </div>
            </div>
        </div>
    );
}
