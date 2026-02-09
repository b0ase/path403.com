/**
 * @b0ase/governance
 *
 * Token-based governance with proposals, voting, and quorum.
 *
 * @example
 * ```typescript
 * import { GovernanceEngine, createGovernanceEngine } from '@b0ase/governance';
 *
 * // Create engine with custom config
 * const governance = createGovernanceEngine({
 *   quorumPercent: 20,
 *   approvalThreshold: 66,
 *   votingPeriodSeconds: 3 * 24 * 60 * 60, // 3 days
 * });
 *
 * // Register voters with their token balances
 * governance.registerVoter({
 *   id: 'alice',
 *   address: '$alice',
 *   displayName: 'Alice',
 *   votingPower: 1000n,
 * });
 *
 * governance.registerVoter({
 *   id: 'bob',
 *   address: '$bob',
 *   displayName: 'Bob',
 *   votingPower: 500n,
 * });
 *
 * // Create a proposal
 * const proposal = governance.createProposal('alice', {
 *   title: 'Treasury Allocation',
 *   description: 'Allocate 1000 tokens to marketing...',
 *   type: 'treasury',
 *   actions: [{
 *     type: 'transfer',
 *     target: 'marketing-wallet',
 *     value: 1000n,
 *     description: 'Marketing budget allocation',
 *   }],
 * });
 *
 * // Cast votes
 * governance.castVote('alice', {
 *   proposalId: proposal.id,
 *   choice: 'for',
 *   reason: 'We need marketing push',
 * });
 *
 * governance.castVote('bob', {
 *   proposalId: proposal.id,
 *   choice: 'against',
 *   reason: 'Too expensive',
 * });
 *
 * // Get result
 * const result = governance.calculateResult(proposal.id);
 * console.log(`Passed: ${result.passed}, Approval: ${result.approvalPercent}%`);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Status and types
  ProposalStatus,
  ProposalType,
  VoteChoice,

  // Voter types
  Voter,
  Vote,

  // Proposal types
  ProposalAction,
  Proposal,
  VotingConfigSnapshot,

  // Configuration
  GovernanceConfig,

  // Input types
  CreateProposalInput,
  CastVoteInput,

  // Result types
  ProposalResult,
  VotingPowerBreakdown,
} from './types';

// ============================================================================
// Engine Exports
// ============================================================================

export {
  GovernanceEngine,
  createGovernanceEngine,
} from './governance';
