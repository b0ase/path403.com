'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { portfolioData } from '@/lib/data';
// Get all portfolio projects with images
const PORTFOLIO_BUTTONS = portfolioData.projects
  .filter(p => p.cardImageUrls && p.cardImageUrls.length > 0)
  .slice(0, 30) // Limit to first 30 projects
  .map(p => ({
    path: `/portfolio/${p.slug}`,
    name: p.title,
    token: p.tokenName || `$${p.slug.toUpperCase().replace(/-/g, '').slice(0, 8)}`,
    image: p.cardImageUrls?.[0] || '',
    color: p.primaryColor || '#ffffff',
  }));

// Pentatonic scale frequencies
const PENTATONIC_SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

// Emojis for particles
const EMOJIS = ['✨', '💫', '⭐', '🌟', '💎', '🚀', '💰', '🪙', '⚡'];

// localStorage keys
const STORAGE_KEYS = {
  visitedPages: 'teleport_visited_pages',
  tokens: 'teleport_tokens',
  tokensByPage: 'teleport_tokens_by_page',
};

// Button sizes for project buttons
const MINI_BUTTON_SIZES = [56, 64, 72, 80, 48]; // Varied sizes
const MAX_VISIBLE_BUTTONS = 6;

interface FloatingButton {
  id: string;
  path: string;
  name: string;
  token: string;
  image: string;
  color: string;
  x: number;
  y: number;
  size: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  vx: number;
  vy: number;
  life: number;
  scale: number;
}

export default function FloatingTeleportButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [floatingButtons, setFloatingButtons] = useState<FloatingButton[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [totalTokens, setTotalTokens] = useState(0);
  const [tokensByPage, setTokensByPage] = useState<Record<string, number>>({});
  const [isWarping, setIsWarping] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noteIndexRef = useRef(0);

  // Get page info for a path
  const getPageInfo = useCallback((path: string) => {
    const portfolioMatch = PORTFOLIO_BUTTONS.find(p => p.path === path);
    if (portfolioMatch) return portfolioMatch;
    return null;
  }, []);

  // Play a soft crystalline note
  const playNote = useCallback((freq?: number) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    const frequency = freq || PENTATONIC_SCALE[noteIndexRef.current % PENTATONIC_SCALE.length];
    noteIndexRef.current++;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.5);
    osc2.stop(now + 0.5);
  }, []);

  // Play warp sound
  const playWarp = useCallback(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Sweep up
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }, []);

  // Spawn a particle
  const spawnParticle = useCallback((x: number, y: number) => {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;

    setParticles(prev => [...prev, {
      id: particleIdRef.current++,
      x,
      y,
      emoji,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 1,
      scale: 0.8 + Math.random() * 0.6,
    }]);
  }, []);

  // Initialize
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);

      // Load saved data
      const savedTokens = localStorage.getItem(STORAGE_KEYS.tokens);
      if (savedTokens) setTotalTokens(parseInt(savedTokens));

      const savedTokensByPage = localStorage.getItem(STORAGE_KEYS.tokensByPage);
      if (savedTokensByPage) setTokensByPage(JSON.parse(savedTokensByPage));

      // Load visited pages and create buttons with random positions and sizes
      const savedVisited = localStorage.getItem(STORAGE_KEYS.visitedPages);
      if (savedVisited) {
        const visited = JSON.parse(savedVisited) as string[];
        const buttons: FloatingButton[] = visited
          .map((path, index) => {
            const info = getPageInfo(path);
            if (!info) return null;
            const size = MINI_BUTTON_SIZES[index % MINI_BUTTON_SIZES.length];
            return {
              id: path,
              ...info,
              x: Math.random() * (window.innerWidth - size - 150) + 100,
              y: Math.random() * (window.innerHeight - size - 250) + 120,
              size,
            };
          })
          .filter(Boolean) as FloatingButton[];
        setFloatingButtons(buttons);
      }

      return () => window.removeEventListener('resize', handleResize);
    }
  }, [getPageInfo]);

  // Add button for current page if it's a project
  useEffect(() => {
    if (!isClient || !pathname || windowSize.width === 0) return;

    const info = getPageInfo(pathname);
    if (!info) return;

    if (!floatingButtons.find(b => b.id === pathname)) {
      const size = MINI_BUTTON_SIZES[floatingButtons.length % MINI_BUTTON_SIZES.length];
      const newButton: FloatingButton = {
        id: pathname,
        ...info,
        x: Math.random() * (windowSize.width - size - 150) + 100,
        y: Math.random() * (windowSize.height - size - 250) + 120,
        size,
      };

      setFloatingButtons(prev => {
        const updated = [...prev, newButton];
        const paths = updated.map(b => b.id);
        localStorage.setItem(STORAGE_KEYS.visitedPages, JSON.stringify(paths));
        return updated;
      });

      // Award tokens
      const reward = Math.floor(Math.random() * 50) + 10;
      setTotalTokens(t => {
        const newTotal = t + reward;
        localStorage.setItem(STORAGE_KEYS.tokens, newTotal.toString());
        return newTotal;
      });
      setTokensByPage(prev => {
        const updated = { ...prev, [info.token]: (prev[info.token] || 0) + reward };
        localStorage.setItem(STORAGE_KEYS.tokensByPage, JSON.stringify(updated));
        return updated;
      });

      // Celebration
      for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnParticle(newButton.x + size / 2, newButton.y + size / 2), i * 50);
      }
      playNote();
    }
  }, [pathname, isClient, windowSize, floatingButtons, getPageInfo, spawnParticle, playNote]);

  // Main animation loop
  useEffect(() => {
    if (!isClient || windowSize.width === 0) return;

    const animate = () => {
      // Update particles only (buttons are now static/draggable)
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.08,
          life: p.life - 0.02,
        }))
        .filter(p => p.life > 0)
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isClient, windowSize]);

  // Handle teleport
  const handleTeleport = useCallback((path: string, x: number, y: number) => {
    if (isWarping) return;

    setIsWarping(true);
    playWarp();

    for (let i = 0; i < 12; i++) {
      setTimeout(() => spawnParticle(x, y), i * 30);
    }

    setTimeout(() => {
      router.push(path);
    }, 250);

    setTimeout(() => {
      setIsWarping(false);
    }, 500);
  }, [isWarping, playWarp, router, spawnParticle]);

  if (!isClient) return null;

  const currentPageInfo = getPageInfo(pathname || '/');

  return (
    <>
      {/* Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="fixed pointer-events-none z-[9998]"
          initial={{ scale: 0 }}
          animate={{ scale: particle.scale }}
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.life,
            fontSize: '1.5rem',
          }}
        >
          {particle.emoji}
        </motion.div>
      ))}

      {/* Draggable project buttons */}
      {floatingButtons
        .slice(-MAX_VISIBLE_BUTTONS)
        .map(btn => {
          const isCurrent = btn.path === pathname;
          return (
            <motion.div
              key={btn.id}
              drag
              dragMomentum={false}
              dragElastic={0.1}
              initial={{ x: btn.x, y: btn.y, opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: isCurrent ? [1, 1.05, 1] : 1,
              }}
              transition={isCurrent ? { scale: { duration: 2, repeat: Infinity } } : { duration: 0.3 }}
              whileHover={{ scale: 1.1, zIndex: 10000 }}
              whileDrag={{ scale: 1.15, zIndex: 10001 }}
              whileTap={{ scale: 0.95 }}
              className="fixed z-[9998] cursor-grab active:cursor-grabbing group"
              style={{
                width: btn.size,
                height: btn.size,
              }}
              onClick={() => handleTeleport(btn.path, btn.x + btn.size / 2, btn.y + btn.size / 2)}
            >
              {/* Glow */}
              <div
                className="absolute -inset-2 rounded-full opacity-40 group-hover:opacity-80 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${btn.color}50 0%, transparent 70%)`,
                  filter: 'blur(8px)',
                }}
              />

              {/* Button body */}
              <div
                className="relative w-full h-full rounded-full overflow-hidden"
                style={{
                  boxShadow: `0 0 20px ${btn.color}30, 0 4px 15px rgba(0,0,0,0.4)`,
                  border: `2px solid ${btn.color}80`,
                }}
              >
                {btn.image ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${btn.image})` }}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${btn.color} 0%, #000 100%)` }}
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                {/* Shine */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

                {isCurrent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-lg" />
                  </div>
                )}
              </div>

              {/* Hover tooltip */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
                style={{ bottom: -24 }}
                initial={{ opacity: 0, y: -5 }}
                whileHover={{ opacity: 1, y: 0 }}
              >
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full bg-black/90 border"
                  style={{ color: btn.color, borderColor: `${btn.color}40` }}
                >
                  {btn.token}
                </span>
              </motion.div>
            </motion.div>
          );
        })}

      {/* Token counter pill */}
      {(totalTokens > 0 || floatingButtons.length > 0) && (
        <motion.button
          onClick={() => setShowPanel(!showPanel)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="px-5 py-2.5 rounded-full bg-black/90 border border-white/20 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
              {currentPageInfo && (
                <>
                  <span className="text-sm font-bold" style={{ color: currentPageInfo.color }}>
                    {currentPageInfo.token}
                  </span>
                  <div className="w-px h-4 bg-white/20" />
                </>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-400 font-bold text-sm">{totalTokens.toLocaleString()}</span>
                <span className="text-white/50 text-xs">tokens</span>
              </div>
              {floatingButtons.length > 0 && (
                <>
                  <div className="w-px h-4 bg-white/20" />
                  <span className="text-white/60 text-xs">{floatingButtons.length} projects</span>
                </>
              )}
            </div>
          </div>
        </motion.button>
      )}

      {/* Token panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10000] w-80"
          >
            <div className="bg-black/95 border border-white/20 rounded-2xl p-5 backdrop-blur-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-bold text-lg">Token Collection</span>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-white/50 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-2">
                {Object.entries(tokensByPage)
                  .sort((a, b) => b[1] - a[1])
                  .map(([token, amount]) => {
                    const page = PORTFOLIO_BUTTONS.find(p => p.token === token);
                    return (
                      <div key={token} className="flex justify-between items-center text-sm py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
                        <span className="font-medium" style={{ color: page?.color || '#888' }}>{token}</span>
                        <span className="text-yellow-400 font-mono font-bold">{amount.toLocaleString()}</span>
                      </div>
                    );
                  })}
                {Object.keys(tokensByPage).length === 0 && (
                  <div className="text-white/40 text-sm text-center py-6">
                    Visit project pages to collect tokens!
                  </div>
                )}
              </div>
              <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Projects Visited</span>
                  <span className="text-white font-medium">{floatingButtons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-bold">Total Tokens</span>
                  <span className="text-green-400 font-bold font-mono text-lg">{totalTokens.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
