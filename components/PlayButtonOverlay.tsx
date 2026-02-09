'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { usePersistentMusic } from '@/hooks/usePersistentMusic';

export default function PlayButtonOverlay() {
  const [showButton, setShowButton] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);
  const { setIsPlaying, audioRef } = usePersistentMusic();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has already clicked play (stored in sessionStorage)
    const playClicked = sessionStorage.getItem('musicPlayClicked');
    if (playClicked === 'true') {
      setHasBeenClicked(true);
      setShowButton(false);
      return;
    }

    // Only show on landing page (root path)
    if (pathname === '/') {
      setShowButton(true);
    } else {
      setShowButton(false);
    }

    // Check if music is already playing
    if (audioRef.current && !audioRef.current.paused) {
      setShowButton(false);
      setHasBeenClicked(true);
      sessionStorage.setItem('musicPlayClicked', 'true');
    }
  }, [audioRef, pathname]);

  const handlePlay = () => {
    // Start fade out animation
    setFadeOut(true);
    
    // Start playing music
    setIsPlaying(true);
    
    // Store that play has been clicked
    sessionStorage.setItem('musicPlayClicked', 'true');
    setHasBeenClicked(true);
    
    // Remove button after animation
    setTimeout(() => {
      setShowButton(false);
    }, 800);
  };

  if (!showButton) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-700 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ zIndex: 100000 }}
      onClick={handlePlay}
    >
      <button
        className="group relative"
        onClick={handlePlay}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Play"
      >
        {/* Outer rotating ring */}
        <div className="absolute inset-0 -inset-10">
          <div className="w-full h-full rounded-full border border-red-500/20 animate-spin-slow" />
        </div>
        
        {/* Middle pulsing ring */}
        <div className="absolute inset-0 -inset-6">
          <div className="w-full h-full rounded-full border border-red-500/30 animate-pulse-slow" />
        </div>
        
        {/* Main button - square, no rotation */}
        <div className={`relative w-20 h-20 bg-red-600 transform transition-all duration-300 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}>
          {/* Inner square */}
          <div className="absolute inset-1 bg-black" />
          
          {/* Play triangle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0 h-0 ml-1 border-l-[20px] border-l-red-500 border-y-[12px] border-y-transparent" />
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-red-500" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-red-500" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500" />
        </div>

        {/* Simple text */}
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-red-500 text-sm font-mono tracking-wider">
            [ PLAY ]
          </p>
        </div>
      </button>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .glitch-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 0, 0, 0.03) 2px,
            rgba(255, 0, 0, 0.03) 4px
          );
          animation: glitch-lines 8s linear infinite;
        }
        
        @keyframes glitch-lines {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        
        .glitch-text {
          position: relative;
          text-shadow: 
            0.05em 0 0 rgba(255, 0, 0, 0.75),
            -0.025em -0.05em 0 rgba(0, 255, 255, 0.75),
            0.025em 0.05em 0 rgba(255, 255, 0, 0.75);
          animation: glitch 500ms infinite;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          animation: glitch-1 650ms infinite;
          clip: rect(44px, 450px, 56px, 0);
          transform: translate(-2px, -2px);
          color: #ff0000;
        }
        
        .glitch-text::after {
          animation: glitch-2 750ms infinite;
          clip: rect(24px, 450px, 76px, 0);
          transform: translate(2px, 2px);
          color: #00ffff;
        }
        
        @keyframes glitch {
          0%, 100% { text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 255, 0.75), 0.025em 0.05em 0 rgba(255, 255, 0, 0.75); }
          14% { text-shadow: 0.05em 0 0 rgba(255, 0, 0, 0.75), -0.05em -0.025em 0 rgba(0, 255, 255, 0.75), 0.025em 0.05em 0 rgba(255, 255, 0, 0.75); }
          15% { text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75), 0.025em 0.025em 0 rgba(0, 255, 255, 0.75), -0.05em -0.05em 0 rgba(255, 255, 0, 0.75); }
          49% { text-shadow: -0.05em -0.025em 0 rgba(255, 0, 0, 0.75), 0.025em 0.025em 0 rgba(0, 255, 255, 0.75), -0.05em -0.05em 0 rgba(255, 255, 0, 0.75); }
          50% { text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75), 0.05em 0 0 rgba(0, 255, 255, 0.75), 0 -0.05em 0 rgba(255, 255, 0, 0.75); }
          99% { text-shadow: 0.025em 0.05em 0 rgba(255, 0, 0, 0.75), 0.05em 0 0 rgba(0, 255, 255, 0.75), 0 -0.05em 0 rgba(255, 255, 0, 0.75); }
        }
        
        @keyframes glitch-1 {
          0%, 100% { clip: rect(42px, 9999px, 44px, 0); transform: translate(0); }
          20% { clip: rect(12px, 9999px, 85px, 0); transform: translate(-2px, 2px); }
          40% { clip: rect(63px, 9999px, 23px, 0); transform: translate(2px, -2px); }
          60% { clip: rect(31px, 9999px, 71px, 0); transform: translate(-2px, 2px); }
          80% { clip: rect(85px, 9999px, 12px, 0); transform: translate(2px, -2px); }
        }
        
        @keyframes glitch-2 {
          0%, 100% { clip: rect(65px, 9999px, 31px, 0); transform: translate(0); }
          20% { clip: rect(24px, 9999px, 90px, 0); transform: translate(2px, -2px); }
          40% { clip: rect(71px, 9999px, 44px, 0); transform: translate(-2px, 2px); }
          60% { clip: rect(12px, 9999px, 85px, 0); transform: translate(2px, -2px); }
          80% { clip: rect(90px, 9999px, 24px, 0); transform: translate(-2px, 2px); }
        }
      `}</style>
    </div>
  );
}