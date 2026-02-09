'use client';

import React, { useState, useEffect } from 'react';
import { FiChrome, FiDownload, FiX, FiCheck } from 'react-icons/fi';

export default function ChromeExtensionDownload() {
  const [showBanner, setShowBanner] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Check if desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check if Chrome browser
    const checkChrome = () => {
      const isChromeBrowser = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      setIsChrome(isChromeBrowser);
    };

    // Check if previously dismissed (session only)
    const wasDismissed = sessionStorage.getItem('chromeThemeDismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    checkDesktop();
    checkChrome();

    // Show banner after 5 seconds on desktop Chrome
    const timer = setTimeout(() => {
      if (window.innerWidth >= 1024 && /Chrome/.test(navigator.userAgent)) {
        setShowBanner(true);
      }
    }, 5000);

    window.addEventListener('resize', checkDesktop);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkDesktop);
    };
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem('chromeThemeDismissed', 'true');
  };

  const handleDownload = async () => {
    setDownloading(true);

    // Download the theme ZIP file
    const link = document.createElement('a');
    link.href = '/b0ase-chrome-theme.zip';
    link.download = 'b0ase-chrome-theme.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show instructions after download starts
    setTimeout(() => {
      setDownloading(false);
      setShowInstructions(true);
    }, 1000);
  };

  if (!showBanner || dismissed || !isDesktop) return null;

  return (
    <>
      {/* Banner - More discreet */}
      <div className="fixed bottom-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 rounded-xl shadow-lg z-50 overflow-hidden animate-slideUp max-w-[280px]">
        <div className="relative p-4">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <FiX className="w-4 h-4 text-white/60" />
          </button>

          {/* Chrome icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-black to-zinc-800 rounded-xl border border-white/10">
              <FiChrome className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">
                B0ASE Pure Black Theme
              </h3>
              <p className="text-white/60 text-sm">
                Give your Chrome browser the B0ASE studio look
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span>Pure black toolbar & tabs</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span>Clean white text</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <FiCheck className="w-4 h-4 text-green-500" />
              <span>Minimal & distraction-free</span>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`
              w-full py-3 px-4 rounded-xl font-medium transition-all
              ${downloading 
                ? 'bg-white/10 text-white/50 cursor-wait' 
                : 'bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {downloading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Downloading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FiDownload className="w-4 h-4" />
                Download Theme
              </span>
            )}
          </button>

          {/* Info text */}
          <p className="text-xs text-white/40 text-center mt-3">
            Free • No signup required • 1 KB
          </p>
        </div>

        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      </div>

      {/* Installation Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
          <div className="bg-black/90 border border-white/10 rounded-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <FiCheck className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Download Complete!</h3>
            </div>

            <p className="text-white/80 mb-4">
              Follow these steps to install the theme:
            </p>

            <ol className="space-y-3 mb-6">
              <li className="flex gap-3 text-white/70 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">1</span>
                <span>Extract the downloaded ZIP file</span>
              </li>
              <li className="flex gap-3 text-white/70 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">2</span>
                <span>Open Chrome and go to <code className="px-1 py-0.5 bg-white/10 rounded">chrome://extensions/</code></span>
              </li>
              <li className="flex gap-3 text-white/70 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">3</span>
                <span>Enable "Developer mode" (top right toggle)</span>
              </li>
              <li className="flex gap-3 text-white/70 text-sm">
                <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-xs">4</span>
                <span>Drag the <code className="px-1 py-0.5 bg-white/10 rounded">chrome-theme</code> folder onto the page</span>
              </li>
            </ol>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-3 px-4 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}