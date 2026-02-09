'use client';

import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { portfolioData } from '@/lib/data';
import { getTokenPricing } from '@/lib/token-pricing';
import {
  TrendingUp,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  Zap,
  Target,
  ArrowRight,
  Info
} from 'lucide-react';
import Link from 'next/link';

// Bonding curve types
type CurveType = 'LINEAR' | 'EXPONENTIAL' | 'LOGARITHMIC' | 'SIGMOID';

interface BondingCurve {
  type: CurveType;
  basePrice: number; // Starting price in USD
  maxPrice: number; // Max price at 100% sold
  currentPercent: number; // How much has been sold (0-100)
}

// Calculate price at a given percent sold
const calculatePrice = (curve: BondingCurve, percentSold: number): number => {
  const { type, basePrice, maxPrice } = curve;
  const t = percentSold / 100; // Normalize to 0-1

  switch (type) {
    case 'LINEAR':
      return basePrice + (maxPrice - basePrice) * t;
    case 'EXPONENTIAL':
      return basePrice * Math.pow(maxPrice / basePrice, t);
    case 'LOGARITHMIC':
      return basePrice + (maxPrice - basePrice) * Math.log10(1 + 9 * t);
    case 'SIGMOID':
      const sigmoid = 1 / (1 + Math.exp(-10 * (t - 0.5)));
      return basePrice + (maxPrice - basePrice) * sigmoid;
    default:
      return basePrice;
  }
};

// Calculate tokens received for a given investment
const calculateTokensReceived = (
  curve: BondingCurve,
  investmentUSD: number,
  totalSupply: number
): { tokens: number; newPercent: number; avgPrice: number } => {
  // Simple approximation using average price
  const currentPrice = calculatePrice(curve, curve.currentPercent);
  const tokensAvailable = totalSupply * (1 - curve.currentPercent / 100);
  const estimatedTokens = investmentUSD / currentPrice;

  // Cap at available tokens
  const tokens = Math.min(estimatedTokens, tokensAvailable);
  const percentBought = (tokens / totalSupply) * 100;
  const newPercent = curve.currentPercent + percentBought;
  const avgPrice = investmentUSD / tokens;

  return { tokens, newPercent, avgPrice };
};

// Investment tiers
const investmentTiers = [
  { amount: 100, label: 'Starter' },
  { amount: 500, label: 'Supporter' },
  { amount: 1000, label: 'Believer' },
  { amount: 5000, label: 'Backer' },
  { amount: 10000, label: 'Partner' },
];

export default function InvestPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const project = portfolioData.projects.find(p => p.slug === slug);
  const pricing = project?.tokenName ? getTokenPricing(project.tokenName) : null;

  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  const isLive = pricing?.isReal;

  // Project-specific bonding curve (would come from database in production)
  const bondingCurve: BondingCurve = {
    type: 'EXPONENTIAL',
    basePrice: 0.0001, // $0.0001 starting price
    maxPrice: 0.01, // $0.01 at 100% sold
    currentPercent: isLive ? 100 : 0, // 0% sold if not live
  };

  const totalSupply = 1000000000; // 1 billion tokens

  // Calculate investment results
  const investmentResult = useMemo(() => {
    return calculateTokensReceived(bondingCurve, investmentAmount, totalSupply);
  }, [investmentAmount, bondingCurve.currentPercent]);

  // Generate curve points for visualization
  const curvePoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i += 2) {
      points.push({
        percent: i,
        price: calculatePrice(bondingCurve, i),
      });
    }
    return points;
  }, [bondingCurve]);

  const currentPrice = calculatePrice(bondingCurve, bondingCurve.currentPercent);
  const bsvAddress = '1B0ase...ABC123'; // Placeholder BSV address

  const handleCopy = () => {
    navigator.clipboard.writeText(bsvAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  // If token is already live, show different content
  if (isLive) {
    return (
      <div className="space-y-8">
        <div className="p-8 border border-green-800/50 bg-green-900/20 text-center">
          <Check className="mx-auto mb-4 text-green-400" size={48} />
          <h2 className="text-2xl font-bold mb-2">Token Sale Complete</h2>
          <p className="text-gray-400 mb-6">
            {project.tokenName} has launched and is now trading on the open market.
          </p>
          <Link
            href={`https://1sat.market/bsv21/${project.tokenName?.replace('$', '').toLowerCase()}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold hover:bg-green-500 transition-colors"
          >
            Trade on 1sat.market <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Bonding Curve Visualization */}
      <div className="p-6 border border-gray-800 bg-gray-900/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Bonding Curve</h2>
            <p className="text-sm text-gray-500">
              Price increases as more tokens are sold
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Current Price</p>
            <p className="text-2xl font-black text-green-400">
              ${currentPrice.toFixed(6)}
            </p>
          </div>
        </div>

        {/* SVG Curve */}
        <div className="relative h-48 border border-gray-800 bg-black/50">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="25" y1="0" x2="25" y2="100" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#1f2937" strokeWidth="0.5" />
            <line x1="75" y1="0" x2="75" y2="100" stroke="#1f2937" strokeWidth="0.5" />

            {/* Curve path */}
            <path
              d={curvePoints.map((p, i) => {
                const x = p.percent;
                const y = 100 - ((p.price - bondingCurve.basePrice) / (bondingCurve.maxPrice - bondingCurve.basePrice)) * 100;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
            />

            {/* Filled area under curve (sold portion) */}
            <path
              d={`M 0 100 ${curvePoints
                .filter(p => p.percent <= bondingCurve.currentPercent)
                .map((p, i) => {
                  const x = p.percent;
                  const y = 100 - ((p.price - bondingCurve.basePrice) / (bondingCurve.maxPrice - bondingCurve.basePrice)) * 100;
                  return `L ${x} ${y}`;
                }).join(' ')} L ${bondingCurve.currentPercent} 100 Z`}
              fill="rgba(59, 130, 246, 0.2)"
            />

            {/* Current position marker */}
            <circle
              cx={bondingCurve.currentPercent}
              cy={100 - ((currentPrice - bondingCurve.basePrice) / (bondingCurve.maxPrice - bondingCurve.basePrice)) * 100}
              r="2"
              fill="#22c55e"
            />
          </svg>

          {/* Labels */}
          <div className="absolute bottom-0 left-0 text-xs text-gray-500 p-2">0%</div>
          <div className="absolute bottom-0 right-0 text-xs text-gray-500 p-2">100%</div>
          <div className="absolute top-0 left-0 text-xs text-gray-500 p-2">${bondingCurve.maxPrice}</div>
          <div className="absolute bottom-0 left-0 text-xs text-gray-500 p-2 pl-8">${bondingCurve.basePrice}</div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{bondingCurve.currentPercent}% Sold</span>
            <span>{100 - bondingCurve.currentPercent}% Available</span>
          </div>
          <div className="h-2 bg-gray-800">
            <div
              className="h-full bg-blue-600"
              style={{ width: `${bondingCurve.currentPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Investment Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="p-6 border border-gray-800 bg-gray-900/30">
          <h3 className="text-lg font-bold mb-4">Investment Amount</h3>

          {/* Quick select buttons */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {investmentTiers.map((tier) => (
              <button
                key={tier.amount}
                onClick={() => setInvestmentAmount(tier.amount)}
                className={`p-2 text-center border transition-colors ${
                  investmentAmount === tier.amount
                    ? 'border-blue-600 bg-blue-900/30 text-blue-400'
                    : 'border-gray-700 hover:border-gray-600 text-gray-400'
                }`}
              >
                <span className="block text-sm font-bold">${tier.amount >= 1000 ? `${tier.amount / 1000}k` : tier.amount}</span>
                <span className="block text-xs text-gray-500">{tier.label}</span>
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl">$</span>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-full bg-black border border-gray-700 p-4 pl-10 text-2xl font-bold focus:border-blue-600 focus:outline-none"
              min="1"
              step="100"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="p-6 border border-blue-800/50 bg-blue-900/20">
          <h3 className="text-lg font-bold mb-4">You Will Receive</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-400">Tokens</span>
              <span className="text-3xl font-black text-white">
                {formatNumber(investmentResult.tokens)} {project.tokenName}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Price</span>
              <span className="text-lg font-bold text-green-400">
                ${investmentResult.avgPrice.toFixed(6)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">% of Total Supply</span>
              <span className="text-lg font-bold">
                {((investmentResult.tokens / totalSupply) * 100).toFixed(4)}%
              </span>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <TrendingUp size={14} />
                <span>
                  At max price (${bondingCurve.maxPrice}), your tokens would be worth{' '}
                  <strong className="text-white">
                    ${formatNumber(investmentResult.tokens * bondingCurve.maxPrice)}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to Invest */}
      <div className="p-6 border border-gray-800 bg-gray-900/30">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          How to Invest
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              1
            </div>
            <div>
              <p className="font-bold mb-1">Get BSV</p>
              <p className="text-sm text-gray-400">
                Purchase BSV from an exchange and transfer to your wallet.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              2
            </div>
            <div>
              <p className="font-bold mb-1">Send Payment</p>
              <p className="text-sm text-gray-400">
                Send BSV equivalent to your investment amount.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
              3
            </div>
            <div>
              <p className="font-bold mb-1">Receive Tokens</p>
              <p className="text-sm text-gray-400">
                Tokens are minted and sent to your wallet automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Address */}
        <div className="mt-6 p-4 bg-black border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Payment Address</p>
              <p className="font-mono text-sm">{bsvAddress}</p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 border border-yellow-800/50 bg-yellow-900/10 flex gap-3">
        <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-400">
          <p className="font-bold text-yellow-400 mb-1">Investment Risk</p>
          <p>
            Token investments are speculative and risky. Prices may fluctuate significantly.
            Only invest what you can afford to lose. Past performance does not guarantee future results.
          </p>
        </div>
      </div>

      {/* Token Details */}
      <div>
        <h3 className="text-lg font-bold mb-4 text-gray-400">Token Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-800 bg-gray-900/30">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Token Name</p>
            <p className="text-lg font-bold">{project.tokenName || 'TBD'}</p>
          </div>
          <div className="p-4 border border-gray-800 bg-gray-900/30">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Supply</p>
            <p className="text-lg font-bold">1,000M</p>
          </div>
          <div className="p-4 border border-gray-800 bg-gray-900/30">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Network</p>
            <p className="text-lg font-bold">BSV</p>
          </div>
          <div className="p-4 border border-gray-800 bg-gray-900/30">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Curve Type</p>
            <p className="text-lg font-bold">{bondingCurve.type}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
