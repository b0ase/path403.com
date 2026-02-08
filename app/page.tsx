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

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white">

      {/* HERO */}
      <section className="relative min-h-[80vh] flex flex-col justify-center overflow-hidden bg-black">
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
                  HTTP 403 : FORBIDDEN &mdash; YOU SHALL NOT PASS
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease }}
                className="font-display font-black tracking-tighter leading-[0.85] mb-2"
                style={{
                  fontSize: 'clamp(4rem, 12vw, 12rem)',
                  textShadow: '0 0 10px rgba(245, 158, 11, 0.4), 0 0 30px rgba(245, 158, 11, 0.2), 0 0 60px rgba(245, 158, 11, 0.1)',
                }}
              >
                <span className="text-white">$403</span>
              </motion.h1>

              {/* Reflection */}
              <div
                className="relative overflow-hidden h-12 md:h-20 select-none mb-8"
                aria-hidden="true"
                style={{
                  transform: 'scaleY(-1)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent 80%)',
                  maskImage: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent 80%)',
                }}
              >
                <div
                  className="font-display font-black tracking-tighter leading-[0.85] text-amber-400/30"
                  style={{ fontSize: 'clamp(4rem, 12vw, 12rem)' }}
                >
                  $403
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-2"
              >
                <span className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-tight">
                  PATH 403 &mdash; PROGRAMMABLE ACCESS CONTROL
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mb-4"
              >
                <span className="text-zinc-500 text-xs tracking-[0.4em] uppercase font-mono">
                  WHO SEES WHAT. WHEN. WHERE. WHY.
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-zinc-500 max-w-xl text-sm leading-relaxed mb-12 font-mono"
              >
                The <code className="text-amber-400 bg-zinc-900 px-1.5 py-0.5 border border-zinc-800">$403</code> standard
                is the access control layer of the protocol stack.
                Geo-gates, time-locks, blacklists, compliance rules, and programmable permissions &mdash;
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
                {/* Overlay content */}
                <div className="relative z-10 p-8 md:p-10 flex flex-col justify-between h-full">
                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-amber-500/30" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-amber-500/30" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-amber-500/30" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-amber-500/30" />

                  {/* Label */}
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

                  {/* Bottom data strip */}
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

      {/* THE PROBLEM */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            The Problem
          </motion.div>
          <div className="grid md:grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800">
            <motion.div custom={0.1} variants={fadeUp} className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
              <div className="text-[9px] text-red-500 font-mono uppercase tracking-[0.2em] mb-4">Current State</div>
              <p className="text-lg font-black tracking-tight mb-2">Platform Rules</p>
              <p className="text-zinc-500 text-sm">YouTube decides who sees your content. Spotify decides where it plays. The platform controls the gate and keeps the key.</p>
            </motion.div>
            <motion.div custom={0.2} variants={fadeUp} className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
              <div className="text-[9px] text-amber-500 font-mono uppercase tracking-[0.2em] mb-4">The Gap</div>
              <p className="text-lg font-black tracking-tight mb-2">No Standard</p>
              <p className="text-zinc-500 text-sm">$401 handles identity. $402 handles payment. But there&apos;s no standard for permissions, restrictions, and access rules. Until now.</p>
            </motion.div>
            <motion.div custom={0.3} variants={fadeUp} className="p-8 md:p-10">
              <div className="text-[9px] text-green-500 font-mono uppercase tracking-[0.2em] mb-4">$403 Solution</div>
              <p className="text-lg font-black tracking-tight mb-2">On-Chain Rules</p>
              <p className="text-zinc-500 text-sm">The content creator defines the rules. The protocol enforces them. No platform required. The gate is programmable and the creator holds the key.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* THE STACK */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            The Complete Stack
          </motion.div>
          <div className="grid md:grid-cols-2 gap-0 border border-zinc-200 dark:border-zinc-800">
            <motion.div custom={0.1} variants={fadeUp} className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-6 font-display">
                401<span className="text-zinc-300 dark:text-zinc-800">.</span><br />
                402<span className="text-zinc-300 dark:text-zinc-800">.</span><br />
                403<span className="text-amber-500">.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-md">
                Three HTTP status codes. Three protocol standards. One complete access control system
                for the decentralised web. Identity, payment, and permissions &mdash; every request passes through all three.
              </p>
            </motion.div>
            <div className="flex flex-col">
              <motion.div custom={0.2} variants={fadeUp} className="p-8 md:p-12 border-b border-zinc-200 dark:border-zinc-800 flex-1">
                <div className="text-[9px] text-violet-500 font-mono uppercase tracking-[0.2em] mb-4">$401</div>
                <p className="text-xl font-black tracking-tight mb-2 text-zinc-400">&ldquo;Who are you?&rdquo;</p>
                <p className="text-zinc-500 text-sm">Identity verification. Self-sovereign, peer-underwritten, progressive disclosure.</p>
              </motion.div>
              <motion.div custom={0.25} variants={fadeUp} className="p-8 md:p-12 border-b border-zinc-200 dark:border-zinc-800 flex-1">
                <div className="text-[9px] text-green-500 font-mono uppercase tracking-[0.2em] mb-4">$402</div>
                <p className="text-xl font-black tracking-tight mb-2 text-zinc-400">&ldquo;Pay for access&rdquo;</p>
                <p className="text-zinc-500 text-sm">Micropayments. Content tokens. Revenue routing. The economic layer.</p>
              </motion.div>
              <motion.div custom={0.3} variants={fadeUp} className="p-8 md:p-12 flex-1">
                <div className="text-[9px] text-amber-500 font-mono uppercase tracking-[0.2em] mb-4">$403</div>
                <p className="text-xl font-black tracking-tight mb-2">&ldquo;Are you allowed?&rdquo;</p>
                <p className="text-zinc-500 text-sm">Permissions. Geo-gates. Time-locks. Blacklists. Compliance. The rules layer.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            How Access Control Works
          </motion.div>
          <div className="border border-zinc-200 dark:border-zinc-800">
            {[
              {
                step: '01',
                title: 'Request arrives at a tokenised domain',
                desc: 'A user or agent sends a request to a $402-enabled URL. Before payment is even considered, $403 rules are checked first.',
                accent: false,
              },
              {
                step: '02',
                title: '$403 evaluates the ruleset',
                desc: 'The on-chain ruleset is read: geo-restrictions, time-locks, identity requirements, blacklists, custom conditions. All composable, all transparent.',
                accent: false,
              },
              {
                step: '03',
                title: 'Forbidden or proceed',
                desc: 'If any rule fails, the request gets a 403 Forbidden response with a machine-readable explanation of which rule was violated and what would satisfy it.',
                accent: false,
              },
              {
                step: '04',
                title: '$401 checks identity (if required)',
                desc: 'Some $403 rules require a minimum identity level. "Only Level 2+ identities can access this content." The $401 token satisfies the check automatically.',
                accent: false,
              },
              {
                step: '05',
                title: '$402 handles payment',
                desc: 'If all $403 rules pass and $401 identity checks pass, the $402 payment layer activates. Pay, receive token, access content. The full stack in one request.',
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
                  item.accent ? 'bg-amber-500 text-white' : 'bg-zinc-100 dark:bg-zinc-900'
                }`}>
                  {item.step}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold tracking-tight mb-1">{item.title}</p>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </div>
                {item.accent && (
                  <span className="relative flex h-2 w-2 self-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* RULE TYPES */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800">
            {[
              {
                icon: '\uD83C\uDF0D',
                title: 'Geo-Gate',
                desc: 'Restrict content by jurisdiction. Block specific countries, allow specific regions. Useful for regulatory compliance and licensing.',
                tag: 'geo',
              },
              {
                icon: '\u23F0',
                title: 'Time-Lock',
                desc: 'Embargo content until a specific date or block height. Release schedules, pre-orders, timed exclusives — all enforced on-chain.',
                tag: 'temporal',
              },
              {
                icon: '\uD83D\uDEAB',
                title: 'Blacklist',
                desc: 'Deny specific addresses, identities, or token holders. DMCA takedowns, sanctions compliance, creator-defined blocks.',
                tag: 'deny',
              },
              {
                icon: '\uD83C\uDFAD',
                title: 'Identity Gate',
                desc: 'Require a minimum $401 identity level. "Level 2+ only" for premium content. "Level 3 required" for legal documents.',
                tag: '$401',
              },
              {
                icon: '\uD83D\uDD11',
                title: 'Token Gate',
                desc: 'Require ownership of specific tokens. Hold $KWEG to access Kweg-exclusive content. Hold $BOASE for insider updates.',
                tag: 'token',
              },
              {
                icon: '\u2699\uFE0F',
                title: 'Custom Logic',
                desc: 'Arbitrary programmable conditions. Smart contracts, oracle feeds, multi-sig requirements. If you can express it, you can enforce it.',
                tag: 'programmable',
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
                <div className="text-2xl mb-3 opacity-60">{item.icon}</div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-2">{item.title}</h3>
                <p className="text-zinc-500 text-sm mb-3">{item.desc}</p>
                <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest">{item.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* USE CASES */}
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
          <div className="border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                  <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Scenario</th>
                  <th className="text-center p-4 text-[9px] font-bold uppercase tracking-widest text-amber-500">$403 Rule</th>
                  <th className="text-left p-4 text-[9px] font-bold uppercase tracking-widest text-zinc-500">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Film rights restricted to UK', 'Geo-gate: GB only', 'Non-UK requests get 403 with explanation'],
                  ['Album drops on Friday', 'Time-lock: 2026-02-14T00:00Z', 'Early requests get 403 with countdown'],
                  ['Sanctioned entity tries to access', 'Blacklist: address match', 'Blocked permanently with compliance reference'],
                  ['Legal document needs verified signer', 'Identity-gate: Level 3', 'Unverified users get 403 with upgrade path'],
                  ['Exclusive content for token holders', 'Token-gate: hold $KWEG', 'Non-holders get 403 with purchase link'],
                  ['Multi-sig corporate access', 'Custom: 2-of-3 signatures', 'Single sig gets 403 with co-signer instructions'],
                ].map(([scenario, rule, outcome], i) => (
                  <tr
                    key={scenario}
                    className={`${i < 5 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''} hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors`}
                  >
                    <td className="p-4 text-sm">{scenario}</td>
                    <td className="p-4 text-center text-sm text-amber-500 font-bold">{rule}</td>
                    <td className="p-4 text-sm text-zinc-500">{outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <motion.p custom={0.3} variants={fadeIn} className="text-zinc-500 text-xs mt-4 font-mono">
            Every 403 response includes a machine-readable explanation. Clients and agents can parse the reason and act accordingly.
          </motion.p>
        </div>
      </motion.section>

      {/* THE REQUEST FLOW */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="border-b border-zinc-200 dark:border-zinc-900"
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
          <motion.div custom={0} variants={fadeIn} className="section-label">
            The Request Flow
          </motion.div>
          <div className="border border-zinc-200 dark:border-zinc-800">
            <motion.div custom={0.1} variants={fadeUp} className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter mb-6 font-display">
                THREE CHECKS<span className="text-amber-500">.</span> ONE REQUEST<span className="text-amber-500">.</span>
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl mb-8">
                Every request to a tokenised domain passes through the same sequence.
                $403 runs first &mdash; if you&apos;re forbidden, you don&apos;t even get asked to identify or pay.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-zinc-200 dark:border-zinc-800">
                {[
                  { step: '1', label: '$403', desc: 'Are you allowed?', color: 'text-amber-500' },
                  { step: '2', label: '$401', desc: 'Who are you?', color: 'text-violet-500' },
                  { step: '3', label: '$402', desc: 'Pay for access', color: 'text-green-500' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    custom={0.2 + i * 0.08}
                    variants={scaleIn}
                    className={`p-6 ${i < 2 ? 'md:border-r border-zinc-200 dark:border-zinc-800' : ''} border-b md:border-b-0 border-zinc-200 dark:border-zinc-800 last:border-b-0`}
                  >
                    <div className={`text-3xl font-display font-black mb-2 ${item.color}`}>{item.step}</div>
                    <p className="text-lg font-bold uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-zinc-500 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
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
            PROGRAMMABLE<br />
            <span className="text-amber-500">ACCESS CONTROL</span>
          </motion.h2>
          <motion.p
            custom={0.2}
            variants={fadeIn}
            className="text-zinc-500 mb-10 text-sm font-mono"
          >
            The missing layer of the protocol stack. Define the rules. The chain enforces them.
          </motion.p>
          <motion.div custom={0.3} variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Link
              href="/spec"
              className="inline-flex items-center gap-3 px-10 py-5 bg-amber-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition-colors"
            >
              Read the $403 Spec
            </Link>
            <a
              href="https://path401.com"
              className="inline-flex items-center gap-2 px-10 py-5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-widest text-xs hover:border-violet-500/50 hover:text-violet-400 transition-colors"
            >
              $401 Identity &rarr;
            </a>
            <a
              href="https://path402.com"
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
