"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const phases = [
  {
    slug: "foundation",
    name: "Foundation",
    price: "£500",
    timing: "Month 1-2",
    description: "Get online with a professional presence",
    includes: ["Landing page", "Logo design", "Basic SEO setup", "Contact form", "Hosting (1 year)"],
    tag: "Start Here",
  },
  {
    slug: "identity",
    name: "Identity",
    price: "£400",
    timing: "Month 3-4",
    description: "Establish your brand across all touchpoints",
    includes: ["Brand guidelines", "Social media kit", "Business cards", "Email signature", "Favicon & icons"],
    tag: null,
  },
  {
    slug: "fundraising",
    name: "Fundraising",
    price: "£750",
    timing: "Month 5-6",
    description: "Everything you need to raise your seed round",
    includes: ["Pitch deck", "One-pager", "Data room setup", "Investor CRM", "Financial model template"],
    tag: "Raising",
  },
  {
    slug: "scale",
    name: "Scale",
    price: "£1,000",
    timing: "Month 7-9",
    description: "Full marketing infrastructure to acquire customers",
    includes: ["5-page website", "SEO optimization", "Email marketing", "Analytics dashboard", "Content strategy"],
    tag: null,
  },
  {
    slug: "series-a",
    name: "Series A",
    price: "£1,500",
    timing: "Month 10-12",
    description: "Sophisticated IR for institutional investors",
    includes: ["Cap table visualization", "Board deck template", "Press kit", "Investor updates", "Metrics dashboard"],
    tag: null,
  },
  {
    slug: "tokenize",
    name: "Tokenize",
    price: "£3,000",
    timing: "Month 13+",
    description: "Tokenize equity and launch on-chain",
    includes: ["Token contract", "Whitepaper", "Tokenomics design", "KYC integration", "Exchange listing support"],
    tag: "Equity",
  },
];

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

export default function PackagesPage() {
  const totalSetup = phases.reduce((sum, p) => sum + parseInt(p.price.replace(/[£,]/g, '')), 0);

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
              INCUBATOR PACKAGES
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
              Startup infrastructure · 6 phases · No overlap
            </p>
          </div>

          {/* Value Prop */}
          <div className="mb-12 p-6 border border-gray-800 bg-gray-900/20">
            <p className="text-lg text-gray-300 mb-2">
              We grow with you. Each phase builds on the last.
            </p>
            <p className="text-sm text-gray-500">
              No duplication. No wasted spend. Start with Foundation, progress through each phase as you scale.
              Full journey: £{totalSetup.toLocaleString()} setup + monthly automation.
            </p>
          </div>

          {/* Journey Timeline */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300">
                The Journey
              </h2>
              <span className="text-xs text-gray-600 uppercase tracking-widest">6 Phases</span>
            </div>

            {/* Timeline visualization for large screens */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center justify-between px-4">
                {phases.map((phase, i) => (
                  <div key={phase.slug} className="flex items-center">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 uppercase tracking-widest">{phase.timing}</div>
                    </div>
                    {i < phases.length - 1 && (
                      <div className="w-12 xl:w-20 h-px bg-gray-800 mx-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {phases.map((phase, index) => (
                <Link
                  key={phase.slug}
                  href={`/incubator-packages/${phase.slug}`}
                  className="block p-6 border border-gray-800 hover:border-gray-600 bg-black hover:bg-gray-900/50 transition-all relative"
                >
                  {/* Phase number */}
                  <div className="absolute top-4 right-4 text-4xl font-bold text-gray-900">
                    {index + 1}
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="text-2xl font-bold">{phase.price}</div>
                    {phase.tag && (
                      <span className="px-2 py-1 text-xs bg-white text-black">
                        {phase.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 uppercase tracking-widest mb-1 lg:hidden">
                    {phase.timing}
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
                    {phase.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{phase.description}</p>
                  <ul className="space-y-1">
                    {phase.includes.slice(0, 3).map((item, i) => (
                      <li key={i} className="text-gray-400 text-xs flex items-center gap-2">
                        <span className="text-gray-600">+</span> {item}
                      </li>
                    ))}
                    {phase.includes.length > 3 && (
                      <li className="text-gray-600 text-xs">
                        +{phase.includes.length - 3} more
                      </li>
                    )}
                  </ul>
                </Link>
              ))}
            </div>
          </div>

          {/* Monthly Automation Tiers */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300">
                Monthly Automation
              </h2>
              <span className="text-xs text-gray-600 uppercase tracking-widest">Required</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Your AI agent and social media run autonomously. Choose your tier:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {monthlyTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`p-6 border transition-all ${
                    tier.highlight
                      ? "border-white bg-white/5"
                      : "border-gray-800 bg-black"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-3xl font-bold">{tier.price}</div>
                      <div className="text-sm text-gray-500">/month</div>
                    </div>
                    {tier.highlight && (
                      <span className="px-2 py-1 text-xs bg-white text-black">
                        Most Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">{tier.description}</p>
                  <ul className="space-y-1">
                    {tier.includes.map((item, i) => (
                      <li key={i} className="text-gray-400 text-xs flex items-center gap-2">
                        <span className="text-gray-600">+</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Incubator Pricing */}
          <div className="mb-16 p-8 border border-gray-800 bg-gray-900/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-2">
                  Incubators & Cohorts
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  6-month program: Foundation + Identity + Fundraising = £1,650/startup
                </p>
                <p className="text-xs text-gray-600">
                  10 startups × (£1,650 + £199/mo × 6) = £28,440 total · 20% off for 10+ startups
                </p>
              </div>
              <a
                href="/contact"
                className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Get Cohort Pricing
              </a>
            </div>
          </div>

          {/* Platform License */}
          <div className="mb-16 p-8 border border-white/20 bg-white/5">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest">For Incubators</span>
                <h3 className="text-xl font-bold uppercase tracking-tight mb-2 mt-1">
                  Own The Platform
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  License the entire b0ase.com infrastructure for your incubator.
                </p>
                <p className="text-xs text-gray-600">
                  252 pages · 97 API endpoints · 81,000+ lines of production code · White-label ready
                </p>
              </div>
              <Link
                href="/incubator-packages/platform"
                className="px-6 py-3 border border-white text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors whitespace-nowrap"
              >
                View Platform Options
              </Link>
            </div>
          </div>

          {/* Journey Math */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-6">
              Full Journey
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                  6-Month Incubator
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Foundation + Identity + Fundraising</span>
                    <span>£1,650</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Standard automation × 6</span>
                    <span>£1,194</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-800 pt-2 font-bold">
                    <span>Total</span>
                    <span>£2,844</span>
                  </div>
                </div>
              </div>
              <div className="p-6 border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                  18-Month Full Journey
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">All 6 phases</span>
                    <span>£7,150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Standard automation × 18</span>
                    <span>£3,582</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-800 pt-2 font-bold">
                    <span>Total</span>
                    <span>£10,732</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300 mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-gray-800 mb-2">01</div>
                <h3 className="text-sm font-bold uppercase tracking-tight mb-2">Start Foundation</h3>
                <p className="text-xs text-gray-500">
                  Get online with landing page, logo, and basic presence. Pick your monthly automation tier.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-800 mb-2">02</div>
                <h3 className="text-sm font-bold uppercase tracking-tight mb-2">Progress Through Phases</h3>
                <p className="text-xs text-gray-500">
                  Each phase builds on the last. No overlap, no wasted spend. Upgrade when you&apos;re ready.
                </p>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-800 mb-2">03</div>
                <h3 className="text-sm font-bold uppercase tracking-tight mb-2">Scale Together</h3>
                <p className="text-xs text-gray-500">
                  We become your infrastructure. From pre-seed to tokenized equity, we grow with you.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Questions? Let&apos;s talk about where you are in the journey.
            </p>
            <a
              href="/contact"
              className="px-6 py-3 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-colors"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              Get Started
            </a>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
