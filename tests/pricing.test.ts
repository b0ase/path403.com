import { describe, expect, it } from 'vitest';
import {
  calculateSqrtDecayPrice,
  calculateTotalCost,
  calculateTokensForSpend,
} from '@/lib/tokens/pricing';

describe('pricing', () => {
  it('sqrt_decay increases as treasury depletes', () => {
    const base = 223_610;
    const priceHighTreasury = calculateSqrtDecayPrice(base, 500_000_000);
    const priceLowTreasury = calculateSqrtDecayPrice(base, 10_000);
    expect(priceLowTreasury).toBeGreaterThan(priceHighTreasury);
  });

  it('calculateTotalCost returns consistent totals', () => {
    const base = 223_610;
    const result = calculateTotalCost('sqrt_decay', base, 10_000, 3);
    const sum = result.prices.reduce((acc, price) => acc + price, 0);
    expect(result.totalSats).toBe(sum);
    expect(result.avgPrice).toBe(Math.ceil(result.totalSats / 3));
  });

  it('calculateTokensForSpend accounts for remaining sats', () => {
    const base = 223_610;
    const spendSats = 100_000;
    const result = calculateTokensForSpend('sqrt_decay', base, 10_000, spendSats);
    expect(result.totalCost + result.remainingSats).toBe(spendSats);
    expect(result.tokenCount).toBeGreaterThanOrEqual(0);
  });
});
