'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import {
  Sparkles,
  Lightbulb,
  Rocket,
  Palette,
  Wand2,
  Eye,
  Users,
  Target,
  Zap,
  Heart
} from 'lucide-react';

const CREATIVE_SERVICES = [
  {
    icon: Lightbulb,
    title: 'Blue Sky Sessions',
    description: 'Structured ideation workshops to explore the impossible. No limits, no "that won\'t work" - just pure creative potential.',
    features: ['2-hour deep dives', 'Facilitated brainstorming', 'Documented concepts']
  },
  {
    icon: Sparkles,
    title: 'Experience Design',
    description: 'Transform mundane customer touchpoints into memorable moments. Every interaction becomes an opportunity to delight.',
    features: ['Journey mapping', 'Touchpoint magic', 'Emotional design']
  },
  {
    icon: Wand2,
    title: 'Brand Alchemy',
    description: 'Turn your brand into something people actually feel. Visual identity, voice, and vibe that resonates.',
    features: ['Identity systems', 'Brand voice', 'Visual language']
  },
  {
    icon: Eye,
    title: 'Immersive Experiences',
    description: 'AR, VR, interactive installations, and digital experiences that blur the line between physical and digital.',
    features: ['WebXR development', '3D experiences', 'Interactive art']
  },
  {
    icon: Rocket,
    title: 'Launch Concepts',
    description: 'Product launches, events, and campaigns that generate buzz. Memorable moments that spread.',
    features: ['Viral mechanics', 'Event concepts', 'Campaign strategy']
  },
  {
    icon: Heart,
    title: 'Customer Delight',
    description: 'Find the unexpected moments where you can over-deliver. Small touches that create lifelong fans.',
    features: ['Surprise & delight', 'Loyalty mechanics', 'Referral systems']
  }
];

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Dream Session',
    description: 'Start with your wildest ideas. What would you do if money and technology were no object?'
  },
  {
    step: '02',
    title: 'Reality Check',
    description: 'Identify which ideas have the best ratio of impact to effort. Find the achievable magic.'
  },
  {
    step: '03',
    title: 'Prototype',
    description: 'Build quick, scrappy versions to test. Fail fast, learn faster.'
  },
  {
    step: '04',
    title: 'Polish & Launch',
    description: 'Refine what works. Ship something that makes people smile.'
  }
];

export default function CreativePage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Standardized Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <Link href="/creative/kintsugi" className="bg-gray-900/50 p-2 md:p-3 border border-gray-800 self-start rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors group">
              <Image
                src="/images/blog/kintsugi-bowl.jpg"
                alt="Kintsugi"
                width={80}
                height={80}
                className="w-14 h-14 md:w-20 md:h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                CREATIVE
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                BLUE SKY
              </div>
            </div>
          </div>

          {/* Marketing Pitch */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Create magical experiences for your customers. Blue sky thinking, experience design,
              and the creative sparks that make businesses unforgettable.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Start Dreaming <FiArrowRight size={14} />
            </Link>
          </div>
        </motion.div>

        {/* Hero Statement */}
        <div className="mb-16">
          <div className="border border-gray-800 p-8 md:p-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-6 text-white leading-tight">
              What if your customers <Link href="/creative/kintsugi" className="text-amber-400 hover:text-amber-300 transition-colors underline decoration-amber-500/30 hover:decoration-amber-400">actually loved</Link> interacting with your business?
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl">
              Most businesses compete on features and price. The memorable ones compete on experience.
              They make people feel something. That&apos;s what creative does - it transforms transactions
              into relationships, customers into fans, and brands into movements.
            </p>
            <Link
              href="/creative/kintsugi"
              className="inline-flex items-center gap-2 mt-6 text-amber-500 hover:text-amber-400 transition-colors text-sm"
            >
              <span>Explore what needs repairing with gold</span>
              <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            What I Do
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREATIVE_SERVICES.map((service, index) => (
              <div
                key={index}
                className="p-6 border border-gray-800 hover:border-gray-600 bg-black transition-all"
              >
                <service.icon className="w-8 h-8 text-white mb-4" />
                <h4 className="font-bold uppercase tracking-tight mb-2 text-white">
                  {service.title}
                </h4>
                <p className="text-gray-400 text-sm mb-4">{service.description}</p>
                <ul className="space-y-1">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                      <FiCheck size={12} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            The Process
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-16">Step</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Phase</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {PROCESS_STEPS.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-900/50">
                    <td className="px-4 py-4 text-sm font-mono text-gray-500">{item.step}</td>
                    <td className="px-4 py-4 text-sm font-bold text-white">{item.title}</td>
                    <td className="px-4 py-4 text-sm text-gray-400">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Examples */}
        <div className="mb-16">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 text-gray-400">
            Example Ideas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">For a Coffee Shop</h4>
              <p className="text-gray-400 text-sm mb-4">
                "What if your loyalty card was a plant that grows in AR every time you visit?
                Customers literally nurture something with their purchases. Share your garden on social."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">AR Experience</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Gamification</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Social</span>
              </div>
            </div>
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">For a SaaS Product</h4>
              <p className="text-gray-400 text-sm mb-4">
                "What if onboarding felt like a game, not a chore? Each completed step unlocks
                a piece of your company's origin story. Make them want to finish."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Onboarding</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Storytelling</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">UX</span>
              </div>
            </div>
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">For an E-commerce Brand</h4>
              <p className="text-gray-400 text-sm mb-4">
                "What if unboxing felt like opening a time capsule from the future?
                Personalized audio messages, hidden compartments, seeds to plant."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Packaging</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Delight</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Physical</span>
              </div>
            </div>
            <div className="p-6 border border-gray-800 bg-black">
              <h4 className="font-bold uppercase tracking-tight mb-3 text-white">For a Real Estate Agency</h4>
              <p className="text-gray-400 text-sm mb-4">
                "What if every house listing came with the previous owner's favorite memory in that space?
                Emotional connection before they even visit."
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Storytelling</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Emotional</span>
                <span className="text-xs px-2 py-1 border border-gray-800 text-gray-500">Content</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-white">
                Ready to think bigger?
              </h3>
              <p className="text-gray-400">
                Book a blue sky session. Leave with ideas that make you excited to go to work.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Book a Session <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
