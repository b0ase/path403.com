// src/index.ts
var CHAIN_NAMES = {
  bsv: "Bitcoin SV",
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  solana: "Solana",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  base: "Base",
  avalanche: "Avalanche"
};
var CHAIN_SYMBOLS = {
  bsv: "BSV",
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  polygon: "MATIC",
  arbitrum: "ETH",
  base: "ETH",
  avalanche: "AVAX"
};
var CHAIN_EXPLORERS = {
  bsv: "https://whatsonchain.com",
  bitcoin: "https://mempool.space",
  ethereum: "https://etherscan.io",
  solana: "https://solscan.io",
  polygon: "https://polygonscan.com",
  arbitrum: "https://arbiscan.io",
  base: "https://basescan.org",
  avalanche: "https://snowtrace.io"
};
function formatBalance(balance, decimals = 8, options) {
  const maxDecimals = options?.maxDecimals ?? decimals;
  if (options?.compact && balance >= 1e6) {
    return `${(balance / 1e6).toFixed(2)}M`;
  }
  if (options?.compact && balance >= 1e3) {
    return `${(balance / 1e3).toFixed(2)}K`;
  }
  let displayDecimals = maxDecimals;
  if (balance >= 1e3) displayDecimals = Math.min(2, maxDecimals);
  else if (balance >= 1) displayDecimals = Math.min(4, maxDecimals);
  else if (balance >= 1e-4) displayDecimals = Math.min(6, maxDecimals);
  return balance.toFixed(displayDecimals);
}
function formatUsdValue(value) {
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}
function calculatePortfolioValue(balances) {
  return balances.reduce((sum, b) => sum + (b.usdValue || 0), 0);
}
function aggregateBalances(balances) {
  const aggregated = /* @__PURE__ */ new Map();
  for (const balance of balances) {
    const key = `${balance.chain}:${balance.symbol}`;
    const existing = aggregated.get(key);
    if (existing) {
      existing.balance += balance.balance;
      existing.usdValue = (existing.usdValue || 0) + (balance.usdValue || 0);
    } else {
      aggregated.set(key, { ...balance });
    }
  }
  return aggregated;
}
function calculateAllocation(balances) {
  const totalValue = calculatePortfolioValue(balances);
  if (totalValue === 0) return [];
  return balances.filter((b) => b.usdValue && b.usdValue > 0).map((b) => ({
    symbol: b.symbol,
    chain: b.chain,
    valueUsd: b.usdValue,
    percentage: b.usdValue / totalValue * 100,
    assetType: b.assetType || "native"
  })).sort((a, b) => b.valueUsd - a.valueUsd);
}
function createWalletSummary(balances, tokens = [], nftCount = 0) {
  const nativeBalances = balances.filter(
    (b) => !b.assetType || b.assetType === "native"
  );
  const activeChains = [...new Set(balances.map((b) => b.chain))];
  return {
    totalValueUsd: calculatePortfolioValue(balances),
    nativeBalances,
    tokens,
    nftCount,
    activeChains,
    updatedAt: /* @__PURE__ */ new Date()
  };
}
function satsToBsv(sats) {
  return sats / 1e8;
}
function bsvToSats(bsv) {
  return Math.round(bsv * 1e8);
}
function weiToEth(wei) {
  return Number(wei) / 1e18;
}
function ethToWei(eth) {
  return BigInt(Math.round(eth * 1e18));
}
function lamportsToSol(lamports) {
  return lamports / 1e9;
}
function solToLamports(sol) {
  return Math.round(sol * 1e9);
}
function getAddressExplorerUrl(chain, address) {
  const base = CHAIN_EXPLORERS[chain];
  switch (chain) {
    case "bsv":
      return `${base}/address/${address}`;
    case "bitcoin":
      return `${base}/address/${address}`;
    case "ethereum":
    case "polygon":
    case "arbitrum":
    case "base":
    case "avalanche":
      return `${base}/address/${address}`;
    case "solana":
      return `${base}/account/${address}`;
    default:
      return `${base}/address/${address}`;
  }
}
function getTxExplorerUrl(chain, txid) {
  const base = CHAIN_EXPLORERS[chain];
  switch (chain) {
    case "bsv":
      return `${base}/tx/${txid}`;
    case "bitcoin":
      return `${base}/tx/${txid}`;
    case "ethereum":
    case "polygon":
    case "arbitrum":
    case "base":
    case "avalanche":
      return `${base}/tx/${txid}`;
    case "solana":
      return `${base}/tx/${txid}`;
    default:
      return `${base}/tx/${txid}`;
  }
}
export {
  CHAIN_EXPLORERS,
  CHAIN_NAMES,
  CHAIN_SYMBOLS,
  aggregateBalances,
  bsvToSats,
  calculateAllocation,
  calculatePortfolioValue,
  createWalletSummary,
  ethToWei,
  formatBalance,
  formatUsdValue,
  getAddressExplorerUrl,
  getTxExplorerUrl,
  lamportsToSol,
  satsToBsv,
  solToLamports,
  weiToEth
};
//# sourceMappingURL=index.js.map