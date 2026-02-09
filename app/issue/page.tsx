'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

const PROVIDERS = [
  { id: 'aws-s3', name: 'Amazon S3', icon: '🪣', fields: ['Access Key ID', 'Secret Access Key', 'Region', 'Bucket'] },
  { id: 'google-drive', name: 'Google Drive', icon: '📁', fields: ['Client ID', 'Client Secret', 'Refresh Token'] },
  { id: 'supabase', name: 'Supabase Storage', icon: '⚡', fields: ['Project URL', 'API Key', 'Bucket'] },
  { id: 'cloudflare-r2', name: 'Cloudflare R2', icon: '☁️', fields: ['Account ID', 'Access Key ID', 'Secret Access Key', 'Bucket'] },
  { id: 'azure-blob', name: 'Azure Blob Storage', icon: '🔷', fields: ['Account Name', 'Account Key', 'Container Name'] },
  { id: 'backblaze-b2', name: 'Backblaze B2', icon: '💾', fields: ['Key ID', 'Application Key', 'Bucket Name'] },
];

export default function IssuePage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const selected = PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono">
      <main className="w-full px-4 md:px-8 py-16 max-w-[1920px] mx-auto">
        {/* PageHeader */}
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-6 flex items-end justify-between overflow-hidden relative">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Storage Provider Connections
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-2"
            >
              UPLOAD<span className="text-zinc-300 dark:text-zinc-800">.SYS</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-zinc-500 max-w-lg"
            >
              <b>Connect & Tokenize.</b> Link cloud storage providers to create tradable access tokens for your files and databases.
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "backOut" }}
            className="hidden md:block text-6xl"
          >
            📦
          </motion.div>
        </header>

        {/* Demo Banner */}
        <div className="mb-8 border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Preview Mode — Download the desktop client to connect storage providers
            </span>
          </div>
          <Link href="/download" className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:text-black dark:hover:text-white transition-colors">
            Download →
          </Link>
        </div>

        {/* 3-Column Layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Column 1: Provider Selection */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              Storage Providers
            </h3>
            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950 border-l-2 border-zinc-900 dark:border-white">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Connect to cloud storage providers. Your credentials are encrypted and stored locally. Files remain in your storage — only access is tokenized.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4 space-y-2">
              {PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`w-full px-3 py-2 text-left border transition-colors ${selectedProvider === provider.id
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-black text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{provider.icon}</span>
                    <span className="text-xs font-semibold">{provider.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Configuration */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              Connection Setup
            </h3>
            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950 border-l-2 border-zinc-900 dark:border-white">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Enter your provider credentials. These are used to generate temporary signed URLs for token holders. Never shared publicly.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-6 space-y-4">
              {selected ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Connection Name</label>
                    <input
                      type="text"
                      placeholder="My Production Bucket"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </div>
                  {selected.fields.map((field) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">{field}</label>
                      <input
                        type={field.includes('Secret') || field.includes('Key') ? 'password' : 'text'}
                        placeholder={`Enter ${field.toLowerCase()}`}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono text-sm"
                      />
                    </div>
                  ))}
                  <Link
                    href="/download"
                    className="block w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold text-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm"
                  >
                    Download Client to Connect
                  </Link>
                </>
              ) : (
                <div className="py-12 text-center text-zinc-500">
                  <p className="text-sm mb-2">No provider selected</p>
                  <p className="text-xs">Choose a storage provider to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Active Connections */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              Active Connections
            </h3>
            <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950 border-l-2 border-zinc-900 dark:border-white">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Connected storage providers. Create tokens for files in these buckets to enable on-chain access control and trading.
              </p>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black p-4">
              <div className="py-12 text-center text-zinc-500">
                <p className="text-sm mb-2">No connections yet</p>
                <p className="text-xs">Connect a provider to get started</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800">
              <div className="p-4 text-center border-r border-zinc-200 dark:border-zinc-800">
                <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 mb-1">0</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Providers</div>
              </div>
              <div className="p-4 text-center border-r border-zinc-200 dark:border-zinc-800">
                <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 mb-1">0</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Files</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-zinc-300 dark:text-zinc-700 mb-1">0 GB</div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-wider">Storage</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
