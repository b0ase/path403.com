'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiCheck, FiSend, FiTrendingUp, FiUsers, FiTarget, FiHeart, FiShoppingCart } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function EmailCampaignsPage() {
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
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Lead nurturing email campaigns</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Turn Leads into Loyal Customers</h2>
              <p className="text-zinc-400 text-lg mb-6">
                Build meaningful relationships with your audience through strategic email campaigns that nurture leads,
                drive conversions, and create lasting customer loyalty. Our email marketing service delivers results that matter.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiMail className="text-blue-400" />
                    Campaign Types
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Welcome series for new subscribers
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Lead nurturing sequences
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Product launch campaigns
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Re-engagement campaigns
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Newsletter content
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Promotional campaigns
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-400" />
                    Expected Results
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      25-40% open rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      3-8% click-through rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Increased customer lifetime value
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Higher conversion rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Reduced churn rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Stronger brand loyalty
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Campaign Strategy */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Our Campaign Strategy</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiTarget className="text-3xl text-blue-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Audience Segmentation</h3>
                  <p className="text-zinc-500 text-sm">Targeted messaging based on behavior, preferences, and journey stage</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiUsers className="text-3xl text-emerald-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Personalization</h3>
                  <p className="text-zinc-500 text-sm">Dynamic content that speaks directly to each subscriber</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiTrendingUp className="text-3xl text-purple-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">A/B Testing</h3>
                  <p className="text-zinc-500 text-sm">Continuous optimization of subject lines, content, and timing</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiHeart className="text-3xl text-red-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Automation</h3>
                  <p className="text-zinc-500 text-sm">Set-and-forget sequences that nurture leads 24/7</p>
                </div>
              </div>
            </motion.section>

            {/* Sample Campaign */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Sample Welcome Series</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Email 1: Welcome & Thank You</h3>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1">Immediate</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2"><strong className="text-white">Subject:</strong> "Welcome to [Company]! Here's what happens next..."</p>
                  <p className="text-zinc-500 text-sm">Sets expectations, delivers lead magnet, introduces brand story</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Email 2: Value-First Education</h3>
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1">Day 3</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2"><strong className="text-white">Subject:</strong> "The #1 mistake most [target audience] make"</p>
                  <p className="text-zinc-500 text-sm">Educational content that positions you as the expert</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Email 3: Social Proof</h3>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1">Day 7</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2"><strong className="text-white">Subject:</strong> "How [Customer Name] achieved [specific result]"</p>
                  <p className="text-zinc-500 text-sm">Case study showcasing real customer success</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">Email 4: Soft Pitch</h3>
                    <span className="text-xs bg-orange-600 text-white px-2 py-1">Day 10</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-2"><strong className="text-white">Subject:</strong> "Ready to [achieve desired outcome]?"</p>
                  <p className="text-zinc-500 text-sm">Gentle introduction to your solution with special offer</p>
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
                  item_id: 'email-campaigns',
                  item_name: 'Email Campaigns',
                  item_description: 'Lead nurturing email campaigns',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">3-email sequence</span>
                  <span className="text-white">from {formatPrice(150)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">5-email sequence</span>
                  <span className="text-white">from {formatPrice(275)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">7+ email sequence</span>
                  <span className="text-white">from {formatPrice(375)}</span>
                </div>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">What's Included</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Subject Line Optimization</div>
                    <div className="text-zinc-500 text-xs">A/B tested for maximum opens</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Mobile Optimization</div>
                    <div className="text-zinc-500 text-xs">Perfect display on all devices</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Personalization Tags</div>
                    <div className="text-zinc-500 text-xs">Dynamic content insertion</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Performance Analytics</div>
                    <div className="text-zinc-500 text-xs">Detailed campaign reports</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Related Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
