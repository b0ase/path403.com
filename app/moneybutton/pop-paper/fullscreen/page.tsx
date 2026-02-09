'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

interface PopButton {
  id: number;
  popped: boolean;
  popping: boolean;
}

export default function PopPaperFullscreenPage() {
  const [dimensions, setDimensions] = useState({ rows: 10, cols: 10 });
  const [buttons, setButtons] = useState<PopButton[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Calculate grid dimensions based on screen size
  useEffect(() => {
    const calculateDimensions = () => {
      const bubbleSize = 48; // px
      const gap = 4; // px
      const padding = 16; // px

      const availableWidth = window.innerWidth - (padding * 2);
      const availableHeight = window.innerHeight - (padding * 2);

      const cols = Math.floor(availableWidth / (bubbleSize + gap));
      const rows = Math.floor(availableHeight / (bubbleSize + gap));

      setDimensions({ rows: Math.max(3, rows), cols: Math.max(3, cols) });
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    return () => window.removeEventListener('resize', calculateDimensions);
  }, []);

  // Initialize buttons when dimensions change
  useEffect(() => {
    const total = dimensions.rows * dimensions.cols;
    setButtons(Array.from({ length: total }, (_, i) => ({ id: i, popped: false, popping: false })));
    setPoppedCount(0);
  }, [dimensions]);

  // Handle pop
  const handlePop = useCallback((id: number) => {
    setButtons(prev => prev.map(btn =>
      btn.id === id && !btn.popped
        ? { ...btn, popping: true }
        : btn
    ));

    // Play pop sound effect (optional - browser audio)
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (e) {
      // Audio not supported or blocked
    }

    // After animation, mark as popped
    setTimeout(() => {
      setButtons(prev => prev.map(btn =>
        btn.id === id ? { ...btn, popped: true, popping: false } : btn
      ));
      setPoppedCount(prev => prev + 1);
    }, 200);
  }, []);

  // Reset all buttons
  const resetButtons = useCallback(() => {
    const total = dimensions.rows * dimensions.cols;
    setButtons(Array.from({ length: total }, (_, i) => ({ id: i, popped: false, popping: false })));
    setPoppedCount(0);
  }, [dimensions]);

  // Pop all remaining
  const popAll = useCallback(() => {
    buttons.forEach((btn, index) => {
      if (!btn.popped) {
        setTimeout(() => handlePop(btn.id), index * 20);
      }
    });
  }, [buttons, handlePop]);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    const showOnMove = () => {
      setShowControls(true);
      clearTimeout(timer);
    };

    window.addEventListener('mousemove', showOnMove);
    window.addEventListener('touchstart', showOnMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', showOnMove);
      window.removeEventListener('touchstart', showOnMove);
    };
  }, [showControls]);

  const totalButtons = buttons.length;
  const progressPercent = totalButtons > 0 ? (poppedCount / totalButtons) * 100 : 0;

  return (
    <div
      className="fixed inset-0 bg-red-600 overflow-hidden select-none z-[100]"
      style={{ touchAction: 'manipulation' }}
    >
      {/* Pop Paper Grid */}
      <div
        className="absolute inset-0 flex items-center justify-center p-2"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${dimensions.cols}, 44px)`,
            gap: '4px',
          }}
        >
          {buttons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => !btn.popped && handlePop(btn.id)}
              disabled={btn.popped}
              className={`
                relative w-11 h-11 rounded-full transition-all duration-150
                ${btn.popped
                  ? 'bg-red-800 cursor-default'
                  : 'bg-gradient-to-br from-red-400 to-red-600 hover:from-red-300 hover:to-red-500 cursor-pointer active:scale-90'
                }
              `}
              style={{
                boxShadow: btn.popped
                  ? 'inset 0 2px 4px rgba(0,0,0,0.4)'
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
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className="text-yellow-300 font-black text-xs"
                      style={{ textShadow: '0 0 10px rgba(253, 224, 71, 0.8)' }}
                    >
                      POP!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dollar sign on unpopped */}
              {!btn.popped && !btn.popping && (
                <FaDollarSign className="absolute inset-0 m-auto text-red-800/20 text-lg" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-red-900">
        <motion.div
          className="h-full bg-green-400"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
              <div className="text-white font-mono text-sm">
                <span className="text-green-400 font-bold">{poppedCount}</span>
                <span className="text-white/60"> / {totalButtons}</span>
                <span className="text-white/40 ml-2">({Math.round(progressPercent)}%)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetButtons}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  title="Reset"
                >
                  <FiRefreshCw className="text-white" size={18} />
                </button>
                <Link
                  href="/moneybutton/pop-paper"
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  title="Close"
                >
                  <FiX className="text-white" size={18} />
                </Link>
              </div>
            </div>

            {/* Bottom stats */}
            <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
              <div className="text-white/60 text-xs font-mono uppercase tracking-wider">
                Pop Paper by b0ase
              </div>
              {poppedCount === totalButtons && totalButtons > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={resetButtons}
                  className="pointer-events-auto px-4 py-2 bg-green-500 text-black font-bold text-sm uppercase tracking-wider rounded hover:bg-green-400 transition-colors"
                >
                  Play Again
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion celebration */}
      <AnimatePresence>
        {poppedCount === totalButtons && totalButtons > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.5)' }}
            >
              ALL POPPED!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
