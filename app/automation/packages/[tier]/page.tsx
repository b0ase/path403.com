'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiArrowRight, FiShield, FiZap, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const packageData = {
  starter: {
    tier: "Starter",
    price: "£297",
    period: "/month",
    description: "Perfect for solo creators ready to scale",
    features: [
      "3 platforms managed",
      "20 posts per month",
      "Basic AI content generation",
      "Standard scheduling",
      "Monthly performance report",
      "Email support"
    ],
    details: {
      ideal_for: "Solo creators, podcasters, or YouTubers looking to expand their reach without hiring a team",
      setup_time: "2-3 weeks",
      platforms: ["Twitter/X", "Instagram", "TikTok (or your choice of 3)"],
      content_volume: "~20 pieces of content per month across all platforms",
      ai_features: ["Basic caption generation", "Hashtag optimization", "Content repurposing"],
      analytics: "Monthly performance report with key metrics and recommendations",
      support: "Email support (24-48 hour response time)"
    },
    includes: [
      "Initial strategy session (90 minutes)",
      "Platform integration setup",
      "Content calendar planning",
      "Basic brand voice training",
      "Monthly analytics report",
      "Email support"
    ]
  },
  professional: {
    tier: "Professional",
    price: "£597",
    period: "/month",
    description: "For serious creators and small teams",
    features: [
      "5+ platforms managed",
      "Unlimited posts",
      "Advanced AI features",
      "Revenue optimization",
      "Weekly strategy sessions",
      "Priority support",
      "Custom integrations"
    ],
    details: {
      ideal_for: "Full-time creators, influencers, or small creator teams ready for serious growth",
      setup_time: "3-4 weeks",
      platforms: ["All major platforms: Twitter/X, Instagram, TikTok, YouTube, LinkedIn, Facebook"],
      content_volume: "Unlimited content across all platforms",
      ai_features: ["Advanced content generation", "Multi-format adaptation", "Voice cloning", "Video script generation", "SEO optimization"],
      analytics: "Weekly performance reports with actionable insights",
      support: "Priority support (4-12 hour response time) + weekly strategy calls"
    },
    includes: [
      "Everything in Starter, plus:",
      "Weekly strategy sessions (30 minutes)",
      "Advanced AI content generation",
      "Revenue optimization consulting",
      "Affiliate link management",
      "Sponsorship opportunity matching",
      "Custom platform integrations",
      "Priority support queue"
    ]
  },
  enterprise: {
    tier: "Enterprise",
    price: "£1,497",
    period: "/month",
    description: "For agencies and large creator operations",
    features: [
      "Unlimited platforms",
      "Multi-creator management",
      "Custom AI model training",
      "White-label solutions",
      "Dedicated account manager",
      "24/7 support",
      "Advanced analytics"
    ],
    details: {
      ideal_for: "Creator networks, agencies, or brands managing multiple accounts and creators",
      setup_time: "4-6 weeks",
      platforms: ["Unlimited platforms and accounts"],
      content_volume: "Unlimited across all creators and accounts",
      ai_features: ["Custom AI model training", "Brand-specific voice models", "Advanced automation workflows", "API access"],
      analytics: "Real-time dashboard with advanced analytics and attribution",
      support: "Dedicated account manager + 24/7 priority support"
    },
    includes: [
      "Everything in Professional, plus:",
      "Multi-creator account management",
      "Custom AI model training on your content",
      "White-label solutions",
      "Dedicated account manager",
      "24/7 priority support",
      "Advanced analytics dashboard",
      "API access for custom integrations",
      "Monthly business review meetings"
    ]
  }
};

export default function PackageDetailPage() {
  const params = useParams();
  const tier = params?.tier as string;
  const pkg = packageData[tier as keyof typeof packageData];

  if (!pkg) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Package Not Found</h1>
          <Link href="/automation" className="text-blue-400 hover:underline">
            Return to Automation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        {/* Back Button */}
        <Link
          href="/automation"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-8"
        >
          <FiArrowLeft /> Back to Automation
        </Link>

        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-sm text-blue-400 uppercase tracking-widest mb-2">
                {pkg.tier} Package
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
                {pkg.price}<span className="text-2xl text-gray-500">{pkg.period}</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl">{pkg.description}</p>
            </div>

            <Link
              href={`/automation/packages/${tier}/checkout`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              Get Started <FiArrowRight size={20} />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* What's Included */}
            <section>
              <h2 className="text-2xl font-bold mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pkg.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 border border-gray-800 p-4 bg-gray-900/30">
                    <FiCheck className="text-green-500 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Details */}
            <section>
              <h2 className="text-2xl font-bold mb-6">Package Details</h2>
              <div className="space-y-6">
                <div className="border border-gray-800 p-6 bg-gray-900/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Ideal For
                  </h3>
                  <p className="text-gray-300">{pkg.details.ideal_for}</p>
                </div>

                <div className="border border-gray-800 p-6 bg-gray-900/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Setup Timeline
                  </h3>
                  <p className="text-gray-300">{pkg.details.setup_time}</p>
                </div>

                <div className="border border-gray-800 p-6 bg-gray-900/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Platforms Managed
                  </h3>
                  {Array.isArray(pkg.details.platforms) ? (
                    <ul className="space-y-2">
                      {pkg.details.platforms.map((platform, i) => (
                        <li key={i} className="text-gray-300 flex items-center gap-2">
                          <FiCheck className="text-blue-400" size={14} />
                          {platform}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-300">{pkg.details.platforms}</p>
                  )}
                </div>

                <div className="border border-gray-800 p-6 bg-gray-900/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Content Volume
                  </h3>
                  <p className="text-gray-300">{pkg.details.content_volume}</p>
                </div>

                <div className="border border-gray-800 p-6 bg-gray-900/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    AI Features
                  </h3>
                  <ul className="space-y-2">
                    {pkg.details.ai_features.map((feature, i) => (
                      <li key={i} className="text-gray-300 flex items-center gap-2">
                        <FiZap className="text-blue-400" size={14} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-gray-800 p-6 bg-gray-900/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Analytics & Reporting
                  </h3>
                  <p className="text-gray-300">{pkg.details.analytics}</p>
                </div>

                <div className="border border-gray-800 p-6 bg-gray-900/30">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Support
                  </h3>
                  <p className="text-gray-300">{pkg.details.support}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* CTA Card */}
              <div className="border border-blue-500 bg-blue-900/10 p-6">
                <h3 className="text-xl font-bold mb-4">Ready to Get Started?</h3>
                <div className="text-3xl font-bold mb-2">
                  {pkg.price}<span className="text-lg text-gray-400">{pkg.period}</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                  No setup fees. Cancel anytime.
                </p>
                <Link
                  href={`/automation/packages/${tier}/checkout`}
                  className="block w-full py-3 bg-blue-500 text-white text-center font-bold hover:bg-blue-600 transition-colors"
                >
                  Get Started <FiArrowRight className="inline ml-2" size={16} />
                </Link>
              </div>

              {/* Guarantees */}
              <div className="border border-gray-800 p-6 bg-gray-900/30 space-y-4">
                <div className="flex items-start gap-3">
                  <FiShield className="text-green-500 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold mb-1">Money-Back Guarantee</h4>
                    <p className="text-sm text-gray-400">
                      Not satisfied? Get a full refund within 30 days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiClock className="text-blue-400 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold mb-1">Quick Setup</h4>
                    <p className="text-sm text-gray-400">
                      Most clients are operational within {pkg.details.setup_time}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiZap className="text-purple-400 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold mb-1">Cancel Anytime</h4>
                    <p className="text-sm text-gray-400">
                      No long-term contracts. Cancel or upgrade anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border border-gray-800 p-6 bg-gray-900/30">
                <h4 className="font-bold mb-2">Questions?</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Book a free 15-minute consultation to discuss your needs.
                </p>
                <Link
                  href="/contact"
                  className="block w-full py-3 bg-gray-800 text-white text-center font-bold hover:bg-gray-700 transition-colors text-sm"
                >
                  Schedule Call
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
