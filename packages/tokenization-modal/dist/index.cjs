"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_COMPLIANCE_CONFIG: () => DEFAULT_COMPLIANCE_CONFIG,
  DEFAULT_DISTRIBUTION_CONFIG: () => DEFAULT_DISTRIBUTION_CONFIG,
  DEFAULT_STEPS: () => DEFAULT_STEPS,
  DEFAULT_TOKEN_CONFIG: () => DEFAULT_TOKEN_CONFIG,
  TokenizationManager: () => TokenizationManager,
  calculateOwnershipPercent: () => calculateOwnershipPercent,
  calculateTokenPrice: () => calculateTokenPrice,
  createTokenizationManager: () => createTokenizationManager,
  estimateDeploymentCost: () => estimateDeploymentCost,
  formatTokenAmount: () => formatTokenAmount,
  formatValuation: () => formatValuation,
  getAssetTypeLabel: () => getAssetTypeLabel,
  getNetworkLabel: () => getNetworkLabel,
  getStandardLabel: () => getStandardLabel,
  parseTokenAmount: () => parseTokenAmount
});
module.exports = __toCommonJS(index_exports);
var DEFAULT_TOKEN_CONFIG = {
  decimals: 8,
  transferable: true,
  burnable: false,
  mintable: false,
  pausable: true
};
var DEFAULT_DISTRIBUTION_CONFIG = {
  method: "fixed-price",
  priceCurrency: "USD",
  whitelistRequired: false
};
var DEFAULT_COMPLIANCE_CONFIG = {
  framework: "none",
  kycRequired: false,
  accreditedOnly: false,
  jurisdictions: [],
  blockedCountries: []
};
var DEFAULT_STEPS = [
  { id: "asset", title: "Asset Details", component: "asset", completed: false, active: true },
  { id: "token", title: "Token Setup", component: "token", completed: false, active: false },
  { id: "distribution", title: "Distribution", component: "distribution", completed: false, active: false },
  { id: "compliance", title: "Compliance", component: "compliance", completed: false, active: false, optional: true },
  { id: "review", title: "Review", component: "review", completed: false, active: false },
  { id: "deploy", title: "Deploy", component: "deploy", completed: false, active: false }
];
var TokenizationManager = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Set();
    this.project = {
      status: "draft",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.steps = DEFAULT_STEPS.map((s) => ({ ...s }));
    this.currentStepIndex = 0;
  }
  // ==========================================================================
  // Project Management
  // ==========================================================================
  getProject() {
    return { ...this.project };
  }
  setAssetDetails(asset) {
    this.project.asset = asset;
    this.project.updatedAt = /* @__PURE__ */ new Date();
    this.notify();
  }
  setTokenConfig(token) {
    this.project.token = token;
    this.project.updatedAt = /* @__PURE__ */ new Date();
    this.notify();
  }
  setDistributionConfig(distribution) {
    this.project.distribution = distribution;
    this.project.updatedAt = /* @__PURE__ */ new Date();
    this.notify();
  }
  setComplianceConfig(compliance) {
    this.project.compliance = compliance;
    this.project.updatedAt = /* @__PURE__ */ new Date();
    this.notify();
  }
  setRevenueDistribution(revenue) {
    this.project.revenue = revenue;
    this.project.updatedAt = /* @__PURE__ */ new Date();
    this.notify();
  }
  setGovernanceConfig(governance) {
    this.project.governance = governance;
    this.project.updatedAt = /* @__PURE__ */ new Date();
    this.notify();
  }
  // ==========================================================================
  // Step Management
  // ==========================================================================
  getSteps() {
    return this.steps.map((s) => ({ ...s }));
  }
  getCurrentStep() {
    return { ...this.steps[this.currentStepIndex] };
  }
  nextStep() {
    if (this.currentStepIndex >= this.steps.length - 1) return false;
    const validation = this.validateCurrentStep();
    if (!validation.valid) return false;
    this.steps[this.currentStepIndex].completed = true;
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex++;
    this.steps[this.currentStepIndex].active = true;
    return true;
  }
  prevStep() {
    if (this.currentStepIndex <= 0) return false;
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex--;
    this.steps[this.currentStepIndex].active = true;
    this.steps[this.currentStepIndex].completed = false;
    return true;
  }
  goToStep(stepId) {
    const index = this.steps.findIndex((s) => s.id === stepId);
    if (index < 0) return false;
    if (index > this.currentStepIndex && !this.steps[index - 1]?.completed) {
      return false;
    }
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex = index;
    this.steps[this.currentStepIndex].active = true;
    return true;
  }
  // ==========================================================================
  // Validation
  // ==========================================================================
  validateCurrentStep() {
    const step = this.getCurrentStep();
    switch (step.component) {
      case "asset":
        return this.validateAsset();
      case "token":
        return this.validateToken();
      case "distribution":
        return this.validateDistribution();
      case "compliance":
        return this.validateCompliance();
      case "review":
        return this.validateAll();
      default:
        return { valid: true, errors: [], warnings: [] };
    }
  }
  validateAsset() {
    const errors = [];
    const warnings = [];
    const asset = this.project.asset;
    if (!asset?.name?.trim()) {
      errors.push({ field: "asset.name", message: "Asset name is required", code: "REQUIRED" });
    }
    if (!asset?.type) {
      errors.push({ field: "asset.type", message: "Asset type is required", code: "REQUIRED" });
    }
    if (!asset?.valuation || asset.valuation <= 0n) {
      errors.push({ field: "asset.valuation", message: "Valid valuation is required", code: "INVALID" });
    }
    if (!asset?.documents?.length) {
      warnings.push({
        field: "asset.documents",
        message: "No documents uploaded",
        suggestion: "Upload legal and valuation documents for investor confidence"
      });
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  validateToken() {
    const errors = [];
    const warnings = [];
    const token = this.project.token;
    if (!token?.name?.trim()) {
      errors.push({ field: "token.name", message: "Token name is required", code: "REQUIRED" });
    }
    if (!token?.symbol?.trim()) {
      errors.push({ field: "token.symbol", message: "Token symbol is required", code: "REQUIRED" });
    } else if (token.symbol.length > 10) {
      errors.push({ field: "token.symbol", message: "Symbol must be 10 characters or less", code: "MAX_LENGTH" });
    }
    if (!token?.totalSupply || token.totalSupply <= 0n) {
      errors.push({ field: "token.totalSupply", message: "Total supply must be greater than 0", code: "INVALID" });
    }
    if (!token?.standard) {
      errors.push({ field: "token.standard", message: "Token standard is required", code: "REQUIRED" });
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  validateDistribution() {
    const errors = [];
    const warnings = [];
    const dist = this.project.distribution;
    if (!dist?.pricePerToken || dist.pricePerToken <= 0n) {
      errors.push({ field: "distribution.pricePerToken", message: "Price per token is required", code: "REQUIRED" });
    }
    if (dist?.startDate && dist?.endDate && dist.startDate >= dist.endDate) {
      errors.push({ field: "distribution.endDate", message: "End date must be after start date", code: "INVALID" });
    }
    if (dist?.softCap && dist?.hardCap && dist.softCap > dist.hardCap) {
      errors.push({ field: "distribution.softCap", message: "Soft cap cannot exceed hard cap", code: "INVALID" });
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  validateCompliance() {
    const errors = [];
    const warnings = [];
    const compliance = this.project.compliance;
    if (compliance?.framework !== "none" && !compliance?.jurisdictions?.length) {
      errors.push({
        field: "compliance.jurisdictions",
        message: "At least one jurisdiction required for compliance framework",
        code: "REQUIRED"
      });
    }
    if (compliance?.accreditedOnly && !compliance?.kycRequired) {
      warnings.push({
        field: "compliance.kycRequired",
        message: "KYC typically required for accredited investor verification",
        suggestion: "Enable KYC to verify accredited status"
      });
    }
    return { valid: errors.length === 0, errors, warnings };
  }
  validateAll() {
    const results = [
      this.validateAsset(),
      this.validateToken(),
      this.validateDistribution(),
      this.validateCompliance()
    ];
    return {
      valid: results.every((r) => r.valid),
      errors: results.flatMap((r) => r.errors),
      warnings: results.flatMap((r) => r.warnings)
    };
  }
  // ==========================================================================
  // Deployment
  // ==========================================================================
  async deploy(callback) {
    const validation = this.validateAll();
    if (!validation.valid) return null;
    try {
      this.project.status = "deploying";
      this.notify();
      const fullProject = {
        id: generateProjectId(),
        ownerId: "",
        asset: this.project.asset,
        token: this.project.token,
        distribution: this.project.distribution,
        compliance: this.project.compliance || DEFAULT_COMPLIANCE_CONFIG,
        revenue: this.project.revenue,
        governance: this.project.governance,
        status: "deploying",
        createdAt: this.project.createdAt,
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await callback(fullProject);
      fullProject.contractAddress = result.contractAddress;
      fullProject.deploymentTxid = result.txid;
      fullProject.status = "active";
      fullProject.launchedAt = /* @__PURE__ */ new Date();
      this.project = fullProject;
      this.notify();
      return fullProject;
    } catch (error) {
      this.project.status = "failed";
      this.project.error = error instanceof Error ? error.message : "Deployment failed";
      this.notify();
      return null;
    }
  }
  // ==========================================================================
  // Subscription
  // ==========================================================================
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  notify() {
    const project = this.getProject();
    for (const listener of this.listeners) {
      listener(project);
    }
  }
  // ==========================================================================
  // Reset
  // ==========================================================================
  reset() {
    this.project = {
      status: "draft",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.steps = DEFAULT_STEPS.map((s) => ({ ...s }));
    this.currentStepIndex = 0;
    this.notify();
  }
};
function createTokenizationManager() {
  return new TokenizationManager();
}
function generateProjectId() {
  return `token_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
function formatValuation(amount, currency) {
  const num = Number(amount);
  if (num >= 1e9) {
    return `${currency}${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `${currency}${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `${currency}${(num / 1e3).toFixed(2)}K`;
  }
  return `${currency}${num.toFixed(2)}`;
}
function calculateTokenPrice(valuation, totalSupply) {
  if (totalSupply === 0n) return 0n;
  return valuation / totalSupply;
}
function calculateOwnershipPercent(tokens, totalSupply) {
  if (totalSupply === 0n) return 0;
  return Number(tokens * 10000n / totalSupply) / 100;
}
function formatTokenAmount(amount, decimals) {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0");
  return `${whole}.${fractionStr}`;
}
function parseTokenAmount(str, decimals) {
  const [whole, fraction = ""] = str.split(".");
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction);
}
function getAssetTypeLabel(type) {
  const labels = {
    "real-estate": "Real Estate",
    equity: "Equity",
    debt: "Debt Instrument",
    commodity: "Commodity",
    art: "Art",
    collectible: "Collectible",
    "intellectual-property": "Intellectual Property",
    "revenue-share": "Revenue Share",
    utility: "Utility Token",
    other: "Other"
  };
  return labels[type] || type;
}
function getStandardLabel(standard) {
  const labels = {
    "bsv-20": "BSV-20",
    "bsv-21": "BSV-21",
    "erc-20": "ERC-20",
    "erc-721": "ERC-721",
    "erc-1155": "ERC-1155",
    spl: "Solana SPL",
    ordinals: "Ordinals"
  };
  return labels[standard] || standard;
}
function getNetworkLabel(network) {
  const labels = {
    bsv: "Bitcoin SV",
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    polygon: "Polygon",
    solana: "Solana",
    base: "Base"
  };
  return labels[network] || network;
}
function estimateDeploymentCost(network, standard) {
  const costs = {
    bsv: { amount: 10000n, currency: "satoshis" },
    bitcoin: { amount: 50000n, currency: "satoshis" },
    ethereum: { amount: 50000000000000000n, currency: "wei" },
    polygon: { amount: 1000000000000000n, currency: "wei" },
    solana: { amount: 10000000n, currency: "lamports" },
    base: { amount: 5000000000000000n, currency: "wei" }
  };
  return costs[network] || { amount: 0n, currency: "unknown" };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_COMPLIANCE_CONFIG,
  DEFAULT_DISTRIBUTION_CONFIG,
  DEFAULT_STEPS,
  DEFAULT_TOKEN_CONFIG,
  TokenizationManager,
  calculateOwnershipPercent,
  calculateTokenPrice,
  createTokenizationManager,
  estimateDeploymentCost,
  formatTokenAmount,
  formatValuation,
  getAssetTypeLabel,
  getNetworkLabel,
  getStandardLabel,
  parseTokenAmount
});
//# sourceMappingURL=index.cjs.map