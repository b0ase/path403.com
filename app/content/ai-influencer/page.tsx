'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiUsers, FiCamera, FiVideo, FiHash, FiCpu, FiBarChart2, FiZap, FiArrowRight, FiCheck, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { calculatePricing, formatPrice } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

export default function AIInfluencerPage() {
  const pricing = calculatePricing(800, { min: 2, max: 4 });

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="border-b border-zinc-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors text-xs uppercase tracking-widest">
            <FiArrowLeft />
            Back to Home
          </Link>

          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-zinc-900 p-4 border border-zinc-800">
              <FiCpu className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                AI INFLUENCER
              </h1>
              <p className="text-zinc-400 text-sm uppercase tracking-widest mt-1">Complete AI-Powered Social Media Presence</p>
            </div>
          </motion.div>

          <p className="text-zinc-400 text-lg max-w-3xl leading-relaxed">
            Launch and scale your digital influencer presence with our AI-powered ecosystem. From content creation to automated posting,
            audience engagement to brand partnerships - we handle everything while you focus on strategy and growth.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <motion.section
        className="py-16 border-b border-zinc-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8">
            Complete AI Influencer Ecosystem
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: FiCamera, title: "AI Content Creation", desc: "AI-generated photos, videos, and graphics tailored to your brand and niche", color: "text-pink-400" },
              { icon: FiCpu, title: "AI Agent Management", desc: "Dedicated AI agents handle posting, engagement, and audience interaction 24/7", color: "text-purple-400" },
              { icon: FiBarChart2, title: "Growth Analytics", desc: "Advanced analytics and growth optimization powered by machine learning", color: "text-indigo-400" },
              { icon: FiHash, title: "Multi-Platform Presence", desc: "Simultaneous management across Instagram, TikTok, Twitter, YouTube, and more", color: "text-pink-400" },
              { icon: FiZap, title: "Personality Development", desc: "AI-crafted unique personality and voice that evolves with your audience", color: "text-purple-400" },
              { icon: FiUsers, title: "Audience Building", desc: "Strategic follower acquisition and community building through AI engagement", color: "text-indigo-400" }
            ].map((feature, index) => (
              <div key={index} className="p-6 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors">
                <feature.icon className={`${feature.color} text-2xl mb-4`} />
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-zinc-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Packages */}
      <motion.section
        className="py-16 border-b border-zinc-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
            AI Influencer Packages
          </h2>
          <p className="text-zinc-400 mb-8 max-w-2xl">
            Choose the perfect package to launch or scale your AI influencer presence. All packages include dedicated AI agents.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter Package */}
            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-pink-400 mb-2">Starter Influencer</h3>
                <div className="text-3xl font-bold text-white mb-1">£500</div>
                <p className="text-zinc-500 text-sm">Setup + £300/month</p>
              </div>

              <ul className="space-y-3 mb-6">
                {["1 AI influencer persona", "2 social platforms", "10 AI-generated posts/week", "Basic AI engagement", "Monthly analytics report"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-400 text-sm">
                    <FiCheck className="text-pink-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/agent" className="block w-full text-center border border-zinc-700 text-zinc-300 hover:border-white hover:text-white py-3 text-xs uppercase font-bold tracking-wider transition-colors">
                Start Your AI Influencer <FiArrowRight className="inline ml-2" />
              </Link>
            </div>

            {/* Professional Package */}
            <div className="border-2 border-purple-500 bg-zinc-950 p-6 relative">
              <div className="absolute -top-3 right-4 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                Popular
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-purple-400 mb-2">Pro Influencer</h3>
                <div className="text-3xl font-bold text-white mb-1">£800</div>
                <p className="text-zinc-500 text-sm">Setup + £600/month</p>
              </div>

              <ul className="space-y-3 mb-6">
                {["1 AI influencer persona", "4 social platforms", "25 AI-generated posts/week", "Advanced AI engagement", "AI video content", "Weekly analytics & optimization", "Brand partnership opportunities"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-400 text-sm">
                    <FiCheck className="text-purple-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/agent" className="block w-full text-center bg-white text-black hover:bg-zinc-200 py-3 text-xs uppercase font-bold tracking-wider transition-colors">
                Launch Pro Influencer <FiArrowRight className="inline ml-2" />
              </Link>
            </div>

            {/* Enterprise Package */}
            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-indigo-400 mb-2">Elite Influencer</h3>
                <div className="text-3xl font-bold text-white mb-1">£1500</div>
                <p className="text-zinc-500 text-sm">Setup + £1200/month</p>
              </div>

              <ul className="space-y-3 mb-6">
                {["Multiple AI personas", "All major platforms", "50+ AI posts/week", "AI-powered live streaming", "Custom AI voice & personality", "Real-time optimization", "Dedicated account manager", "Revenue sharing partnerships"].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-zinc-400 text-sm">
                    <FiCheck className="text-indigo-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/agent" className="block w-full text-center border border-zinc-700 text-zinc-300 hover:border-white hover:text-white py-3 text-xs uppercase font-bold tracking-wider transition-colors">
                Go Elite <FiArrowRight className="inline ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI Agent Technology */}
      <motion.section
        className="py-16 border-b border-zinc-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8">
            Powered by Advanced AI Agents
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Why AI Agents Are the Future</h3>
              <div className="space-y-4">
                {[
                  { icon: FiZap, title: "24/7 Autonomous Operation", desc: "Your AI agents never sleep, constantly engaging with your audience and creating content", color: "text-pink-400" },
                  { icon: FiBarChart2, title: "Learning & Optimization", desc: "AI agents continuously learn from audience behavior to improve engagement", color: "text-purple-400" },
                  { icon: FiTrendingUp, title: "Scalable Growth", desc: "Scale across multiple platforms and personas without human limitations", color: "text-indigo-400" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                      <item.icon className={`${item.color} text-sm`} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${item.color} mb-1`}>{item.title}</h4>
                      <p className="text-zinc-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-zinc-800 bg-zinc-950 p-6">
              <h4 className="text-lg font-bold text-white mb-4">Your AI Agent Team Includes:</h4>
              <ul className="space-y-3">
                {[
                  { icon: FiCamera, label: "Content Creation Agent", color: "text-pink-400" },
                  { icon: FiUsers, label: "Community Management Agent", color: "text-purple-400" },
                  { icon: FiBarChart2, label: "Analytics & Growth Agent", color: "text-indigo-400" },
                  { icon: FiHash, label: "Trend Research Agent", color: "text-pink-400" },
                  { icon: FiZap, label: "Personality Development Agent", color: "text-purple-400" }
                ].map((agent, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <agent.icon className={agent.color} />
                    <span className="text-zinc-300 text-sm">{agent.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Supported Platforms */}
      <motion.section
        className="py-16 border-b border-zinc-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-8">
            Multi-Platform Presence
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {[
              { icon: FiInstagram, label: "Instagram", color: "text-pink-400" },
              { icon: FiVideo, label: "TikTok", color: "text-white" },
              { icon: FiTwitter, label: "Twitter/X", color: "text-blue-400" },
              { icon: FiYoutube, label: "YouTube", color: "text-red-400" }
            ].map((platform, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 py-3 border border-zinc-800 bg-zinc-950">
                <platform.icon className={`${platform.color} text-xl`} />
                <span className="text-white font-bold text-sm">{platform.label}</span>
              </div>
            ))}
          </div>

          <p className="text-zinc-500 max-w-2xl mx-auto text-sm">
            Your AI influencer can maintain a consistent presence across all major social platforms,
            adapting content and engagement style to each platform's unique audience and algorithms.
          </p>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="border border-purple-500/30 bg-purple-500/5 p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to Launch Your AI Influencer?
            </h2>
            <p className="text-zinc-400 mb-6 max-w-2xl mx-auto">
              Join the future of digital influence. Let our AI agents build your social media empire while you focus on strategy and growth.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-zinc-900 border border-zinc-800 max-w-sm mx-auto">
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

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <AddToCartButton
                item={{
                  item_type: 'service',
                  item_id: 'ai-influencer',
                  item_name: 'AI Influencer Setup',
                  item_description: 'Complete AI-powered social media presence',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="bg-white text-black hover:bg-zinc-200 px-6 py-3 text-xs uppercase font-bold tracking-wider"
              />
              <Link
                href="/agent"
                className="border border-zinc-700 text-zinc-300 hover:border-white hover:text-white px-6 py-3 text-xs uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                Talk to Our AI Agent <FiCpu />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
