// Token pricing system
// Uses TOKEN_REGISTRY as the single source of truth for token data
// This file provides pricing calculations and formatting

import {
  TOKEN_REGISTRY,
  DEFAULT_SUPPLY,
  USD_TO_GBP,
  getToken,
  isTokenMinted,
} from './token-registry';

// Re-export for backward compatibility
export { DEFAULT_SUPPLY, USD_TO_GBP };

export interface TokenPricing {
  price: number;
  priceFormatted: string;
  priceFormattedGBP: string;
  change: number;
  changeFormatted: string;
  supply: string;
  circulation: string;
  marketCap: string;
  marketCapGBP: string;
  volume: string;
  volumeGBP: string;
  // Raw values for sorting
  supplyValue: number;
  circulationValue: number;
  marketCapValue: number;
  volumeValue: number;
  // Is this a real minted token?
  isReal: boolean;
}

/**
 * REAL_TOKENS - Derived from TOKEN_REGISTRY for backward compatibility
 * Add new tokens to TOKEN_REGISTRY in lib/token-registry.ts instead
 */
export const REAL_TOKENS: Record<string, {
  marketCap: number;
  supply: number;
  circulation: number;
  volume: number;
  marketUrl?: string;
}> = Object.fromEntries(
  Object.entries(TOKEN_REGISTRY)
    .filter(([_, token]) => token.status === 'minted' && token.pricing)
    .map(([symbol, token]) => [
      symbol,
      {
        marketCap: token.pricing!.marketCap,
        supply: token.pricing!.supply,
        circulation: token.pricing!.circulation,
        volume: token.pricing!.volume,
        marketUrl: token.marketUrl,
      },
    ])
);

// Generate deterministic but varied prices based on token name
const generatePriceFromToken = (tokenName: string): number => {
  if (!tokenName) return 0;
  
  // Create deterministic but varied prices based on token name
  const seed = tokenName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  
  // Generate much smaller prices between $0.0001 and $0.50 to keep market caps under $1M
  const basePrice = Math.pow(random, 3) * 0.499 + 0.0001;
  return Math.round(basePrice * 10000) / 10000; // Round to 4 decimal places
};

// Generate market change percentage
const generateChangeFromToken = (tokenName: string): number => {
  if (!tokenName) return 0;
  
  const seed = tokenName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = ((seed * 7919 + 28411) % 233280) / 233280;
  
  // Generate changes between -15% and +15%
  return (random - 0.5) * 30;
};

// Generate supply from token name
const generateSupplyFromToken = (tokenName: string): number => {
  if (!tokenName) return 0;
  
  const seed = tokenName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = ((seed * 5431 + 12345) % 233280) / 233280;
  
  // Generate smaller supplies between 500K and 10M to help keep market caps reasonable
  return Math.floor(random * 9500000 + 500000);
};

// Generate circulation percentage
const generateCirculationFromToken = (tokenName: string): number => {
  if (!tokenName) return 0;
  
  const seed = tokenName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = ((seed * 8765 + 54321) % 233280) / 233280;
  
  // Generate circulation between 30% and 95%
  return Math.floor(random * 65 + 30);
};

// Generate volume from other values
const generateVolumeFromToken = (tokenName: string, price: number, supply: number): number => {
  if (!tokenName) return 0;
  
  const seed = tokenName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = ((seed * 3141 + 27182) % 233280) / 233280;
  
  // Generate volume as a percentage of market cap (0.1% to 5%)
  const marketCap = price * supply;
  return Math.floor(marketCap * (random * 0.049 + 0.001));
};

// Format numbers for display
const formatCurrencyUSD = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  } else {
    return `$${value.toLocaleString()}`;
  }
};

const formatCurrencyGBP = (value: number): string => {
  const gbpValue = value * USD_TO_GBP;
  if (gbpValue >= 1000000) {
    return `£${(gbpValue / 1000000).toFixed(1)}M`;
  } else if (gbpValue >= 1000) {
    return `£${(gbpValue / 1000).toFixed(0)}k`;
  } else {
    return `£${Math.round(gbpValue).toLocaleString()}`;
  }
};

const formatSupply = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  } else {
    return value.toLocaleString();
  }
};

// Main function to get token pricing data
export const getTokenPricing = (tokenName: string): TokenPricing | null => {
  if (!tokenName) return null;

  // Check if this is a real minted token
  const realToken = REAL_TOKENS[tokenName];

  if (realToken) {
    // Calculate price from market cap
    const circulatingSupply = Math.floor(realToken.supply * (realToken.circulation / 100));
    const price = realToken.marketCap / circulatingSupply;
    const priceGBP = price * USD_TO_GBP;

    return {
      price: price,
      priceFormatted: `$${price.toFixed(6)}`,
      priceFormattedGBP: `£${priceGBP.toFixed(6)}`,
      change: 0,
      changeFormatted: '-',
      supply: '1,000M',
      circulation: `${realToken.circulation}%`,
      marketCap: formatCurrencyUSD(realToken.marketCap),
      marketCapGBP: formatCurrencyGBP(realToken.marketCap),
      volume: formatCurrencyUSD(realToken.volume),
      volumeGBP: formatCurrencyGBP(realToken.volume),
      supplyValue: realToken.supply,
      circulationValue: realToken.circulation,
      marketCapValue: realToken.marketCap,
      volumeValue: realToken.volume,
      isReal: true
    };
  }

  // Token exists in name but is not yet minted - private equity
  return {
    price: 0,
    priceFormatted: '-',
    priceFormattedGBP: '-',
    change: 0,
    changeFormatted: '-',
    supply: '-',
    circulation: '-',
    marketCap: '-',
    marketCapGBP: '-',
    volume: '-',
    volumeGBP: '-',
    supplyValue: DEFAULT_SUPPLY,
    circulationValue: 0,
    marketCapValue: 0,
    volumeValue: 0,
    isReal: false
  };
};

// Helper function for backward compatibility with existing code
export const generateTempPrice = (tokenName: string): number | null => {
  const pricing = getTokenPricing(tokenName);
  return pricing ? pricing.price : null;
};

export const generateTempChange = (tokenName: string): string => {
  const pricing = getTokenPricing(tokenName);
  return pricing ? pricing.changeFormatted : '+0.0%';
};