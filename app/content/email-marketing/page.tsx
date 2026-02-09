'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck, FiSend, FiTrendingUp, FiTarget, FiHeart } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function EmailMarketingPage() {
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
              <FiMail className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Email Marketing</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Persuasive email campaigns that nurture leads</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Build Relationships That Convert</h2>
              <p className="text-zinc-400 text-lg mb-6">
                Email marketing remains one of the highest ROI marketing channels. Our email marketing service creates
                compelling campaigns that nurture leads, build customer relationships, and drive conversions. From welcome
                sequences to promotional campaigns, we craft emails that your audience actually wants to read.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTarget className="text-orange-400" />
                    Campaign Types
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Welcome email sequences
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Promotional campaigns
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Newsletter content
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Abandoned cart recovery
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Re-engagement campaigns
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Product announcements
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-400" />
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Compelling subject lines
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Engaging email copy
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Clear call-to-actions
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Mobile optimization
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      A/B testing recommendations
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Performance tracking setup
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Process */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Our Email Marketing Process</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Strategy & Segmentation</h3>
                    <p className="text-zinc-400">We analyze your audience and create targeted segments for personalized messaging.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Content Creation</h3>
                    <p className="text-zinc-400">We craft compelling subject lines and email copy that drives engagement and action.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Design & Optimization</h3>
                    <p className="text-zinc-400">We ensure your emails look great on all devices and include clear call-to-actions.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Testing & Analysis</h3>
                    <p className="text-zinc-400">We set up tracking and provide recommendations for continuous improvement.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Examples */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Email Examples</h2>
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Welcome Email Subject Line</h3>
                  <div className="bg-black/50 p-4 border-l-4 border-orange-400">
                    <p className="text-zinc-400 italic">
                      "Welcome to [Brand] - Your exclusive 20% discount is waiting inside"
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Abandoned Cart Recovery</h3>
                  <div className="bg-black/50 p-4 border-l-4 border-emerald-400">
                    <p className="text-zinc-400 italic">
                      "Did something catch your eye? Your items are waiting in your cart, and we've saved them for you. Complete your purchase now and get free shipping!"
                    </p>
                  </div>
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
              <div className="text-xs text-zinc-500 mb-4">Per campaign</div>

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
                  item_id: 'email-marketing',
                  item_name: 'Email Marketing',
                  item_description: 'Persuasive email campaigns that nurture leads',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Single email campaign</span>
                  <span className="text-white">from {formatPrice(150)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Email sequence (3-5 emails)</span>
                  <span className="text-white">from {formatPrice(300)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Monthly newsletter package</span>
                  <span className="text-white">from {formatPrice(350)}</span>
                </div>
              </div>
            </motion.div>

            {/* Related Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Related Services</h3>
              <div className="space-y-3">
                <Link href="/content/website-copy" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiTarget className="text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Website Copy</div>
                      <div className="text-zinc-500 text-sm">Landing page optimization</div>
                    </div>
                  </div>
                </Link>
                <Link href="/content/advertising-copy" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiTrendingUp className="text-orange-400" />
                    <div>
                      <div className="text-white font-medium">Ad Copy</div>
                      <div className="text-zinc-500 text-sm">Paid advertising content</div>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
