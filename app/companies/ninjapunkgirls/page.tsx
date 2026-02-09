'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink, Twitter, Palette, ShoppingBag, Users, Sparkles } from 'lucide-react';

const collections = [
  {
    name: 'NPG Origins',
    description: 'The original Ninja Punk Girls collection featuring 1000 unique cyberpunk ninja characters.',
    count: '1,000',
    status: 'Sold Out'
  },
  {
    name: 'NPG RED',
    description: 'Limited edition red-themed collection with exclusive traits and rarity.',
    count: '500',
    status: 'Available'
  },
  {
    name: 'NPG Weapons',
    description: 'Collectible weapons and accessories for your NPG characters.',
    count: '2,500',
    status: 'Minting'
  }
];

const links = [
  { name: 'Website', url: 'https://ninjapunkgirls.com', icon: ExternalLink },
  { name: 'Twitter', url: 'https://twitter.com/ninjapunkgirls', icon: Twitter },
  { name: 'Merchandise', url: 'https://ninjapunkgirls.store', icon: ShoppingBag },
];

export default function NinjaPunkGirlsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="relative z-10 pb-12 md:pb-16">
        {/* Hero Section */}
        <section className="px-4 md:px-8 py-16">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
              <Link href="/companies" className="hover:text-white transition-colors">Companies</Link>
              <span>/</span>
              <span className="text-pink-500">Ninja Punk Girls</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6 border-b border-zinc-800 pb-8">
              <div className="bg-pink-500/10 p-4 md:p-6 border border-pink-500/30 self-start">
                <Image
                  src="/images/clientprojects/ninjapunkgirls-com/NPG-logo.png"
                  alt="Ninja Punk Girls"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-pink-500 leading-none tracking-tighter mb-2">
                  NINJA PUNK GIRLS
                </h1>
                <p className="text-zinc-400 text-lg">
                  Digital art collective and NFT brand
                </p>
              </div>
            </div>

            <p className="text-zinc-400 max-w-3xl mb-8">
              Ninja Punk Girls is a cyberpunk-inspired digital art project featuring unique ninja characters.
              Built on Bitcoin, the collection combines anime aesthetics with blockchain technology,
              creating a community of collectors and creators who value digital art ownership.
            </p>

            {/* External Links */}
            <div className="flex flex-wrap gap-3">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:border-pink-500/50 hover:bg-pink-500/5 transition-all text-sm"
                >
                  <link.icon size={14} className="text-pink-500" />
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="px-4 md:px-8 mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Items', value: '4,000+' },
              { label: 'Holders', value: '800+' },
              { label: 'Collections', value: '3' },
              { label: 'Floor Price', value: '0.05 BSV' },
            ].map((stat) => (
              <div key={stat.label} className="border border-zinc-800 p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-pink-500">{stat.value}</div>
                <div className="text-xs text-zinc-500 uppercase mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Collections */}
        <section className="px-4 md:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Palette className="text-pink-500" size={24} />
            Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.name}
                className="border border-zinc-800 p-6 hover:border-pink-500/30 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold">{collection.name}</h3>
                  <span className={`px-2 py-1 text-xs ${
                    collection.status === 'Sold Out' ? 'bg-red-500/20 text-red-400' :
                    collection.status === 'Minting' ? 'bg-green-500/20 text-green-400' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {collection.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm mb-4">{collection.description}</p>
                <div className="text-2xl font-bold text-pink-500">{collection.count}</div>
                <div className="text-xs text-zinc-500">items</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="px-4 md:px-8 mb-12">
          <div className="border border-zinc-800 p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="text-pink-500" size={24} />
              About the Project
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-3 text-pink-500">Vision</h3>
                <p className="text-zinc-400 mb-4">
                  Ninja Punk Girls aims to be the premier cyberpunk art brand on Bitcoin,
                  combining high-quality digital art with true ownership through blockchain technology.
                </p>
                <p className="text-zinc-400">
                  Each NFT represents not just a piece of art, but membership in a creative community
                  that values both artistic expression and technological innovation.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3 text-pink-500">Roadmap</h3>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-500" />
                    Launch animated NFT collection
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-500" />
                    Expand merchandise line
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-500" />
                    Holder-exclusive events
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-500" />
                    Metaverse integration
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related Projects on b0ase */}
        <section className="px-4 md:px-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Related on b0ase</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/portfolio/ninjapunkgirls-com"
              className="border border-zinc-800 p-6 hover:border-pink-500/30 transition-all group"
            >
              <h3 className="font-bold mb-2 group-hover:text-pink-500 transition-colors">NPG Website</h3>
              <p className="text-sm text-zinc-400">Main website and minting platform</p>
            </Link>
            <Link
              href="/portfolio/ninja-punk-girls-website"
              className="border border-zinc-800 p-6 hover:border-pink-500/30 transition-all group"
            >
              <h3 className="font-bold mb-2 group-hover:text-pink-500 transition-colors">NPG Landing Page</h3>
              <p className="text-sm text-zinc-400">Marketing and promotional site</p>
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <section className="px-4 md:px-8">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            ← Back to Companies
          </Link>
        </section>
      </main>
    </div>
  );
}
