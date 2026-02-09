'use client';

import { usePathname } from 'next/navigation';

// Routes that handle their own card layout (full-screen apps, custom layouts)
const CUSTOM_LAYOUT_ROUTES = [
  '/kintsugi',
  '/clients/kintsugi',
  '/creative/kintsugi',
  '/metanet',  // Full-screen 3D visualization
  '/studio',
  '/video/editor',
  '/og-preview',
];

interface ContentCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function ContentCard({ children, className = '' }: ContentCardProps) {
  const pathname = usePathname();

  // Check if this route handles its own layout
  // Special exception: Generator page should use the card layout despite being under /video/editor
  const isGenerator = pathname?.startsWith('/video/editor/generator');

  const hasCustomLayout = !isGenerator && CUSTOM_LAYOUT_ROUTES.some(route => pathname?.startsWith(route));

  // If custom layout, just pass through children without card wrapper
  if (hasCustomLayout) {
    return <>{children}</>;
  }

  // Wrap content in card styling - thin gap below navbar
  return (
    <div className={`mx-4 md:mx-12 mt-[140px] md:mt-[160px] mb-6 pt-6 md:pt-8 bg-black/90 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
