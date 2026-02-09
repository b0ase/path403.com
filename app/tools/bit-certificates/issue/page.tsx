'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiCheck, FiLoader, FiPrinter, FiSave } from 'react-icons/fi';
import { SignatureDisplay } from '@/components/bitsign';
import { createClient } from '@/lib/supabase/client';

interface UserSignature {
    id: string;
    signature_name: string;
    signature_type: 'drawn' | 'typed' | 'upload';
    svg_data?: string;
    image_data?: string;
    typed_text?: string;
    typed_font?: string;
    wallet_address?: string;
    is_default?: boolean;
}

export default function IssueCertificatePage() {
    const router = useRouter();
    const certificateRef = useRef<HTMLDivElement>(null);

    // Form State
    const [shareholderName, setShareholderName] = useState('');
    const [shareClass, setShareClass] = useState('Common A');
    const [shareAmount, setShareAmount] = useState<string>('1000');
    const [serialNumber, setSerialNumber] = useState('');
    const [selectedSignature, setSelectedSignature] = useState<UserSignature | null>(null);

    // Data State
    const [signatures, setSignatures] = useState<UserSignature[]>([]);
    const [loading, setLoading] = useState(true);
    const [issuing, setIssuing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login?redirect=/tools/bit-certificates/issue');
                return;
            }

            // Generate random serial
            setSerialNumber(`CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);

            await loadSignatures();
        };

        const loadSignatures = async () => {
            try {
                const res = await fetch('/api/signatures');
                const data = await res.json();
                if (data.signatures) {
                    setSignatures(data.signatures);
                    const defaultSig = data.signatures.find((s: UserSignature) => s.is_default);
                    if (defaultSig) setSelectedSignature(defaultSig);
                    else if (data.signatures.length > 0) setSelectedSignature(data.signatures[0]);
                }
            } catch (err) {
                console.error('Failed to load signatures', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleIssue = async () => {
        if (!shareholderName || !shareAmount || !selectedSignature) {
            setError('Please fill in all fields and select a signature');
            return;
        }

        setIssuing(true);
        setError(null);

        try {
            const response = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serial_number: serialNumber,
                    shareholder_name: shareholderName,
                    share_class: shareClass,
                    share_amount: Number(shareAmount),
                    director_signature_id: selectedSignature.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to issue certificate');
            }

            router.push('/tools/bit-certificates');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to issue certificate');
            setIssuing(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white print:bg-white print:text-black">
            {/* Navigation - Hidden on Print */}
            <div className="print:hidden max-w-6xl mx-auto px-4 py-8">
                <Link
                    href="/tools/bit-certificates"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6"
                >
                    <FiArrowLeft size={14} />
                    Back to Certificates
                </Link>
                <h1 className="text-3xl font-bold uppercase tracking-tight mb-8">Issue Share Certificate</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                            <h3 className="font-bold mb-4">Certificate Details</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Serial Number</label>
                                    <input
                                        type="text"
                                        value={serialNumber}
                                        onChange={(e) => setSerialNumber(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-300 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Shareholder Name</label>
                                    <input
                                        type="text"
                                        value={shareholderName}
                                        onChange={(e) => setShareholderName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Share Class</label>
                                    <select
                                        value={shareClass}
                                        onChange={(e) => setShareClass(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                                    >
                                        <option>Common A</option>
                                        <option>Common B</option>
                                        <option>Preferred</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-zinc-500 mb-1">Number of Shares</label>
                                    <input
                                        type="number"
                                        value={shareAmount}
                                        onChange={(e) => setShareAmount(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
                            <h3 className="font-bold mb-4">Director Signature</h3>

                            {signatures.length === 0 ? (
                                <div className="text-center text-zinc-500 text-sm">
                                    No signatures found. <Link href="/user/account/signatures/create" className="text-blue-500 underline">Create one</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {signatures.map(sig => (
                                        <div
                                            key={sig.id}
                                            onClick={() => setSelectedSignature(sig)}
                                            className={`cursor-pointer border rounded p-2 ${selectedSignature?.id === sig.id
                                                ? 'border-blue-500 bg-blue-500/10'
                                                : 'border-zinc-800 hover:border-zinc-600'
                                                }`}
                                        >
                                            <SignatureDisplay signature={sig} size="sm" />
                                            <div className="text-[10px] text-zinc-500 mt-1 truncate">{sig.signature_name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handlePrint}
                                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded flex items-center justify-center gap-2"
                            >
                                <FiPrinter /> Preview Print
                            </button>
                            <button
                                onClick={handleIssue}
                                disabled={issuing}
                                className="flex-1 px-4 py-3 bg-white hover:bg-zinc-200 text-black font-bold rounded flex items-center justify-center gap-2"
                            >
                                {issuing ? <FiLoader className="animate-spin" /> : <FiSave />}
                                Issue Certificate
                            </button>
                        </div>
                    </div>

                    {/* Certificate Preview */}
                    <div className="lg:col-span-2">
                        <h3 className="font-bold mb-4 lg:hidden">Preview</h3>
                        <div className="w-full">
                            {/* Responsive container matching Aspect Ratio of A4 Landscape */}
                            <div
                                ref={certificateRef}
                                className="bg-white text-black w-full aspect-[1.414/1] shadow-2xl relative border-[10px] md:border-[20px] border-double border-zinc-200 flex flex-col p-6 md:p-12"
                                style={{ fontFamily: 'serif' }}
                            >
                                {/* Border Ornamentation */}
                                <div className="absolute inset-2 md:inset-4 border-2 border-zinc-800 pointer-events-none" />
                                <div className="absolute inset-3 md:inset-5 border border-zinc-400 pointer-events-none" />

                                {/* Header */}
                                <div className="text-center mt-4 md:mt-8 mb-6 md:mb-12 relative z-10">
                                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-widest mb-1 md:mb-2 font-sans">Share Certificate</h1>
                                    <div className="text-[10px] md:text-sm uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-500">Certificate of Ownership</div>
                                </div>

                                {/* Content */}
                                <div className="text-center space-y-4 md:space-y-8 relative z-10 px-4 md:px-12 flex-grow flex flex-col justify-center">
                                    <div>
                                        <p className="text-base md:text-xl italic">This Certifies That</p>
                                        <h2 className="text-2xl md:text-4xl font-bold font-serif border-b-2 border-zinc-900 inline-block px-8 md:px-12 py-1 md:py-2 mt-2">
                                            {shareholderName || '______________________'}
                                        </h2>
                                    </div>

                                    <p className="text-sm md:text-lg">
                                        is the registered holder of <span className="font-bold">{Number(shareAmount).toLocaleString()}</span> shares of
                                        <br />
                                        <span className="font-bold text-lg md:text-xl uppercase mt-2 inline-block">{shareClass} Stock</span>
                                    </p>

                                    <div className="mt-8 md:mt-12">
                                        <p className="text-xs md:text-sm uppercase tracking-widest mb-2 md:mb-4">In the Company Known As</p>
                                        <p className="text-xl md:text-3xl font-black font-sans">B0ASE.COM</p>
                                    </div>
                                </div>

                                {/* Footer / Signatures */}
                                <div className="mt-auto pt-8 md:pt-12 flex justify-between items-end relative z-10 px-2 md:px-8 pb-4">
                                    <div className="text-center">
                                        <div className="text-xs md:text-sm font-mono mb-1 md:mb-2">{new Date().toLocaleDateString()}</div>
                                        <div className="w-24 md:w-48 border-t border-black pt-1 md:pt-2 text-[8px] md:text-xs uppercase tracking-widest">Date Issued</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="h-12 md:h-16 flex items-end justify-center mb-1 md:mb-2">
                                            {selectedSignature ? (
                                                <div className="transform scale-75 md:scale-100 origin-bottom">
                                                    <SignatureDisplay signature={selectedSignature} size="md" className="border-none bg-transparent" />
                                                </div>
                                            ) : (
                                                <span className="text-zinc-300 italic text-xs md:text-base">Director Signature</span>
                                            )}
                                        </div>
                                        <div className="w-32 md:w-64 border-t border-black pt-1 md:pt-2 text-[8px] md:text-xs uppercase tracking-widest">Authorized Signature</div>
                                    </div>
                                </div>

                                {/* Serial */}
                                <div className="hidden md:block absolute top-8 right-8 font-mono text-sm text-red-600 font-bold bg-white px-2">
                                    No. {serialNumber}
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-zinc-500 text-xs mt-4">
                            This preview approximates the final certificate. Use &quot;Preview Print&quot; to see exact layout.
                        </p>
                    </div>
                </div>
            </div>

            {/* Print View - Only Visible When Printing */}
            <div className="hidden print:block print:w-full print:h-full print:fixed print:top-0 print:left-0 print:bg-white print:z-50 p-0 m-0">
                {/* Duplicate of the certificate content but styled strictly for full page */}
                <div
                    className="w-full h-full p-12 border-[20px] border-double border-zinc-200 relative break-inside-avoid"
                    style={{ fontFamily: 'serif' }}
                >
                    <div className="absolute inset-4 border-2 border-zinc-800" />
                    <div className="absolute inset-5 border border-zinc-400" />

                    <div className="text-center mt-12 mb-16 relative z-10">
                        <h1 className="text-5xl font-black uppercase tracking-widest mb-4 font-sans">Share Certificate</h1>
                        <div className="text-base uppercase tracking-[0.5em] text-zinc-500">Certificate of Ownership</div>
                    </div>

                    <div className="text-center space-y-12 relative z-10 px-12">
                        <p className="text-2xl italic">This Certifies That</p>

                        <h2 className="text-5xl font-bold font-serif border-b-2 border-zinc-900 inline-block px-12 py-4">
                            {shareholderName}
                        </h2>

                        <p className="text-2xl leading-relaxed">
                            is the registered holder of <span className="font-bold">{Number(shareAmount).toLocaleString()}</span> shares of
                            <br />
                            <span className="font-bold text-3xl uppercase mt-4 inline-block">{shareClass} Stock</span>
                        </p>

                        <div className="my-16">
                            <p className="text-base uppercase tracking-widest mb-6">In the Company Known As</p>
                            <p className="text-4xl font-black font-sans">B0ASE.COM</p>
                        </div>
                    </div>

                    <div className="mt-24 flex justify-between items-end relative z-10 px-12">
                        <div className="text-center">
                            <div className="text-lg font-mono mb-2">{new Date().toLocaleDateString()}</div>
                            <div className="w-64 border-t-2 border-black pt-2 text-sm uppercase tracking-widest">Date Issued</div>
                        </div>

                        <div className="text-center">
                            <div className="h-24 flex items-end justify-center mb-2">
                                {selectedSignature && (
                                    <div className="w-full transform scale-150 origin-bottom">
                                        {/* We can reproduce the signature image manually to strictly control print rendering */}
                                        {selectedSignature.signature_type === 'upload' && selectedSignature.image_data ? (
                                            <img src={selectedSignature.image_data} className="h-20 object-contain" alt="Signature" />
                                        ) : selectedSignature.signature_type === 'drawn' && selectedSignature.svg_data ? (
                                            <div dangerouslySetInnerHTML={{ __html: selectedSignature.svg_data }} className="h-20 w-auto" />
                                        ) : (
                                            <div className="font-script text-3xl">{selectedSignature.typed_text}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="w-80 border-t-2 border-black pt-2 text-sm uppercase tracking-widest">Authorized Signature</div>
                        </div>
                    </div>

                    <div className="absolute top-10 right-10 font-mono text-lg text-red-600 font-bold bg-white px-4 py-1 border border-red-600">
                        No. {serialNumber}
                    </div>
                </div>
            </div>
        </div>
    );
}
