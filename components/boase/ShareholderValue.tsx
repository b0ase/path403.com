import React from 'react';
import { CheckCircle, Wallet, Trophy, Gem, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShareholderValue() {
  return (
    <div className="mb-20 mt-20">
      <h2 className="text-3xl font-bold mb-8 text-white">Shareholder Value Model</h2>
      <div className="border border-white/10 p-8 bg-zinc-900/50">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-white">Revenue Sources</h3>
            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Token Creation Fees:</strong> Launch fee for each new project token
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Exchange Commissions:</strong> Transaction fees on token trades
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Development Services:</strong> AI-powered feature building
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Portfolio Appreciation:</strong> Value growth of held tokens
                </div>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-white">Dividend Distribution</h3>
            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-start">
                <Wallet className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">$BOASE Token Holders:</strong> Automated dividend distributions
                </div>
              </li>
              <li className="flex items-start">
                <Trophy className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Project Creators:</strong> Token liquidity and platform support
                </div>
              </li>
              <li className="flex items-start">
                <Gem className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Developers:</strong> Bounties and revenue sharing
                </div>
              </li>
              <li className="flex items-start">
                <Crown className="w-5 h-5 text-white mr-3 mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Platform Growth:</strong> Reinvestment in infrastructure
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
