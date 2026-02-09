'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import { FiBox } from 'react-icons/fi';

// Dynamically import Three.js animation to avoid SSR issues
const WireframeAnimation = dynamic(
  () => import('@/components/landing/WireframeAnimation'),
  { ssr: false }
);

interface FontOption {
  name: string;
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
    display: string;
  };
  weights: {
    regular: number;
    bold: number;
    black: number;
  };
  className?: string;
}

export default function PlayPage() {
  // Core state
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedFont, setSelectedFont] = useState(0);
  const [showFontMenu, setShowFontMenu] = useState(false);

  // Animation states
  const [animationExpanded, setAnimationExpanded] = useState(true);
  const [animationPosition, setAnimationPosition] = useState({ x: -20, y: -10 });
  const [globeStructured, setGlobeStructured] = useState(false);
  const [colorIntense, setColorIntense] = useState(false);
  const [mouseHover, setMouseHover] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [modelType, setModelType] = useState<'wireframe' | 'gundam'>('wireframe'); // Model type selection

  // Text animation states
  const [animatedText, setAnimatedText] = useState('GRAPHIC DESIGN');
  const [animatedTitle, setAnimatedTitle] = useState('B0ASE');
  const [animatedSubtitle1, setAnimatedSubtitle1] = useState('A/V PLAYGROUND');
  const [animatedSubtitle2, setAnimatedSubtitle2] = useState('Interactive visual experience');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fontOptions: FontOption[] = [
    {
      name: 'Swiss Design',
      fonts: {
        primary: 'Helvetica Neue, Helvetica, sans-serif',
        secondary: 'Helvetica Neue, Helvetica, sans-serif',
        mono: 'IBM Plex Mono, monospace',
        display: 'Helvetica Neue, Helvetica, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    },
    {
      name: 'DarkTech',
      fonts: {
        primary: 'DarkTech, monospace',
        secondary: 'DarkTech, monospace',
        mono: 'DarkTech, monospace',
        display: 'DarkTech, monospace'
      },
      weights: { regular: 400, bold: 400, black: 400 },
      className: 'font-darktech'
    },
    {
      name: 'DarkTech Stroke',
      fonts: {
        primary: 'DarkTech, monospace',
        secondary: 'DarkTech, monospace',
        mono: 'DarkTech, monospace',
        display: 'DarkTech, monospace'
      },
      weights: { regular: 400, bold: 400, black: 400 },
      className: 'font-darktech-stroke'
    },
    {
      name: 'Brutalism',
      fonts: {
        primary: 'Brutalism, sans-serif',
        secondary: 'Brutalism, sans-serif',
        mono: 'Brutalism, monospace',
        display: 'Brutalism, sans-serif'
      },
      weights: { regular: 400, bold: 400, black: 400 }
    },
    {
      name: 'Fathead',
      fonts: {
        primary: 'Fathead, sans-serif',
        secondary: 'Fathead, sans-serif',
        mono: 'Fathead, sans-serif',
        display: 'Fathead, sans-serif'
      },
      weights: { regular: 400, bold: 400, black: 400 },
      className: 'font-fathead'
    },
    {
      name: 'LDR2',
      fonts: {
        primary: 'LDR2, monospace',
        secondary: 'LDR2, monospace',
        mono: 'LDR2, monospace',
        display: 'LDR2, monospace'
      },
      weights: { regular: 400, bold: 400, black: 400 }
    },
    {
      name: 'LDR2 Stroke',
      fonts: {
        primary: 'LDR2, monospace',
        secondary: 'LDR2, monospace',
        mono: 'LDR2, monospace',
        display: 'LDR2, monospace'
      },
      weights: { regular: 400, bold: 400, black: 400 },
      className: 'font-ldr2-stroke'
    },
    {
      name: 'Neo Grotesque',
      fonts: {
        primary: 'Manrope, sans-serif',
        secondary: 'DM Sans, sans-serif',
        mono: 'Fira Code, monospace',
        display: 'Manrope, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 800 }
    }
  ];

  const currentFont = fontOptions[selectedFont] || fontOptions[0];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Simple animation movement
  useEffect(() => {
    if (animationExpanded) {
      const interval = setInterval(() => {
        setAnimationPosition({
          x: Math.sin(Date.now() * 0.0003) * 15 - 20,
          y: Math.cos(Date.now() * 0.0002) * 10 - 10
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setAnimationPosition({ x: 0, y: 0 });
    }
  }, [animationExpanded]);

  // Text scramble animation
  useEffect(() => {
    if (!isClient) return;

    const services = [
      'VISUAL PLAYGROUND',
      'AUDIO REACTIVE',
      'GENERATIVE ART',
      'LIVE VISUALS',
      'CREATIVE CODING',
      'INTERACTIVE DESIGN',
      'REAL-TIME GRAPHICS'
    ];

    const scrambleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()[]{}|<>?';

    let serviceIndex = 0;
    let phase = 'showing';
    let frameCount = 0;
    let targetText = services[0];
    let currentDisplay = targetText.split('');

    const interval = setInterval(() => {
      if (phase === 'showing') {
        frameCount++;
        if (frameCount > 12) {
          phase = 'scrambling';
          frameCount = 0;
        }
      } else if (phase === 'scrambling') {
        currentDisplay = currentDisplay.map(char =>
          char === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        frameCount++;

        if (frameCount > 4) {
          serviceIndex = (serviceIndex + 1) % services.length;
          targetText = services[serviceIndex];
          phase = 'resolving';
          frameCount = 0;
          currentDisplay = new Array(targetText.length).fill('').map((_, i) =>
            targetText[i] === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          );
        }
      } else if (phase === 'resolving') {
        const unresolved: number[] = [];
        for (let i = 0; i < targetText.length; i++) {
          if (currentDisplay[i] !== targetText[i] && targetText[i] !== ' ') {
            unresolved.push(i);
          }
        }

        if (unresolved.length > 0) {
          const toResolve = Math.min(Math.floor(Math.random() * 2) + 1, unresolved.length);
          for (let i = 0; i < toResolve; i++) {
            const randomIndex = Math.floor(Math.random() * unresolved.length);
            const charIndex = unresolved[randomIndex];
            currentDisplay[charIndex] = targetText[charIndex];
            unresolved.splice(randomIndex, 1);
          }

          for (let i = 0; i < currentDisplay.length; i++) {
            if (currentDisplay[i] !== targetText[i] && targetText[i] !== ' ') {
              currentDisplay[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
          }
        } else {
          phase = 'showing';
          frameCount = 0;
        }
      }

      setAnimatedText(currentDisplay.join(''));
    }, 100); // Fixed scramble speed

    return () => clearInterval(interval);
  }, [isClient]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative overflow-hidden`}>
      {/* Three.js Background Animation */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute w-full h-full"
          style={{
            left: `${animationPosition.x}%`,
            top: `${animationPosition.y}%`,
            width: '150%',
            height: '140%',
          }}
          onMouseEnter={() => setMouseHover(true)}
          onMouseLeave={() => setMouseHover(false)}
        >
          {isClient && (
            <div className="w-full h-full">
              <WireframeAnimation
                isDark={isDark}
                structured={globeStructured}
                colorIntense={colorIntense}
                isHovered={mouseHover}
                zoomLevel={zoomLevel}
                modelType={modelType}
                onZoomChange={(newZoom) => {
                  if (mouseHover) {
                    setZoomLevel(newZoom);
                  }
                }}
              />
            </div>
          )}
        </div>

      </div>

      {/* Header */}
      {/* Header removed as it is now provided by NavbarProvider */}

      {/* Main Content */}
      <div className="relative z-10" style={{ paddingTop: '160px' }}>

        {/* Main Text Display */}
        <div className="px-8 py-16 transition-all duration-500">
          <div className="mb-4">
            <div
              className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              style={{
                fontFamily: currentFont.fonts.mono,
                fontWeight: currentFont.weights.bold
              }}
            >
              {animatedText}
            </div>
          </div>

          <h2
            className={`text-5xl md:text-8xl lg:text-9xl font-bold ${isDark ? 'text-white' : 'text-black'} mb-4`}
            style={{
              fontFamily: currentFont.fonts.display,
              fontWeight: currentFont.weights.black
            }}
          >
            {animatedTitle}
          </h2>

          <p
            className={`text-lg md:text-xl lg:text-2xl font-medium ${isDark ? 'text-white' : 'text-black'}`}
            style={{
              fontFamily: currentFont.fonts.secondary
            }}
          >
            {animatedSubtitle1}
          </p>

          <p
            className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            style={{
              fontFamily: currentFont.fonts.primary
            }}
          >
            {animatedSubtitle2}
          </p>
        </div>

        {/* Vertical Zoom Slider - from landing page */}
        <div
          className="fixed right-8 top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto select-none"
          style={{ touchAction: 'none' }}
        >
          <div className="flex flex-col items-center gap-4">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} rotate-90 mb-4`}>
              ZOOM
            </span>
            <div className="relative h-64 flex flex-col items-center">
              <span className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>+</span>
              <div
                className="relative h-48 w-8 flex items-center justify-center cursor-pointer select-none"
                style={{ touchAction: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const height = rect.height;
                  const percentage = 100 - ((y / height) * 100);
                  const amplifiedZoom = 10 + ((percentage / 100) * 190);
                  setZoomLevel(Math.round(Math.min(200, Math.max(10, amplifiedZoom))));
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
              >
                {/* Track */}
                <div className={`absolute w-2 h-full rounded-full pointer-events-none ${isDark ? 'bg-gray-800 border border-gray-600' : 'bg-gray-300 border border-gray-400'
                  }`} />
                {/* Fill */}
                <div
                  className={`absolute w-2 rounded-full transition-all duration-300 pointer-events-none ${isDark ? 'bg-white' : 'bg-black'
                    }`}
                  style={{
                    height: `${((zoomLevel - 10) / 190) * 100}%`,
                    bottom: 0
                  }}
                />
                {/* Thumb */}
                <div
                  className={`absolute w-6 h-6 rounded-full cursor-grab active:cursor-grabbing select-none ${isDark ? 'bg-white border-2 border-gray-600 shadow-lg' : 'bg-black border-2 border-gray-400 shadow-lg'
                    } hover:scale-125 active:scale-110`}
                  style={{
                    bottom: `calc(${((zoomLevel - 10) / 190) * 100}% - 12px)`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    transition: 'scale 0.2s',
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                    const startY = e.clientY;
                    const startZoom = zoomLevel;

                    const thumb = e.currentTarget as HTMLElement;
                    thumb.style.transition = 'scale 0.2s';

                    const handleMouseMove = (e: MouseEvent) => {
                      e.preventDefault();
                      const deltaY = startY - e.clientY;
                      const percentChange = (deltaY / rect.height) * 100;
                      const zoomChange = (percentChange / 100) * 190;
                      const newZoom = Math.round(Math.min(200, Math.max(10, startZoom + zoomChange)));
                      setZoomLevel(newZoom);
                    };

                    const handleMouseUp = () => {
                      thumb.style.transition = 'scale 0.2s';
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                      document.body.style.cursor = '';
                      document.body.style.userSelect = '';
                    };

                    document.body.style.cursor = 'grabbing';
                    document.body.style.userSelect = 'none';
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    const touch = e.touches[0];
                    const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                    const startY = touch.clientY;
                    const startZoom = zoomLevel;

                    const handleTouchMove = (e: TouchEvent) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const deltaY = startY - touch.clientY;
                      const percentChange = (deltaY / rect.height) * 100;
                      const zoomChange = (percentChange / 100) * 190;
                      const newZoom = Math.round(Math.min(200, Math.max(10, startZoom + zoomChange)));
                      setZoomLevel(newZoom);
                    };

                    const handleTouchEnd = () => {
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };

                    document.addEventListener('touchmove', handleTouchMove, { passive: false });
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                />
              </div>
              <span className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>−</span>
              <div className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {zoomLevel < 50 ? 'Close' : zoomLevel < 100 ? 'Normal' : zoomLevel < 150 ? 'Zoom' : 'Max Zoom'}
              </div>
            </div>
          </div>
        </div>

        {/* Simple Model Toggle - Similar to landing page */}
        <div className="fixed bottom-8 right-8 z-20">
          <button
            onClick={() => {
              const models: ('wireframe' | 'gundam')[] = ['wireframe', 'gundam'];
              const currentIndex = models.indexOf(modelType);
              const nextIndex = (currentIndex + 1) % models.length;
              setModelType(models[nextIndex]);
            }}
            className={`p-3 rounded-full transition-all shadow-lg ${modelType === 'gundam'
              ? 'bg-red-500/20 text-red-400 border-2 border-red-500/40 backdrop-blur-md'
              : isDark
                ? 'bg-white/10 hover:bg-white/20 text-white border-2 border-white/20 backdrop-blur-md'
                : 'bg-black/10 hover:bg-black/20 text-black border-2 border-black/20 backdrop-blur-md'
              }`}
            aria-label="Toggle 3D model"
            title={modelType === 'gundam' ? 'Switch to Wireframe' : 'Switch to Gundam'}
          >
            <FiBox size={20} />
          </button>
        </div>

      </div>
    </div>
  );
}