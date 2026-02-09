'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { FiUpload, FiGrid, FiPlusCircle, FiPlay, FiAlertTriangle } from 'react-icons/fi';
import { portfolioData } from '@/lib/data';

interface MoneyButtonHeroProps {
  mini?: boolean;
}

export default function MoneyButtonHero({ mini = false }: MoneyButtonHeroProps) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [currentButtonIndex, setCurrentButtonIndex] = useState(0);
  const [collectedButtons, setCollectedButtons] = useState<Array<{
    id: number,
    slug: string,
    image: string,
    title: string,
    x: number,
    y: number,
    vx: number,
    vy: number
  }>>([]);
  const buttonSize = mini ? 32 : 48;
  const [screenSize, setScreenSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const animationRef = useRef<number>();
  const dragRef = useRef<{id: number, startX: number, startY: number, lastX: number, lastY: number} | null>(null);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, btnId: number) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { id: btnId, startX: clientX, startY: clientY, lastX: clientX, lastY: clientY };
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const x = Math.max(20, Math.min(window.innerWidth - buttonSize - 20, clientX - buttonSize / 2));
      const y = Math.max(20, Math.min(window.innerHeight - buttonSize - 20, clientY - buttonSize / 2));
      setCollectedButtons(prev => prev.map(btn =>
        btn.id === dragRef.current?.id ? { ...btn, x, y, vx: 0, vy: 0 } : btn
      ));
      dragRef.current.lastX = clientX;
      dragRef.current.lastY = clientY;
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;
      const vx = (clientX - dragRef.current.lastX) * 0.5;
      const vy = (clientY - dragRef.current.lastY) * 0.5;
      setCollectedButtons(prev => prev.map(btn =>
        btn.id === dragRef.current?.id
          ? { ...btn, vx: Math.max(-15, Math.min(15, vx)), vy: Math.max(-15, Math.min(15, vy)) }
          : btn
      ));
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [buttonSize]);

  useEffect(() => {
    const updatePhysics = () => {
      setCollectedButtons(prev => prev.map(btn => {
        let { x, y, vx, vy } = btn;
        x += vx;
        y += vy;
        vy += 0.1;
        vx *= 0.99;
        vy *= 0.99;
        const maxX = window.innerWidth - buttonSize - 20;
        const maxY = window.innerHeight - buttonSize - 200;
        if (x < 20) { x = 20; vx = Math.abs(vx) * 0.8; }
        if (x > maxX) { x = maxX; vx = -Math.abs(vx) * 0.8; }
        if (y < 20) { y = 20; vy = Math.abs(vy) * 0.8; }
        if (y > maxY) { y = maxY; vy = -Math.abs(vy) * 0.8; }
        if (Math.random() < 0.02) {
          vx += (Math.random() - 0.5) * 3;
          vy += (Math.random() - 0.5) * 3;
        }
        return { ...btn, x, y, vx, vy };
      }));
      animationRef.current = requestAnimationFrame(updatePhysics);
    };
    animationRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [buttonSize]);

  const buttons = useMemo(() =>
    portfolioData.projects.filter(p => p.cardImageUrls && p.cardImageUrls.length > 0),
    []
  );

  const currentButton = buttons[currentButtonIndex];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)());
      setCurrentButtonIndex(Math.floor(Math.random() * buttons.length));
    }
  }, [buttons.length]);

  const playSound = async () => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') await audioContext.resume();
    const now = audioContext.currentTime;

    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2400, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.45);

    const osc3 = audioContext.createOscillator();
    const gain3 = audioContext.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(150, now);
    osc3.frequency.exponentialRampToValueAtTime(80, now + 0.1);
    gain3.gain.setValueAtTime(0.15, now);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc3.connect(gain3);
    gain3.connect(audioContext.destination);
    osc3.start(now);
    osc3.stop(now + 0.2);
  };

  const handleClick = () => {
    playSound();
    setClickCount(prev => prev + 1);
    if (currentButton) {
      setCollectedButtons(prev => [...prev, {
        id: Date.now() + Math.random(),
        slug: currentButton.slug,
        image: currentButton.cardImageUrls?.[0] || '',
        title: currentButton.title,
        x: screenSize.width / 2 - buttonSize / 2,
        y: screenSize.height / 2 - buttonSize / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15
      }]);
    }
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * buttons.length);
    } while (newIndex === currentButtonIndex && buttons.length > 1);
    setCurrentButtonIndex(newIndex);
  };

  const heroSize = mini ? 'w-16 h-16' : 'w-48 h-48 md:w-64 md:h-64';

  return (
    <>
      {/* Floating tokens */}
      {collectedButtons.map((btn) => (
        <motion.div
          key={btn.id}
          className="fixed group cursor-grab active:cursor-grabbing z-40"
          style={{ left: btn.x, top: btn.y, width: buttonSize, height: buttonSize }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.3 }}
          onMouseDown={(e) => handleDragStart(e, btn.id)}
          onTouchStart={(e) => handleDragStart(e, btn.id)}
        >
          <div
            className={`${mini ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-cover bg-center border-2 border-purple-500/60 shadow-lg shadow-purple-500/40 pointer-events-none select-none`}
            style={{ backgroundImage: `url(${btn.image})` }}
          />
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/95 border border-purple-500/30 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {btn.title}
          </div>
        </motion.div>
      ))}

      {/* Token counter */}
      {clickCount > 0 && (
        <div className="fixed bottom-4 left-4 z-50 px-3 py-2 bg-black/80 border border-purple-500/30 rounded-lg">
          <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            {clickCount}
          </span>
          <span className="text-xs text-zinc-500 ml-1">tokens</span>
        </div>
      )}

      {/* Quick nav */}
      <div className="fixed top-4 right-4 z-50 flex flex-row flex-wrap gap-1 max-w-[90vw] justify-end">
        <Link href="/moneybutton" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-900/20 transition-colors rounded text-[10px]">
          <span className="text-blue-400 font-bold">$</span>
          <span className="text-zinc-400 hidden md:inline">Home</span>
        </Link>
        <Link href="/moneybutton/buy" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-green-500/30 hover:border-green-500/60 hover:bg-green-900/20 transition-colors rounded text-[10px]">
          <span className="text-green-400">🛒</span>
          <span className="text-zinc-400 hidden md:inline">Buy</span>
        </Link>
        <Link href="/moneybutton/pictures" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-pink-500/30 hover:border-pink-500/60 hover:bg-pink-900/20 transition-colors rounded text-[10px]">
          <span className="text-pink-400">🖼️</span>
          <span className="text-zinc-400 hidden md:inline">Pics</span>
        </Link>
        <Link href="/moneybutton/meme-index" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-yellow-500/30 hover:border-yellow-500/60 hover:bg-yellow-900/20 transition-colors rounded text-[10px]">
          <span className="text-yellow-400">😂</span>
          <span className="text-zinc-400 hidden md:inline">Memes</span>
        </Link>
        <Link href="/moneybutton/upload" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-900/20 transition-colors rounded text-[10px]">
          <FiUpload className="text-emerald-400" size={10} />
          <span className="text-zinc-400 hidden md:inline">Sell</span>
        </Link>
        <Link href="/moneybutton/create" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-900/20 transition-colors rounded text-[10px]">
          <FiPlusCircle className="text-purple-400" size={10} />
          <span className="text-zinc-400 hidden md:inline">Create</span>
        </Link>
        <Link href="/moneybutton/dashboard" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-900/20 transition-colors rounded text-[10px]">
          <FiPlay className="text-cyan-400" size={10} />
          <span className="text-zinc-400 hidden md:inline">Play</span>
        </Link>
        <Link href="/moneybutton/pop-paper" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-red-500/30 hover:border-red-500/60 hover:bg-red-900/20 transition-colors rounded text-[10px]">
          <FiGrid className="text-red-400" size={10} />
          <span className="text-zinc-400 hidden md:inline">Pop</span>
        </Link>
        <Link href="/moneybutton/billion-penny-ad" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-900/20 transition-colors rounded text-[10px]">
          <span className="text-amber-400 text-[10px] font-bold">1¢</span>
          <span className="text-zinc-400 hidden md:inline">Ads</span>
        </Link>
        <Link href="/moneybutton/onlyscams" className="flex items-center gap-1.5 px-2 py-1 bg-black/80 border border-orange-500/30 hover:border-orange-500/60 hover:bg-orange-900/20 transition-colors rounded text-[10px]">
          <FiAlertTriangle className="text-orange-400" size={10} />
          <span className="text-zinc-400 hidden md:inline">Scams</span>
        </Link>
      </div>

      {/* Mini hero button - fixed bottom right on sub-pages */}
      {mini && (
        <motion.button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`fixed bottom-4 right-4 z-50 ${heroSize} rounded-full cursor-pointer overflow-hidden`}
          style={{
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(236, 72, 153, 0.25)',
            border: '2px solid rgba(167, 139, 250, 0.5)',
          }}
          animate={{ scale: isHovered ? 1.1 : [1, 1.02, 1] }}
          transition={{ scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentButtonIndex}
              className="absolute inset-0 bg-no-repeat bg-center"
              style={{
                backgroundImage: `url(${currentButton?.cardImageUrls?.[0]})`,
                backgroundSize: '120%',
                backgroundColor: '#0a0a0a',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
          {clickCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 bg-blue-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={clickCount}
            >
              +{clickCount}
            </motion.div>
          )}
        </motion.button>
      )}
    </>
  );
}
