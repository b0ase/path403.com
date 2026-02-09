"use client";

import { motion } from "framer-motion";

interface OfferPageProps {
  offer: {
    title: string;
    displayTitle: string;
    price: string;
    priceLabel: string;
    subtitle: string;
    description: string;
    features: string[];
    cta: { href: string; label: string };
    trustBadge: string;
  };
  slug: string;
}

export default function OfferPage({ offer, slug }: OfferPageProps) {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="w-full">
          <div className="mb-8">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              {offer.subtitle}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none mb-6">
            {offer.displayTitle}
          </h1>

          <div className="flex items-baseline gap-4 mb-8 border-b border-gray-800 pb-8">
            <span className="text-6xl md:text-8xl font-bold">{offer.price}</span>
            <span className="text-xl text-gray-500">{offer.priceLabel}</span>
          </div>

          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12">
            {offer.description}
          </p>

          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offer.features.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 border-b border-gray-800"
                >
                  <span className="text-white">+</span>
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="px-8 py-4 text-sm font-bold uppercase tracking-widest hover:opacity-80 transition-colors text-center"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Get Started
            </a>
            <a
              href={offer.cta.href}
              className="px-8 py-4 bg-transparent border border-gray-800 text-white text-sm font-bold uppercase tracking-widest hover:border-gray-600 transition-colors text-center"
            >
              {offer.cta.label}
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              {offer.trustBadge}
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
