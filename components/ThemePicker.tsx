'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

// Available color themes - black/white for neutral, plus vibrant colors
export const COLOR_THEMES = ['black', 'white', 'yellow', 'red', 'green', 'blue', 'pink'] as const;
export type ColorTheme = typeof COLOR_THEMES[number];

// Color theme context for managing the background color
interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  // Return default values if context is not available (during SSR or before provider mounts)
  if (!context) {
    return {
      colorTheme: 'black' as ColorTheme,
      setColorTheme: () => { },
    };
  }
  return context;
}

// Themes that need white text (dark mode)
const DARK_TEXT_THEMES: ColorTheme[] = ['black'];
// Themes that need black text (light mode)
const LIGHT_TEXT_THEMES: ColorTheme[] = ['white', 'yellow', 'red', 'green', 'blue'];

const THEME_COLORS: Record<ColorTheme, string> = {
  black: '#000000',
  white: '#ffffff',
  yellow: '#fbbf24', // amber-400
  red: '#ef4444',    // red-500
  green: '#22c55e',  // green-500
  blue: '#3b82f6',   // blue-500
  pink: '#ec4899',   // pink-500
};

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('black');
  const [mounted, setMounted] = useState(false);

  // Helper to set dark/light mode based on theme
  const applyThemeMode = (theme: ColorTheme) => {
    if (DARK_TEXT_THEMES.includes(theme)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Helper to set theme-color meta tag
  const setMetaThemeColor = (theme: ColorTheme) => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', THEME_COLORS[theme] || '#000000');
  };

  useEffect(() => {
    setMounted(true);

    // Load saved color theme from localStorage, default to black
    const saved = localStorage.getItem('b0ase-color-theme') as ColorTheme;
    const themeToApply = (saved && COLOR_THEMES.includes(saved)) ? saved : 'black';

    setColorThemeState(themeToApply);
    document.documentElement.setAttribute('data-color-theme', themeToApply);
    applyThemeMode(themeToApply);
    setMetaThemeColor(themeToApply);
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('b0ase-color-theme', theme);
    document.documentElement.setAttribute('data-color-theme', theme);
    applyThemeMode(theme);
    setMetaThemeColor(theme);
  };

  // Suppress hydration warning by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

import { useDesignPillar } from './DesignPillarProvider';
import { useNavbar } from './NavbarProvider';
import { FiBox, FiCircle, FiZap, FiFeather } from 'react-icons/fi';

// Theme picker UI component
export default function ThemePicker() {
  const [mounted, setMounted] = useState(false);
  const { colorTheme, setColorTheme } = useColorTheme();
  const { pillar, togglePillar } = useDesignPillar();
  const { minimalMode, setMinimalMode } = useNavbar();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-32 h-8"></div>;
  }

  // Derive isDark from color theme for styling
  const isDark = DARK_TEXT_THEMES.includes(colorTheme);

  // Vibrant color options for backgrounds
  const colorOptions: { id: ColorTheme; label: string; bg: string; ring: string }[] = [
    { id: 'red', label: 'Red', bg: 'bg-red-500', ring: 'ring-red-500' },
    { id: 'green', label: 'Green', bg: 'bg-green-500', ring: 'ring-green-500' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-500', ring: 'ring-blue-500' },
    { id: 'yellow', label: 'Yellow', bg: 'bg-amber-400', ring: 'ring-amber-500' },
    { id: 'pink', label: 'Hot Pink', bg: 'bg-pink-500', ring: 'ring-pink-500' },
  ];

  return (
    <div className="flex items-center gap-4">
      {/* Pillar Switch */}
      <button
        onClick={togglePillar}
        className={`flex items-center gap-2 px-3 py-1.5 transition-all border ${pillar === 'modern' ? 'rounded-lg border-blue-500/50 bg-blue-500/5' : 'border-zinc-800 bg-zinc-900/30'
          }`}
        title={`Switch to ${pillar === 'industrial' ? 'Modern' : 'Industrial'} Pillar`}
      >
        {pillar === 'industrial' ? (
          <>
            <FiBox className="text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">Industrial</span>
          </>
        ) : (
          <>
            <FiCircle className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-500">Modern</span>
          </>
        )}
      </button>

      {/* 3D Effects Toggle */}
      <button
        onClick={() => setMinimalMode(!minimalMode)}
        className={`flex items-center gap-2 px-3 py-1.5 transition-all border ${!minimalMode ? 'rounded-lg border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900/30'
          }`}
        title={`Switch to ${minimalMode ? 'Full' : 'Minimal'} 3D effects`}
      >
        {minimalMode ? (
          <>
            <FiFeather className="text-zinc-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400">Minimal</span>
          </>
        ) : (
          <>
            <FiZap className="text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-500">Full</span>
          </>
        )}
      </button>

      <div className={`w-px h-6 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

      <div className="flex items-center gap-1.5">
        {/* Black Background Button */}
        <button
          onClick={() => setColorTheme('black')}
          className={`w-5 h-5 rounded-full theme-swatch-black border transition-all ${colorTheme === 'black'
            ? 'ring-2 ring-gray-500 ring-offset-1 border-gray-500'
            : 'border-gray-600 hover:border-gray-400'
            } ${isDark ? 'ring-offset-black' : 'ring-offset-white'}`}
          aria-label="Black background"
          title="Black background"
        />

        {/* White Background Button */}
        <button
          onClick={() => setColorTheme('white')}
          className={`w-5 h-5 rounded-full theme-swatch-white border transition-all ${colorTheme === 'white'
            ? 'ring-2 ring-gray-400 ring-offset-1 border-gray-300'
            : 'border-gray-300 hover:border-gray-500'
            } ${isDark ? 'ring-offset-black' : 'ring-offset-white'}`}
          aria-label="White background"
          title="White background"
        />

        {/* Color Background Swatches */}
        <div className="flex items-center gap-1">
          {colorOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setColorTheme(option.id)}
              className={`w-5 h-5 rounded-full transition-all ${option.bg} ${colorTheme === option.id
                ? `ring-2 ${option.ring} ring-offset-1 ${isDark ? 'ring-offset-black' : 'ring-offset-white'}`
                : 'hover:scale-110'
                }`}
              aria-label={`${option.label} background`}
              title={option.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
