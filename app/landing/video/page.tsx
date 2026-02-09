'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiGithub, FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { portfolioData } from '@/lib/data';
import dynamic from 'next/dynamic';


// Dynamically import Three.js animation to avoid SSR issues
const WireframeAnimation = dynamic(
  () => import('@/components/landing/WireframeAnimation'),
  { ssr: false }
);


interface Skill {
  name: string;
  percentage: number;
  score: string;
  count: number;
}

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

export default function MockupPage() {
  // Prevent hydration mismatches by using client-only state
  const [isClient, setIsClient] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeCategory, setActiveCategory] = useState('projects');
  const [animatedText, setAnimatedText] = useState('GRAPHIC DESIGN');
  const [animatedScore, setAnimatedScore] = useState('00:00:00');
  const [animatedTitle, setAnimatedTitle] = useState('B0ASE');
  const [animatedSubtitle1, setAnimatedSubtitle1] = useState('Web Design Studio & Digital Atelier');
  const [animatedSubtitle2, setAnimatedSubtitle2] = useState('Crafting bespoke digital experiences where elegant design meets blockchain innovation.');
  const [selectedFont, setSelectedFont] = useState(0);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [animationExpanded, setAnimationExpanded] = useState(true); // Start expanded
  const [animationPosition, setAnimationPosition] = useState({ x: -20, y: -10 }); // Start top-left
  const [globeStructured, setGlobeStructured] = useState(false); // Start with messy state
  const [colorIntense, setColorIntense] = useState(false); // Toggle for color intensity
  const [mouseHover, setMouseHover] = useState(false); // Simple hover state
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom level 10-200, start at 100 (middle)
  const [showStateWindow, setShowStateWindow] = useState(false); // Show state debug window
  const [copiedState, setCopiedState] = useState(false); // Show copied tooltip
  const [autoCycle, setAutoCycle] = useState(true); // Auto-cycle states

  // Ensure client-side only rendering to prevent hydration issues
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
    },
    {
      name: 'Grotesk',
      fonts: {
        primary: 'Space Grotesk, sans-serif',
        secondary: 'Work Sans, sans-serif',
        mono: 'Space Mono, monospace',
        display: 'Space Grotesk, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    },
    {
      name: 'Neutral',
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'Inter, sans-serif',
        mono: 'JetBrains Mono, monospace',
        display: 'Inter, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    },
    {
      name: 'Minimal Sans',
      fonts: {
        primary: 'Plus Jakarta Sans, sans-serif',
        secondary: 'Outfit, sans-serif',
        mono: 'Source Code Pro, monospace',
        display: 'Plus Jakarta Sans, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 800 }
    },
    {
      name: 'Modern Classic',
      fonts: {
        primary: 'Syne, sans-serif',
        secondary: 'Lexend, sans-serif',
        mono: 'Overpass Mono, monospace',
        display: 'Syne, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 800 }
    }
  ];

  // Ensure selectedFont is within bounds and get current font
  const safeSelectedFont = Math.max(0, Math.min(selectedFont, fontOptions.length - 1));
  const currentFont = fontOptions[safeSelectedFont] || fontOptions[0];

  // Sync selectedFont if it goes out of bounds
  useEffect(() => {
    if (selectedFont < 0 || selectedFont >= fontOptions.length) {
      setSelectedFont(0);
    }
  }, [selectedFont, fontOptions.length]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);


  // Slow animation movement effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (animationExpanded) {
        setAnimationPosition({
          x: Math.sin(Date.now() * 0.0003) * 15 - 20,
          y: Math.cos(Date.now() * 0.0002) * 10 - 10
        });
      } else {
        setAnimationPosition({ x: 0, y: 0 }); // Center when not expanded
      }
    }, 50);

    return () => clearInterval(interval);
  }, [animationExpanded]);

  // Auto-cycle through different states
  useEffect(() => {
    if (!autoCycle || !isClient) return;

    let timeoutId: NodeJS.Timeout;

    const cycleStates = () => {
      // Randomly choose what to change
      const changes = Math.floor(Math.random() * 2) + 1; // Change 1-2 things at once
      const choices = new Set<number>(); // Avoid changing the same thing twice

      while (choices.size < changes) {
        choices.add(Math.floor(Math.random() * 7));
      }

      choices.forEach(choice => {
        switch (choice) {
          case 0: // Toggle theme
            setIsDark(prev => !prev);
            break;
          case 1: // Random font
            setSelectedFont(Math.floor(Math.random() * fontOptions.length));
            break;
          case 2: // Toggle color intensity
            setColorIntense(prev => !prev);
            break;
          case 3: // Toggle globe structure
            setGlobeStructured(prev => !prev);
            break;
          case 4: // Toggle animation movement
            setAnimationExpanded(prev => !prev);
            break;
          case 5: // Random zoom level (biased towards extremes and middle) - Updated for 10-200 range
            const zoomOptions = [10, 50, 100, 150, 200];
            setZoomLevel(zoomOptions[Math.floor(Math.random() * zoomOptions.length)]);
            break;
          case 6: // Random category
            const categories = ['projects', 'skills', 'services'];
            setActiveCategory(categories[Math.floor(Math.random() * categories.length)]);
            break;
        }
      });

      // Schedule next cycle
      const delay = Math.floor(Math.random() * 5000) + 5000; // 5-10 seconds
      timeoutId = setTimeout(cycleStates, delay);
    };

    // Start the first cycle
    const initialDelay = Math.floor(Math.random() * 3000) + 3000; // 3-6 seconds for first change
    timeoutId = setTimeout(cycleStates, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [autoCycle, fontOptions.length, isClient]);


  // Service animation effect
  useEffect(() => {
    if (!isClient) return; // Don't start animation until client-ready

    const services = [
      'GRAPHIC DESIGN',
      'WORDPRESS DESIGN',
      'WEBSITES',
      'SOFTWARE',
      'CODE',
      'WEB DEVELOPMENT',
      'APP DEVELOPMENT',
      'LOGO BRANDING',
      'VIDEO PRODUCTION',
      'UI/UX DESIGN',
      'BLOCKCHAIN',
      'AI DEVELOPMENT',
      'CONSULTING',
      'FULL STACK DEV'
    ];

    const scrambleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()[]{}|<>?';

    let serviceIndex = 0;
    let phase = 'showing'; // 'showing', 'scrambling', 'resolving'
    let frameCount = 0;
    let targetText = services[0];
    let currentDisplay = targetText.split('');

    const interval = setInterval(() => {
      if (phase === 'showing') {
        // Show the service for 1 second (about 12 frames at 80ms)
        frameCount++;
        if (frameCount > 12) {
          phase = 'scrambling';
          frameCount = 0;
        }
      } else if (phase === 'scrambling') {
        // Scramble all characters for a bit
        currentDisplay = currentDisplay.map(char =>
          char === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        frameCount++;

        if (frameCount > 4) {
          // Move to next service and start resolving
          serviceIndex = (serviceIndex + 1) % services.length;
          targetText = services[serviceIndex];
          phase = 'resolving';
          frameCount = 0;
          // Ensure display array matches target length
          currentDisplay = new Array(targetText.length).fill('').map((_, i) =>
            targetText[i] === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
          );
        }
      } else if (phase === 'resolving') {
        // Resolve letters one by one randomly
        const unresolved: number[] = [];
        for (let i = 0; i < targetText.length; i++) {
          if (currentDisplay[i] !== targetText[i] && targetText[i] !== ' ') {
            unresolved.push(i);
          }
        }

        if (unresolved.length > 0) {
          // Randomly resolve 1-2 characters per frame
          const toResolve = Math.min(Math.floor(Math.random() * 2) + 1, unresolved.length);
          for (let i = 0; i < toResolve; i++) {
            const randomIndex = Math.floor(Math.random() * unresolved.length);
            const charIndex = unresolved[randomIndex];
            currentDisplay[charIndex] = targetText[charIndex];
            unresolved.splice(randomIndex, 1);
          }

          // Continue scrambling other positions
          for (let i = 0; i < currentDisplay.length; i++) {
            if (currentDisplay[i] !== targetText[i] && targetText[i] !== ' ') {
              currentDisplay[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
          }
        } else {
          // All resolved, go to showing phase
          phase = 'showing';
          frameCount = 0;
        }
      }

      setAnimatedText(currentDisplay.join(''));
    }, 80);

    return () => clearInterval(interval);
  }, [isClient]);

  const skills: Skill[] = [
    { name: 'Apps & Tools', percentage: 92, score: '9.2', count: portfolioData.skills.apps.length },
    { name: 'Platforms', percentage: 88, score: '8.8', count: portfolioData.skills.platforms.length },
    { name: 'Languages', percentage: 95, score: '9.5', count: portfolioData.skills.languages.length },
    { name: 'Frameworks', percentage: 90, score: '9.0', count: portfolioData.skills.frameworks.length },
    { name: 'Databases', percentage: 85, score: '8.5', count: portfolioData.skills.databases.length },
  ];

  // Get all projects with scores and better categorization
  const allProjects = portfolioData.projects.map((project, index) => ({
    ...project,
    score: (9.8 - index * 0.05).toFixed(1), // More granular decreasing scores
    category: project.type === 'domain' ? 'Live Site' : project.type === 'github' ? 'Open Source' : 'Client Work',
    hasLiveDemo: !!(project.liveUrl),
    hasGithub: !!(project.githubUrl)
  }));

  const services = portfolioData.services;

  const [currentTimezone, setCurrentTimezone] = useState(0);
  const [showingTime, setShowingTime] = useState(false);

  // Calculate a simple total score for the stats
  const totalScore = (skills.reduce((acc, skill) => acc + parseFloat(skill.score), 0) / skills.length).toFixed(2);

  const timezones = [
    { name: 'GMT', offset: 0, label: 'LON' },
    { name: 'EST', offset: -5, label: 'NYC' },
    { name: 'PST', offset: -8, label: 'LAX' },
    { name: 'JST', offset: 9, label: 'TYO' },
    { name: 'AEST', offset: 10, label: 'SYD' },
    { name: 'CET', offset: 1, label: 'PAR' },
    { name: 'CST', offset: -6, label: 'CHI' },
    { name: 'HKT', offset: 8, label: 'HKG' },
  ];

  const getTimeForZone = (offset: number) => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const zoneTime = new Date(utcTime + (3600000 * offset));
    const hours = zoneTime.getHours().toString().padStart(2, '0');
    const minutes = zoneTime.getMinutes().toString().padStart(2, '0');
    const seconds = zoneTime.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Animation for B0ASE title and subtitles - synchronized scramble
  useEffect(() => {
    if (!isClient) return;

    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const titleTarget = 'B0ASE';
    const subtitle1Target = 'Web Design Studio & Digital Atelier';
    const subtitle2Target = 'Crafting bespoke digital experiences where elegant design meets blockchain innovation.';

    let titleDisplay = titleTarget.split('');
    let subtitle1Display = subtitle1Target.split('');
    let subtitle2Display = subtitle2Target.split('');
    let isAnimating = false;
    let currentFontIndex = selectedFont;

    const animateTexts = () => {
      if (isAnimating) return;
      isAnimating = true;

      // Pick a new random font
      const newFontIndex = Math.floor(Math.random() * fontOptions.length);

      // Phase 1: Synchronized scramble
      let scrambleFrames = 0;
      const maxScrambleFrames = 6;

      const scramblePhase = setInterval(() => {
        // Scramble all three texts in sync
        titleDisplay = titleTarget.split('').map(char =>
          char === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        subtitle1Display = subtitle1Target.split('').map(char =>
          (char === ' ' || char === '&') ? char : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        subtitle2Display = subtitle2Target.split('').map(char =>
          (char === ' ' || char === '.') ? char : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );

        setAnimatedTitle(titleDisplay.join(''));
        setAnimatedSubtitle1(subtitle1Display.join(''));
        setAnimatedSubtitle2(subtitle2Display.join(''));

        scrambleFrames++;

        if (scrambleFrames >= maxScrambleFrames) {
          clearInterval(scramblePhase);

          // Change font at peak of scramble
          setSelectedFont(newFontIndex);
          currentFontIndex = newFontIndex;

          // Phase 2: Synchronized resolve
          let resolveFrames = 0;
          const maxResolveFrames = 8;

          const resolvePhase = setInterval(() => {
            const resolveProgress = resolveFrames / maxResolveFrames;

            // Title resolves first (fastest)
            titleDisplay = titleTarget.split('').map((char, i) => {
              if (char === ' ') return ' ';
              if (Math.random() < 0.4 + resolveProgress * 0.6) return char;
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            });

            // Subtitle 1 resolves second
            subtitle1Display = subtitle1Target.split('').map((char, i) => {
              if (char === ' ' || char === '&') return char;
              if (Math.random() < 0.3 + resolveProgress * 0.5) return char;
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            });

            // Subtitle 2 resolves last (slowest)
            subtitle2Display = subtitle2Target.split('').map((char, i) => {
              if (char === ' ' || char === '.') return char;
              if (Math.random() < 0.2 + resolveProgress * 0.4) return char;
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            });

            setAnimatedTitle(titleDisplay.join(''));
            setAnimatedSubtitle1(subtitle1Display.join(''));
            setAnimatedSubtitle2(subtitle2Display.join(''));

            resolveFrames++;

            if (resolveFrames >= maxResolveFrames) {
              clearInterval(resolvePhase);
              // Final snap to correct text
              setAnimatedTitle(titleTarget);
              setAnimatedSubtitle1(subtitle1Target);
              setAnimatedSubtitle2(subtitle2Target);
              isAnimating = false;
            }
          }, 40);
        }
      }, 40);
    };

    // Start animations on a regular interval
    const initialDelay = setTimeout(() => {
      animateTexts();
      const interval = setInterval(animateTexts, 8000); // Every 8 seconds
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(initialDelay);
  }, [isClient]);

  // Clock animation - scramble and resolve with timezone and font cycling
  useEffect(() => {
    if (!isClient) return;

    const scrambleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*_+-=[]{}|<>?/~`一二∞√×÷';
    let currentDisplay = ['0', '0', ':', '0', '0', ':', '0', '0'];
    let isScrambling = false;
    let timezoneIndex = 0;
    let currentClockFont = selectedFont;

    const scrambleScore = () => {
      if (isScrambling) return;
      isScrambling = true;

      // Pick a random font to land on (different from current)
      let newClockFontIndex;
      do {
        newClockFontIndex = Math.floor(Math.random() * fontOptions.length);
      } while (newClockFontIndex === currentClockFont);

      // Get current time for current timezone
      const zone = timezones[timezoneIndex];
      const targetTime = getTimeForZone(zone.offset);
      const targetDisplay = targetTime.split('');

      // Phase 1: Scramble for a bit while cycling fonts
      let scrambleCount = 0;
      const maxScrambles = 12;

      const scrambleInterval = setInterval(() => {
        // Cycle through fonts during scramble
        const tempFontIndex = Math.floor(Math.random() * fontOptions.length);
        setSelectedFont(tempFontIndex);
        currentDisplay = currentDisplay.map((char, index) => {
          if (index === 2 || index === 5) return ':'; // Keep colons
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        });

        setAnimatedScore(currentDisplay.join(''));
        setShowingTime(false);
        scrambleCount++;

        if (scrambleCount >= maxScrambles) {
          clearInterval(scrambleInterval);
          // Set the final font
          setSelectedFont(newClockFontIndex);
          currentClockFont = newClockFontIndex;

          // Phase 2: Resolve to actual time
          const resolveInterval = setInterval(() => {
            let allResolved = true;

            for (let i = 0; i < targetDisplay.length; i++) {
              if (currentDisplay[i] !== targetDisplay[i] && i !== 2 && i !== 5) {
                if (Math.random() < 0.2) {
                  currentDisplay[i] = targetDisplay[i];
                } else {
                  currentDisplay[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                  allResolved = false;
                }
              }
            }

            setAnimatedScore(currentDisplay.join(''));

            if (allResolved) {
              clearInterval(resolveInterval);
              setShowingTime(true);

              // Hold the real time for 3 seconds
              setTimeout(() => {
                isScrambling = false;
                // Move to next timezone for next animation
                timezoneIndex = (timezoneIndex + 1) % timezones.length;
                setCurrentTimezone(timezoneIndex);
              }, 3000);
            }
          }, 80);
        }
      }, 100);
    };

    // Initial delay, then regular intervals
    let regularInterval: NodeJS.Timeout;
    const startDelay = setTimeout(() => {
      scrambleScore();

      regularInterval = setInterval(() => {
        scrambleScore();
      }, 10000 + Math.random() * 5000); // 10-15 seconds between scrambles
    }, 3500); // Start shortly after other animations

    return () => {
      clearTimeout(startDelay);
      if (regularInterval) clearInterval(regularInterval);
    };
  }, [isClient]);

  // No loading screen - render immediately

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative overflow-x-hidden`}
    >
      {/* Three.js Background Animation - Fixed position behind everything */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute w-full h-full"
          style={{
            left: `${animationPosition.x}%`,
            top: `${animationPosition.y}%`,
            width: '150%',
            height: '140%',
          }}
        >
          {/* Only render Three.js animation after client is ready */}
          {isClient && (
            <div className="w-full h-full">
              <WireframeAnimation
                isDark={isDark}
                structured={globeStructured}
                colorIntense={colorIntense}
                isHovered={false}
                zoomLevel={zoomLevel}
              />
            </div>
          )}
          {/* Fallback background while loading */}
          {!isClient && (
            <div className={`w-full h-full ${isDark ? 'bg-black' : 'bg-white'}`} />
          )}
        </div>
      </div>

      {/* Header */}
      {/* Header removed as it is now provided by NavbarProvider */}


      {/* Vertical Zoom Slider - always visible, outside of content */}
      <div
        className="fixed right-8 top-1/2 -translate-y-1/2 z-[9999] pointer-events-auto"
      >
        <div className="flex flex-col items-center gap-4">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} rotate-90 mb-4`}>
            ZOOM
          </span>
          <div className="relative h-64 flex flex-col items-center">
            <span className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>+</span>
            <div
              className="relative h-48 w-8 flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const height = rect.height;
                const percentage = 100 - ((y / height) * 100);
                const amplifiedZoom = 10 + ((percentage / 100) * 190);
                setZoomLevel(Math.round(Math.min(200, Math.max(10, amplifiedZoom))));
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
                className={`absolute w-6 h-6 rounded-full cursor-grab active:cursor-grabbing ${isDark ? 'bg-white border-2 border-gray-600 shadow-lg' : 'bg-black border-2 border-gray-400 shadow-lg'
                  } hover:scale-125 active:scale-110`}
                style={{
                  bottom: `calc(${((zoomLevel - 10) / 190) * 100}% - 12px)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transition: 'scale 0.2s'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                  const startY = e.clientY;
                  const startZoom = zoomLevel;

                  // Remove transition during drag
                  const thumb = e.currentTarget as HTMLElement;
                  thumb.style.transition = 'scale 0.2s';

                  const handleMouseMove = (e: MouseEvent) => {
                    const deltaY = startY - e.clientY;
                    const percentChange = (deltaY / rect.height) * 100;
                    const zoomChange = (percentChange / 100) * 190;
                    const newZoom = Math.round(Math.min(200, Math.max(10, startZoom + zoomChange)));
                    setZoomLevel(newZoom);
                  };

                  const handleMouseUp = () => {
                    // Re-add transition after drag
                    thumb.style.transition = 'scale 0.2s';
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                    document.body.style.cursor = '';
                  };

                  document.body.style.cursor = 'grabbing';
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
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

      {/* Main Content - positioned above the animation */}
      <div className="relative z-10 pointer-events-none overflow-x-hidden" style={{ paddingTop: '160px' }}>

        {/* Main Score Section with Video */}
        <section
          className="px-8 py-16 relative pointer-events-auto"
        >
          <div className="flex gap-8">
            {/* Left side - Original content */}
            <div className="flex-1 overflow-x-hidden">
              <div className="mb-4">
                {/* Animated service text */}
                <div className="mb-2">
                  <div
                    className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-none`}
                    style={isClient ? {
                      fontFamily: currentFont.fonts.mono,
                      fontWeight: currentFont.weights.bold,
                      minHeight: '2.5rem'
                    } : {}}
                  >
                    {animatedText}
                  </div>
                </div>

                {/* Main Title */}
                <div className="mb-6">
                  <h2
                    className={`text-5xl md:text-8xl lg:text-9xl font-bold ${isDark ? 'text-white' : 'text-black'} leading-none select-none`}
                    style={isClient ? {
                      fontFamily: currentFont.fonts.display,
                      fontWeight: currentFont.weights.black,
                      letterSpacing: '0.02em',
                      minHeight: '1.2em'
                    } : {}}
                  >
                    {animatedTitle}
                  </h2>
                </div>

                {/* Subtitles with better spacing */}
                <div className="space-y-3 w-full max-w-6xl">
                  <p
                    className={`text-lg md:text-xl lg:text-2xl font-medium ${isDark ? 'text-white' : 'text-black'} leading-tight`}
                    style={isClient ? {
                      fontFamily: currentFont.fonts.secondary,
                      fontWeight: currentFont.weights.regular,
                      minHeight: '1.5em'
                    } : {}}
                  >
                    {animatedSubtitle1}
                  </p>
                  <p
                    className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    style={isClient ? {
                      fontFamily: currentFont.fonts.primary,
                      fontWeight: currentFont.weights.regular,
                      minHeight: '2.5em'
                    } : {}}
                  >
                    {animatedSubtitle2}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                      Full-Stack Development
                    </span>
                    <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                      Smart Contract Integration
                    </span>
                    <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                      AI Agent Architecture
                    </span>
                    <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                      Music Production
                    </span>
                    <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                      Video Production
                    </span>
                    <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                      A/V Content
                    </span>
                    <span className={`px-3 py-1.5 text-xs rounded-full border ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'
                      }`}>
                      Live Shows
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-16 md:h-20 lg:h-24 flex items-center gap-4 md:gap-8 mb-8 overflow-hidden">
                <span className={`text-4xl md:text-6xl lg:text-8xl font-bold flex-shrink-0 ${isDark ? 'text-white' : 'text-black'}`}>→</span>
                <span
                  className={`text-4xl md:text-6xl lg:text-8xl font-bold ${isDark ? 'text-white' : 'text-black'} leading-none`}
                  style={isClient ? {
                    fontFamily: currentFont.fonts.mono,
                    fontWeight: currentFont.weights.bold
                  } : {}}
                >
                  {animatedScore}
                </span>
                <span className={`text-2xl md:text-3xl lg:text-4xl flex-shrink-0 transition-all duration-300 ${showingTime
                  ? isDark ? 'text-white' : 'text-black'
                  : isDark ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                  {timezones[currentTimezone].label}
                </span>
              </div>

              <div className="text-right mb-12">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Evaluation System</p>
              </div>

              {/* Skills Bars */}
              <div
                className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16"
              >
                {skills.map((skill, index) => (
                  <div
                    key={skill.name}
                  >
                    <div className="flex justify-between mb-2">
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{skill.name}</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {skill.count} items
                      </span>
                    </div>
                    <div className={`h-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`}
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                    <div className="mt-8">
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {skill.score} / 10
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} my-16`} />

              {/* Active Category Content */}
              {activeCategory === 'projects' && (
                <>
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>All Projects</h3>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{allProjects.length} Projects</span>
                    </div>

                    {/* Project Cards */}
                    <div className="space-y-2">
                      {allProjects.map((project, index) => (
                        <div
                          key={project.id}
                          className={`group border-b ${isDark ? 'border-gray-800 hover:border-gray-600' : 'border-gray-200 hover:border-gray-400'} transition-all duration-300 relative`}
                        >
                          {/* Clickable overlay for main project link */}
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 z-10 cursor-pointer"
                            />
                          )}

                          <div className="py-6 flex items-center justify-between">
                            <div className="flex items-center gap-8">
                              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} w-8`}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <div className="flex-1">
                                <h4 className={`text-xl font-medium mb-1 ${isDark ? 'text-white' : 'text-black'} group-hover:text-blue-400 transition-colors`}>
                                  {project.title}
                                  {project.hasLiveDemo && (
                                    <span className="ml-2 text-xs text-green-500">● LIVE</span>
                                  )}
                                </h4>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-md line-clamp-2`}>
                                  {project.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {project.category}
                                  </span>
                                  {project.tech.slice(0, 2).map((tech) => (
                                    <span key={tech} className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'
                                      }`}>
                                      {tech}
                                    </span>
                                  ))}
                                  {project.tech.length > 2 && (
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                      +{project.tech.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-12 relative z-20">
                              <div className="text-right">
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score</p>
                                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                                  {project.score}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
                                <p className={`text-sm font-medium ${project.status === 'Active' || project.status === 'Production' || project.status === 'Live'
                                  ? 'text-green-500'
                                  : project.status === 'Development' || project.status === 'Beta'
                                    ? 'text-yellow-500'
                                    : isDark ? 'text-gray-500' : 'text-gray-400'
                                  }`}>
                                  {project.status}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {project.hasGithub && (
                                  <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-full transition-all z-30 relative ${isDark
                                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                      : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                                      }`}
                                    title="View Source Code"
                                  >
                                    <FiGithub size={18} />
                                  </a>
                                )}
                                {project.hasLiveDemo && (
                                  <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 rounded-full transition-all z-30 relative ${isDark
                                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                      : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                                      }`}
                                    title="Visit Live Site"
                                  >
                                    <FiExternalLink size={18} />
                                  </a>
                                )}
                                {!project.hasLiveDemo && !project.hasGithub && (
                                  <Link
                                    href={`/portfolio/${project.slug}`}
                                    className={`p-2 rounded-full transition-all z-30 relative ${isDark
                                      ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                      : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                                      }`}
                                    title="View Project Details"
                                  >
                                    <FiArrowRight size={18} />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activeCategory === 'skills' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Object.entries(portfolioData.skills).map(([category, items]) => (
                    <div key={category}>
                      <h3 className={`text-lg font-bold mb-4 capitalize ${isDark ? 'text-white' : 'text-black'}`}>
                        {category === 'apps' ? 'Apps & Tools' : category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(items as string[]).slice(0, 8).map((item) => (
                          <span
                            key={item}
                            className={`text-xs px-3 py-1 rounded-full border ${isDark
                              ? 'border-gray-800 text-gray-400 hover:border-gray-600'
                              : 'border-gray-200 text-gray-600 hover:border-gray-400'
                              } transition-all`}
                          >
                            {item}
                          </span>
                        ))}
                        {(items as string[]).length > 8 && (
                          <span className={`text-xs px-3 py-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            +{(items as string[]).length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === 'services' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
                  {services.map((service, index) => (
                    <div
                      key={service.id}
                      className={`group flex items-start justify-between py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'
                        }`}
                    >
                      <div className="flex gap-4 flex-1">
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                            {service.title}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <FiArrowRight className={`ml-4 mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Stats */}
              <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Total Projects</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{portfolioData.projects.length}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Services</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{services.length}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Tech Stack</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {portfolioData.skills.languages.length + portfolioData.skills.frameworks.length}+
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Overall Score</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{totalScore}</p>
                </div>
              </div>

              {/* Footer */}
              <div className={`mt-24 pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <a
                      href={portfolioData.about.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 border rounded-full text-sm ${isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-500'
                        }`}
                    >
                      GitHub
                    </a>
                    <a
                      href={portfolioData.about.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 border rounded-full text-sm ${isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-500'
                        }`}
                    >
                      LinkedIn
                    </a>
                    <a
                      href={portfolioData.notion.projectsPage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 border rounded-full text-sm ${isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-500'
                        }`}
                    >
                      Notion
                    </a>
                    <a
                      href="mailto:richard@b0ase.com"
                      className={`px-4 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                      Contact
                    </a>
                  </div>

                  <div className="hidden md:flex items-center gap-8 text-right">
                    {skills.slice(0, 4).map((skill) => (
                      <div key={skill.name}>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{skill.name.split(' ')[0]}</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>{parseFloat(skill.score).toFixed(0)}</p>
                      </div>
                    ))}
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Overall</p>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{totalScore}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>{/* End of Left side - Original content */}

            {/* Right side - Video */}
            <div className="w-96 flex-shrink-0 sticky top-40">
              <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900 border border-gray-800' : 'bg-gray-100 border border-gray-200'} shadow-2xl`}>
                <div className={`px-4 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-black'}`}>Demo Video</h3>
                </div>
                <div className="relative" style={{ paddingBottom: '177.78%' }}>
                  <iframe
                    src="https://drive.google.com/file/d/1xUOJ3SyYAZpLQDJEBgC_sNGSLyHiuEU9/preview"
                    className="absolute top-0 left-0 w-full h-full"
                    allow="autoplay"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div> {/* End of relative z-10 content wrapper */}

    </div>
  );
}