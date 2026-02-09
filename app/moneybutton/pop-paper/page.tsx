'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import {
  FiGrid,
  FiDollarSign,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiCode,
  FiExternalLink,
} from 'react-icons/fi';

interface PopButton {
  id: number;
  popped: boolean;
  popping: boolean;
}

export default function PopPaperPage() {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [pricePerPop, setPricePerPop] = useState('0.01');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Generate buttons grid
  const [buttons, setButtons] = useState<PopButton[]>(() =>
    Array.from({ length: rows * cols }, (_, i) => ({ id: i, popped: false, popping: false }))
  );

  // Reset buttons when dimensions change
  const resetButtons = useCallback(() => {
    setButtons(Array.from({ length: rows * cols }, (_, i) => ({ id: i, popped: false, popping: false })));
  }, [rows, cols]);

  // Handle pop
  const handlePop = (id: number) => {
    setButtons(prev => prev.map(btn =>
      btn.id === id && !btn.popped
        ? { ...btn, popping: true }
        : btn
    ));

    // After animation, mark as popped
    setTimeout(() => {
      setButtons(prev => prev.map(btn =>
        btn.id === id ? { ...btn, popped: true, popping: false } : btn
      ));
    }, 300);
  };

  // Update grid when dimensions change
  React.useEffect(() => {
    resetButtons();
  }, [rows, cols, resetButtons]);

  // Generate embed URL
  const embedUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/moneybutton/pop-paper/embed?rows=${rows}&cols=${cols}&price=${pricePerPop}&handle=${creatorHandle}`
    : '';

  const embedCode = `<iframe
  src="${embedUrl}"
  width="${cols * 52 + 32}"
  height="${rows * 52 + 32}"
  frameborder="0"
  style="border-radius: 8px; overflow: hidden;"
></iframe>`;

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const poppedCount = buttons.filter(b => b.popped).length;
  const totalButtons = buttons.length;
  const totalEarnings = poppedCount * parseFloat(pricePerPop || '0');

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <div className="px-4 md:px-8 py-16 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-red-900/50 p-4 md:p-6 border border-red-800 self-start">
              <FiGrid className="text-4xl md:text-6xl text-red-400" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                POP PAPER
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                BUBBLE WRAP FOR BITCOIN
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Create a sheet of MoneyButton pop bubbles. Each pop pays you instantly via HandCash.
            Satisfying for them, profitable for you.
          </p>
          <div className="mt-4">
            <Link
              href="/moneybutton/pop-paper/fullscreen"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-bold uppercase tracking-wider hover:bg-red-400 transition-colors"
            >
              <FiGrid size={16} />
              Try Fullscreen Mode
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Configuration */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-6 text-white flex items-center gap-2">
                <FiGrid className="text-red-400" />
                Configure Your Pop Paper
              </h3>

              <div className="space-y-4">
                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Rows
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={rows}
                      onChange={(e) => setRows(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                      Columns
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={cols}
                      onChange={(e) => setCols(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Price per pop */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Price per Pop (USD)
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="number"
                      min={0.01}
                      max={100}
                      step={0.01}
                      value={pricePerPop}
                      onChange={(e) => setPricePerPop(e.target.value)}
                      className="w-full bg-black border border-zinc-800 pl-10 pr-4 py-3 text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* HandCash Handle */}
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                    Your HandCash Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                    <input
                      type="text"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      placeholder="yourhandle"
                      className="w-full bg-black border border-zinc-800 pl-8 pr-4 py-3 text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <p className="text-zinc-600 text-xs mt-1">You'll receive payment for each pop</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{totalButtons}</p>
                    <p className="text-xs text-zinc-500">Total Pops</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">${(totalButtons * parseFloat(pricePerPop || '0')).toFixed(2)}</p>
                    <p className="text-xs text-zinc-500">Max Earnings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">{poppedCount}</p>
                    <p className="text-xs text-zinc-500">Popped</p>
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetButtons}
                  className="w-full border border-zinc-800 text-zinc-500 py-3 text-sm font-bold uppercase tracking-wider hover:border-zinc-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <FiRefreshCw /> Reset Preview
                </button>
              </div>
            </div>

            {/* Embed Code */}
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white flex items-center gap-2">
                <FiCode className="text-blue-400" />
                Embed Code
              </h3>

              {creatorHandle ? (
                <>
                  <div className="bg-zinc-900 p-4 font-mono text-xs text-zinc-400 overflow-x-auto mb-4">
                    <pre>{embedCode}</pre>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={copyEmbed}
                      className="flex-1 bg-blue-500 text-black py-3 text-sm font-bold uppercase tracking-wider hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy Code</>}
                    </button>
                    <Link
                      href={embedUrl}
                      target="_blank"
                      className="px-4 py-3 border border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white transition-colors flex items-center justify-center"
                    >
                      <FiExternalLink />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-zinc-500 text-sm">Enter your HandCash handle to generate embed code</p>
              )}
            </div>
          </motion.div>

          {/* Right: Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-6 text-white">Live Preview</h3>

              {/* Pop Paper */}
              <div className="flex justify-center">
                <div
                  className="bg-red-600 p-4 rounded-lg shadow-2xl shadow-red-900/50"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 44px)`,
                    gap: '4px',
                  }}
                >
                  {buttons.map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => !btn.popped && handlePop(btn.id)}
                      disabled={btn.popped}
                      className={`
                        relative w-11 h-11 rounded-full transition-all duration-200
                        ${btn.popped
                          ? 'bg-red-800 cursor-default shadow-inner'
                          : 'bg-gradient-to-br from-red-400 to-red-600 hover:from-red-300 hover:to-red-500 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                        }
                      `}
                      style={{
                        boxShadow: btn.popped
                          ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
                          : '0 4px 6px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.2)'
                      }}
                    >
                      {/* Bubble highlight */}
                      {!btn.popped && (
                        <div className="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full blur-[1px]" />
                      )}

                      {/* Pop animation */}
                      <AnimatePresence>
                        {btn.popping && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <span className="text-yellow-300 font-black text-xs drop-shadow-lg" style={{ textShadow: '0 0 10px rgba(253, 224, 71, 0.8)' }}>
                              POP!
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Dollar sign on unpopped */}
                      {!btn.popped && !btn.popping && (
                        <FaDollarSign className="absolute inset-0 m-auto text-red-800/30 text-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Stats */}
              <div className="mt-6 text-center">
                <p className="text-zinc-500 text-sm">
                  {poppedCount} of {totalButtons} popped
                  {poppedCount > 0 && (
                    <span className="text-green-400 ml-2">
                      (${totalEarnings.toFixed(2)} earned)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-6 border border-zinc-800 bg-black p-6">
              <h3 className="text-sm font-bold uppercase mb-4 text-white">How It Works</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">1</div>
                  <p className="text-zinc-400">Configure your pop paper dimensions and price</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">2</div>
                  <p className="text-zinc-400">Enter your HandCash handle to receive payments</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">3</div>
                  <p className="text-zinc-400">Copy the embed code and add it to your site</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 rounded-full">$</div>
                  <p className="text-zinc-400">Get paid every time someone pops a bubble!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back Link */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/moneybutton"
            className="text-zinc-500 text-sm hover:text-white transition-colors"
          >
            ← Back to MoneyButton
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
