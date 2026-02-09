/**
 * @b0ase/shareholder-ui
 *
 * Cap table and shareholder display types and utilities.
 *
 * @packageDocumentation
 */
/** Shareholder type */
type ShareholderType = 'founder' | 'investor' | 'employee' | 'advisor' | 'treasury' | 'reserved' | 'public';
/** Share class */
type ShareClass = 'common' | 'preferred' | 'seed' | 'series-a' | 'series-b' | 'options';
/** Vesting status */
type VestingStatus = 'not-started' | 'vesting' | 'fully-vested' | 'cancelled';
/** Shareholder */
interface Shareholder {
    id: string;
    name: string;
    type: ShareholderType;
    address?: string;
    email?: string;
    avatarUrl?: string;
    shares: bigint;
    shareClass: ShareClass;
    percentOwnership: number;
    vestingSchedule?: VestingSchedule;
    acquisitionDate: Date;
    pricePerShare?: number;
    totalInvested?: number;
    metadata?: Record<string, unknown>;
}
/** Vesting schedule */
interface VestingSchedule {
    totalShares: bigint;
    vestedShares: bigint;
    unvestedShares: bigint;
    cliffDate: Date;
    vestingEndDate: Date;
    vestingPeriodMonths: number;
    cliffMonths: number;
    status: VestingStatus;
    nextVestingDate?: Date;
    vestingEvents: VestingEvent[];
}
/** Vesting event */
interface VestingEvent {
    date: Date;
    sharesVested: bigint;
    percentVested: number;
    isClaimed: boolean;
}
/** Cap table */
interface CapTable {
    companyName: string;
    totalShares: bigint;
    issuedShares: bigint;
    reservedShares: bigint;
    shareholders: Shareholder[];
    shareClasses: ShareClassInfo[];
    valuation?: number;
    pricePerShare?: number;
    lastUpdated: Date;
}
/** Share class info */
interface ShareClassInfo {
    class: ShareClass;
    totalShares: bigint;
    issuedShares: bigint;
    pricePerShare?: number;
    votingRights: number;
    liquidationPreference?: number;
    participatingPreferred?: boolean;
}
/** Ownership summary */
interface OwnershipSummary {
    byType: Record<ShareholderType, {
        count: number;
        shares: bigint;
        percent: number;
    }>;
    byClass: Record<ShareClass, {
        count: number;
        shares: bigint;
        percent: number;
    }>;
    topHolders: Shareholder[];
    totalHolders: number;
}
/** Distribution round */
interface DistributionRound {
    id: string;
    name: string;
    totalAmount: number;
    currency: string;
    perShareAmount: number;
    eligibleShares: bigint;
    distributedAt: Date;
    payments: DistributionPayment[];
}
/** Distribution payment */
interface DistributionPayment {
    shareholderId: string;
    shareholderName: string;
    shares: bigint;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    txid?: string;
}
declare class CapTableManager {
    private capTable;
    constructor(companyName: string, totalShares: bigint);
    private generateId;
    addShareholder(input: Omit<Shareholder, 'id' | 'percentOwnership'>): Shareholder;
    removeShareholder(id: string): boolean;
    updateShares(id: string, newShares: bigint): Shareholder | undefined;
    private recalculateOwnership;
    getCapTable(): CapTable;
    getShareholder(id: string): Shareholder | undefined;
    getOwnershipSummary(): OwnershipSummary;
    calculateDistribution(totalAmount: number, currency?: string): DistributionPayment[];
    setValuation(valuation: number): void;
}
declare function createCapTableManager(companyName: string, totalShares: bigint): CapTableManager;
declare function formatShares(shares: bigint): string;
declare function formatPercent(percent: number, decimals?: number): string;
declare function calculateDilution(currentShares: bigint, newShares: bigint): number;
declare function getVestingProgress(schedule: VestingSchedule): number;
declare function getNextVestingAmount(schedule: VestingSchedule): bigint;

export { type CapTable, CapTableManager, type DistributionPayment, type DistributionRound, type OwnershipSummary, type ShareClass, type ShareClassInfo, type Shareholder, type ShareholderType, type VestingEvent, type VestingSchedule, type VestingStatus, calculateDilution, createCapTableManager, formatPercent, formatShares, getNextVestingAmount, getVestingProgress };
