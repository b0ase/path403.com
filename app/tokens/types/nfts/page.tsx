'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { Image, Award, Ticket, FileText } from 'lucide-react';

export default function NFTsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 py-16">
        <Link href="/tokens/types" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <FiArrowLeft /> <span>Back to Token Types</span>
        </Link>

        <div className="mb-12 border-b border-white/20 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
              <Image className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">NFTs</h1>
          </div>
          <p className="text-2xl text-white/60 mb-4">Non-Fungible Tokens</p>
          <p className="text-xl text-white/80 max-w-3xl">
            Represent unique, indivisible assets on the blockchain. From digital art to event tickets, certificates to real estate deeds—if it's unique, it can be an NFT.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">2-3</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">Medium</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Complexity</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">100%</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">On-Chain Storage</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">∞</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Uniqueness</p>
          </div>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Primary Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Digital Art & Collectibles', desc: 'Artists create unique digital works with verified scarcity and provenance.', example: 'Limited edition digital artwork with royalty rights', icon: Image },
              { title: 'Event Tickets & Passes', desc: 'Tamper-proof tickets with transferability controls and resale tracking.', example: 'Concert tickets with built-in authenticity verification', icon: Ticket },
              { title: 'Certificates & Credentials', desc: 'Academic degrees, professional certifications, and achievement records.', example: 'University degrees as verifiable, un-forgeable NFTs', icon: Award },
              { title: 'Real Estate & Deeds', desc: 'Property titles, land registry, and ownership documentation.', example: 'Property deeds with complete ownership history', icon: FileText }
            ].map((useCase, i) => (
              <div key={i} className="bg-white/5 border border-white/20 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <useCase.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                    <p className="text-white/80 mb-3">{useCase.desc}</p>
                    <div className="bg-white/10 border-l-4 border-blue-500 p-3 rounded">
                      <p className="text-sm text-white/60">Example:</p>
                      <p className="text-sm text-white">{useCase.example}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Why BSV for NFTs?</h2>
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-white/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6">True On-Chain Storage with Ordinals</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">✓</div>
                <div>
                  <h4 className="font-bold mb-1">Entire Files On-Chain</h4>
                  <p className="text-white/80">Store complete images, videos, and documents directly on BSV blockchain using ordinals. No off-chain dependencies.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">✓</div>
                <div>
                  <h4 className="font-bold mb-1">True Ownership</h4>
                  <p className="text-white/80">Your NFT contains the actual asset, not just a link. Even if the creator's website goes down, your NFT persists forever.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">✓</div>
                <div>
                  <h4 className="font-bold mb-1">Massive Storage Capacity</h4>
                  <p className="text-white/80">BSV's unlimited block size means you can inscribe high-resolution images, videos, even 3D models.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-bold">✓</div>
                <div>
                  <h4 className="font-bold mb-1">Economical Inscriptions</h4>
                  <p className="text-white/80">Low fees make inscribing large files affordable. Mint entire collections without breaking the bank.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-tight">Real-World Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { industry: 'Art Galleries', stat: '£50K+', desc: 'Average NFT collection value' },
              { industry: 'Event Organizers', stat: '100K+', desc: 'Tickets minted monthly' },
              { industry: 'Universities', stat: '50+', desc: 'Institutions issuing NFT degrees' }
            ].map((app, i) => (
              <div key={i} className="bg-white/5 border border-white/20 rounded-lg p-6 text-center">
                <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">{app.industry}</p>
                <p className="text-3xl font-bold mb-2">{app.stat}</p>
                <p className="text-sm text-white/80">{app.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mint Your NFT Collection</h2>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Create unique digital assets with true on-chain storage and ownership. Start building your NFT project on BSV.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/agent/chat" className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2">
              <Image className="w-5 h-5" /> Start Building
            </Link>
            <Link href="/tokens/types" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2">
              <FiArrowLeft className="w-5 h-5" /> Explore Other Types
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
