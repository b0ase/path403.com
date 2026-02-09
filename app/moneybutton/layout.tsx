'use client';

import { usePathname } from 'next/navigation';
import MoneyButtonHero from '@/components/moneybutton/MoneyButtonHero';

export default function MoneyButtonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMainPage = pathname === '/moneybutton';

  // Don't add the hero to embed pages
  const isEmbedPage = pathname?.includes('/embed');

  return (
    <div className="min-h-screen bg-black text-white relative font-mono selection:bg-white selection:text-black">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_30%,#1e3a5f_0%,transparent_40%)] pointer-events-none opacity-40" />

      {/* Shared hero elements (nav, floating tokens, mini button on sub-pages) */}
      {!isEmbedPage && <MoneyButtonHero mini={!isMainPage} />}

      {/* Page content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
