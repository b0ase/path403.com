import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FiArrowRight, FiArrowLeft, FiCheck, FiCode } from 'react-icons/fi';
import { getSEOLandingPage, getAllSEOLandingSlugs } from '@/lib/seo-landing-pages';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSEOLandingSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSEOLandingPage(slug);

  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: page.title,
    description: page.metaDescription,
    keywords: page.keywords.join(', '),
    openGraph: {
      title: page.h1,
      description: page.metaDescription,
      type: 'website',
    },
  };
}

export default async function SEOLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSEOLandingPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="px-4 md:px-8 py-16 border-b border-gray-800">
        <div className="max-w-4xl">
          <Link
            href="/smart-contracts"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
          >
            <FiArrowLeft size={14} />
            All Smart Contracts
          </Link>

          <div className="flex items-start gap-4 mb-6">
            <div className="bg-gray-900/50 p-4 border border-gray-800">
              <FiCode className="text-3xl text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {page.category === 'blockchain' ? 'Blockchain' :
                  page.category === 'use-case' ? 'Use Case' :
                    page.category === 'industry' ? 'Industry' : 'Solution'}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {page.h1}
              </h1>
            </div>
          </div>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl">
            {page.heroSubtitle}
          </p>

          <Link
            href="/smart-contracts/form"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
          >
            {page.ctaTitle} <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-4 md:px-8 py-16 border-b border-gray-800">
        <div className="max-w-4xl grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-4">
              The Problem
            </h2>
            <p className="text-gray-400 text-lg">
              {page.problemStatement}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-green-400 mb-4">
              The Solution
            </h2>
            <p className="text-gray-400 text-lg">
              {page.solution}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 md:px-8 py-16 border-b border-gray-800">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">Why This Works</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {page.benefits.map((benefit, i) => (
              <div key={i} className="p-6 border border-gray-800">
                <div className="flex items-start gap-3">
                  <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-white mb-1">{benefit.title}</h3>
                    <p className="text-gray-500 text-sm">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 md:px-8 py-16 border-b border-gray-800">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>
          <div className="space-y-6">
            {page.howItWorks.map((step) => (
              <div key={step.step} className="flex items-start gap-4">
                <div className="w-10 h-10 border border-gray-800 flex items-center justify-center text-sm font-mono flex-shrink-0">
                  {step.step}
                </div>
                <div className="pt-2">
                  <h3 className="font-bold text-white">{step.title}</h3>
                  <p className="text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-4 md:px-8 py-16 border-b border-gray-800">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold mb-8">Common Use Cases</h2>
          <div className="flex flex-wrap gap-3">
            {page.useCases.map((useCase, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-gray-900 border border-gray-800 text-sm"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-16">
        <div className="max-w-4xl">
          <div className="border border-gray-800 p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{page.ctaTitle}</h2>
                <p className="text-gray-400">{page.ctaDescription}</p>
              </div>
              <Link
                href="/smart-contracts/form"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Get Started <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Pages */}
      <section className="px-4 md:px-8 py-16 border-t border-gray-800">
        <div className="max-w-4xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">
            Related Services
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/smart-contracts" className="text-gray-400 hover:text-white transition-colors">
              All Smart Contracts
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/smart-contracts/form" className="text-gray-400 hover:text-white transition-colors">
              Request Quote
            </Link>
            <span className="text-gray-700">|</span>
            <Link href="/services" className="text-gray-400 hover:text-white transition-colors">
              All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
