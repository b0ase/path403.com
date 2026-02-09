'use client';

import { useParams } from 'next/navigation';
import { portfolioData } from '@/lib/data';
import { getTokenPricing } from '@/lib/token-pricing';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Users, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LaunchOverviewPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const project = portfolioData.projects.find(p => p.slug === slug);
  const pricing = project?.tokenName ? getTokenPricing(project.tokenName) : null;

  if (!project) return null;

  // Funding tiers for the launchpad
  const fundingTiers = [
    { percent: 1, price: 1000, label: 'Seed', description: 'First believers get the best price' },
    { percent: 5, price: 7500, label: 'Early', description: 'Early adopter allocation' },
    { percent: 10, price: 20000, label: 'Growth', description: 'Triggers first build phase' },
    { percent: 25, price: 75000, label: 'Scale', description: 'Full development begins' },
  ];

  const isLive = pricing?.isReal;

  return (
    <div className="space-y-12">
      {/* Status Banner */}
      {isLive ? (
        <div className="p-6 border border-green-800/50 bg-green-900/20">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="font-bold text-green-400">This token is live</p>
              <p className="text-sm text-gray-400">Trading on 1sat.market</p>
            </div>
            <Link
              href={`https://1sat.market/bsv21/${project.tokenName?.replace('$', '').toLowerCase()}`}
              target="_blank"
              className="ml-auto px-4 py-2 bg-green-600 text-white font-bold text-sm hover:bg-green-500 transition-colors"
            >
              Trade Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 border border-blue-800/50 bg-blue-900/20">
          <div className="flex items-center gap-3">
            <Target className="text-blue-400" size={24} />
            <div>
              <p className="font-bold text-blue-400">Open for investment</p>
              <p className="text-sm text-gray-400">Be the first to back this project</p>
            </div>
            <Link
              href={`/mint/launch/${slug}/invest`}
              className="ml-auto px-4 py-2 bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              Invest Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 border border-gray-800 bg-gray-900/30">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Token</p>
          <p className="text-2xl font-black text-blue-400">
            {project.tokenName || 'TBD'}
          </p>
        </div>
        <div className="p-6 border border-gray-800 bg-gray-900/30">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Supply</p>
          <p className="text-2xl font-black">1,000M</p>
        </div>
        <div className="p-6 border border-gray-800 bg-gray-900/30">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Status</p>
          <p className="text-2xl font-black">
            {isLive ? (
              <span className="text-green-400">Live</span>
            ) : (
              <span className="text-yellow-400">Pre-Launch</span>
            )}
          </p>
        </div>
        <div className="p-6 border border-gray-800 bg-gray-900/30">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Network</p>
          <p className="text-2xl font-black">BSV</p>
        </div>
      </div>

      {/* About */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-gray-400">About</h2>
        <div className="p-6 border border-gray-800 bg-gray-900/30">
          <p className="text-gray-300 leading-relaxed">
            {project.description}
          </p>
          {project.tech && project.tech.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tech.map((tech, i) => (
                <span key={i} className="px-2 py-1 text-xs bg-gray-800 text-gray-400 border border-gray-700">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Funding Tiers (only show if not live) */}
      {!isLive && (
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-gray-400">Funding Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fundingTiers.map((tier, i) => (
              <div key={i} className="p-6 border border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {tier.label}
                  </span>
                  <span className="text-xs font-mono text-blue-400">
                    {tier.percent}%
                  </span>
                </div>
                <p className="text-2xl font-black text-white mb-2">
                  ${tier.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            Prices increase as more tokens are sold. Early investors get the best rates.
          </p>
        </div>
      )}

      {/* Value Propositions */}
      {project.valuePropositions && project.valuePropositions.length > 0 && (
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-4 text-gray-400">Value Propositions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.valuePropositions.map((prop, i) => (
              <div key={i} className="p-4 border border-gray-800 bg-gray-900/30 flex items-start gap-3">
                <Zap size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{prop}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {!isLive && (
        <div className="p-8 border border-gray-800 bg-gray-900/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to invest?</h3>
              <p className="text-gray-400">
                Be among the first to back {project.title}. Early investors get the best prices.
              </p>
            </div>
            <Link
              href={`/mint/launch/${slug}/invest`}
              className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              View Investment Options <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
