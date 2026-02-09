'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero401() {
  return (
    <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden bg-black">
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/401-hero.mp4" type="video/mp4" />
      </video>

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-40"
        style={{ backgroundImage: 'url(/hero-bg.png)' }}
      />

      {/* CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* HUD corners */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-violet-500/10" />
        <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-violet-500/10" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-violet-500/10" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-violet-500/10" />
        <div className="absolute top-8 left-20 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
          IDENTITY PROTOCOL v1.0
        </div>
        <div className="absolute bottom-8 left-20 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
          HTTP 401: UNAUTHORIZED
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 md:px-16 max-w-[1920px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-12">
          {/* LEFT: Title + CTA */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
              </span>
              <span className="text-zinc-600 text-[10px] tracking-[0.3em] uppercase font-mono font-bold">
                HTTP 401 : UNAUTHORIZED
              </span>
            </motion.div>

            {/* THE MASSIVE $401 TITLE */}
            <div className="relative mb-0">
              <motion.h1
                className="font-display font-black tracking-tighter leading-[0.85]"
                style={{ fontSize: 'clamp(5rem, 12vw, 12rem)' }}
              >
                {['$', '4', '0', '1'].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease }}
                    className="inline-block text-white"
                    style={{ textShadow: '0 0 10px rgba(139, 92, 246, 0.4), 0 0 30px rgba(139, 92, 246, 0.2), 0 0 60px rgba(139, 92, 246, 0.1)' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Reflection */}
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
                  className="font-display font-black tracking-tighter leading-[0.85] text-violet-400/30"
                  style={{ fontSize: 'clamp(5rem, 12vw, 12rem)' }}
                >
                  $401
                </div>
              </div>

              {/* Scan lines */}
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: [0, 1, 1, 0], originX: [0, 0, 1, 1] }}
                transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
                className="absolute top-[60%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
              <motion.div
                initial={{ scaleX: 0, originX: 1 }}
                animate={{ scaleX: [0, 1, 1, 0], originX: [1, 1, 0, 0] }}
                transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
                className="absolute top-[65%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"
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
                PATH 401 &mdash; PROVE WHO YOU ARE
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-zinc-500 max-w-xl text-sm leading-relaxed mb-8 font-mono"
            >
              Before you can follow the money, you need to know who you are.
              The <code className="text-violet-400 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">$401</code> standard
              is your cryptographic identity &mdash; encrypted, self-sovereign, and inscribed on-chain forever.
              Your peers decide what it&apos;s worth.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="https://path402.com/identity"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-violet-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-violet-700 transition-all overflow-hidden"
              >
                Mint Your Identity
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
              <a
                href="https://bit-sign.online"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-zinc-600 hover:text-white transition-all"
              >
                bit-sign.online &rarr;
              </a>
              <Link
                href="/spec"
                className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-violet-500/50 hover:text-violet-400 transition-all"
              >
                Read the Spec &rarr;
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Identity panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
            className="hidden lg:flex flex-col w-[400px] xl:w-[480px] flex-shrink-0 mt-6"
          >
            <div className="relative border border-zinc-800 overflow-hidden flex-1">
              <img
                src="/third-way.png"
                alt="Three approaches to identity"
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
              <div className="relative z-10 p-8 md:p-10 flex flex-col justify-between h-full bg-gradient-to-t from-black/90 via-black/50 to-black/70">
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-violet-500/30" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-violet-500/30" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-violet-500/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-violet-500/30" />
                <div className="text-[8px] text-zinc-600 font-mono tracking-[0.3em] uppercase mb-6">
                  SYS::IDENTITY_MODEL
                </div>
                <div>
                  <h2 className="text-2xl xl:text-3xl font-black tracking-tighter mb-5 font-display leading-tight text-white">
                    THREE MODELS<span className="text-zinc-700">.</span><br />
                    ONE SOLUTION<span className="text-zinc-700">.</span>
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-red-500/80 shrink-0" />
                      <span className="text-sm text-zinc-400"><span className="text-red-400 font-bold">Surveillance</span> &mdash; state watches you</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-amber-500/80 shrink-0" />
                      <span className="text-sm text-zinc-400"><span className="text-amber-400 font-bold">Corporate KYC</span> &mdash; they own your data</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-violet-500/80 shrink-0" />
                      <span className="text-sm text-zinc-400"><span className="text-violet-400 font-bold">Peer Underwriting</span> &mdash; you own yourself</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-4 text-[8px] font-mono text-zinc-700 tracking-wider">
                  <span>PROTO::HTTP/401</span>
                  <span className="w-1 h-1 bg-zinc-800" />
                  <span>ID::PEER_STAKE</span>
                  <span className="w-1 h-1 bg-zinc-800" />
                  <span>ROOT::ON_CHAIN</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
    </section>
  );
}
