'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaDollarSign, FaWallet, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { FiZap, FiInfo, FiAlertCircle } from 'react-icons/fi';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  life: number;
}

interface MoneyButton {
  id: string;
  color: string;
  label: string;
  price: string;
  clicks: number;
}

// 5 rows of 6 buttons each
const BUTTON_CONFIGS = [
  // Row 1: Payment (cyan → purple)
  { label: '$PAY', price: '0.001', color: '#06b6d4' },
  { label: '$TIP', price: '0.002', color: '#0ea5e9' },
  { label: '$BUY', price: '0.005', color: '#3b82f6' },
  { label: '$SEND', price: '0.01', color: '#6366f1' },
  { label: '$GIVE', price: '0.02', color: '#8b5cf6' },
  { label: '$SAVE', price: '0.05', color: '#a855f7' },
  // Row 2: Social (pink → lime)
  { label: '$LIKE', price: '0.001', color: '#ec4899' },
  { label: '$FOLLOW', price: '0.01', color: '#f43f5e' },
  { label: '$SUB', price: '0.05', color: '#ef4444' },
  { label: '$BOOST', price: '0.10', color: '#f97316' },
  { label: '$SHARE', price: '0.02', color: '#eab308' },
  { label: '$UPVOTE', price: '0.005', color: '#84cc16' },
  // Row 3: Creator (teal → emerald)
  { label: '$CLAP', price: '0.001', color: '#14b8a6' },
  { label: '$REACT', price: '0.002', color: '#10b981' },
  { label: '$DONATE', price: '0.10', color: '#22c55e' },
  { label: '$FUND', price: '0.25', color: '#4ade80' },
  { label: '$UNLOCK', price: '0.50', color: '#86efac' },
  { label: '$ACCESS', price: '1.00', color: '#a7f3d0' },
  // Row 4: Gaming (amber → red)
  { label: '$PLAY', price: '0.01', color: '#fbbf24' },
  { label: '$SPIN', price: '0.05', color: '#f59e0b' },
  { label: '$BET', price: '0.10', color: '#d97706' },
  { label: '$ROLL', price: '0.02', color: '#b45309' },
  { label: '$FLIP', price: '0.005', color: '#92400e' },
  { label: '$MINT', price: '0.25', color: '#78350f' },
  // Row 5: Media (slate → indigo)
  { label: '$WATCH', price: '0.01', color: '#64748b' },
  { label: '$READ', price: '0.005', color: '#6366f1' },
  { label: '$LISTEN', price: '0.01', color: '#818cf8' },
  { label: '$STREAM', price: '0.05', color: '#a5b4fc' },
  { label: '$VIEW', price: '0.001', color: '#c7d2fe' },
  { label: '$DOWNLOAD', price: '0.10', color: '#e0e7ff' },
];

const generateButtons = (): MoneyButton[] => {
  return BUTTON_CONFIGS.map((config, i) => ({
    id: `btn-${i}`,
    ...config,
    clicks: 0,
  }));
};

// Token price: $0.01 per token (b0ase.com incubate standard)
const TOKEN_PRICE_USD = 0.01;
const calculateTokens = (priceUsd: number) => Math.floor(priceUsd / TOKEN_PRICE_USD);

export default function MoneyButtonDashboard() {
  const [buttons, setButtons] = useState<MoneyButton[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [handcashToken, setHandcashToken] = useState<string | null>(null);
  const [handcashHandle, setHandcashHandle] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [lastPurchase, setLastPurchase] = useState<{ tokens: number; symbol: string } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for HandCash auth on mount
  useEffect(() => {
    const token = localStorage.getItem('handcash_auth_token');
    const handle = localStorage.getItem('handcash_handle');
    if (token) setHandcashToken(token);
    if (handle) setHandcashHandle(handle);
  }, []);

  useEffect(() => {
    setButtons(generateButtons());
  }, []);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playSound = useCallback((frequency: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Coin sound
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(frequency, now);
    osc1.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 0.1);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2, now + 0.05);
    gain2.gain.setValueAtTime(0.1, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.3);
  }, []);

  const createParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 16; i++) {
      newParticles.push({
        id: Date.now() + i,
        x, y, color,
        size: 3 + Math.random() * 6,
        angle: (Math.PI * 2 * i) / 16,
        speed: 4 + Math.random() * 6,
        life: 1,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + Math.cos(p.angle) * p.speed,
            y: p.y + Math.sin(p.angle) * p.speed,
            life: p.life - 0.04,
            speed: p.speed * 0.96,
          }))
          .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles.length]);

  const handleClick = async (button: MoneyButton, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const freq = 400 + BUTTON_CONFIGS.findIndex(c => c.label === button.label) * 80;
    playSound(freq);
    createParticles(x, y, button.color);

    const price = parseFloat(button.price);
    const tokensEarned = calculateTokens(price); // 1 token per $0.01

    // Demo mode - just update local state
    if (!isLiveMode) {
      setButtons(prev => prev.map(b =>
        b.id === button.id ? { ...b, clicks: b.clicks + 1 } : b
      ));
      setTotalClicks(prev => prev + 1);
      setTotalEarnings(prev => prev + price);
      setTotalTokens(prev => prev + tokensEarned);
      setActiveButton(button.id);
      setTimeout(() => setActiveButton(null), 200);
      return;
    }

    // Live mode - process real payment
    if (!handcashToken) {
      setPurchaseError('Connect HandCash wallet first');
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);
    setActiveButton(button.id);

    try {
      const response = await fetch('/api/moneybutton/token/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buttonLabel: button.label,
          priceUsd: price,
          authToken: handcashToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      // Update UI with real purchase
      setButtons(prev => prev.map(b =>
        b.id === button.id ? { ...b, clicks: b.clicks + 1 } : b
      ));
      setTotalClicks(prev => prev + 1);
      setTotalEarnings(prev => prev + price);
      setTotalTokens(prev => prev + data.tokensCredited);
      setLastPurchase({ tokens: data.tokensCredited, symbol: data.tokenSymbol });

      // Clear success message after 3s
      setTimeout(() => setLastPurchase(null), 3000);

    } catch (err: any) {
      setPurchaseError(err.message);
      setTimeout(() => setPurchaseError(null), 5000);
    } finally {
      setIsPurchasing(false);
      setTimeout(() => setActiveButton(null), 200);
    }
  };

  return (
    <motion.div
      className="min-h-screen overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="px-4 md:px-8 pt-16 pb-8">
        <motion.div
          className="mb-8 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <motion.div
              className="bg-cyan-900/50 p-4 md:p-6 border border-cyan-800 self-start"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaDollarSign className="text-4xl md:text-6xl text-cyan-400" />
            </motion.div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 leading-none tracking-tighter">
                DASHBOARD
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                PLAYGROUND
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-zinc-400 max-w-xl">
                Click buttons to earn tokens. 1 token = $0.01
              </p>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <FiInfo size={18} />
              </button>
            </div>
            <div className="flex items-center gap-6">
              {/* HandCash connect */}
              {isLiveMode && !handcashToken && (
                <a
                  href={`https://app.handcash.io/#/authorizeApp?appId=${process.env.NEXT_PUBLIC_HANDCASH_APP_ID || 'your-app-id'}`}
                  className="flex items-center gap-2 px-3 py-1.5 border border-green-500 bg-green-500/10 text-green-400 text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-colors"
                >
                  <FaWallet size={12} />
                  Connect HandCash
                </a>
              )}

              {isLiveMode && handcashHandle && (
                <div className="flex items-center gap-2 px-3 py-1.5 border border-green-500/50 text-green-400 text-xs">
                  <FaWallet size={12} />
                  <span className="font-mono">${handcashHandle}</span>
                </div>
              )}

              {/* Purchasing indicator */}
              {isPurchasing && (
                <div className="flex items-center gap-2 text-cyan-400 text-xs">
                  <FaSpinner className="animate-spin" size={12} />
                  Processing...
                </div>
              )}

              {/* Mode toggle */}
              <button
                onClick={() => setIsLiveMode(!isLiveMode)}
                className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-bold uppercase tracking-wider transition-colors ${
                  isLiveMode
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'
                }`}
              >
                <FiZap size={12} />
                {isLiveMode ? 'LIVE' : 'DEMO'}
              </button>

              <div className="text-right">
                <motion.p
                  className="text-2xl font-bold text-white"
                  key={totalClicks}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  {totalClicks}
                </motion.p>
                <p className="text-xs text-zinc-500">CLICKS</p>
              </div>
              <div className="text-right">
                <motion.p
                  className="text-2xl font-bold text-cyan-400"
                  key={totalTokens}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  {totalTokens.toLocaleString()}
                </motion.p>
                <p className="text-xs text-zinc-500">TOKENS</p>
              </div>
              <div className="text-right">
                <motion.p
                  className="text-2xl font-bold text-green-400"
                  key={totalEarnings.toFixed(3)}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  ${totalEarnings.toFixed(3)}
                </motion.p>
                <p className="text-xs text-zinc-500">VALUE</p>
              </div>
            </div>
          </div>

          {/* Status messages */}
          {purchaseError && (
            <motion.div
              className="mt-4 p-3 border border-red-500/50 bg-red-500/10 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FiAlertCircle className="text-red-400" />
              <span className="text-red-400 text-sm">{purchaseError}</span>
            </motion.div>
          )}

          {lastPurchase && (
            <motion.div
              className="mt-4 p-3 border border-green-500/50 bg-green-500/10 flex items-center gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaCheckCircle className="text-green-400" />
              <span className="text-green-400 text-sm">
                Purchased {lastPurchase.tokens.toLocaleString()} {lastPurchase.symbol} tokens!
              </span>
            </motion.div>
          )}

          {/* Info panel */}
          {showInfo && (
            <motion.div
              className="mt-6 p-4 border border-zinc-800 bg-zinc-900/50 text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <h4 className="font-bold text-white mb-2">How MoneyButtons Work</h4>
              <ul className="text-zinc-400 space-y-1">
                <li>Each button represents a token you can purchase</li>
                <li>Price shown is in USD - tokens credited at <strong className="text-white">1 token per $0.01</strong></li>
                <li>In LIVE mode, payments are processed via HandCash</li>
                <li>95% goes to project escrow pool, 5% to platform</li>
                <li>Tokens represent claims on project equity</li>
                <li>Example: $1 = 100 tokens</li>
              </ul>
              <div className="mt-3 flex gap-3">
                <Link
                  href="/moneybutton"
                  className="text-cyan-400 hover:text-cyan-300 text-xs uppercase tracking-wider"
                >
                  Learn More
                </Link>
                <a
                  href="https://handcash.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-300 text-xs uppercase tracking-wider"
                >
                  <FaWallet size={10} /> Get HandCash
                </a>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Particles layer */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.life,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
            }}
          />
        ))}
      </div>

      {/* Button grid */}
      <div ref={containerRef} className="px-4 md:px-8 pb-24">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4 lg:gap-5 max-w-4xl mx-auto">
          {buttons.map((button, index) => (
            <motion.button
              key={button.id}
              className="w-full aspect-square relative rounded-full cursor-pointer group"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: activeButton === button.id ? [1, 1.15, 1] : 1,
                opacity: 1,
              }}
              transition={{
                scale: { duration: 0.15 },
                opacity: { delay: index * 0.05, duration: 0.4 },
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => handleClick(button, e)}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${button.color}40 0%, transparent 70%)`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-1 rounded-full border-2 opacity-40"
                style={{ borderColor: button.color }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.1, 0.4],
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />

              {/* Main button body */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(145deg, ${button.color}, ${button.color}cc)`,
                  boxShadow: `
                    0 0 20px ${button.color}60,
                    0 4px 15px rgba(0,0,0,0.4),
                    inset 0 -4px 10px rgba(0,0,0,0.3),
                    inset 0 4px 10px rgba(255,255,255,0.2)
                  `,
                }}
              />

              {/* Inner shine */}
              <div
                className="absolute top-1 left-1/4 w-1/2 h-1/3 rounded-full opacity-50"
                style={{
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)',
                }}
              />

              {/* Border ring */}
              <div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: `${button.color}80` }}
              />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="font-bold text-sm md:text-base drop-shadow-lg">
                  {button.label}
                </span>
                <span className="text-xs md:text-sm opacity-80 drop-shadow">
                  ${button.price}
                </span>
                {button.clicks > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {button.clicks}
                  </motion.span>
                )}
              </div>

              {/* Bottom reflection */}
              <div
                className="absolute bottom-2 left-1/4 w-1/2 h-1/6 rounded-full opacity-20"
                style={{
                  background: 'linear-gradient(to top, rgba(255,255,255,0.3), transparent)',
                }}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-4 md:px-8 py-4 border-t border-zinc-900/50 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Link
            href="/moneybutton"
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            ← Back
          </Link>

          <button
            onClick={() => {
              setTotalClicks(0);
              setTotalEarnings(0);
              setTotalTokens(0);
              setButtons(prev => prev.map(b => ({ ...b, clicks: 0 })));
            }}
            className="px-4 py-2 border border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider hover:border-zinc-600 hover:text-white transition-colors"
          >
            Reset
          </button>

          <div className="text-xs text-zinc-600">
            {buttons.length} buttons
          </div>
        </div>
      </div>
    </motion.div>
  );
}
