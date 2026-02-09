'use client';

import React, { useEffect, useState } from 'react';
import { MarketType } from './market-selector';
import { FiTrendingUp, FiMusic, FiFileText, FiVideo, FiDisc, FiGithub } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

// Tokenized repos for the exchange
const TOKENIZED_REPOS = [
  {
    id: 'repo-1',
    name: 'the-algorithm',
    author: 'twitter',
    fullName: 'twitter/the-algorithm',
    ticker: 'TWALGO',
    stars: 70233,
    price: 0.0351,
    change24h: 5.2,
    marketCap: 2467000,
    volume24h: 45600,
    chain: 'BSV',
  },
  {
    id: 'repo-2',
    name: 'LocalAI',
    author: 'mudler',
    fullName: 'mudler/LocalAI',
    ticker: 'LOCAI',
    stars: 41926,
    price: 0.0209,
    change24h: -2.1,
    marketCap: 876000,
    volume24h: 23400,
    chain: 'Solana',
  },
  {
    id: 'repo-3',
    name: 'ultralytics',
    author: 'ultralytics',
    fullName: 'ultralytics/ultralytics',
    ticker: 'ULTRA',
    stars: 51438,
    price: 0.0257,
    change24h: 8.7,
    marketCap: 1321000,
    volume24h: 67800,
    chain: 'BSV',
  },
  {
    id: 'repo-4',
    name: 'mediapipe',
    author: 'google-ai-edge',
    fullName: 'google-ai-edge/mediapipe',
    ticker: 'MEDPIP',
    stars: 33209,
    price: 0.0166,
    change24h: 1.3,
    marketCap: 551000,
    volume24h: 12300,
    chain: 'Ethereum',
  },
];

interface AssetListProps {
  activeMarket: MarketType;
  onSelect: (asset: any) => void;
  selectedId?: string;
  isDark: boolean;
  legacyTokens: any[]; 
}

export const AssetList: React.FC<AssetListProps> = ({ activeMarket, onSelect, selectedId, isDark, legacyTokens }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Define which tickers are "Companies" (appear in the first tab)
  const COMPANY_TICKERS = ['BOASE', 'BCORP', 'NPG'];

  useEffect(() => {
    if (activeMarket === 'COMPANIES') {
        setItems(legacyTokens.filter(t => COMPANY_TICKERS.includes(t.ticker?.toUpperCase())));
        return;
    }
    if (activeMarket === 'PROJECTS') {
        setItems(legacyTokens.filter(t => !COMPANY_TICKERS.includes(t.ticker?.toUpperCase())));
        return;
    }
    if (activeMarket === 'REPOS') {
        setItems(TOKENIZED_REPOS);
        return;
    }

    const fetchMarketData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeMarket === 'VIDEOS') endpoint = '/api/market/videos';
            if (activeMarket === 'AUDIO') endpoint = '/api/market/audio';
            if (activeMarket === 'WRITING') endpoint = '/api/market/writing';

            const res = await fetch(endpoint);
            const data = await res.json();

            if (activeMarket === 'VIDEOS') setItems(data.videos || []);
            if (activeMarket === 'AUDIO') setItems(data.audio || []);
            if (activeMarket === 'WRITING') setItems(data.writing || []);
        } catch (e) {
            console.error(e);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };
    fetchMarketData();
  }, [activeMarket, legacyTokens]);

  if (loading) return <div className="p-4 text-center text-gray-500">Loading Market...</div>;

  return (
    <div className={`border rounded-xl p-4 ${isDark ? 'bg-black border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <h3 className="font-bold mb-4">
            {activeMarket === 'COMPANIES' && 'Regulated Shares'}
            {activeMarket === 'PROJECTS' && 'Venture Projects'}
            {activeMarket === 'REPOS' && 'GitHub Repos'}
            {activeMarket === 'VIDEOS' && 'Video Assets'}
            {activeMarket === 'AUDIO' && 'Audio Assets'}
            {activeMarket === 'WRITING' && 'Written Assets'}
        </h3>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {items.map((item: any) => (
                <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        selectedId === item.id
                        ? isDark ? 'bg-yellow-900/50 border border-yellow-600' : 'bg-yellow-100 border border-yellow-400'
                        : isDark ? 'bg-black border border-white/10 hover:border-white/20' : 'bg-white hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        {activeMarket === 'VIDEOS' && (
                            <div className="w-10 h-10 bg-gray-800 rounded overflow-hidden relative">
                                {item.thumbnail ? (
                                    <img src={item.thumbnail} className="w-full h-full object-cover" /> 
                                ) : (
                                    <FiVideo className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                )}
                            </div>
                        )}
                        {activeMarket === 'AUDIO' && (
                            <div className="w-10 h-10 bg-purple-900/50 rounded flex items-center justify-center">
                                <FiMusic className="text-purple-400" />
                            </div>
                        )}
                        {activeMarket === 'WRITING' && (
                            <div className="w-10 h-10 bg-blue-900/50 rounded flex items-center justify-center">
                                <FiFileText className="text-blue-400" />
                            </div>
                        )}
                         {(activeMarket === 'COMPANIES' || activeMarket === 'PROJECTS') && (
                            <div className={`w-10 h-10 rounded flex items-center justify-center ${activeMarket === 'COMPANIES' ? 'bg-yellow-600/20' : 'bg-gray-800'}`}>
                                <span className={`font-bold text-xs ${activeMarket === 'COMPANIES' ? 'text-yellow-500' : 'text-gray-400'}`}>
                                    {item.ticker?.substring(0, 4)}
                                </span>
                            </div>
                        )}
                        {activeMarket === 'REPOS' && (
                            <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                                <FiGithub className="text-white" />
                            </div>
                        )}

                        <div>
                            <div className="font-semibold flex items-center gap-2">
                                {activeMarket === 'REPOS' ? `$${item.ticker}` : (item.ticker || item.title)}
                                {activeMarket === 'COMPANIES' && <span className="text-[10px] bg-yellow-500 text-black px-1 rounded">LTD</span>}
                                {activeMarket === 'REPOS' && <span className="text-[10px] bg-purple-500 text-white px-1 rounded">{item.chain}</span>}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {activeMarket === 'VIDEOS' && `Avail: ${item.availableSupply}`}
                                {activeMarket === 'AUDIO' && item.artist}
                                {activeMarket === 'WRITING' && item.author}
                                {(activeMarket === 'COMPANIES' || activeMarket === 'PROJECTS') && item.name}
                                {activeMarket === 'REPOS' && (
                                    <span className="flex items-center gap-1">
                                        {item.fullName} <FaStar className="text-yellow-500" size={10} /> {(item.stars / 1000).toFixed(1)}k
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-sm font-mono">
                            {(activeMarket === 'COMPANIES' || activeMarket === 'PROJECTS' || activeMarket === 'REPOS') ? `$${item.price.toFixed(4)}` : `${item.priceSats} sats`}
                        </div>
                        {(activeMarket === 'COMPANIES' || activeMarket === 'PROJECTS' || activeMarket === 'REPOS') && (
                             <div className={`text-xs ${item.change24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                             </div>
                        )}
                    </div>
                </div>
            ))}
            
            {items.length === 0 && (
                <div className="text-center text-gray-500 py-8">No assets found in this market.</div>
            )}
        </div>
    </div>
  );
};
