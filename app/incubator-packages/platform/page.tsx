"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const platformFeatures = [
  "252 pages",
  "97 API endpoints",
  "Multi-provider auth (Google, Twitter, Discord, GitHub, LinkedIn, HandCash, Yours)",
  "Admin dashboard with 16 modules",
  "User dashboard & profile management",
  "Token/Mint system with wallet integration",
  "AI agent & automation suite",
  "Video editor with export",
  "Boardroom/chat system",
  "Payment & wallet system",
  "KYC & compliance integration",
  "Full API infrastructure",
];

const options = [
  {
    slug: "cohort",
    name: "Cohort License",
    price: "£5,000",
    unit: "per cohort",
    monthly: "+ startup fees",
    description: "Pay per cohort. Each startup gets their own dashboard.",
    includes: [
      "Access for cohort duration (6 months)",
      "Up to 15 startups per cohort",
      "Individual startup dashboards",
      "Cohort analytics",
      "We maintain everything",
      "Onboarding support",
      "Renews per cohort",
    ],
    ideal: "Incubators testing the model or running multiple cohorts",
    highlight: false,
    cta: "License Cohort",
  },
  {
    slug: "managed",
    name: "Managed Platform",
    price: "£10,000",
    unit: "setup",
    monthly: "£1,000/mo",
    description: "We host and maintain everything. You focus on your startups.",
    includes: [
      "Dedicated instance",
      "Hosted & maintained by us",
      "All updates included",
      "Priority support",
      "Custom branding",
      "99.9% uptime SLA",
      "Monthly analytics reports",
    ],
    ideal: "Incubators who want hands-off operations",
    highlight: true,
    cta: "Get Started",
  },
  {
    slug: "license",
    name: "Platform License",
    price: "£25,000",
    unit: "one-time",
    description: "Own the entire platform outright. White-label ready, deploy anywhere.",
    includes: [
      "Full source code ownership",
      "All 252 pages & 97 APIs",
      "White-label ready",
      "1 month setup & customization",
      "Training session (2 hours)",
      "Documentation",
      "Deploy to your infrastructure",
    ],
    ideal: "Incubators who want full control and ownership",
    highlight: false,
    cta: "Buy Platform",
  },
];

const breakdown = [
  { category: "Core Website & Pages", value: "£4,100" },
  { category: "Branding & Design", value: "£850" },
  { category: "Authentication System (7 providers)", value: "£1,700" },
  { category: "Admin Dashboard (16 modules)", value: "£4,900" },
  { category: "User Dashboard & Portal", value: "£1,000" },
  { category: "Token/Mint System", value: "£2,600" },
  { category: "AI & Automation Suite", value: "£5,200" },
  { category: "Video Editor System", value: "£3,600" },
  { category: "Boardroom/Chat System", value: "£2,800" },
  { category: "E-commerce/Payments", value: "£1,200" },
  { category: "KYC & Compliance", value: "£900" },
  { category: "Content & Marketing Pages", value: "£2,300" },
  { category: "API Development (97 endpoints)", value: "£10,000" },
];

export default function PlatformPage() {
  const total = 41150;

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
            <Link
              href="/incubator-packages"
              className="text-xs text-gray-500 uppercase tracking-widest hover:text-gray-400 mb-4 inline-block"
            >
              ← Incubator Packages
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              PLATFORM
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
              The complete incubator infrastructure
            </p>
          </div>

          {/* Value Prop */}
          <div className="mb-12 p-6 border border-gray-800 bg-gray-900/20">
            <p className="text-lg text-gray-300 mb-4">
              Don&apos;t just use our services. Own the platform.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The same infrastructure powering b0ase.com — 81,000+ lines of production code,
              ready for your incubator. White-label it, customize it, make it yours.
            </p>
            <div className="flex flex-wrap gap-2">
              {platformFeatures.slice(0, 6).map((feature, i) => (
                <span key={i} className="px-3 py-1 text-xs border border-gray-800 text-gray-400">
                  {feature}
                </span>
              ))}
              <span className="px-3 py-1 text-xs border border-gray-800 text-gray-500">
                +6 more
              </span>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-6">
              Choose Your Model
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {options.map((option) => (
                <Link
                  key={option.name}
                  href={`/incubator-packages/platform/${option.slug}`}
                  className={`block p-6 border transition-all hover:border-gray-600 ${
                    option.highlight
                      ? "border-white bg-white/5"
                      : "border-gray-800 bg-black"
                  }`}
                >
                  {option.highlight && (
                    <div className="text-xs text-white bg-white/20 px-2 py-1 inline-block mb-4">
                      Recommended
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="text-3xl font-bold">{option.price}</div>
                    <div className="text-sm text-gray-500">{option.unit}</div>
                    {option.monthly && (
                      <div className="text-lg font-bold text-gray-400 mt-1">
                        {option.monthly}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                    {option.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">{option.description}</p>

                  <ul className="space-y-2 mb-6">
                    {option.includes.map((item, i) => (
                      <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-gray-600 mt-0.5">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-600 mb-4">
                      Ideal for: {option.ideal}
                    </p>
                    <span
                      className={`block text-center px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                        option.highlight
                          ? "bg-white text-black hover:bg-gray-200"
                          : "border border-gray-700 text-white hover:border-gray-500"
                      }`}
                    >
                      {option.cta}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-6">
              What&apos;s Included
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformFeatures.map((feature, i) => (
                <div key={i} className="p-4 border border-gray-800">
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-2">
              Build Cost Breakdown
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              What it would cost to build this from scratch using our rate card
            </p>
            <div className="border border-gray-800">
              <div className="grid grid-cols-12 px-4 py-2 border-b border-gray-800 bg-gray-900/30">
                <div className="col-span-8 text-xs text-gray-500 uppercase tracking-widest">
                  Category
                </div>
                <div className="col-span-4 text-xs text-gray-500 uppercase tracking-widest text-right">
                  Value
                </div>
              </div>
              {breakdown.map((item, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 px-4 py-3 border-b border-gray-800 last:border-b-0"
                >
                  <div className="col-span-8 text-sm text-gray-300">
                    {item.category}
                  </div>
                  <div className="col-span-4 text-sm text-right">
                    {item.value}
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 px-4 py-4 bg-gray-900/30">
                <div className="col-span-8 text-sm font-bold uppercase">
                  Total Build Cost
                </div>
                <div className="col-span-4 text-lg font-bold text-right">
                  £{total.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-6">
              Compare Options
            </h2>
            <div className="border border-gray-800 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/30">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-widest">Feature</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-widest">Cohort</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-widest">Managed</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 uppercase tracking-widest">License</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Own the code</td>
                    <td className="px-4 py-3 text-center text-gray-600">No</td>
                    <td className="px-4 py-3 text-center text-gray-600">No</td>
                    <td className="px-4 py-3 text-center text-green-500">Yes</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">We host & maintain</td>
                    <td className="px-4 py-3 text-center text-green-500">Yes</td>
                    <td className="px-4 py-3 text-center text-green-500">Yes</td>
                    <td className="px-4 py-3 text-center text-gray-600">No</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Updates included</td>
                    <td className="px-4 py-3 text-center text-green-500">Yes</td>
                    <td className="px-4 py-3 text-center text-green-500">Yes</td>
                    <td className="px-4 py-3 text-center text-gray-600">No</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Custom branding</td>
                    <td className="px-4 py-3 text-center text-gray-600">Limited</td>
                    <td className="px-4 py-3 text-center text-green-500">Yes</td>
                    <td className="px-4 py-3 text-center text-green-500">Yes</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Upfront cost</td>
                    <td className="px-4 py-3 text-center">£5,000</td>
                    <td className="px-4 py-3 text-center">£10,000</td>
                    <td className="px-4 py-3 text-center">£25,000</td>
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="px-4 py-3 text-gray-300">Monthly cost</td>
                    <td className="px-4 py-3 text-center">Per startup</td>
                    <td className="px-4 py-3 text-center">£1,000</td>
                    <td className="px-4 py-3 text-center text-gray-600">£0</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-300">Year 1 total</td>
                    <td className="px-4 py-3 text-center font-bold">£10,000*</td>
                    <td className="px-4 py-3 text-center font-bold">£22,000</td>
                    <td className="px-4 py-3 text-center font-bold">£25,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              * Cohort pricing assumes 2 cohorts/year. Startup automation fees additional.
            </p>
          </div>

          {/* CTA */}
          <div className="p-8 border border-gray-800 bg-gray-900/30 text-center">
            <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">
              Ready to power your incubator?
            </h3>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Let&apos;s discuss which model works best for your program.
              We can customize any option to fit your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors"
              >
                Schedule a Call
              </a>
              <Link
                href="/incubator-packages"
                className="px-8 py-4 border border-gray-700 text-white text-sm font-bold uppercase tracking-widest hover:border-gray-500 transition-colors"
              >
                View Startup Packages
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
