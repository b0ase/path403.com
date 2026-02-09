'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMusic, FiCpu, FiPlay, FiZap, FiArrowRight, FiCheck, FiDownload, FiEdit, FiSettings, FiStar, FiShield, FiHeadphones, FiVolume2 } from 'react-icons/fi';
import { calculatePricing, formatPrice } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

export default function AIGeneratedMusicPage() {
  const pricing = calculatePricing(500, { min: 1, max: 2 });

  const features = [
    "Custom AI music composition",
    "Background music tracks",
    "Jingles & sound logos",
    "Podcast intro/outro music",
    "Video game soundtracks",
    "Commercial music",
    "Ambient & atmospheric",
    "Genre-specific compositions"
  ];

  const packages = [
    {
      name: "Basic Track",
      price: "£200-500",
      duration: "30-60 seconds",
      features: ["AI music generation", "Basic mixing", "2 revisions", "MP3 & WAV formats", "Commercial license"],
      turnaround: "2-3 days"
    },
    {
      name: "Professional",
      price: "£500-1200",
      duration: "1-3 minutes",
      features: ["Premium AI composition", "Professional mixing", "5 revisions", "Multiple formats", "Stems included", "Extended license"],
      turnaround: "3-5 days",
      popular: true
    },
    {
      name: "Album/Soundtrack",
      price: "£1200-3000",
      duration: "10-30 minutes",
      features: ["Full album production", "Custom AI training", "Unlimited revisions", "Master quality", "Multi-track stems", "Sync licensing"],
      turnaround: "7-14 days"
    }
  ];

  const genres = [
    "Electronic/EDM",
    "Cinematic/Orchestral",
    "Pop/Commercial",
    "Hip-Hop/Rap",
    "Rock/Alternative",
    "Jazz/Blues",
    "Ambient/Chill",
    "World/Ethnic"
  ];

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 pt-32 pb-16">
        {/* Header Section */}
        <motion.div
          className="mb-16 border-b border-zinc-900 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
                <FiMusic className="text-4xl md:text-5xl text-white" />
              </div>
              <FiCpu className="text-3xl text-emerald-400" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                AI-GENERATED MUSIC
              </h1>
              <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
                AUDIO_AI
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Create original, royalty-free music using advanced AI composition technology. Perfect for videos, podcasts, games, and commercial projects.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What We Create Section */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">What We Create</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-zinc-800 bg-black hover:border-zinc-700 transition-colors">
                    <FiCheck className="text-emerald-400 flex-shrink-0" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Music Genres Section */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Music Genres</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {genres.map((genre, index) => (
                  <div key={index} className="text-center p-4 border border-zinc-800 bg-black hover:border-emerald-500/50 transition-colors">
                    <FiHeadphones className="text-emerald-400 text-xl mx-auto mb-2" />
                    <span className="text-white text-xs">{genre}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Pricing Packages */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Pricing Packages</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg, index) => (
                  <div key={index} className={`relative p-6 border bg-black ${pkg.popular ? 'border-emerald-500' : 'border-zinc-800'} hover:border-zinc-700 transition-colors`}>
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-emerald-500 text-black px-3 py-1 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                          <FiStar className="text-xs" /> Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                      <div className="text-2xl font-bold text-emerald-400 mb-1">{pkg.price}</div>
                      <div className="text-xs text-zinc-500">{pkg.duration}</div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-zinc-400 text-xs">
                          <FiCheck className="text-emerald-400 flex-shrink-0 text-xs" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-center">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Turnaround: {pkg.turnaround}</div>
                      <Link
                        href="/agent"
                        className={`block w-full py-2 text-xs uppercase font-bold tracking-wider transition-colors ${pkg.popular
                          ? 'bg-white text-black hover:bg-zinc-200'
                          : 'border border-zinc-700 text-zinc-300 hover:border-white hover:text-white'
                        }`}
                      >
                        Choose {pkg.name}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Process Section */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Our AI Music Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { icon: FiZap, title: "1. Music Brief", desc: "Define your style, mood, tempo, and usage requirements" },
                  { icon: FiSettings, title: "2. AI Composition", desc: "Advanced AI creates original compositions to your specifications" },
                  { icon: FiEdit, title: "3. Professional Mix", desc: "Expert mixing and mastering for professional quality" },
                  { icon: FiDownload, title: "4. Delivery", desc: "Multiple formats with full commercial licensing" }
                ].map((step, index) => (
                  <div key={index} className="text-center p-4 border border-zinc-800 bg-black">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
                      <step.icon className="text-xl text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-zinc-500 text-xs">{step.desc}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Add-ons Section */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Add-on Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: FiVolume2, title: "Live Instruments", desc: "Real musicians recording over AI compositions", price: "+£300-800" },
                  { icon: FiZap, title: "Custom Arrangements", desc: "Personalized orchestrations and arrangements", price: "+£200-600" },
                  { icon: FiShield, title: "Sync Licensing", desc: "Broadcast and synchronization rights included", price: "+£500-1500" }
                ].map((addon, index) => (
                  <div key={index} className="p-4 border border-zinc-800 bg-black hover:border-emerald-500/50 transition-colors">
                    <addon.icon className="text-emerald-400 text-xl mb-3" />
                    <h3 className="text-white text-sm font-bold mb-1">{addon.title}</h3>
                    <p className="text-zinc-500 text-xs mb-2">{addon.desc}</p>
                    <div className="text-emerald-400 text-sm font-bold">{addon.price}</div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <motion.div
              className="p-6 border border-zinc-800 bg-zinc-950"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Investment</h3>
              <div className="text-3xl font-bold text-white mb-2">{formatPrice(pricing.elevatedPrice)}</div>
              <div className="text-xs text-zinc-500 mb-4">Starting price for Professional track</div>

              <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-zinc-900 border border-zinc-800">
                <div className="text-center">
                  <div className="text-[10px] text-zinc-500 uppercase">Now</div>
                  <div className="text-xs font-bold text-emerald-400">{formatPrice(pricing.deposit)}</div>
                </div>
                <div className="text-center border-x border-zinc-800">
                  <div className="text-[10px] text-zinc-500 uppercase">Delivery</div>
                  <div className="text-xs font-bold text-blue-400">{formatPrice(pricing.deliveryPayment)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-zinc-500 uppercase">+30 Days</div>
                  <div className="text-xs font-bold text-purple-400">{formatPrice(pricing.finalPayment)}</div>
                </div>
              </div>

              <AddToCartButton
                item={{
                  item_type: 'service',
                  item_id: 'ai-generated-music',
                  item_name: 'AI-Generated Music',
                  item_description: 'Custom AI music composition',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />
            </motion.div>

            {/* CTA Card */}
            <motion.div
              className="p-6 border border-emerald-500/30 bg-emerald-500/5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg font-bold text-white mb-3">Ready to Create Original AI Music?</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Transform your projects with custom AI-generated music that perfectly matches your vision and brand.
              </p>
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-xs uppercase font-bold tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Start Your Project <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
