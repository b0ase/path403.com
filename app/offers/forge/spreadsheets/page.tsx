'use client';

import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiTable, FiZap, FiTool, FiSend } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Solution {
  name: string;
  price: string;
  timeline: string;
  icon: React.ElementType;
  description: string;
  whatYouGet: string[];
  bestFor: string;
  notGoodFor: string;
  technicalDetails: string[];
}

const solutions: Solution[] = [
  {
    name: "Quick Fix",
    price: "£2,500",
    timeline: "1 week",
    icon: FiZap,
    description: "Replace your spreadsheets with Airtable + no-code automation. Get 80% of the value in 20% of the time.",
    whatYouGet: [
      "Airtable base with 6 core tables (Applicants, Portfolios, Equity, Resources, Demo Day, Mentors)",
      "Custom views for different team members (accelerator manager, finance, mentors)",
      "Basic automation (email notifications, status updates, reminders)",
      "CSV import scripts for existing spreadsheet data",
      "2 hours of training + documentation",
      "30 days of email support"
    ],
    bestFor: "Immediate pain relief. You need it working this month.",
    notGoodFor: "Long-term scalability. You'll outgrow it in 12-18 months.",
    technicalDetails: [
      "Airtable Pro plan setup (you pay monthly fee ~£20/month)",
      "Zapier automation workflows (5 automations included)",
      "No custom code - entirely no-code solution",
      "Data migration from Excel/Google Sheets"
    ]
  },
  {
    name: "Proper Solution",
    price: "£8,000",
    timeline: "3 weeks",
    icon: FiTool,
    description: "Custom Next.js dashboard built for AI Forge's exact workflow. Scales with you, fully white-labeled.",
    whatYouGet: [
      "Custom web application (aiforge-admin.b0ase.com or your domain)",
      "PostgreSQL database with proper schema design",
      "6 core modules: Applicant Pipeline, Portfolio Tracker, Cap Table, Resource Manager, Demo Day Planner, Mentor Matcher",
      "User authentication (multiple team members, role-based access)",
      "CSV export for all data",
      "Email notifications via SendGrid",
      "Hosted on Railway (£30-50/month, you pay directly)",
      "3 months of bug fixes + updates",
      "Full documentation + codebase handover"
    ],
    bestFor: "Professional operations. You want this to work for 3-5 years.",
    notGoodFor: "Complex integrations with existing tools. This is standalone.",
    technicalDetails: [
      "Next.js 15 + TypeScript + Tailwind CSS",
      "PostgreSQL database (Supabase or Railway)",
      "Prisma ORM for type-safe database access",
      "NextAuth for authentication",
      "Deployed on Railway or Vercel",
      "Source code provided (MIT license)",
      "Can be extended by any developer in future"
    ]
  },
  {
    name: "Nuclear Option",
    price: "£18,000",
    timeline: "6 weeks",
    icon: FiSend,
    description: "Full platform with AI-powered features, public-facing pages, integrations, and automation. This is a product.",
    whatYouGet: [
      "Everything in Proper Solution +",
      "Public-facing application portal (applicants apply online, not via email)",
      "AI-powered application screening (auto-score applications, flag red flags)",
      "Integration with LinkedIn, Crunchbase, Companies House for portfolio data enrichment",
      "Automated equity tracking with cap table waterfall modeling",
      "Mentor matching algorithm (based on expertise, availability, portfolio needs)",
      "Demo Day logistics (pitch scheduler, investor invites, live voting)",
      "Analytics dashboard (application conversion rates, portfolio performance, etc.)",
      "Mobile-responsive design",
      "6 months of support + feature updates",
      "Training for entire team"
    ],
    bestFor: "Making AI Forge look like a top-tier accelerator. This is venture-grade infrastructure.",
    notGoodFor: "Bootstrapped budgets. This is serious money.",
    technicalDetails: [
      "All tech from Proper Solution +",
      "OpenAI API integration for application screening",
      "Enrichment APIs (Clearbit, LinkedIn Sales Navigator)",
      "Calendar integration (Google Calendar, Outlook)",
      "Email automation (SendGrid + custom templates)",
      "Webhook integrations for Slack, Discord",
      "Advanced analytics (Mixpanel or custom)",
      "Comprehensive test suite",
      "CI/CD pipeline",
      "Staging + production environments"
    ]
  }
];

const problems = [
  {
    problem: "Applicant Pipeline",
    current: "Spreadsheet with 200+ rows, manual filtering, lost emails, no status tracking",
    afterFix: "Structured pipeline with stages, email automation, search & filtering, activity log"
  },
  {
    problem: "Portfolio Tracking",
    current: "Google Sheet updated quarterly, data goes stale, no single source of truth",
    afterFix: "Live dashboard, auto-enrichment from public sources, milestone tracking, alerts"
  },
  {
    problem: "Equity Records",
    current: "Excel with formulas that break, no version history, manual cap table calculations",
    afterFix: "Database-backed cap table, automatic percentage calculations, change history, waterfall modeling"
  },
  {
    problem: "Resource Allocation",
    current: "WhatsApp + email + memory, mentors don't know who they're assigned to",
    afterFix: "Assignment dashboard, mentor availability calendar, auto-matching to portfolio needs"
  },
  {
    problem: "Demo Day Logistics",
    current: "Multiple spreadsheets, pitch order manually decided, investor RSVPs in email",
    afterFix: "Pitch scheduler, investor portal, live voting/feedback, agenda generator"
  },
  {
    problem: "Data Integrity",
    current: "People edit cells they shouldn't, formulas get deleted, no backups",
    afterFix: "Role-based access, audit logs, automated backups, input validation"
  }
];

export default function ForgeSpreadsheets() {
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
          <div className="flex items-start gap-6 mb-8">
            <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <FiTable size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Spreadsheet Problem</h1>
              <p className="text-xl text-zinc-400 font-mono">
                Everything is in Excel. It's fragile, slow, and doesn't scale.
              </p>
            </div>
          </div>

          <div className="border-l-4 border-white bg-zinc-900/30 px-6 py-4">
            <p className="text-lg text-zinc-200">
              <strong className="text-white">Real problem identified at AI Forge meetup:</strong> "Everything is handled using spreadsheets."
              Applicant tracking, portfolio management, equity records, resource allocation, Demo Day logistics—all in Excel.
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              This works until you have 50+ applicants, 10+ portfolio companies, and 3 team members editing the same sheet.
              Then it breaks.
            </p>
          </div>
        </header>

        {/* Problems Table */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 border-b border-zinc-800 pb-3">What's Actually Broken</h2>
          <div className="space-y-6">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-zinc-900 p-6"
              >
                <h3 className="text-lg font-bold mb-4">{item.problem}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Current Reality</p>
                    <p className="text-sm text-zinc-400">{item.current}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">After Fix</p>
                    <p className="text-sm text-zinc-300">{item.afterFix}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Solutions */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 border-b border-zinc-800 pb-3">3 Ways to Fix This</h2>
          <div className="space-y-12">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="border-2 border-zinc-900 hover:border-zinc-700 transition-all"
                >
                  {/* Solution Header */}
                  <div className="bg-zinc-950 border-b border-zinc-900 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Icon size={32} className="text-white" />
                        <div>
                          <h3 className="text-2xl font-bold">{solution.name}</h3>
                          <p className="text-sm text-zinc-500 font-mono">{solution.timeline}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{solution.price}</p>
                        <p className="text-xs text-zinc-600">Fixed price</p>
                      </div>
                    </div>
                    <p className="text-zinc-300">{solution.description}</p>
                  </div>

                  {/* Solution Details */}
                  <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm text-zinc-500 uppercase tracking-wider mb-4">What You Get</h4>
                      <ul className="space-y-2">
                        {solution.whatYouGet.map((item, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-white mt-1">+</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 pt-6 border-t border-zinc-900">
                        <h4 className="text-sm text-zinc-500 uppercase tracking-wider mb-3">Technical Details</h4>
                        <ul className="space-y-1">
                          {solution.technicalDetails.map((detail, i) => (
                            <li key={i} className="text-xs text-zinc-500 font-mono">
                              → {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <div className="mb-6">
                        <h4 className="text-sm text-green-500 uppercase tracking-wider mb-2">Best For</h4>
                        <p className="text-sm text-zinc-300">{solution.bestFor}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-red-500 uppercase tracking-wider mb-2">Not Good For</h4>
                        <p className="text-sm text-zinc-300">{solution.notGoodFor}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Recommendation */}
        <section className="border border-zinc-900 p-8 bg-zinc-950">
          <h2 className="text-xl font-bold mb-4">Honest Recommendation</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <p>
              <strong className="text-white">Start with Quick Fix</strong> if you need immediate relief and have budget constraints.
              It'll buy you 12-18 months of runway and cost less than one cohort's admin overhead.
            </p>
            <p>
              <strong className="text-white">Go with Proper Solution</strong> if you're serious about scaling to 50+ cohort and want
              professional infrastructure. This is the right answer for most accelerators.
            </p>
            <p>
              <strong className="text-white">Nuclear Option</strong> is if you want to compete with Y Combinator. Real talk: you probably
              don't need this yet. Build your reputation first, then invest in the platform.
            </p>
            <p className="pt-4 border-t border-zinc-900 mt-4 text-zinc-500">
              Reality: Most accelerators waste £50K+ per year on manual admin because spreadsheets don't scale. A £8K investment
              that saves 10 hours/week is a no-brainer ROI.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
          >
            Book Free Consultation
          </Link>
          <p className="text-xs text-zinc-600 mt-4 font-mono">30-minute call to scope your exact needs</p>
        </section>
      </div>
    </div>
  );
}
