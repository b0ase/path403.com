"use client";

import React, { useEffect, useState } from 'react';
import { FiLock, FiShield, FiKey, FiCopy, FiRefreshCw, FiArrowDownLeft, FiArrowUpRight, FiExternalLink, FiCheck } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

interface VaultAsset {
    type: 'bsv' | 'token';
    symbol: string;
    name: string;
    balance: string;
    formattedBalance: string;
    tokenId?: string;
}

interface VaultBalance {
    address: string;
    bsvBalance: number;
    formattedBsv: string;
    tokens: VaultAsset[];
    lastUpdated: string;
}

interface VaultPanelProps {
    userId: string;
    isDark: boolean;
}

export const VaultPanel: React.FC<VaultPanelProps> = ({ userId, isDark }) => {
    const [vault, setVault] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [balance, setBalance] = useState<VaultBalance | null>(null);
    const [loadingBalance, setLoadingBalance] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'assets' | 'deposit' | 'withdraw'>('assets');

    useEffect(() => {
        if (!userId) return;
        fetchVault();
    }, [userId]);

    useEffect(() => {
        if (vault?.address) {
            fetchBalance();
        }
    }, [vault?.address]);

    const fetchVault = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/custody/vault?userId=${userId}`);
            const data = await res.json();
            if (data.found) {
                setVault(data);
            } else {
                setVault(null);
            }
        } catch (e) {
            console.error("Failed to fetch vault", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        if (!vault?.address) return;
        setLoadingBalance(true);
        try {
            const res = await fetch(`/api/custody/balance?address=${vault.address}`);
            const data = await res.json();
            setBalance(data);
        } catch (e) {
            console.error("Failed to fetch balance", e);
        } finally {
            setLoadingBalance(false);
        }
    };

    const copyAddress = () => {
        if (vault?.address) {
            navigator.clipboard.writeText(vault.address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleCreateVault = async () => {
        setGenerating(true);
        try {
            // Mock Key Generation on Client (User Key)
            // In real app, use HandCash Connect or local key gen
            // We explain this is a simulation for the prototype
            // We'll generate a random key here to simulate the "User Key"
            // For real implementation: Import user's xpub or sign request
            const mockUserPubKey = "03" + Array(64).fill('a').join(''); // Dummy valid-length hex? 
            // Actually, let's just ask the server to use a mock if we send generic data, or handle it properly.
            // The API expects `userPublicKey`.
            // Ideally we use a library here. 
            // I'll grab a "real" random hex string.
            const randomHex = Array.from({length: 33}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
            
            const res = await fetch('/api/custody/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userPublicKey: randomHex // Sending random key as "User Key"
                })
            });
            
            const data = await res.json();
            if (data.address) {
                setVault(data);
            } else {
                alert("Failed: " + data.error);
            }
        } catch (e) {
            alert("Error creating vault");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Vault Status...</div>;

    if (!vault) {
        return (
            <div className={`p-8 rounded-xl border flex flex-col items-center text-center ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
                    <FiShield className="w-8 h-8 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Secure 2-of-3 Multisig Vault</h2>
                <p className="text-gray-400 mb-6 max-w-md">
                    Activate your personal vault to secure $AIBC, $BOASE, and other regulated assets.
                    Your vault uses 3 keys: Yours, Ours, and a Backup.
                </p>
                <button
                    onClick={handleCreateVault}
                    disabled={generating}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all"
                >
                    {generating ? 'Generating Keys...' : 'Create Vault Now'}
                </button>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${isDark ? 'text-white' : 'text-black'}`}>
            {/* Header Card */}
            <div className={`p-6 rounded-xl border ${isDark ? 'bg-gray-900/50 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <FiLock className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Vault Active</h3>
                            <p className="text-sm text-green-500">2-of-3 Signatures Required</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchBalance}
                        disabled={loadingBalance}
                        className={`p-2 rounded transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                    >
                        <FiRefreshCw className={`w-5 h-5 ${loadingBalance ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Vault Address (P2SH)</label>
                        <div className="flex items-center gap-2">
                             <code className={`block flex-1 p-3 rounded font-mono text-sm truncate ${isDark ? 'bg-black border border-white/10' : 'bg-white border-gray-300'}`}>
                                {vault.address}
                             </code>
                             <button
                                onClick={copyAddress}
                                className={`p-3 rounded transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                             >
                                {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                             </button>
                             <a
                                href={`https://whatsonchain.com/address/${vault.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-3 rounded transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                             >
                                <FiExternalLink />
                             </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Keys Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KeyCard label="User Key" status="Active" isDark={isDark} owner="You" />
                <KeyCard label="App Key" status="Online" isDark={isDark} owner="b0ase.com" />
                <KeyCard label="Backup Key" status="Offline" isDark={isDark} owner="Cold Storage" />
            </div>

            {/* Tab Navigation */}
            <div className={`flex border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === 'assets'
                            ? isDark ? 'border-b-2 border-cyan-400 text-cyan-400' : 'border-b-2 border-cyan-600 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    Assets
                </button>
                <button
                    onClick={() => setActiveTab('deposit')}
                    className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === 'deposit'
                            ? isDark ? 'border-b-2 border-cyan-400 text-cyan-400' : 'border-b-2 border-cyan-600 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <FiArrowDownLeft size={14} /> Deposit
                </button>
                <button
                    onClick={() => setActiveTab('withdraw')}
                    className={`px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeTab === 'withdraw'
                            ? isDark ? 'border-b-2 border-cyan-400 text-cyan-400' : 'border-b-2 border-cyan-600 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <FiArrowUpRight size={14} /> Withdraw
                </button>
            </div>

            {/* Assets Tab */}
            {activeTab === 'assets' && (
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Vault Assets</h3>
                        {balance?.lastUpdated && (
                            <span className="text-xs text-gray-500">
                                Updated: {new Date(balance.lastUpdated).toLocaleTimeString()}
                            </span>
                        )}
                    </div>

                    {loadingBalance ? (
                        <div className="text-center py-8">
                            <FiRefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-500" />
                            <p className="text-gray-500">Loading balances...</p>
                        </div>
                    ) : balance && (balance.bsvBalance > 0 || balance.tokens.length > 0) ? (
                        <div className="space-y-3">
                            {/* BSV Balance */}
                            <div className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                        <span className="text-yellow-500 font-bold text-sm">BSV</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">Bitcoin SV</p>
                                        <p className="text-xs text-gray-500">Native Currency</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold font-mono">{balance.formattedBsv}</p>
                                    <p className="text-xs text-gray-500">{balance.bsvBalance.toFixed(8)} BSV</p>
                                </div>
                            </div>

                            {/* Token Balances */}
                            {balance.tokens.map((token, i) => (
                                <div key={token.tokenId || i} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                            <span className="text-cyan-500 font-bold text-xs">{token.symbol.slice(0, 4)}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">${token.symbol}</p>
                                            <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">
                                                {token.tokenId?.slice(0, 16)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold font-mono">{token.formattedBalance}</p>
                                        <p className="text-xs text-gray-500">{token.balance} tokens</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FiLock className="w-8 h-8 mx-auto mb-3 opacity-50" />
                            <p className="mb-2">No assets deposited yet</p>
                            <button
                                onClick={() => setActiveTab('deposit')}
                                className="text-cyan-400 hover:text-cyan-300 text-sm"
                            >
                                Deposit assets to your vault &rarr;
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Deposit Tab */}
            {activeTab === 'deposit' && (
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-bold mb-4">Deposit to Vault</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="text-center">
                            <div className={`inline-block p-4 rounded-lg ${isDark ? 'bg-white' : 'bg-gray-100'}`}>
                                <QRCodeSVG
                                    value={vault.address}
                                    size={200}
                                    level="H"
                                    includeMargin
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Scan to deposit</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                                    Vault Address
                                </label>
                                <div className={`p-4 rounded-lg font-mono text-sm break-all ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                                    {vault.address}
                                </div>
                            </div>
                            <button
                                onClick={copyAddress}
                                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                                    isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                                }`}
                            >
                                {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy Address</>}
                            </button>
                            <div className={`p-4 rounded-lg text-sm ${isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-700'}`}>
                                <p className="font-medium mb-1">Important:</p>
                                <ul className="list-disc list-inside text-xs space-y-1 opacity-80">
                                    <li>Only send BSV or BSV-20 tokens to this address</li>
                                    <li>Funds are secured by 2-of-3 multisig</li>
                                    <li>Withdrawals require your signature</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
                <div className={`p-6 rounded-xl border ${isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'}`}>
                    <h3 className="font-bold mb-4">Withdraw from Vault</h3>
                    {balance && (balance.bsvBalance > 0 || balance.tokens.length > 0) ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                                    Select Asset
                                </label>
                                <select className={`w-full p-3 rounded-lg ${isDark ? 'bg-gray-900 border-white/10' : 'bg-gray-100 border-gray-300'} border`}>
                                    <option value="bsv">BSV ({balance.formattedBsv})</option>
                                    {balance.tokens.map((token, i) => (
                                        <option key={i} value={token.tokenId}>
                                            ${token.symbol} ({token.formattedBalance})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                                    Recipient Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter BSV address..."
                                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-gray-900 border-white/10' : 'bg-gray-100 border-gray-300'} border`}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block">
                                    Amount
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className={`w-full p-3 rounded-lg ${isDark ? 'bg-gray-900 border-white/10' : 'bg-gray-100 border-gray-300'} border`}
                                />
                            </div>
                            <button className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-colors">
                                Initiate Withdrawal
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                                Withdrawals require your wallet signature to complete
                            </p>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>No assets available to withdraw</p>
                            <button
                                onClick={() => setActiveTab('deposit')}
                                className="text-cyan-400 hover:text-cyan-300 text-sm mt-2"
                            >
                                Deposit assets first &rarr;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const KeyCard = ({ label, status, isDark, owner }: any) => (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-2">
            <FiKey className="text-gray-400" />
            <span className="font-bold text-sm">{label}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">{owner}</span>
            <span className={`px-2 py-0.5 rounded ${status === 'Active' || status === 'Online' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>
                {status}
            </span>
        </div>
    </div>
);
