import { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowRight, FiArrowLeft, FiCode } from 'react-icons/fi';
import { seoLandingPages, getSEOLandingPagesByCategory } from '@/lib/seo-landing-pages';

export const metadata: Metadata = {
  title: 'Smart Contract Services | b0ase',
  description: 'Browse our smart contract development services by blockchain, use case, or industry. BSV, Ethereum, Solana, dividends, escrow, governance, and more.',
};

export default function SmartContractsServicesIndex() {
  const blockchainPages = getSEOLandingPagesByCategory('blockchain');
  const useCasePages = getSEOLandingPagesByCategory('use-case');
  const industryPages = getSEOLandingPagesByCategory('industry');

  const CategorySection = ({
    title,
    subtitle,
    pages
  }: {
    title: string;
    subtitle: string;
    pages: typeof seoLandingPages
  }) => (
    <div className="mb-16">
      <h2 className="text-xl font-bold uppercase tracking-tight mb-2">{title}</h2>
      <p className="text-gray-500 mb-6">{subtitle}</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map(page => (
          <Link
            key={page.slug}
            href={`/smart-contracts/s/${page.slug}`}
            className="p-6 border border-gray-800 hover:border-gray-500 hover:bg-zinc-900 transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                {page.h1}
              </h3>
              <FiArrowRight className="text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
            </div>
            <p className="text-gray-500 text-sm line-clamp-2">
              {page.heroSubtitle}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="px-4 md:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-gray-800 pb-8">
          <Link
            href="/smart-contracts"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft size={14} />
            Smart Contracts
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-900/50 p-4 border border-gray-800">
              <FiCode className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Smart Contract Services
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Browse our smart contract development services by blockchain platform, use case, or industry.
            Each page explains the specific solution and how we can help.
          </p>
        </div>

        {/* By Blockchain */}
        <CategorySection
          title="By Blockchain"
          subtitle="Choose your preferred blockchain platform"
          pages={blockchainPages}
        />

        {/* By Use Case */}
        <CategorySection
          title="By Use Case"
          subtitle="Find solutions for specific business needs"
          pages={useCasePages}
        />

        {/* By Industry */}
        <CategorySection
          title="By Industry"
          subtitle="Solutions tailored to your sector"
          pages={industryPages}
        />

        {/* CTA */}
        <div className="border border-gray-800 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Don't see what you need?
              </h2>
              <p className="text-gray-400">
                We build custom smart contracts for any use case. Tell us what you need.
              </p>
            </div>
            <Link
              href="/smart-contracts/form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Request Custom Quote <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
