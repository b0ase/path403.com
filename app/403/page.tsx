'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
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
    opacity: 1, scale: 1,
    transition: { duration: 0.7, delay, ease }
  })
};

const slideRight = {
  hidden: { opacity: 0, x: -40 },
  visible: (delay: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.6, delay, ease }
  })
};

export default function Page403() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden bg-black">
        {/* Background video — inside HUD frame */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute left-1/2 -translate-x-1/2 opacity-30"
          style={{ width: 'calc(100% - 8rem)', top: '-16%' }}
        >
          <source src="/403-RED-1.mp4" type="video/mp4" />
        </video>

        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Radial glow — amber for access control */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.02) 35%, transparent 70%)',
            }}
          />
        </div>

        {/* CRT vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />

        {/* HUD corners */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-red-500/10" />
          <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-red-500/10" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-red-500/10" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-red-500/10" />
          <div className="absolute top-8 left-20 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
            ACCESS CONTROL PROTOCOL v1.0
          </div>
          <div className="absolute bottom-8 left-20 text-[7px] font-mono text-zinc-700 tracking-[0.25em]">
            HTTP 403: FORBIDDEN
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 md:px-16 max-w-[1920px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-zinc-600 text-[10px] tracking-[0.3em] uppercase font-mono font-bold">
              HTTP 403 : FORBIDDEN &mdash; ACCESS DENIED
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="font-display font-black tracking-tighter leading-[0.85] mb-2"
            style={{
              fontSize: 'clamp(4rem, 12vw, 12rem)',
              textShadow: '0 0 10px rgba(239, 68, 68, 0.4), 0 0 30px rgba(239, 68, 68, 0.2), 0 0 60px rgba(239, 68, 68, 0.1)',
            }}
          >
            <span className="text-white">$403</span>
          </motion.h1>

          {/* Reflection */}
          <div
            className="relative overflow-hidden h-6 md:h-10 select-none mb-0"
            aria-hidden="true"
            style={{
              transform: 'scaleY(-1)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent 80%)',
              maskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent 80%)',
            }}
          >
            <div
              className="font-display font-black tracking-tighter leading-[0.85] text-red-400/30"
              style={{ fontSize: 'clamp(4rem, 12vw, 12rem)' }}
            >
              $403
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-4"
          >
            <span className="text-zinc-400 text-xl md:text-2xl tracking-[0.3em] uppercase font-display font-black">
              THE FORBIDDEN PATH
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-zinc-500 max-w-xl text-sm leading-relaxed mb-12 font-mono"
          >
            The <code className="text-red-400 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">$403</code> standard
            is the access control layer of the protocol stack.
            Geo-gates, time-locks, blacklists, compliance rules &mdash;
            all enforced on-chain, all composable with $401 identity and $402 payment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/spec"
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all overflow-hidden"
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
              className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-red-500/50 hover:text-red-400 transition-all"
            >
              $401 Identity &rarr;
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
      </section>

      {/* ═══ THE IDEA ═══ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            Access Control
          </motion.div>
          <div className="grid md:grid-cols-2 gap-0 border border-zinc-200 dark:border-zinc-800">
            <motion.div custom={0.1} variants={fadeUp} className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 font-display">
                NOT EVERY<span className="text-zinc-300 dark:text-zinc-800">.</span><br />
                PATH IS<span className="text-zinc-300 dark:text-zinc-800">.</span><br />
                FOR YOU<span className="text-zinc-300 dark:text-zinc-800">.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                Some content is restricted by law. Some by choice. Some by time.
                The $403 protocol enforces access rules on-chain &mdash; no middleware, no backend,
                no trust required. The rules are the rules.
              </p>
            </motion.div>
            <div className="flex flex-col">
              <motion.div custom={0.2} variants={fadeUp} className="p-8 md:p-12 border-b border-zinc-200 dark:border-zinc-800 flex-1">
                <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.2em] mb-4">$402 says</div>
                <p className="text-xl font-black tracking-tight mb-2 text-zinc-400">&ldquo;Pay to access&rdquo;</p>
                <p className="text-zinc-500 text-sm">Economic access. Anyone who pays can enter. The market decides.</p>
              </motion.div>
              <motion.div custom={0.3} variants={fadeUp} className="p-8 md:p-12 flex-1">
                <div className="text-[9px] text-red-500 font-mono uppercase tracking-[0.2em] mb-4">$403 says</div>
                <p className="text-xl font-black tracking-tight mb-2">&ldquo;You shall not pass&rdquo;</p>
                <p className="text-zinc-500 text-sm">Programmable denial. Geo-fencing, age-gating, time-locks, blacklists. Payment alone is not enough.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══ RULE TYPES ═══ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            Rule Types
          </motion.div>
          <div className="border border-zinc-200 dark:border-zinc-800">
            {[
              {
                step: '01',
                title: 'Geo-gate',
                desc: 'Restrict content by jurisdiction. Block or allow specific countries, regions, or IP ranges. Useful for regulatory compliance.',
                color: 'text-red-500',
                accent: false,
              },
              {
                step: '02',
                title: 'Time-lock',
                desc: 'Embargo content until a specific date. Release schedules, pre-sale windows, limited-time access. The blockchain is the clock.',
                color: 'text-red-500',
                accent: false,
              },
              {
                step: '03',
                title: 'Identity-gate',
                desc: 'Require a specific $401 identity level. Age verification, KYC tiers, reputation thresholds. No identity? No entry.',
                color: 'text-violet-500',
                accent: false,
              },
              {
                step: '04',
                title: 'Blacklist',
                desc: 'Deny specific actors by address, identity, or pattern. Sanctions compliance, content moderation, community governance.',
                color: 'text-zinc-500',
                accent: false,
              },
              {
                step: '05',
                title: 'Composite rules',
                desc: 'Combine any rules with AND/OR logic. "UK residents AND age 18+ AND not blacklisted." The gate is programmable.',
                color: 'text-red-400',
                accent: true,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={0.1 + i * 0.08}
                variants={slideRight}
                className={`flex items-start gap-6 p-6 ${
                  i < 4 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''
                } hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors`}
              >
                <span className={`w-10 h-10 flex items-center justify-center text-xs font-display font-bold shrink-0 ${
                  item.accent ? 'bg-red-500 text-black' : 'bg-zinc-100 dark:bg-zinc-900'
                }`}>
                  {item.step}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold tracking-tight">{item.title}</p>
                    <span className={`text-[8px] font-mono font-bold uppercase ${item.color}`}>{item.color.replace('text-', '').replace('-500', '').replace('-400', '')}</span>
                  </div>
                  <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
                </div>
                {item.accent && (
                  <span className="relative flex h-2 w-2 self-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ THE STACK ═══ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            The Protocol Stack
          </motion.div>
          <div className="grid md:grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800">
            {[
              {
                code: '401',
                title: 'Identity',
                desc: 'Who are you? Encrypted, self-sovereign, peer-underwritten identity inscribed on-chain.',
                color: 'text-violet-500',
                borderColor: 'border-violet-500/20',
                href: 'https://path401.com',
              },
              {
                code: '402',
                title: 'Payment',
                desc: 'Follow the money. Tokenized content access, sqrt_decay pricing, AI-native micropayments.',
                color: 'text-green-500',
                borderColor: 'border-green-500/20',
                href: 'https://path402.com',
              },
              {
                code: '403',
                title: 'Access Control',
                desc: 'The gate. Geo-fencing, time-locks, blacklists, identity-gating. Programmable denial.',
                color: 'text-red-500',
                borderColor: 'border-red-500/20',
                href: '#',
              },
            ].map((item, i) => (
              <motion.a
                key={item.code}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                custom={0.1 + i * 0.1}
                variants={scaleIn}
                className={`p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors ${
                  i < 2 ? 'border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800' : ''
                }`}
              >
                <div className={`text-4xl font-display font-black tracking-tighter mb-4 ${item.color}`}>
                  ${item.code}
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm">{item.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ USE CASES ═══ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            Use Cases
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800">
            {[
              {
                title: 'Age-Restricted Content',
                desc: 'Adult content, gambling, alcohol. Require $401 age verification before granting access. No cookies, no popups, no honor system.',
                tag: 'compliance',
              },
              {
                title: 'Sanctions Compliance',
                desc: 'Automatically block access from sanctioned jurisdictions. The rule is on-chain and auditable. Regulators can verify enforcement.',
                tag: 'legal',
              },
              {
                title: 'Timed Releases',
                desc: 'Embargo content until a specific block height or timestamp. Film premieres, music drops, news embargoes. The blockchain is the clock.',
                tag: 'timing',
              },
              {
                title: 'Subscriber-Only',
                desc: 'Gate content behind token ownership. Hold 10 $PATH tokens? You get access. No subscription service, no recurring billing.',
                tag: 'access',
              },
              {
                title: 'Community Governance',
                desc: 'Let token holders vote on who gets blacklisted. Decentralized moderation with on-chain accountability.',
                tag: 'governance',
              },
              {
                title: 'API Rate Limiting',
                desc: 'Enforce access limits per identity, per time window, per geography. Programmable rate limiting without middleware.',
                tag: 'infrastructure',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                custom={0.1 + i * 0.08}
                variants={scaleIn}
                className={`p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors ${
                  i % 3 !== 2 ? 'md:border-r border-zinc-200 dark:border-zinc-800' : ''
                } ${i < 3 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''}`}
              >
                <h3 className="text-sm font-black uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm mb-3">{item.desc}</p>
                <span className="text-[8px] font-mono text-red-500 uppercase tracking-widest">{item.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ CTA ═══ */}
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
            THE GATE IS<br />
            <span className="text-red-500">PROGRAMMABLE</span>
          </motion.h2>
          <motion.p
            custom={0.2}
            variants={fadeIn}
            className="text-zinc-500 mb-10 text-sm font-mono"
          >
            Read the spec. Build the rules. Enforce the protocol.
          </motion.p>
          <motion.div custom={0.3} variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href="/spec"
              className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
            >
              Read the Spec
            </Link>
            <a
              href="https://path402.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              $402 Protocol &rarr;
            </a>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
