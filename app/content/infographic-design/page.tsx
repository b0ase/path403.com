'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiPieChart, FiArrowLeft, FiCheck, FiSend, FiPenTool, FiUsers, FiShare2, FiEye } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function InfographicDesignPage() {
  const pricing = calculatePricing(550); // Mid-range price

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
              <FiPieChart className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Infographic Design</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Visual content that drives engagement</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Transform Complex Data into Visual Stories</h2>
              <p className="text-zinc-400 text-lg mb-6">
                Make complex information instantly digestible with stunning infographics that capture attention,
                simplify concepts, and drive social sharing. Perfect for explaining processes, showcasing data, and building authority.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiPieChart className="text-teal-400" />
                    Infographic Types
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Statistical data visualizations
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Process flow diagrams
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Comparison charts
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Timeline infographics
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      How-to guides
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Industry reports
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiEye className="text-cyan-400" />
                    Visual Impact
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      30x more likely to be read than text
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      3x more social media shares
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Improved information retention
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Enhanced brand credibility
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Increased website traffic
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Better SEO performance
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Design Process */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Our Design Process</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-teal-600 flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Data Analysis</h3>
                    <p className="text-zinc-400">We analyze your data, identify key insights, and determine the best visual approach.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-teal-600 flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Concept Development</h3>
                    <p className="text-zinc-400">We create wireframes and concepts that tell your story in the most compelling way.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-teal-600 flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Visual Design</h3>
                    <p className="text-zinc-400">Our designers create stunning visuals that align with your brand and captivate your audience.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-teal-600 flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Optimization</h3>
                    <p className="text-zinc-400">We optimize for different platforms and ensure maximum impact across all channels.</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Use Cases */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Perfect For</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiUsers className="text-3xl text-blue-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Marketing Teams</h3>
                  <p className="text-zinc-500 text-sm">Boost content marketing with shareable visual content that drives engagement</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiPenTool className="text-3xl text-emerald-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Sales Teams</h3>
                  <p className="text-zinc-500 text-sm">Simplify complex proposals and make data-driven presentations more compelling</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiShare2 className="text-3xl text-purple-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Content Creators</h3>
                  <p className="text-zinc-500 text-sm">Create viral content that gets shared across social media platforms</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <FiPieChart className="text-3xl text-orange-400 mb-3" />
                  <h3 className="text-xl font-semibold text-white mb-2">Executives</h3>
                  <p className="text-zinc-500 text-sm">Present quarterly reports and company data in visually compelling formats</p>
                </div>
              </div>
            </motion.section>

            {/* Sample Infographics */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Sample Infographic Concepts</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">"The Future of Remote Work"</h3>
                  <p className="text-zinc-400 text-sm mb-2">Statistical infographic showing remote work trends, productivity metrics, and future predictions</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-600 text-white px-2 py-1">Statistics</span>
                    <span className="text-xs bg-emerald-600 text-white px-2 py-1">Charts</span>
                    <span className="text-xs bg-purple-600 text-white px-2 py-1">Icons</span>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">"How to Launch a Startup in 10 Steps"</h3>
                  <p className="text-zinc-400 text-sm mb-2">Process infographic with timeline, key milestones, and actionable advice</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-orange-600 text-white px-2 py-1">Process Flow</span>
                    <span className="text-xs bg-teal-600 text-white px-2 py-1">Timeline</span>
                    <span className="text-xs bg-pink-600 text-white px-2 py-1">Tips</span>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">"AI vs Human: Content Creation Comparison"</h3>
                  <p className="text-zinc-400 text-sm mb-2">Comparison infographic highlighting strengths, weaknesses, and use cases</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-red-600 text-white px-2 py-1">Comparison</span>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1">Data Viz</span>
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1">Insights</span>
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
              <div className="text-xs text-zinc-500 mb-4">Per infographic</div>

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
                  item_id: 'infographic-design',
                  item_name: 'Infographic Design',
                  item_description: 'Visual content that drives engagement',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Simple (5-10 data points)</span>
                  <span className="text-white">from {formatPrice(350)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Complex (10-20 data points)</span>
                  <span className="text-white">from {formatPrice(550)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Premium (20+ data points)</span>
                  <span className="text-white">from {formatPrice(750)}</span>
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
                    <div className="text-white font-medium text-sm">Custom Design</div>
                    <div className="text-zinc-500 text-xs">Brand-aligned visual design</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Multiple Formats</div>
                    <div className="text-zinc-500 text-xs">Web, print, and social ready</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Source Files</div>
                    <div className="text-zinc-500 text-xs">Editable design files included</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Unlimited Revisions</div>
                    <div className="text-zinc-500 text-xs">Until you're 100% satisfied</div>
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
                <Link href="/content/social-media-content" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiShare2 className="text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Social Media</div>
                      <div className="text-zinc-500 text-sm">Platform-specific content</div>
                    </div>
                  </div>
                </Link>
                <Link href="/content/blog-articles" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiPenTool className="text-emerald-400" />
                    <div>
                      <div className="text-white font-medium">Blog Articles</div>
                      <div className="text-zinc-500 text-sm">Supporting written content</div>
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
