'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiHelpCircle, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface DataPoint {
  claim: string;
  source?: string;
  confidence: 'verified' | 'approximate' | 'inferred' | 'speculative';
}

const dataPoints: DataPoint[] = [
  {
    claim: "AI Forge is a 6-month AI accelerator program",
    source: "https://aiforge.org/program",
    confidence: 'verified'
  },
  {
    claim: "Program includes $100K in cloud credits (AWS, Google Cloud)",
    source: "https://aiforge.org/benefits",
    confidence: 'verified'
  },
  {
    claim: "Demo Day at end of program for portfolio companies to pitch investors",
    source: "https://aiforge.org/demo-day",
    confidence: 'verified'
  },
  {
    claim: "Annalise AI is a portfolio company (medical imaging diagnostics)",
    source: "https://aiforge.org/portfolio",
    confidence: 'verified'
  },
  {
    claim: "Focus on healthcare AI, fintech AI, and enterprise automation",
    source: "https://aiforge.org/focus-areas",
    confidence: 'verified'
  },
  {
    claim: "Mentor network includes AI researchers, startup founders, and enterprise CTOs",
    source: "https://aiforge.org/mentors",
    confidence: 'verified'
  },
  {
    claim: "Based in London with global remote participation options",
    source: "https://aiforge.org/apply",
    confidence: 'verified'
  },
  {
    claim: "46+ portfolio companies (exact number varies by source)",
    source: "Multiple portfolio pages, last updated 2025",
    confidence: 'approximate'
  },
  {
    claim: "Equity stake ranges from 6-10% depending on stage and program track",
    source: "Inferred from standard accelerator practices and industry benchmarks",
    confidence: 'inferred'
  },
  {
    claim: "Application volume ~200-500 per cohort",
    source: "Inferred from accelerator size and industry averages",
    confidence: 'inferred'
  },
  {
    claim: "Operational challenges with spreadsheet-based workflows",
    source: "Observed at meetup, common accelerator pain point",
    confidence: 'inferred'
  },
  {
    claim: "Team size of 5-10 people managing operations",
    source: "Inferred from accelerator scale and common team structures",
    confidence: 'inferred'
  },
  {
    claim: "Annalise AI needs improved diagnostic accuracy for rare conditions",
    source: "Speculative—based on medical AI industry challenges, not confirmed by Annalise",
    confidence: 'speculative'
  }
];

const confidenceColors = {
  verified: 'text-green-500 border-green-500',
  approximate: 'text-blue-500 border-blue-500',
  inferred: 'text-yellow-500 border-yellow-500',
  speculative: 'text-red-500 border-red-500'
};

const confidenceIcons = {
  verified: FiCheckCircle,
  approximate: FiAlertCircle,
  inferred: FiHelpCircle,
  speculative: FiZap
};

const confidenceDescriptions = {
  verified: "Publicly available information from official AI Forge sources",
  approximate: "Data from public sources but numbers may vary or be outdated",
  inferred: "Reasonable assumptions based on industry standards and accelerator best practices",
  speculative: "Educated guesses about specific problems—needs validation"
};

export default function ForgeData() {
  const grouped = {
    verified: dataPoints.filter(d => d.confidence === 'verified'),
    approximate: dataPoints.filter(d => d.confidence === 'approximate'),
    inferred: dataPoints.filter(d => d.confidence === 'inferred'),
    speculative: dataPoints.filter(d => d.confidence === 'speculative')
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full px-8 py-12">
        {/* Back Link */}
        <Link
          href="/offers/forge"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 font-mono text-sm"
        >
          <FiArrowLeft />
          Back to AI Forge Offer
        </Link>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Sources & Assumptions</h1>
          <p className="text-xl text-zinc-400 font-mono mb-8">
            What we know vs. what we're guessing about AI Forge
          </p>

          <div className="border-l-4 border-white bg-zinc-900/30 px-6 py-4">
            <p className="text-lg text-zinc-200 mb-4">
              <strong className="text-white">Transparency note:</strong> This offer was created using publicly available information
              about AI Forge plus reasonable assumptions based on standard accelerator operations.
            </p>
            <p className="text-sm text-zinc-400">
              Some claims are verified from official sources. Others are educated guesses. Below is the complete breakdown
              of what's real vs. what's assumed.
            </p>
          </div>
        </header>

        {/* Legend */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(confidenceDescriptions).map(([key, description]) => {
            const Icon = confidenceIcons[key as keyof typeof confidenceIcons];
            const colorClass = confidenceColors[key as keyof typeof confidenceColors];
            return (
              <div key={key} className={`border ${colorClass.split(' ')[1]} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={colorClass.split(' ')[0]} size={20} />
                  <h3 className="text-sm font-bold uppercase">{key}</h3>
                </div>
                <p className="text-xs text-zinc-400">{description}</p>
              </div>
            );
          })}
        </section>

        {/* Data Points */}
        <section className="space-y-12">
          {Object.entries(grouped).map(([confidenceLevel, points]) => {
            if (points.length === 0) return null;
            const Icon = confidenceIcons[confidenceLevel as keyof typeof confidenceIcons];
            const colorClass = confidenceColors[confidenceLevel as keyof typeof confidenceColors];

            return (
              <div key={confidenceLevel}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon className={colorClass.split(' ')[0]} size={24} />
                  <h2 className="text-2xl font-bold uppercase">
                    {confidenceLevel} ({points.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {points.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border ${colorClass.split(' ')[1]} border-opacity-30 bg-zinc-950 p-5`}
                    >
                      <p className="text-zinc-200 mb-2">{point.claim}</p>
                      {point.source && (
                        <p className="text-xs text-zinc-600 font-mono">
                          Source: {point.source}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Methodology */}
        <section className="mt-16 border border-zinc-900 p-8 bg-zinc-950">
          <h2 className="text-xl font-bold mb-6">How This Offer Was Created</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div>
              <h3 className="text-white font-bold mb-2">1. Public Research (Verified)</h3>
              <p>
                Reviewed https://aiforge.org, portfolio pages, public announcements, and social media posts to gather
                confirmed facts about the program structure, benefits, and portfolio companies.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">2. Industry Benchmarks (Inferred)</h3>
              <p>
                Applied standard accelerator practices (typical equity stakes, application volumes, team sizes) based on
                comparable programs like Y Combinator, Techstars, and other AI-focused accelerators.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">3. Problem Validation (Observed)</h3>
              <p>
                Attended AI Forge meetup where team members discussed operational challenges. The spreadsheet problem
                was explicitly mentioned as a pain point.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">4. Solution Design (Experience)</h3>
              <p>
                Proposed solutions (Airtable, custom dashboard, full platform) are based on 10+ years of building similar
                systems for accelerators, VCs, and portfolio management teams.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-900">
              <p className="text-zinc-500">
                <strong className="text-zinc-400">Bottom line:</strong> This is a real offer addressing real problems,
                but some details (like exact equity percentages or application volumes) are educated guesses until
                validated with the AI Forge team.
              </p>
            </div>
          </div>
        </section>

        {/* Validation Needed */}
        <section className="mt-12 border-l-4 border-red-500 bg-zinc-950 px-6 py-4">
          <h2 className="text-lg font-bold mb-3 text-red-500">What Needs Validation</h2>
          <ul className="space-y-2 text-sm text-zinc-300">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">?</span>
              <span>Exact equity stake taken by AI Forge (assumed 6-10%, industry standard)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">?</span>
              <span>Current application volume per cohort (assumed 200-500 based on accelerator size)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">?</span>
              <span>Team size and current tool stack (assumed 5-10 people using spreadsheets)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">?</span>
              <span>Specific pain points with Annalise AI or other portfolio companies (speculative)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">?</span>
              <span>Budget available for operational tooling (unknown, pricing based on standard rates)</span>
            </li>
          </ul>
          <p className="text-xs text-zinc-600 mt-4">
            These details would be confirmed in a 30-minute discovery call before any work begins.
          </p>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            Book Discovery Call
          </Link>
          <p className="text-xs text-zinc-600 mt-4 font-mono">Let's validate assumptions and scope the real problem</p>
        </section>
      </div>
    </div>
  );
}
