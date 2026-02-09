'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { FiDollarSign, FiArrowLeft, FiTrendingUp, FiClock, FiZap } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Strategy {
  title: string;
  effort: string;
  timeline: string;
  revenue: string;
  probability: string;
  pros: string[];
  cons: string[];
  firstSteps: string[];
}

const strategies: Strategy[] = [
  {
    title: "Stop Selling Everything, Pick One Thing",
    effort: "Low",
    timeline: "2 weeks",
    revenue: "£3-8K/month",
    probability: "60%",
    pros: [
      "Easier to market (one clear message)",
      "Build expertise reputation",
      "Can charge premium rates",
      "Referrals compound in one niche"
    ],
    cons: [
      "Feels limiting (but isn't)",
      "May pick wrong thing first time",
      "Takes discipline to say no"
    ],
    firstSteps: [
      "Pick the thing you hate least",
      "Write a single landing page",
      "Post 3x/week about ONLY that thing",
      "Turn down everything else for 30 days"
    ]
  },
  {
    title: "Get on Upwork/Contra",
    effort: "Medium",
    timeline: "1-2 months",
    revenue: "£2-5K/month",
    probability: "70%",
    pros: [
      "Clients actively looking for help",
      "Can start immediately",
      "Build portfolio with real work",
      "Regular income potential"
    ],
    cons: [
      "Race to bottom on price initially",
      "Platform takes 10-20% cut",
      "Need to build reputation from zero",
      "Lots of tire kickers"
    ],
    firstSteps: [
      "Create profile emphasizing AI + development",
      "Start at lower rate to get first 3 reviews",
      "Apply to 10 jobs/day for 2 weeks",
      "Use AI to personalize every proposal"
    ]
  },
  {
    title: "Build One SaaS Tool",
    effort: "High",
    timeline: "3-6 months",
    revenue: "£1-10K/month",
    probability: "30%",
    pros: [
      "Recurring revenue potential",
      "Can sell in sleep",
      "Builds valuable asset",
      "Exit opportunity"
    ],
    cons: [
      "Takes months before first pound",
      "99% of SaaS fail",
      "Need marketing + sales skills",
      "Support burden grows"
    ],
    firstSteps: [
      "Pick the smallest problem you personally have",
      "Build MVP in 2 weeks",
      "Get 10 people to pay £20/month",
      "Then decide if it's worth scaling"
    ]
  },
  {
    title: "Partner with Agencies (White Label)",
    effort: "Medium",
    timeline: "1-3 months",
    revenue: "£5-15K/month",
    probability: "50%",
    pros: [
      "Agencies have clients already",
      "Predictable project flow",
      "Can focus on delivery not sales",
      "Build long-term relationships"
    ],
    cons: [
      "Lower rates (they take margin)",
      "Agency keeps client relationship",
      "You're a subcontractor",
      "Volume can be unpredictable"
    ],
    firstSteps: [
      "List 20 agencies doing similar work",
      "Email offering to white-label AI features",
      "Offer first project at 50% discount",
      "Nail it, then become their go-to"
    ]
  },
  {
    title: "One Whale Client (Retainer)",
    effort: "High",
    timeline: "2-4 months",
    revenue: "£8-20K/month",
    probability: "40%",
    pros: [
      "One client = simple life",
      "Predictable monthly income",
      "Deep expertise in their domain",
      "Can build long-term value"
    ],
    cons: [
      "All eggs in one basket",
      "If they leave, revenue = £0",
      "Hard to find initially",
      "Can become golden handcuffs"
    ],
    firstSteps: [
      "Target companies doing £5M+ revenue",
      "Offer to solve ONE expensive problem",
      "Start with project, convert to retainer",
      "Deliver 10x value vs. your fee"
    ]
  },
  {
    title: "Build in Public",
    effort: "Medium",
    timeline: "6-12 months",
    revenue: "£0-5K/month (slow build)",
    probability: "25%",
    pros: [
      "Builds long-term personal brand",
      "Inbound leads eventually",
      "Network compounds over time",
      "Can pivot to multiple income streams"
    ],
    cons: [
      "No money for months",
      "Requires consistent content creation",
      "Feels like shouting into void initially",
      "Takes years to see real results"
    ],
    firstSteps: [
      "Pick one platform (Twitter or LinkedIn)",
      "Post daily about what you're building",
      "Share real results (not just theory)",
      "Don't expect money for 6 months"
    ]
  },
  {
    title: "Info Product (Lazy Money)",
    effort: "Medium",
    timeline: "1-2 months",
    revenue: "£500-3K/month",
    probability: "35%",
    pros: [
      "Create once, sell forever",
      "No client work",
      "Proves expertise",
      "Can automate sales"
    ],
    cons: [
      "Market is saturated",
      "Need existing audience",
      "Low margins unless premium",
      "Refund requests"
    ],
    firstSteps: [
      "Find the question you get asked most",
      "Record 2-hour video answering it completely",
      "Sell for £50-200",
      "Launch to existing network first"
    ]
  },
  {
    title: "Get a Job (Nuclear Option)",
    effort: "Medium",
    timeline: "1-3 months",
    revenue: "£4-8K/month guaranteed",
    probability: "80%",
    pros: [
      "Guaranteed monthly income",
      "Benefits, pension, etc.",
      "Can freelance on side",
      "Removes financial pressure"
    ],
    cons: [
      "Feels like giving up",
      "Fixed hours/location",
      "Limited upside",
      "Back to corporate politics"
    ],
    firstSteps: [
      "Update LinkedIn (Senior AI Engineer)",
      "Apply to 5 remote companies/day",
      "Emphasize AI + full-stack skills",
      "Negotiate 4-day week to keep freelancing"
    ]
  }
];

export default function StrategiesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-sm">LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-16">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
          >
            <FiArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 border border-gray-800 flex items-center justify-center">
              <FiDollarSign className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">REVENUE STRATEGIES</h1>
              <p className="text-sm text-gray-500">8 paths to £10-15K/month in 6 months</p>
            </div>
          </div>
        </header>

        {/* Strategies Grid */}
        <main>
          <div className="space-y-8">
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-900 p-6 hover:border-gray-700 transition-all"
              >
                {/* Strategy Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">{strategy.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">EFFORT</p>
                      <p className="font-medium">{strategy.effort}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">TIMELINE</p>
                      <p className="font-medium">{strategy.timeline}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">REVENUE</p>
                      <p className="font-medium">{strategy.revenue}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">PROBABILITY</p>
                      <p className="font-medium">{strategy.probability}</p>
                    </div>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-3">PROS</h3>
                    <ul className="space-y-2">
                      {strategy.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-500 mt-1">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-3">CONS</h3>
                    <ul className="space-y-2">
                      {strategy.cons.map((con, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-red-500 mt-1">-</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* First Steps */}
                <div>
                  <h3 className="text-sm text-gray-500 mb-3">FIRST STEPS</h3>
                  <ol className="space-y-2">
                    {strategy.firstSteps.map((step, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                        <span className="text-gray-600">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-16 border border-gray-900 p-8">
            <h2 className="text-xl font-bold mb-6">6-MONTH PATH TO £10-15K/MONTH</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <p>
                <strong className="text-white">Month 1-2:</strong> Pick ONE thing + get on Upwork.
                Start with lower rates to build portfolio. Target £2-3K/month.
              </p>
              <p>
                <strong className="text-white">Month 3-4:</strong> Raise rates, partner with 2-3 agencies.
                Start building in public. Target £5-7K/month.
              </p>
              <p>
                <strong className="text-white">Month 5-6:</strong> Land one whale client OR scale SaaS to £2K MRR.
                Agency white-label work fills gaps. Target £10-15K/month.
              </p>
              <p className="pt-4 border-t border-gray-900 mt-6 text-gray-500">
                Reality check: This requires shipping daily, saying no to distractions, and treating it like
                a real business. Most people won't do it. Will you?
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
