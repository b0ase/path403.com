'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaGithub, FaLinkedin, FaEnvelope, FaBars, FaTimes, FaTelegramPlane, FaDiscord, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { FiSun, FiMoon, FiLogOut, FiUser } from 'react-icons/fi';
import { portfolioData } from '@/lib/data';
import CartButton from './CartButton';
import { useAuth } from './Providers';
import { useUserHandle } from '@/hooks/useUserHandle';
import { Wallet } from 'lucide-react';

const XIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;

const navLinks = [
  { href: '/websites', label: 'Projects' },
  { href: '/kintsugi', label: 'Kintsugi' },
  { href: '/cashboard', label: 'Cashboard' },
  { href: '/services', label: 'Services' },
  { href: '/contracts', label: 'Contracts' },
  { href: '/tools', label: 'Tools' },
  { href: '/roadmap', label: 'Roadmap' },
  { href: '/blog', label: 'Blog' },
  { href: '/offers', label: 'Offers' },
  { href: '/dashboard/database', label: 'Database', authRequired: true },
];

const socialLinks = [
  { Icon: FaGithub, href: portfolioData.about.socials.github },
  { Icon: FaLinkedin, href: portfolioData.about.socials.linkedin },
  { Icon: XIcon, href: portfolioData.about.socials.x },
  { Icon: FaYoutube, href: 'https://youtube.com/@BO4SE' },
  { Icon: FaDiscord, href: portfolioData.about.socials.discord },
  { Icon: FaTelegramPlane, href: portfolioData.about.socials.telegram },
  { Icon: FaWhatsapp, href: portfolioData.about.socials.whatsapp },
  { Icon: FaEnvelope, href: 'mailto:richard@b0ase.com' },
];

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { handle: handcashHandle } = useUserHandle();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme ? savedTheme === 'dark' : true;
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogout = () => {
    // Redirect to server-side logout handler which clears cookies & session
    window.location.href = '/api/auth/logout';
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((v) => !v);

  return (
    <header className="w-full bg-black border-b border-gray-800 py-4 px-6 relative z-40">
      <div className="flex items-center justify-between">
        {/* Logo and Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-mono text-white hover:text-sky-400 transition-colors flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            b0ase.com
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks
              .filter((link) => !link.authRequired || user)
              .map((link) => (
                <Link key={link.label} href={link.href} className="text-sm font-medium text-white hover:text-sky-400 transition-colors">
                  {link.label}
                </Link>
              ))}
          </nav>
        </div>
        {/* Cart, Socials and Mobile */}
        <div className="flex items-center ml-auto">
          {/* Cart Button */}
          <div className="hidden md:block mr-4">
            <CartButton />
          </div>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="mr-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-sky-400 transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Auth Section */}
          {!loading && (
            <div className="hidden md:flex items-center gap-3 mr-4">
              {handcashHandle ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-sky-400 font-bold border border-sky-400/20 rounded-full bg-sky-400/5">
                    <Wallet size={14} />
                    <span>${handcashHandle}</span>
                  </div>
                  <button
                    onClick={() => {
                      document.cookie = "b0ase_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                      document.cookie = "b0ase_user_handle=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                      window.location.reload();
                    }}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : user ? (
                <>
                  <Link
                    href="/user/account"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-sky-400 transition-colors"
                  >
                    <FiUser size={14} />
                    <span>Account</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <FiLogOut size={14} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <a
                  href="/api/auth/handcash"
                  className="px-4 py-1.5 text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-full transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2"
                >
                  <Wallet size={14} />
                  Connect
                </a>
              )}
            </div>
          )}

          <div className="hidden md:flex items-center space-x-3 ml-4">
            {socialLinks.filter(link => link.href && !link.href.includes('#') && link.href !== '').map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition-colors">
                <link.Icon size={18} />
              </a>
            ))}
          </div>
          {/* Mobile Cart Button */}
          <div className="md:hidden mr-3">
            <CartButton />
          </div>
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} aria-label="Toggle menu" className="text-gray-400 hover:text-sky-400 focus:outline-none">
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[64px] left-0 right-0 z-50 bg-black border-t border-gray-800 shadow-lg py-4 px-4">
          <nav className="flex flex-col space-y-3 mb-4 items-start w-full">
            {navLinks
              .filter((link) => !link.authRequired || user)
              .map((link) => (
                <Link key={link.label + '-mobile'} href={link.href} className="text-base font-medium text-white hover:text-sky-400 transition-colors" onClick={toggleMobileMenu}>
                  {link.label}
                </Link>
              ))}
          </nav>
          <div className="flex items-center space-x-3">
            {socialLinks.filter(link => link.href && !link.href.includes('#') && link.href !== '').map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-400 transition-colors">
                <link.Icon size={18} />
              </a>
            ))}
          </div>

          {/* Mobile Auth Section */}
          {!loading && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              {user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href="/user/account"
                    className="flex items-center gap-2 text-base text-white hover:text-sky-400 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <FiUser size={16} />
                    <span>Account</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); toggleMobileMenu(); }}
                    className="flex items-center gap-2 text-base text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-2 text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}