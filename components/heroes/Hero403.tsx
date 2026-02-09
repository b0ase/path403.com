'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const ease = [0.16, 1, 0.3, 1];

export default function Hero403() {
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
        <source src="/403-hero.mp4" type="video/mp4" />
      </video>

      {/* Background texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 35%, transparent 70%)',
        }}
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
        <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-amber-500/10" />
        <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-amber-500/10" />
        <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-amber-500/10" />
        <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-amber-500/10" />
        <div className="absolute top-8 left-20 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
          ACCESS CONTROL PROTOCOL v1.0
        </div>
        <div className="absolute bottom-8 left-20 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
          HTTP 403: FORBIDDEN
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="text-zinc-600 text-[10px] tracking-[0.3em] uppercase font-mono font-bold">
                HTTP 403 : FORBIDDEN
              </span>
            </motion.div>

            {/* THE MASSIVE $403 TITLE */}
            <div className="relative mb-0">
              <motion.h1
                className="font-display font-black tracking-tighter leading-[0.85]"
                style={{ fontSize: 'clamp(5rem, 12vw, 12rem)' }}
              >
                {['$', '4', '0', '3'].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.12, ease }}
                    className="inline-block text-white"
                    style={{ textShadow: '0 0 10px rgba(245, 158, 11, 0.4), 0 0 30px rgba(245, 158, 11, 0.2), 0 0 60px rgba(245, 158, 11, 0.1)' }}
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
                  className="font-display font-black tracking-tighter leading-[0.85] text-amber-400/30"
                  style={{ fontSize: 'clamp(5rem, 12vw, 12rem)' }}
                >
                  $403
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
                className="absolute top-[65%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"
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
                PATH 403 &mdash; FORBIDDEN
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-zinc-500 max-w-xl text-sm leading-relaxed mb-8 font-mono"
            >
              The <code className="text-amber-400 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">$403</code> standard
              is the access control layer of the protocol stack.
              Geo-gates, time-locks, blacklists, compliance rules, and programmable permissions &mdash;
              all enforced on-chain, all composable with $401 identity and $402 payment.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/spec"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-amber-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition-all overflow-hidden"
              >
                Read the Spec
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
              <a
                href="https://path402.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-zinc-600 hover:text-white transition-all"
              >
                $402 Protocol &rarr;
              </a>
              <a
                href="https://path401.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-amber-500/50 hover:text-amber-400 transition-all"
              >
                $401 Identity &rarr;
              </a>
            </motion.div>
          </div>

          {/* RIGHT: Access control panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease }}
            className="hidden lg:flex flex-col w-[400px] xl:w-[480px] flex-shrink-0 mt-6"
          >
            <div className="relative border border-zinc-800 overflow-hidden flex-1 bg-zinc-950">
              <div className="relative z-10 p-8 md:p-10 flex flex-col justify-between h-full">
                <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-amber-500/30" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-amber-500/30" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-amber-500/30" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-amber-500/30" />
                <div className="text-[8px] text-zinc-600 font-mono tracking-[0.3em] uppercase mb-6">
                  SYS::ACCESS_CONTROL
                </div>
                <div>
                  <h2 className="text-2xl xl:text-3xl font-black tracking-tighter mb-5 font-display leading-tight text-white">
                    THE GATE<span className="text-zinc-700">.</span><br />
                    THE RULES<span className="text-zinc-700">.</span><br />
                    THE PROTOCOL<span className="text-zinc-700">.</span>
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-red-500/80 shrink-0" />
                      <span className="text-sm text-zinc-400"><span className="text-red-400 font-bold">Geo-gate</span> &mdash; restrict by jurisdiction</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-amber-500/80 shrink-0" />
                      <span className="text-sm text-zinc-400"><span className="text-amber-400 font-bold">Time-lock</span> &mdash; embargo until a date</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-violet-500/80 shrink-0" />
                      <span className="text-sm text-zinc-400"><span className="text-violet-400 font-bold">Identity-gate</span> &mdash; require $401 level</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 bg-green-500/80 shrink-0" />
                      <span className="text-sm text-zinc-400"><span className="text-green-400 font-bold">Blacklist</span> &mdash; deny specific actors</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-4 text-[8px] font-mono text-zinc-700 tracking-wider">
                  <span>PROTO::HTTP/403</span>
                  <span className="w-1 h-1 bg-zinc-800" />
                  <span>MODE::ENFORCE</span>
                  <span className="w-1 h-1 bg-zinc-800" />
                  <span>RULES::ON_CHAIN</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </section>
  );
}
