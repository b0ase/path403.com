'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavbar } from '@/components/NavbarProvider';
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi';

export default function BrandKitPage() {
  const { isDark } = useNavbar();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = {
    primary: [
      { name: 'Black', hex: '#000000', usage: 'Primary background, text on light' },
      { name: 'White', hex: '#FFFFFF', usage: 'Primary text on dark, backgrounds' },
    ],
    grays: [
      { name: 'Gray 50', hex: '#FAFAFA', usage: 'Subtle backgrounds' },
      { name: 'Gray 100', hex: '#F5F5F5', usage: 'Light backgrounds' },
      { name: 'Gray 300', hex: '#D1D5DB', usage: 'Borders, dividers' },
      { name: 'Gray 500', hex: '#6B7280', usage: 'Secondary text' },
      { name: 'Gray 700', hex: '#374151', usage: 'Dark text' },
      { name: 'Gray 900', hex: '#111827', usage: 'Dark backgrounds' },
    ],
    accents: [
      { name: 'Purple', hex: '#8352FD', usage: 'Interactive elements, highlights' },
      { name: 'Blue', hex: '#3B82F6', usage: 'Links, info states' },
      { name: 'Green', hex: '#10B981', usage: 'Success states' },
      { name: 'Orange', hex: '#F59E0B', usage: 'Warning states' },
      { name: 'Red', hex: '#EF4444', usage: 'Error states, destructive actions' },
    ],
  };

  const fonts = [
    { name: 'Space Grotesk', usage: 'Headings, display text', weight: '400-700', variable: '--font-space-grotesk' },
    { name: 'Inter', usage: 'Body text, UI elements', weight: '400-600', variable: '--font-inter' },
    { name: 'JetBrains Mono', usage: 'Code, monospace text', weight: '400-700', variable: '--font-jetbrains-mono' },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 
            className="text-6xl md:text-8xl font-black mb-4"
            style={{ fontFamily: 'var(--font-space-grotesk)' }}
          >
            Brand Kit
          </h1>
          <p className={`text-lg md:text-xl ${isDark ? 'text-white/70' : 'text-black/70'}`}>
            Design guidelines, assets, and brand identity for b0ase
          </p>
        </motion.div>

        {/* Brand Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Brand Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <h3 className="text-xl font-bold mb-2">Mission</h3>
              <p className={isDark ? 'text-white/70' : 'text-black/70'}>
                Crafting bespoke digital experiences where elegant design meets blockchain innovation
              </p>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <h3 className="text-xl font-bold mb-2">Vision</h3>
              <p className={isDark ? 'text-white/70' : 'text-black/70'}>
                To be the premier digital atelier for cutting-edge web experiences
              </p>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <h3 className="text-xl font-bold mb-2">Values</h3>
              <p className={isDark ? 'text-white/70' : 'text-black/70'}>
                Innovation, craftsmanship, minimalism, and technical excellence
              </p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Color Palette</h2>
          
          {/* Primary Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Primary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {colors.primary.map((color) => (
                <div key={color.hex} className={`p-4 rounded-lg border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <div 
                    className="w-full h-24 rounded mb-3 border"
                    style={{ 
                      backgroundColor: color.hex,
                      borderColor: color.hex === '#FFFFFF' ? '#000' : '#fff'
                    }}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{color.name}</span>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.hex)}
                      className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                      aria-label={`Copy ${color.hex}`}
                    >
                      {copiedColor === color.hex ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    </button>
                  </div>
                  <code className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>{color.hex}</code>
                  <p className={`text-xs mt-2 ${isDark ? 'text-white/50' : 'text-black/50'}`}>{color.usage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Gray Scale */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Grays</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {colors.grays.map((color) => (
                <div key={color.hex} className={`p-4 rounded-lg border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <div 
                    className="w-full h-16 rounded mb-3 border border-black/10"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs">{color.name}</span>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.hex)}
                      className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                      aria-label={`Copy ${color.hex}`}
                    >
                      {copiedColor === color.hex ? <FiCheck size={12} /> : <FiCopy size={12} />}
                    </button>
                  </div>
                  <code className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>{color.hex}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Accents</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {colors.accents.map((color) => (
                <div key={color.hex} className={`p-4 rounded-lg border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <div 
                    className="w-full h-20 rounded mb-3"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{color.name}</span>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.hex)}
                      className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}
                      aria-label={`Copy ${color.hex}`}
                    >
                      {copiedColor === color.hex ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    </button>
                  </div>
                  <code className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>{color.hex}</code>
                  <p className={`text-xs mt-2 ${isDark ? 'text-white/50' : 'text-black/50'}`}>{color.usage}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Typography</h2>
          <div className="space-y-6">
            {fonts.map((font) => (
              <div key={font.name} className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: `var(${font.variable})` }}>
                      {font.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                      {font.usage} • Weight: {font.weight}
                    </p>
                  </div>
                  <code className={`text-sm ${isDark ? 'text-white/50' : 'text-black/50'} mt-2 md:mt-0`}>
                    {font.variable}
                  </code>
                </div>
                <div className="space-y-2" style={{ fontFamily: `var(${font.variable})` }}>
                  <p className="text-4xl">The quick brown fox jumps</p>
                  <p className="text-2xl">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                  <p className="text-xl">abcdefghijklmnopqrstuvwxyz</p>
                  <p className="text-lg">0123456789 !@#$%^&*()</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Design Principles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Design Principles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <h3 className="text-xl font-bold mb-3">Minimalism</h3>
              <p className={isDark ? 'text-white/70' : 'text-black/70'}>
                Clean, uncluttered interfaces that focus on essential elements. Every element serves a purpose.
              </p>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <h3 className="text-xl font-bold mb-3">High Contrast</h3>
              <p className={isDark ? 'text-white/70' : 'text-black/70'}>
                Bold use of black and white creates striking visual hierarchy and ensures accessibility.
              </p>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <h3 className="text-xl font-bold mb-3">Motion Design</h3>
              <p className={isDark ? 'text-white/70' : 'text-black/70'}>
                Subtle animations and Three.js visualizations add depth without overwhelming the user.
              </p>
            </div>
            <div className={`p-6 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
              <h3 className="text-xl font-bold mb-3">Technical Excellence</h3>
              <p className={isDark ? 'text-white/70' : 'text-black/70'}>
                Modern web technologies, performance optimization, and attention to detail in every interaction.
              </p>
            </div>
          </div>
        </section>

        {/* Voice & Tone */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Voice & Tone</h2>
          <div className={`p-8 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-2">Professional</h3>
                <p className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                  Clear, confident communication that demonstrates expertise
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Innovative</h3>
                <p className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                  Forward-thinking and cutting-edge without being pretentious
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Accessible</h3>
                <p className={`text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                  Technical yet approachable, making complex concepts understandable
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Logo Usage */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Logo Usage</h2>
          <div className={`p-8 rounded-lg border ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} text-center`}>
            <div className="mb-8">
              <h1 className="text-6xl font-black" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                B0ASE
              </h1>
              <p className={`text-sm mt-2 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                Primary wordmark
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-bold mb-2">Do</h3>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                  <li>• Use Space Grotesk font</li>
                  <li>• Maintain letter spacing</li>
                  <li>• Use on contrasting backgrounds</li>
                  <li>• Ensure adequate clear space</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-2">Don't</h3>
                <ul className={`text-sm space-y-1 ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                  <li>• Distort or stretch</li>
                  <li>• Change font or spacing</li>
                  <li>• Use on busy backgrounds</li>
                  <li>• Add effects or outlines</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
