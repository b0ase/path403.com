/**
 * @b0ase/tokenization-modal
 *
 * Asset tokenization modal types and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Asset type */
export type AssetType =
  | 'real-estate'
  | 'equity'
  | 'debt'
  | 'commodity'
  | 'art'
  | 'collectible'
  | 'intellectual-property'
  | 'revenue-share'
  | 'utility'
  | 'other';

/** Token standard */
export type TokenStandard =
  | 'bsv-20'
  | 'bsv-21'
  | 'erc-20'
  | 'erc-721'
  | 'erc-1155'
  | 'spl'
  | 'ordinals';

/** Blockchain network */
export type BlockchainNetwork =
  | 'bsv'
  | 'bitcoin'
  | 'ethereum'
  | 'polygon'
  | 'solana'
  | 'base';

/** Tokenization status */
export type TokenizationStatus =
  | 'draft'
  | 'validating'
  | 'pending-legal'
  | 'pending-kyc'
  | 'deploying'
  | 'active'
  | 'paused'
  | 'completed'
  | 'failed';

/** Distribution method */
export type DistributionMethod =
  | 'fixed-price'
  | 'auction'
  | 'dutch-auction'
  | 'whitelist'
  | 'airdrop'
  | 'bonding-curve';

/** Compliance framework */
export type ComplianceFramework =
  | 'none'
  | 'reg-d'
  | 'reg-s'
  | 'reg-a'
  | 'reg-cf'
  | 'mifid-ii'
  | 'custom';

/** Ownership type */
export type OwnershipType =
  | 'full'
  | 'fractional'
  | 'time-based'
  | 'rights-only';

/** Asset details */
export interface AssetDetails {
  name: string;
  description: string;
  type: AssetType;
  category?: string;
  valuation: bigint;
  valuationCurrency: string;
  valuationDate: Date;
  documents: AssetDocument[];
  images: string[];
  location?: {
    address?: string;
    city?: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  metadata?: Record<string, unknown>;
}

/** Asset document */
export interface AssetDocument {
  id: string;
  name: string;
  type: 'legal' | 'valuation' | 'insurance' | 'audit' | 'other';
  url: string;
  hash?: string;
  uploadedAt: Date;
  verified: boolean;
}

/** Token configuration */
export interface TokenConfig {
  name: string;
  symbol: string;
  standard: TokenStandard;
  network: BlockchainNetwork;
  totalSupply: bigint;
  decimals: number;
  transferable: boolean;
  burnable: boolean;
  mintable: boolean;
  pausable: boolean;
}

/** Distribution configuration */
export interface DistributionConfig {
  method: DistributionMethod;
  pricePerToken: bigint;
  priceCurrency: string;
  minPurchase?: bigint;
  maxPurchase?: bigint;
  startDate?: Date;
  endDate?: Date;
  softCap?: bigint;
  hardCap?: bigint;
  whitelistRequired: boolean;
  vestingSchedule?: VestingSchedule;
}

/** Vesting schedule */
export interface VestingSchedule {
  cliffMonths: number;
  vestingMonths: number;
  immediatePercent: number;
  vestingType: 'linear' | 'cliff' | 'milestone';
}

/** Compliance configuration */
export interface ComplianceConfig {
  framework: ComplianceFramework;
  kycRequired: boolean;
  accreditedOnly: boolean;
  jurisdictions: string[];
  blockedCountries: string[];
  maxInvestors?: number;
  lockupPeriodDays?: number;
  transferRestrictions?: TransferRestriction[];
}

/** Transfer restriction */
export interface TransferRestriction {
  type: 'whitelist' | 'blacklist' | 'holding-period' | 'max-holders';
  value: string | number;
  description: string;
}

/** Revenue distribution */
export interface RevenueDistribution {
  enabled: boolean;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'on-demand';
  currency: string;
  minimumAmount?: bigint;
  distributionFee?: number;
}

/** Governance configuration */
export interface GovernanceConfig {
  enabled: boolean;
  votingThreshold: number;
  proposalThreshold: number;
  votingPeriodDays: number;
  timelock: number;
  quorumPercent: number;
}

/** Tokenization project */
export interface TokenizationProject {
  id: string;
  ownerId: string;
  asset: AssetDetails;
  token: TokenConfig;
  distribution: DistributionConfig;
  compliance: ComplianceConfig;
  revenue?: RevenueDistribution;
  governance?: GovernanceConfig;
  status: TokenizationStatus;
  contractAddress?: string;
  deploymentTxid?: string;
  createdAt: Date;
  updatedAt: Date;
  launchedAt?: Date;
  error?: string;
}

/** Modal step */
export interface ModalStep {
  id: string;
  title: string;
  description?: string;
  component: 'asset' | 'token' | 'distribution' | 'compliance' | 'review' | 'deploy';
  completed: boolean;
  active: boolean;
  optional?: boolean;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/** Validation error */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/** Validation warning */
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/** Investor */
export interface Investor {
  id: string;
  walletAddress: string;
  email?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  accredited: boolean;
  jurisdiction: string;
  investedAmount: bigint;
  tokenBalance: bigint;
  joinedAt: Date;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_TOKEN_CONFIG: Partial<TokenConfig> = {
  decimals: 8,
  transferable: true,
  burnable: false,
  mintable: false,
  pausable: true,
};

export const DEFAULT_DISTRIBUTION_CONFIG: Partial<DistributionConfig> = {
  method: 'fixed-price',
  priceCurrency: 'USD',
  whitelistRequired: false,
};

export const DEFAULT_COMPLIANCE_CONFIG: ComplianceConfig = {
  framework: 'none',
  kycRequired: false,
  accreditedOnly: false,
  jurisdictions: [],
  blockedCountries: [],
};

export const DEFAULT_STEPS: ModalStep[] = [
  { id: 'asset', title: 'Asset Details', component: 'asset', completed: false, active: true },
  { id: 'token', title: 'Token Setup', component: 'token', completed: false, active: false },
  { id: 'distribution', title: 'Distribution', component: 'distribution', completed: false, active: false },
  { id: 'compliance', title: 'Compliance', component: 'compliance', completed: false, active: false, optional: true },
  { id: 'review', title: 'Review', component: 'review', completed: false, active: false },
  { id: 'deploy', title: 'Deploy', component: 'deploy', completed: false, active: false },
];

// ============================================================================
// Tokenization Manager
// ============================================================================

export class TokenizationManager {
  private project: Partial<TokenizationProject>;
  private steps: ModalStep[];
  private currentStepIndex: number;
  private listeners: Set<(project: Partial<TokenizationProject>) => void> = new Set();

  constructor() {
    this.project = {
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.steps = DEFAULT_STEPS.map(s => ({ ...s }));
    this.currentStepIndex = 0;
  }

  // ==========================================================================
  // Project Management
  // ==========================================================================

  getProject(): Partial<TokenizationProject> {
    return { ...this.project };
  }

  setAssetDetails(asset: AssetDetails): void {
    this.project.asset = asset;
    this.project.updatedAt = new Date();
    this.notify();
  }

  setTokenConfig(token: TokenConfig): void {
    this.project.token = token;
    this.project.updatedAt = new Date();
    this.notify();
  }

  setDistributionConfig(distribution: DistributionConfig): void {
    this.project.distribution = distribution;
    this.project.updatedAt = new Date();
    this.notify();
  }

  setComplianceConfig(compliance: ComplianceConfig): void {
    this.project.compliance = compliance;
    this.project.updatedAt = new Date();
    this.notify();
  }

  setRevenueDistribution(revenue: RevenueDistribution): void {
    this.project.revenue = revenue;
    this.project.updatedAt = new Date();
    this.notify();
  }

  setGovernanceConfig(governance: GovernanceConfig): void {
    this.project.governance = governance;
    this.project.updatedAt = new Date();
    this.notify();
  }

  // ==========================================================================
  // Step Management
  // ==========================================================================

  getSteps(): ModalStep[] {
    return this.steps.map(s => ({ ...s }));
  }

  getCurrentStep(): ModalStep {
    return { ...this.steps[this.currentStepIndex] };
  }

  nextStep(): boolean {
    if (this.currentStepIndex >= this.steps.length - 1) return false;

    const validation = this.validateCurrentStep();
    if (!validation.valid) return false;

    this.steps[this.currentStepIndex].completed = true;
    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex++;
    this.steps[this.currentStepIndex].active = true;

    return true;
  }

  prevStep(): boolean {
    if (this.currentStepIndex <= 0) return false;

    this.steps[this.currentStepIndex].active = false;
    this.currentStepIndex--;
    this.steps[this.currentStepIndex].active = true;
    this.steps[this.currentStepIndex].completed = false;

    return true;
  }

  goToStep(stepId: string): boolean {
    const index = this.steps.findIndex(s => s.id === stepId);
    if (index < 0) return false;

    // Can only go to completed steps or current step
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

  validateCurrentStep(): ValidationResult {
    const step = this.getCurrentStep();

    switch (step.component) {
      case 'asset':
        return this.validateAsset();
      case 'token':
        return this.validateToken();
      case 'distribution':
        return this.validateDistribution();
      case 'compliance':
        return this.validateCompliance();
      case 'review':
        return this.validateAll();
      default:
        return { valid: true, errors: [], warnings: [] };
    }
  }

  private validateAsset(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const asset = this.project.asset;

    if (!asset?.name?.trim()) {
      errors.push({ field: 'asset.name', message: 'Asset name is required', code: 'REQUIRED' });
    }

    if (!asset?.type) {
      errors.push({ field: 'asset.type', message: 'Asset type is required', code: 'REQUIRED' });
    }

    if (!asset?.valuation || asset.valuation <= 0n) {
      errors.push({ field: 'asset.valuation', message: 'Valid valuation is required', code: 'INVALID' });
    }

    if (!asset?.documents?.length) {
      warnings.push({
        field: 'asset.documents',
        message: 'No documents uploaded',
        suggestion: 'Upload legal and valuation documents for investor confidence',
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateToken(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const token = this.project.token;

    if (!token?.name?.trim()) {
      errors.push({ field: 'token.name', message: 'Token name is required', code: 'REQUIRED' });
    }

    if (!token?.symbol?.trim()) {
      errors.push({ field: 'token.symbol', message: 'Token symbol is required', code: 'REQUIRED' });
    } else if (token.symbol.length > 10) {
      errors.push({ field: 'token.symbol', message: 'Symbol must be 10 characters or less', code: 'MAX_LENGTH' });
    }

    if (!token?.totalSupply || token.totalSupply <= 0n) {
      errors.push({ field: 'token.totalSupply', message: 'Total supply must be greater than 0', code: 'INVALID' });
    }

    if (!token?.standard) {
      errors.push({ field: 'token.standard', message: 'Token standard is required', code: 'REQUIRED' });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateDistribution(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const dist = this.project.distribution;

    if (!dist?.pricePerToken || dist.pricePerToken <= 0n) {
      errors.push({ field: 'distribution.pricePerToken', message: 'Price per token is required', code: 'REQUIRED' });
    }

    if (dist?.startDate && dist?.endDate && dist.startDate >= dist.endDate) {
      errors.push({ field: 'distribution.endDate', message: 'End date must be after start date', code: 'INVALID' });
    }

    if (dist?.softCap && dist?.hardCap && dist.softCap > dist.hardCap) {
      errors.push({ field: 'distribution.softCap', message: 'Soft cap cannot exceed hard cap', code: 'INVALID' });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private validateCompliance(): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const compliance = this.project.compliance;

    if (compliance?.framework !== 'none' && !compliance?.jurisdictions?.length) {
      errors.push({
        field: 'compliance.jurisdictions',
        message: 'At least one jurisdiction required for compliance framework',
        code: 'REQUIRED',
      });
    }

    if (compliance?.accreditedOnly && !compliance?.kycRequired) {
      warnings.push({
        field: 'compliance.kycRequired',
        message: 'KYC typically required for accredited investor verification',
        suggestion: 'Enable KYC to verify accredited status',
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  validateAll(): ValidationResult {
    const results = [
      this.validateAsset(),
      this.validateToken(),
      this.validateDistribution(),
      this.validateCompliance(),
    ];

    return {
      valid: results.every(r => r.valid),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings),
    };
  }

  // ==========================================================================
  // Deployment
  // ==========================================================================

  async deploy(callback: (project: TokenizationProject) => Promise<{ contractAddress: string; txid: string }>): Promise<TokenizationProject | null> {
    const validation = this.validateAll();
    if (!validation.valid) return null;

    try {
      this.project.status = 'deploying';
      this.notify();

      const fullProject: TokenizationProject = {
        id: generateProjectId(),
        ownerId: '',
        asset: this.project.asset!,
        token: this.project.token!,
        distribution: this.project.distribution!,
        compliance: this.project.compliance || DEFAULT_COMPLIANCE_CONFIG,
        revenue: this.project.revenue,
        governance: this.project.governance,
        status: 'deploying',
        createdAt: this.project.createdAt!,
        updatedAt: new Date(),
      };

      const result = await callback(fullProject);

      fullProject.contractAddress = result.contractAddress;
      fullProject.deploymentTxid = result.txid;
      fullProject.status = 'active';
      fullProject.launchedAt = new Date();

      this.project = fullProject;
      this.notify();

      return fullProject;
    } catch (error) {
      this.project.status = 'failed';
      this.project.error = error instanceof Error ? error.message : 'Deployment failed';
      this.notify();
      return null;
    }
  }

  // ==========================================================================
  // Subscription
  // ==========================================================================

  subscribe(callback: (project: Partial<TokenizationProject>) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify(): void {
    const project = this.getProject();
    for (const listener of this.listeners) {
      listener(project);
    }
  }

  // ==========================================================================
  // Reset
  // ==========================================================================

  reset(): void {
    this.project = {
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.steps = DEFAULT_STEPS.map(s => ({ ...s }));
    this.currentStepIndex = 0;
    this.notify();
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createTokenizationManager(): TokenizationManager {
  return new TokenizationManager();
}

// ============================================================================
// Utility Functions
// ============================================================================

function generateProjectId(): string {
  return `token_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function formatValuation(amount: bigint, currency: string): string {
  const num = Number(amount);
  if (num >= 1_000_000_000) {
    return `${currency}${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${currency}${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${currency}${(num / 1_000).toFixed(2)}K`;
  }
  return `${currency}${num.toFixed(2)}`;
}

export function calculateTokenPrice(valuation: bigint, totalSupply: bigint): bigint {
  if (totalSupply === 0n) return 0n;
  return valuation / totalSupply;
}

export function calculateOwnershipPercent(tokens: bigint, totalSupply: bigint): number {
  if (totalSupply === 0n) return 0;
  return Number((tokens * 10000n) / totalSupply) / 100;
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  const fractionStr = fraction.toString().padStart(decimals, '0');
  return `${whole}.${fractionStr}`;
}

export function parseTokenAmount(str: string, decimals: number): bigint {
  const [whole, fraction = ''] = str.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole) * BigInt(10 ** decimals) + BigInt(paddedFraction);
}

export function getAssetTypeLabel(type: AssetType): string {
  const labels: Record<AssetType, string> = {
    'real-estate': 'Real Estate',
    equity: 'Equity',
    debt: 'Debt Instrument',
    commodity: 'Commodity',
    art: 'Art',
    collectible: 'Collectible',
    'intellectual-property': 'Intellectual Property',
    'revenue-share': 'Revenue Share',
    utility: 'Utility Token',
    other: 'Other',
  };
  return labels[type] || type;
}

export function getStandardLabel(standard: TokenStandard): string {
  const labels: Record<TokenStandard, string> = {
    'bsv-20': 'BSV-20',
    'bsv-21': 'BSV-21',
    'erc-20': 'ERC-20',
    'erc-721': 'ERC-721',
    'erc-1155': 'ERC-1155',
    spl: 'Solana SPL',
    ordinals: 'Ordinals',
  };
  return labels[standard] || standard;
}

export function getNetworkLabel(network: BlockchainNetwork): string {
  const labels: Record<BlockchainNetwork, string> = {
    bsv: 'Bitcoin SV',
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    polygon: 'Polygon',
    solana: 'Solana',
    base: 'Base',
  };
  return labels[network] || network;
}

export function estimateDeploymentCost(
  network: BlockchainNetwork,
  standard: TokenStandard
): { amount: bigint; currency: string } {
  const costs: Record<BlockchainNetwork, { amount: bigint; currency: string }> = {
    bsv: { amount: 10000n, currency: 'satoshis' },
    bitcoin: { amount: 50000n, currency: 'satoshis' },
    ethereum: { amount: 50000000000000000n, currency: 'wei' },
    polygon: { amount: 1000000000000000n, currency: 'wei' },
    solana: { amount: 10000000n, currency: 'lamports' },
    base: { amount: 5000000000000000n, currency: 'wei' },
  };
  return costs[network] || { amount: 0n, currency: 'unknown' };
}
