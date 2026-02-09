'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiVideo, FiMusic, FiCpu, FiArrowRight, FiCheck, FiStar, FiPlay, FiArrowLeft } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function MusicVideosPage() {
  const features = [
    "AI-generated music videos",
    "Lip-sync technology",
    "Custom choreography",
    "Visual effects integration",
    "Multi-camera angles",
    "Brand integration",
    "Social media formats",
    "Performance videos"
  ];

  const packages = [
    {
      name: "Basic Video",
      price: 1150,
      duration: "1-2 minutes",
      features: ["AI video generation", "Basic lip-sync", "2 revisions", "HD quality", "Social formats"],
      turnaround: "5-7 days"
    },
    {
      name: "Professional",
      price: 2500,
      duration: "2-4 minutes",
      features: ["Premium AI generation", "Advanced lip-sync", "5 revisions", "4K quality", "Custom effects", "Multi-format delivery"],
      turnaround: "7-10 days",
      popular: true
    },
    {
      name: "Premium Production",
      price: 5750,
      duration: "4-6 minutes",
      features: ["Custom AI training", "Perfect lip-sync", "Unlimited revisions", "8K quality", "Advanced VFX", "Full production suite"],
      turnaround: "10-14 days"
    }
  ];

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="container mx-auto px-4 pt-40 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/#content" className="text-zinc-400 hover:text-white transition-colors">
            <FiArrowLeft className="text-xl" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiVideo className="text-2xl text-white" />
            </div>
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiMusic className="text-white text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI Music <span className="text-pink-400">Videos</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-8">
            Create stunning music videos with AI-powered lip-sync technology. Perfect for artists, brands, and content creators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/agent"
              className="bg-white text-black px-8 py-4 font-semibold hover:bg-zinc-200 transition-all duration-300 flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              Start Your Project <FiArrowRight />
            </Link>
            <Link
              href="/#content"
              className="bg-zinc-900 border border-zinc-800 text-white px-8 py-4 font-semibold hover:bg-zinc-800 transition-all duration-300 text-xs uppercase tracking-wider"
            >
              View All Services
            </Link>
          </div>
        </motion.div>

        {/* What We Create Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8 text-center">What We Create</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-zinc-950 border border-zinc-800 p-6 hover:border-pink-500/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <FiCheck className="text-pink-400" />
                  <h3 className="text-white font-semibold">{feature}</h3>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8 text-center">Pricing Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const pkgPricing = calculatePricing(pkg.price);
              return (
                <div key={index} className={`relative bg-zinc-950 border p-8 hover:border-pink-500/50 transition-all duration-300 ${pkg.popular ? 'border-pink-500' : 'border-zinc-800'}`}>
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-pink-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <FiStar /> Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-pink-400 mb-2">{formatPrice(pkgPricing.elevatedPrice)}</div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider">{pkg.duration}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-zinc-900 border border-zinc-800">
                    <div className="text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Now</div>
                      <div className="text-xs font-bold text-emerald-400">{formatPrice(pkgPricing.deposit)}</div>
                    </div>
                    <div className="text-center border-x border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase">Delivery</div>
                      <div className="text-xs font-bold text-blue-400">{formatPrice(pkgPricing.deliveryPayment)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">+30 Days</div>
                      <div className="text-xs font-bold text-purple-400">{formatPrice(pkgPricing.finalPayment)}</div>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-zinc-400">
                        <FiCheck className="text-pink-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-center">
                    <div className="text-sm text-zinc-500 mb-4">Turnaround: {pkg.turnaround}</div>
                    <AddToCartButton
                      item={{
                        item_type: 'service',
                        item_id: `music-video-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`,
                        item_name: `Music Video - ${pkg.name}`,
                        item_description: `${pkg.duration} music video production`,
                        price: pkgPricing.elevatedPrice,
                        quantity: 1
                      }}
                      className={`w-full py-3 font-semibold transition-all duration-300 text-xs uppercase tracking-wider ${pkg.popular
                        ? 'bg-white text-black hover:bg-zinc-200'
                        : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center bg-zinc-950 border border-zinc-800 p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Your Music Video?</h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Transform your music into engaging visual content with AI-powered music video production.
          </p>
          <Link
            href="/agent"
            className="bg-white text-black px-8 py-4 font-semibold hover:bg-zinc-200 transition-all duration-300 inline-flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            Start Your Music Video Project <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
