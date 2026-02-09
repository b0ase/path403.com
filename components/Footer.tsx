'use client';

import Link from 'next/link';
import { FiGithub, FiLinkedin, FiMail, FiTwitter } from 'react-icons/fi';
import { FaTelegramPlane, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { b0aseSocialLinks } from '@/lib/social-links';

// Footer uses dark-mode classes consistently.
// CSS rules in globals.css handle the inversion when theme is light.
// This prevents hydration mismatches since server and client render same HTML.

export default function Footer() {
  const footerLinks = {
    Company: [
      { name: 'About', href: '/cv' },
      { name: 'Services', href: '/services' },
      { name: 'Portfolio', href: '/portfolio' },
      { name: 'Contact', href: '/contact' },
    ],
    Resources: [
      { name: 'Components', href: '/components' },
      { name: 'Brand Kit', href: '/brand-kit' },
      { name: 'Skills', href: '/skills' },
      { name: 'Tools', href: '/tools' },
    ],
    Build: [
      { name: 'Start a Project', href: '/build/start-a-project' },
      { name: 'Join a Team', href: '/build/join-a-team' },
      { name: 'Launch a Token', href: '/build/launch-a-token' },
      { name: 'Automation', href: '/automation' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  };

  return (
    <footer className="mx-4 md:mx-12 mb-6 bg-black/90 border border-white/10 backdrop-blur-md rounded-xl">
      <div className="px-6 md:px-12 py-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-bold mb-4 text-white">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors text-gray-400 hover:text-white"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} b0ase. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href={b0aseSocialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-gray-400 hover:text-white"
              aria-label="Twitter/X"
            >
              <FiTwitter size={20} />
            </a>
            <a
              href={b0aseSocialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-gray-400 hover:text-white"
              aria-label="GitHub"
            >
              <FiGithub size={20} />
            </a>
            <a
              href={b0aseSocialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-gray-400 hover:text-white"
              aria-label="LinkedIn"
            >
              <FiLinkedin size={20} />
            </a>
            <a
              href={b0aseSocialLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-gray-400 hover:text-white"
              aria-label="YouTube"
            >
              <FaYoutube size={20} />
            </a>
            <a
              href={b0aseSocialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-gray-400 hover:text-white"
              aria-label="Telegram"
            >
              <FaTelegramPlane size={20} />
            </a>
            <a
              href="https://wa.me/message/YOUR_WHATSAPP_NUMBER"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-gray-400 hover:text-white"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={20} />
            </a>
            <Link
              href="/contact"
              className="transition-colors text-gray-400 hover:text-white"
              aria-label="Contact"
            >
              <FiMail size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
