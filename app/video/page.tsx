'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiVideo, FiFilm, FiZap, FiGrid, FiPlay, FiEdit3, FiCheck, FiArrowRight, FiStar } from 'react-icons/fi';

const packages = [
  {
    name: 'Promo Video',
    price: '£200',
    description: 'Perfect for product launches and social media campaigns',
    features: [
      'Up to 60 seconds',
      'Professional editing',
      'Motion graphics & text',
      'Color grading',
      'Royalty-free music',
      '2 revision rounds'
    ],
    popular: true
  },
  {
    name: 'Brand Story',
    price: '£450',
    description: 'Tell your brand story with cinematic quality',
    features: [
      'Up to 3 minutes',
      'Scriptwriting assistance',
      'Advanced motion graphics',
      'Custom animations',
      'Sound design',
      'Unlimited revisions'
    ]
  },
  {
    name: 'Content Package',
    price: '£750',
    description: 'Monthly content for consistent social presence',
    features: [
      '4 videos per month',
      'Mixed formats (Reels, TikTok, YouTube)',
      'Thumbnail design',
      'Caption optimization',
      'Scheduling consultation',
      'Priority support'
    ]
  }
];

const services = [
  { name: 'Product Videos', desc: 'Showcase features and benefits' },
  { name: 'Social Media Content', desc: 'Reels, TikToks, YouTube Shorts' },
  { name: 'Motion Graphics', desc: 'Animated logos and infographics' },
  { name: 'AI Video Generation', desc: 'Unique content from text prompts' },
  { name: 'Video Editing', desc: 'Polish your raw footage' },
  { name: 'Color Grading', desc: 'Professional cinematic look' }
];

const tools = [
  { title: 'Video Library', href: '/video/library', icon: FiGrid },
  { title: 'Video Studio', href: '/video/editor/studio', icon: FiFilm },
  { title: 'Chaos Mixer', href: '/video/editor', icon: FiZap },
  { title: 'AI Generator', href: '/video/editor/generator', icon: FiEdit3 }
];

export default function VideoPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full py-24 px-4 md:px-8">

        {/* Hero Section */}
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex items-end gap-6 mb-8">
            <div className="p-4 bg-zinc-900 border border-zinc-800">
              <FiVideo className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">Video</h1>
              <p className="text-zinc-500 text-sm uppercase tracking-widest mt-1">Production Services</p>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl leading-relaxed">
            Professional video production for brands, creators, and businesses.
            From quick promos to full brand stories.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              href="/contact"
              className="px-8 py-4 text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-80"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Get Started
            </Link>
            <Link
              href="/video/library"
              className="px-8 py-4 border border-zinc-700 text-zinc-300 text-sm font-bold uppercase tracking-widest hover:border-white hover:text-white transition-colors flex items-center gap-2"
            >
              <FiPlay className="w-4 h-4" />
              View Portfolio
            </Link>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="mb-24">
          <h2 className="text-sm font-bold text-white mb-8 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
            What We Do
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-6 border border-zinc-800 bg-zinc-950 hover:border-zinc-600 transition-colors"
              >
                <h3 className="font-bold text-white mb-1">{service.name}</h3>
                <p className="text-sm text-zinc-500">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Packages */}
        <div className="mb-24">
          <h2 className="text-sm font-bold text-white mb-8 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
            Packages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`relative p-8 border ${pkg.popular
                  ? 'border-white'
                  : 'bg-zinc-950 border-zinc-800'
                  }`}
                style={pkg.popular ? { backgroundColor: '#fff' } : undefined}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-6 bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <FiStar className="w-3 h-3" /> Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className="text-xl font-bold uppercase tracking-wider mb-2"
                    style={pkg.popular ? { color: '#000' } : undefined}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={`text-sm mb-4 ${pkg.popular ? '' : 'text-zinc-500'}`}
                    style={pkg.popular ? { color: '#525252' } : undefined}
                  >
                    {pkg.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-4xl font-bold"
                      style={pkg.popular ? { color: '#000' } : undefined}
                    >
                      {pkg.price}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2 text-sm ${pkg.popular ? '' : 'text-zinc-400'}`}
                      style={pkg.popular ? { color: '#404040' } : undefined}
                    >
                      <FiCheck
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={pkg.popular ? { color: '#000' } : undefined}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block w-full py-3 text-center text-xs font-bold uppercase tracking-widest transition-colors ${pkg.popular
                    ? 'bg-black text-white hover:bg-zinc-800'
                    : 'bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-600'
                    }`}
                >
                  Get Quote
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-zinc-600 text-sm mt-6">
            Custom packages available. Contact us for enterprise pricing.
          </p>
        </div>

        {/* Tools Section */}
        <div className="mb-16">
          <h2 className="text-sm font-bold text-white mb-8 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
            Video Tools
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="p-4 border border-zinc-800 bg-zinc-950 hover:border-zinc-600 hover:bg-zinc-900 transition-all group flex items-center gap-3"
              >
                <tool.icon className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors uppercase tracking-wider">
                  {tool.title}
                </span>
                <FiArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 md:p-12 border border-zinc-800 bg-zinc-900/30 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">Ready to Create?</h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8">
            Let's discuss your video project. From concept to final delivery, we handle everything.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
            >
              Start a Project
            </Link>
            <Link
              href="/video/library"
              className="px-8 py-4 border border-zinc-700 text-zinc-300 text-sm font-bold uppercase tracking-widest hover:border-white hover:text-white transition-colors"
            >
              Browse Portfolio
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
