import { Metadata } from 'next';
import Link from 'next/link';
import { FiArrowRight, FiCode, FiFileText, FiGrid, FiLayers } from 'react-icons/fi';
import { smartContractTemplates } from '@/lib/data';
import { seoLandingPages } from '@/lib/seo-landing-pages';

export const metadata: Metadata = {
  title: 'Smart Contracts Index | b0ase',
  description: 'Complete index of all smart contract pages - templates, SEO landing pages, and tools.',
};

export default function SmartContractsIndexPage() {
  const blockchainPages = seoLandingPages.filter(p => p.category === 'blockchain');
  const useCasePages = seoLandingPages.filter(p => p.category === 'use-case');
  const industryPages = seoLandingPages.filter(p => p.category === 'industry');

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="px-4 md:px-8 py-16">
        {/* Header */}
        <div className="mb-12 border-b border-gray-800 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-900/50 p-4 border border-gray-800">
              <FiCode className="text-3xl text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Smart Contracts Index
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Complete sitemap of all smart contract pages on b0ase.com
          </p>
        </div>

        {/* Main Pages */}
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <FiGrid size={14} />
            Main Pages
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/smart-contracts"
              className="p-4 border border-gray-800 hover:border-white transition-colors group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold group-hover:text-emerald-400">/smart-contracts</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-1">Main landing page</p>
            </Link>
            <Link
              href="/smart-contracts/form"
              className="p-4 border border-gray-800 hover:border-white transition-colors group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold group-hover:text-emerald-400">/smart-contracts/form</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-1">Lead qualification form</p>
            </Link>
            <Link
              href="/smart-contracts/s"
              className="p-4 border border-gray-800 hover:border-white transition-colors group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold group-hover:text-emerald-400">/smart-contracts/s</span>
                <FiArrowRight className="text-gray-600 group-hover:text-white" />
              </div>
              <p className="text-gray-500 text-sm mt-1">SEO pages index</p>
            </Link>
          </div>
        </div>

        {/* Template Library */}
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <FiFileText size={14} />
            Template Library ({smartContractTemplates.length} templates)
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {smartContractTemplates.map(template => (
              <Link
                key={template.slug}
                href={`/smart-contracts/${template.slug}`}
                className="p-3 border border-gray-800 hover:border-gray-600 transition-colors group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm group-hover:text-emerald-400">{template.title}</span>
                  <FiArrowRight className="text-gray-700 group-hover:text-white" size={12} />
                </div>
                <p className="text-gray-600 text-xs mt-1 truncate">/smart-contracts/{template.slug}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* SEO Landing Pages */}
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <FiLayers size={14} />
            SEO Landing Pages ({seoLandingPages.length} pages)
          </h2>

          {/* By Blockchain */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">By Blockchain</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {blockchainPages.map(page => (
                <Link
                  key={page.slug}
                  href={`/smart-contracts/s/${page.slug}`}
                  className="p-3 border border-gray-800 hover:border-gray-600 transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm group-hover:text-emerald-400">{page.h1}</span>
                    <FiArrowRight className="text-gray-700 group-hover:text-white" size={12} />
                  </div>
                  <p className="text-gray-600 text-xs mt-1 truncate">/smart-contracts/s/{page.slug}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* By Use Case */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">By Use Case</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {useCasePages.map(page => (
                <Link
                  key={page.slug}
                  href={`/smart-contracts/s/${page.slug}`}
                  className="p-3 border border-gray-800 hover:border-gray-600 transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm group-hover:text-emerald-400">{page.h1}</span>
                    <FiArrowRight className="text-gray-700 group-hover:text-white" size={12} />
                  </div>
                  <p className="text-gray-600 text-xs mt-1 truncate">/s/{page.slug}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* By Industry */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">By Industry</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {industryPages.map(page => (
                <Link
                  key={page.slug}
                  href={`/smart-contracts/s/${page.slug}`}
                  className="p-3 border border-gray-800 hover:border-gray-600 transition-colors group"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm group-hover:text-emerald-400">{page.h1}</span>
                    <FiArrowRight className="text-gray-700 group-hover:text-white" size={12} />
                  </div>
                  <p className="text-gray-600 text-xs mt-1 truncate">/s/{page.slug}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border border-gray-800 p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-white">3</div>
              <div className="text-xs text-gray-500 uppercase">Main Pages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{smartContractTemplates.length}</div>
              <div className="text-xs text-gray-500 uppercase">Templates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{seoLandingPages.length}</div>
              <div className="text-xs text-gray-500 uppercase">SEO Pages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{3 + smartContractTemplates.length + seoLandingPages.length}</div>
              <div className="text-xs text-gray-500 uppercase">Total Pages</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
