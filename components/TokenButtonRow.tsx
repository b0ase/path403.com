'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getMintedTokens, getConceptTokens } from '@/lib/token-registry';
import { portfolioData } from '@/lib/data';

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

// Build the token display list from registry - exclude $BOASE
const buildTokenList = (): TokenDisplay[] => {
  const mintedTokens = getMintedTokens();
  const conceptTokens = getConceptTokens();
  const tokens: TokenDisplay[] = [];

  // Add minted tokens (except BOASE and ZUMO)
  mintedTokens.forEach(token => {
    if (token.symbol === '$BOASE' || token.symbol === '$ZUMO') return;
    tokens.push({
      symbol: token.symbol,
      name: token.name,
      href: token.projectSlug ? `/portfolio/${token.projectSlug}` : (token.marketUrl || '/exchange'),
      color: getTokenColor(token.symbol),
      bgImage: getProjectImage(token.projectSlug),
    });
  });

  // Add concept tokens
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

interface TokenButtonRowProps {
  count?: number; // Ignored now, kept for prop compatibility
  isDark?: boolean;
  cycleInterval?: number; // Ignored now
  size?: 'sm' | 'md' | 'ml' | 'lg';
  gap?: string; // Used for container gap
  colorTheme?: string; // Color theme for proper styling in colored modes
}

export default function TokenButtonRow({
  count = 5,
  isDark = true,
  cycleInterval = 8000,
  size = 'ml',
  gap = 'gap-5',
  colorTheme = 'black',
}: TokenButtonRowProps) {
  // Check if we're in a colored mode (not black or white)
  const isColoredMode = ['red', 'green', 'blue', 'yellow', 'pink'].includes(colorTheme);
  const [tokens] = useState<TokenDisplay[]>(buildTokenList);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [edgeScrollDirection, setEdgeScrollDirection] = useState<'left' | 'right' | null>(null);

  // Size mappings
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    ml: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Continuous smooth auto-scroll
  useEffect(() => {
    if (!mounted || isPaused || edgeScrollDirection || !scrollContainerRef.current) return;

    let animationFrameId: number;
    const scrollContainer = scrollContainerRef.current;
    // Slow continuous scroll speed (pixels per frame at 60fps)
    const speed = 0.5;

    const animateScroll = () => {
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

      // Increment scroll position
      scrollContainer.scrollLeft += speed;

      // Loop back to start when reaching end
      if (scrollContainer.scrollLeft >= maxScroll - 1) {
        scrollContainer.scrollLeft = 0;
      }

      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [mounted, isPaused, edgeScrollDirection]);

  // Edge continuous scrolling loop (faster when hovering edges)
  useEffect(() => {
    if (!mounted || !edgeScrollDirection || !scrollContainerRef.current) return;

    let animationFrameId: number;
    const scrollContainer = scrollContainerRef.current;
    // Smooth edge scrolling speed (pixels per frame)
    const speed = 2;

    const animateScroll = () => {
      if (edgeScrollDirection === 'left') {
        scrollContainer.scrollLeft -= speed;
      } else if (edgeScrollDirection === 'right') {
        scrollContainer.scrollLeft += speed;
      }
      animationFrameId = requestAnimationFrame(animateScroll);
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [edgeScrollDirection, mounted]);

  if (!mounted) {
    // Show a static skeleton of 5 items to match previous SSR loading state
    return (
      <div className={`flex items-center justify-center ${gap} overflow-hidden`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${sizeClasses[size]} rounded-full bg-gray-800 animate-pulse`} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="w-full relative group/carousel"
      style={{ padding: '0' }}
    >
      {/* Left Edge Hover Zone */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-24 z-20 cursor-w-resize bg-gradient-to-r transition-colors ${
          isColoredMode
            ? 'from-transparent to-transparent' // No gradient in colored modes
            : isDark
              ? 'from-black/50 to-transparent hover:from-black/80'
              : 'from-white/70 to-transparent hover:from-white/95'
        }`}
        onMouseEnter={() => {
          setIsPaused(true);
          setEdgeScrollDirection('left');
        }}
        onMouseLeave={() => {
          setIsPaused(false);
          setEdgeScrollDirection(null);
        }}
        aria-label="Scroll Left"
      />

      {/* Right Edge Hover Zone */}
      <div
        className={`absolute right-0 top-0 bottom-0 w-24 z-20 cursor-e-resize bg-gradient-to-l transition-colors ${
          isColoredMode
            ? 'from-transparent to-transparent' // No gradient in colored modes
            : isDark
              ? 'from-black/50 to-transparent hover:from-black/80'
              : 'from-white/70 to-transparent hover:from-white/95'
        }`}
        onMouseEnter={() => {
          setIsPaused(true);
          setEdgeScrollDirection('right');
        }}
        onMouseLeave={() => {
          setIsPaused(false);
          setEdgeScrollDirection(null);
        }}
        aria-label="Scroll Right"
      />

      {/* Main Center Interaction Zone (Pause on hover) */}
      {/* Detecting hover on the container itself or centered elements */}
      <div
        className="absolute inset-x-24 inset-y-0 z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      />

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className={`
          flex items-center overflow-x-auto pb-4 pt-2 px-4 scrollbar-hide
          ${gap}
          md:justify-start
        `}
        style={{
          // Disable smooth scroll during continuous edge scroll for instant responsiveness
          scrollBehavior: edgeScrollDirection ? 'auto' : 'smooth'
        }}
      >
        {tokens.map((token, index) => (
          <Link
            key={`${token.symbol}-${index}`}
            href={token.href}
            // Z-index needed to be clickable above the pause zone
            className="flex-shrink-0 flex items-center justify-center transition-colors group select-none relative z-30"
            title={`${token.symbol} - ${token.name}`}
            draggable={false}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1, y: -5, zIndex: 40 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              <div className={`relative ${sizeClasses[size]}`}>
                <div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    boxShadow: isColoredMode
                      ? 'none' // No shadow in colored modes
                      : isDark
                        ? '0 0 40px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
                        : '0 0 35px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.9)',
                    border: isColoredMode
                      ? '2px solid rgba(0,0,0,0.15)' // Subtle border in colored modes
                      : isDark
                        ? '3px solid rgba(255,255,255,0.2)'
                        : '3px solid rgba(255,255,255,0.9)',
                    background: isColoredMode ? 'transparent' : (isDark ? 'black' : 'white'),
                  }}
                >
                  {/* Background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${token.color}`}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 0.3 }}
                    key={token.symbol}
                  />

                  {/* Image */}
                  {token.bgImage && (
                    <div className="absolute inset-0">
                      <Image
                        src={token.bgImage}
                        alt={token.symbol}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        draggable={false}
                      />
                    </div>
                  )}

                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}

        {/* Padding at the end to allow scrolling past the last item */}
        <div className="w-8 flex-shrink-0" />
      </div>
    </div>
  );
}
