"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const offers = [
  {
    slug: "landing-page",
    title: "Landing Page",
    price: "£180",
    description: "High-converting landing page with contact form",
  },
  {
    slug: "logo",
    title: "Logo Design",
    price: "£150",
    description: "Professional logo with all file formats",
  },
  {
    slug: "copywriting",
    title: "Copywriting",
    price: "£100",
    description: "SEO-optimized website copy per page",
  },
  {
    slug: "video",
    title: "Video Edit",
    price: "£200",
    description: "60-second promo video with motion graphics",
  },
  {
    slug: "seo",
    title: "SEO Audit",
    price: "£250",
    description: "Comprehensive SEO analysis with report",
  },
  {
    slug: "social-media",
    title: "Social Media",
    price: "£300/mo",
    description: "Monthly content management package",
  },
  {
    slug: "website",
    title: "Website",
    price: "£500+",
    description: "Complete multi-page website with CMS",
  },
  {
    slug: "ai-agent",
    title: "AI Agent",
    price: "£800+",
    description: "Custom AI agent for your workflow",
  },
  {
    slug: "token",
    title: "Token Launch",
    price: "£1,500",
    description: "BSV token deployment & launch package",
  },
  {
    slug: "app",
    title: "App Development",
    price: "£2,000+",
    description: "Custom web or mobile application",
  },
  {
    slug: "kyc",
    title: "KYC Integration",
    price: "£500+",
    description: "Identity verification for tokens, shares & compliance",
  },
  {
    slug: "security-audit",
    title: "Cyber Security Audit",
    price: "£1,500+",
    description: "Penetration testing & vulnerability assessment",
  },
];

export default function OffersClient() {
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
              OFFERS
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">
              Fixed-price packages
            </p>
            <div className="mt-6">
              <Link
                href="/packages"
                className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-900 transition-all"
              >
                View Incubator Packages →
              </Link>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {offers.map((offer) => (
              <Link
                key={offer.slug}
                href={`/offers/${offer.slug}`}
                className="block p-6 border border-gray-800 hover:border-gray-600 bg-black hover:bg-gray-900/50 transition-all"
              >
                <div className="text-2xl font-bold mb-2">{offer.price}</div>
                <h2 className="text-lg font-bold uppercase tracking-tight mb-2">
                  {offer.title}
                </h2>
                <p className="text-gray-500 text-sm">{offer.description}</p>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              All prices in GBP · Custom quotes available · richard@b0ase.com
            </p>
          </div>
        </div>
      </section>

      <footer className="px-4 md:px-8 py-8 border-t border-gray-800">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">b0ase.com</span>
          <span className="text-xs text-gray-600">richard@b0ase.com</span>
        </div>
      </footer>
    </motion.div>
  );
}
