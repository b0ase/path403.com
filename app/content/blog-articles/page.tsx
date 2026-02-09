'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiFileText, FiArrowLeft, FiCheck, FiTrendingUp, FiBarChart2, FiUsers, FiSearch, FiEdit } from 'react-icons/fi';
import { calculatePricing, formatPrice } from '@/lib/pricing';
import AddToCartButton from '@/components/AddToCartButton';

export default function BlogArticlesPage() {
  const pricing = calculatePricing(200, { min: 1, max: 2 });

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 pt-32 pb-16">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link href="/#content" className="text-zinc-500 hover:text-white transition-colors">
            <FiArrowLeft className="text-xl" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 p-3 border border-zinc-800">
              <FiFileText className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">BLOG ARTICLES</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Authority-building content writing</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-white mb-4">Establish Your Industry Authority</h2>
              <p className="text-zinc-400 mb-6">
                Position your brand as the go-to expert in your industry with informative, engaging blog articles.
                Our content writing service creates valuable articles that attract your ideal customers and build lasting trust.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FiEdit className="text-emerald-400" />
                    Article Types
                  </h3>
                  <ul className="space-y-2">
                    {["How-to guides and tutorials", "Industry insights and analysis", "Case studies and success stories", "Thought leadership pieces", "Product comparisons", "Industry news commentary"].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-400 text-sm">
                        <FiCheck className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FiBarChart2 className="text-blue-400" />
                    SEO Benefits
                  </h3>
                  <ul className="space-y-2">
                    {["Improved search rankings", "Increased organic traffic", "Long-tail keyword targeting", "Internal linking opportunities", "Fresh content signals", "Social sharing potential"].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-zinc-400 text-sm">
                        <FiCheck className="text-emerald-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.section>

            {/* Content Strategy */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Our Content Strategy</h2>
              <div className="space-y-4">
                {[
                  { num: "1", title: "Audience Research", desc: "We identify your target audience's pain points, interests, and search behavior." },
                  { num: "2", title: "Keyword Strategy", desc: "We research high-value keywords that your audience is searching for." },
                  { num: "3", title: "Content Creation", desc: "Our writers craft engaging, informative articles that provide real value." },
                  { num: "4", title: "Optimization", desc: "We optimize for SEO, readability, and engagement to maximize impact." }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-8 h-8 bg-emerald-500 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">{step.num}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{step.title}</h3>
                      <p className="text-zinc-500 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Sample Topics */}
            <motion.section
              className="border border-zinc-800 bg-zinc-950 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xs text-zinc-500 uppercase tracking-widest mb-6">Sample Article Topics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-zinc-800 bg-black p-4">
                  <h3 className="text-sm font-bold text-white mb-2">Tech Industry</h3>
                  <ul className="space-y-1 text-zinc-500 text-xs">
                    <li>• "10 AI Tools Every Business Should Use in 2024"</li>
                    <li>• "How to Choose the Right Cloud Provider"</li>
                    <li>• "Cybersecurity Best Practices for Remote Teams"</li>
                  </ul>
                </div>
                <div className="border border-zinc-800 bg-black p-4">
                  <h3 className="text-sm font-bold text-white mb-2">E-commerce</h3>
                  <ul className="space-y-1 text-zinc-500 text-xs">
                    <li>• "Conversion Rate Optimization Strategies"</li>
                    <li>• "Building Customer Loyalty Programs"</li>
                    <li>• "Social Commerce Trends to Watch"</li>
                  </ul>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <motion.div
              className="p-6 border border-zinc-800 bg-zinc-950"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Investment</h3>
              <div className="text-3xl font-bold text-white mb-2">{formatPrice(pricing.elevatedPrice)}</div>
              <div className="text-xs text-zinc-500 mb-4">Per article</div>

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
                  item_id: 'blog-articles',
                  item_name: 'Blog Articles',
                  item_description: 'Authority-building content writing',
                  price: pricing.elevatedPrice,
                  quantity: 1
                }}
                className="w-full bg-white text-black hover:bg-zinc-200 px-4 py-3 text-xs uppercase font-bold tracking-wider mb-4"
              />

              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">500-800 words</span>
                  <span className="text-white">£100-150</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">1000-1500 words</span>
                  <span className="text-white">£200-250</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">2000+ words (deep dive)</span>
                  <span className="text-white">£250-300</span>
                </div>
              </div>
            </motion.div>

            {/* Package Deal */}
            <motion.div
              className="p-6 border border-emerald-500/30 bg-emerald-500/5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-white mb-2">Content Package</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Get 4 articles per month and save 20% on your content marketing.
              </p>
              <div className="text-2xl font-bold text-white mb-4">£640/month</div>
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-xs uppercase font-bold tracking-wider hover:bg-zinc-200 transition-colors"
              >
                <FiTrendingUp />
                Start Package
              </Link>
            </motion.div>

            {/* Related Services */}
            <motion.div
              className="p-6 border border-zinc-800 bg-zinc-950"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Related Services</h3>
              <div className="space-y-3">
                {[
                  { href: "/content/website-copy", icon: FiEdit, title: "Website Copy", desc: "Conversion-focused copy", color: "text-blue-400" },
                  { href: "/content/social-media-content", icon: FiUsers, title: "Social Media", desc: "Engaging social content", color: "text-purple-400" },
                  { href: "/content/email-campaigns", icon: FiSearch, title: "Email Marketing", desc: "Lead nurturing campaigns", color: "text-orange-400" }
                ].map((service, idx) => (
                  <Link key={idx} href={service.href} className="block p-3 border border-zinc-800 bg-black hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <service.icon className={service.color} />
                      <div>
                        <div className="text-white text-sm font-bold">{service.title}</div>
                        <div className="text-zinc-500 text-xs">{service.desc}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
