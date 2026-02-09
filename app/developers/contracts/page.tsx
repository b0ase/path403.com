
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FiFilter, FiSearch } from "react-icons/fi";

// Interface for Marketplace Tender
interface Tender {
    id: string;
    stage_id: string;
    budget_max: number;
    status: string;
    created_at: string;
    pipeline_stages: {
        stage_name: string;
        projects: {
            id: string;
            name: string;
            category: string;
        };
    };
}

export default function DeveloperContractsPage() {
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingId, setApplyingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTenders() {
            try {
                const res = await fetch('/api/develop/tenders');
                if (res.ok) {
                    const data = await res.json();
                    setTenders(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchTenders();
    }, []);

    const handleApply = async (tenderId: string) => {
        setApplyingId(tenderId);
        try {
            const res = await fetch(`/api/develop/tenders/${tenderId}/apply`, {
                method: 'POST',
            });

            if (res.status === 401) {
                window.location.href = '/auth/login?redirect=/developers/contracts';
                return;
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Remove from list or mark as claimed
            setTenders(prev => prev.filter(t => t.id !== tenderId));
            alert('Gig claimed successfully! You are now the assigned developer.');
        } catch (err: any) {
            alert(`Failed to apply: ${err.message}`);
        } finally {
            setApplyingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-zinc-500 font-mono text-sm">Loading Contracts...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="min-h-screen bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <section className="px-4 md:px-8 py-8">
                {/* Header */}
                <div className="mb-8 border-b border-zinc-900 pb-8">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase mb-4">
                        Contract Marketplace
                    </h1>
                    <p className="text-zinc-400 max-w-2xl leading-relaxed">
                        Browse and claim fully funded development contracts. All payments are escrowed on-chain.
                        Simply claim a gig to start the work.
                    </p>
                </div>

                {/* Tenders Grid */}
                <div className="mb-12">
                    {tenders.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tenders.map(tender => (
                                <div key={tender.id} className="border border-green-900/50 bg-green-900/10 p-6 hover:border-green-500 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs text-green-400 uppercase tracking-widest font-bold border border-green-900/50 px-2 py-1 bg-black/50">
                                            {tender.pipeline_stages.projects.category}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-green-500 text-black text-[10px] font-bold px-2 py-1 uppercase tracking-tight">
                                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                                            Funded
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-xl mb-2 text-white group-hover:text-green-400 transition-colors">
                                        {tender.pipeline_stages.projects.name}
                                    </h3>
                                    <p className="text-sm text-zinc-400 font-mono mb-6 line-clamp-2">
                                        {tender.pipeline_stages.stage_name}
                                    </p>

                                    <div className="flex items-center justify-between border-t border-green-900/30 pt-4 mt-auto">
                                        <div>
                                            <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Budget</div>
                                            <div className="font-mono font-bold text-white text-lg">£{tender.budget_max.toLocaleString()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Est. Duration</div>
                                            <div className="font-mono text-zinc-300 text-sm">2 Weeks</div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleApply(tender.id)}
                                        disabled={applyingId === tender.id}
                                        className="w-full mt-6 bg-green-600 text-black font-bold uppercase text-xs py-3 hover:bg-green-500 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applyingId === tender.id ? 'Processing Claim...' : 'Claim Contract'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-zinc-500 font-mono text-sm border border-zinc-800 p-8 bg-zinc-900/20 text-center">
                            No active tenders available right now. Check back later.
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );
}
