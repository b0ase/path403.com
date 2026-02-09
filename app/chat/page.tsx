'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

const DEMO_MESSAGES = [
  { sender: '@NODE_a3f2c8', time: '14:23:01', content: 'New token indexed: $FNEWS_KWEG — 21 SAT base price', channel: 'global' },
  { sender: '@NODE_7b91d4', time: '14:23:15', content: 'Gossip relay: 3 new peers discovered on bootstrap', channel: 'global' },
  { sender: '@NODE_e5c0a1', time: '14:24:02', content: 'Content offer received: video/mp4 hash 0xabc123...def', channel: 'global' },
  { sender: '@NODE_a3f2c8', time: '14:24:44', content: 'Auto-speculate triggered: buying 100 $402_BONES at 420 SAT', channel: 'market-talk' },
  { sender: '@NODE_9d2f3e', time: '14:25:11', content: 'NOISE handshake complete with peer NODE_7b91d4', channel: 'dev-ops' },
  { sender: '@NODE_e5c0a1', time: '14:26:30', content: 'Content seeding: 6 files, 16MB total, ratio 2.4', channel: 'global' },
  { sender: '@NODE_7b91d4', time: '14:27:05', content: 'POW20 block mined: nonce 0x4f2a... difficulty 18', channel: 'global' },
];

export default function ChatPage() {
  const [channel, setChannel] = useState('global');
  const [input, setInput] = useState('');

  const filtered = DEMO_MESSAGES.filter(m => m.channel === channel || m.channel === 'global');

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono">
      <main className="w-full px-4 md:px-8 py-8 max-w-[1920px] mx-auto flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>
        {/* PageHeader */}
        <header className="mb-6 border-b border-zinc-200 dark:border-zinc-900 pb-6 flex items-end justify-between overflow-hidden relative flex-shrink-0">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Secure Uplink / #{channel}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-6xl font-black tracking-tighter mb-2"
            >
              GOSSIP<span className="text-zinc-300 dark:text-zinc-800">.NET</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-zinc-500 max-w-lg"
            >
              Encrypted peer-to-peer messaging over the NOISE transport layer.
            </motion.div>
          </div>
          <Link href="/download" className="hidden md:flex items-center gap-2 px-4 py-2 border border-amber-500/30 bg-amber-500/5 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 hover:text-black dark:hover:text-white transition-colors flex-shrink-0">
            Demo Mode — Download Client →
          </Link>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col md:flex-row border border-zinc-200 dark:border-zinc-800 min-h-0 bg-white dark:bg-black">
          {/* Channels Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20 shrink-0">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Active Channels</div>
            </div>
            <div className="flex flex-col">
              {['global', 'dev-ops', 'market-talk', 'support'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannel(ch)}
                  className={`w-full text-left px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider transition-all border-l-2 ${channel === ch
                    ? 'border-black dark:border-white bg-white dark:bg-zinc-900 text-black dark:text-white'
                    : 'border-transparent text-zinc-500 hover:text-black dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  #{ch}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Window */}
          <div className="flex-1 flex flex-col min-h-0 relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {filtered.map((msg, i) => (
                <div key={i} className="group flex flex-col gap-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 -mx-4 px-4 py-2 transition-colors">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-blue-600 dark:text-blue-400">
                      {msg.sender}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">{msg.time}</span>
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300 font-mono leading-relaxed pl-4 border-l border-zinc-200 dark:border-zinc-800">
                    {msg.content}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-700">
                  <div className="text-6xl mb-4 opacity-20">⚡</div>
                  <div className="text-xs font-bold uppercase tracking-widest">Signal Silence</div>
                  <div className="text-[10px] font-mono mt-1">Channel #{channel} is quiet</div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <div className="flex">
                <span className="px-4 py-4 bg-zinc-100 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono text-xs flex items-center">
                  &gt;
                </span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Broadcast to #${channel}...`}
                  className="flex-1 bg-transparent px-4 py-4 text-sm font-mono focus:outline-none placeholder-zinc-400 text-black dark:text-white"
                />
                <Link
                  href="/download"
                  className="px-8 border-l border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center"
                >
                  Transmit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
