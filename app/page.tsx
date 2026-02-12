'use client';

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { useEffect, useState } from "react";

// ── Animation variants ──────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.6, delay }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay, ease }
  })
};

const slideRight = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay, ease }
  })
};

// ── Boot Sequence Hero ──────────────────────────────────────────

const DATA_STREAM = '0xF402 \u25C6 NODE_17 \u25C6 PEER_ACK \u25C6 0x00FF \u25C6 BLOCK_9814 \u25C6 TX_VALID \u25C6 STAMP_OK \u25C6 0xDEAD \u25C6 ROUTE_P2P \u25C6 HASH_SHA256 \u25C6 NOISE_HANDSHAKE \u25C6 BSV21_MINT \u25C6 ';

const NODE_LABELS = [
  { label: 'NODE_01', x: '12%', y: '25%', delay: 0.2 },
  { label: 'PEER_08', x: '82%', y: '18%', delay: 0.6 },
  { label: 'IDX_03', x: '8%', y: '72%', delay: 0.4 },
  { label: 'RELAY_12', x: '88%', y: '68%', delay: 0.8 },
  { label: 'MINER_05', x: '70%', y: '82%', delay: 1.0 },
  { label: 'TX_POOL', x: '20%', y: '85%', delay: 0.3 },
];

const TOKEN_ID = '294691e2069ce8f6b9a1afd1022c6d32f8b30cb24c07b6584385bd6066e95502_0';

const SYSTEM_READOUT = [
  { label: 'PROTOCOL', value: 'HTTP 402', color: 'text-zinc-600' },
  { label: 'NETWORK', value: 'BSV MAINNET', color: 'text-zinc-600' },
  { label: 'TRANSPORT', value: 'NOISE/P2P', color: 'text-zinc-600' },
  { label: 'STATUS', value: 'OPERATIONAL', color: 'text-green-600' },
  { label: 'TOKEN', value: 'BSV-21 POW20', color: 'text-zinc-600' },
  { label: 'GENESIS', value: TOKEN_ID.slice(0, 12) + '...', color: 'text-blue-500' },
];

function BootSequenceHero() {
  const [phase, setPhase] = useState(0); // 0=black, 1=booting, 2=title, 3=content
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [particles, setParticles] = useState<Array<{
    id: number; x: number; y: number; size: number; opacity: number; duration: number; delay: number;
  }>>([]);

  const BOOT_MESSAGES = [
    'INITIALIZING PROTOCOL STACK...',
    'LOADING NOISE TRANSPORT LAYER...',
    'GOSSIP NETWORK: SCANNING BOOTSTRAP NODES...',
    'POW20 ENGINE: READY',
    'BSV-21 TOKEN INDEXER: ONLINE',
    'P2P CONTENT MESH: ACTIVATED',
    'SYSTEM OPERATIONAL \u2014 AWAITING OPERATOR',
  ];

  // Generate particles on client only to avoid hydration mismatch
  useEffect(() => {
    setParticles(Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.05,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
    })));
  }, []);

  // Boot sequence — all timers in one effect to avoid strict mode issues
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval> | null = null;

    // Phase 0 → 1: start boot after 400ms
    timers.push(setTimeout(() => {
      if (cancelled) return;
      setPhase(1);

      // Phase 1: type boot lines
      let i = 0;
      interval = setInterval(() => {
        if (cancelled) { interval && clearInterval(interval); return; }
        if (i < BOOT_MESSAGES.length) {
          setBootLines(prev => [...prev, BOOT_MESSAGES[i]]);
          i++;
        } else {
          interval && clearInterval(interval);
          // Phase 1 → 2: title reveal
          timers.push(setTimeout(() => {
            if (cancelled) return;
            setPhase(2);
            // Phase 2 → 3: full content
            timers.push(setTimeout(() => {
              if (cancelled) return;
              setPhase(3);
            }, 800));
          }, 300));
        }
      }, 150);
    }, 400));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <section className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden bg-black">

      {/* ═══════════ BACKGROUND VIDEO ═══════════ */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 z-0"
      >
        <source src="/403-RED-1.mp4" type="video/mp4" />
      </video>

      {/* ═══════════ BACKGROUND LAYERS ═══════════ */}

      {/* Layer 1: Radial blue glow behind title */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[800px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 35%, transparent 70%)',
          }}
        />
      </div>

      {/* Layer 2: Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Layer 3: Animated floating particles */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `float-drift ${p.duration}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 4: Pulsing concentric rings */}
      <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="absolute rounded-full border border-white/[0.03]"
            style={{
              left: '33%',
              top: '50%',
              width: `${300 + i * 220}px`,
              height: `${300 + i * 220}px`,
              marginLeft: `-${(300 + i * 220) / 2}px`,
              marginTop: `-${(300 + i * 220) / 2}px`,
              animation: `ring-pulse ${4 + i * 0.7}s ${i * 1}s ease-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Layer 5: Fine grid lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Layer 6: Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-[3] overflow-hidden opacity-[0.03]">
        <div className="w-full h-[2px] bg-white animate-scanline" />
      </div>

      {/* Layer 7: CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[4]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* ═══════════ HUD FRAME ═══════════ */}
      <div className="absolute inset-0 pointer-events-none z-[5]">
        {/* Corner brackets */}
        <div className="absolute top-6 left-6 w-16 h-16 border-l-2 border-t-2 border-white/[0.08]" />
        <div className="absolute top-6 right-6 w-16 h-16 border-r-2 border-t-2 border-white/[0.08]" />
        <div className="absolute bottom-6 left-6 w-16 h-16 border-l-2 border-b-2 border-white/[0.08]" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border-r-2 border-b-2 border-white/[0.08]" />

        {/* Inner corner accents */}
        <div className="absolute top-6 left-6 w-4 h-4 border-l border-t border-white/20" />
        <div className="absolute top-6 right-6 w-4 h-4 border-r border-t border-white/20" />
        <div className="absolute bottom-6 left-6 w-4 h-4 border-l border-b border-white/20" />
        <div className="absolute bottom-6 right-6 w-4 h-4 border-r border-b border-white/20" />

        {/* Corner data labels */}
        <div className="absolute top-8 left-24 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
          PATH402 PROTOCOL v1.0
        </div>
        <div className="absolute top-8 right-24 text-[7px] font-mono text-zinc-700 tracking-[0.25em] text-right hidden md:block">
          08.FEB.2026 // MAINNET
        </div>
        <div className="absolute bottom-8 left-24 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
          BSV-21 // POW20 // NOISE
        </div>
        <div className="absolute bottom-8 right-24 text-[7px] font-mono text-zinc-700 tracking-[0.25em] text-right hidden md:block">
          NODES: 142 \u25C6 LAT: 23ms
        </div>

        {/* Thin edge lines */}
        <div className="absolute top-6 left-24 right-24 h-[1px] bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.04]" />
        <div className="absolute bottom-6 left-24 right-24 h-[1px] bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.04]" />
      </div>

      {/* ═══════════ BOOT SEQUENCE TEXT (left) ═══════════ */}
      <AnimatePresence>
        {phase >= 1 && phase < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute top-16 left-8 md:left-28 z-20 font-mono"
          >
            {bootLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`text-[10px] tracking-wider mb-1 ${
                  i === bootLines.length - 1 ? 'text-green-500' : 'text-zinc-700'
                }`}
              >
                <span className="text-zinc-800 mr-2">[{String(i).padStart(2, '0')}]</span>
                {line}
              </motion.div>
            ))}
            {phase === 1 && (
              <span className="inline-block w-2 h-3 bg-green-500 animate-blink ml-1 mt-1" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ SYSTEM READOUT (right) ═══════════ */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute top-16 right-8 md:right-28 z-20 font-mono text-right hidden md:block"
          >
            {SYSTEM_READOUT.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                className="mb-2 flex items-center justify-end gap-3"
              >
                <span className="text-[7px] tracking-[0.25em] text-zinc-700">{item.label}</span>
                <span className={`text-[9px] tracking-wider font-bold ${item.color}`}>{item.value}</span>
              </motion.div>
            ))}
            {/* Miniature progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 flex items-center gap-2 justify-end"
            >
              <span className="text-[7px] tracking-[0.25em] text-zinc-700">SYNC</span>
              <div className="w-20 h-[3px] bg-zinc-900 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, delay: 1.2, ease: 'easeOut' }}
                  className="h-full bg-green-500/60"
                />
              </div>
              <span className="text-[7px] text-green-600 font-bold">100%</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ FLOATING NODE LABELS ═══════════ */}
      <AnimatePresence>
        {phase >= 3 && (
          <>
            {NODE_LABELS.map((node) => (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: node.delay }}
                className="absolute z-[6] pointer-events-none flex items-center gap-1.5"
                style={{ left: node.x, top: node.y }}
              >
                <span className="relative flex h-1 w-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500/40 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1 w-1 bg-green-500/60" />
                </span>
                <span className="text-[7px] font-mono text-zinc-700 tracking-[0.2em]">{node.label}</span>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="relative z-20 px-6 md:px-16 max-w-[1920px] mx-auto w-full">
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:flex-row lg:items-stretch lg:gap-12"
            >
              {/* ═══ LEFT: Title + CTA ═══ */}
              <div className="flex-1 min-w-0">
                {/* Super title */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  <span className="text-zinc-600 text-[10px] tracking-[0.3em] uppercase font-mono font-bold">
                    HTTP 402 : PAYMENT REQUIRED
                  </span>
                </motion.div>

                {/* ═══ THE MASSIVE $402 TITLE ═══ */}
                <div className="relative mb-0">
                  <motion.h1
                    className="font-display font-black tracking-tighter leading-[0.85] hero-title-glow"
                    style={{ fontSize: 'clamp(5rem, 12vw, 12rem)' }}
                  >
                    <motion.span
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2, ease }}
                      className="inline-block text-white"
                    >
                      $
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.35, ease }}
                      className="inline-block text-white"
                    >
                      4
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.45, ease }}
                      className="inline-block text-white"
                    >
                      0
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.55, ease }}
                      className="inline-block text-white"
                    >
                      2
                    </motion.span>
                  </motion.h1>

                  {/* Title reflection (mirror fading below) */}
                  <div
                    className="relative overflow-hidden h-6 md:h-10 select-none"
                    aria-hidden="true"
                    style={{
                      transform: 'scaleY(-1)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent 80%)',
                      maskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent 80%)',
                    }}
                  >
                    <div
                      className="font-display font-black tracking-tighter leading-[0.85] text-white/40"
                      style={{ fontSize: 'clamp(5rem, 12vw, 12rem)' }}
                    >
                      $402
                    </div>
                  </div>

                  {/* Horizontal scan line across title */}
                  <motion.div
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
                    transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                    className="absolute top-[60%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />

                  {/* Secondary thinner scan line */}
                  <motion.div
                    initial={{ scaleX: 0, originX: 1 }}
                    animate={{ scaleX: [0, 1, 1, 0], originX: [1, 1, 0, 0] }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                    className="absolute top-[65%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                  />
                </div>

                {/* Tagline */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="mb-2"
                >
                  <span className="text-zinc-400 text-xl md:text-2xl tracking-[0.3em] uppercase font-display font-black">
                    PATH 402 — FOLLOW THE MONEY
                  </span>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-zinc-500 max-w-xl text-sm leading-relaxed mb-8 font-mono"
                >
                  Put a <code className="text-white bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">$</code> in
                  front of any path and it becomes a tokenized asset. Run a node, serve content, earn tokens.
                  The network pays you for the infrastructure you provide.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link
                    href="/download"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all overflow-hidden"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Client
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                  <Link
                    href="/whitepaper"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-zinc-600 hover:text-white transition-all"
                  >
                    Read Whitepaper
                  </Link>
                  <Link
                    href="/exec-summary"
                    className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-zinc-600 hover:text-white transition-all"
                  >
                    Exec Summary
                  </Link>
                </motion.div>
              </div>

              {/* ═══ RIGHT: Video panel ═══ */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease }}
                className="hidden lg:flex flex-col w-[400px] xl:w-[480px] flex-shrink-0 mt-6"
              >
                <div className="relative border border-zinc-800 overflow-hidden flex-1 aspect-video">
                  {/* Video background */}
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  >
                    <source src="https://pub-fee9eb6b685a48f2aa263c104838ce5e.r2.dev/402-video-1.mp4" type="video/mp4" />
                  </video>

                  {/* Overlay content */}
                  <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center h-full bg-gradient-to-t from-black/80 via-black/40 to-black/60">
                    {/* Corner brackets */}
                    <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-zinc-600" />
                    <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-zinc-600" />
                    <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-zinc-600" />
                    <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-zinc-600" />

                    {/* Label */}
                    <div className="text-[8px] text-zinc-600 font-mono tracking-[0.3em] uppercase mb-6">
                      SYS::CORE_CONCEPT
                    </div>

                    <h2 className="text-2xl xl:text-3xl font-black tracking-tighter mb-5 font-display leading-tight">
                      EVERY URL<span className="text-zinc-700">.</span><br />
                      BECOMES AN<span className="text-zinc-700">.</span><br />
                      ECONOMIC OBJECT<span className="text-zinc-700">.</span>
                    </h2>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Tokens gate access. Payment flows to holders and operators. The network rewards you for the infrastructure you provide.
                    </p>

                    {/* Bottom data strip */}
                    <div className="mt-auto pt-6 flex items-center gap-4 text-[8px] font-mono text-zinc-700 tracking-wider">
                      <span>PROTO::HTTP/402</span>
                      <span className="w-1 h-1 bg-zinc-800" />
                      <span>NET::GOSSIP_P2P</span>
                      <span className="w-1 h-1 bg-zinc-800" />
                      <span>ENC::NOISE_IK</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════ DATA STREAMS (bottom) ═══════════ */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute bottom-20 left-0 right-0 z-10 overflow-hidden space-y-0.5"
          >
            <div className="overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-data-scroll-left text-[7px] font-mono text-zinc-800/40 tracking-[0.15em]">
                {DATA_STREAM.repeat(4)}
              </div>
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-data-scroll-right text-[7px] font-mono text-zinc-800/40 tracking-[0.15em]">
                {DATA_STREAM.repeat(4)}
              </div>
            </div>
            <div className="overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-data-scroll-left text-[7px] font-mono text-zinc-800/40 tracking-[0.15em]" style={{ animationDuration: '35s' }}>
                {DATA_STREAM.repeat(4)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ SCROLL INDICATOR ═══════════ */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-zinc-700 text-[9px] uppercase tracking-[0.3em] font-mono">Scroll</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-[1px] h-6 bg-gradient-to-b from-zinc-700 to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom border glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </section>
  );
}

// ── Status Grid (post-hero) ─────────────────────────────────────

function StatusGrid() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          System Overview
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          {[
            { label: 'Protocol', value: 'HTTP 402', sub: 'Payment Required', accent: false },
            { label: 'Token Standard', value: 'POW20', sub: 'BSV-21 Hash-to-Mint', accent: false },
            { label: 'Transport', value: 'NOISE', sub: 'E2E encrypted P2P', accent: false },
            { label: 'Status', value: 'LIVE', sub: 'Mainnet operational', accent: true },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              custom={0.1 + i * 0.08}
              variants={scaleIn}
              className={`p-6 md:p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all ${
                i < 3 ? 'border-r border-zinc-200 dark:border-zinc-800' : ''
              }`}
            >
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-3">{metric.label}</div>
              <div className={`text-2xl md:text-3xl font-black tracking-tighter font-display mb-1 ${
                metric.accent ? 'text-green-500' : 'text-zinc-900 dark:text-white'
              }`}>
                {metric.value}
              </div>
              <div className="text-[9px] text-zinc-500 font-mono font-bold uppercase tracking-widest">{metric.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ── Genesis Proof ────────────────────────────────────────────────

function GenesisProof() {
  const txId = TOKEN_ID.replace('_0', '');
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          Genesis Proof
        </motion.div>
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          {/* Token ID */}
          <motion.div custom={0.1} variants={slideRight} className="p-6 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
            <div className="flex items-start gap-6">
              <span className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-xs font-display font-bold shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">BSV-21 Token ID</span>
                  <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border text-green-500 border-green-500/30">live</span>
                </div>
                <code className="text-xs font-mono text-zinc-600 dark:text-zinc-400 break-all block">
                  {TOKEN_ID}
                </code>
              </div>
              <a
                href={`https://whatsonchain.com/tx/${txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0 self-center"
              >
                Verify &rarr;
              </a>
            </div>
          </motion.div>

          {/* DNS TXT Record */}
          <motion.div custom={0.2} variants={slideRight} className="p-6 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
            <div className="flex items-start gap-6">
              <span className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-xs font-display font-bold shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">DNS Verification</span>
                  <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border text-green-500 border-green-500/30">verified</span>
                </div>
                <pre className="text-xs font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
{`_bsv-token.path402.com  TXT  "token_id=${TOKEN_ID}"`}
                </pre>
              </div>
            </div>
          </motion.div>

          {/* Contract Details */}
          <motion.div custom={0.3} variants={slideRight} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
            <div className="flex items-start gap-6">
              <span className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-xs font-display font-bold shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 block mb-3">On-Chain Contract</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ['Supply', '21,000,000'],
                    ['Per Mint', '50'],
                    ['Halving', '210,000 mints'],
                    ['Pre-mine', '0%'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">{label}</div>
                      <div className="text-sm font-black tracking-tight">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <a
                href={`https://1satordinals.com/token/${TOKEN_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0 self-center"
              >
                1Sat &rarr;
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Core Idea ───────────────────────────────────────────────────

function CoreIdea() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          The Core Idea
        </motion.div>
        <div className="grid md:grid-cols-2 gap-0 border border-zinc-200 dark:border-zinc-800">
          {/* Left: video demo with overlay text */}
          <motion.div custom={0.1} variants={fadeUp} className="relative border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 overflow-hidden min-h-[300px] md:min-h-[400px]">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-30"
            >
              <source src="https://pub-fee9eb6b685a48f2aa263c104838ce5e.r2.dev/402-video-1.mp4" type="video/mp4" />
            </video>
            <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center h-full">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 font-display">
                EVERY URL<span className="text-zinc-300 dark:text-zinc-800">.</span><br />
                BECOMES AN<span className="text-zinc-300 dark:text-zinc-800">.</span><br />
                ECONOMIC OBJECT<span className="text-zinc-300 dark:text-zinc-800">.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                Tokens gate access. Payment flows to holders and operators. The network rewards you for the infrastructure you provide.
              </p>
            </div>
          </motion.div>
          <div className="flex flex-col">
            <motion.div custom={0.2} variants={fadeUp} className="p-8 md:p-12 border-b border-zinc-200 dark:border-zinc-800 flex-1">
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-4">Run a node</div>
              <p className="text-xl font-black tracking-tight mb-2">Serve content to peers</p>
              <p className="text-zinc-500 text-sm">The path402d daemon indexes the blockchain, serves content via P2P gossip, and discovers peers automatically.</p>
            </motion.div>
            <motion.div custom={0.3} variants={fadeUp} className="p-8 md:p-12 flex-1">
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-4">Earn $402</div>
              <p className="text-xl font-black tracking-tight mb-2">Through Proof of Work</p>
              <p className="text-zinc-500 text-sm">Early operators earn the most. The network needs you before it becomes useful. POW20 mining rewards real infrastructure.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Payment Flow ────────────────────────────────────────────────

function PaymentFlow() {
  const steps = [
    { step: '01', text: 'Client requests a $ path', code: 'GET /$video-1', color: 'text-zinc-500' },
    { step: '02', text: 'Server returns 402 Challenge', code: 'HTTP/1.1 402 Payment Required\nx-bsv-payment-satoshis-required: 1000', color: 'text-zinc-500' },
    { step: '03', text: 'Client sends Auth + Payment', code: 'x-bsv-auth-identity-key: <pubkey>\nx-bsv-payment: { transaction }', color: 'text-zinc-500' },
    { step: '04', text: 'Server verifies via BRC-104/105', code: null, color: 'text-zinc-500' },
    { step: '05', text: 'Access granted + Indexer Stamp', code: '200 OK', color: 'text-green-500' },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          Payment Flow
        </motion.div>
        <div className="border border-zinc-200 dark:border-zinc-800">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              custom={0.1 + i * 0.08}
              variants={slideRight}
              className={`flex items-start gap-6 p-6 ${
                i < steps.length - 1 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''
              } hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors`}
            >
              <span className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-xs font-display font-bold shrink-0">
                {item.step}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold tracking-tight mb-1">{item.text}</p>
                {item.code && (
                  <pre className={`text-xs ${item.color} font-mono mt-1 whitespace-pre-wrap`}>{item.code}</pre>
                )}
              </div>
              {i === steps.length - 1 && (
                <span className="relative flex h-2 w-2 self-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ── Demo Video ──────────────────────────────────────────────────

function DemoVideo() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          See It In Action
        </motion.div>
        <motion.div
          custom={0.1}
          variants={scaleIn}
          className="relative border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-black"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            controls
            className="w-full aspect-video"
          >
            <source src="https://pub-fee9eb6b685a48f2aa263c104838ce5e.r2.dev/402-video-2.mp4" type="video/mp4" />
          </video>
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className="text-[8px] font-mono text-white/60 tracking-[0.2em] uppercase bg-black/50 px-2 py-1">
              $402 Protocol Demo
            </span>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ── Examples ────────────────────────────────────────────────────

function Examples() {
  const examples = [
    {
      path: '$alice',
      title: 'Video Content',
      desc: 'Alice hosts a video. She mints 10,000 tokens.',
      detail: '1 token = 1 view. Token returns to Alice after use. She resells it.',
    },
    {
      path: '$bob/$chatroom',
      title: 'Chat Access',
      desc: 'Bob runs a chatroom. He mints 100 tokens.',
      detail: '1 token = 1 hour access. Max 100 concurrent users. Price floats with demand.',
    },
    {
      path: '$fnews.online',
      title: 'Content Factory',
      desc: 'F.NEWS tokenizes satirical content.',
      detail: 'AI-generated videos served P2P. Speculators fund production. Content pays for itself.',
      link: 'https://fnews.online',
    },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          Examples
        </motion.div>
        <div className="grid md:grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800">
          {examples.map((ex, i) => (
            <motion.div
              key={ex.path}
              custom={0.1 + i * 0.1}
              variants={scaleIn}
              className={`p-8 ${i < 2 ? 'border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800' : ''} hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors`}
            >
              <code className="text-blue-600 dark:text-blue-400 font-mono text-lg font-bold block mb-4">{ex.path}</code>
              <h3 className="text-sm font-black uppercase tracking-wider mb-3">{ex.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">{ex.desc}</p>
              <p className="text-zinc-500 text-xs">{ex.detail}</p>
              {ex.link && (
                <a href={ex.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Visit &rarr;
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

// ── Two Token Model ─────────────────────────────────────────────

function TokenModel() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          Two Token Model
        </motion.div>
        <div className="grid md:grid-cols-2 gap-0 border border-zinc-200 dark:border-zinc-800">
          <motion.div custom={0.1} variants={fadeUp} className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-display font-black tracking-tight mb-6 uppercase">
              $402<span className="text-zinc-300 dark:text-zinc-700"> Protocol</span>
            </h3>
            <div className="space-y-4">
              {[
                ['Earned', 'By running a node and serving the network'],
                ['Standard', 'BSV-21 via POW20 mining (BRC-114)'],
                ['Utility', 'Protocol fees, staking, governance'],
                ['Distribution', 'Fair \u2014 operators earn, not speculators'],
              ].map(([label, desc]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 w-24 shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div custom={0.2} variants={fadeUp} className="p-8 md:p-10">
            <h3 className="text-lg font-display font-black tracking-tight mb-6 uppercase">
              $PATH<span className="text-zinc-300 dark:text-zinc-700"> Tokens</span>
            </h3>
            <div className="space-y-4">
              {[
                ['Minted', 'By anyone, for any URL path'],
                ['Pricing', 'sqrt_decay curve (early buyers win)'],
                ['1 Token', '1 second of access (reusable)'],
                ['Hierarchy', 'Parent tokens grant child path access'],
              ].map(([label, desc]) => (
                <div key={label} className="flex gap-4">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500 w-24 shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Quick Start ─────────────────────────────────────────────────

function QuickStart() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          Quick Start
        </motion.div>
        <div className="border border-zinc-200 dark:border-zinc-800">
          <motion.div custom={0.1} variants={fadeUp} className="p-8 md:p-10 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">01</span>
              <h3 className="text-sm font-black uppercase tracking-wider">Install</h3>
            </div>
            <pre className="bg-zinc-50 dark:bg-zinc-950 p-4 font-mono text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              npm install -g path402
            </pre>
          </motion.div>
          <motion.div custom={0.2} variants={fadeUp} className="p-8 md:p-10 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">02</span>
              <h3 className="text-sm font-black uppercase tracking-wider">Run the Daemon</h3>
            </div>
            <pre className="bg-zinc-50 dark:bg-zinc-950 p-4 font-mono text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
              path402d start
            </pre>
          </motion.div>
          <motion.div custom={0.3} variants={fadeUp} className="p-8 md:p-10">
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">03</span>
              <h3 className="text-sm font-black uppercase tracking-wider">Add to Claude Desktop</h3>
            </div>
            <pre className="bg-zinc-50 dark:bg-zinc-950 p-4 font-mono text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
{`{
  "mcpServers": {
    "path402": {
      "command": "npx",
      "args": ["path402"]
    }
  }
}`}
            </pre>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// ── Roadmap ─────────────────────────────────────────────────────

function Roadmap() {
  const phases = [
    { phase: '1', title: 'Discovery UI', status: 'complete', desc: 'Token marketplace, video previews, metadata display' },
    { phase: '2', title: 'P2P Content Network', status: 'complete', desc: 'libp2p gossip, content storage, NOISE encrypted transport' },
    { phase: '3', title: 'POW20 Token Mining', status: 'active', desc: 'Earn $402 by running nodes and serving content to peers' },
    { phase: '4', title: 'Agentic Content Generation', status: 'upcoming', desc: 'AI-generated content on demand, funded by token speculation' },
    { phase: '5', title: 'Content Flywheel', status: 'upcoming', desc: 'Revenue recycling, auto-funded production, speculative consensus' },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          Roadmap
        </motion.div>
        <div className="border border-zinc-200 dark:border-zinc-800">
          {phases.map((item, i) => (
            <motion.div
              key={i}
              custom={0.1 + i * 0.08}
              variants={slideRight}
              className={`flex items-start gap-6 p-6 ${
                i < phases.length - 1 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''
              } ${item.status === 'active' ? 'bg-zinc-50 dark:bg-zinc-900/20' : ''} hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors`}
            >
              <span className={`w-10 h-10 flex items-center justify-center text-xs font-display font-bold shrink-0 ${
                item.status === 'complete'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-black'
                  : item.status === 'active'
                  ? 'bg-green-500 text-black'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
              }`}>
                {item.phase}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-black tracking-tight">{item.title}</p>
                  <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 border ${
                    item.status === 'complete' ? 'text-zinc-500 border-zinc-300 dark:border-zinc-700' :
                    item.status === 'active' ? 'text-green-500 border-green-500/30' :
                    'text-zinc-400 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p custom={0.6} variants={fadeIn} className="text-zinc-500 text-xs mt-4 font-mono">
          See the content flywheel in action at{' '}
          <a href="https://fnews.online" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-900 dark:hover:text-white transition-colors">fnews.online</a>
        </motion.p>
      </div>
    </motion.section>
  );
}

// ── Ecosystem ───────────────────────────────────────────────────

function Ecosystem() {
  const links = [
    { href: '/download', title: 'Desktop Client', desc: 'Download the $402 daemon for Mac, Windows, Linux', tag: 'download', external: false },
    { href: 'https://www.npmjs.com/package/path402', title: 'path402', desc: 'MCP server + daemon + CLI in one package', tag: 'npm', external: true },
    { href: 'https://github.com/b0ase/path402', title: 'GitHub', desc: 'Source code, issues, and contributions', tag: 'github', external: true },
    { href: '/token', title: 'POW20 Token', desc: 'Earn $402 tokens by running the network', tag: 'token', external: false },
    { href: '/protocol', title: 'Protocol Economics', desc: 'Staking, serving revenue, hierarchical ownership', tag: 'advanced', external: false },
    { href: '/docs', title: 'Documentation', desc: 'Protocol spec, API reference, guides', tag: 'docs', external: false },
    { href: 'https://fnews.online', title: 'F.NEWS', desc: 'The adversarial satire factory \u2014 $402 in action', tag: 'demo', external: true },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="border-b border-zinc-200 dark:border-zinc-900"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div custom={0} variants={fadeIn} className="section-label">
          Ecosystem
        </motion.div>
        <div className="border border-zinc-200 dark:border-zinc-800">
          {links.map((item, i) => {
            const inner = (
              <div className="flex items-center justify-between p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                <div>
                  <h3 className="text-sm font-bold tracking-tight mb-1">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
                <span className="text-zinc-400 dark:text-zinc-600 font-mono text-[9px] uppercase tracking-widest shrink-0 ml-4">
                  {item.tag}
                </span>
              </div>
            );

            return (
              <motion.div
                key={i}
                custom={0.05 + i * 0.05}
                variants={slideRight}
                className={i < links.length - 1 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''}
              >
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                ) : (
                  <Link href={item.href}>{inner}</Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

// ── Final CTA ───────────────────────────────────────────────────

function FinalCTA() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="py-24"
    >
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 text-center">
        <motion.h2
          custom={0.1}
          variants={fadeUp}
          className="text-3xl md:text-5xl font-display font-black tracking-tighter mb-6"
        >
          THE NETWORK NEEDS<br />
          <span className="text-zinc-300 dark:text-zinc-700">OPERATORS</span>
        </motion.h2>
        <motion.p
          custom={0.2}
          variants={fadeIn}
          className="text-zinc-500 mb-10 text-sm font-mono"
        >
          Download the client. Run a node. Earn $402.
        </motion.p>
        <motion.div custom={0.3} variants={fadeUp} className="flex flex-wrap justify-center gap-4">
          <Link
            href="/download"
            className="inline-flex items-center gap-3 px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Client
          </Link>
          <Link
            href="/protocol"
            className="inline-flex items-center gap-2 px-10 py-5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            Protocol Economics &rarr;
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}

// ── Dashboard Panel (Connected State) ───────────────────────────

function DashboardPanel() {
  const { wallet } = useWallet();
  const [identitySymbol, setIdentitySymbol] = useState<string | null>(null);
  const [holding, setHolding] = useState<{ balance: number; stakedBalance: number; pendingDividends: number } | null>(null);
  const [libraryCount, setLibraryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (wallet.handle) headers['x-wallet-handle'] = wallet.handle;
    if (wallet.provider) headers['x-wallet-provider'] = wallet.provider;

    Promise.all([
      fetch('/api/client/identity').then(r => r.json()).catch(() => ({})),
      fetch('/api/token/holding').then(r => r.ok ? r.json() : null).catch(() => null),
      wallet.handle
        ? fetch('/api/tokens/holdings', { headers }).then(r => r.ok ? r.json() : null).catch(() => null)
        : Promise.resolve(null),
    ]).then(([identityData, holdingData, holdingsData]) => {
      if (identityData?.identity) setIdentitySymbol(identityData.identity.symbol);
      if (holdingData) setHolding(holdingData);
      if (holdingsData?.holdings) setLibraryCount(holdingsData.holdings.length);
    }).finally(() => setLoading(false));
  }, [wallet.handle, wallet.provider]);

  const displayName = wallet.handle ? `@${wallet.handle}` : wallet.address ? `${wallet.address.slice(0, 8)}...` : 'Connected';
  const formatNumber = (n: number | undefined | null) => (n ?? 0).toLocaleString();

  return (
    <main className="w-full px-6 md:px-16 py-8 max-w-[1920px] mx-auto">
      {/* PageHeader style */}
      <header className="mb-8 border-b border-zinc-200 dark:border-zinc-900 pb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease }}
          className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          Web Client Online
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease }}
          className="text-4xl md:text-6xl font-black tracking-tighter mb-2 font-display"
        >
          $402_CLIENT
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-zinc-500"
        >
          Welcome, <span className="text-zinc-900 dark:text-white font-bold">{displayName}</span>
        </motion.div>
      </header>

      {/* Status Bar */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-3">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 border text-[10px] font-mono uppercase tracking-widest ${
            identitySymbol
              ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 ${identitySymbol ? 'bg-green-500' : 'bg-amber-500'}`} />
            401 Identity: {loading ? '...' : identitySymbol || 'NOT MINTED'}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-green-500" />
            402 Payment: {displayName} via {wallet.provider}
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="mb-8">
        <div className="section-label">Live Metrics</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-zinc-200 dark:border-zinc-800">
          {[
            { label: '$402', value: formatNumber(holding?.balance), color: '' },
            { label: 'Staked', value: formatNumber(holding?.stakedBalance), color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Revenue', value: formatNumber(holding?.pendingDividends), color: 'text-green-600 dark:text-green-400' },
            { label: 'Library', value: String(libraryCount), color: '' },
          ].map((m, i) => (
            <div key={m.label} className={`p-6 ${i < 3 ? 'border-r border-zinc-200 dark:border-zinc-800' : ''}`}>
              <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-2">{m.label}</div>
              {loading ? (
                <div className="text-sm text-zinc-400 font-mono animate-pulse">...</div>
              ) : (
                <div className={`text-2xl font-black tracking-tighter ${m.color || 'text-zinc-900 dark:text-white'}`}>{m.value}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Action Cards */}
      <section>
        <div className="section-label">Quick Actions</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-zinc-200 dark:border-zinc-800">
          {[
            { href: '/identity', label: '401 // Identity', value: identitySymbol || 'Mint DNA', icon: loading },
            { href: '/wallet', label: '402 // Wallet', value: wallet.provider || 'Connect', icon: false },
            { href: '/library', label: '200 // Library', value: 'Content', icon: false },
            { href: '/settings', label: '200 // Settings', value: 'Configure', icon: false },
            { href: '/token', label: 'POW20', value: 'Token', icon: false },
            { href: '/docs', label: 'Documentation', value: 'Docs', icon: false },
            { href: '/whitepaper', label: 'Protocol Spec', value: 'Whitepaper', icon: false },
            { href: '/market', label: 'Marketplace', value: 'Market', icon: false },
          ].map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              className={`block p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors ${
                i % 4 !== 3 ? 'border-r border-zinc-200 dark:border-zinc-800' : ''
              } ${i < 4 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''}`}
            >
              <div className="text-[9px] text-zinc-500 uppercase tracking-widest mb-2">{card.label}</div>
              {card.icon ? (
                <div className="text-sm text-zinc-400 font-mono animate-pulse">...</div>
              ) : (
                <div className="text-sm font-bold tracking-tight capitalize">{card.value} &rarr;</div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

// ── Main Export ──────────────────────────────────────────────────

export default function Home() {
  const { wallet } = useWallet();

  if (wallet.connected) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white pt-14">
        <DashboardPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">
      <BootSequenceHero />
      <div className="pt-0">
        <StatusGrid />
        <GenesisProof />
        <CoreIdea />
        <PaymentFlow />
        <DemoVideo />
        <Examples />
        <TokenModel />
        <QuickStart />
        <Roadmap />
        <Ecosystem />
        <FinalCTA />
      </div>
    </div>
  );
}
