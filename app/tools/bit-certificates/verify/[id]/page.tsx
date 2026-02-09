'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheck, FiX, FiShield, FiLoader, FiSearch, FiPrinter } from 'react-icons/fi';
import { SignatureDisplay } from '@/components/bitsign';

export default function VerifyCertificatePage() {
    const params = useParams();
    const id = params.id as string;
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const verify = async () => {
            try {
                const res = await fetch(`/api/certificates/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Certificate not found');
                }

                setCertificate(data.certificate);
            } catch (e) {
                console.error(e);
                setError('Certificate not found or invalid.');
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiX className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
                    <p className="text-zinc-500 mb-6">{error || 'This certificate could not be verified.'}</p>
                    <div className="bg-zinc-950 p-3 rounded border border-zinc-800 font-mono text-sm text-zinc-400 mb-8 break-all">
                        ID: {id}
                    </div>
                    <Link href="/tools/bit-certificates" className="text-zinc-400 hover:text-white underline">
                        Back to Registry
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 lg:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/tools/bit-certificates" className="text-zinc-500 hover:text-white flex items-center gap-2">
                        &larr; Registry
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-sm font-bold uppercase tracking-wider">
                        <FiCheck /> Valid Certificate
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Metadata Column */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                            <h3 className="text-xs uppercase text-zinc-500 tracking-widest mb-4">Metadata</h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-zinc-400">Serial Number</div>
                                    <div className="font-mono text-white text-lg">{certificate.serial_number}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-zinc-400">Status</div>
                                    <div className="capitalize text-white">{certificate.status}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-zinc-400">Issuance Date</div>
                                    <div className="text-white">{new Date(certificate.issuance_date).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-zinc-400">Digital Fingerprint</div>
                                    <div className="text-xs font-mono text-zinc-500 break-all mt-1">
                                        {certificate.pdf_hash ? certificate.pdf_hash.substring(0, 20) + '...' : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {certificate.inscription_txid && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                                <h3 className="text-xs uppercase text-zinc-500 tracking-widest mb-4">Blockchain Anchor</h3>
                                <div className="text-sm text-zinc-400 mb-2">Transaction ID</div>
                                <a
                                    href={certificate.inscription_url || `https://whatsonchain.com/tx/${certificate.inscription_txid}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500 text-xs font-mono break-all hover:underline block"
                                >
                                    {certificate.inscription_txid}
                                </a>
                            </div>
                        )}

                        <button onClick={() => window.print()} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded font-bold flex items-center justify-center gap-2 transition-colors">
                            <FiPrinter /> Print Copy
                        </button>
                    </div>

                    {/* Visual Preview */}
                    <div className="md:col-span-2">
                        <div className="bg-white text-black p-8 shadow-2xl relative border-[10px] border-double border-zinc-200 aspect-[1.414/1] flex flex-col items-center justify-center text-center">
                            <div className="absolute inset-4 border-2 border-zinc-800 pointer-events-none" />

                            <h1 className="text-3xl font-black uppercase tracking-widest mb-2 font-sans">Share Certificate</h1>
                            <div className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-8">Certificate of Ownership</div>

                            <div className="space-y-4 z-10 w-full px-8">
                                <p className="italic text-lg">This Certifies That</p>
                                <h2 className="text-3xl font-bold font-serif border-b-2 border-zinc-900 inline-block px-8 py-1">
                                    {certificate.shareholder_name}
                                </h2>
                                <p>
                                    is the registered holder of <span className="font-bold">{Number(certificate.share_amount).toLocaleString()}</span> shares of
                                    <br />
                                    <span className="font-bold text-lg uppercase mt-2 inline-block">{certificate.share_class} Stock</span>
                                </p>
                            </div>

                            <div className="mt-12 flex justify-between items-end w-full px-4 z-10">
                                <div className="text-center">
                                    <div className="text-xs font-mono mb-1">{new Date(certificate.issuance_date).toLocaleDateString()}</div>
                                    <div className="w-32 border-t border-black pt-1 text-[10px] uppercase tracking-widest">Date Issued</div>
                                </div>
                                <div className="text-center">
                                    <div className="h-12 flex items-end justify-center mb-1">
                                        {certificate.user_signatures && (
                                            <div className="transform scale-100 origin-bottom">
                                                <SignatureDisplay signature={certificate.user_signatures} size="sm" className="bg-transparent border-none" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-40 border-t border-black pt-1 text-[10px] uppercase tracking-widest">Authorized Signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
