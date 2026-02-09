/**
 * @b0ase/governance - Type definitions
 *
 * Token-based governance with proposals, voting, and quorum.
 */
/** Proposal status */
type ProposalStatus = 'draft' | 'pending' | 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled' | 'expired';
/** Proposal type */
type ProposalType = 'general' | 'treasury' | 'parameter' | 'membership' | 'upgrade' | 'emergency';
/** Vote choice */
type VoteChoice = 'for' | 'against' | 'abstain';
/** Voter information */
interface Voter {
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
interface Vote {
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
/** Proposal action (what happens if passed) */
interface ProposalAction {
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
interface Proposal {
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
interface VotingConfigSnapshot {
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
/** Governance configuration */
interface GovernanceConfig {
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
/** Create proposal input */
interface CreateProposalInput {
    title: string;
    description: string;
    type: ProposalType;
    actions?: ProposalAction[];
    discussionUrl?: string;
    metadata?: Record<string, unknown>;
}
/** Cast vote input */
interface CastVoteInput {
    proposalId: string;
    choice: VoteChoice;
    reason?: string;
}
/** Proposal result summary */
interface ProposalResult {
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
interface VotingPowerBreakdown {
    /** Own tokens */
    ownPower: bigint;
    /** Delegated to this voter */
    delegatedPower: bigint;
    /** Total voting power */
    totalPower: bigint;
    /** Power delegated to others */
    delegatedAway: bigint;
}

/**
 * @b0ase/governance - Governance engine
 *
 * Manages proposals, voting, and execution.
 */

/**
 * Governance Engine
 *
 * Manages token-based governance with proposals, voting, and execution.
 */
declare class GovernanceEngine {
    private config;
    private proposals;
    private votes;
    private voters;
    private proposalCounter;
    constructor(config?: Partial<GovernanceConfig>);
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Register or update voter
     */
    registerVoter(voter: Voter): Voter;
    /**
     * Get voter
     */
    getVoter(voterId: string): Voter | undefined;
    /**
     * Get voting power for a voter
     */
    getVotingPower(voterId: string): VotingPowerBreakdown;
    /**
     * Delegate voting power
     */
    delegate(fromVoterId: string, toVoterId: string): void;
    /**
     * Remove delegation
     */
    undelegate(voterId: string): void;
    /**
     * Create a new proposal
     */
    createProposal(proposerId: string, input: CreateProposalInput): Proposal;
    /**
     * Get proposal by ID
     */
    getProposal(proposalId: string): Proposal | undefined;
    /**
     * List proposals
     */
    listProposals(filter?: {
        status?: ProposalStatus;
        type?: ProposalType;
        proposerId?: string;
    }): Proposal[];
    /**
     * Cancel proposal (proposer only)
     */
    cancelProposal(proposalId: string, cancelerId: string): Proposal;
    /**
     * Cast a vote
     */
    castVote(voterId: string, input: CastVoteInput): Vote;
    /**
     * Get votes for a proposal
     */
    getVotes(proposalId: string): Vote[];
    /**
     * Get vote by voter for a proposal
     */
    getVote(proposalId: string, voterId: string): Vote | undefined;
    /**
     * Calculate proposal result
     */
    calculateResult(proposalId: string): ProposalResult;
    /**
     * Finalize proposal (after voting period ends)
     */
    finalizeProposal(proposalId: string): Proposal;
    /**
     * Execute proposal (after timelock)
     */
    executeProposal(proposalId: string): Proposal;
    /**
     * Check and update proposal statuses
     */
    updateProposalStatuses(): Proposal[];
}
/**
 * Create a governance engine
 */
declare function createGovernanceEngine(config?: Partial<GovernanceConfig>): GovernanceEngine;

export { type CastVoteInput, type CreateProposalInput, type GovernanceConfig, GovernanceEngine, type Proposal, type ProposalAction, type ProposalResult, type ProposalStatus, type ProposalType, type Vote, type VoteChoice, type Voter, type VotingConfigSnapshot, type VotingPowerBreakdown, createGovernanceEngine };
