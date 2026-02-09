'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from './WalletProvider';
import { ThemeToggle } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

// Detect which site we're on via hostname
function getNavItems() {
  if (typeof window === 'undefined') return getDefaultNavItems();
  const host = window.location.hostname;
  if (host.includes('path401')) {
    return [
      { href: '/', label: '$401' },
      { href: 'https://path402.com', label: '$402', external: true },
      { href: 'https://path403.com', label: '$403', external: true },
      ...sharedNavItems,
    ];
  }
  if (host.includes('path403')) {
    return [
      { href: 'https://path401.com', label: '$401', external: true },
      { href: 'https://path402.com', label: '$402', external: true },
      { href: '/', label: '$403' },
      ...sharedNavItems,
    ];
  }
  return getDefaultNavItems();
}

function getDefaultNavItems() {
  return [
    { href: 'https://path401.com', label: '$401', external: true },
    { href: 'https://path402.com', label: '$402', external: true },
    { href: '/', label: '$403' },
    ...sharedNavItems,
  ];
}

const sharedNavItems: { href: string; label: string; external?: boolean }[] = [];

export function ClientNavigation() {
  const { wallet, connectYours, connectHandCash, connectMetanet, disconnect, isYoursAvailable } = useWallet();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [navItems, setNavItems] = useState(getDefaultNavItems);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNavItems(getNavItems());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
  const displayName = wallet.handle ? `@${wallet.handle}` : wallet.address ? truncateAddress(wallet.address) : 'Connected';

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black sticky top-0 z-50">
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center h-12 border-x border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center h-full gap-0 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));

              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 h-full flex items-center text-[10px] uppercase tracking-[0.2em] font-mono font-bold transition-colors whitespace-nowrap bg-zinc-50 dark:bg-zinc-900/10 text-zinc-500 hover:text-black dark:hover:text-white border-r border-zinc-200 dark:border-zinc-800"
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 h-full flex items-center text-[10px] uppercase tracking-[0.2em] font-mono font-bold transition-colors whitespace-nowrap ${isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-zinc-50 dark:bg-zinc-900/10 text-zinc-500 hover:text-black dark:hover:text-white'
                    } border-r border-zinc-200 dark:border-zinc-800`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: Theme only */}
          <div className="ml-auto flex items-center h-full flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
