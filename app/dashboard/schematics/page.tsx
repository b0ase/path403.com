'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLayers, FiArrowLeft, FiEdit, FiEye } from 'react-icons/fi';

const schematics = [
  {
    id: 'bitcoin-exchange',
    title: 'Bitcoin Exchange',
    description: 'Central exchange engine architecture with connected Bitcoin apps',
    status: 'active',
    lastUpdated: '2024-12-16'
  },
  {
    id: 'bsv',
    title: 'BSV+',
    description: 'BSV blockchain scaling visualization and efficiency engine',
    status: 'active',
    lastUpdated: '2024-12-17'
  },
  {
    id: 'minecraftparty-website',
    title: 'Minecraft Party',
    description: 'Event platform for Minecraft server hosting and community management',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'aigirlfriends-website',
    title: 'AI Girlfriends',
    description: 'Interactive AI companion platform with voice and chat capabilities',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'vexvoid-com',
    title: 'VexVoid',
    description: 'Future-tech fashion brand and e-commerce experience',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'audex-website',
    title: 'Audex',
    description: 'Audio exchange platform for decentralized music distribution',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'npgx-website',
    title: 'NPGX',
    description: 'Ninja Punk Girls X - Next generation NFT gaming experience',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'zerodice-store',
    title: 'Zero Dice',
    description: 'Provably fair blockchain dice gaming platform',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'libertascoffee-store',
    title: 'Libertas Coffee',
    description: 'Direct-trade coffee e-commerce with supply chain tracking',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'beauty-queen-ai-com',
    title: 'Beauty Queen AI',
    description: 'AI-powered beauty contest and voting platform',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'bsvapi-com',
    title: 'BSV API',
    description: 'Developer infrastructure for Bitcoin SV applications',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'coursekings-website',
    title: 'CourseKings',
    description: 'Educational platform for expert-led courses',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'metagraph-app',
    title: 'Metagraph',
    description: 'Network visualization tool for blockchain transactions',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'oneshotcomics',
    title: 'OneShot Comics',
    description: 'Digital comic book publishing and reading platform',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'osinka-kalaso',
    title: 'Osinka Kalaso',
    description: 'Virtual world and gaming environment',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'cashboard-website',
    title: 'Cashboard',
    description: 'Financial dashboard for crypto portfolio tracking',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
  {
    id: 'ninja-punk-girls-website',
    title: 'Ninja Punk Girls',
    description: 'Multimedia franchise website with NFT integration',
    status: 'draft',
    lastUpdated: '2024-12-18'
  },
];

export default function DashboardSchematicsPage() {
  const [filter, setFilter] = useState('all');

  const filteredSchematics = filter === 'all'
    ? schematics
    : schematics.filter(s => s.status === filter);

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-6"
        >
          <FiArrowLeft /> Back to Dashboard
        </Link>

        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold tracking-tighter mb-2">SCHEMATICS</h1>
              <p className="text-gray-400 text-sm uppercase tracking-widest">
                Private workspace - {schematics.length} total
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">Admin Access</span>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          {['all', 'active', 'draft'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 capitalize text-sm transition-all ${
                filter === status
                  ? 'border-b-2 border-white text-white font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Schematics List */}
        <div className="space-y-3">
          {filteredSchematics.map((schematic) => (
            <motion.div
              key={schematic.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Link
                href={`/schematics/${schematic.id}`}
                className="block border border-gray-800 bg-gray-900/30 hover:bg-gray-900/60 hover:border-gray-600 transition-all p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-xl font-bold">{schematic.title}</h2>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          schematic.status === 'active'
                            ? 'bg-emerald-900/50 text-emerald-400 border-emerald-800'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {schematic.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{schematic.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-mono">Updated: {schematic.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-6">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement edit functionality
                        alert(`Edit ${schematic.title}`);
                      }}
                      className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <FiEdit size={16} />
                    </button>
                    <FiEye className="text-gray-600 group-hover:text-white transition-colors" size={20} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredSchematics.length === 0 && (
          <div className="border border-gray-800 p-12 text-center">
            <FiLayers size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500">No schematics found for this filter</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 border border-gray-800 bg-gray-900/30 p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-3">
            Admin Notes
          </h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• All schematics are locked as premium content on /schematics public route</li>
            <li>• This dashboard provides full access for editing and reviewing</li>
            <li>• Active schematics are published and viewable to premium users</li>
            <li>• Draft schematics are work-in-progress and not publicly visible</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
