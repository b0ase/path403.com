/**
 * @b0ase/governance - Governance engine
 *
 * Manages proposals, voting, and execution.
 */

import type {
  ProposalStatus,
  ProposalType,
  VoteChoice,
  Voter,
  Vote,
  Proposal,
  ProposalAction,
  VotingConfigSnapshot,
  GovernanceConfig,
  CreateProposalInput,
  CastVoteInput,
  ProposalResult,
  VotingPowerBreakdown,
} from './types';

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: GovernanceConfig = {
  quorumPercent: 10,
  approvalThreshold: 50,
  proposalThreshold: BigInt(1000),
  votingPeriodSeconds: 7 * 24 * 60 * 60, // 7 days
  executionDelaySeconds: 2 * 24 * 60 * 60, // 2 days
  allowDelegation: true,
  allowVoteChanging: false,
  allowedProposalTypes: ['general', 'treasury', 'parameter', 'membership'],
};

// ============================================================================
// Governance Engine Class
// ============================================================================

/**
 * Governance Engine
 *
 * Manages token-based governance with proposals, voting, and execution.
 */
export class GovernanceEngine {
  private config: GovernanceConfig;
  private proposals: Map<string, Proposal> = new Map();
  private votes: Map<string, Vote[]> = new Map(); // proposalId -> votes
  private voters: Map<string, Voter> = new Map();
  private proposalCounter: number = 0;

  constructor(config: Partial<GovernanceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==========================================================================
  // Voter Management
  // ==========================================================================

  /**
   * Register or update voter
   */
  registerVoter(voter: Voter): Voter {
    this.voters.set(voter.id, voter);
    return voter;
  }

  /**
   * Get voter
   */
  getVoter(voterId: string): Voter | undefined {
    return this.voters.get(voterId);
  }

  /**
   * Get voting power for a voter
   */
  getVotingPower(voterId: string): VotingPowerBreakdown {
    const voter = this.voters.get(voterId);
    if (!voter) {
      return {
        ownPower: BigInt(0),
        delegatedPower: BigInt(0),
        totalPower: BigInt(0),
        delegatedAway: BigInt(0),
      };
    }

    // If voter delegated away, they have no voting power
    if (voter.delegatingTo) {
      return {
        ownPower: voter.votingPower,
        delegatedPower: BigInt(0),
        totalPower: BigInt(0),
        delegatedAway: voter.votingPower,
      };
    }

    return {
      ownPower: voter.votingPower,
      delegatedPower: voter.delegatedPower || BigInt(0),
      totalPower: voter.votingPower + (voter.delegatedPower || BigInt(0)),
      delegatedAway: BigInt(0),
    };
  }

  /**
   * Delegate voting power
   */
  delegate(fromVoterId: string, toVoterId: string): void {
    if (!this.config.allowDelegation) {
      throw new Error('Delegation is not allowed');
    }

    const fromVoter = this.voters.get(fromVoterId);
    const toVoter = this.voters.get(toVoterId);

    if (!fromVoter) throw new Error('From voter not found');
    if (!toVoter) throw new Error('To voter not found');
    if (fromVoterId === toVoterId) throw new Error('Cannot delegate to self');

    // Remove previous delegation
    if (fromVoter.delegatingTo) {
      const prevDelegate = this.voters.get(fromVoter.delegatingTo);
      if (prevDelegate) {
        prevDelegate.delegatedPower =
          (prevDelegate.delegatedPower || BigInt(0)) - fromVoter.votingPower;
      }
    }

    // Add new delegation
    fromVoter.delegatingTo = toVoterId;
    toVoter.delegatedPower =
      (toVoter.delegatedPower || BigInt(0)) + fromVoter.votingPower;
  }

  /**
   * Remove delegation
   */
  undelegate(voterId: string): void {
    const voter = this.voters.get(voterId);
    if (!voter || !voter.delegatingTo) return;

    const delegate = this.voters.get(voter.delegatingTo);
    if (delegate) {
      delegate.delegatedPower =
        (delegate.delegatedPower || BigInt(0)) - voter.votingPower;
    }

    voter.delegatingTo = undefined;
  }

  // ==========================================================================
  // Proposal Management
  // ==========================================================================

  /**
   * Create a new proposal
   */
  createProposal(
    proposerId: string,
    input: CreateProposalInput
  ): Proposal {
    const voter = this.voters.get(proposerId);
    if (!voter) {
      throw new Error('Proposer not found');
    }

    // Check proposal threshold
    const votingPower = this.getVotingPower(proposerId).totalPower;
    if (votingPower < this.config.proposalThreshold) {
      throw new Error(
        `Insufficient voting power. Required: ${this.config.proposalThreshold}, Have: ${votingPower}`
      );
    }

    // Check proposal type allowed
    if (!this.config.allowedProposalTypes.includes(input.type)) {
      throw new Error(`Proposal type not allowed: ${input.type}`);
    }

    const now = new Date();
    const startTime = now;
    const endTime = new Date(
      now.getTime() + this.config.votingPeriodSeconds * 1000
    );

    // Calculate total voting supply
    let totalVotingSupply = BigInt(0);
    for (const v of this.voters.values()) {
      totalVotingSupply += v.votingPower;
    }

    this.proposalCounter++;

    const proposal: Proposal = {
      id: this.generateId('prop'),
      number: this.proposalCounter,
      title: input.title,
      description: input.description,
      type: input.type,
      status: 'active',
      proposerId,
      proposerAddress: voter.address,
      actions: input.actions || [],
      config: {
        quorumPercent: this.config.quorumPercent,
        approvalThreshold: this.config.approvalThreshold,
        votingPeriodSeconds: this.config.votingPeriodSeconds,
        executionDelaySeconds: this.config.executionDelaySeconds,
        totalVotingSupply,
      },
      forVotes: BigInt(0),
      againstVotes: BigInt(0),
      abstainVotes: BigInt(0),
      createdAt: now,
      startTime,
      endTime,
      discussionUrl: input.discussionUrl,
      metadata: input.metadata,
    };

    this.proposals.set(proposal.id, proposal);
    this.votes.set(proposal.id, []);

    return proposal;
  }

  /**
   * Get proposal by ID
   */
  getProposal(proposalId: string): Proposal | undefined {
    return this.proposals.get(proposalId);
  }

  /**
   * List proposals
   */
  listProposals(filter?: {
    status?: ProposalStatus;
    type?: ProposalType;
    proposerId?: string;
  }): Proposal[] {
    let proposals = Array.from(this.proposals.values());

    if (filter?.status) {
      proposals = proposals.filter((p) => p.status === filter.status);
    }
    if (filter?.type) {
      proposals = proposals.filter((p) => p.type === filter.type);
    }
    if (filter?.proposerId) {
      proposals = proposals.filter((p) => p.proposerId === filter.proposerId);
    }

    return proposals.sort((a, b) => b.number - a.number);
  }

  /**
   * Cancel proposal (proposer only)
   */
  cancelProposal(proposalId: string, cancelerId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    if (proposal.proposerId !== cancelerId) {
      throw new Error('Only proposer can cancel');
    }

    if (!['draft', 'pending', 'active'].includes(proposal.status)) {
      throw new Error(`Cannot cancel proposal in status: ${proposal.status}`);
    }

    proposal.status = 'cancelled';
    proposal.cancelledAt = new Date();

    return proposal;
  }

  // ==========================================================================
  // Voting
  // ==========================================================================

  /**
   * Cast a vote
   */
  castVote(voterId: string, input: CastVoteInput): Vote {
    const voter = this.voters.get(voterId);
    if (!voter) throw new Error('Voter not found');

    const proposal = this.proposals.get(input.proposalId);
    if (!proposal) throw new Error('Proposal not found');

    // Check proposal is active
    if (proposal.status !== 'active') {
      throw new Error(`Cannot vote on proposal in status: ${proposal.status}`);
    }

    // Check voting period
    const now = new Date();
    if (now < proposal.startTime || now > proposal.endTime) {
      throw new Error('Voting period not active');
    }

    // Check if already voted
    const proposalVotes = this.votes.get(input.proposalId) || [];
    const existingVote = proposalVotes.find((v) => v.voterId === voterId);

    if (existingVote && !this.config.allowVoteChanging) {
      throw new Error('Already voted and vote changing not allowed');
    }

    // Get voting power
    const votingPower = this.getVotingPower(voterId).totalPower;
    if (votingPower === BigInt(0)) {
      throw new Error('No voting power');
    }

    // Remove previous vote if changing
    if (existingVote) {
      switch (existingVote.choice) {
        case 'for':
          proposal.forVotes -= existingVote.votingPower;
          break;
        case 'against':
          proposal.againstVotes -= existingVote.votingPower;
          break;
        case 'abstain':
          proposal.abstainVotes -= existingVote.votingPower;
          break;
      }
      // Remove from votes array
      const voteIndex = proposalVotes.indexOf(existingVote);
      proposalVotes.splice(voteIndex, 1);
    }

    // Create vote
    const vote: Vote = {
      id: this.generateId('vote'),
      proposalId: input.proposalId,
      voterId,
      voterAddress: voter.address,
      choice: input.choice,
      votingPower,
      reason: input.reason,
      votedAt: now,
    };

    // Apply vote
    switch (input.choice) {
      case 'for':
        proposal.forVotes += votingPower;
        break;
      case 'against':
        proposal.againstVotes += votingPower;
        break;
      case 'abstain':
        proposal.abstainVotes += votingPower;
        break;
    }

    proposalVotes.push(vote);
    this.votes.set(input.proposalId, proposalVotes);

    return vote;
  }

  /**
   * Get votes for a proposal
   */
  getVotes(proposalId: string): Vote[] {
    return this.votes.get(proposalId) || [];
  }

  /**
   * Get vote by voter for a proposal
   */
  getVote(proposalId: string, voterId: string): Vote | undefined {
    const votes = this.votes.get(proposalId) || [];
    return votes.find((v) => v.voterId === voterId);
  }

  // ==========================================================================
  // Proposal Resolution
  // ==========================================================================

  /**
   * Calculate proposal result
   */
  calculateResult(proposalId: string): ProposalResult {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    const totalVotes =
      proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
    const quorumRequired =
      (proposal.config.totalVotingSupply *
        BigInt(proposal.config.quorumPercent)) /
      BigInt(100);
    const quorumReached = totalVotes >= quorumRequired;

    // Approval is for / (for + against), abstains don't count
    const votesForApproval = proposal.forVotes + proposal.againstVotes;
    const approvalPercent =
      votesForApproval > BigInt(0)
        ? Number((proposal.forVotes * BigInt(10000)) / votesForApproval) / 100
        : 0;

    const participationPercent =
      proposal.config.totalVotingSupply > BigInt(0)
        ? Number(
            (totalVotes * BigInt(10000)) / proposal.config.totalVotingSupply
          ) / 100
        : 0;

    const passed =
      quorumReached && approvalPercent >= proposal.config.approvalThreshold;

    return {
      proposalId,
      passed,
      forVotes: proposal.forVotes,
      againstVotes: proposal.againstVotes,
      abstainVotes: proposal.abstainVotes,
      totalVotes,
      quorumReached,
      quorumRequired,
      approvalPercent,
      approvalRequired: proposal.config.approvalThreshold,
      participationPercent,
    };
  }

  /**
   * Finalize proposal (after voting period ends)
   */
  finalizeProposal(proposalId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    if (proposal.status !== 'active') {
      throw new Error(`Cannot finalize proposal in status: ${proposal.status}`);
    }

    const now = new Date();
    if (now <= proposal.endTime) {
      throw new Error('Voting period not ended');
    }

    const result = this.calculateResult(proposalId);
    proposal.status = result.passed ? 'passed' : 'rejected';

    return proposal;
  }

  /**
   * Execute proposal (after timelock)
   */
  executeProposal(proposalId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error('Proposal not found');

    if (proposal.status !== 'passed') {
      throw new Error(`Cannot execute proposal in status: ${proposal.status}`);
    }

    const now = new Date();
    const executionTime = new Date(
      proposal.endTime.getTime() + proposal.config.executionDelaySeconds * 1000
    );

    if (now < executionTime) {
      throw new Error('Execution delay not passed');
    }

    proposal.status = 'executed';
    proposal.executedAt = now;

    return proposal;
  }

  /**
   * Check and update proposal statuses
   */
  updateProposalStatuses(): Proposal[] {
    const updated: Proposal[] = [];
    const now = new Date();

    for (const proposal of this.proposals.values()) {
      if (proposal.status === 'active' && now > proposal.endTime) {
        this.finalizeProposal(proposal.id);
        updated.push(proposal);
      }
    }

    return updated;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a governance engine
 */
export function createGovernanceEngine(
  config?: Partial<GovernanceConfig>
): GovernanceEngine {
  return new GovernanceEngine(config);
}
