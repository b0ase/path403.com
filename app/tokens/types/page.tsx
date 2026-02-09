'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { Coins, Vote, Image, Database, FileText, User, TrendingUp, Package, MessageSquare } from 'lucide-react';

const tokenTypes = [
  {
    id: 'utility',
    name: 'Utility Tokens',
    slug: 'utility',
    icon: Package,
    tagline: 'Access, Credits & Platform Rights',
    description: 'Grant access to services, platform features, or act as digital credits within an ecosystem.',
    useCases: [
      'Platform access rights',
      'Service credits and vouchers',
      'API call allocation',
      'Subscription management',
      'Loyalty reward programs'
    ],
    industries: ['SaaS', 'Gaming', 'Marketplaces', 'Digital Services'],
    bsvAdvantage: 'Micro-transactions at scale with minimal fees make BSV ideal for utility tokens used in high-frequency interactions.',
    examples: [
      'Platform credits for API calls',
      'Gaming currency and in-game items',
      'Subscription access tokens',
      'Service voucher systems'
    ],
    complexity: 'Medium',
    timeToMarket: '2-4 weeks'
  },
  {
    id: 'governance',
    name: 'Governance Tokens',
    slug: 'governance',
    icon: Vote,
    tagline: 'Voting Rights & DAO Participation',
    description: 'Enable holders to vote on organizational decisions, protocol changes, or resource allocation.',
    useCases: [
      'DAO voting mechanisms',
      'Protocol governance',
      'Community decision-making',
      'Treasury management',
      'Proposal submission rights'
    ],
    industries: ['DAOs', 'DeFi', 'Communities', 'Cooperatives'],
    bsvAdvantage: 'On-chain voting records with permanent, auditable history. Every vote is inscribed and timestamped.',
    examples: [
      'DAO membership tokens',
      'Protocol upgrade voting',
      'Community fund allocation',
      'Board election systems'
    ],
    complexity: 'High',
    timeToMarket: '4-6 weeks'
  },
  {
    id: 'nfts',
    name: 'NFTs (Non-Fungible Tokens)',
    slug: 'nfts',
    icon: Image,
    tagline: 'Unique Digital Assets & Collectibles',
    description: 'Represent unique, indivisible assets like art, collectibles, certificates, or real-world items.',
    useCases: [
      'Digital art and collectibles',
      'Event tickets and passes',
      'Certificates and credentials',
      'Real estate deeds',
      'Intellectual property rights'
    ],
    industries: ['Art', 'Entertainment', 'Education', 'Real Estate'],
    bsvAdvantage: 'Store entire files on-chain with ordinals. No off-chain storage dependencies. True ownership.',
    examples: [
      'Digital artwork collections',
      'Concert and event tickets',
      'Academic certificates',
      'Limited edition releases'
    ],
    complexity: 'Medium',
    timeToMarket: '2-3 weeks'
  },
  {
    id: 'data',
    name: 'Data Tokens',
    slug: 'data',
    icon: Database,
    tagline: 'Verified Datasets & Information Rights',
    description: 'Tokenize datasets, grant data access rights, or prove data provenance and authenticity.',
    useCases: [
      'Dataset licensing',
      'API access control',
      'Data provenance tracking',
      'Research data sharing',
      'Market data feeds'
    ],
    industries: ['Research', 'AI/ML', 'Analytics', 'Financial Services'],
    bsvAdvantage: 'Massive on-chain storage capacity. Store entire datasets, not just hashes. Verifiable data lineage.',
    examples: [
      'Market data subscriptions',
      'Research dataset access',
      'Training data for AI models',
      'Verified public records'
    ],
    complexity: 'High',
    timeToMarket: '4-8 weeks'
  },
  {
    id: 'legal',
    name: 'Legal Record Tokens',
    slug: 'legal',
    icon: FileText,
    tagline: 'Contracts, Agreements & Certificates',
    description: 'Immutable legal documents, contracts, and certificates stored on-chain with cryptographic proof.',
    useCases: [
      'Smart contracts',
      'Legal agreements',
      'Birth/marriage certificates',
      'Property titles',
      'Intellectual property registration'
    ],
    industries: ['Legal', 'Government', 'Real Estate', 'Healthcare'],
    bsvAdvantage: 'Tamper-proof legal records with version history. Sequential ordinals create immutable audit trails.',
    examples: [
      'Service agreements',
      'NDAs and IP assignments',
      'Property deeds',
      'Government-issued documents'
    ],
    complexity: 'High',
    timeToMarket: '6-10 weeks'
  },
  {
    id: 'identity',
    name: 'Identity Tokens',
    slug: 'identity',
    icon: User,
    tagline: 'KYC, Credentials & Reputation',
    description: 'Digital identity verification, credentials, reputation scores, and attestations.',
    useCases: [
      'KYC/AML verification',
      'Professional credentials',
      'Reputation systems',
      'Age verification',
      'Membership proof'
    ],
    industries: ['Finance', 'Education', 'Healthcare', 'Employment'],
    bsvAdvantage: 'Self-sovereign identity with user-controlled data. Privacy-preserving yet verifiable.',
    examples: [
      'Professional certifications',
      'University degrees',
      'Employment verification',
      'Reputation scores'
    ],
    complexity: 'Very High',
    timeToMarket: '8-12 weeks'
  },
  {
    id: 'revenue',
    name: 'Revenue Share Tokens',
    slug: 'revenue',
    icon: TrendingUp,
    tagline: 'Profit Distribution & Royalties',
    description: 'Automatically distribute revenue, profits, or royalties to token holders.',
    useCases: [
      'Profit sharing',
      'Royalty distribution',
      'Revenue splitting',
      'Dividend payments',
      'Commission tracking'
    ],
    industries: ['Creator Economy', 'Real Estate', 'Entertainment', 'Business'],
    bsvAdvantage: 'Micro-payments enable fractional royalty distribution. Pay cents to thousands of holders economically.',
    examples: [
      'Creator royalty shares',
      'Real estate rental income',
      'Music streaming royalties',
      'Profit-sharing agreements'
    ],
    complexity: 'Very High',
    timeToMarket: '10-16 weeks'
  },
  {
    id: 'social',
    name: 'Social Tokens',
    slug: 'social',
    icon: MessageSquare,
    tagline: 'Creator Economies & Community Access',
    description: 'Tokenize personal brand, community access, or creator-fan relationships.',
    useCases: [
      'Creator community access',
      'Exclusive content unlocking',
      'Fan engagement rewards',
      'Influencer economies',
      'Community membership tiers'
    ],
    industries: ['Content Creation', 'Social Media', 'Entertainment', 'Communities'],
    bsvAdvantage: 'Monetize every interaction. Token-gate content, chats, and experiences at scale.',
    examples: [
      'Exclusive Discord access',
      'Early content releases',
      'Meet & greet opportunities',
      'Community voting rights'
    ],
    complexity: 'Medium',
    timeToMarket: '3-5 weeks'
  },
  {
    id: 'conversation',
    name: 'Conversation Tokens',
    slug: 'conversation',
    icon: MessageSquare,
    tagline: 'Monetize Chat & Communication (Novel)',
    description: 'Revolutionary: Tokenize individual messages, chat threads, or entire conversation histories.',
    useCases: [
      'WhatsApp chat monetization',
      'Valuable conversation archives',
      'Expert advice tokens',
      'Interview transcripts',
      'Historic correspondence'
    ],
    industries: ['Communications', 'Journalism', 'Consulting', 'Archives'],
    bsvAdvantage: 'Only BSV can economically store and tokenize individual messages. Novel use case enabled by low fees.',
    examples: [
      'Monetized WhatsApp advice',
      'Tokenized expert consultations',
      'Historic chat archives',
      'Interview transcripts as NFTs'
    ],
    complexity: 'Very High',
    timeToMarket: '12-16 weeks',
    isNovel: true
  }
];

export default function TokenTypesPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <div className="px-4 md:px-8 py-16">
        <Link
          href="/tokens"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Tokens</span>
        </Link>

        <div className="mb-12 border-b border-white/20 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <Coins className="w-12 h-12 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight">
              Token Types
            </h1>
          </div>
          <p className="text-xl text-white/60 max-w-3xl">
            Explore different token types and discover which best fits your project. From utility tokens to novel conversation tokenization, BSV blockchain enables them all.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">{tokenTypes.length}</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Token Types</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">2-16</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Weeks to Market</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">∞</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Use Cases</p>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">1</p>
            <p className="text-sm text-white/60 uppercase tracking-wider">Blockchain (BSV)</p>
          </div>
        </div>

        {/* Token Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokenTypes.map((type, index) => (
            <Link
              key={type.id}
              href={`/tokens/types/${type.slug}`}
              className="group bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/10 hover:border-white/40 transition-all"
            >
              {type.isNovel && (
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  Novel Use Case
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <type.icon className="w-6 h-6" />
                </div>
                <FiArrowRight className="w-5 h-5 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>

              <h3 className="text-xl font-bold mb-2">{type.name}</h3>
              <p className="text-sm text-white/60 mb-4">{type.tagline}</p>
              <p className="text-white/80 text-sm mb-4 line-clamp-2">
                {type.description}
              </p>

              <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                <span>Complexity: {type.complexity}</span>
                <span>{type.timeToMarket}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {type.industries.slice(0, 3).map((industry) => (
                  <span
                    key={industry}
                    className="text-xs bg-white/10 px-2 py-1 rounded"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Not Sure Which Token Type Fits Your Project?
          </h2>
          <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
            Talk to our AI agent for personalized recommendations based on your business model and goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/agent/chat"
              className="bg-white text-black px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Ask Our Agent
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2"
            >
              Talk to Humans
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
