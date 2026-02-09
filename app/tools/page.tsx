'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiVideo, FiRadio, FiArrowRight, FiTool, FiFilm, FiZap, FiBook,
  FiFileText, FiCircle, FiDollarSign, FiShield, FiSend, FiImage, FiCpu, FiCode, FiEdit3
} from 'react-icons/fi';
import Link from 'next/link';

export default function ToolsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative z-10 max-w-pillar mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">

          {/* Header */}
          <motion.div
            className="mb-16 border-b border-zinc-900 pb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="bg-zinc-950/50 p-4 md:p-6 border border-zinc-900 rounded-pillar self-start">
                <FiTool className="text-4xl md:text-6xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-2">
                  TOOLS<span className="text-zinc-800">.BIN</span>
                </h1>
                <p className="text-zinc-500 uppercase text-xs tracking-widest">Autonomous Utility Infrastructure</p>
              </div>
            </div>
          </motion.div>

          {/* Proprietary Tools Section */}
          <div className="mb-24">
            <h2 className="text-[10px] font-bold text-zinc-500 mb-8 border-b border-zinc-950 inline-block uppercase tracking-widest">
              PROPRIETARY_EXECUTABLES
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {/* Video Generator */}
              <Link href="/video/editor/generator" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiVideo className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Nano Banana Video Gen</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    AI-powered video generation module. Create, edit, and export sequenced video content directly from text prompts.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">AI</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Video</span>
                  </div>
                </motion.div>
              </Link>

              {/* TX Broadcaster */}
              <Link href="/tx-broadcaster" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiRadio className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">BSV-21 TX Broadcaster</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Direct-to-network transaction broadcasting utility. Push raw hex transactions to the Bitcoin SV network instantly.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Blockchain</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Utility</span>
                  </div>
                </motion.div>
              </Link>
              {/* Money Buttons */}
              <Link href="/buttons" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <span className="text-sm">🔴</span>
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Money Buttons</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Token minting buttons for each B0ase.com project. Press to support and earn tokens with bonding curve economics.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Tokens</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Minting</span>
                  </div>
                </motion.div>
              </Link>

              {/* Video Studio */}
              <Link href="/video/editor/studio" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiFilm className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Video Studio</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Professional video editor with Bitcoin tokenization. Create, edit, and mint video assets on-chain.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Video</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Tokenize</span>
                  </div>
                </motion.div>
              </Link>

              {/* Chaos Mixer */}
              <Link href="/video/editor" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiZap className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Chaos Mixer</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Experimental glitch video mixer with jump cuts, RGB shift, strobe effects, and auto-chaos mode.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Glitch</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Effects</span>
                  </div>
                </motion.div>
              </Link>

              {/* Auto-Book */}
              <Link href="/tools/auto-book" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiBook className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Auto-Book</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    AI-powered book concept generator. Plan your next book with automated chapter outlines and publishing guidance.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">AI</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Publishing</span>
                  </div>
                </motion.div>
              </Link>

              {/* Graphic Designer */}
              <Link href="/tools/graphic-designer" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiImage className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Graphic Designer</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Custom OG image and attachment generator. Mash up project images with typography to create social media assets.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Design</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">OG Images</span>
                  </div>
                </motion.div>
              </Link>

              {/* SCADA Operations */}
              <Link href="/tools/scada" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiCpu className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">SCADA Operations</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Industrial control and monitoring dashboard. Manage automated triggers, smart devices, and chain-of-custody logs.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Infrastructure</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Control</span>
                  </div>
                </motion.div>
              </Link>

              {/* ScrollPay */}
              <Link href="/tools/scrollpay" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <span className="text-sm">📜</span>
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">ScrollPay</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Pay-to-scroll infrastructure for social apps. Automatically buy tokens from creators as you scroll past their content.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Social</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Micropayments</span>
                  </div>
                </motion.div>
              </Link>

              {/* Button Graphic Creator */}
              <Link href="/tools/button-graphic-creator" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiCircle className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Button Creator</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Design custom button graphics for tokens and MoneyButtons. Choose styles, shapes, and export as PNG.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Design</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Graphics</span>
                  </div>
                </motion.div>
              </Link>

              {/* BSV Scripts */}
              <Link href="/tools/scripts" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiCode className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">BSV Scripts</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Build complex Bitcoin transactions: escrow, subscriptions, crowdfunding, vesting, and multisig wallets.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Blockchain</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Scripts</span>
                  </div>
                </motion.div>
              </Link>

              {/* Video Course Maker */}
              <Link href="/tools/video-course-maker" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiFilm className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Video Course Maker</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Automated course production: AI scripts, generated slides, synthetic voiceover, YouTube publishing.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">AI</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Video</span>
                  </div>
                </motion.div>
              </Link>

              {/* BitSign */}
              <Link href="/tools/bit-sign" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiEdit3 className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">BitSign</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Blockchain-verified document signing. Draw or type signatures, verify with wallet, inscribe on BSV as permanent proof.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Blockchain</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Signatures</span>
                  </div>
                </motion.div>
              </Link>

              {/* Bit Certificates */}
              <Link href="/tools/bit-certificates" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiFileText className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Bit Certificates</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Issue and verify digital share certificates anchored on Bitcoin. Link director signatures to immutable stock records.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Blockchain</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Equity</span>
                  </div>
                </motion.div>
              </Link>

              {/* File Hash */}
              <Link href="/tools/file-hash" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiShield className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">File Hash</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Hash any file and inscribe the proof on Bitcoin. Immutable timestamps, verifiable authenticity, downloadable certificates.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Blockchain</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Hashing</span>
                  </div>
                </motion.div>
              </Link>

            </div>
          </div>

          <div className="mb-24">
            <h2 className="text-[10px] font-bold text-zinc-500 mb-8 border-b border-zinc-950 inline-block uppercase tracking-widest">
              TOKEN_INFRASTRUCTURE_MANAGEMENT
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {/* Registry */}
              <Link href="/tools/registry" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiFileText className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Registry</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Register users, companies, projects, and tokens. Central registry for all token management entities.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Registry</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Tokens</span>
                  </div>
                </motion.div>
              </Link>

              {/* Mint */}
              <Link href="/tools/mint" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiCircle className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Mint Tokens</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Create and distribute tokens to users. Supports BSV, ETH, and SOL with on-chain execution.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Minting</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Multi-chain</span>
                  </div>
                </motion.div>
              </Link>

              {/* Cap Table */}
              <Link href="/tools/cap" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiCircle className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Cap Table</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    View and manage token ownership. Track shareholders, percentages, and export cap tables to CSV.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Equity</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Reporting</span>
                  </div>
                </motion.div>
              </Link>

              {/* Dividends */}
              <Link href="/tools/dividends" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiDollarSign className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Dividends</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Distribute earnings to token holders. Automated per-token calculations and payment tracking.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Payments</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Distribution</span>
                  </div>
                </motion.div>
              </Link>

              {/* KYC Verification */}
              <Link href="/tools/verify" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiShield className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">KYC Verification</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Verify user identity for compliant token transactions. Document upload and admin approval workflow.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">KYC</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Compliance</span>
                  </div>
                </motion.div>
              </Link>

              {/* Transfers */}
              <Link href="/tools/transfer" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiSend className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">Token Transfers</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Record and execute token transfers between shareholders. Track sales, gifts, and vesting releases.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Transfers</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Trading</span>
                  </div>
                </motion.div>
              </Link>

              {/* ID Tokeniser */}
              <Link href="/tools/id-tokeniser" className="block group">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-zinc-950/40 border border-zinc-900 p-6 h-full hover:border-zinc-500 transition-all duration-300 rounded-pillar group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-10 bg-black border border-zinc-900 rounded-pillar flex items-center justify-center group-hover:border-white transition-colors">
                      <FiShield className="text-sm text-white" />
                    </div>
                    <FiArrowRight className="text-zinc-800 group-hover:text-zinc-400 text-sm transition-colors" />
                  </div>

                  <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3">ID Tokeniser</h3>
                  <p className="text-zinc-600 text-[10px] uppercase tracking-tighter mb-6 leading-relaxed flex-grow">
                    Encrypt and inscribe identity documents on-chain. Issue hash-backed tokens for identity verification.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Encryption</span>
                    <span className="text-[9px] uppercase font-bold border border-zinc-900 px-1.5 py-0.5 text-zinc-700 group-hover:border-white group-hover:text-white transition-all">Identity</span>
                  </div>
                </motion.div>
              </Link>

            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-16 border border-zinc-900 bg-zinc-950/20 rounded-pillar relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FiTool size={120} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-4">CUSTOM_DEVELOPMENT_UNIT</h3>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-8 max-w-md mx-auto leading-relaxed">
                WE_BUILD_BESPOKE_AI_AGENTS_BLOCKCHAIN_UTILITIES_AND_AUTOMATION_SCRIPTS_FOR_ENTERPRISE_CLIENTS.
              </p>
              <Link href="/contact" className="inline-block bg-white text-black px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all rounded-pillar">
                REQUEST_DEVELOPMENT
              </Link>
            </div>
          </div>

        </div>
      </motion.section>
    </motion.div>
  );
}