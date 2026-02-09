'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiFileText, FiArrowLeft, FiCheck, FiSend, FiTrendingUp, FiTarget, FiUsers, FiEdit } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function WebsiteCopyPage() {
  const pricing = calculatePricing(350); // Mid-range price

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
              <FiFileText className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Website Copy</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Persuasive, conversion-focused copy</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Transform Visitors into Customers</h2>
              <p className="text-zinc-400 text-lg mb-6">
                Your website is your digital storefront. Every word matters when it comes to converting visitors into paying customers.
                Our website copy service creates persuasive, conversion-focused content that speaks directly to your audience and drives action.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTarget className="text-blue-400" />
                    What You Get
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Compelling landing page copy that converts
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Engaging about page content
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Persuasive product descriptions
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Call-to-action optimization
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      SEO-friendly content structure
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Brand voice guidelines
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-400" />
                    Results You'll See
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Higher conversion rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Improved user engagement
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Better search rankings
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Clearer brand messaging
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Reduced bounce rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Stronger customer trust
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
              <h2 className="text-2xl font-bold text-white mb-6">Our Process</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Discovery & Research</h3>
                    <p className="text-zinc-400">We analyze your target audience, competitors, and brand voice to understand what resonates.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Content Strategy</h3>
                    <p className="text-zinc-400">We develop a content strategy that aligns with your business goals and user journey.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Copy Creation</h3>
                    <p className="text-zinc-400">Our expert copywriters craft compelling content that drives action and builds trust.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Review & Refinement</h3>
                    <p className="text-zinc-400">We refine the copy based on your feedback and optimize for maximum impact.</p>
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
              <h2 className="text-2xl font-bold text-white mb-6">Copy Examples</h2>
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Landing Page Hero</h3>
                  <div className="bg-black/50 p-4 border-l-4 border-blue-400">
                    <p className="text-zinc-400 italic">
                      "Transform your business with AI-powered solutions that work 24/7.
                      Join 10,000+ companies already saving 40% on operational costs."
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Product Description</h3>
                  <div className="bg-black/50 p-4 border-l-4 border-emerald-400">
                    <p className="text-zinc-400 italic">
                      "Stop losing customers to slow websites. Our premium hosting delivers lightning-fast load times
                      and 99.9% uptime, so your business never sleeps."
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
              <div className="text-xs text-zinc-500 mb-4">Per project</div>

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
                  item_id: 'website-copy',
                  item_name: 'Website Copy',
                  item_description: 'Persuasive, conversion-focused copy',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Single page</span>
                  <span className="text-white">from {formatPrice(200)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Full website (5-10 pages)</span>
                  <span className="text-white">from {formatPrice(450)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">E-commerce (10+ products)</span>
                  <span className="text-white">from {formatPrice(400)}</span>
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
                <Link href="/content/advertising-copy" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiTarget className="text-orange-400" />
                    <div>
                      <div className="text-white font-medium">Ad Copy</div>
                      <div className="text-zinc-500 text-sm">High-converting ads</div>
                    </div>
                  </div>
                </Link>
                <Link href="/content/email-campaigns" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiUsers className="text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Email Marketing</div>
                      <div className="text-zinc-500 text-sm">Lead nurturing campaigns</div>
                    </div>
                  </div>
                </Link>
                <Link href="/content/blog-articles" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiEdit className="text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">Blog Articles</div>
                      <div className="text-zinc-500 text-sm">Authority content</div>
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
