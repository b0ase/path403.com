'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiCamera, FiArrowLeft, FiCheck, FiSend, FiShoppingCart, FiEye, FiHeart, FiStar } from 'react-icons/fi';
import AddToCartButton from '@/components/AddToCartButton';
import { calculatePricing, formatPrice } from '@/lib/pricing';

export default function ProductPhotographyPage() {
  const pricing = calculatePricing(800); // Mid-range price

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
              <FiCamera className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Product Photography</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Professional product images</p>
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
              <h2 className="text-2xl font-bold text-white mb-4">Showcase Your Products in Their Best Light</h2>
              <p className="text-zinc-400 text-lg mb-6">
                First impressions matter. Our professional product photography service creates stunning images that
                capture every detail, build trust, and drive sales across all your marketing channels.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiCamera className="text-purple-400" />
                    Photography Types
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      White background product shots
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Lifestyle & in-use photography
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      360-degree product views
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Detailed macro shots
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Group & collection shots
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Packaging photography
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <FiShoppingCart className="text-indigo-400" />
                    Sales Impact
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      67% higher conversion rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Reduced return rates
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Increased customer trust
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Better search rankings
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      Higher perceived value
                    </li>
                    <li className="flex items-start gap-2 text-zinc-400">
                      <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                      More social media shares
                    </li>
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Photography Styles */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Photography Styles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Clean & Minimal</h3>
                  <p className="text-zinc-500 text-sm">Pure white backgrounds perfect for e-commerce listings and catalogs</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Lifestyle</h3>
                  <p className="text-zinc-500 text-sm">Products in real-world settings that tell your brand story</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Detail Shots</h3>
                  <p className="text-zinc-500 text-sm">Macro photography showcasing textures, materials, and craftsmanship</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">Creative</h3>
                  <p className="text-zinc-500 text-sm">Artistic compositions that make your products stand out from competitors</p>
                </div>
              </div>
            </motion.section>

            {/* Process */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-800 p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Our Photography Process</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-white font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Consultation & Planning</h3>
                    <p className="text-zinc-400">We discuss your brand, target audience, and specific requirements for each product.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-white font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Studio Setup</h3>
                    <p className="text-zinc-400">Professional lighting, backgrounds, and equipment configured for optimal results.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-white font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Photography Session</h3>
                    <p className="text-zinc-400">Multiple angles, compositions, and styles captured for maximum versatility.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-white font-bold">4</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Professional Editing</h3>
                    <p className="text-zinc-400">Color correction, retouching, and optimization for web and print use.</p>
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
              <div className="text-xs text-zinc-500 mb-4">Per session</div>

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
                  item_id: 'product-photography',
                  item_name: 'Product Photography',
                  item_description: 'Professional product images',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider"
              />

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">1-5 products</span>
                  <span className="text-white">from {formatPrice(500)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">6-15 products</span>
                  <span className="text-white">from {formatPrice(800)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">16+ products</span>
                  <span className="text-white">from {formatPrice(1100)}</span>
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
                    <div className="text-white font-medium text-sm">Professional Lighting</div>
                    <div className="text-zinc-500 text-xs">Studio-quality setup</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Multiple Angles</div>
                    <div className="text-zinc-500 text-xs">5-10 shots per product</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCheck className="text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-medium text-sm">Professional Editing</div>
                    <div className="text-zinc-500 text-xs">Color correction & retouching</div>
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
                    <div className="text-white font-medium text-sm">Fast Turnaround</div>
                    <div className="text-zinc-500 text-xs">48-72 hour delivery</div>
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
                    <FiShoppingCart className="text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Product Copy</div>
                      <div className="text-zinc-500 text-sm">Compelling product descriptions</div>
                    </div>
                  </div>
                </Link>
                <Link href="/content/social-media-content" className="block p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FiHeart className="text-pink-400" />
                    <div>
                      <div className="text-white font-medium">Social Media</div>
                      <div className="text-zinc-500 text-sm">Product showcase content</div>
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
