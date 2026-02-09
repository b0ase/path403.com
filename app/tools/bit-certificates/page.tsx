'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiShield, FiPlus, FiArrowRight, FiSearch, FiFileText, FiDownload } from 'react-icons/fi';
import { createClient } from '@/lib/supabase/client';

interface Certificate {
    id: string;
    serial_number: string;
    shareholder_name: string;
    share_class: string;
    share_amount: number;
    issuance_date: string;
    status: 'active' | 'revoked' | 'redeemed';
    pdf_url?: string;
    director_signature_id?: string;
}

export default function BitCertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const loadCertificates = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            // Simple admin check (replace with real role check)
            if (user) {
                // Fetch profile or check roles logic here
                // For now, assuming anyone authenticated can issue for demo
                setIsAdmin(true);
            }

            try {
                const res = await fetch('/api/certificates');
                const data = await res.json();
                if (data.certificates) {
                    setCertificates(data.certificates);
                }
            } catch (err) {
                console.error('Failed to load certificates', err);
            } finally {
                setLoading(false);
            }
        };

        loadCertificates();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
            {/* Hero Section */}
            <section className="relative py-20 px-4 border-b border-zinc-900">
                <div className="max-w-pillar mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-pillar text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
                            <FiShield size={14} className="text-blue-500" />
                            CERTIFICATE_REGISTRY: ACTIVE_NODE
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6">
                            BIT<span className="text-zinc-800">.CERT</span>
                        </h1>

                        <p className="text-sm text-zinc-500 uppercase tracking-widest max-w-2xl mx-auto mb-12">
                            ANCHORED_EQUITY_PROOF: BITCOIN_BLOCKCHAIN_V1
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/tools/bit-certificates/verify"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all rounded-pillar"
                            >
                                <FiSearch size={18} />
                                VERIFY_SERIAL
                            </Link>
                            {isAdmin && (
                                <Link
                                    href="/tools/bit-certificates/issue"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-950 text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-900 hover:border-zinc-700 hover:text-white transition-all rounded-pillar"
                                >
                                    <FiPlus size={18} />
                                    ISSUE_UNIT
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Certificates List */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold uppercase tracking-tight">Recent Issuances</h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-zinc-500">Loading registry...</div>
                    ) : certificates.length === 0 ? (
                        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-pillar bg-zinc-900/30">
                            <p className="text-zinc-500 mb-4">No certificates issued yet.</p>
                            {isAdmin && (
                                <Link
                                    href="/tools/bit-certificates/issue"
                                    className="text-blue-500 hover:text-blue-400"
                                >
                                    Issue your first certificate &rarr;
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {certificates.map((cert) => (
                                <div key={cert.id} className="bg-zinc-900/50 border border-zinc-800 rounded-pillar p-6 hover:border-zinc-600 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-xs font-mono text-zinc-500">{cert.serial_number}</div>
                                        <div className={`px-2 py-1 rounded-pillar text-[10px] uppercase font-bold tracking-wider ${cert.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                            cert.status === 'revoked' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                                            }`}>
                                            {cert.status}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold mb-1">{cert.shareholder_name}</h3>
                                    <div className="text-sm text-zinc-400 mb-4">
                                        {cert.share_amount.toLocaleString()} {cert.share_class} Shares
                                    </div>

                                    <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                                        <div className="text-xs text-zinc-500">
                                            Issued {new Date(cert.issuance_date).toLocaleDateString()}
                                        </div>
                                        {cert.pdf_url && (
                                            <a
                                                href={cert.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-white"
                                                title="Download PDF"
                                            >
                                                <FiDownload size={16} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
