'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function VerifyCertificatePage() {
    const [serialNumber, setSerialNumber] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (serialNumber.trim()) {
            router.push(`/tools/bit-certificates/verify/${serialNumber.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <Link
                href="/tools/bit-certificates"
                className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 transition-colors"
            >
                <FiArrowLeft /> Back to Registry
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 mb-6 border border-zinc-800">
                        <FiShield size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Verify Certificate</h1>
                    <p className="text-zinc-400">Enter the Certificate Serial Number or ID</p>
                </div>

                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="e.g. BC-2024-001"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-6 py-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md px-4 flex items-center justify-center transition-colors"
                    >
                        <FiSearch size={20} />
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-zinc-500">
                    BitCertificates provide immutable proof of ownership anchored on the Bitcoin blockchain.
                </p>
            </motion.div>
        </div>
    );
}
