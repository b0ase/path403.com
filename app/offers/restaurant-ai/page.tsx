'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiPhone, FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function RestaurantAI() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-8 py-12">
        {/* Back Link */}
        <Link
          href="/offers"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 font-mono text-sm"
        >
          <FiArrowLeft />
          Back to Offers
        </Link>

        {/* Header */}
        <header className="mb-16">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <FiPhone size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">AI Phone Agent for Restaurants</h1>
              <p className="text-xl text-zinc-400 font-mono">
                Never miss another order. Your AI answers calls, takes orders, upsells, and sends everything to you.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-sm mb-12">
            <div>
              <p className="text-zinc-600 uppercase tracking-wider mb-2">Problem</p>
              <p className="text-zinc-300">You're busy cooking. Phone rings. Customer hangs up. Lost order = lost money.</p>
            </div>
            <div>
              <p className="text-zinc-600 uppercase tracking-wider mb-2">Solution</p>
              <p className="text-zinc-300">AI answers 24/7, takes orders perfectly, upsells automatically, sends orders via SMS.</p>
            </div>
            <div>
              <p className="text-zinc-600 uppercase tracking-wider mb-2">Result</p>
              <p className="text-zinc-300">Capture every order. Increase average order value. Stop losing money to missed calls.</p>
            </div>
          </div>

          {/* Pricing Callout */}
          <div className="border-2 border-white bg-zinc-950 p-8 text-center">
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Fixed Price</p>
            <p className="text-5xl font-bold mb-2">£500</p>
            <p className="text-zinc-400 mb-4">One-time setup for your menu</p>
            <p className="text-3xl font-bold mb-2">£200/month</p>
            <p className="text-zinc-400 mb-6">Ongoing (covers AI costs + support)</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
            >
              Book Free Demo
            </Link>
            <p className="text-xs text-zinc-600 mt-4 font-mono">Live in 48 hours</p>
          </div>
        </header>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 border-b border-zinc-800 pb-3">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="border border-zinc-900 p-6"
            >
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Customer Calls</h3>
              <p className="text-sm text-zinc-400">
                They dial your restaurant number. AI picks up instantly, greets them by name if they're a repeat customer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-zinc-900 p-6"
            >
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Takes Order</h3>
              <p className="text-sm text-zinc-400">
                Walks through your menu, handles modifications ("no onions"), quantities, delivery vs. collection.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-zinc-900 p-6"
            >
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Upsells</h3>
              <p className="text-sm text-zinc-400">
                "Would you like to add chips for £2?" — increases average order value by 15-30% automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-zinc-900 p-6"
            >
              <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Sends to You</h3>
              <p className="text-sm text-zinc-400">
                Order arrives via SMS, email, or Slack. You prepare it. Customer happy. You made money.
              </p>
            </motion.div>
          </div>
        </section>

        {/* What You Get */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 border-b border-zinc-800 pb-3">What You Get</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Included in Setup (£500)
              </h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Custom AI trained on your full menu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Phone number setup (new or forward existing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Natural voice (sounds like a real person)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Order delivery via SMS/email/Slack</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Upsell prompts configured for your items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Testing with you before going live</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>48-hour turnaround from menu to live</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-blue-500" />
                Included in Monthly (£200)
              </h3>
              <ul className="space-y-3 text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Unlimited incoming calls (no per-call charges)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>AI running costs (speech, GPT-4, voice)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Menu updates anytime (add/remove items)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Performance monitoring & improvements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Email support (fixes within 24 hours)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Monthly call analytics report</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-white mt-1">+</span>
                  <span>Cancel anytime (no lock-in)</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="mb-20 border border-zinc-900 p-8 bg-zinc-950">
          <h2 className="text-2xl font-bold mb-6">Does This Pay For Itself?</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-zinc-600 uppercase text-xs tracking-wider mb-2">Missed Calls/Week</p>
                <p className="text-3xl font-bold text-white">10</p>
                <p className="text-xs text-zinc-500 mt-1">Conservative estimate (busy periods)</p>
              </div>
              <div>
                <p className="text-zinc-600 uppercase text-xs tracking-wider mb-2">Average Order Value</p>
                <p className="text-3xl font-bold text-white">£20</p>
                <p className="text-xs text-zinc-500 mt-1">Typical takeaway order</p>
              </div>
              <div>
                <p className="text-zinc-600 uppercase text-xs tracking-wider mb-2">Lost Revenue/Month</p>
                <p className="text-3xl font-bold text-red-500">£800</p>
                <p className="text-xs text-zinc-500 mt-1">10 calls × 4 weeks × £20</p>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900">
              <p className="text-lg text-white mb-2">
                If the AI captures just <strong>5 extra orders per month</strong> at £20 each, it's paid for itself.
              </p>
              <p className="text-zinc-400">
                Realistically, it'll capture 20-40 orders/month you would have missed. That's £400-800 in new revenue.
                ROI: 200-400%.
              </p>
            </div>
          </div>
        </section>

        {/* Common Questions */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 border-b border-zinc-800 pb-3">Common Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-2">What if it gets the order wrong?</h3>
              <p className="text-sm text-zinc-400">
                I monitor the first 50 calls and fix any issues immediately. The AI repeats orders back to customers
                for confirmation. And they can always call back if something's wrong—just like with a human.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Can it handle complex orders?</h3>
              <p className="text-sm text-zinc-400">
                Yes. Modifications ("no onions, extra cheese"), multiple items, delivery addresses, special instructions—all handled.
                It's trained specifically on your menu, so it knows what's possible.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">What if a customer wants to speak to a real person?</h3>
              <p className="text-sm text-zinc-400">
                The AI can transfer the call to you anytime they ask. Or you can set it to only take orders during busy periods
                and forward to you at other times.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">How fast can you set this up?</h3>
              <p className="text-sm text-zinc-400">
                48 hours from when I receive your menu. I build it, test it with you, and you go live. If you're in a rush,
                I can do same-day setup.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">What if I want to cancel?</h3>
              <p className="text-sm text-zinc-400">
                No problem. Cancel anytime. No lock-in. You keep the phone number if you paid for it separately.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2">Can I update my menu?</h3>
              <p className="text-sm text-zinc-400">
                Yes. Email me updates anytime (new items, price changes, specials). I update the AI within 24 hours. No extra charge.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-2 border-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">See It Work (Free Demo)</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
            I'll call my demo AI on speaker phone and you'll hear exactly how it sounds. Takes 2 minutes.
            No commitment required.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            Book Free Demo Call
          </Link>
          <p className="text-xs text-zinc-600 mt-4 font-mono">Usually respond within 24 hours</p>
        </section>

        {/* Footer Note */}
        <section className="mt-16 text-center text-sm text-zinc-600">
          <p>Also available for: Dental offices, Estate agents, Salons, Plumbers, Electricians, and other local businesses</p>
        </section>
      </div>
    </div>
  );
}
