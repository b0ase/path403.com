/**
 * @b0ase/governance - Type definitions
 *
 * Token-based governance with proposals, voting, and quorum.
 */

// ============================================================================
// Proposal Types
// ============================================================================

/** Proposal status */
export type ProposalStatus =
  | 'draft'
  | 'pending'
  | 'active'
  | 'passed'
  | 'rejected'
  | 'executed'
  | 'cancelled'
  | 'expired';

/** Proposal type */
export type ProposalType =
  | 'general'        // General governance proposal
  | 'treasury'       // Treasury/spending proposal
  | 'parameter'      // Parameter change
  | 'membership'     // Membership changes
  | 'upgrade'        // Protocol/system upgrade
  | 'emergency';     // Emergency action

/** Vote choice */
export type VoteChoice = 'for' | 'against' | 'abstain';

// ============================================================================
// Voter Types
// ============================================================================

/** Voter information */
export interface Voter {
  /** Voter ID (user/wallet ID) */
  id: string;
  /** Voter address or handle */
  address: string;
  /** Display name */
  displayName?: string;
  /** Token balance at snapshot */
  votingPower: bigint;
  /** Delegated voting power */
  delegatedPower?: bigint;
  /** Delegating to (if delegated) */
  delegatingTo?: string;
}

/** Vote record */
export interface Vote {
  /** Vote ID */
  id: string;
  /** Proposal ID */
  proposalId: string;
  /** Voter ID */
  voterId: string;
  /** Voter address */
  voterAddress: string;
  /** Vote choice */
  choice: VoteChoice;
  /** Voting power used */
  votingPower: bigint;
  /** Vote reason (optional) */
  reason?: string;
  /** Vote timestamp */
  votedAt: Date;
  /** Transaction reference (if on-chain) */
  txid?: string;
}

// ============================================================================
// Proposal Types
// ============================================================================

/** Proposal action (what happens if passed) */
export interface ProposalAction {
  /** Action type */
  type: 'transfer' | 'parameter' | 'call' | 'custom';
  /** Target (address, contract, etc.) */
  target?: string;
  /** Value (for transfers) */
  value?: bigint;
  /** Currency/token */
  currency?: string;
  /** Call data (for contract calls) */
  callData?: string;
  /** Description */
  description: string;
}

/** Proposal definition */
export interface Proposal {
  /** Unique proposal ID */
  id: string;
  /** Proposal number (sequential) */
  number: number;
  /** Proposal title */
  title: string;
  /** Proposal description (markdown) */
  description: string;
  /** Proposal type */
  type: ProposalType;
  /** Current status */
  status: ProposalStatus;

  /** Proposer ID */
  proposerId: string;
  /** Proposer address */
  proposerAddress: string;

  /** Actions to execute if passed */
  actions: ProposalAction[];

  /** Voting configuration snapshot */
  config: VotingConfigSnapshot;

  /** Vote counts */
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;

  /** Timestamps */
  createdAt: Date;
  startTime: Date;
  endTime: Date;
  executedAt?: Date;
  cancelledAt?: Date;

  /** Block/snapshot height for voting power */
  snapshotHeight?: number;

  /** Discussion URL */
  discussionUrl?: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/** Voting config snapshot (frozen at proposal creation) */
export interface VotingConfigSnapshot {
  /** Quorum percentage (0-100) */
  quorumPercent: number;
  /** Approval threshold percentage (0-100) */
  approvalThreshold: number;
  /** Voting period in seconds */
  votingPeriodSeconds: number;
  /** Execution delay in seconds */
  executionDelaySeconds: number;
  /** Total voting supply at snapshot */
  totalVotingSupply: bigint;
}

// ============================================================================
// Governance Configuration
// ============================================================================

/** Governance configuration */
export interface GovernanceConfig {
  /** Quorum percentage (0-100) */
  quorumPercent: number;
  /** Approval threshold percentage (0-100) */
  approvalThreshold: number;
  /** Proposal threshold (min tokens to propose) */
  proposalThreshold: bigint;
  /** Voting period in seconds */
  votingPeriodSeconds: number;
  /** Execution delay in seconds (timelock) */
  executionDelaySeconds: number;
  /** Allow delegation */
  allowDelegation: boolean;
  /** Allow vote changing */
  allowVoteChanging: boolean;
  /** Proposal types allowed */
  allowedProposalTypes: ProposalType[];
}

// ============================================================================
// Input Types
// ============================================================================

/** Create proposal input */
export interface CreateProposalInput {
  title: string;
  description: string;
  type: ProposalType;
  actions?: ProposalAction[];
  discussionUrl?: string;
  metadata?: Record<string, unknown>;
}

/** Cast vote input */
export interface CastVoteInput {
  proposalId: string;
  choice: VoteChoice;
  reason?: string;
}

// ============================================================================
// Result Types
// ============================================================================

/** Proposal result summary */
export interface ProposalResult {
  proposalId: string;
  passed: boolean;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  totalVotes: bigint;
  quorumReached: boolean;
  quorumRequired: bigint;
  approvalPercent: number;
  approvalRequired: number;
  participationPercent: number;
}

/** Voting power breakdown */
export interface VotingPowerBreakdown {
  /** Own tokens */
  ownPower: bigint;
  /** Delegated to this voter */
  delegatedPower: bigint;
  /** Total voting power */
  totalPower: bigint;
  /** Power delegated to others */
  delegatedAway: bigint;
}
