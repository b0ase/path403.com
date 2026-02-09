'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme as useNextTheme } from 'next-themes';

// Re-export next-themes hook for convenience
export { useTheme } from 'next-themes';

// Separate component for search params to wrap in Suspense
function ThemeSearchParamsHandler() {
  const searchParams = useSearchParams();
  const { setTheme } = useNextTheme();

  useEffect(() => {
    // Check URL param for theme override
    const urlTheme = searchParams.get('theme');
    if (urlTheme === 'white' || urlTheme === 'light') {
      setTheme('light');
    } else if (urlTheme === 'dark') {
      setTheme('dark');
    }
  }, [searchParams, setTheme]);

  return null;
}

/**
 * ThemeSync component - handles URL parameter theme overrides
 * The actual theme management is handled by next-themes in Providers.tsx
 * This just syncs URL params (?theme=white or ?theme=light) with next-themes
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <ThemeSearchParamsHandler />
      </Suspense>
      {children}
    </>
  );
}
