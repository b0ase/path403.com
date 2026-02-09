'use client';

import { useState } from 'react';
import { 
  FaDownload, 
  FaFileAlt, 
  FaCode, 
  FaVideo, 
  FaImage, 
  FaMusic, 
  FaLock, 
  FaUnlock,
  FaWallet,
  FaBitcoin,
  FaEthereum,
  FaStar,
  FaEye,
  FaCalendarAlt,
  FaTag,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import { SiTether, SiCardano, SiPolygon } from 'react-icons/si';

interface DownloadItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'pdf' | 'code' | 'video' | 'audio' | 'image' | 'template';
  fileSize: string;
  downloads: number;
  rating: number;
  price: number; // 0 for free
  stablecoinPrice?: number; // Price in USDT for stablecoin payments
  isPremium: boolean;
  dateAdded: string;
  tags: string[];
  previewImage?: string;
  author: string;
  comingSoon?: boolean;
}

const downloadItems: DownloadItem[] = [
  {
    id: 'crypto-whitepaper-template',
    title: 'Crypto Whitepaper Template',
    description: 'Professional whitepaper template used by successful crypto projects. Includes sections for tokenomics, roadmap, and technical specifications.',
    category: 'Templates',
    type: 'pdf',
    fileSize: '2.4 MB',
    downloads: 1247,
    rating: 4.8,
    price: 0,
    isPremium: false,
    dateAdded: '2024-01-15',
    tags: ['whitepaper', 'template', 'tokenomics', 'roadmap'],
    author: 'Richard Boase'
  },
  {
    id: 'token-launch-checklist',
    title: 'Token Launch Checklist',
    description: 'Complete checklist covering every step of a successful token launch, from pre-launch to post-launch activities.',
    category: 'Guides',
    type: 'pdf',
    fileSize: '1.8 MB',
    downloads: 892,
    rating: 4.9,
    price: 0,
    isPremium: false,
    dateAdded: '2024-01-20',
    tags: ['launch', 'checklist', 'marketing', 'strategy'],
    author: 'Richard Boase'
  },
  {
    id: 'smart-contract-library',
    title: 'Smart Contract Library',
    description: 'Collection of audited smart contracts including ERC-20, ERC-721, staking, and governance contracts.',
    category: 'Code',
    type: 'code',
    fileSize: '15.2 MB',
    downloads: 634,
    rating: 4.7,
    price: 0,
    isPremium: false,
    dateAdded: '2024-01-25',
    tags: ['solidity', 'smart contracts', 'erc20', 'nft'],
    author: 'Richard Boase'
  },
  {
    id: 'defi-analysis-report',
    title: 'DeFi Market Analysis Q1 2024',
    description: 'Comprehensive analysis of DeFi protocols, yield opportunities, and risk assessments. Premium research report.',
    category: 'Research',
    type: 'pdf',
    fileSize: '8.7 MB',
    downloads: 156,
    rating: 5.0,
    price: 49,
    stablecoinPrice: 45,
    isPremium: true,
    dateAdded: '2024-01-30',
    tags: ['defi', 'analysis', 'yield', 'research'],
    author: 'Richard Boase'
  },
  {
    id: 'nft-art-collection',
    title: 'Crypto Punk Style NFT Collection',
    description: 'High-resolution pixel art collection in the style of crypto punks. 100 unique characters ready for minting.',
    category: 'Art',
    type: 'image',
    fileSize: '45.3 MB',
    downloads: 289,
    rating: 4.6,
    price: 97,
    stablecoinPrice: 90,
    isPremium: true,
    dateAdded: '2024-02-05',
    tags: ['nft', 'art', 'pixel art', 'collection'],
    author: 'Richard Boase'
  },
  {
    id: 'trading-bot-course',
    title: 'Build a Crypto Trading Bot',
    description: 'Complete video course on building automated trading bots for cryptocurrency markets. Includes Python code and strategies.',
    category: 'Education',
    type: 'video',
    fileSize: '2.1 GB',
    downloads: 78,
    rating: 4.9,
    price: 197,
    stablecoinPrice: 180,
    isPremium: true,
    dateAdded: '2024-02-10',
    tags: ['trading', 'bot', 'python', 'automation'],
    author: 'Richard Boase'
  },
  {
    id: 'crypto-podcast-tracks',
    title: 'Crypto Insights Podcast Collection',
    description: 'Audio podcast series covering crypto trends, interviews with industry leaders, and market analysis.',
    category: 'Audio',
    type: 'audio',
    fileSize: '156 MB',
    downloads: 423,
    rating: 4.5,
    price: 0,
    isPremium: false,
    dateAdded: '2024-02-15',
    tags: ['podcast', 'audio', 'interviews', 'trends'],
    author: 'Richard Boase'
  },
  {
    id: 'dao-governance-template',
    title: 'DAO Governance Framework',
    description: 'Complete DAO governance framework with voting mechanisms, proposal systems, and treasury management.',
    category: 'Templates',
    type: 'code',
    fileSize: '12.8 MB',
    downloads: 0,
    rating: 0,
    price: 147,
    stablecoinPrice: 135,
    isPremium: true,
    dateAdded: '2024-02-20',
    tags: ['dao', 'governance', 'voting', 'treasury'],
    author: 'Richard Boase',
    comingSoon: true
  }
];

const categories = ['All', 'Templates', 'Guides', 'Code', 'Research', 'Art', 'Education', 'Audio'];

const typeIcons = {
  pdf: FaFileAlt,
  code: FaCode,
  video: FaVideo,
  audio: FaMusic,
  image: FaImage,
  template: FaFileAlt
};

export default function DownloadsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<DownloadItem | null>(null);

  const filteredItems = downloadItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesPremium = !showPremiumOnly || item.isPremium;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesPremium && matchesSearch;
  });

  const freeItems = downloadItems.filter(item => item.price === 0);
  const premiumItems = downloadItems.filter(item => item.price > 0);

  const handleDownload = (item: DownloadItem) => {
    if (item.price === 0) {
      // Free download
      console.log(`Downloading ${item.title}...`);
      // In real implementation, trigger download
    } else {
      // Premium item - show payment options
      setSelectedItem(item);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-black py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
              Digital Downloads
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Free and premium digital resources for crypto projects. Templates, guides, code libraries, 
              and more to accelerate your blockchain development.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FaUnlock className="text-green-500" />
                <span>Free Downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <FaLock className="text-yellow-500" />
                <span>Premium Content</span>
              </div>
              <div className="flex items-center gap-2">
                <FaWallet className="text-blue-500" />
                <span>Stablecoin Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{freeItems.length}</div>
              <div className="text-sm text-gray-400">Free Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{premiumItems.length}</div>
              <div className="text-sm text-gray-400">Premium Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {downloadItems.reduce((sum, item) => sum + item.downloads, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Downloads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {(downloadItems.reduce((sum, item) => sum + item.rating, 0) / downloadItems.length).toFixed(1)}★
              </div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search downloads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Premium Filter */}
          <button
            onClick={() => setShowPremiumOnly(!showPremiumOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              showPremiumOnly
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaFilter />
            Premium Only
          </button>
        </div>

        {/* Downloads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const TypeIcon = typeIcons[item.type];
            return (
              <div
                key={item.id}
                className="bg-gray-900 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden"
              >
                {/* Item Header */}
                <div className="p-6 border-b border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.isPremium ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-gradient-to-br from-green-500 to-blue-600'
                      }`}>
                        <TypeIcon className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors">
                          {item.title}
                        </h3>
                        <div className="text-sm text-gray-400">{item.category}</div>
                      </div>
                    </div>
                    
                    {item.comingSoon && (
                      <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-md text-xs font-medium">
                        Soon
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Item Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <FaDownload />
                      <span>{item.downloads.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span>{item.rating || 'New'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTag />
                      <span>{item.fileSize}</span>
                    </div>
                  </div>

                  {/* Price and Download */}
                  <div className="flex items-center justify-between">
                    <div>
                      {item.price === 0 ? (
                        <div className="text-2xl font-bold text-green-400">FREE</div>
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-yellow-400">${item.price}</div>
                          {item.stablecoinPrice && (
                            <div className="text-sm text-gray-400">or ${item.stablecoinPrice} USDT</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDownload(item)}
                      disabled={item.comingSoon}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                        item.comingSoon
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : item.price === 0
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25'
                          : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg shadow-yellow-600/25'
                      }`}
                    >
                      {item.comingSoon ? (
                        'Coming Soon'
                      ) : (
                        <>
                          <FaDownload />
                          {item.price === 0 ? 'Download' : 'Buy Now'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">${selectedItem.price}</div>
                <p className="text-gray-400">{selectedItem.description}</p>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-white">Payment Options</h3>
                
                {/* Credit Card */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
                  Pay with Credit Card - ${selectedItem.price}
                </button>

                {/* Stablecoin Payment */}
                {selectedItem.stablecoinPrice && (
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FaWallet className="text-green-400" />
                      Pay with Stablecoin - ${selectedItem.stablecoinPrice} USDT
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors">
                        <SiTether className="text-green-500" />
                        USDT
                      </button>
                      <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors">
                        <FaEthereum className="text-blue-400" />
                        USDC
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Connect your wallet to pay with stablecoins
                    </p>
                  </div>
                )}

                {/* Crypto Payment */}
                <div className="border border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <FaBitcoin className="text-orange-400" />
                    Pay with Crypto (Coming Soon)
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button disabled className="flex items-center justify-center gap-2 bg-gray-800 text-gray-500 py-2 px-3 rounded text-sm cursor-not-allowed">
                      <FaBitcoin />
                      BTC
                    </button>
                    <button disabled className="flex items-center justify-center gap-2 bg-gray-800 text-gray-500 py-2 px-3 rounded text-sm cursor-not-allowed">
                      <FaEthereum />
                      ETH
                    </button>
                    <button disabled className="flex items-center justify-center gap-2 bg-gray-800 text-gray-500 py-2 px-3 rounded text-sm cursor-not-allowed">
                      <SiCardano />
                      ADA
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-center text-sm text-gray-400">
                Secure payment processing with instant download
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Something Custom?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Don't see what you're looking for? We create custom templates, guides, and code libraries for crypto projects.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white text-black px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Request Custom Work
            </button>
            <button className="border border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-black transition-colors">
              Browse All Downloads
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 