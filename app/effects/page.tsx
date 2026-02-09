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
  const [clockFont, setClockFont] = useState(0); // Separate font state for clock
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [animationExpanded, setAnimationExpanded] = useState(true); // Start expanded
  const [animationPosition, setAnimationPosition] = useState({ x: -20, y: -10 }); // Start top-left
  const [globeStructured, setGlobeStructured] = useState(false); // Start with messy state
  const [colorIntense, setColorIntense] = useState(false); // Toggle for color intensity
  const [mouseHover, setMouseHover] = useState(false); // Simple hover state - disabled on mobile
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom level 10-200, start at 100 (middle)
  const [showStateWindow, setShowStateWindow] = useState(false); // Show state debug window
  const [resetView, setResetView] = useState(false); // Trigger camera reset
  const [autoCycle, setAutoCycle] = useState(true); // Auto-cycle states
  // Start with wireframe to prevent hydration mismatch, randomize after mount
  const [modelType, setModelType] = useState<'wireframe' | 'gundam'>('wireframe');

  // Ensure client-side only rendering to prevent hydration issues
  useEffect(() => {
    setIsClient(true);

    // On mobile, use wireframe only. Desktop can use either
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      setModelType('wireframe');
      setMouseHover(false); // Disable 3D controls on mobile
      setZoomLevel(100); // Reset zoom to normal on mobile
    } else {
      // Randomly select between wireframe and gundam after client mount
      const models: ('wireframe' | 'gundam')[] = ['wireframe', 'gundam'];
      setModelType(models[Math.floor(Math.random() * models.length)]);
    }
  }, []);

  // Disable scrolling when move toggle is active
  useEffect(() => {
    if (mouseHover) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // Re-enable scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [mouseHover]);

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


  // Slow animation movement effect - optimized for mobile
  useEffect(() => {
    // Reduce update frequency on mobile to prevent memory issues
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
    const updateInterval = isMobileDevice ? 500 : 50; // Much slower on mobile

    const interval = setInterval(() => {
      if (animationExpanded && !isMobileDevice) { // Disable on mobile
        setAnimationPosition({
          x: Math.sin(Date.now() * 0.0003) * 15 - 20,
          y: Math.cos(Date.now() * 0.0002) * 10 - 10
        });
      } else {
        setAnimationPosition({ x: 0, y: 0 }); // Center when not expanded or on mobile
      }
    }, updateInterval);

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
        choices.add(Math.floor(Math.random() * 8)); // Increased to 8 options
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
          case 5: // Skip zoom changes - was causing crazy zoom behavior
            // Disabled zoom auto-cycling
            break;
          case 6: // Random category
            const categories = ['projects', 'skills', 'services'];
            setActiveCategory(categories[Math.floor(Math.random() * categories.length)]);
            break;
          case 7: // Toggle 3D model type (skip on mobile to prevent memory issues)
            const isMobile = window.innerWidth < 768;
            if (!isMobile) {
              setModelType(prev => prev === 'wireframe' ? 'gundam' : 'wireframe');
            }
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
      'AUDIO VISUALS',
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
    { name: 'GMT', offset: 0, label: 'LHR' },  // London Heathrow
    { name: 'EST', offset: -5, label: 'JFK' },  // New York JFK
    { name: 'PST', offset: -8, label: 'LAX' },  // Los Angeles
    { name: 'JST', offset: 9, label: 'NRT' },   // Tokyo Narita
    { name: 'AEST', offset: 10, label: 'SYD' }, // Sydney
    { name: 'CET', offset: 1, label: 'CDG' },   // Paris Charles de Gaulle
    { name: 'CST', offset: -6, label: 'ORD' },  // Chicago O'Hare
    { name: 'HKT', offset: 8, label: 'HKG' },   // Hong Kong
    { name: 'GST', offset: 4, label: 'DXB' },   // Dubai
    { name: 'SGT', offset: 8, label: 'SIN' },   // Singapore
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

  // Update clock every second when not scrambling
  useEffect(() => {
    if (!isClient) return;

    // Set initial time immediately
    const zone = timezones[currentTimezone];
    const currentTime = getTimeForZone(zone.offset);
    setAnimatedScore(currentTime);

    const clockInterval = setInterval(() => {
      // Only update if not currently scrambling
      if (!showingTime) {
        const zone = timezones[currentTimezone];
        const currentTime = getTimeForZone(zone.offset);
        setAnimatedScore(currentTime);
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [isClient, currentTimezone, showingTime]);

  // Animation for B0ASE title - independent timeline
  useEffect(() => {
    if (!isClient) return;

    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const titleTarget = 'B0ASE';
    let titleDisplay = titleTarget.split('');
    let isAnimating = false;

    const animateTitle = () => {
      if (isAnimating) return;
      isAnimating = true;

      // Pick a new random font
      const newFontIndex = Math.floor(Math.random() * fontOptions.length);

      // Scramble phase
      let scrambleFrames = 0;
      const maxScrambleFrames = 6;

      const scramblePhase = setInterval(() => {
        titleDisplay = titleTarget.split('').map(char =>
          char === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        setAnimatedTitle(titleDisplay.join(''));
        scrambleFrames++;

        if (scrambleFrames >= maxScrambleFrames) {
          clearInterval(scramblePhase);
          setSelectedFont(newFontIndex);

          // Resolve phase
          const resolvePhase = setInterval(() => {
            let allResolved = true;
            titleDisplay = titleTarget.split('').map((char, i) => {
              if (titleDisplay[i] === char) return char;
              if (Math.random() < 0.3) return char;
              allResolved = false;
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            });
            setAnimatedTitle(titleDisplay.join(''));

            if (allResolved) {
              clearInterval(resolvePhase);
              isAnimating = false;
            }
          }, 40);
        }
      }, 40);
    };

    // Start title animation on its own timeline
    let interval: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      animateTitle();
      interval = setInterval(animateTitle, 6500); // Every 6.5 seconds
    }, 1500);

    return () => {
      clearTimeout(initialDelay);
      if (interval) clearInterval(interval);
    };
  }, [isClient, fontOptions.length]);

  // Animation for Subtitle 1 - independent timeline
  useEffect(() => {
    if (!isClient) return;

    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const subtitle1Target = 'Web Design Studio & Digital Atelier';
    let subtitle1Display = subtitle1Target.split('');
    let isAnimating = false;

    const animateSubtitle1 = () => {
      if (isAnimating) return;
      isAnimating = true;

      // Pick a new random font
      const newFontIndex = Math.floor(Math.random() * fontOptions.length);

      // Scramble phase
      let scrambleFrames = 0;
      const maxScrambleFrames = 8;

      const scramblePhase = setInterval(() => {
        subtitle1Display = subtitle1Target.split('').map(char =>
          (char === ' ' || char === '&') ? char : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        setAnimatedSubtitle1(subtitle1Display.join(''));
        scrambleFrames++;

        if (scrambleFrames >= maxScrambleFrames) {
          clearInterval(scramblePhase);
          setSelectedFont(newFontIndex);

          // Resolve phase
          const resolvePhase = setInterval(() => {
            let allResolved = true;
            subtitle1Display = subtitle1Target.split('').map((char, i) => {
              if (char === ' ' || char === '&') return char;
              if (subtitle1Display[i] === char) return char;
              if (Math.random() < 0.25) return char;
              allResolved = false;
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            });
            setAnimatedSubtitle1(subtitle1Display.join(''));

            if (allResolved) {
              clearInterval(resolvePhase);
              isAnimating = false;
            }
          }, 45);
        }
      }, 45);
    };

    // Start subtitle1 animation on its own timeline  
    let interval: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      animateSubtitle1();
      interval = setInterval(animateSubtitle1, 9000); // Every 9 seconds
    }, 3000);

    return () => {
      clearTimeout(initialDelay);
      if (interval) clearInterval(interval);
    };
  }, [isClient, fontOptions.length]);

  // Animation for Subtitle 2 - independent timeline
  useEffect(() => {
    if (!isClient) return;

    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const subtitle2Target = 'Crafting bespoke digital experiences where elegant design meets blockchain innovation.';
    let subtitle2Display = subtitle2Target.split('');
    let isAnimating = false;

    const animateSubtitle2 = () => {
      if (isAnimating) return;
      isAnimating = true;

      // Pick a new random font
      const newFontIndex = Math.floor(Math.random() * fontOptions.length);

      // Scramble phase
      let scrambleFrames = 0;
      const maxScrambleFrames = 10;

      const scramblePhase = setInterval(() => {
        subtitle2Display = subtitle2Target.split('').map(char =>
          (char === ' ' || char === '.') ? char : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
        );
        setAnimatedSubtitle2(subtitle2Display.join(''));
        scrambleFrames++;

        if (scrambleFrames >= maxScrambleFrames) {
          clearInterval(scramblePhase);
          setSelectedFont(newFontIndex);

          // Resolve phase
          const resolvePhase = setInterval(() => {
            let allResolved = true;
            subtitle2Display = subtitle2Target.split('').map((char, i) => {
              if (char === ' ' || char === '.') return char;
              if (subtitle2Display[i] === char) return char;
              if (Math.random() < 0.2) return char;
              allResolved = false;
              return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            });
            setAnimatedSubtitle2(subtitle2Display.join(''));

            if (allResolved) {
              clearInterval(resolvePhase);
              isAnimating = false;
            }
          }, 50);
        }
      }, 50);
    };

    // Start subtitle2 animation on its own timeline
    let interval: NodeJS.Timeout;
    const initialDelay = setTimeout(() => {
      animateSubtitle2();
      interval = setInterval(animateSubtitle2, 11000); // Every 11 seconds
    }, 4500);

    return () => {
      clearTimeout(initialDelay);
      if (interval) clearInterval(interval);
    };
  }, [isClient, fontOptions.length]);

  // Clock animation - independent timeline
  useEffect(() => {
    if (!isClient) return;

    const scrambleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*_+-=[]{}|<>?/~`一二∞√×÷';
    let currentDisplay = ['0', '0', ':', '0', '0', ':', '0', '0'];
    let isScrambling = false;
    let timezoneIndex = 0;
    let currentClockFont = 0;

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
        // Cycle through fonts during scramble (clock only)
        const tempFontIndex = Math.floor(Math.random() * fontOptions.length);
        setClockFont(tempFontIndex);
        currentDisplay = currentDisplay.map((char, index) => {
          if (index === 2 || index === 5) return ':'; // Keep colons
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        });

        setAnimatedScore(currentDisplay.join(''));
        setShowingTime(false);
        scrambleCount++;

        if (scrambleCount >= maxScrambles) {
          clearInterval(scrambleInterval);
          // Set the final font for clock
          setClockFont(newClockFontIndex);
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

    // Initial delay, then regular intervals - independent timeline
    const startDelay = setTimeout(() => {
      scrambleScore();

      const regularInterval = setInterval(() => {
        scrambleScore();
      }, 13000 + Math.random() * 4000); // 13-17 seconds between scrambles

      return () => clearInterval(regularInterval);
    }, 5500); // Start after other animations have begun

    return () => clearTimeout(startDelay);
  }, [isClient]);

  // No loading screen - render immediately

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative overflow-x-hidden`}
    >
      {/* Three.js Background Animation with Enhanced Shading */}
      <div className={`fixed inset-0 ${mouseHover ? 'z-50' : 'z-0'}`}>
        {/* Gradient overlay for atmospheric depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40 pointer-events-none z-10" />
        {/* Vignette effect */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.6) 100%)'
          }}
        />
        {/* Shadow casting overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-10" />

        <div
          className="absolute w-full h-full"
          style={{
            left: `${animationPosition.x}%`,
            top: `${animationPosition.y}%`,
            width: '150%',
            height: '140%',
            pointerEvents: mouseHover ? 'auto' : 'none',
            cursor: mouseHover ? 'move' : 'default',
            filter: 'contrast(1.1) brightness(0.9) saturate(1.2)'
          }}
        >
          {/* Only render Three.js animation after client is ready */}
          {isClient && (
            <div className="w-full h-full relative">
              <WireframeAnimation
                isDark={isDark}
                structured={globeStructured}
                colorIntense={colorIntense}
                isHovered={mouseHover}
                zoomLevel={zoomLevel}
                modelType={modelType}
                onZoomChange={(newZoom) => {
                  // Disable zoom feedback on mobile to prevent crazy behavior
                  const isMobile = window.innerWidth < 768;
                  if (mouseHover && !isMobile) {
                    setZoomLevel(newZoom);
                  }
                }}
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
        className="fixed right-8 top-1/2 -translate-y-1/2 z-[60] pointer-events-auto select-none"
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
                  left: '1rem',
                  transform: 'translateX(-50%)',
                  transition: 'transform 0.2s',
                  touchAction: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  position: 'absolute',
                  willChange: 'bottom'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                  const startY = e.clientY;
                  const startZoom = zoomLevel;

                  // Remove transition during drag
                  const thumb = e.currentTarget as HTMLElement;
                  thumb.style.transition = 'none';

                  const handleMouseMove = (e: MouseEvent) => {
                    e.preventDefault();
                    const deltaY = startY - e.clientY;
                    const percentChange = (deltaY / rect.height) * 100;
                    const zoomChange = (percentChange / 100) * 190;
                    const newZoom = Math.round(Math.min(200, Math.max(10, startZoom + zoomChange)));
                    setZoomLevel(newZoom);
                  };

                  const handleMouseUp = () => {
                    // Re-add transition after drag
                    thumb.style.transition = 'transform 0.2s';
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

      {/* Projected Text Shadows on Canvas */}
      <div className={`fixed inset-0 pointer-events-none ${mouseHover ? 'z-[50]' : 'z-5'}`}>
        {/* Main title shadow projection */}
        <div className="absolute top-[35vh] left-[10vw] right-[10vw] flex flex-col items-start">
          <div
            className="text-5xl md:text-8xl lg:text-9xl font-bold opacity-20 blur-sm"
            style={isClient ? {
              fontFamily: currentFont.fonts.display,
              fontWeight: currentFont.weights.black,
              letterSpacing: '0.02em',
              color: 'rgba(0,0,0,0.8)',
              transform: 'perspective(1000px) rotateX(45deg) translateZ(-50px) skewX(-5deg)',
              transformOrigin: 'top left'
            } : {}}
          >
            {animatedTitle}
          </div>
          {/* Subtitle shadow projection */}
          <div
            className="text-lg md:text-xl lg:text-2xl font-medium mt-4 opacity-15 blur-[2px]"
            style={isClient ? {
              fontFamily: currentFont.fonts.secondary,
              fontWeight: currentFont.weights.regular,
              color: 'rgba(0,0,0,0.7)',
              transform: 'perspective(800px) rotateX(30deg) translateZ(-30px) skewX(-3deg)',
              transformOrigin: 'top left'
            } : {}}
          >
            {animatedSubtitle1}
          </div>
        </div>
      </div>

      {/* Main Content - positioned above the animation, always visible even when move toggle is active */}
      <div className={`relative ${mouseHover ? 'z-[55]' : 'z-10'} overflow-x-hidden ${mouseHover ? 'pointer-events-none' : 'pointer-events-auto'}`} style={{ paddingTop: '160px' }}>

        {/* Main Score Section */}
        <section
          className="px-8 py-16 relative"
        >

          <div className="overflow-x-hidden">
            <div className="mb-4">
              {/* Top row: Animated service text and navigation links */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
                {/* Left: Animated service text */}
                <div className="flex-1">
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

              </div>

              {/* Main Title with Enhanced Shadows */}
              <div className="mb-6 relative">
                {/* Shadow layer 1 - Deep shadow */}
                <h2
                  className="absolute text-5xl md:text-8xl lg:text-9xl font-bold leading-none select-none text-black/40 blur-lg"
                  style={isClient ? {
                    fontFamily: currentFont.fonts.display,
                    fontWeight: currentFont.weights.black,
                    letterSpacing: '0.02em',
                    minHeight: '1.2em',
                    transform: 'translate(8px, 8px)'
                  } : {}}
                  aria-hidden="true"
                >
                  {animatedTitle}
                </h2>
                {/* Shadow layer 2 - Medium shadow */}
                <h2
                  className="absolute text-5xl md:text-8xl lg:text-9xl font-bold leading-none select-none text-black/30 blur-md"
                  style={isClient ? {
                    fontFamily: currentFont.fonts.display,
                    fontWeight: currentFont.weights.black,
                    letterSpacing: '0.02em',
                    minHeight: '1.2em',
                    transform: 'translate(4px, 4px)'
                  } : {}}
                  aria-hidden="true"
                >
                  {animatedTitle}
                </h2>
                {/* Main text with enhanced drop shadow */}
                <h2
                  className={`relative text-5xl md:text-8xl lg:text-9xl font-bold ${isDark ? 'text-white' : 'text-black'} leading-none select-none`}
                  style={isClient ? {
                    fontFamily: currentFont.fonts.display,
                    fontWeight: currentFont.weights.black,
                    letterSpacing: '0.02em',
                    minHeight: '1.2em',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5), 4px 4px 8px rgba(0,0,0,0.3), 8px 8px 16px rgba(0,0,0,0.2)',
                    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))'
                  } : {}}
                >
                  {animatedTitle}
                </h2>
              </div>

              {/* Subtitles with enhanced shadows */}
              <div className="space-y-3 w-full max-w-6xl relative">
                <p
                  className={`text-lg md:text-xl lg:text-2xl font-medium ${isDark ? 'text-white' : 'text-black'} leading-tight relative z-10`}
                  style={isClient ? {
                    fontFamily: currentFont.fonts.secondary,
                    fontWeight: currentFont.weights.regular,
                    minHeight: '1.5em',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.4), 2px 2px 4px rgba(0,0,0,0.3)',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  } : {}}
                >
                  {animatedSubtitle1}
                </p>
                <p
                  className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} relative z-10`}
                  style={isClient ? {
                    fontFamily: currentFont.fonts.primary,
                    fontWeight: currentFont.weights.regular,
                    minHeight: '2.5em',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5), 2px 2px 4px rgba(0,0,0,0.3)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
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
                  fontFamily: fontOptions[clockFont].fonts.mono,
                  fontWeight: fontOptions[clockFont].weights.bold
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
          </div>
        </section>
      </div> {/* End of relative z-10 content wrapper */}

    </div>
  );
}