'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiVideo, FiCpu, FiPlay, FiZap, FiArrowRight, FiCheck, FiDownload, FiEdit, FiSettings, FiStar, FiShield, FiFilm, FiVolume2, FiArrowLeft } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function AIGeneratedVideosPage() {
  const features = [
    "AI-powered video creation",
    "Promotional video content",
    "Product demonstrations",
    "Social media videos",
    "Animated explainers",
    "Brand storytelling",
    "Marketing campaigns",
    "Custom avatars & voices"
  ];

  const packages = [
    {
      name: "Short Form",
      price: 750,
      duration: "15-60 seconds",
      features: ["AI video generation", "Basic editing", "2 revisions", "HD quality", "Social media formats"],
      turnaround: "3-5 days"
    },
    {
      name: "Professional",
      price: 1750,
      duration: "1-3 minutes",
      features: ["Premium AI generation", "Professional editing", "5 revisions", "4K quality", "Custom branding", "Voice-over included"],
      turnaround: "5-7 days",
      popular: true
    },
    {
      name: "Enterprise",
      price: 3750,
      duration: "3-10 minutes",
      features: ["Custom AI training", "Advanced editing", "Unlimited revisions", "8K quality", "Multi-language support", "Priority delivery"],
      turnaround: "7-14 days"
    }
  ];

  const videoTypes = [
    "Product Showcases",
    "Brand Commercials",
    "Explainer Videos",
    "Social Media Ads",
    "Training Content",
    "Event Highlights",
    "Testimonial Videos",
    "Animation Sequences"
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
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <FiVideo className="text-white text-xl" />
            </div>
            <FiCpu className="text-3xl text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            AI-Generated <span className="text-red-400">Videos</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto mb-8">
            Create compelling video content with cutting-edge AI technology. From promotional videos to social media content, we bring your vision to life.
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
              <div key={index} className="bg-zinc-950 border border-zinc-800 p-6 hover:border-red-500/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <FiCheck className="text-red-400" />
                  <h3 className="text-white font-semibold">{feature}</h3>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Video Types Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8 text-center">Video Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videoTypes.map((type, index) => (
              <div key={index} className="bg-zinc-950 border border-zinc-800 p-4 text-center hover:border-red-500/50 transition-all duration-300">
                <FiFilm className="text-red-400 text-xl mx-auto mb-2" />
                <h3 className="text-white font-medium text-sm">{type}</h3>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pricing Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8 text-center">Pricing Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              const pkgPricing = calculatePricing(pkg.price);
              return (
                <div key={index} className={`relative bg-zinc-950 border p-8 hover:border-red-500/50 transition-all duration-300 ${pkg.popular ? 'border-red-500' : 'border-zinc-800'}`}>
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <FiStar /> Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-red-400 mb-2">{formatPrice(pkgPricing.elevatedPrice)}</div>
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
                        <FiCheck className="text-red-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-center">
                    <div className="text-sm text-zinc-500 mb-4">Turnaround: {pkg.turnaround}</div>
                    <AddToCartButton
                      item={{
                        item_type: 'service',
                        item_id: `ai-video-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`,
                        item_name: `AI Video - ${pkg.name}`,
                        item_description: `${pkg.duration} AI video production`,
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

        {/* Process Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8 text-center">Our AI Video Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <FiZap className="text-2xl text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">1. Creative Brief</h3>
              <p className="text-zinc-500">Define your video concept, style, and messaging goals</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <FiSettings className="text-2xl text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">2. AI Generation</h3>
              <p className="text-zinc-500">Advanced AI creates your video content with precision</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <FiEdit className="text-2xl text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">3. Professional Edit</h3>
              <p className="text-zinc-500">Expert editing, color grading, and audio enhancement</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <FiDownload className="text-2xl text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">4. Delivery</h3>
              <p className="text-zinc-500">Multiple formats optimized for your platforms</p>
            </div>
          </div>
        </motion.div>

        {/* Add-ons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8 text-center">Add-on Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-red-500/50 transition-all duration-300">
              <FiVolume2 className="text-red-400 text-2xl mb-4" />
              <h3 className="text-white font-semibold mb-2">Custom Voice-over</h3>
              <p className="text-zinc-500 mb-3">Professional voice talent or AI voice cloning</p>
              <div className="text-red-400 font-semibold">+{formatPrice(500)}</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-red-500/50 transition-all duration-300">
              <FiZap className="text-red-400 text-2xl mb-4" />
              <h3 className="text-white font-semibold mb-2">Advanced Animation</h3>
              <p className="text-zinc-500 mb-3">Complex 3D animations and visual effects</p>
              <div className="text-red-400 font-semibold">+{formatPrice(1000)}</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-6 hover:border-red-500/50 transition-all duration-300">
              <FiShield className="text-red-400 text-2xl mb-4" />
              <h3 className="text-white font-semibold mb-2">Music & Sound Design</h3>
              <p className="text-zinc-500 mb-3">Custom music composition and audio effects</p>
              <div className="text-red-400 font-semibold">+{formatPrice(650)}</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center bg-zinc-950 border border-zinc-800 p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Engaging AI Videos?</h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Transform your message into compelling video content that captures attention and drives results.
          </p>
          <Link
            href="/agent"
            className="bg-white text-black px-8 py-4 font-semibold hover:bg-zinc-200 transition-all duration-300 inline-flex items-center gap-2 text-xs uppercase tracking-wider"
          >
            Start Your AI Video Project <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
