'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHash, FiArrowLeft, FiCheck, FiSend, FiInstagram, FiTwitter, FiFacebook, FiLinkedin, FiYoutube } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function SocialMediaContentPage() {
  const pricing = calculatePricing(275); // Mid-range price

  return (
    <div className="min-h-screen bg-black font-mono">
      <div className="container mx-auto px-4 pt-40 pb-8">
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
              <FiHash className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Social Media Content</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Platform-specific engagement content</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Drive Engagement Across All Platforms</h2>
              <p className="text-zinc-400 text-lg mb-6">
                Create platform-specific content that resonates with your audience and drives meaningful engagement.
                Our social media content service helps you maintain a consistent, compelling presence across all channels.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiHash className="text-purple-400" />
                    Content Types
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Educational carousel posts
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Behind-the-scenes content
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      User-generated content campaigns
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Trending topic commentary
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Product showcases
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Community engagement posts
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiSend className="text-pink-400" />
                    Platform Optimization
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Platform-specific formatting
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Optimal posting times
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Hashtag research & strategy
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Audience-targeted messaging
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Engagement-driven CTAs
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Cross-platform consistency
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Platform Coverage */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Platform Coverage</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
                  <FiFacebook className="text-3xl text-blue-500 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Facebook</h3>
                  <p className="text-zinc-500 text-sm">Community building</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
                  <FiInstagram className="text-3xl text-pink-500 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Instagram</h3>
                  <p className="text-zinc-500 text-sm">Visual storytelling</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
                  <FiTwitter className="text-3xl text-sky-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Twitter/X</h3>
                  <p className="text-zinc-500 text-sm">Real-time engagement</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
                  <FiLinkedin className="text-3xl text-blue-600 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">LinkedIn</h3>
                  <p className="text-zinc-500 text-sm">Professional networking</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
                  <FaTiktok className="text-3xl text-white mx-auto mb-2" />
                  <h3 className="text-white font-semibold">TikTok</h3>
                  <p className="text-zinc-500 text-sm">Viral content</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 text-center">
                  <FiYoutube className="text-3xl text-red-500 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">YouTube</h3>
                  <p className="text-zinc-500 text-sm">Video descriptions</p>
                </div>
              </div>
            </motion.section>

            {/* Content Calendar */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Weekly Content Calendar Example</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Monday - Motivation</h3>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1">LinkedIn</span>
                  </div>
                  <p className="text-zinc-400 text-sm">"Start your week strong! Here's how successful entrepreneurs tackle Monday challenges..."</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Wednesday - Education</h3>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1">Instagram</span>
                  </div>
                  <p className="text-zinc-400 text-sm">"5 tools that will transform your productivity (swipe for details)"</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Friday - Behind the Scenes</h3>
                    <span className="text-xs bg-pink-600 text-white px-2 py-1">Stories</span>
                  </div>
                  <p className="text-zinc-400 text-sm">"Coffee, code, and creativity - a peek into our development process"</p>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 border border-zinc-800 bg-zinc-950"
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Investment</h3>
              <div className="text-3xl font-bold text-white mb-2">{formatPrice(pricing.elevatedPrice)}</div>
              <div className="text-xs text-zinc-500 mb-4">Per week</div>

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
                  item_id: 'social-media-content',
                  item_name: 'Social Media Content',
                  item_description: 'Platform-specific engagement content',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">5 posts/week (1 platform)</span>
                  <span className="text-white">from {formatPrice(175)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">10 posts/week (2-3 platforms)</span>
                  <span className="text-white">from {formatPrice(275)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">15+ posts/week (4+ platforms)</span>
                  <span className="text-white">from {formatPrice(375)}</span>
                </div>
              </div>
            </motion.div>

            {/* Add-ons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Add-on Services</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-white font-medium text-sm">Hashtag Research</div>
                    <div className="text-zinc-500 text-xs">Platform-specific hashtags</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{formatPrice(50)}</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-white font-medium text-sm">Content Calendar</div>
                    <div className="text-zinc-500 text-xs">Visual planning tool</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{formatPrice(75)}</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-white font-medium text-sm">Performance Analytics</div>
                    <div className="text-zinc-500 text-xs">Monthly reports</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{formatPrice(100)}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
