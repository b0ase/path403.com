'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder or null to avoid hydration mismatch
    return <div className="w-6 h-6"></div>; // Placeholder with same size as button
  }

  const currentTheme = resolvedTheme || theme; // Use resolvedTheme if available, fallback to theme

  return (
    <button
      onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
      className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
      aria-label={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {currentTheme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
    </button>
  );
} 