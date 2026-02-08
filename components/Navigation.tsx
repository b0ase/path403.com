'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeProvider';

const navItems = [
  { href: '/', label: '$403' },
  { href: '/spec', label: 'SPEC' },
  { href: '/blog', label: 'BLOG' },
  { href: 'https://path401.com', label: '$401', external: true },
  { href: 'https://path402.com', label: '$402', external: true },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="flex items-stretch h-full">
        <div className="flex items-stretch overflow-x-auto scrollbar-hide flex-1">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-6 text-[10px] uppercase tracking-[0.2em] font-mono font-bold border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors whitespace-nowrap"
                >
                  {item.label}
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 text-[10px] uppercase tracking-[0.2em] font-mono font-bold border-r border-zinc-200 dark:border-zinc-800 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-zinc-50 dark:bg-zinc-900/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center px-2 border-l border-zinc-200 dark:border-zinc-800">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
