'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNavbar } from '@/components/NavbarProvider';
import {
  FiArrowLeft,
  FiArrowRight,
  FiDollarSign,
  FiSearch,
  FiZap,
  FiLock,
  FiEye,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiGlobe,
  FiDatabase,
  FiUsers,
  FiCpu
} from 'react-icons/fi';

// Custom SVG illustration components
const SearchMoneyIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 400 400" className="w-full h-full">
    <defs>
      <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
      </linearGradient>
      <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* Background circles */}
    <circle cx="200" cy="200" r="180" fill={isDark ? "#1f2937" : "#f3f4f6"} opacity="0.5" />
    <circle cx="200" cy="200" r="140" fill={isDark ? "#111827" : "#e5e7eb"} opacity="0.5" />
    {/* Magnifying glass */}
    <motion.g
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <circle cx="180" cy="160" r="70" fill="none" stroke="url(#searchGrad)" strokeWidth="12" />
      <line x1="230" y1="210" x2="290" y2="270" stroke="url(#searchGrad)" strokeWidth="16" strokeLinecap="round" />
    </motion.g>
    {/* Floating coins */}
    <motion.g animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
      <circle cx="100" cy="280" r="25" fill="url(#coinGrad)" />
      <text x="100" y="288" textAnchor="middle" fill="#78350f" fontSize="20" fontWeight="bold">$</text>
    </motion.g>
    <motion.g animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.3 }}>
      <circle cx="300" cy="120" r="20" fill="url(#coinGrad)" />
      <text x="300" y="127" textAnchor="middle" fill="#78350f" fontSize="16" fontWeight="bold">$</text>
    </motion.g>
    <motion.g animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.6 }}>
      <circle cx="320" cy="280" r="30" fill="url(#coinGrad)" />
      <text x="320" y="290" textAnchor="middle" fill="#78350f" fontSize="24" fontWeight="bold">$</text>
    </motion.g>
    {/* Data flow lines */}
    <motion.path
      d="M 180 230 Q 200 260 230 250 Q 270 240 290 270"
      fill="none"
      stroke="#10b981"
      strokeWidth="3"
      strokeDasharray="8,8"
      animate={{ strokeDashoffset: [0, -16] }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    />
  </svg>
);

const FlowIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 600 200" className="w-full h-auto">
    <defs>
      <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
    {/* Background */}
    <rect x="0" y="0" width="600" height="200" fill={isDark ? "#0f172a" : "#f8fafc"} rx="20" />
    {/* Flow path */}
    <motion.path
      d="M 50 100 L 150 100 L 200 50 L 300 150 L 400 50 L 450 100 L 550 100"
      fill="none"
      stroke="url(#flowGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    {/* Nodes */}
    {[50, 200, 300, 400, 550].map((x, i) => (
      <motion.circle
        key={i}
        cx={x}
        cy={i === 0 || i === 4 ? 100 : i === 1 || i === 3 ? 50 : 150}
        r="15"
        fill={isDark ? "#1e293b" : "#fff"}
        stroke={["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#10b981"][i]}
        strokeWidth="3"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.2 + 0.5 }}
      />
    ))}
    {/* Labels */}
    <text x="50" y="140" textAnchor="middle" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="10" fontWeight="bold">USER</text>
    <text x="200" y="35" textAnchor="middle" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="10" fontWeight="bold">CLICK</text>
    <text x="300" y="180" textAnchor="middle" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="10" fontWeight="bold">VERIFY</text>
    <text x="400" y="35" textAnchor="middle" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="10" fontWeight="bold">PAY</text>
    <text x="550" y="140" textAnchor="middle" fill={isDark ? "#94a3b8" : "#64748b"} fontSize="10" fontWeight="bold">CREATOR</text>
  </svg>
);

const NetworkIllustration = ({ isDark }: { isDark: boolean }) => (
  <svg viewBox="0 0 300 300" className="w-full h-full">
    <defs>
      <radialGradient id="nodeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#059669" />
      </radialGradient>
    </defs>
    {/* Connection lines */}
    <motion.g strokeWidth="2" stroke={isDark ? "#374151" : "#d1d5db"}>
      <line x1="150" y1="50" x2="50" y2="150" />
      <line x1="150" y1="50" x2="250" y2="150" />
      <line x1="50" y1="150" x2="150" y2="250" />
      <line x1="250" y1="150" x2="150" y2="250" />
      <line x1="50" y1="150" x2="250" y2="150" />
      <line x1="150" y1="50" x2="150" y2="250" />
    </motion.g>
    {/* Central node */}
    <motion.circle
      cx="150" cy="150" r="30"
      fill="url(#nodeGrad)"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    />
    <text x="150" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">BSV</text>
    {/* Outer nodes */}
    {[
      { x: 150, y: 50, label: "SEO" },
      { x: 50, y: 150, label: "ADS" },
      { x: 250, y: 150, label: "CONTENT" },
      { x: 150, y: 250, label: "USERS" },
    ].map((node, i) => (
      <motion.g key={i} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.25 }}>
        <circle cx={node.x} cy={node.y} r="25" fill={isDark ? "#1f2937" : "#f3f4f6"} stroke="#10b981" strokeWidth="2" />
        <text x={node.x} y={node.y + 4} textAnchor="middle" fill={isDark ? "#e5e7eb" : "#374151"} fontSize="8" fontWeight="bold">{node.label}</text>
      </motion.g>
    ))}
    {/* Data packets */}
    <motion.circle
      cx="150" cy="150" r="6" fill="#fbbf24"
      animate={{ cx: [150, 50], cy: [150, 150], opacity: [1, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
    <motion.circle
      cx="150" cy="150" r="6" fill="#fbbf24"
      animate={{ cx: [150, 250], cy: [150, 150], opacity: [1, 0] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.5 }}
    />
  </svg>
);

export default function SEOMicropaymentsFuturePage() {
  const { isDark } = useNavbar();

  const thesisPoints = [
    { icon: FiTrendingUp, title: "Traffic Has Value", desc: "Every click, view, and second of attention is worth something. Currently wasted or captured by middlemen." },
    { icon: FiDollarSign, title: "Micropayments Scale", desc: "BSV handles 50,000+ tx/sec with sub-cent fees. The infrastructure exists today." },
    { icon: FiGlobe, title: "$600B+ Market", desc: "Digital advertising alone. SEO services add $80B. Affiliate marketing $17B. Even 1% is massive." },
    { icon: FiUsers, title: "Long Tail Unlocked", desc: "Millions of sites can't monetize due to ad network minimums. Micropayments change that." },
  ];

  const unknowns = [
    { title: "User Friction", question: "Will users accept paying $0.001 per click? What UX makes this invisible?" },
    { title: "Bot Prevention", question: "If views = money, bots farm views. What's the cryptographic proof of human attention?" },
    { title: "Price Discovery", question: "How much is a click worth? Real-time auction? Fixed rates? Bonding curves?" },
    { title: "The Index Problem", question: "Google's power is the index. Centralized index = same problems. Decentralized = how?" },
    { title: "Scale Reality", question: "100,000 searches/second. BSV can handle it. But the UX layer? Wallet fatigue is real." },
    { title: "Privacy Tradeoffs", question: "Every click on-chain is worse than cookies. How do we balance transparency with anonymity?" },
  ];

  const approaches = [
    { step: "01", title: "Start B2B", desc: "Businesses understand paying for leads. No consumer education needed." },
    { step: "02", title: "Prove Small", desc: "One vertical. One use case. Measurable ROI. Then expand." },
    { step: "03", title: "Build Primitives", desc: "Payment channels. Attribution oracles. Fraud detection. Infrastructure, not products." },
    { step: "04", title: "Enable Others", desc: "We don't build the search engine. We build the payment layer any search engine can use." },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-20 transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Back Link */}
        <Link href="/smart-contracts/index" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-500 transition-colors mb-12 font-mono text-xs uppercase tracking-widest">
          <FiArrowLeft /> Back to Smart Contracts
        </Link>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-emerald-500 font-mono text-xs font-bold tracking-[0.35em] uppercase mb-4">
              Research Note / Future Markets
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8">
              SEO <span className="text-emerald-500">+</span><br />
              MICROPAYMENTS
            </h1>
            <p className={`text-xl md:text-2xl leading-relaxed mb-10 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              The thesis: <strong>Traffic has value. Micropayments can capture it.</strong> If we get the infrastructure right, this is a trillion-dollar market waiting to be unlocked.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="px-8 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all active:scale-95">
                Build With Us
              </Link>
              <Link href="/smart-contracts/form" className={`px-8 py-4 font-black uppercase text-xs tracking-widest rounded-xl border transition-all ${isDark ? 'border-zinc-800 hover:bg-zinc-900' : 'border-zinc-200 hover:bg-zinc-100'} text-emerald-500`}>
                Get a Quote
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className={`aspect-square rounded-3xl overflow-hidden border p-8 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
              <SearchMoneyIllustration isDark={isDark} />
            </div>
          </motion.div>
        </div>

        {/* The Problem - Visual */}
        <motion.div
          className={`p-12 md:p-16 rounded-[3rem] mb-24 ${isDark ? 'bg-red-500/5 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-8">
            The Current Model is <span className="text-red-500">Broken</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: "30-50%", label: "Taken by ad networks before reaching publishers" },
              { stat: "$100B+", label: "Lost annually to click fraud (~20-35% of ad spend)" },
              { stat: "???", label: "Attribution is broken - who drove the conversion?" },
              { stat: "$100", label: "Minimum thresholds exclude long-tail creators" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`p-6 rounded-2xl ${isDark ? 'bg-black/50' : 'bg-white'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl font-black text-red-500 mb-2">{item.stat}</div>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* The New Model - Visual Flow */}
        <motion.div
          className="mb-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-center">
            The <span className="text-emerald-500">New</span> Model
          </h2>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Direct value flow from user to creator. No middlemen. Instant settlement.
          </p>
          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
            <FlowIllustration isDark={isDark} />
          </div>
        </motion.div>

        {/* Thesis Points */}
        <div className="mb-32">
          <motion.h2
            className="text-3xl md:text-4xl font-black mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            What We <span className="text-emerald-500">Know</span> Works
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {thesisPoints.map((item, i) => (
              <motion.div
                key={i}
                className={`p-8 rounded-2xl border transition-all hover:scale-105 ${isDark ? 'bg-zinc-900/30 border-zinc-800 hover:border-emerald-500/50' : 'bg-zinc-50 border-zinc-100 hover:border-emerald-500/50'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <item.icon className="text-4xl text-emerald-500 mb-6" />
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The Unknowns - Key Section */}
        <motion.div
          className={`p-12 md:p-20 rounded-[3rem] mb-32 relative overflow-hidden ${isDark ? 'bg-zinc-900/50' : 'bg-zinc-100'}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <FiCpu className="absolute -right-20 -bottom-20 text-[20rem] text-emerald-500/5" />
          <div className="relative z-10">
            <div className="text-orange-500 font-mono text-xs font-bold tracking-[0.35em] uppercase mb-4">
              Critical Research Questions
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-12">
              What We <span className="text-orange-500">Don't</span> Know
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unknowns.map((item, i) => (
                <motion.div
                  key={i}
                  className={`p-6 rounded-2xl border-l-4 border-orange-500 ${isDark ? 'bg-black/50' : 'bg-white'}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h3 className="font-black text-lg mb-2">{item.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.question}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* How It Could Work - Visual Flow */}
        <div className="mb-32">
          <motion.h2
            className="text-3xl md:text-4xl font-black mb-4 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Could <span className="text-emerald-500">Work</span>
          </motion.h2>
          <p className={`text-center mb-12 max-w-2xl mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Four models for micropayment-based traffic monetization
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: FiSearch, title: "Pay-Per-Rank", desc: "Businesses bid satoshis to appear in results. Each click triggers instant payment. No minimums, no contracts." },
              { icon: FiEye, title: "Pay-Per-View Content", desc: "$0.001 per view × 1M views = $1,000. No ads. No subscriptions. Pure value exchange." },
              { icon: FiZap, title: "Affiliate Micropayments", desc: "Every referral pays instantly on click, not just conversion. Graduated: click → engagement → purchase." },
              { icon: FiUsers, title: "Attention Markets", desc: "Users get paid to view ads. Advertisers pay users directly. No platform taking 50%." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`p-8 rounded-2xl border flex gap-6 ${isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <item.icon className="text-2xl text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-2">{item.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our Approach */}
        <motion.div
          className={`p-12 md:p-20 rounded-[3rem] mb-32 ${isDark ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-black mb-12">
            Our <span className="text-emerald-500">Approach</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {approaches.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-6xl font-black text-emerald-500/20 mb-4">{item.step}</div>
                <h3 className="text-xl font-black mb-2">{item.title}</h3>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Risks */}
        <div className="mb-32">
          <motion.h2
            className="text-3xl md:text-4xl font-black mb-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The <span className="text-red-500">Risks</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Regulatory", desc: "Money transmission laws. Securities implications. KYC could kill UX." },
              { title: "Adoption", desc: "Users need wallets. Businesses need to understand crypto. Steep learning curve." },
              { title: "Competition", desc: "Google could launch their own micropayment layer. They have users, index, capital." },
              { title: "Timing", desc: "Too early = burn capital educating. Too late = incumbents adapted." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`p-6 rounded-2xl border ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FiAlertTriangle className="text-red-500 text-2xl mb-4" />
                <h3 className="font-black mb-2">{item.title}</h3>
                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className={`p-12 md:p-20 rounded-[3rem] relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-emerald-900/30 to-blue-900/30 border border-emerald-500/20' : 'bg-gradient-to-br from-emerald-100 to-blue-100'}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Want to Build This<span className="text-emerald-500">?</span>
              </h2>
              <p className={`text-xl mb-10 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                We're looking for researchers, builders, and believers.
                If you see what we see, let's talk.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="px-8 py-4 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all active:scale-95">
                  Get in Touch <FiArrowRight className="inline ml-2" />
                </Link>
                <Link href="/smart-contracts" className={`px-8 py-4 font-black uppercase text-xs tracking-widest rounded-xl border transition-all ${isDark ? 'border-zinc-700 hover:bg-zinc-900' : 'border-zinc-300 hover:bg-white'}`}>
                  Explore Smart Contracts
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <NetworkIllustration isDark={isDark} />
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className={`text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Last updated: January 2026 · This is a living document. Our thinking evolves as we learn more.
          </p>
        </div>
      </div>
    </div>
  );
}
