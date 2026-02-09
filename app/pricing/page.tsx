"use client";

import { motion } from "framer-motion";
import { pricingCategories } from "@/lib/pricing-data";

export default function PricingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <section className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Header */}
          <motion.div
            className="mb-12 border-b border-zinc-900 pb-4"
            variants={itemVariants}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
              PRICING
            </h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2 font-mono">
              Complete rate card · {pricingCategories.reduce((acc, cat) => acc + cat.items.length, 0)} services
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="flex flex-wrap gap-2 mb-12"
            variants={itemVariants}
          >
            {pricingCategories.map((cat, i) => (
              <a
                key={i}
                href={`#${cat.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-3 py-1 text-[10px] border border-zinc-900 text-zinc-500 hover:border-white hover:text-white hover:bg-zinc-900/50 transition-all font-mono uppercase tracking-tight"
              >
                {cat.category}
              </a>
            ))}
          </motion.div>

          {/* Pricing Tables */}
          {pricingCategories.map((category, i) => (
            <motion.div
              key={i}
              id={category.category.toLowerCase().replace(/\s+/g, '-')}
              className="mb-12"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-zinc-300">
                {category.category.replace(/\s+/g, '_')}
              </h2>
              <div className="border border-zinc-900">
                <div className="grid grid-cols-12 px-4 py-2 border-b border-zinc-900 bg-zinc-900/10">
                  <div className="col-span-6 text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
                    Service
                  </div>
                  <div className="col-span-3 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                    Price
                  </div>
                  <div className="col-span-3 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                    Unit
                  </div>
                </div>
                <div className="divide-y divide-zinc-900">
                  {category.items.map((item, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.05 }}
                      className="grid grid-cols-12 px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
                    >
                      <div className="col-span-6 text-sm text-zinc-400 group-hover:text-white transition-colors uppercase font-bold tracking-tight">
                        {item.service}
                      </div>
                      <div className="col-span-3 text-sm font-bold text-right font-mono text-zinc-300 group-hover:text-white">
                        {item.price}
                      </div>
                      <div className="col-span-3 text-[10px] text-zinc-600 text-right uppercase font-mono mt-1">
                        {item.unit}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Footer CTA */}
          <motion.div
            className="mt-16 pt-8 border-t border-zinc-900"
            variants={itemVariants}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-xs text-zinc-500 mb-2 font-mono uppercase">
                  All prices in GBP. VAT not included where applicable.
                </p>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tight">
                  Custom quotes available for large projects · Volume discounts for ongoing work
                </p>
              </div>
              <div className="flex gap-4">
                <a
                  href="/offers"
                  className="px-6 py-3 border border-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all font-mono"
                >
                  View Offers
                </a>
                <a
                  href="/contact"
                  className="px-6 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                >
                  Get Quote
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
