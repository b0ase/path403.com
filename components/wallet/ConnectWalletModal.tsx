'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, WalletProviderType } from '@/contexts/WalletProvider';
import { BsWallet2, BsX } from 'react-icons/bs';
import { SiSolana, SiEthereum } from 'react-icons/si';

interface ConnectWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
    const { connect, isConnecting, error } = useWallet();

    const handleConnect = async (provider: WalletProviderType) => {
        await connect(provider);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={onClose}>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-6 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BsWallet2 className="text-blue-400" />
                            Connect Wallet
                        </h2>
                        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                            <BsX size={24} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Yours Wallet */}
                        <button
                            onClick={() => handleConnect('yours')}
                            disabled={isConnecting}
                            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-blue-500/50 rounded-lg transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    {/* Fallback Icon for Yours */}
                                    <span className="text-blue-500 font-bold">Y</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-medium group-hover:text-blue-400 transition-colors">Yours Wallet</div>
                                    <div className="text-xs text-zinc-500">Bitcoin SV (BSV)</div>
                                </div>
                            </div>
                        </button>

                        {/* HandCash */}
                        <button
                            onClick={() => handleConnect('handcash')}
                            disabled={isConnecting}
                            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-green-500/50 rounded-lg transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <span className="text-green-500 font-bold">H</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-medium group-hover:text-green-400 transition-colors">HandCash</div>
                                    <div className="text-xs text-zinc-500">Bitcoin SV (BSV)</div>
                                </div>
                            </div>
                        </button>

                        {/* Phantom */}
                        <button
                            onClick={() => handleConnect('phantom')}
                            disabled={isConnecting}
                            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-purple-500/50 rounded-lg transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                                    <SiSolana className="text-purple-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-medium group-hover:text-purple-400 transition-colors">Phantom</div>
                                    <div className="text-xs text-zinc-500">Solana (SOL)</div>
                                </div>
                            </div>
                        </button>

                        {/* MetaMask */}
                        <button
                            onClick={() => handleConnect('metamask')}
                            disabled={isConnecting}
                            className="w-full flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-orange-500/50 rounded-lg transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                    <SiEthereum className="text-orange-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-white font-medium group-hover:text-orange-400 transition-colors">MetaMask</div>
                                    <div className="text-xs text-zinc-500">Ethereum (EVM)</div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
