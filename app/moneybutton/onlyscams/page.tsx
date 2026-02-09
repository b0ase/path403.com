'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import {
  FiAlertTriangle,
  FiTrendingUp,
  FiZap,
  FiStar,
  FiAward,
  FiRocket,
  FiTarget,
  FiGift,
} from 'react-icons/fi';

interface ScamToken {
  id: string;
  name: string;
  symbol: string;
  tagline: string;
  price: number;
  originalPrice: number;
  gains: string;
  icon: string;
  color: string;
  warning: string;
  features: string[];
  urgency: string;
  soldCount: number;
}

const SCAM_TOKENS: ScamToken[] = [
  {
    id: 'moonlambo',
    name: 'MoonLambo',
    symbol: 'LAMBO',
    tagline: '🚀 Guaranteed 10,000x returns!',
    price: 9999.99,
    originalPrice: 99999.99,
    gains: '+999,999%',
    icon: '🏎️',
    color: '#f59e0b',
    warning: 'Not actually a car',
    features: ['Lambo guaranteed*', 'Moon by Tuesday', 'Trust us bro'],
    urgency: '🔥 Only 3 left!',
    soldCount: 69420,
  },
  {
    id: 'eloncoin',
    name: 'ElonMuskCoin',
    symbol: 'ELON',
    tagline: '👀 Endorsed by someone who looks like Elon!',
    price: 4206.90,
    originalPrice: 42069.00,
    gains: '+420,690%',
    icon: '🚀',
    color: '#3b82f6',
    warning: 'Not affiliated with actual Elon',
    features: ['Rockets maybe', 'Very legitimate', 'Much profit'],
    urgency: '⚡ Elon is watching!',
    soldCount: 31337,
  },
  {
    id: 'safesafe',
    name: 'SafeSafeSuper',
    symbol: 'SAFEX3',
    tagline: '🔒 Triple the safe, triple the gains!',
    price: 888.88,
    originalPrice: 8888.88,
    gains: '+88,888%',
    icon: '🔐',
    color: '#22c55e',
    warning: 'Safety not guaranteed',
    features: ['3x Safe technology', 'Unhackable*', 'Anti-rug pull**'],
    urgency: '🛡️ Be SAFE now!',
    soldCount: 88888,
  },
  {
    id: 'babydoge',
    name: 'BabyDogeElonSafe',
    symbol: 'BDES',
    tagline: '🐕 Combining ALL the memes!',
    price: 1234.56,
    originalPrice: 12345.67,
    gains: '+123,456%',
    icon: '🐕',
    color: '#f97316',
    warning: 'May contain traces of rug',
    features: ['Baby + Doge + Elon', 'Maximum meme density', 'Very keywords'],
    urgency: '🐶 Much wow!',
    soldCount: 42000,
  },
  {
    id: 'metaverse',
    name: 'MetaVerseAI3.0',
    symbol: 'MVAI',
    tagline: '🌐 AI + Metaverse + Blockchain + Quantum!',
    price: 5555.55,
    originalPrice: 55555.55,
    gains: '+555,555%',
    icon: '🥽',
    color: '#8b5cf6',
    warning: 'Buzzwords only',
    features: ['All the buzzwords', 'Web3 synergy', 'Paradigm shift'],
    urgency: '🤖 AI is taking over!',
    soldCount: 77777,
  },
  {
    id: 'rugpull',
    name: 'Definitely Not Rug',
    symbol: 'NOTRUG',
    tagline: '🎭 We promise this time!',
    price: 666.66,
    originalPrice: 6666.66,
    gains: '+666,666%',
    icon: '🎭',
    color: '#ef4444',
    warning: 'Narrator: It was a rug',
    features: ['Pinky promise', 'Dev doxxed***', 'Liquidity locked****'],
    urgency: '😈 Trust the process!',
    soldCount: 13666,
  },
  {
    id: 'princetoken',
    name: 'Nigerian Prince Token',
    symbol: 'PRINCE',
    tagline: '👑 Urgent! Help needed!',
    price: 10000.00,
    originalPrice: 100000.00,
    gains: '+10,000,000%',
    icon: '👑',
    color: '#eab308',
    warning: 'Requires bank details',
    features: ['Royal inheritance', 'Just need small fee', 'Very urgent'],
    urgency: '👑 Crown awaits!',
    soldCount: 419,
  },
  {
    id: 'squidsafe',
    name: 'SquidGameSafe2.0',
    symbol: 'SQUID2',
    tagline: '🦑 This time you CAN sell!',
    price: 456.00,
    originalPrice: 4560.00,
    gains: '+45,600%',
    icon: '🦑',
    color: '#ec4899',
    warning: 'Selling requires Level 7',
    features: ['Totally sellable', 'No traps this time', 'We learned'],
    urgency: '🔴🟢 Game starts soon!',
    soldCount: 45600,
  },
];

export default function OnlyScamsPage() {
  const [selectedToken, setSelectedToken] = useState<ScamToken | null>(null);
  const [clickedTokens, setClickedTokens] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => audioContextRef.current?.close();
  }, []);

  const playScamSound = () => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Dramatic coin sound
    [400, 500, 600, 800].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  };

  const handleBuy = (token: ScamToken) => {
    playScamSound();
    setClickedTokens(prev => new Set(prev).add(token.id));
    setSelectedToken(token);
  };

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Scammy animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{ left: `${Math.random() * 100}%` }}
            initial={{ y: '-10%', opacity: 0 }}
            animate={{ y: '110%', opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            {['💰', '🚀', '💎', '🔥', '⚠️', '💸'][Math.floor(Math.random() * 6)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-red-900/50 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <motion.div
              className="bg-gradient-to-br from-red-600 to-yellow-500 p-4 md:p-6 self-start"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <FiAlertTriangle className="text-4xl md:text-6xl text-black" />
            </motion.div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 leading-none tracking-tighter animate-pulse">
                ONLYSCAMS
              </h1>
              <div className="text-xs text-red-400 mb-2 font-mono uppercase tracking-widest">
                100% LEGITIMATE*
              </div>
            </div>
          </div>
          <p className="text-red-400/80 max-w-2xl text-sm">
            ⚠️ SATIRE & PARODY ⚠️ These are fake tokens demonstrating common crypto scam tactics.
            Don't actually buy these. Learn to recognize red flags!
          </p>
        </motion.div>

        {/* Flashing banner */}
        <motion.div
          className="mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 p-4 text-center"
          animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ backgroundSize: '200% 100%' }}
        >
          <p className="text-black font-black text-xl md:text-2xl uppercase">
            🚨 LIMITED TIME ONLY! ACT NOW! DON'T MISS OUT! 🚨
          </p>
        </motion.div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {SCAM_TOKENS.map((token, index) => (
            <motion.div
              key={token.id}
              className="border-2 border-dashed bg-black/80 overflow-hidden"
              style={{ borderColor: token.color }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${token.color}40` }}
            >
              {/* Urgency banner */}
              <div
                className="py-1 px-2 text-center text-xs font-bold text-black"
                style={{ backgroundColor: token.color }}
              >
                {token.urgency}
              </div>

              <div className="p-4">
                {/* Token header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{token.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{token.name}</h3>
                    <p className="text-xs text-zinc-500">${token.symbol}</p>
                  </div>
                </div>

                {/* Tagline */}
                <p className="text-sm mb-3" style={{ color: token.color }}>
                  {token.tagline}
                </p>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white">
                      ${token.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-zinc-500 line-through">
                      ${token.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <motion.p
                    className="text-green-400 text-sm font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {token.gains} THIS WEEK!
                  </motion.p>
                </div>

                {/* Features */}
                <ul className="text-xs text-zinc-400 mb-3 space-y-1">
                  {token.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <FiStar className="text-yellow-500" size={10} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Sold count */}
                <p className="text-xs text-zinc-600 mb-3">
                  🔥 {token.soldCount.toLocaleString()} suckers... er, investors!
                </p>

                {/* Buy button */}
                <motion.button
                  className="w-full py-3 font-bold text-black rounded"
                  style={{ backgroundColor: token.color }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBuy(token)}
                >
                  {clickedTokens.has(token.id) ? '✅ ALREADY RUGGED' : '💸 BUY NOW!!!'}
                </motion.button>

                {/* Warning */}
                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                  *{token.warning}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimers */}
        <div className="border border-zinc-800 bg-zinc-900/50 p-6 mb-8">
          <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            <FiAlertTriangle /> FINE PRINT (that no one reads)
          </h3>
          <div className="text-[10px] text-zinc-600 space-y-1">
            <p>* "Guaranteed" means absolutely nothing and is definitely not guaranteed</p>
            <p>** "Anti-rug pull" technology is just a fancy name for nothing</p>
            <p>*** "Doxxed" means they showed a photo that might be anyone</p>
            <p>**** "Liquidity locked" for 24 hours, then we run</p>
            <p>***** Past performance is not indicative of future results (past performance was also fake)</p>
            <p>****** This is satire. Don't actually send money to strangers on the internet.</p>
          </div>
        </div>

        {/* Educational section */}
        <div className="border border-yellow-500/30 bg-yellow-900/10 p-6 mb-8">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <FiAlertTriangle /> How to Spot a Crypto Scam
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-400">
            <div className="flex gap-2">
              <span className="text-red-400">🚩</span>
              <span>Promises of guaranteed returns</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400">🚩</span>
              <span>Celebrity endorsements (usually fake)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400">🚩</span>
              <span>Extreme urgency and FOMO tactics</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400">🚩</span>
              <span>Anonymous or unverifiable team</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400">🚩</span>
              <span>Too many buzzwords (AI, Meta, Safe, Moon)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400">🚩</span>
              <span>Unrealistic price predictions</span>
            </div>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/moneybutton"
          className="text-zinc-500 text-sm hover:text-white transition-colors"
        >
          ← Back to MoneyButton (the legitimate one)
        </Link>
      </div>

      {/* Popup modal */}
      <AnimatePresence>
        {selectedToken && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedToken(null)}
          >
            <motion.div
              className="bg-zinc-900 border-2 border-red-500 p-8 max-w-md text-center"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🎉
              </motion.div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                CONGRATULATIONS!
              </h2>
              <p className="text-zinc-400 mb-4">
                You just got hypothetically rugged by <span className="text-white font-bold">{selectedToken.name}</span>!
              </p>
              <p className="text-sm text-zinc-500 mb-4">
                In a real scam, your ${selectedToken.price.toLocaleString()} would now be gone forever.
                The dev team would be on a beach somewhere laughing.
              </p>
              <div className="text-4xl mb-4">💸 → 🏝️ → 😎</div>
              <p className="text-xs text-zinc-600 mb-4">
                This is why you should DYOR (Do Your Own Research) and never invest more than you can afford to lose!
              </p>
              <button
                className="px-6 py-2 bg-red-500 text-white font-bold hover:bg-red-400 transition-colors"
                onClick={() => setSelectedToken(null)}
              >
                I've Learned My Lesson
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
