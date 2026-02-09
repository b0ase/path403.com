"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const monthlyTiers = [
  {
    name: "Essential",
    price: "£99",
    description: "Basic automation",
    includes: ["AI agent OR Social automation", "Basic support", "Monthly updates"],
    highlight: false,
  },
  {
    name: "Standard",
    price: "£199",
    description: "Full automation",
    includes: ["AI agent + Social automation", "Priority support", "Weekly updates", "Analytics reports"],
    highlight: true,
  },
  {
    name: "Premium",
    price: "£299",
    description: "Full automation + media",
    includes: ["AI agent + Social automation", "Image/video/audio generation", "24/7 support", "Custom integrations"],
    highlight: false,
  },
];

const phaseNames: Record<string, string> = {
  'foundation': 'Foundation',
  'identity': 'Identity',
  'fundraising': 'Fundraising',
  'scale': 'Scale',
  'series-a': 'Series A',
  'tokenize': 'Tokenize',
};

interface PackagePageProps {
  pkg: {
    name: string;
    price: string;
    timing: string;
    phaseNumber: number;
    description: string;
    includes: { item: string; value: string }[];
    addOns: { item: string; price: string }[];
    tag: string | null;
    nextPhase: string | null;
    prevPhase: string | null;
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
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                Phase {pkg.phaseNumber} · {pkg.timing}
              </span>
              {pkg.tag && (
                <span className="px-2 py-1 text-xs bg-white text-black">
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
            <span className="text-2xl text-gray-600 ml-4">+ monthly automation</span>
          </div>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12">
            {pkg.description}
          </p>

          {/* Phase Navigation */}
          <div className="flex gap-4 mb-12">
            {pkg.prevPhase && (
              <Link
                href={`/incubator-packages/${pkg.prevPhase}`}
                className="px-4 py-2 border border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-widest hover:border-gray-600 transition-colors"
              >
                ← {phaseNames[pkg.prevPhase]}
              </Link>
            )}
            {pkg.nextPhase && (
              <Link
                href={`/incubator-packages/${pkg.nextPhase}`}
                className="px-4 py-2 border border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-widest hover:border-gray-600 transition-colors"
              >
                {phaseNames[pkg.nextPhase]} →
              </Link>
            )}
          </div>

          {/* What's Included */}
          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              What&apos;s Included in This Phase
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

          {/* Monthly Automation Tiers */}
          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
              Monthly Automation
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Required: keeps your AI agent and social media running autonomously
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-5 border transition-all ${
                    tier.highlight
                      ? "border-white bg-white/5"
                      : "border-gray-800 bg-black"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-2xl font-bold">{tier.price}</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </div>
                    {tier.highlight && (
                      <span className="px-2 py-1 text-xs bg-white text-black">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-2">
                    {tier.name}
                  </h3>
                  <ul className="space-y-1">
                    {tier.includes.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-gray-400 text-xs flex items-center gap-2">
                        <span className="text-gray-600">+</span> {item}
                      </li>
                    ))}
                  </ul>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a
              href="/contact"
              className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors text-center"
            >
              Start Phase {pkg.phaseNumber}
            </a>
            <a
              href="/incubator-packages"
              className="px-8 py-4 bg-transparent border border-gray-800 text-white text-sm font-bold uppercase tracking-widest hover:border-gray-600 transition-colors text-center"
            >
              View All Phases
            </a>
          </div>

          {/* Next Phase */}
          {pkg.nextPhase && (
            <div className="mb-12 p-6 border border-gray-800 bg-gray-900/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                    Next Phase
                  </span>
                  <p className="text-gray-400 mt-1">
                    After {pkg.name}, continue with {phaseNames[pkg.nextPhase]} to keep building
                  </p>
                </div>
                <Link
                  href={`/incubator-packages/${pkg.nextPhase}`}
                  className="px-6 py-3 border border-gray-700 text-white text-xs font-bold uppercase tracking-widest hover:border-gray-500 transition-colors whitespace-nowrap"
                >
                  View {phaseNames[pkg.nextPhase]} →
                </Link>
              </div>
            </div>
          )}

          {/* Completed Journey */}
          {!pkg.nextPhase && (
            <div className="mb-12 p-6 border border-white/20 bg-white/5">
              <div className="text-center">
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                  Final Phase
                </span>
                <p className="text-gray-300 mt-2">
                  Tokenize is the culmination of the journey. Your equity is now on-chain, compliant, and ready for global investors.
                </p>
              </div>
            </div>
          )}

          {/* Trust */}
          <div className="pt-8 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Each phase builds on the last · No overlap · No wasted spend · richard@b0ase.com
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
