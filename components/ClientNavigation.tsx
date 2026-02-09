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

const sharedNavItems = [
  { href: '/portfolio', label: 'PORTFOLIO' },
  { href: '/market', label: 'MARKET' },
  { href: '/exchange', label: 'EXCHANGE' },
  { href: '/library', label: 'LIBRARY' },
  { href: '/identity', label: 'IDENTITY' },
  { href: '/mint', label: 'MINT' },
  { href: '/issue', label: 'ISSUE' },
  { href: '/wallet', label: 'WALLET' },
  { href: '/chat', label: 'CHAT' },
  { href: '/settings', label: 'SETTINGS' },
  { href: '/whitepaper', label: 'WHITEPAPER' },
  { href: '/token', label: 'TOKEN' },
  { href: '/download', label: 'DOWNLOAD' },
  { href: '/docs', label: 'DOCS' },
];

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

          {/* Right side: Wallet + Theme */}
          <div className="ml-auto flex items-center h-full flex-shrink-0" ref={menuRef}>
            {wallet.connected ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-4 h-12 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="w-2 h-2 bg-green-500" />
                  {displayName}
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-0 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50"
                    >
                      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-600 mb-1 uppercase tracking-widest">Connected via</div>
                        <div className="text-xs text-zinc-900 dark:text-white font-mono capitalize">
                          {wallet.provider}
                        </div>
                      </div>
                      {wallet.balance > 0 && (
                        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-600 mb-1 uppercase tracking-widest">Balance</div>
                          <div className="text-xs text-zinc-900 dark:text-white font-mono">
                            {(wallet.balance / 100000000).toFixed(8)} BSV
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          disconnect();
                          setShowMenu(false);
                        }}
                        className="w-full p-3 text-left text-xs text-red-600 dark:text-red-400 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors border-t border-zinc-200 dark:border-zinc-800"
                      >
                        Disconnect
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="relative">
                <motion.button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center px-6 h-12 text-[10px] uppercase tracking-[0.2em] font-mono font-bold bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Connect
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-0 w-56 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50"
                    >
                      <div className="p-2">
                        <motion.button
                          onClick={() => {
                            connectHandCash();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-8 h-8 bg-[#38CB7C] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">H</span>
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-zinc-900 dark:text-white font-bold uppercase tracking-wide">HandCash</div>
                            <div className="text-[10px] text-zinc-500">Social wallet</div>
                          </div>
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            connectYours();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-8 h-8 bg-[#6366F1] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">Y</span>
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-zinc-900 dark:text-white font-bold uppercase tracking-wide">Yours Wallet</div>
                            <div className="text-[10px] text-zinc-500">
                              {isYoursAvailable ? 'Browser extension' : 'Install extension'}
                            </div>
                          </div>
                        </motion.button>

                        <motion.button
                          onClick={() => {
                            connectMetanet();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <div className="w-8 h-8 bg-cyan-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">M</span>
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-zinc-900 dark:text-white font-bold uppercase tracking-wide">Metanet</div>
                            <div className="text-[10px] text-zinc-500">Babbage Desktop</div>
                          </div>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
