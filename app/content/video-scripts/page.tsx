'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiVideo, FiArrowLeft, FiCheck, FiSend, FiTrendingUp, FiTarget, FiUsers, FiPlay, FiFileText, FiFilm } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function VideoScriptsPage() {
  const pricing = calculatePricing(400); // Mid-range price

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
              <FiVideo className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Video Scripts</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Compelling scripts for promotional videos</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Captivate Your Audience with Compelling Video Scripts</h2>
              <p className="text-zinc-400 text-lg mb-6">
                Great videos start with great scripts. Our video script service creates compelling narratives that engage viewers,
                communicate your message clearly, and drive action. From promotional videos to explainer content, we craft scripts
                that resonate with your audience and achieve your goals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTarget className="text-red-400" />
                    What You Get
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Engaging hook and opening
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Clear narrative structure
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Compelling call-to-action
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Visual direction notes
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Timing and pacing guidance
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Multiple format options
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiTrendingUp className="text-emerald-400" />
                    Video Types
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Promotional videos
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Explainer videos
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Product demonstrations
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Social media videos
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Training materials
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Testimonial videos
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
              <h2 className="text-2xl font-bold text-white mb-6">Our Script Writing Process</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Objective & Audience Analysis</h3>
                    <p className="text-zinc-400">We identify your video's goals, target audience, and key message to create a focused script.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Story Structure Development</h3>
                    <p className="text-zinc-400">We craft a compelling narrative with strong opening, engaging middle, and powerful conclusion.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Script Writing & Visual Notes</h3>
                    <p className="text-zinc-400">We write engaging dialogue and add visual direction notes for seamless production.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Review & Refinement</h3>
                    <p className="text-zinc-400">We refine the script based on your feedback and optimize for maximum impact.</p>
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
              <h2 className="text-2xl font-bold text-white mb-6">Script Examples</h2>
              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Product Demo Opening</h3>
                  <div className="bg-black/50 p-4 border-l-4 border-red-400">
                    <p className="text-zinc-400 italic mb-2">
                      <strong className="text-white">[VISUAL: Close-up of frustrated person at computer]</strong>
                    </p>
                    <p className="text-zinc-400 italic">
                      "Tired of spending hours on tasks that should take minutes? What if I told you there's a way to automate 90% of your daily workflow?"
                    </p>
                  </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Promotional Video CTA</h3>
                  <div className="bg-black/50 p-4 border-l-4 border-emerald-400">
                    <p className="text-zinc-400 italic mb-2">
                      <strong className="text-white">[VISUAL: Success montage with upbeat music]</strong>
                    </p>
                    <p className="text-zinc-400 italic">
                      "Join thousands of businesses already saving 20 hours per week. Click below to start your free trial today."
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
              <div className="text-xs text-zinc-500 mb-4">Per script</div>

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
                  item_id: 'video-scripts',
                  item_name: 'Video Scripts',
                  item_description: 'Compelling scripts for promotional videos',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">30-60 second script</span>
                  <span className="text-white">from {formatPrice(250)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">2-3 minute explainer</span>
                  <span className="text-white">from {formatPrice(375)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">5+ minute presentation</span>
                  <span className="text-white">from {formatPrice(525)}</span>
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
                <Link href="/content/social-media-content" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiPlay className="text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Social Media Content</div>
                      <div className="text-zinc-500 text-sm">Short-form video content</div>
                    </div>
                  </div>
                </Link>
                <Link href="/content/ai-generated-videos" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiFilm className="text-red-400" />
                    <div>
                      <div className="text-white font-medium">AI Video Production</div>
                      <div className="text-zinc-500 text-sm">Complete video creation</div>
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
