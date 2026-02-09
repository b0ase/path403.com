'use client';

import React from 'react';
import Link from 'next/link';
import { FiHash, FiExternalLink, FiFileText, FiShield } from 'react-icons/fi';

export default function HashesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">File Hashes</h1>
          <p className="text-zinc-500 text-sm">
            Cryptographic proof of your files on the Bitcoin blockchain
          </p>
        </div>
        <Link
          href="/tools/file-hash"
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          <FiHash size={16} />
          Hash a File
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3">
            <FiFileText className="text-blue-400" size={20} />
            <h3 className="text-white font-bold">What is File Hashing?</h3>
          </div>
          <p className="text-zinc-400 text-sm">
            A cryptographic hash is a unique fingerprint of your file. Even a tiny change creates a completely different hash.
          </p>
        </div>

        <div className="p-6 border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3">
            <FiShield className="text-green-400" size={20} />
            <h3 className="text-white font-bold">Blockchain Proof</h3>
          </div>
          <p className="text-zinc-400 text-sm">
            Inscribing a hash on Bitcoin creates permanent, timestamped proof that your file existed at that moment.
          </p>
        </div>

        <div className="p-6 border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3 mb-3">
            <FiExternalLink className="text-purple-400" size={20} />
            <h3 className="text-white font-bold">Verify Anytime</h3>
          </div>
          <p className="text-zinc-400 text-sm">
            Anyone can verify your file by hashing it and checking if the hash matches the blockchain inscription.
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="p-8 border border-zinc-800 bg-zinc-900/30 text-center">
        <FiHash className="mx-auto text-zinc-600 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Hash History Coming Soon</h3>
        <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6">
          We're building a dashboard to track all your inscribed file hashes.
          For now, use the File Hash tool to create and verify hashes.
        </p>
        <Link
          href="/tools/file-hash"
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white font-bold text-sm uppercase tracking-wider hover:bg-zinc-700 transition-colors border border-zinc-700"
        >
          <FiHash size={16} />
          Go to File Hash Tool
          <FiExternalLink size={14} />
        </Link>
      </div>

      {/* Use Cases */}
      <div className="border border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Common Use Cases</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">1.</span>
            <span className="text-zinc-400">
              <strong className="text-white">Intellectual Property</strong> - Prove when you created a document, design, or code
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">2.</span>
            <span className="text-zinc-400">
              <strong className="text-white">Legal Documents</strong> - Timestamp contracts, agreements, and legal filings
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">3.</span>
            <span className="text-zinc-400">
              <strong className="text-white">Data Integrity</strong> - Verify files haven't been tampered with
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-400 mt-0.5">4.</span>
            <span className="text-zinc-400">
              <strong className="text-white">Research & Evidence</strong> - Create immutable records of research data or evidence
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
