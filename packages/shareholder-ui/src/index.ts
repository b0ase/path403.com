/**
 * @b0ase/shareholder-ui
 *
 * Cap table and shareholder display types and utilities.
 *
 * @packageDocumentation
 */

// ============================================================================
// Types
// ============================================================================

/** Shareholder type */
export type ShareholderType =
  | 'founder'
  | 'investor'
  | 'employee'
  | 'advisor'
  | 'treasury'
  | 'reserved'
  | 'public';

/** Share class */
export type ShareClass = 'common' | 'preferred' | 'seed' | 'series-a' | 'series-b' | 'options';

/** Vesting status */
export type VestingStatus = 'not-started' | 'vesting' | 'fully-vested' | 'cancelled';

/** Shareholder */
export interface Shareholder {
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
export interface VestingSchedule {
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
export interface VestingEvent {
  date: Date;
  sharesVested: bigint;
  percentVested: number;
  isClaimed: boolean;
}

/** Cap table */
export interface CapTable {
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
export interface ShareClassInfo {
  class: ShareClass;
  totalShares: bigint;
  issuedShares: bigint;
  pricePerShare?: number;
  votingRights: number;
  liquidationPreference?: number;
  participatingPreferred?: boolean;
}

/** Ownership summary */
export interface OwnershipSummary {
  byType: Record<ShareholderType, { count: number; shares: bigint; percent: number }>;
  byClass: Record<ShareClass, { count: number; shares: bigint; percent: number }>;
  topHolders: Shareholder[];
  totalHolders: number;
}

/** Distribution round */
export interface DistributionRound {
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
export interface DistributionPayment {
  shareholderId: string;
  shareholderName: string;
  shares: bigint;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  txid?: string;
}

// ============================================================================
// Cap Table Manager
// ============================================================================

export class CapTableManager {
  private capTable: CapTable;

  constructor(companyName: string, totalShares: bigint) {
    this.capTable = {
      companyName,
      totalShares,
      issuedShares: BigInt(0),
      reservedShares: BigInt(0),
      shareholders: [],
      shareClasses: [],
      lastUpdated: new Date(),
    };
  }

  private generateId(): string {
    return `sh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addShareholder(input: Omit<Shareholder, 'id' | 'percentOwnership'>): Shareholder {
    const shareholder: Shareholder = {
      ...input,
      id: this.generateId(),
      percentOwnership: 0,
    };

    this.capTable.shareholders.push(shareholder);
    this.capTable.issuedShares += input.shares;
    this.recalculateOwnership();
    this.capTable.lastUpdated = new Date();

    return shareholder;
  }

  removeShareholder(id: string): boolean {
    const index = this.capTable.shareholders.findIndex(s => s.id === id);
    if (index === -1) return false;

    const shareholder = this.capTable.shareholders[index];
    this.capTable.issuedShares -= shareholder.shares;
    this.capTable.shareholders.splice(index, 1);
    this.recalculateOwnership();
    this.capTable.lastUpdated = new Date();

    return true;
  }

  updateShares(id: string, newShares: bigint): Shareholder | undefined {
    const shareholder = this.capTable.shareholders.find(s => s.id === id);
    if (!shareholder) return undefined;

    const diff = newShares - shareholder.shares;
    shareholder.shares = newShares;
    this.capTable.issuedShares += diff;
    this.recalculateOwnership();
    this.capTable.lastUpdated = new Date();

    return shareholder;
  }

  private recalculateOwnership(): void {
    const total = Number(this.capTable.issuedShares);
    for (const shareholder of this.capTable.shareholders) {
      shareholder.percentOwnership = total > 0
        ? (Number(shareholder.shares) / total) * 100
        : 0;
    }
  }

  getCapTable(): CapTable {
    return { ...this.capTable };
  }

  getShareholder(id: string): Shareholder | undefined {
    return this.capTable.shareholders.find(s => s.id === id);
  }

  getOwnershipSummary(): OwnershipSummary {
    const byType: Record<string, { count: number; shares: bigint; percent: number }> = {};
    const byClass: Record<string, { count: number; shares: bigint; percent: number }> = {};

    for (const sh of this.capTable.shareholders) {
      // By type
      if (!byType[sh.type]) {
        byType[sh.type] = { count: 0, shares: BigInt(0), percent: 0 };
      }
      byType[sh.type].count++;
      byType[sh.type].shares += sh.shares;
      byType[sh.type].percent += sh.percentOwnership;

      // By class
      if (!byClass[sh.shareClass]) {
        byClass[sh.shareClass] = { count: 0, shares: BigInt(0), percent: 0 };
      }
      byClass[sh.shareClass].count++;
      byClass[sh.shareClass].shares += sh.shares;
      byClass[sh.shareClass].percent += sh.percentOwnership;
    }

    const topHolders = [...this.capTable.shareholders]
      .sort((a, b) => Number(b.shares - a.shares))
      .slice(0, 10);

    return {
      byType: byType as OwnershipSummary['byType'],
      byClass: byClass as OwnershipSummary['byClass'],
      topHolders,
      totalHolders: this.capTable.shareholders.length,
    };
  }

  calculateDistribution(totalAmount: number, currency: string = 'USD'): DistributionPayment[] {
    const payments: DistributionPayment[] = [];
    const eligibleShares = this.capTable.issuedShares;

    if (eligibleShares === BigInt(0)) return payments;

    const perShareAmount = totalAmount / Number(eligibleShares);

    for (const sh of this.capTable.shareholders) {
      payments.push({
        shareholderId: sh.id,
        shareholderName: sh.name,
        shares: sh.shares,
        amount: Number(sh.shares) * perShareAmount,
        status: 'pending',
      });
    }

    return payments;
  }

  setValuation(valuation: number): void {
    this.capTable.valuation = valuation;
    this.capTable.pricePerShare = valuation / Number(this.capTable.totalShares);
    this.capTable.lastUpdated = new Date();
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function createCapTableManager(companyName: string, totalShares: bigint): CapTableManager {
  return new CapTableManager(companyName, totalShares);
}

export function formatShares(shares: bigint): string {
  const num = Number(shares);
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toLocaleString();
}

export function formatPercent(percent: number, decimals: number = 2): string {
  return `${percent.toFixed(decimals)}%`;
}

export function calculateDilution(currentShares: bigint, newShares: bigint): number {
  const total = currentShares + newShares;
  return (Number(newShares) / Number(total)) * 100;
}

export function getVestingProgress(schedule: VestingSchedule): number {
  return Number(schedule.vestedShares) / Number(schedule.totalShares) * 100;
}

export function getNextVestingAmount(schedule: VestingSchedule): bigint {
  const monthlyVest = schedule.totalShares / BigInt(schedule.vestingPeriodMonths - schedule.cliffMonths);
  return monthlyVest;
}
