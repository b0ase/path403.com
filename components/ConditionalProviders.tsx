'use client';

import { usePathname } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Providers } from '@/components/Providers';
import NavbarProvider from '@/components/NavbarProvider';
import { PersistentMusicProvider } from '@/hooks/usePersistentMusic';
import FloatingTeleportButton from '@/components/teleport/FloatingTeleportButton';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ContentCard';
import { YoursWalletProvider } from '@/lib/contexts/YoursWalletContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ColorThemeProvider } from '@/components/ThemePicker';
import { WalletProvider } from '@/contexts/WalletProvider';

// Routes that should skip wallet/music providers but keep navbar
// Blog pages don't need audio/video playback capabilities
const LIGHT_ROUTES = ['/studio', '/video/editor', '/blog'];

const NO_FOOTER_ROUTES = ['/kintsugi', '/metanet', '/og-preview'];

// Standalone routes - no navbar, no music, no providers, just raw content
const STANDALONE_ROUTES = ['/paywall'];

export default function ConditionalProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Track if user has site access (paid) - for home page only
  // PAYWALL DISABLED: Always grant access to match page.tsx behavior
  const [hasSiteAccess, setHasSiteAccess] = useState(true);
  const [accessChecked, setAccessChecked] = useState(true);

  // Check if current route should use lighter providers
  const isLightRoute = LIGHT_ROUTES.some(route => pathname?.startsWith(route));
  // Check if current route should hide footer
  const shouldHideFooter = NO_FOOTER_ROUTES.some(route => pathname?.startsWith(route));

  // Home page paywall check - DISABLED (hasSiteAccess always true)
  // When re-enabling paywall, restore cookie check in useState initialization
  const isHomePage = pathname === '/';
  const isHomePagePaywall = isHomePage && !hasSiteAccess;

  // Check if current route is standalone (no navbar, no music, raw content only)
  const isStandaloneRoute = STANDALONE_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname?.startsWith(route + '/');
  }) || isHomePagePaywall;

  // Standalone layout - no navbar, no music, no footer, just the content
  if (isStandaloneRoute) {
    return (
      <Providers>
        <ThemeProvider>
          <ColorThemeProvider>
            <div className="min-h-screen bg-black">
              {children}
            </div>
          </ColorThemeProvider>
        </ThemeProvider>
      </Providers>
    );
  }

  // Light layout - keeps navbar but skips wallet/music
  if (isLightRoute) {
    return (
      <Providers>
        <ThemeProvider>
          <ColorThemeProvider>
            <NavbarProvider>
              <div className="min-h-screen bg-black">
                <ContentCard>
                  <main>{children}</main>
                </ContentCard>
              </div>
              <FloatingTeleportButton />
            </NavbarProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </Providers>
    );
  }

  // Full layout with all providers
  return (
    <YoursWalletProvider>
      <WalletProvider>
        <Providers>
          <Suspense fallback={null}>
            <ThemeProvider>
              <ColorThemeProvider>
                <PersistentMusicProvider>
                  <NavbarProvider>
                    <div className="min-h-screen bg-black">
                      <ContentCard>
                        <main>{children}</main>
                      </ContentCard>
                      {!shouldHideFooter && <Footer />}
                    </div>
                    <FloatingTeleportButton />
                  </NavbarProvider>
                </PersistentMusicProvider>
              </ColorThemeProvider>
            </ThemeProvider>
          </Suspense>
        </Providers>
      </WalletProvider>
    </YoursWalletProvider>
  );
}
