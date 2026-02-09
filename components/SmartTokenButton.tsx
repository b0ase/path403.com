'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getMintedTokens, getConceptTokens, type TokenInfo } from '@/lib/token-registry';
import { portfolioData } from '@/lib/data';

// Tokens to cycle through with their destinations
interface TokenDisplay {
  symbol: string;
  name: string;
  href: string;
  color: string;
  bgImage?: string;
}

// Get project image by slug
const getProjectImage = (projectSlug?: string): string | undefined => {
  if (!projectSlug) return undefined;
  const project = portfolioData.projects.find(p => p.slug === projectSlug);
  return project?.cardImageUrls?.[0];
};

// Build the token display list from registry - ALL tokens
const buildTokenList = (): TokenDisplay[] => {
  const mintedTokens = getMintedTokens();
  const conceptTokens = getConceptTokens();

  const tokens: TokenDisplay[] = [
    // Always start with $BOASE as first token (default)
    {
      symbol: '$BOASE',
      name: 'b0ase.com',
      href: '/',
      color: 'from-blue-500 to-purple-600',
      bgImage: '/boase_icon.png',
    },
  ];

  // Add ALL minted tokens (except BOASE which is already first)
  mintedTokens.forEach(token => {
    if (token.symbol === '$BOASE') return;
    tokens.push({
      symbol: token.symbol,
      name: token.name,
      href: token.projectSlug ? `/portfolio/${token.projectSlug}` : (token.marketUrl || '/exchange'),
      color: getTokenColor(token.symbol),
      bgImage: getProjectImage(token.projectSlug),
    });
  });

  // Add ALL concept tokens
  conceptTokens.forEach(token => {
    tokens.push({
      symbol: token.symbol,
      name: token.name,
      href: token.projectSlug ? `/portfolio/${token.projectSlug}` : '/exchange',
      color: getTokenColor(token.symbol),
      bgImage: getProjectImage(token.projectSlug),
    });
  });

  return tokens;
};

// Get a gradient color based on token symbol
const getTokenColor = (symbol: string): string => {
  const colors: Record<string, string> = {
    '$BOASE': 'from-blue-500 to-purple-600',
    '$NPG': 'from-pink-500 to-red-500',
    '$bCorp': 'from-amber-500 to-orange-600',
    '$BSHEETS': 'from-green-500 to-emerald-600',
    '$MONEYBUTTON': 'from-emerald-400 to-green-500',
    '$OK': 'from-lime-500 to-green-600',
    '$FLOOP': 'from-yellow-400 to-orange-500',
    '$TRIBE': 'from-purple-500 to-indigo-600',
    '$HFLIX': 'from-red-500 to-pink-500',
    '$META': 'from-cyan-500 to-blue-500',
    '$AIGF': 'from-pink-400 to-rose-500',
    '$bMail': 'from-blue-400 to-cyan-500',
    '$bOs': 'from-slate-500 to-zinc-600',
    '$bDrive': 'from-sky-500 to-blue-600',
    '$bChat': 'from-violet-500 to-purple-600',
    '$bPay': 'from-green-500 to-teal-500',
    '$bID': 'from-indigo-500 to-blue-600',
    '$bVault': 'from-amber-600 to-yellow-500',
    '$bSearch': 'from-red-500 to-orange-500',
    '$AIBC': 'from-cyan-400 to-blue-500',
  };
  return colors[symbol] || 'from-gray-500 to-gray-600';
};

interface SmartTokenButtonProps {
  isDark?: boolean;
  boaseTokens?: number;
  idleTimeout?: number; // ms before cycling starts (default 15000)
  cycleInterval?: number; // ms between token changes (default 4000)
  standalone?: boolean; // When true, removes navbar-specific styling
  disableActivityReset?: boolean; // When true, don't reset on user activity (for testing)
  staticMode?: boolean; // When true, always show $BOASE, no cycling
  startIndex?: number; // Start cycling from this token index (default 0)
  size?: 'sm' | 'md' | 'ml' | 'lg'; // Button size: sm=48px, md=64px, ml=80px, lg=96px
  showRing?: boolean; // Show outer glow and pulsing ring (default true)
  showBadge?: boolean; // Show token symbol badge (default true)
}

export default function SmartTokenButton({
  isDark = true,
  boaseTokens = 0,
  idleTimeout = 15000,
  cycleInterval = 4000,
  standalone = false,
  disableActivityReset = false,
  staticMode = false,
  startIndex = 0,
  size = 'lg',
  showRing = true,
  showBadge = true,
}: SmartTokenButtonProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(startIndex);
  const [tokens] = useState<TokenDisplay[]>(buildTokenList);

  // Size mappings
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    ml: 'w-20 h-20',
    lg: 'w-24 h-24',
  };
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Reset to $BOASE (index 0) and restart idle timer
  const resetToDefault = useCallback(() => {
    setIsIdle(false);
    setCurrentTokenIndex(0);
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);

    // Start new idle timer
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, idleTimeout);
  }, [idleTimeout]);

  // Start cycling through tokens when idle (unless staticMode)
  useEffect(() => {
    if (staticMode) return; // Never cycle in static mode

    if (isIdle) {
      cycleTimerRef.current = setInterval(() => {
        setCurrentTokenIndex(prev => (prev + 1) % tokens.length);
      }, cycleInterval);
    } else {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    }

    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, [isIdle, cycleInterval, tokens.length, staticMode]);

  // Listen for user activity (unless disabled for testing or in static mode)
  useEffect(() => {
    // Static mode - never start cycling
    if (staticMode) return;

    // If activity reset is disabled, just start idle timer immediately
    if (disableActivityReset) {
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, idleTimeout);
      return () => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
      };
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      const now = Date.now();

      // Debounce - ignore events within 500ms of each other
      if (now - lastActivityRef.current < 500) return;
      lastActivityRef.current = now;

      // If currently cycling (idle), reset to $BOASE
      if (isIdle) {
        setIsIdle(false);
        setCurrentTokenIndex(0);
      }

      // Always restart the idle timer
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, idleTimeout);
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial idle timer - start counting immediately
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, idleTimeout);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, [isIdle, disableActivityReset, idleTimeout]);

  // Force $BOASE when in static mode, otherwise use cycling token
  const currentToken = staticMode
    ? { symbol: '$BOASE', name: 'b0ase.com', href: '/', color: 'from-blue-500 to-purple-600', bgImage: '/boase_icon.png' }
    : tokens[currentTokenIndex];
  const isDefaultBoase = staticMode || currentTokenIndex === 0;

  return (
    <Link
      href={currentToken.href}
      className={standalone
        ? `flex items-center justify-center transition-colors group`
        : `hidden md:flex flex-shrink-0 items-center justify-center px-6 border-r ${
            isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'
          } transition-colors group`
      }
      title={`${currentToken.symbol} - ${currentToken.name}`}
      onClick={() => {
        // If clicking while cycling, let it navigate but reset on next activity
        if (!isDefaultBoase) {
          // Don't prevent navigation - let them go to the token page
        }
      }}
    >
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow - pulses when cycling */}
        {showRing && (
          <motion.div
            className="absolute -inset-4 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
            style={{
              background: !isDark
                ? `radial-gradient(circle, rgba(0,0,0,0.2) 0%, transparent 70%)`
                : `radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)`,
              filter: 'blur(10px)',
            }}
            animate={isIdle ? {
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            } : {}}
            transition={{
              duration: 2,
              repeat: isIdle ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Pulsing ring - more active when cycling */}
        {showRing && (
          <motion.div
            className={`absolute -inset-2 rounded-full border ${
              !isDark
                ? (isIdle ? 'border-black/40' : 'border-black/20')
                : (isIdle ? 'border-white/40' : 'border-white/20')
            }`}
            animate={{
              scale: [1, 1.15, 1],
              opacity: isIdle ? [0.4, 0.1, 0.4] : [0.3, 0, 0.3],
            }}
            transition={{
              duration: isIdle ? 1.5 : 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}


        {/* Button container */}
        <div
          className={`relative ${sizeClasses[size]}`}
        >
          {/* Circle with image - clipped */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            animate={{
              background: !isDark ? (isDark ? 'white' : 'black') : 'black',
            }}
            transition={{ duration: 0.5 }}
            style={{
              boxShadow: !isDark
                ? (isDark ? '0 0 40px rgba(255,255,255,0.3), 0 4px 20px rgba(255,255,255,0.2)' : '0 0 40px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)')
                : '0 0 40px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              border: !isDark
                ? (isDark ? '3px solid rgba(0,0,0,0.3)' : '3px solid rgba(255,255,255,0.2)')
                : '3px solid rgba(255,255,255,0.2)',
            }}
          >
            {/* Background gradient based on token - hidden when inverted */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${currentToken.color}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: !isDark ? 0 : 0.3 }}
              key={`${currentToken.symbol}-${!isDark}`}
            />

            {/* Image for BOASE, gradient for others */}
            <AnimatePresence mode="wait">
              {currentToken.bgImage ? (
                <motion.div
                  key={`img-${currentToken.symbol}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentToken.bgImage}
                    alt={currentToken.symbol}
                    fill
                    className="object-cover transition-all duration-500"
                    style={{
                      filter: !isDark ? 'invert(1)' : 'none',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Glossy overlay - inverts with button */}
            <div className={`absolute inset-0 bg-gradient-to-br via-transparent to-transparent ${
              !isDark ? 'from-black/15' : 'from-white/15'
            }`} />
          </motion.div>

          {/* Token symbol badge - centered at bottom, outside clip area */}
          {showBadge && (
            <div className="absolute -bottom-2 inset-x-0 flex justify-center z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentToken.symbol}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="px-2 py-0.5 rounded-full bg-black/90 border border-white/30 text-[9px] font-bold font-mono text-white whitespace-nowrap"
                >
                  {currentToken.symbol}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
