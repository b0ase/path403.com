/**
 * b0ase Standard Equity Pricing Curve
 *
 * Universal pricing model applied to all b0ase projects:
 * - First 10% (1-10%): £999 per 1%
 * - Second 10% (11-20%): £1,999 per 1%
 * - Third 10% (21-30%): £3,999 per 1%
 * - And so on (doubles each 10% block)
 *
 * Investment limits (for J30 compliance):
 * - Max £999 per investment (under £1,000 threshold)
 * - Max £1,000 per investor per project per month
 */

export const EQUITY_BLOCKS = [
  { minPercent: 1, maxPercent: 10, pricePerPercent: 999 },
  { minPercent: 11, maxPercent: 20, pricePerPercent: 1999 },
  { minPercent: 21, maxPercent: 30, pricePerPercent: 3999 },
  { minPercent: 31, maxPercent: 40, pricePerPercent: 7999 },
  { minPercent: 41, maxPercent: 50, pricePerPercent: 15999 },
  { minPercent: 51, maxPercent: 60, pricePerPercent: 31999 },
  { minPercent: 61, maxPercent: 70, pricePerPercent: 63999 },
  { minPercent: 71, maxPercent: 80, pricePerPercent: 127999 },
  { minPercent: 81, maxPercent: 90, pricePerPercent: 255999 },
  { minPercent: 91, maxPercent: 100, pricePerPercent: 511999 },
] as const;

export const MAX_INVESTMENT_PER_TRANSACTION = 999; // GBP - under J30 threshold
export const MAX_INVESTMENT_PER_INVESTOR_PER_PROJECT_PER_MONTH = 1000; // GBP

/**
 * Get the price per 1% equity for a given equity percentage
 */
export function getPricePerPercent(equityPercent: number): number {
  const block = EQUITY_BLOCKS.find(
    b => equityPercent >= b.minPercent && equityPercent <= b.maxPercent
  );
  return block?.pricePerPercent ?? EQUITY_BLOCKS[EQUITY_BLOCKS.length - 1].pricePerPercent;
}

/**
 * Get the equity block for a given percentage
 */
export function getEquityBlock(equityPercent: number) {
  return EQUITY_BLOCKS.find(
    b => equityPercent >= b.minPercent && equityPercent <= b.maxPercent
  );
}

/**
 * Calculate total cost to acquire a range of equity
 * e.g., buying from 5% to 8% would be 3 * £999 = £2,997
 */
export function calculateEquityCost(fromPercent: number, toPercent: number): number {
  let total = 0;
  for (let p = fromPercent; p < toPercent; p++) {
    total += getPricePerPercent(p + 1);
  }
  return total;
}

/**
 * Calculate total value of a block (e.g., first 10% = £9,990)
 */
export function getBlockTotal(blockIndex: number): number {
  const block = EQUITY_BLOCKS[blockIndex];
  if (!block) return 0;
  const percentagePoints = block.maxPercent - block.minPercent + 1;
  return percentagePoints * block.pricePerPercent;
}

/**
 * Generate tranche structure for a project
 * Returns array of tranches for the first N percent
 */
export function generateTranches(totalPercent: number = 10) {
  const tranches = [];
  for (let i = 1; i <= totalPercent; i++) {
    tranches.push({
      trancheNumber: i,
      equityPercent: 1,
      targetGbp: getPricePerPercent(i),
      cumulativeEquity: i,
    });
  }
  return tranches;
}

/**
 * Check if an investment amount is within compliance limits
 */
export function isWithinComplianceLimits(amountGbp: number): boolean {
  return amountGbp <= MAX_INVESTMENT_PER_TRANSACTION;
}

/**
 * Format price for display
 */
export function formatGbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
