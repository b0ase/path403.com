"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const packages = [
  {
    slug: "starter",
    name: "Starter",
    price: "£499",
    monthly: null,
    description: "Everything you need to get online",
    includes: ["Landing page", "Logo design", "Basic SEO", "Contact form"],
    tag: "Most Popular",
  },
  {
    slug: "ai-agent",
    name: "AI Agent",
    price: "£800",
    monthly: "£99/mo",
    description: "Custom AI agent with ongoing maintenance",
    includes: ["Custom AI agent", "Knowledge base", "Web widget", "Monthly maintenance"],
    tag: null,
  },
  {
    slug: "ai-twitter",
    name: "AI + Twitter",
    price: "£800",
    monthly: "£199/mo",
    description: "AI agent with Twitter automation",
    includes: ["Custom AI agent", "Twitter automation", "Auto-replies", "API access included"],
    tag: "Automation",
  },
  {
    slug: "growth",
    name: "Growth",
    price: "£1,499",
    monthly: null,
    description: "Scale your digital presence",
    includes: ["5-page website", "SEO optimization", "Social media setup", "Email marketing", "Analytics"],
    tag: null,
  },
  {
    slug: "ecommerce",
    name: "E-Commerce",
    price: "£2,999",
    monthly: null,
    description: "Complete online store solution",
    includes: ["Shopify/WooCommerce setup", "Product pages", "Payment integration", "Inventory system", "Training"],
    tag: null,
  },
  {
    slug: "token-launch",
    name: "Token Launch",
    price: "£3,499",
    monthly: null,
    description: "Full blockchain token deployment",
    includes: ["Token contract", "Website", "Whitepaper", "Tokenomics", "Exchange listing", "Community setup"],
    tag: "Crypto",
  },
];

export default function PackagesPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <section className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Header */}
          <div className="mb-12 border-b border-gray-800 pb-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              PACKAGES
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
              Bundled solutions
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Link
                key={pkg.slug}
                href={`/packages/${pkg.slug}`}
                className="block p-6 border border-gray-800 hover:border-gray-600 bg-black hover:bg-gray-900/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-3xl font-bold">{pkg.price}</div>
                    {pkg.monthly && (
                      <div className="text-sm text-gray-400">+ {pkg.monthly}</div>
                    )}
                  </div>
                  {pkg.tag && (
                    <span className="px-2 py-1 text-xs bg-white text-black">
                      {pkg.tag}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold uppercase tracking-tight mb-2">
                  {pkg.name}
                </h2>
                <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                <ul className="space-y-1">
                  {pkg.includes.slice(0, 4).map((item, i) => (
                    <li key={i} className="text-gray-400 text-xs flex items-center gap-2">
                      <span className="text-gray-600">+</span> {item}
                    </li>
                  ))}
                  {pkg.includes.length > 4 && (
                    <li className="text-gray-600 text-xs">
                      +{pkg.includes.length - 4} more
                    </li>
                  )}
                </ul>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Need something custom? We can build a package for you.
            </p>
            <a
              href="/contact"
              className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Get Custom Quote
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
