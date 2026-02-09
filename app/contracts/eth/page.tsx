"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiSearch, FiArrowLeft } from "react-icons/fi";
import { pricingCategories } from "@/lib/pricing-data";
import { getContractTitle } from "@/lib/contract-titles";
import { convertToCrypto, getBlockchainMeta } from "@/lib/crypto-pricing";

// Convert pricing data to ETH pricing
const contracts = pricingCategories.flatMap(category =>
  category.items.map(item => {
    const categorySlug = category.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const serviceSlug = item.service.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      id: `${categorySlug}-${serviceSlug}`,
      title: getContractTitle(item.service),
      service: item.service,
      price: convertToCrypto(item.price, 'ETH'),
      gbpPrice: item.price,
      unit: item.unit,
      category: category.category,
      featured: false,
    };
  })
);

const categories = [
  "All",
  ...pricingCategories.map(cat => cat.category)
];

const blockchainMeta = getBlockchainMeta('ETH');

export default function ETHContractsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Group contracts by category for table display
  const groupedContracts = selectedCategory === "All"
    ? pricingCategories.map(cat => ({
        category: cat.category,
        items: cat.items.map(item => {
          const categorySlug = cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const serviceSlug = item.service.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return {
            id: `${categorySlug}-${serviceSlug}`,
            title: getContractTitle(item.service),
            service: item.service,
            price: convertToCrypto(item.price, 'ETH'),
            gbpPrice: item.price,
            unit: item.unit,
          };
        }).filter(item =>
          !searchQuery ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.service.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(group => group.items.length > 0)
    : pricingCategories
        .filter(cat => cat.category === selectedCategory)
        .map(cat => ({
          category: cat.category,
          items: cat.items.map(item => {
            const categorySlug = cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const serviceSlug = item.service.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return {
              id: `${categorySlug}-${serviceSlug}`,
              title: getContractTitle(item.service),
              service: item.service,
              price: convertToCrypto(item.price, 'ETH'),
              gbpPrice: item.price,
              unit: item.unit,
            };
          }).filter(item =>
            !searchQuery ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.service.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        })).filter(group => group.items.length > 0);

  const totalContracts = groupedContracts.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Back Link */}
          <Link
            href="/contracts"
            className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-white mb-8 font-mono uppercase transition-colors"
          >
            <FiArrowLeft /> All Contracts
          </Link>

          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">
              {blockchainMeta.name} CONTRACTS
            </h1>
            <p className="text-xs text-blue-500 uppercase tracking-widest mt-2 font-mono">
              {blockchainMeta.tagline}
            </p>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-mono">
              {contracts.length} services · Priced in ETH
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-[10px] border transition-all font-mono uppercase tracking-tight ${
                  selectedCategory === cat
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-zinc-900 text-zinc-500 hover:border-blue-500 hover:text-blue-500 hover:bg-zinc-900/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH SERVICES..."
              className="w-full bg-zinc-950 border border-zinc-900 text-white pl-12 pr-4 py-3 text-sm font-mono uppercase tracking-wide focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Multi-chain links */}
          <div className="mb-6 text-xs text-zinc-600 font-mono uppercase flex items-center justify-between">
            <span>Showing {totalContracts} contract{totalContracts !== 1 ? 's' : ''}</span>
            <div className="flex gap-2">
              <Link href="/contracts" className="text-white hover:text-zinc-400 transition-colors">
                ← GBP
              </Link>
              <span className="text-zinc-800">|</span>
              <Link href="/contracts/bsv" className="text-yellow-500 hover:text-yellow-400 transition-colors">
                BSV →
              </Link>
              <span className="text-zinc-800">|</span>
              <span className="text-blue-500">ETH</span>
              <span className="text-zinc-800">|</span>
              <Link href="/contracts/sol" className="text-purple-500 hover:text-purple-400 transition-colors">
                SOL →
              </Link>
            </div>
          </div>

          {/* Contract Tables */}
          {groupedContracts.map((group, i) => (
            <motion.div
              key={i}
              id={group.category.toLowerCase().replace(/\s+/g, '-')}
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-zinc-300">
                {group.category.replace(/\s+/g, '_')}
              </h2>
              <div className="border border-zinc-900">
                <div className="grid grid-cols-12 px-4 py-2 border-b border-zinc-900 bg-zinc-900/10">
                  <div className="col-span-6 text-[10px] text-zinc-600 uppercase tracking-widest font-mono font-bold">
                    Contract
                  </div>
                  <div className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                    ETH Price
                  </div>
                  <div className="col-span-1 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                    GBP
                  </div>
                  <div className="col-span-3 text-[10px] text-zinc-600 uppercase tracking-widest text-right font-mono font-bold">
                    Action
                  </div>
                </div>
                <div className="divide-y divide-zinc-900">
                  {group.items.map((item, j) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.02 }}
                      className="grid grid-cols-12 px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
                    >
                      <div className="col-span-6 text-sm text-zinc-400 group-hover:text-white transition-colors uppercase font-bold tracking-tight">
                        {item.title}
                      </div>
                      <div className="col-span-2 text-sm font-bold text-right font-mono text-blue-500 group-hover:text-blue-400">
                        {item.price}
                      </div>
                      <div className="col-span-1 text-xs text-right font-mono text-zinc-600">
                        {item.gbpPrice}
                      </div>
                      <div className="col-span-3 text-right">
                        <Link
                          href={`/contracts/${item.id}`}
                          className="inline-block px-3 py-1 text-[10px] border border-zinc-800 text-zinc-500 hover:border-blue-500 hover:text-blue-500 transition-all font-mono uppercase"
                        >
                          View Contract →
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-zinc-900">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-xs text-zinc-500 mb-2 font-mono uppercase">
                  All contracts on Ethereum. DeFi native.
                </p>
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tight">
                  Smart contracts · Global liquidity · Verifiable delivery
                </p>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/contracts"
                  className="px-6 py-3 border border-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all font-mono"
                >
                  View All Chains
                </Link>
                <a
                  href="mailto:richard@b0ase.com"
                  className="px-6 py-3 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-400 transition-all font-mono"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
