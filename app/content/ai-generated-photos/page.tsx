'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCamera, FiCpu, FiUsers, FiLayers, FiArrowRight, FiCheck, FiDownload, FiEdit, FiSettings, FiStar, FiShield, FiDroplet, FiZap } from 'react-icons/fi';
import { calculatePricing, formatPrice } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

export default function AIGeneratedPhotosPage() {
  const pricing = calculatePricing(600, { min: 1, max: 2 });

  const features = [
    "AI-powered portrait generation",
    "Custom brand photography",
    "Product visualization",
    "Lifestyle scene creation",
    "Professional headshots",
    "Marketing imagery",
    "Social media visuals",
    "Background removal/replacement"
  ];

  const packages = [
    {
      name: "Starter Pack",
      price: "£300-600",
      images: "10-20 images",
      features: ["Basic AI portraits", "Standard resolution", "2 style variations", "Commercial license"],
      turnaround: "2-3 days"
    },
    {
      name: "Professional",
      price: "£600-1200",
      images: "25-50 images",
      features: ["Premium AI portraits", "High resolution", "5 style variations", "Brand consistency", "Rush delivery available"],
      turnaround: "3-5 days",
      popular: true
    },
    {
      name: "Enterprise",
      price: "£1200-2500",
      images: "50-100 images",
      features: ["Custom AI model training", "Ultra-high resolution", "Unlimited variations", "Brand guideline compliance", "Priority support"],
      turnaround: "5-7 days"
    }
  ];

  const styles = [
    "Professional Corporate",
    "Creative Lifestyle",
    "Product Showcase",
    "Social Media Ready",
    "Editorial Fashion",
    "Technical Documentation",
    "Brand Storytelling",
    "Marketing Campaigns"
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
                <FiCamera className="text-4xl md:text-5xl text-white" />
              </div>
              <FiCpu className="text-3xl text-purple-400" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-none tracking-tighter">
                AI-GENERATED PHOTOS
              </h1>
              <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">
                VISUAL_AI
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Create stunning, professional photography using cutting-edge AI technology. Perfect for brands, marketing, and creative projects.
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
                    <FiCheck className="text-purple-400 flex-shrink-0" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Photography Styles Section */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Photography Styles</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {styles.map((style, index) => (
                  <div key={index} className="text-center p-4 border border-zinc-800 bg-black hover:border-purple-500/50 transition-colors">
                    <FiDroplet className="text-purple-400 text-xl mx-auto mb-2" />
                    <span className="text-white text-xs">{style}</span>
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
                  <div key={index} className={`relative p-6 border bg-black ${pkg.popular ? 'border-purple-500' : 'border-zinc-800'} hover:border-zinc-700 transition-colors`}>
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-purple-500 text-white px-3 py-1 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                          <FiStar className="text-xs" /> Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                      <div className="text-2xl font-bold text-purple-400 mb-1">{pkg.price}</div>
                      <div className="text-xs text-zinc-500">{pkg.images}</div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-zinc-400 text-xs">
                          <FiCheck className="text-purple-400 flex-shrink-0 text-xs" />
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
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Our AI Photo Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { icon: FiLayers, title: "1. Concept Brief", desc: "Share your vision, brand guidelines, and specific requirements" },
                  { icon: FiSettings, title: "2. AI Generation", desc: "Our AI creates multiple variations based on your specifications" },
                  { icon: FiEdit, title: "3. Refinement", desc: "Professional editing and enhancement for perfect results" },
                  { icon: FiDownload, title: "4. Delivery", desc: "High-resolution files with commercial licensing included" }
                ].map((step, index) => (
                  <div key={index} className="text-center p-4 border border-zinc-800 bg-black">
                    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
                      <step.icon className="text-xl text-purple-400" />
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
                  { icon: FiZap, title: "Custom AI Model Training", desc: "Train AI specifically on your brand assets", price: "+£500-1000" },
                  { icon: FiShield, title: "Extended Commercial License", desc: "Unlimited usage rights and resale permissions", price: "+£200-500" },
                  { icon: FiUsers, title: "Team Photo Sessions", desc: "AI-generated team and group photography", price: "+£300-800" }
                ].map((addon, index) => (
                  <div key={index} className="p-4 border border-zinc-800 bg-black hover:border-purple-500/50 transition-colors">
                    <addon.icon className="text-purple-400 text-xl mb-3" />
                    <h3 className="text-white text-sm font-bold mb-1">{addon.title}</h3>
                    <p className="text-zinc-500 text-xs mb-2">{addon.desc}</p>
                    <div className="text-purple-400 text-sm font-bold">{addon.price}</div>
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
              <div className="text-xs text-zinc-500 mb-4">Starting price for Professional package</div>

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
                  item_id: 'ai-generated-photos',
                  item_name: 'AI-Generated Photos',
                  item_description: 'Professional AI-powered photography',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />
            </motion.div>

            {/* CTA Card */}
            <motion.div
              className="p-6 border border-purple-500/30 bg-purple-500/5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg font-bold text-white mb-3">Ready to Create Stunning AI Photos?</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Transform your visual content with professional AI-generated photography that captures your brand's essence.
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
