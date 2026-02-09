'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheck, FiCopy, FiExternalLink, FiFileText, FiClock, FiShield, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { useUserHandle } from '@/hooks/useUserHandle';

interface HashResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  hash: string;
  hashedAt: string;
  txid?: string;
  inscribedAt?: string;
}

interface WalletState {
  type: 'none' | 'handcash' | 'yours';
  address?: string;
  displayName?: string;
}

export default function FileHashPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [isInscribing, setIsInscribing] = useState(false);
  const [hashResult, setHashResult] = useState<HashResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wallet state
  const [wallet, setWallet] = useState<WalletState>({ type: 'none' });
  const { handle: handcashHandle } = useUserHandle();

  // Check for connected wallets
  useEffect(() => {
    const checkWallets = async () => {
      // Check HandCash first (via cookie)
      if (handcashHandle) {
        setWallet({
          type: 'handcash',
          displayName: `$${handcashHandle}`,
        });
        return;
      }

      // Check Yours wallet
      if (typeof window !== 'undefined') {
        const yours = (window as any).yours;
        if (yours?.isReady) {
          try {
            const connected = await yours.isConnected();
            if (connected) {
              const addresses = await yours.getAddresses();
              setWallet({
                type: 'yours',
                address: addresses?.bsvAddress,
                displayName: addresses?.bsvAddress ? `${addresses.bsvAddress.slice(0, 8)}...` : 'Yours',
              });
              return;
            }
          } catch (e) {
            console.error('Yours wallet check error:', e);
          }
        }
      }

      setWallet({ type: 'none' });
    };

    checkWallets();
  }, [handcashHandle]);

  const hashFile = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsHashing(true);
    setHashResult(null);

    try {
      const hash = await hashFile(file);

      setHashResult({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
        hash,
        hashedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to hash file. Please try again.');
      console.error('Hash error:', err);
    } finally {
      setIsHashing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  // Connect Yours wallet
  const connectYours = async () => {
    const yours = (window as any).yours;
    if (!yours?.isReady) {
      window.open('https://yours.org', '_blank');
      return;
    }

    try {
      await yours.connect();
      const addresses = await yours.getAddresses();
      setWallet({
        type: 'yours',
        address: addresses?.bsvAddress,
        displayName: addresses?.bsvAddress ? `${addresses.bsvAddress.slice(0, 8)}...` : 'Yours',
      });
    } catch (e) {
      console.error('Yours connect error:', e);
      setError('Failed to connect Yours wallet');
    }
  };

  // Connect HandCash
  const connectHandCash = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `/api/auth/handcash?returnTo=${returnUrl}`;
  };

  // Inscribe using Yours wallet
  const inscribeWithYours = async () => {
    if (!hashResult) return;

    const yours = (window as any).yours;
    if (!yours?.isReady) {
      setError('Yours wallet not available');
      return;
    }

    setIsInscribing(true);
    setError(null);

    try {
      // Create inscription data
      const inscriptionData = JSON.stringify({
        protocol: 'b0ase-file-hash',
        version: '1.0',
        type: 'file_hash',
        hash: hashResult.hash,
        algorithm: 'SHA-256',
        fileName: hashResult.fileName,
        fileSize: hashResult.fileSize,
        fileType: hashResult.fileType,
        hashedAt: hashResult.hashedAt,
        inscribedAt: new Date().toISOString(),
        platform: 'b0ase.com',
      });

      // Send with OP_RETURN data (1 satoshi + inscription data)
      const result = await yours.sendBsv({
        satoshis: 1,
        data: ['b0ase-file-hash', 'application/json', inscriptionData],
      });

      setHashResult(prev => prev ? {
        ...prev,
        txid: result.txid,
        inscribedAt: new Date().toISOString(),
      } : null);

    } catch (err: any) {
      console.error('Yours inscription error:', err);
      setError(err.message || 'Failed to inscribe with Yours wallet');
    } finally {
      setIsInscribing(false);
    }
  };

  // Inscribe using HandCash
  const inscribeWithHandCash = async () => {
    if (!hashResult) return;

    setIsInscribing(true);
    setError(null);

    try {
      // Call HandCash inscription API
      const response = await fetch('/api/file-hash/inscribe-handcash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hash: hashResult.hash,
          fileName: hashResult.fileName,
          fileSize: hashResult.fileSize,
          fileType: hashResult.fileType,
          hashedAt: hashResult.hashedAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to inscribe');
      }

      setHashResult(prev => prev ? {
        ...prev,
        txid: data.txid,
        inscribedAt: new Date().toISOString(),
      } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to inscribe with HandCash');
    } finally {
      setIsInscribing(false);
    }
  };

  // Main inscribe handler
  const inscribeOnChain = async () => {
    if (!hashResult) return;

    if (wallet.type === 'yours') {
      await inscribeWithYours();
    } else if (wallet.type === 'handcash') {
      await inscribeWithHandCash();
    } else {
      setError('Please connect a wallet to inscribe');
    }
  };

  const copyHash = () => {
    if (hashResult?.hash) {
      navigator.clipboard.writeText(hashResult.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/50">
        <div className="max-w-pillar mx-auto px-6 py-8">
          <Link href="/tools" className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest mb-4 inline-block font-bold">
            &larr; Back to Tools
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">
            HASH<span className="text-zinc-800">.SIG</span>
          </h1>
          <p className="text-zinc-500 uppercase text-xs tracking-widest">
            Cryptographic Fingerprint & Ledger Anchor
          </p>
        </div>
      </div>

      <div className="max-w-pillar mx-auto px-6 py-12">
        {/* Wallet Status */}
        <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded-pillar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiShield className={`w-5 h-5 ${wallet.type !== 'none' ? 'text-green-500' : 'text-zinc-600'}`} />
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                  {wallet.type !== 'none' ? `Connected: ${wallet.displayName}` : 'No Wallet Detected'}
                </span>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                  {wallet.type !== 'none'
                    ? 'READY TO INSCRIBE'
                    : 'CONNECT WALLET TO INSCRIBE'}
                </p>
              </div>
            </div>

            {wallet.type === 'none' && (
              <div className="flex gap-2">
                <button
                  onClick={connectYours}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-purple-900/20 text-purple-400 border border-purple-900/50 hover:bg-purple-900/40 transition-colors rounded-pillar"
                >
                  Yours
                </button>
                <button
                  onClick={connectHandCash}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-green-900/20 text-green-400 border border-green-900/50 hover:bg-green-900/40 transition-colors rounded-pillar"
                >
                  HandCash
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border border-dashed p-16 text-center cursor-pointer
            transition-all duration-300 group
            ${isDragging
              ? 'border-green-500 bg-green-500/5'
              : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/20'
            }
            ${isHashing ? 'pointer-events-none opacity-50' : ''}
            rounded-pillar
          `}
        >
          {/* Corner marks */}
          <div className={`absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 transition-colors ${isDragging ? 'border-green-500' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
          <div className={`absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 transition-colors ${isDragging ? 'border-green-500' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
          <div className={`absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 transition-colors ${isDragging ? 'border-green-500' : 'border-zinc-600 group-hover:border-zinc-400'}`} />
          <div className={`absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 transition-colors ${isDragging ? 'border-green-500' : 'border-zinc-600 group-hover:border-zinc-400'}`} />

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <FiUpload className={`w-12 h-12 mx-auto mb-6 ${isDragging ? 'text-green-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
          </motion.div>

          <p className="text-xl font-black uppercase tracking-tight mb-2">
            {isHashing ? 'CALCULATING HASH...' : 'DROP FILE TO HASH'}
          </p>
          <p className="text-xs text-zinc-500 font-mono">
            CLICK TO BROWSE LOCAL FILES
          </p>
          <p className="text-[10px] text-zinc-600 mt-8 uppercase tracking-widest border-t border-zinc-800 inline-block pt-2">
            CLIENT-SIDE PROCESSING // PRIVACY PRESERVED
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-900/10 border border-red-900/30 text-red-500 flex items-center gap-3 font-mono text-xs rounded-pillar"
            >
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="uppercase tracking-wider font-bold">Error:</span> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {hashResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              {/* Hash Card */}
              <div className="bg-zinc-950 border-4 border-double border-zinc-800 overflow-hidden relative rounded-pillar">
                <div className="absolute top-0 left-0 w-8 h-8 border-r border-b border-zinc-800 bg-black flex items-center justify-center text-[10px] text-zinc-500 font-bold font-mono">01</div>

                {/* File Info Header */}
                <div className="p-6 border-b border-zinc-800 mt-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-zinc-900 border border-zinc-800">
                      <FiFileText className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold uppercase tracking-wide truncate text-lg">{hashResult.fileName}</h3>
                      <p className="text-xs text-zinc-500 font-mono uppercase">
                        {formatFileSize(hashResult.fileSize)} // {hashResult.fileType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hash */}
                <div className="p-6 border-b border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">SHA-256 Fingerprint</span>
                    <button
                      onClick={copyHash}
                      className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white transition-colors border border-zinc-800 px-2 py-1 hover:bg-zinc-900 rounded-pillar"
                    >
                      {copied ? <FiCheck className="w-3 h-3" /> : <FiCopy className="w-3 h-3" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <code className="block text-sm font-mono text-green-500 break-all bg-black/80 border border-zinc-900 p-4">
                    {hashResult.hash}
                  </code>
                </div>

                {/* Timestamp */}
                <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
                  <FiClock className="w-4 h-4 text-zinc-600" />
                  <div>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider block font-bold">Computed At</span>
                    <span className="text-sm font-mono text-zinc-400">{formatDate(hashResult.hashedAt)}</span>
                  </div>
                </div>

                {/* Blockchain Status */}
                {hashResult.txid ? (
                  <div className="p-6 bg-green-900/5 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-2 opacity-10">
                      <FiShield size={100} />
                    </div>

                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <FiShield className="w-5 h-5 text-green-500" />
                      <span className="font-bold text-green-500 uppercase tracking-widest text-sm">Inscribed on Bitcoin</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold">Transaction ID</span>
                        <a
                          href={`https://whatsonchain.com/tx/${hashResult.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline decoration-blue-500/50"
                        >
                          {hashResult.txid.slice(0, 16)}...{hashResult.txid.slice(-16)}
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {hashResult.inscribedAt && (
                        <div>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1 font-bold">Inscribed At</span>
                          <span className="text-xs font-mono text-zinc-400">{formatDate(hashResult.inscribedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    {wallet.type !== 'none' ? (
                      <button
                        onClick={inscribeOnChain}
                        disabled={isInscribing}
                        className={`
                          w-full py-4 px-6 font-bold uppercase tracking-widest text-sm
                          flex items-center justify-center gap-2
                          transition-all duration-200
                          ${isInscribing
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                            : 'bg-white text-black hover:bg-zinc-200 border border-white'
                          }
                          rounded-pillar
                        `}
                      >
                        <FiShield className="w-4 h-4" />
                        {isInscribing ? 'Processing...' : `Inscribe [${wallet.type === 'yours' ? 'Yours' : 'HandCash'}]`}
                      </button>
                    ) : (
                      <div className="text-center bg-zinc-900/50 p-6 border border-zinc-800 border-dashed rounded-pillar">
                        <p className="text-zinc-500 mb-4 text-xs uppercase tracking-widest">Connect wallet to inscribe</p>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={connectYours}
                            className="px-4 py-2 bg-purple-900/30 hover:bg-purple-900/50 text-purple-400 border border-purple-800/50 rounded-pillar font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Connect Yours
                          </button>
                          <button
                            onClick={connectHandCash}
                            className="px-4 py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 border border-green-800/50 rounded-pillar font-bold text-xs uppercase tracking-wider transition-colors"
                          >
                            Connect HandCash
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-zinc-600 text-center mt-4 uppercase tracking-widest">
                      RECORD HASH ON BITCOIN BLOCKCHAIN
                    </p>
                  </div>
                )}
              </div>

              {/* Download Receipt */}
              {hashResult.txid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4"
                >
                  <button
                    onClick={() => {
                      // Generate receipt
                      const receipt = `
FILE HASH CERTIFICATE
=====================

File: ${hashResult.fileName}
Size: ${formatFileSize(hashResult.fileSize)}
Type: ${hashResult.fileType}

SHA-256 Hash:
${hashResult.hash}

Hashed At: ${formatDate(hashResult.hashedAt)}
Inscribed At: ${hashResult.inscribedAt ? formatDate(hashResult.inscribedAt) : 'N/A'}

Bitcoin Transaction:
${hashResult.txid}

Verify at: https://whatsonchain.com/tx/${hashResult.txid}

---
Generated by b0ase.com File Hash Tool
                      `.trim();

                      const blob = new Blob([receipt], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `hash-certificate-${hashResult.hash.slice(0, 8)}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-3 px-6 border border-zinc-700 font-bold uppercase tracking-widest text-xs
                        flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors rounded-pillar"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download Certificate
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-950/30 border border-zinc-800 rounded-pillar">
            <FiShield className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="font-bold uppercase tracking-wide mb-2 text-sm">Immutable Proof</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Once inscribed, your file hash is permanently recorded on the Bitcoin blockchain.
            </p>
          </div>
          <div className="p-6 bg-zinc-950/30 border border-zinc-800 rounded-pillar">
            <FiClock className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="font-bold uppercase tracking-wide mb-2 text-sm">Timestamped</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Blockchain timestamp proves your file existed at a specific point in time.
            </p>
          </div>
          <div className="p-6 bg-zinc-950/30 border border-zinc-800 rounded-pillar">
            <FiFileText className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="font-bold uppercase tracking-wide mb-2 text-sm">Private</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Only the hash is stored on-chain. Your file content remains private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
