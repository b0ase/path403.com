'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCamera, FiUpload, FiLock, FiShield, FiCheck, FiCpu, FiFileText, FiLink } from 'react-icons/fi';
import { tokeniseIdAction } from '@/app/actions/tokenise-id';
import { useYoursWallet } from 'yours-wallet-provider';

export default function IDTokeniserPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [statusStep, setStatusStep] = useState<string>('');

    // Wallet Integration
    const wallet = useYoursWallet();
    const [walletAddress, setWalletAddress] = useState<string | null>(null);

    useEffect(() => {
        if (wallet?.isReady) {
            wallet.isConnected().then((connected: boolean) => {
                if (connected) {
                    wallet.getAddresses().then((addrs: any) => {
                        if (addrs) setWalletAddress(addrs.bsvAddress);
                    });
                }
            });
        }
    }, [wallet?.isReady]);

    const connectWallet = async () => {
        if (!wallet || !wallet.isReady) {
            window.open('https://yours.org', '_blank');
            return;
        }
        try {
            await wallet.connect();
            const addrs = await wallet.getAddresses();
            if (addrs) setWalletAddress(addrs.bsvAddress);
        } catch (e) {
            console.error(e);
            setError('Failed to connect wallet');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    // Client-Side Encryption (AES-GCM)
    const encryptFile = async (file: File, password: string): Promise<string> => {
        const enc = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            enc.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: enc.encode("b0ase-id-salt"), // Fixed salt for simplicity, ideally random
                iterations: 100000,
                hash: "SHA-256",
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const fileBuffer = await file.arrayBuffer();

        const encryptedContent = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            key,
            fileBuffer
        );

        // Combine IV + Encrypted Data
        const combined = new Uint8Array(iv.length + new Uint8Array(encryptedContent).length);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedContent), iv.length);

        // Convert to Base64
        let binary = '';
        const len = combined.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(combined[i]);
        }
        return window.btoa(binary);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return setError('Please select an ID document');
        if (!walletAddress) return setError('Please connect your wallet');
        if (!password || password.length < 8) return setError('Please enter a strong encryption password (min 8 chars)');

        setIsProcessing(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('address', walletAddress);

        try {
            // 1. Client-Side Encryption
            setStatusStep('Encrypting Locally (Zero Knowledge)...');
            const encryptedBase64 = await encryptFile(file, password);
            formData.append('encryptedBase64', encryptedBase64);

            // 2. Fetch UTXOs
            setStatusStep('Fetching Wallet UTXOs...');
            const utxos = await wallet.getPaymentUtxos();
            if (!utxos || utxos.length === 0) {
                throw new Error('Insufficient funds in wallet to pay for inscription');
            }
            formData.append('utxos', JSON.stringify(utxos));

            // 3. Prepare Transactions (Server)
            setStatusStep('Preparing Transactions...');
            const resp = await tokeniseIdAction(formData);

            if (!resp.success) {
                throw new Error(resp.error as string);
            }

            const { inscriptionTxHex, tokenTxHex, encryptedHash, symbol, tokenId, inscriptionTxid } = resp.data;

            // 4. Sign & Broadcast Inscription
            setStatusStep('Please Sign Inscription Transaction...');
            const signedInscription = await wallet.signTransaction({ txHex: inscriptionTxHex });
            if (!signedInscription || !signedInscription.txHex) throw new Error('Failed to sign inscription');

            setStatusStep('Broadcasting Inscription...');
            const broadcast1 = await wallet.broadcast({ txHex: signedInscription.txHex });

            // 5. Sign & Broadcast Token Deployment
            if (tokenTxHex) {
                setStatusStep('Please Sign Token Deployment...');
                const signedToken = await wallet.signTransaction({ txHex: tokenTxHex });
                if (!signedToken || !signedToken.txHex) throw new Error('Failed to sign token deployment');

                setStatusStep('Broadcasting Token...');
                const broadcast2 = await wallet.broadcast({ txHex: signedToken.txHex });

                setResult({
                    encryptedHash,
                    symbol,
                    inscriptionTxid: broadcast1,
                    tokenId: `${broadcast2}_0`
                });
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsProcessing(false);
            setStatusStep('');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
            <div className="max-w-pillar mx-auto px-4 py-16">

                {/* Header */}
                <header className="mb-16 border-b border-zinc-900 pb-8 flex items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            ID Tokeniser / Zero Knowledge
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
                            IDENTITY<span className="text-zinc-800">.SYS</span>
                        </h1>
                        <p className="text-zinc-500 max-w-lg">
                            <b>Zero Knowledge Privacy.</b> We do not see your ID. You encrypt it locally, sign the proof, and mint the token yourself.
                        </p>
                    </div>
                    <FiShield className="text-6xl text-zinc-900" />
                </header>

                <div className="grid md:grid-cols-2 gap-12">

                    {/* Form Section */}
                    <div>
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* File Input */}
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="hidden"
                                />

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed border-zinc-800 p-8 text-center cursor-pointer transition-colors hover:border-white hover:bg-zinc-900/50 h-64 flex flex-col items-center justify-center relative overflow-hidden rounded-pillar ${file ? 'border-green-900 bg-green-900/10' : ''}`}
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-zinc-900 rounded-pillar flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <FiCamera className="text-2xl" />
                                            </div>
                                            <p className="font-bold text-sm mb-1">UPLOAD DOCUMENT</p>
                                            <p className="text-xs text-zinc-600">JPG, PNG, PDF (Max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <FiLock /> Encryption Password (Required)
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter a strong password..."
                                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm focus:outline-none focus:border-white transition-colors rounded-pillar"
                                />
                                <p className="text-[10px] text-zinc-500">
                                    IMPORTANT: This password encrypts your file locally. If you lose it, the inscribed data is unrecoverable.
                                </p>
                            </div>

                            {/* Wallet Connection */}
                            <div className="border border-zinc-800 p-4 bg-zinc-950 rounded-pillar">
                                {!walletAddress ? (
                                    <button
                                        type="button"
                                        onClick={connectWallet}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 rounded-pillar"
                                    >
                                        <FiLink /> Connect Yours Wallet
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 uppercase tracking-widest">Connected Wallet</span>
                                        <span className="font-mono text-green-500">{walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isProcessing || !file || !walletAddress || !password}
                                className={`w-full py-4 font-bold uppercase tracking-widest text-sm transition-all rounded-pillar ${isProcessing || !file || !walletAddress || !password ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}
                            >
                                {isProcessing ? 'PROCESSING...' : 'ENCRYPT & MINT'}
                            </button>

                            {error && (
                                <div className="p-4 border border-red-900 bg-red-950/20 text-red-500 text-xs font-mono rounded-pillar">
                                    ERROR: {error}
                                </div>
                            )}

                        </form>
                    </div>

                    {/* Status/Output Section */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest border-b border-zinc-900 pb-2 mb-4">
                            SYSTEM OUTPUT
                        </h3>

                        {!result && !isProcessing && (
                            <div className="h-64 flex items-center justify-center text-zinc-800 text-xs">
                                WAITING FOR AUTH...
                            </div>
                        )}

                        {isProcessing && (
                            <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col items-center justify-center h-64 gap-4 animate-pulse rounded-pillar">
                                <div className="w-12 h-12 border-4 border-t-white border-zinc-800 rounded-full animate-spin"></div>
                                <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">{statusStep}</p>
                                <p className="text-[10px] text-zinc-600 max-w-xs text-center">Processing in browser & signing via wallet</p>
                            </div>
                        )}

                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 bg-zinc-900/30 p-6 border border-zinc-800 rounded-pillar"
                            >
                                <div className="flex items-center gap-2 text-green-500 mb-4">
                                    <FiCheck className="text-xl" />
                                    <span className="font-bold">IDENTITY TOKENISED</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-zinc-500 block">Token Symbol</label>
                                    <div className="font-mono text-lg">{result.symbol}</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-zinc-500 block">Encrypted Hash</label>
                                    <div className="font-mono text-xs break-all bg-black p-2 border border-zinc-800 text-zinc-400 rounded-pillar">
                                        {result.encryptedHash}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500 block">Inscription TX</label>
                                        <a href={`https://whatsonchain.com/tx/${result.inscriptionTxid}`} target="_blank" className="text-xs underline hover:text-white truncate block">
                                            View Proof →
                                        </a>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500 block">Token ID</label>
                                        <a href={`https://ordinals.gorillapool.io/api/bsv20/${result.tokenId}`} target="_blank" className="text-xs underline hover:text-white truncate block">
                                            {result.tokenId.substring(0, 12)}...
                                        </a>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-zinc-800 mt-4">
                                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                                        This identity has been inscribed (encrypted) and signed by YOU. The token represents your key to this identity.
                                    </p>
                                </div>

                            </motion.div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
