/**
 * $402 Token Pricing
 * sqrt_decay: price = base / sqrt(supply + 1)
 *
 * This creates early-adopter advantage:
 * - Supply 0: 500 sats (first buyer)
 * - Supply 9: 158 sats (~3x cheaper)
 * - Supply 99: 50 sats (~10x cheaper)
 * - Supply 999: 16 sats (~31x cheaper)
 */

import type { PricingModel, PriceSchedule } from './types';

/**
 * Calculate unit price at given supply level
 */
export function calculatePrice(
  baseSats: number,
  supply: number,
  model: PricingModel = 'sqrt_decay',
  decayFactor: number = 1.0
): number {
  switch (model) {
    case 'sqrt_decay':
      // price = base * decayFactor / sqrt(supply + 1)
      return Math.ceil((baseSats * decayFactor) / Math.sqrt(supply + 1));

    case 'linear':
      // price = base - (supply * decayFactor), minimum 1 sat
      return Math.max(1, Math.ceil(baseSats - (supply * decayFactor)));

    case 'fixed':
    default:
      return baseSats;
  }
}

/**
 * Calculate total cost to acquire N tokens starting from current supply
 */
export function calculateTotalCost(
  baseSats: number,
  currentSupply: number,
  amount: number,
  model: PricingModel = 'sqrt_decay',
  decayFactor: number = 1.0
): { totalCost: number; avgPrice: number; prices: number[] } {
  const prices: number[] = [];
  let totalCost = 0;

  for (let i = 0; i < amount; i++) {
    const price = calculatePrice(baseSats, currentSupply + i, model, decayFactor);
    prices.push(price);
    totalCost += price;
  }

  return {
    totalCost,
    avgPrice: Math.ceil(totalCost / amount),
    prices
  };
}

/**
 * Generate price schedule showing price at different supply levels
 */
export function generatePriceSchedule(
  baseSats: number,
  model: PricingModel = 'sqrt_decay',
  decayFactor: number = 1.0,
  points: number[] = [0, 1, 10, 50, 100, 500, 1000]
): PriceSchedule[] {
  const schedule: PriceSchedule[] = [];
  let cumulativeCost = 0;

  for (const supply of points) {
    const unitPrice = calculatePrice(baseSats, supply, model, decayFactor);

    // Calculate cumulative cost to get to this supply
    if (supply === 0) {
      cumulativeCost = 0;
    } else {
      cumulativeCost = calculateTotalCost(baseSats, 0, supply, model, decayFactor).totalCost;
    }

    schedule.push({
      supply,
      unit_price_sats: unitPrice,
      cumulative_cost_sats: cumulativeCost
    });
  }

  return schedule;
}

/**
 * Split revenue between issuer and platform
 */
export function splitRevenue(
  totalSats: number,
  issuerShareBps: number = 7000,
  platformShareBps: number = 3000
): { issuerSats: number; platformSats: number } {
  const issuerSats = Math.floor((totalSats * issuerShareBps) / 10000);
  const platformSats = totalSats - issuerSats; // Remainder to platform

  return { issuerSats, platformSats };
}

/**
 * Format sats for display (e.g., "500 sats" or "0.005 BSV")
 */
export function formatSats(sats: number, format: 'sats' | 'bsv' = 'sats'): string {
  if (format === 'bsv') {
    return `${(sats / 100_000_000).toFixed(8)} BSV`;
  }
  return `${sats.toLocaleString()} sats`;
}

/**
 * Estimate USD value (rough estimate at ~$50/BSV)
 */
export function estimateUSD(sats: number, bsvPrice: number = 50): number {
  return (sats / 100_000_000) * bsvPrice;
}
