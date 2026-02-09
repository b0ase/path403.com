'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiPackage, FiInfo, FiCheck, FiActivity, FiShield, FiLock, FiGlobe } from 'react-icons/fi';
import { portfolioData } from '@/lib/data';

interface InvestmentTerminalProps {
    onInvest: (packageId: string, amount: number) => void;
}

type Tab = 'invest' | 'market' | 'governance';

export default function InvestmentTerminal({ onInvest }: InvestmentTerminalProps) {
    const { investmentPackages, about } = portfolioData;
    const [activeTab, setActiveTab] = useState<Tab>('invest');
    const [selectedPackage, setSelectedPackage] = useState<string | null>(investmentPackages[1]?.id || investmentPackages[0]?.id);

    // Modal States
    const [showKycModal, setShowKycModal] = useState(false);
    const [showStakingModal, setShowStakingModal] = useState(false);
    const [kycMessage, setKycMessage] = useState('');

    const currentPackage = investmentPackages.find(p => p.id === selectedPackage);

    const handleKycSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setKycMessage('Documents uploaded! (This is a demo, no real upload performed.)');
        setTimeout(() => {
            setShowKycModal(false);
            setKycMessage('');
        }, 2000);
    };

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 md:p-8 h-full flex flex-col relative overflow-hidden">

            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                    {activeTab === 'invest' && <FiTrendingUp className="text-blue-500" />}
                    {activeTab === 'market' && <FiActivity className="text-purple-500" />}
                    {activeTab === 'governance' && <FiShield className="text-gray-500" />}

                    {activeTab === 'invest' && 'Strategic Portal'}
                    {activeTab === 'market' && 'Network Depth'}
                    {activeTab === 'governance' && 'Access Control'}
                </h2>

                <div className="flex bg-black/60 p-1 border border-gray-800">
                    <button
                        onClick={() => setActiveTab('invest')}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'invest' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        Portal
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'market' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        Market
                    </button>
                    <button
                        onClick={() => setActiveTab('governance')}
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'governance' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        Access
                    </button>
                </div>
            </div>

            {/* KYC Warning Banner */}
            <div className="mb-8 p-4 bg-blue-900/20 border border-blue-800/50 flex items-center gap-4">
                <FiLock className="text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-loose">
                    KYC MANDATORY: Final token allocation requires identity verification. Proceed with strategic intent.
                </p>
            </div>

            {/* Content Area */}
            <div className="flex-grow relative">
                <AnimatePresence mode="wait">

                    {/* INVEST TAB */}
                    {activeTab === 'invest' && (
                        <motion.div
                            key="invest"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="h-full flex flex-col"
                        >
                            <div className="grid grid-cols-1 gap-4 mb-8 flex-grow overflow-y-auto max-h-[400px] md:max-h-none pr-2 custom-scrollbar">
                                {investmentPackages.map((pkg) => (
                                    <motion.button
                                        key={pkg.id}
                                        onClick={() => setSelectedPackage(pkg.id)}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className={`relative w-full text-left p-6 border-2 transition-all duration-200 group ${selectedPackage === pkg.id
                                            ? 'border-white bg-white/5'
                                            : 'border-gray-800 bg-black/40 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className={`font-black text-sm uppercase tracking-widest ${selectedPackage === pkg.id ? 'text-white' : 'text-gray-500'}`}>
                                                {pkg.name}
                                            </h3>
                                            <span className="font-mono text-white font-bold text-sm tracking-tighter">${pkg.price}</span>
                                        </div>

                                        <p className="text-[10px] text-gray-400 mb-4 line-clamp-2 uppercase tracking-widest leading-relaxed">
                                            {pkg.name.toLowerCase().includes('whale') ? 'Institutional scale participation and priority network access.' : 'Strategic ecosystem positioning and core diagnostic rights.'}
                                        </p>

                                        {selectedPackage === pkg.id && (
                                            <div className="absolute top-6 right-6 text-white">
                                                <FiCheck size={16} />
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="border-t border-gray-800 pt-8 mt-auto">
                                {currentPackage && (
                                    <div className="space-y-6">
                                        <button
                                            onClick={() => setShowKycModal(true)}
                                            className="w-full py-5 bg-white !text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-gray-200 transition-all transform active:scale-95 flex items-center justify-center gap-4"
                                        >
                                            <FiShield />
                                            REQUEST ALLOCATION (KYC REQUIRED)
                                        </button>

                                        <p className="text-[8px] text-center text-gray-600 uppercase tracking-widest leading-loose">
                                            Verification portal powered by institutional security standards. No funds will be taken before audit.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* MARKET TAB */}
                    {activeTab === 'market' && (
                        <motion.div
                            key="market"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full"
                        >
                            <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-gray-800 bg-black">
                                {about.token.marketLink ? (
                                    <iframe
                                        src={about.token.marketLink}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none' }}
                                        title="1Sat Market"
                                        className="w-full h-full"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Market Data Unavailable
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex justify-end">
                                <a
                                    href={about.token.marketLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                    Open in New Tab <FiGlobe />
                                </a>
                            </div>
                        </motion.div>
                    )}

                    {/* GOVERNANCE TAB */}
                    {activeTab === 'governance' && (
                        <motion.div
                            key="governance"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="h-full flex flex-col justify-center space-y-6"
                        >
                            <div className="p-6 bg-black/30 border border-gray-800 rounded-lg">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <FiShield className="text-green-500" /> KYC Verification
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Verified investors gain access to higher tier packages and voting rights.
                                </p>
                                <button
                                    onClick={() => setShowKycModal(true)}
                                    className="w-full py-3 border border-gray-600 hover:border-white text-gray-300 hover:text-white font-semibold rounded-lg transition-colors"
                                >
                                    Start Verification
                                </button>
                            </div>

                            <div className="p-6 bg-black/30 border border-gray-800 rounded-lg">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <FiLock className="text-blue-500" /> Staking Vault
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Stake $BOASE to earn dividends from the ecosystem revenue.
                                </p>
                                <button
                                    onClick={() => setShowStakingModal(true)}
                                    className="w-full py-3 border border-gray-600 hover:border-white text-gray-300 hover:text-white font-semibold rounded-lg transition-colors"
                                >
                                    Open Vault (Coming Soon)
                                </button>
                            </div>

                            <div className="text-center text-xs text-gray-500 mt-auto">
                                Governance Token: <span className="text-white font-mono">$BOASE</span> (BSV21)
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* MODALS */}
            {showKycModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-sm w-full relative">
                        <button
                            onClick={() => setShowKycModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            &times;
                        </button>
                        <h2 className="text-lg font-bold mb-4 text-white">KYC Verification</h2>
                        <form onSubmit={handleKycSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-xs mb-1">ID Document</label>
                                <input type="file" className="w-full text-xs text-gray-300 bg-black/50 p-2 rounded border border-gray-800" required />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-sm"
                            >
                                Submit Documents
                            </button>
                            {kycMessage && <p className="text-green-400 text-xs text-center">{kycMessage}</p>}
                        </form>
                    </div>
                </div>
            )}

            {showStakingModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg max-w-sm w-full relative text-center">
                        <button
                            onClick={() => setShowStakingModal(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-white"
                        >
                            &times;
                        </button>
                        <FiLock className="mx-auto text-4xl text-yellow-500 mb-4" />
                        <h2 className="text-lg font-bold mb-2 text-white">Staking Coming Soon</h2>
                        <p className="text-gray-400 text-sm mb-4">
                            The Staking Vault is currently under audit. Check back shortly for yield opportunities.
                        </p>
                        <button
                            onClick={() => setShowStakingModal(false)}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
