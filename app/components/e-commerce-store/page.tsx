'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiShoppingCart, FiShield, FiSmartphone, FiTrendingUp } from 'react-icons/fi';

export default function EcommerceStoreModule() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
    >
      <div className="px-4 md:px-8 py-16">
        {/* Back Link */}
        <Link href="/components" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
          <FiArrowLeft />
          <span>Back to Components</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
              <FiShoppingCart className="text-3xl md:text-4xl text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">E-commerce</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
                E-commerce Store
              </h1>
              <p className="text-zinc-400 max-w-2xl">
                Complete online store solution with modern design, secure payments, and powerful management tools
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">
                £800-1500
              </div>
              <Link href="/contact" className="bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider inline-block">
                Get Quote
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
              2-3 weeks delivery
            </span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
              Advanced complexity
            </span>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-950 border border-zinc-900 p-6"
            >
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Complete E-commerce Solution
              </h2>
              <p className="text-zinc-400 mb-6">
                Launch your online business with a professional e-commerce platform that includes everything you need to sell products online. From product catalogs to secure checkout, inventory management to order fulfillment - we build it all.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <FiShoppingCart className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">Product Management</h3>
                    <p className="text-zinc-500 text-sm">
                      Easy-to-use admin panel for adding products, managing inventory, and organizing categories
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiShield className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">Secure Payments</h3>
                    <p className="text-zinc-500 text-sm">
                      Integrated payment processing with Stripe, PayPal, and other major providers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiSmartphone className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">Mobile Optimized</h3>
                    <p className="text-zinc-500 text-sm">
                      Responsive design that works perfectly on all devices and screen sizes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiTrendingUp className="text-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white text-sm mb-1">Sales Analytics</h3>
                    <p className="text-zinc-500 text-sm">
                      Comprehensive dashboard with sales reports, customer insights, and performance metrics
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-900 p-6"
            >
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6">
                Store Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Product Catalog with Search & Filters',
                  'Shopping Cart & Wishlist',
                  'Secure Checkout Process',
                  'User Account Management',
                  'Order Tracking & History',
                  'Inventory Management',
                  'Discount Codes & Promotions',
                  'Email Notifications',
                  'SEO Optimization',
                  'Multi-Currency Support',
                  'Shipping Calculator',
                  'Customer Reviews & Ratings',
                  'Admin Dashboard',
                  'Sales Reports & Analytics',
                  'Tax Calculation',
                  'Mobile App Ready API'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FiCheck className="text-emerald-500 flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Technical Implementation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-950 border border-zinc-900 p-6"
            >
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6">
                Technical Implementation
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Technology Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Stripe API', 'PostgreSQL', 'Prisma ORM', 'Vercel'].map((tech) => (
                      <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Payment Integration
                  </h3>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Stripe payment processing with saved cards
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      PayPal Express Checkout integration
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Apple Pay and Google Pay support
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Automatic tax calculation based on location
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Subscription billing for recurring products
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Admin Features
                  </h3>
                  <ul className="space-y-2 text-zinc-400 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Intuitive product management interface
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Order processing and fulfillment tools
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Customer support ticket system
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Inventory tracking with low-stock alerts
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-zinc-600">-</span>
                      Sales analytics and reporting dashboard
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-950 border border-zinc-900 p-6"
            >
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Pricing Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Basic Store</span>
                  <span className="font-bold text-white">£800</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Payment Integration</span>
                  <span className="font-bold text-white">£200</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Admin Dashboard</span>
                  <span className="font-bold text-white">£250</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                  <span className="text-zinc-500 text-sm">Advanced Features</span>
                  <span className="font-bold text-white">£250</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-white">Total Range</span>
                  <span className="font-bold text-emerald-500">£800-1500</span>
                </div>
              </div>
            </motion.div>

            {/* Delivery Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-zinc-950 border border-zinc-900 p-6"
            >
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Development Process
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 mt-2"></div>
                  <div>
                    <div className="text-sm font-bold text-white">Week 1</div>
                    <div className="text-xs text-zinc-500">Store design & product catalog setup</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 mt-2"></div>
                  <div>
                    <div className="text-sm font-bold text-white">Week 2</div>
                    <div className="text-xs text-zinc-500">Payment integration & checkout flow</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 mt-2"></div>
                  <div>
                    <div className="text-sm font-bold text-white">Week 3</div>
                    <div className="text-xs text-zinc-500">Admin dashboard & final testing</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-950 border border-zinc-900 p-6"
            >
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
                Package Includes
              </h3>

              <ul className="space-y-2">
                {[
                  'Complete store setup',
                  'Payment gateway integration',
                  'Admin dashboard',
                  'Mobile optimization',
                  'SEO optimization',
                  '30 days support',
                  'Training & documentation',
                  'SSL certificate setup'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-zinc-400">
                    <FiCheck className="text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
