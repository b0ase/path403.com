/**
 * @b0ase/tokenization-modal
 *
 * Asset tokenization modal types and utilities.
 *
 * @packageDocumentation
 */
/** Asset type */
type AssetType = 'real-estate' | 'equity' | 'debt' | 'commodity' | 'art' | 'collectible' | 'intellectual-property' | 'revenue-share' | 'utility' | 'other';
/** Token standard */
type TokenStandard = 'bsv-20' | 'bsv-21' | 'erc-20' | 'erc-721' | 'erc-1155' | 'spl' | 'ordinals';
/** Blockchain network */
type BlockchainNetwork = 'bsv' | 'bitcoin' | 'ethereum' | 'polygon' | 'solana' | 'base';
/** Tokenization status */
type TokenizationStatus = 'draft' | 'validating' | 'pending-legal' | 'pending-kyc' | 'deploying' | 'active' | 'paused' | 'completed' | 'failed';
/** Distribution method */
type DistributionMethod = 'fixed-price' | 'auction' | 'dutch-auction' | 'whitelist' | 'airdrop' | 'bonding-curve';
/** Compliance framework */
type ComplianceFramework = 'none' | 'reg-d' | 'reg-s' | 'reg-a' | 'reg-cf' | 'mifid-ii' | 'custom';
/** Ownership type */
type OwnershipType = 'full' | 'fractional' | 'time-based' | 'rights-only';
/** Asset details */
interface AssetDetails {
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
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    metadata?: Record<string, unknown>;
}
/** Asset document */
interface AssetDocument {
    id: string;
    name: string;
    type: 'legal' | 'valuation' | 'insurance' | 'audit' | 'other';
    url: string;
    hash?: string;
    uploadedAt: Date;
    verified: boolean;
}
/** Token configuration */
interface TokenConfig {
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
interface DistributionConfig {
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
interface VestingSchedule {
    cliffMonths: number;
    vestingMonths: number;
    immediatePercent: number;
    vestingType: 'linear' | 'cliff' | 'milestone';
}
/** Compliance configuration */
interface ComplianceConfig {
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
interface TransferRestriction {
    type: 'whitelist' | 'blacklist' | 'holding-period' | 'max-holders';
    value: string | number;
    description: string;
}
/** Revenue distribution */
interface RevenueDistribution {
    enabled: boolean;
    frequency: 'monthly' | 'quarterly' | 'annually' | 'on-demand';
    currency: string;
    minimumAmount?: bigint;
    distributionFee?: number;
}
/** Governance configuration */
interface GovernanceConfig {
    enabled: boolean;
    votingThreshold: number;
    proposalThreshold: number;
    votingPeriodDays: number;
    timelock: number;
    quorumPercent: number;
}
/** Tokenization project */
interface TokenizationProject {
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
interface ModalStep {
    id: string;
    title: string;
    description?: string;
    component: 'asset' | 'token' | 'distribution' | 'compliance' | 'review' | 'deploy';
    completed: boolean;
    active: boolean;
    optional?: boolean;
}
/** Validation result */
interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
/** Validation error */
interface ValidationError {
    field: string;
    message: string;
    code: string;
}
/** Validation warning */
interface ValidationWarning {
    field: string;
    message: string;
    suggestion?: string;
}
/** Investor */
interface Investor {
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
declare const DEFAULT_TOKEN_CONFIG: Partial<TokenConfig>;
declare const DEFAULT_DISTRIBUTION_CONFIG: Partial<DistributionConfig>;
declare const DEFAULT_COMPLIANCE_CONFIG: ComplianceConfig;
declare const DEFAULT_STEPS: ModalStep[];
declare class TokenizationManager {
    private project;
    private steps;
    private currentStepIndex;
    private listeners;
    constructor();
    getProject(): Partial<TokenizationProject>;
    setAssetDetails(asset: AssetDetails): void;
    setTokenConfig(token: TokenConfig): void;
    setDistributionConfig(distribution: DistributionConfig): void;
    setComplianceConfig(compliance: ComplianceConfig): void;
    setRevenueDistribution(revenue: RevenueDistribution): void;
    setGovernanceConfig(governance: GovernanceConfig): void;
    getSteps(): ModalStep[];
    getCurrentStep(): ModalStep;
    nextStep(): boolean;
    prevStep(): boolean;
    goToStep(stepId: string): boolean;
    validateCurrentStep(): ValidationResult;
    private validateAsset;
    private validateToken;
    private validateDistribution;
    private validateCompliance;
    validateAll(): ValidationResult;
    deploy(callback: (project: TokenizationProject) => Promise<{
        contractAddress: string;
        txid: string;
    }>): Promise<TokenizationProject | null>;
    subscribe(callback: (project: Partial<TokenizationProject>) => void): () => void;
    private notify;
    reset(): void;
}
declare function createTokenizationManager(): TokenizationManager;
declare function formatValuation(amount: bigint, currency: string): string;
declare function calculateTokenPrice(valuation: bigint, totalSupply: bigint): bigint;
declare function calculateOwnershipPercent(tokens: bigint, totalSupply: bigint): number;
declare function formatTokenAmount(amount: bigint, decimals: number): string;
declare function parseTokenAmount(str: string, decimals: number): bigint;
declare function getAssetTypeLabel(type: AssetType): string;
declare function getStandardLabel(standard: TokenStandard): string;
declare function getNetworkLabel(network: BlockchainNetwork): string;
declare function estimateDeploymentCost(network: BlockchainNetwork, standard: TokenStandard): {
    amount: bigint;
    currency: string;
};

export { type AssetDetails, type AssetDocument, type AssetType, type BlockchainNetwork, type ComplianceConfig, type ComplianceFramework, DEFAULT_COMPLIANCE_CONFIG, DEFAULT_DISTRIBUTION_CONFIG, DEFAULT_STEPS, DEFAULT_TOKEN_CONFIG, type DistributionConfig, type DistributionMethod, type GovernanceConfig, type Investor, type ModalStep, type OwnershipType, type RevenueDistribution, type TokenConfig, type TokenStandard, TokenizationManager, type TokenizationProject, type TokenizationStatus, type TransferRestriction, type ValidationError, type ValidationResult, type ValidationWarning, type VestingSchedule, calculateOwnershipPercent, calculateTokenPrice, createTokenizationManager, estimateDeploymentCost, formatTokenAmount, formatValuation, getAssetTypeLabel, getNetworkLabel, getStandardLabel, parseTokenAmount };
