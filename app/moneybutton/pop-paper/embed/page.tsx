'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDollarSign } from 'react-icons/fa';

interface PopButton {
  id: number;
  popped: boolean;
  popping: boolean;
}

function PopPaperEmbed() {
  const searchParams = useSearchParams();

  const rows = Math.min(20, Math.max(1, parseInt(searchParams.get('rows') || '5')));
  const cols = Math.min(20, Math.max(1, parseInt(searchParams.get('cols') || '5')));
  const price = parseFloat(searchParams.get('price') || '0.01');
  const handle = searchParams.get('handle') || '';
  const paperId = searchParams.get('id') || `${handle}-${rows}x${cols}`;

  const [buttons, setButtons] = useState<PopButton[]>([]);
  const [paying, setPaying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize buttons from localStorage
  useEffect(() => {
    const storageKey = `pop-paper-${paperId}`;
    const stored = localStorage.getItem(storageKey);
    const poppedIds: number[] = stored ? JSON.parse(stored) : [];

    setButtons(
      Array.from({ length: rows * cols }, (_, i) => ({
        id: i,
        popped: poppedIds.includes(i),
        popping: false,
      }))
    );
  }, [rows, cols, paperId]);

  // Save popped state to localStorage
  const savePoppedState = (poppedIds: number[]) => {
    const storageKey = `pop-paper-${paperId}`;
    localStorage.setItem(storageKey, JSON.stringify(poppedIds));
  };

  // Handle pop with payment
  const handlePop = async (id: number) => {
    if (!handle) {
      setError('No payment handle configured');
      return;
    }

    setPaying(id);
    setError(null);

    // Start pop animation
    setButtons(prev => prev.map(btn =>
      btn.id === id ? { ...btn, popping: true } : btn
    ));

    try {
      // In a real implementation, this would:
      // 1. Check if user has HandCash connected
      // 2. Trigger payment via HandCash API
      // 3. Verify payment before marking as popped
      //
      // For demo, we'll simulate a successful pop after a short delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mark as popped
      setButtons(prev => {
        const updated = prev.map(btn =>
          btn.id === id ? { ...btn, popped: true, popping: false } : btn
        );
        // Save to localStorage
        const poppedIds = updated.filter(b => b.popped).map(b => b.id);
        savePoppedState(poppedIds);
        return updated;
      });
    } catch (err) {
      setError('Payment failed');
      setButtons(prev => prev.map(btn =>
        btn.id === id ? { ...btn, popping: false } : btn
      ));
    } finally {
      setPaying(null);
    }
  };

  const poppedCount = buttons.filter(b => b.popped).length;
  const totalButtons = buttons.length;

  if (buttons.length === 0) {
    return (
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-600 p-4 font-mono">
      {/* Pop Paper Grid */}
      <div
        className="mx-auto"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 44px)`,
          gap: '4px',
          width: 'fit-content',
        }}
      >
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => !btn.popped && !paying && handlePop(btn.id)}
            disabled={btn.popped || paying !== null}
            className={`
              relative w-11 h-11 rounded-full transition-all duration-200
              ${btn.popped
                ? 'bg-red-800 cursor-default shadow-inner'
                : paying === btn.id
                  ? 'bg-yellow-500 cursor-wait'
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
            {!btn.popped && paying !== btn.id && (
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
                  <span
                    className="text-yellow-300 font-black text-xs"
                    style={{ textShadow: '0 0 10px rgba(253, 224, 71, 0.8), 0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    POP!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading spinner for payment */}
            {paying === btn.id && !btn.popping && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-red-800/30 border-t-red-800 rounded-full animate-spin" />
              </div>
            )}

            {/* Dollar sign on unpopped */}
            {!btn.popped && !btn.popping && paying !== btn.id && (
              <FaDollarSign className="absolute inset-0 m-auto text-red-800/30 text-lg" />
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-red-200 text-xs">
          {poppedCount}/{totalButtons} popped
          {price > 0 && (
            <span className="ml-1">
              • ${price.toFixed(2)} per pop
            </span>
          )}
        </p>
        {handle && (
          <p className="text-red-300/60 text-[10px] mt-1">
            Pays ${handle}
          </p>
        )}
        {error && (
          <p className="text-yellow-300 text-xs mt-2">{error}</p>
        )}
      </div>

      {/* Powered by link */}
      <div className="mt-4 text-center">
        <a
          href="https://b0ase.com/moneybutton/pop-paper"
          target="_blank"
          rel="noopener noreferrer"
          className="text-red-300/40 text-[10px] hover:text-red-200 transition-colors"
        >
          Powered by MoneyButton
        </a>
      </div>
    </div>
  );
}

export default function PopPaperEmbedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-red-600 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <PopPaperEmbed />
    </Suspense>
  );
}
