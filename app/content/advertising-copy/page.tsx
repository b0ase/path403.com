'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiRadio, FiArrowLeft, FiCheck, FiSend, FiTrendingUp, FiTarget, FiLinkedin } from 'react-icons/fi';
import { FaGoogle, FaFacebook, FaInstagram } from 'react-icons/fa';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function AdvertisingCopyPage() {
  const pricing = calculatePricing(200); // Mid-range price

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
              <FiRadio className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Advertising Copy</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">High-converting ad copy</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Turn Ad Spend into Revenue</h2>
              <p className="text-zinc-400 text-lg mb-6">
                Stop wasting money on ads that don't convert. Our advertising copy service creates compelling,
                data-driven ad content that captures attention, builds desire, and drives action across all platforms.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiRadio className="text-orange-400" />
                    Ad Types
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Google Ads (Search & Display)
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Facebook & Instagram Ads
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      LinkedIn Sponsored Content
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      YouTube Video Ads
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      TikTok & Snapchat Ads
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Retargeting campaigns
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTarget className="text-red-400" />
                    What You Get
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Multiple ad variations for A/B testing
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Platform-specific optimization
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Compelling headlines & descriptions
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Strong call-to-action phrases
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Keyword-optimized content
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Audience-targeted messaging
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Platform Expertise */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Platform Expertise</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FaGoogle className="text-3xl text-blue-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Google Ads</h3>
                  <p className="text-zinc-500 text-sm">Search ads, display campaigns, shopping ads, and YouTube advertising</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FaFacebook className="text-3xl text-blue-500 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Meta Ads</h3>
                  <p className="text-zinc-500 text-sm">Facebook, Instagram, Messenger, and Audience Network campaigns</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiLinkedin className="text-3xl text-blue-600 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">LinkedIn Ads</h3>
                  <p className="text-zinc-500 text-sm">Professional B2B targeting with sponsored content and InMail</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FaInstagram className="text-3xl text-pink-500 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Social Platforms</h3>
                  <p className="text-zinc-500 text-sm">TikTok, Snapchat, Twitter, and emerging social networks</p>
                </div>
              </div>
            </motion.section>

            {/* Ad Copy Examples */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">High-Converting Ad Examples</h2>
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaGoogle className="text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">Google Search Ad</h3>
                  </div>
                  <div className="bg-black/50 p-4 border-l-4 border-blue-400">
                    <div className="text-blue-400 font-semibold text-sm mb-1">Headline 1: Stop Losing Customers to Slow Websites</div>
                    <div className="text-blue-400 font-semibold text-sm mb-1">Headline 2: 99.9% Uptime Guaranteed</div>
                    <div className="text-zinc-400 text-sm mb-2">Description: Lightning-fast hosting that keeps your business running 24/7. Free migration included.</div>
                    <div className="text-emerald-400 text-sm">14-Day Free Trial | 24/7 Support | Money-Back Guarantee</div>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaFacebook className="text-blue-500" />
                    <h3 className="text-lg font-semibold text-white">Facebook Ad</h3>
                  </div>
                  <div className="bg-black/50 p-4 border-l-4 border-blue-500">
                    <div className="text-white font-semibold text-sm mb-2">Tired of manual tasks eating up your day?</div>
                    <div className="text-zinc-400 text-sm mb-2">Our AI assistant handles the boring stuff so you can focus on growing your business. Join 10,000+ entrepreneurs saving 5+ hours daily.</div>
                    <div className="text-blue-400 text-sm font-semibold">Try it FREE for 14 days (no credit card required)</div>
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
                  item_id: 'advertising-copy',
                  item_name: 'Advertising Copy',
                  item_description: 'High-converting ad copy',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Single platform (3 variations)</span>
                  <span className="text-white">from {formatPrice(100)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Multi-platform (5 variations)</span>
                  <span className="text-white">from {formatPrice(225)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Full campaign suite</span>
                  <span className="text-white">from {formatPrice(275)}</span>
                </div>
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Typical Results</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Click-through Rate</span>
                  <span className="text-emerald-400 font-bold">2-5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Conversion Rate</span>
                  <span className="text-emerald-400 font-bold">3-8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Cost Per Click</span>
                  <span className="text-emerald-400 font-bold">-20-40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Return on Ad Spend</span>
                  <span className="text-emerald-400 font-bold">300-500%</span>
                </div>
              </div>
            </motion.div>

            {/* Add-ons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Add-on Services</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-white font-medium text-sm">Landing Page Copy</div>
                    <div className="text-zinc-500 text-xs">Conversion-optimized pages</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{formatPrice(200)}</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-white font-medium text-sm">A/B Test Strategy</div>
                    <div className="text-zinc-500 text-xs">Testing plan & analysis</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{formatPrice(100)}</div>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="text-white font-medium text-sm">Campaign Setup</div>
                    <div className="text-zinc-500 text-xs">Platform configuration</div>
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">+{formatPrice(150)}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
