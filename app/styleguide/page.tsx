'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiLayout, FiType, FiBox, FiCheckSquare } from 'react-icons/fi';

export default function StyleGuidePage() {
  const [isDark] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-zinc-800 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <FiCode className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-none">
                DESIGN SYSTEM
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                V2.0 TWO PILLARS
              </div>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
            B0ASE maintains two distinct design pillars depending on the context: <strong>INDUSTRIAL BLUEPRINT</strong> for system-level pages and <strong>BITSIGN MODERN</strong> for tool-centric experiences.
          </p>
        </motion.div>

        {/* The Two Pillars Overview */}
        <section className="mb-20 grid md:grid-cols-2 gap-8">
          <div className="border border-zinc-800 bg-zinc-900/20 p-8">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4">Pillar Alpha</div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">INDUSTRIAL BLUEPRINT</h2>
            <p className="text-zinc-400 mb-6">
              The core b0ase aesthetic. Cold, sharp, and high-contrast. Designed for information density and technical transparency.
            </p>
            <ul className="space-y-2 text-sm text-zinc-500 font-mono">
              <li>• Full-width layouts (no max-width)</li>
              <li>• Sharp corners (0px radius)</li>
              <li>• Grayscale palette with minimal accents</li>
              <li>• Heavy use of borders and grid lines</li>
            </ul>
          </div>

          <div className="border border-blue-500/20 bg-blue-500/5 p-8 rounded-lg">
            <div className="text-xs font-mono text-blue-400 uppercase tracking-[0.2em] mb-4">Pillar Beta</div>
            <h2 className="text-4xl font-black tracking-tighter mb-4">
              BIT<span className="text-blue-500">SIGN</span> MODERN
            </h2>
            <p className="text-zinc-400 mb-6">
              The tool-centric aesthetic. Accessible, centered, and software-focused. Designed for focused interactions and consumer confidence.
            </p>
            <ul className="space-y-2 text-sm text-zinc-500 font-mono">
              <li>• Centered containers (max-w-6xl)</li>
              <li>• Rounded corners (8px radius)</li>
              <li>• Blue accents and subtle glow effects</li>
              <li>• Card-based sectioning with soft backgrounds</li>
            </ul>
          </div>
        </section>

        {/* Layout Principles */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FiLayout className="text-white" size={24} />
            <h2 className="text-3xl font-bold">Layout Principles</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-zinc-800 p-6 bg-zinc-900/30">
              <h3 className="text-xl font-bold mb-1">Industrial Layout</h3>
              <div className="text-[10px] text-zinc-500 font-mono mb-4 uppercase">Blueprint Standard</div>
              <p className="text-zinc-400 mb-4">
                Full-width execution. Containers expand to use the entire browser viewport.
              </p>
              <div className="bg-black p-4 font-mono text-sm border border-zinc-800">
                <code className="text-white">className="w-full px-4 md:px-8 py-16"</code>
              </div>
            </div>

            <div className="border border-zinc-800 p-6 bg-zinc-900/30 rounded-lg">
              <h3 className="text-xl font-bold mb-1">Tool Layout</h3>
              <div className="text-[10px] text-blue-500 font-mono mb-4 uppercase">BitSign Standard</div>
              <p className="text-zinc-400 mb-4">
                Focused execution. Content is restrained within a centered container.
              </p>
              <div className="bg-black p-4 rounded font-mono text-sm border border-zinc-800">
                <code className="text-blue-400">className="max-w-6xl mx-auto px-4 py-16"</code>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FiType className="text-white" size={24} />
            <h2 className="text-3xl font-bold">Typography</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Blueprint Typography */}
            <div className="space-y-6">
              <div className="border border-zinc-800 p-6 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 font-mono mb-4 uppercase">Industrial Titles</h3>
                <h1 className="text-5xl font-bold tracking-tighter mb-4">
                  BLUEPRINT TITLE
                </h1>
                <p className="text-zinc-400 text-sm italic">text-5xl font-bold tracking-tighter</p>
              </div>
            </div>

            {/* BitSign Typography */}
            <div className="space-y-6">
              <div className="border border-zinc-800 p-6 bg-zinc-900/30 rounded-lg">
                <h3 className="text-[10px] text-blue-500 font-mono mb-4 uppercase">Modern Titles</h3>
                <h1 className="text-5xl font-black tracking-tight mb-4 uppercase">
                  Bit<span className="text-blue-500">Sign</span>
                </h1>
                <p className="text-zinc-400 text-sm italic">text-5xl font-black tracking-tight uppercase</p>
              </div>
            </div>
          </div>
        </section>

        {/* Colors */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FiBox className="text-white" size={24} />
            <h2 className="text-3xl font-bold">Color Palette</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <div className="w-full h-24 bg-black border border-white/10 mb-4"></div>
              <h3 className="text-lg font-bold mb-2">Pure Black</h3>
              <code className="text-sm text-gray-500 font-mono">#000000</code>
              <p className="text-xs text-gray-500 mt-2">Primary background</p>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <div className="w-full h-24 bg-white mb-4"></div>
              <h3 className="text-lg font-bold mb-2">Pure White</h3>
              <code className="text-sm text-gray-500 font-mono">#FFFFFF</code>
              <p className="text-xs text-gray-500 mt-2">Primary text, buttons</p>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <div className="w-full h-24 bg-gray-800 mb-4"></div>
              <h3 className="text-lg font-bold mb-2">Gray 800</h3>
              <code className="text-sm text-gray-500 font-mono">#1F2937</code>
              <p className="text-xs text-gray-500 mt-2">Borders, dividers</p>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <div className="w-full h-24 bg-gray-400 mb-4"></div>
              <h3 className="text-lg font-bold mb-2">Gray 400</h3>
              <code className="text-sm text-gray-500 font-mono">#9CA3AF</code>
              <p className="text-xs text-gray-500 mt-2">Body text, descriptions</p>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <div className="w-full h-24 bg-blue-500 mb-4"></div>
              <h3 className="text-lg font-bold mb-2">Blue 500</h3>
              <code className="text-sm text-gray-500 font-mono">#3B82F6</code>
              <p className="text-xs text-gray-500 mt-2">Links, accents</p>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <div className="w-full h-24 bg-green-500 mb-4"></div>
              <h3 className="text-lg font-bold mb-2">Green 500</h3>
              <code className="text-sm text-gray-500 font-mono">#10B981</code>
              <p className="text-xs text-gray-500 mt-2">Success states, checkmarks</p>
            </div>
          </div>

          <div className="mt-6 border border-amber-500/30 bg-amber-900/20 p-6">
            <h3 className="text-lg font-bold mb-2 text-amber-400">Brand Colors</h3>
            <p className="text-sm text-gray-400">
              User-specific brand colors should be dynamic and loaded from the brand assets system.
              Avoid hardcoded brand colors in component code.
            </p>
          </div>
        </section>

        {/* Components */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <FiCheckSquare className="text-white" size={24} />
            <h2 className="text-3xl font-bold">Component Library</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Blueprint Components */}
            <div className="space-y-6">
              <div className="border border-zinc-800 p-6 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 font-mono mb-4 uppercase">Industrial Button</h3>
                <button className="px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors">
                  Primary Action
                </button>
              </div>
              <div className="border border-zinc-800 p-6 bg-zinc-900/30">
                <h3 className="text-[10px] text-zinc-500 font-mono mb-4 uppercase">Industrial Card</h3>
                <div className="border border-zinc-800 p-6 bg-zinc-900/30">
                  <h4 className="font-bold mb-2">Data Item</h4>
                  <p className="text-zinc-500 text-sm">Industrial style uses sharp borders & 0px radius.</p>
                </div>
              </div>
            </div>

            {/* BitSign Components */}
            <div className="space-y-6">
              <div className="border border-zinc-800 p-6 bg-zinc-900/30 rounded-lg">
                <h3 className="text-[10px] text-blue-500 font-mono mb-4 uppercase">Modern Button</h3>
                <button className="px-6 py-3 bg-blue-600 text-white font-bold uppercase tracking-wider rounded-lg hover:bg-blue-700 transition-colors">
                  Take Action
                </button>
              </div>
              <div className="border border-zinc-800 p-6 bg-zinc-900/30 rounded-lg">
                <h3 className="text-[10px] text-blue-500 font-mono mb-4 uppercase">Modern Card</h3>
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <h4 className="font-bold mb-2">Feature Item</h4>
                  <p className="text-zinc-400 text-sm">Modern style uses rounded-lg corners & subtle blue accents.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Navigation Guidelines</h2>

          <div className="space-y-6">
            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-3">Dashboard Button</h3>
              <p className="text-gray-400 mb-4">
                When user is signed in, DASHBOARD button should use white text, not blue.
              </p>
              <div className="bg-black p-4 rounded font-mono text-sm border border-gray-800">
                <div className="text-green-400">✓ Correct:</div>
                <code className="text-white">text-white hover:text-gray-300</code>
                <div className="text-red-400 mt-4">❌ Incorrect:</div>
                <code className="text-gray-500">text-sky-400 hover:text-sky-300</code>
              </div>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-3">Breadcrumb Navigation</h3>
              <p className="text-gray-400 mb-4">
                Use consistent breadcrumb styling for hierarchical navigation.
              </p>
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="text-gray-500">Home</span>
                <span className="text-gray-700">/</span>
                <span className="text-gray-500">Dashboard</span>
                <span className="text-gray-700">/</span>
                <span className="text-white">Current Page</span>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Best Practices</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-green-800 bg-green-900/10 p-6">
              <h3 className="text-lg font-bold mb-3 text-green-400">✓ Do</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>• Follow the layout logic of the chosen pillar</li>
                <li>• Use full-width for systems, centered for tools</li>
                <li>• Include back buttons on sub-pages</li>
                <li>• Follow typography hierarchy</li>
                <li>• Use consistent padding (px-4 md:px-8 py-16)</li>
                <li>• Add hover states to interactive elements</li>
                <li>• Maintain responsive design</li>
              </ul>
            </div>

            <div className="border border-red-800 bg-red-900/10 p-6">
              <h3 className="text-lg font-bold mb-3 text-red-400">❌ Don't</h3>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>• Mix pillar components (e.g. sharp buttons in rounded cards)</li>
                <li>• Hardcode brand colors</li>
                <li>• Use blue DASHBOARD button when signed in</li>
                <li>• Skip hover states on clickable elements</li>
                <li>• Use inconsistent spacing</li>
                <li>• Forget mobile responsiveness</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Email & Contact Standards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Contact Information Standards</h2>

          <div className="space-y-6">
            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-3">Email Addresses</h3>
              <p className="text-gray-400 mb-4">Only use approved email addresses:</p>
              <ul className="space-y-2 font-mono text-sm">
                <li className="text-green-400">✓ richard@b0ase.com</li>
                <li className="text-green-400">✓ info@b0ase.com</li>
                <li className="text-green-400">✓ richard@b0ase.com</li>
                <li className="text-red-400 mt-4">❌ [your-email] or other placeholders</li>
              </ul>
            </div>

            <div className="border border-gray-800 p-6 bg-gray-900/30">
              <h3 className="text-xl font-bold mb-3">Social Links</h3>
              <ul className="space-y-2 font-mono text-sm">
                <li className="text-green-400">✓ Telegram: https://t.me/b0ase_com</li>
                <li className="text-red-400 mt-4">❌ Telegram: https://t.me/b0ase (incorrect)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
