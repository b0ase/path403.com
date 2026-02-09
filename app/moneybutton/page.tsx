'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiExternalLink, FiUpload } from 'react-icons/fi';
import { FaDollarSign } from 'react-icons/fa';
import { portfolioData } from '@/lib/data';

export default function MoneyButtonPage() {
  const [isHovered, setIsHovered] = useState(false);
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);

  const buttons = useMemo(() =>
    portfolioData.projects.filter(p => p.cardImageUrls && p.cardImageUrls.length > 0),
    []
  );

  const currentButton = buttons[currentButtonIndex];

  useEffect(() => {
    setCurrentButtonIndex(Math.floor(Math.random() * buttons.length));
  }, [buttons.length]);

  const handleClick = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * buttons.length);
    } while (newIndex === currentButtonIndex && buttons.length > 1);
    setCurrentButtonIndex(newIndex);
  };

  return (
    <motion.section
      className="px-4 md:px-8 py-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="w-full">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <FaDollarSign className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                MONEYBUTTON
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                TAP TO TRANSACT
              </div>
            </div>
          </div>

          <p className="text-zinc-400 max-w-2xl">
            Every button is a money button. A tradeable token on the Bitcoin blockchain.
            Get your own MoneyButton for your brand, product, or handle.
          </p>
        </motion.div>

        {/* Button Section - visual only, hero component handles state */}
        <div className="relative py-12">
          <motion.div
            className="flex flex-col items-center justify-center relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {/* Ambient glow behind button */}
            <motion.div
              className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 70%)' }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.button
              onClick={handleClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative w-48 h-48 md:w-64 md:h-64 rounded-full cursor-pointer overflow-hidden"
              style={{
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(236, 72, 153, 0.25), inset 0 -10px 30px rgba(0, 0, 0, 0.4), inset 0 10px 30px rgba(255, 255, 255, 0.1)',
                border: '3px solid rgba(167, 139, 250, 0.5)',
              }}
              animate={{
                scale: isHovered ? 1.1 : [1, 1.02, 1],
                boxShadow: isHovered
                  ? '0 0 60px rgba(59, 130, 246, 0.7), 0 0 100px rgba(236, 72, 153, 0.35), inset 0 -10px 30px rgba(0, 0, 0, 0.4), inset 0 10px 30px rgba(255, 255, 255, 0.15)'
                  : [
                    '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(236, 72, 153, 0.25), inset 0 -10px 30px rgba(0, 0, 0, 0.4), inset 0 10px 30px rgba(255, 255, 255, 0.1)',
                    '0 0 50px rgba(59, 130, 246, 0.6), 0 0 90px rgba(236, 72, 153, 0.3), inset 0 -10px 30px rgba(0, 0, 0, 0.4), inset 0 10px 30px rgba(255, 255, 255, 0.12)',
                    '0 0 40px rgba(59, 130, 246, 0.5), 0 0 80px rgba(236, 72, 153, 0.25), inset 0 -10px 30px rgba(0, 0, 0, 0.4), inset 0 10px 30px rgba(255, 255, 255, 0.1)'
                  ]
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button background image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentButtonIndex}
                  className="absolute inset-0 bg-no-repeat bg-center"
                  style={{
                    backgroundImage: `url(${currentButton?.cardImageUrls?.[0]})`,
                    backgroundSize: '120%',
                    backgroundColor: '#0a0a0a',
                  }}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>

              {/* Dome overlay gradient */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)',
                }}
              />

              {/* Dome highlight - top shine */}
              <div className="absolute top-2 left-1/4 w-1/2 h-1/4 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-sm" />

              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-2 rounded-full"
                style={{
                  background: 'radial-gradient(circle, transparent 60%, rgba(168, 85, 247, 0.3) 100%)',
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.3, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-4 rounded-full border border-purple-400/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.button>

            {/* Button title badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentButtonIndex}
                className="mt-6 px-4 py-2 bg-zinc-900/80 border border-zinc-700 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-white font-bold uppercase tracking-wider text-sm md:text-base">
                  {currentButton?.title || 'MONEY BUTTON'}
                </span>
              </motion.div>
            </AnimatePresence>

            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-zinc-500 text-sm mb-2">
                Click to discover. {buttons.length} MoneyButtons available.
              </p>
              {currentButton && (
                <Link
                  href={`/portfolio/${currentButton.slug}`}
                  className="text-blue-400 hover:text-blue-300 text-xs underline underline-offset-2"
                >
                  View {currentButton.title} →
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="border border-blue-500/30 bg-blue-900/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1 text-white uppercase">
                Get Your MoneyButton
              </h3>
              <p className="text-zinc-500 text-sm">
                Custom MoneyButtons for brands, products, and handles. Own your token.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/moneybutton/upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-green-400 transition-colors whitespace-nowrap"
              >
                <FiUpload size={12} /> Sell Files
              </Link>
              <Link
                href="/buttons"
                className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-800 text-zinc-500 text-xs font-bold uppercase tracking-wider hover:border-zinc-600 hover:text-white transition-colors whitespace-nowrap"
              >
                All Buttons
              </Link>
              <a
                href="https://themoneybutton.store"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-blue-400 transition-colors whitespace-nowrap"
              >
                Order Now <FiExternalLink size={12} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
