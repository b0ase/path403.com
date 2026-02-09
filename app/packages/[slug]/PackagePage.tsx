"use client";

import { motion } from "framer-motion";

interface PackagePageProps {
  pkg: {
    name: string;
    price: string;
    monthly: string | null;
    description: string;
    includes: { item: string; value: string }[];
    addOns: { item: string; price: string }[];
    tag: string | null;
  };
  slug: string;
}

export default function PackagePage({ pkg, slug }: PackagePageProps) {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                Package
              </span>
              {pkg.tag && (
                <span className="ml-4 px-2 py-1 text-xs bg-white text-black">
                  {pkg.tag}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none mb-6 uppercase">
            {pkg.name}
          </h1>

          <div className="flex items-baseline gap-4 mb-8 border-b border-gray-800 pb-8">
            <span className="text-6xl md:text-8xl font-bold">{pkg.price}</span>
            <span className="text-xl text-gray-500">one-time</span>
            {pkg.monthly && (
              <>
                <span className="text-3xl md:text-4xl font-bold ml-4">+ {pkg.monthly}</span>
                <span className="text-xl text-gray-500">ongoing</span>
              </>
            )}
          </div>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12">
            {pkg.description}
          </p>

          {/* What's Included */}
          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              What's Included
            </h2>
            <div className="border border-gray-800">
              {pkg.includes.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-4 border-b border-gray-800 last:border-b-0"
                >
                  <span className="text-white font-medium">{item.item}</span>
                  <span className="text-gray-500 text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              Optional Add-ons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pkg.addOns.map((addon, i) => (
                <div
                  key={i}
                  className="p-4 border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  <div className="text-lg font-bold mb-1">{addon.price}</div>
                  <div className="text-gray-400 text-sm">{addon.item}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors text-center"
            >
              Get This Package
            </a>
            <a
              href="/packages"
              className="px-8 py-4 bg-transparent border border-gray-800 text-white text-sm font-bold uppercase tracking-widest hover:border-gray-600 transition-colors text-center"
            >
              View All Packages
            </a>
          </div>

          {/* Trust */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Satisfaction guaranteed · Flexible payment options · richard@b0ase.com
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
