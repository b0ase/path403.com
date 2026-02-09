"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const packageNames: Record<string, string> = {
  'cohort': 'Cohort License',
  'managed': 'Managed Platform',
  'license': 'Platform License',
};

interface PlatformPackagePageProps {
  pkg: {
    name: string;
    price: string;
    unit: string;
    monthly?: string;
    description: string;
    longDescription: string;
    includes: { item: string; detail: string }[];
    process: { step: string; description: string }[];
    faqs: { question: string; answer: string }[];
    ideal: string;
    cta: string;
    nextPackage: string | null;
    prevPackage: string | null;
  };
  slug: string;
}

export default function PlatformPackagePage({ pkg, slug }: PlatformPackagePageProps) {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="w-full max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/incubator-packages/platform"
              className="text-xs text-gray-500 uppercase tracking-widest hover:text-gray-400"
            >
              ← Platform Options
            </Link>
          </div>

          {/* Header */}
          <div className="mb-12 border-b border-gray-800 pb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6 uppercase">
              {pkg.name}
            </h1>

            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-6xl md:text-8xl font-bold">{pkg.price}</span>
              <span className="text-xl text-gray-500">{pkg.unit}</span>
              {pkg.monthly && (
                <span className="text-2xl text-gray-400 ml-4">{pkg.monthly}</span>
              )}
            </div>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl">
              {pkg.description}
            </p>
          </div>

          {/* Long Description */}
          <div className="mb-12">
            <p className="text-lg text-gray-300 leading-relaxed">
              {pkg.longDescription}
            </p>
          </div>

          {/* Package Navigation */}
          <div className="flex gap-4 mb-12">
            {pkg.prevPackage && (
              <Link
                href={`/incubator-packages/platform/${pkg.prevPackage}`}
                className="px-4 py-2 border border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-widest hover:border-gray-600 transition-colors"
              >
                ← {packageNames[pkg.prevPackage]}
              </Link>
            )}
            {pkg.nextPackage && (
              <Link
                href={`/incubator-packages/platform/${pkg.nextPackage}`}
                className="px-4 py-2 border border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-widest hover:border-gray-600 transition-colors"
              >
                {packageNames[pkg.nextPackage]} →
              </Link>
            )}
          </div>

          {/* What's Included */}
          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              What&apos;s Included
            </h2>
            <div className="border border-gray-800">
              {pkg.includes.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row md:justify-between md:items-center px-4 py-4 border-b border-gray-800 last:border-b-0"
                >
                  <span className="text-white font-medium mb-1 md:mb-0">{item.item}</span>
                  <span className="text-gray-500 text-sm">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Process */}
          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {pkg.process.map((step, i) => (
                <div key={i} className="p-4 border border-gray-800">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-tight mb-2">
                    {step.step}
                  </h3>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6">
              Common Questions
            </h2>
            <div className="space-y-4">
              {pkg.faqs.map((faq, i) => (
                <div key={i} className="p-4 border border-gray-800">
                  <h3 className="text-white font-medium mb-2">{faq.question}</h3>
                  <p className="text-gray-400 text-sm">{faq.answer}</p>
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
              {pkg.cta}
            </a>
            <Link
              href="/incubator-packages/platform"
              className="px-8 py-4 bg-transparent border border-gray-800 text-white text-sm font-bold uppercase tracking-widest hover:border-gray-600 transition-colors text-center"
            >
              Compare All Options
            </Link>
          </div>

          {/* Next Package */}
          {pkg.nextPackage && (
            <div className="mb-12 p-6 border border-gray-800 bg-gray-900/20">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
                    Need More?
                  </span>
                  <p className="text-gray-400 mt-1">
                    Upgrade to {packageNames[pkg.nextPackage]} for additional features and control
                  </p>
                </div>
                <Link
                  href={`/incubator-packages/platform/${pkg.nextPackage}`}
                  className="px-6 py-3 border border-gray-700 text-white text-xs font-bold uppercase tracking-widest hover:border-gray-500 transition-colors whitespace-nowrap"
                >
                  View {packageNames[pkg.nextPackage]} →
                </Link>
              </div>
            </div>
          )}

          {/* Final Option - License */}
          {!pkg.nextPackage && (
            <div className="mb-12 p-6 border border-white/20 bg-white/5">
              <div className="text-center">
                <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                  Full Ownership
                </span>
                <p className="text-gray-300 mt-2">
                  The Platform License gives you complete control. Build on it, modify it, make it yours.
                </p>
              </div>
            </div>
          )}

          {/* Trust */}
          <div className="pt-8 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Ideal for: {pkg.ideal} · richard@b0ase.com
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
