/**
 * $402 Token Exchange
 *
 * Price discovery and transaction exchange for content/API access tokens.
 * NOT a trading platform - this is where prices are discovered and tokens are acquired.
 *
 * Core concepts:
 * - Token = Access rights to content or API
 * - Price = f(supply) using sqrt_decay curve
 * - Exchange = View prices + Acquire tokens
 *
 * Pricing model (sqrt_decay):
 * price = base / sqrt(supply + 1)
 *
 * Early adopter advantage:
 * - Supply 0: 500 sats (first buyer)
 * - Supply 9: 158 sats
 * - Supply 99: 50 sats
 * - Supply 999: 16 sats
 */

// Types
export * from './types';

// Pricing calculations
export {
  calculatePrice,
  calculateTotalCost,
  generatePriceSchedule,
  splitRevenue,
  formatSats,
  estimateUSD
} from './pricing';

// Token operations
export {
  listTokens,
  getToken,
  createToken,
  updateToken,
  getTokenPriceSchedule
} from './tokens';

// Holdings management
export {
  getUserHoldings,
  getHolding,
  hasAccess,
  getBalance,
  getTokenHolders,
  getHolderCount
} from './holdings';

// Transactions
export {
  acquireTokens,
  transferTokens,
  grantTokens,
  getTokenTransactions,
  getUserTransactions,
  getTokenRevenue
} from './transactions';

// Serve tracking
export {
  recordServe,
  checkAccess,
  getUserServes,
  getTokenServes,
  getServeStats
} from './serve';

// MoneyButton press
export {
  processPress,
} from './press';

// Blog token queries
export {
  getBlogToken,
  isBlogTokenized,
  getBlogTokenStatus,
  getTokenizedBlogSlugs
} from './blog';
