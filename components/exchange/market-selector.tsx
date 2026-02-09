'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiVideo, FiMusic, FiFileText, FiBriefcase, FiLayers, FiLock, FiGithub, FiUser, FiKey } from 'react-icons/fi';

export type MarketType = 'COMPANIES' | 'PROJECTS' | 'DEVELOPERS' | 'REPOS' | 'ACCESS' | 'VIDEOS' | 'AUDIO' | 'WRITING' | 'VAULT';

interface MarketSelectorProps {
  activeMarket: MarketType;
  onChange: (market: MarketType) => void;
  isDark: boolean;
  activeProject?: boolean;
}

const markets: { id: MarketType; label: string; icon: React.ReactNode }[] = [
  { id: 'COMPANIES', label: 'Companies', icon: <FiBriefcase /> },
  { id: 'PROJECTS', label: 'Projects', icon: <FiLayers /> },
  { id: 'DEVELOPERS', label: 'Developers', icon: <FiUser /> },
  { id: 'REPOS', label: 'Repos', icon: <FiGithub /> },
  { id: 'ACCESS', label: '$402 Access', icon: <FiKey /> },
  { id: 'VAULT', label: 'Vault', icon: <FiLock /> },
  { id: 'VIDEOS', label: 'Videos', icon: <FiVideo /> },
  { id: 'AUDIO', label: 'Audio', icon: <FiMusic /> },
  { id: 'WRITING', label: 'Writing', icon: <FiFileText /> },
];

export const MarketSelector: React.FC<MarketSelectorProps> = ({ activeMarket, onChange, isDark }) => {
  return (
    <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-black border-white/10' : 'bg-gray-100 border-gray-200'} mb-6 overflow-x-auto`}>
      {markets.map((market) => (
        <button
          key={market.id}
          onClick={() => onChange(market.id)}
          className={`relative flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors flex-1 justify-center whitespace-nowrap ${
            activeMarket === market.id
              ? isDark ? 'text-black' : 'text-black'
              : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {activeMarket === market.id && (
            <motion.div
              layoutId="activeMarketTab"
              className={`absolute inset-0 rounded-lg shadow-sm ${isDark ? 'bg-yellow-500' : 'bg-white'}`}
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {market.icon}
            {market.label}
          </span>
        </button>
      ))}
    </div>
  );
};
