'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiBox, FiArrowRight, FiCopy, FiCheck, FiAlertCircle, FiLoader, FiRefreshCw } from 'react-icons/fi';

type BroadcasterType = 'onesat' | 'woc' | 'custom';
type TabType = 'broadcast' | 'deploy' | 'transfer' | 'utxo';

interface BroadcastResult {
    success: boolean;
    txid?: string;
    error?: string;
}

export default function TxBroadcasterPage() {
    const [activeTab, setActiveTab] = useState<TabType>('broadcast');
    const [broadcasterType, setBroadcasterType] = useState<BroadcasterType>('onesat');
    const [customEndpoint, setCustomEndpoint] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BroadcastResult | null>(null);
    const [copied, setCopied] = useState(false);

    // Broadcast tab state
    const [rawTx, setRawTx] = useState('');

    // Deploy tab state
    const [tokenSymbol, setTokenSymbol] = useState('');
    const [totalSupply, setTotalSupply] = useState('');
    const [decimals, setDecimals] = useState('0');
    const [privateKeyWif, setPrivateKeyWif] = useState('');
    const [destinationAddress, setDestinationAddress] = useState('');

    // Transfer tab state
    const [tokenId, setTokenId] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [transferPrivateKey, setTransferPrivateKey] = useState('');

    // UTXO tab state
    const [utxoAddress, setUtxoAddress] = useState('');
    const [utxoTokenId, setUtxoTokenId] = useState('');
    const [utxos, setUtxos] = useState<any[]>([]);

    const tabs: { id: TabType; label: string; icon: typeof FiSend }[] = [
        { id: 'broadcast', label: 'Broadcast TX', icon: FiSend },
        { id: 'deploy', label: 'Deploy Token', icon: FiBox },
        { id: 'transfer', label: 'Transfer', icon: FiArrowRight },
        { id: 'utxo', label: 'UTXOs', icon: FiRefreshCw },
    ];

    const handleBroadcast = async () => {
        if (!rawTx.trim()) {
            setResult({ success: false, error: 'Please enter a raw transaction hex' });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/tx-broadcaster/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rawTx: rawTx.trim(),
                    broadcasterType,
                    customEndpoint: broadcasterType === 'custom' ? customEndpoint : undefined,
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: 'Failed to broadcast transaction' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeploy = async () => {
        if (!tokenSymbol || !totalSupply || !privateKeyWif || !destinationAddress) {
            setResult({ success: false, error: 'Please fill in all required fields' });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/tx-broadcaster/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: tokenSymbol,
                    totalSupply: parseInt(totalSupply),
                    decimals: parseInt(decimals),
                    privateKeyWif,
                    destinationAddress,
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: 'Failed to deploy token' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!tokenId || !transferAmount || !recipientAddress || !transferPrivateKey) {
            setResult({ success: false, error: 'Please fill in all required fields' });
            return;
        }

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/tx-broadcaster/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokenId,
                    amount: parseInt(transferAmount),
                    recipientAddress,
                    privateKeyWif: transferPrivateKey,
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ success: false, error: 'Failed to transfer tokens' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchUtxos = async () => {
        if (!utxoAddress) {
            setResult({ success: false, error: 'Please enter an address' });
            return;
        }

        setIsLoading(true);
        setResult(null);
        setUtxos([]);

        try {
            const params = new URLSearchParams({ address: utxoAddress });
            if (utxoTokenId) params.append('tokenId', utxoTokenId);

            const response = await fetch(`/api/tx-broadcaster/utxos?${params}`);
            const data = await response.json();

            if (data.success) {
                setUtxos(data.utxos || []);
                setResult({ success: true, txid: `Found ${data.utxos?.length || 0} UTXOs` });
            } else {
                setResult(data);
            }
        } catch (error) {
            setResult({ success: false, error: 'Failed to fetch UTXOs' });
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
            <div className="max-w-pillar mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12">
                    <div className="bg-zinc-950/50 p-4 md:p-6 border border-zinc-900 rounded-pillar self-start">
                        <FiSend className="text-4xl md:text-6xl text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-2">
                            BROADCASTER<span className="text-zinc-800">.SYS</span>
                        </h1>
                        <p className="text-zinc-500 uppercase text-xs tracking-widest">Transaction Propagation / Network Injection Unit</p>
                    </div>
                </div>

                {/* Broadcaster Selection */}
                <div className="mb-12 p-8 border border-zinc-900 bg-zinc-950/40 rounded-pillar">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-6 border-b border-zinc-900 pb-2">
                        NETWORK_CONFIGURATION
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { id: 'onesat', label: '1SAT_ORDINALS' },
                            { id: 'woc', label: 'WOC_GATEWAY' },
                            { id: 'custom', label: 'CUSTOM_NODE' },
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setBroadcasterType(option.id as BroadcasterType)}
                                className={`px-6 py-3 rounded-pillar text-[10px] font-bold uppercase tracking-widest transition-all ${broadcasterType === option.id
                                    ? 'bg-white text-black'
                                    : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {broadcasterType === 'custom' && (
                        <div className="mt-6">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-800 mb-2">ENDPOINT_URI</label>
                            <input
                                type="text"
                                value={customEndpoint}
                                onChange={(e) => setCustomEndpoint(e.target.value)}
                                placeholder="PROTOCOL://HYPERSPACE_URI"
                                className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm focus:border-white outline-none transition-colors"
                            />
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-12 border-b border-zinc-900 pb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                {
                                    setActiveTab(tab.id);
                                    setResult(null);
                                }
                            }}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-pillar text-[10px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-black'
                                : 'text-zinc-600 hover:text-white'
                                }`}
                        >
                            <tab.icon size={14} />
                            {tab.label.replace(' ', '_')}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Broadcast Tab */}
                    {activeTab === 'broadcast' && (
                        <div className="space-y-8 bg-zinc-950/20 p-8 border border-zinc-900 rounded-pillar">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">RAW_TX_HEX</label>
                                <textarea
                                    value={rawTx}
                                    onChange={(e) => setRawTx(e.target.value)}
                                    placeholder="INPUT_HEX_STREAM_HERE..."
                                    rows={8}
                                    className="w-full px-5 py-4 bg-black border border-zinc-900 rounded-pillar font-mono text-sm focus:border-white outline-none transition-colors resize-none text-white placeholder:text-zinc-800"
                                />
                            </div>
                            <button
                                onClick={handleBroadcast}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-pillar font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 w-full md:w-auto"
                            >
                                {isLoading ? <FiLoader className="animate-spin" /> : <FiSend />}
                                EXECUTE_BROADCAST_SEQUENCE
                            </button>
                        </div>
                    )}

                    {/* Deploy Tab */}
                    {activeTab === 'deploy' && (
                        <div className="space-y-8 bg-zinc-950/20 p-8 border border-zinc-900 rounded-pillar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">TOKEN_SYMBOL</label>
                                    <input
                                        type="text"
                                        value={tokenSymbol}
                                        onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                                        placeholder="TICKER_ID"
                                        className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm focus:border-white outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">TOTAL_SUPPLY</label>
                                    <input
                                        type="number"
                                        value={totalSupply}
                                        onChange={(e) => setTotalSupply(e.target.value)}
                                        placeholder="QUANTITY_INTEGER"
                                        className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm focus:border-white outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">DECIMAL_PRECISION</label>
                                <input
                                    type="number"
                                    value={decimals}
                                    onChange={(e) => setDecimals(e.target.value)}
                                    placeholder="0-18"
                                    min="0"
                                    max="18"
                                    className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm focus:border-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">PRIVATE_KEY_WIF</label>
                                <input
                                    type="password"
                                    value={privateKeyWif}
                                    onChange={(e) => setPrivateKeyWif(e.target.value)}
                                    placeholder="AUTH_CREDENTIAL_ENCRYPTED"
                                    className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm focus:border-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">DESTINATION_ADDR</label>
                                <input
                                    type="text"
                                    value={destinationAddress}
                                    onChange={(e) => setDestinationAddress(e.target.value)}
                                    placeholder="BSV_ADDR_TARGET"
                                    className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm focus:border-white outline-none"
                                />
                            </div>
                            <button
                                onClick={handleDeploy}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-pillar font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 w-full md:w-auto"
                            >
                                {isLoading ? <FiLoader className="animate-spin" /> : <FiBox />}
                                INITIALIZE_DEPLOYMENT
                            </button>
                        </div>
                    )}

                    {/* Transfer Tab */}
                    {activeTab === 'transfer' && (
                        <div className="space-y-8 bg-zinc-950/20 p-8 border border-zinc-900 rounded-pillar">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">TOKEN_IDENTIFIER</label>
                                <input
                                    type="text"
                                    value={tokenId}
                                    onChange={(e) => setTokenId(e.target.value)}
                                    placeholder="TXID_VOUT_SPEC"
                                    className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">QUANTITY</label>
                                    <input
                                        type="number"
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        placeholder="UNIT_COUNT"
                                        className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">RECIPIENT_ADDR</label>
                                    <input
                                        type="text"
                                        value={recipientAddress}
                                        onChange={(e) => setRecipientAddress(e.target.value)}
                                        placeholder="TARGET_BSV_ADDR"
                                        className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">PRIVATE_KEY_WIF</label>
                                <input
                                    type="password"
                                    value={transferPrivateKey}
                                    onChange={(e) => setTransferPrivateKey(e.target.value)}
                                    placeholder="AUTH_CREDENTIAL_ENCRYPTED"
                                    className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm"
                                />
                            </div>
                            <button
                                onClick={handleTransfer}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-pillar font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 w-full md:w-auto"
                            >
                                {isLoading ? <FiLoader className="animate-spin" /> : <FiArrowRight />}
                                EXECUTE_TRANSFER_PROTOCOL
                            </button>
                        </div>
                    )}

                    {/* UTXO Tab */}
                    {activeTab === 'utxo' && (
                        <div className="space-y-8 bg-zinc-950/20 p-8 border border-zinc-900 rounded-pillar">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">SOURCE_ADDR</label>
                                <input
                                    type="text"
                                    value={utxoAddress}
                                    onChange={(e) => setUtxoAddress(e.target.value)}
                                    placeholder="BSV_ADDR_QUERY"
                                    className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">ASSET_ID_FILTER</label>
                                <input
                                    type="text"
                                    value={utxoTokenId}
                                    onChange={(e) => setUtxoTokenId(e.target.value)}
                                    placeholder="OPTIONAL_TXID_SPEC"
                                    className="w-full px-5 py-3 bg-black border border-zinc-900 rounded-pillar text-white text-sm"
                                />
                            </div>
                            <button
                                onClick={handleFetchUtxos}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-pillar font-black text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all disabled:opacity-50 w-full md:w-auto"
                            >
                                {isLoading ? <FiLoader className="animate-spin" /> : <FiRefreshCw />}
                                SCAN_NETWORK_UTXOS
                            </button>

                            {/* UTXO Results */}
                            {utxos.length > 0 && (
                                <div className="mt-12 pt-12 border-t border-zinc-900">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">UNIT_RECORDS_FOUND: {utxos.length}</h3>
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {utxos.map((utxo, idx) => (
                                            <div
                                                key={idx}
                                                className="p-5 bg-black border border-zinc-900 rounded-pillar font-mono text-[10px] hover:border-zinc-700 transition-colors"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-zinc-600 font-bold uppercase">TXID:</span>
                                                    <span className="text-zinc-300 break-all ml-4 text-right selection:bg-white selection:text-black">{utxo.txid}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-zinc-600 font-bold uppercase">INDEX:</span>
                                                    <span className="text-white">{utxo.vout}</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-zinc-600 font-bold uppercase">SATS:</span>
                                                    <span className="text-white">{utxo.satoshis?.toLocaleString()}</span>
                                                </div>
                                                {utxo.amt && (
                                                    <div className="flex justify-between">
                                                        <span className="text-zinc-600 font-bold uppercase">TOKENS:</span>
                                                        <span className="text-white">{utxo.amt?.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Result Display */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mt-12 p-8 rounded-pillar border ${result.success
                            ? 'bg-zinc-950 border-white'
                            : 'bg-zinc-950 border-red-900'
                            }`}
                    >
                        <div className="flex items-start gap-6">
                            <div className={`p-4 rounded-pillar ${result.success ? 'bg-white' : 'bg-red-900'}`}>
                                {result.success ? (
                                    <FiCheck size={24} className="text-black" />
                                ) : (
                                    <FiAlertCircle size={24} className="text-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">
                                    {result.success ? 'SEQUENCE_SUCCESSFUL' : 'SEQUENCE_ABORTED'}
                                </p>
                                <p className={`text-xl font-black uppercase tracking-tighter ${result.success ? 'text-white' : 'text-red-500'}`}>
                                    {result.success ? 'TRANSACTION_PROPAGATED' : 'PROTOCOL_ERROR'}
                                </p>
                                {result.txid && (
                                    <div className="mt-6 p-4 bg-black border border-zinc-900 rounded-pillar flex items-center justify-between gap-4">
                                        <code className="text-[10px] font-bold text-zinc-400 break-all selection:bg-white selection:text-black">
                                            {result.txid}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(result.txid!)}
                                            className="text-white hover:scale-110 transition-transform flex-shrink-0"
                                        >
                                            {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
                                        </button>
                                    </div>
                                )}
                                {result.error && (
                                    <p className="text-sm font-bold text-red-500 mt-4 uppercase tracking-widest">[{result.error}]</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Security Notice */}
                <div className="mt-24 p-8 bg-zinc-950/20 border border-zinc-900 rounded-pillar relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <FiAlertCircle size={48} className="text-zinc-800" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-4 border-b border-zinc-900 pb-2">
                            SECURITY_PROTOCOL_NOTICE
                        </p>
                        <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                            ALL_CRYPTOGRAPHIC_OPERATIONS_CLIENT_SIDE. ZERO_SERVER_KEY_RETENTION.
                            VERIFY_SPEC_BEFORE_NETWORK_INJECTION. USE_TESTNET_FOR_EXPERIMENTAL_DEPLOYMENTS.
                        </p>
                    </div>
                </div>

                {/* Documentation Link */}
                <div className="mt-8 text-center">
                    <a
                        href="https://www.npmjs.com/package/@bitcoin-apps-suite/transaction-broadcaster"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                    >
                        POWERED_BY_BITCOIN_APPS_SUITE_BROADCASTER →
                    </a>
                </div>
            </div>
        </div>
    );
}
