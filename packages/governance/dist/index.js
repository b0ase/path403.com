// src/governance.ts
var DEFAULT_CONFIG = {
  quorumPercent: 10,
  approvalThreshold: 50,
  proposalThreshold: BigInt(1e3),
  votingPeriodSeconds: 7 * 24 * 60 * 60,
  // 7 days
  executionDelaySeconds: 2 * 24 * 60 * 60,
  // 2 days
  allowDelegation: true,
  allowVoteChanging: false,
  allowedProposalTypes: ["general", "treasury", "parameter", "membership"]
};
var GovernanceEngine = class {
  constructor(config = {}) {
    this.proposals = /* @__PURE__ */ new Map();
    this.votes = /* @__PURE__ */ new Map();
    // proposalId -> votes
    this.voters = /* @__PURE__ */ new Map();
    this.proposalCounter = 0;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  /**
   * Generate unique ID
   */
  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  // ==========================================================================
  // Voter Management
  // ==========================================================================
  /**
   * Register or update voter
   */
  registerVoter(voter) {
    this.voters.set(voter.id, voter);
    return voter;
  }
  /**
   * Get voter
   */
  getVoter(voterId) {
    return this.voters.get(voterId);
  }
  /**
   * Get voting power for a voter
   */
  getVotingPower(voterId) {
    const voter = this.voters.get(voterId);
    if (!voter) {
      return {
        ownPower: BigInt(0),
        delegatedPower: BigInt(0),
        totalPower: BigInt(0),
        delegatedAway: BigInt(0)
      };
    }
    if (voter.delegatingTo) {
      return {
        ownPower: voter.votingPower,
        delegatedPower: BigInt(0),
        totalPower: BigInt(0),
        delegatedAway: voter.votingPower
      };
    }
    return {
      ownPower: voter.votingPower,
      delegatedPower: voter.delegatedPower || BigInt(0),
      totalPower: voter.votingPower + (voter.delegatedPower || BigInt(0)),
      delegatedAway: BigInt(0)
    };
  }
  /**
   * Delegate voting power
   */
  delegate(fromVoterId, toVoterId) {
    if (!this.config.allowDelegation) {
      throw new Error("Delegation is not allowed");
    }
    const fromVoter = this.voters.get(fromVoterId);
    const toVoter = this.voters.get(toVoterId);
    if (!fromVoter) throw new Error("From voter not found");
    if (!toVoter) throw new Error("To voter not found");
    if (fromVoterId === toVoterId) throw new Error("Cannot delegate to self");
    if (fromVoter.delegatingTo) {
      const prevDelegate = this.voters.get(fromVoter.delegatingTo);
      if (prevDelegate) {
        prevDelegate.delegatedPower = (prevDelegate.delegatedPower || BigInt(0)) - fromVoter.votingPower;
      }
    }
    fromVoter.delegatingTo = toVoterId;
    toVoter.delegatedPower = (toVoter.delegatedPower || BigInt(0)) + fromVoter.votingPower;
  }
  /**
   * Remove delegation
   */
  undelegate(voterId) {
    const voter = this.voters.get(voterId);
    if (!voter || !voter.delegatingTo) return;
    const delegate = this.voters.get(voter.delegatingTo);
    if (delegate) {
      delegate.delegatedPower = (delegate.delegatedPower || BigInt(0)) - voter.votingPower;
    }
    voter.delegatingTo = void 0;
  }
  // ==========================================================================
  // Proposal Management
  // ==========================================================================
  /**
   * Create a new proposal
   */
  createProposal(proposerId, input) {
    const voter = this.voters.get(proposerId);
    if (!voter) {
      throw new Error("Proposer not found");
    }
    const votingPower = this.getVotingPower(proposerId).totalPower;
    if (votingPower < this.config.proposalThreshold) {
      throw new Error(
        `Insufficient voting power. Required: ${this.config.proposalThreshold}, Have: ${votingPower}`
      );
    }
    if (!this.config.allowedProposalTypes.includes(input.type)) {
      throw new Error(`Proposal type not allowed: ${input.type}`);
    }
    const now = /* @__PURE__ */ new Date();
    const startTime = now;
    const endTime = new Date(
      now.getTime() + this.config.votingPeriodSeconds * 1e3
    );
    let totalVotingSupply = BigInt(0);
    for (const v of this.voters.values()) {
      totalVotingSupply += v.votingPower;
    }
    this.proposalCounter++;
    const proposal = {
      id: this.generateId("prop"),
      number: this.proposalCounter,
      title: input.title,
      description: input.description,
      type: input.type,
      status: "active",
      proposerId,
      proposerAddress: voter.address,
      actions: input.actions || [],
      config: {
        quorumPercent: this.config.quorumPercent,
        approvalThreshold: this.config.approvalThreshold,
        votingPeriodSeconds: this.config.votingPeriodSeconds,
        executionDelaySeconds: this.config.executionDelaySeconds,
        totalVotingSupply
      },
      forVotes: BigInt(0),
      againstVotes: BigInt(0),
      abstainVotes: BigInt(0),
      createdAt: now,
      startTime,
      endTime,
      discussionUrl: input.discussionUrl,
      metadata: input.metadata
    };
    this.proposals.set(proposal.id, proposal);
    this.votes.set(proposal.id, []);
    return proposal;
  }
  /**
   * Get proposal by ID
   */
  getProposal(proposalId) {
    return this.proposals.get(proposalId);
  }
  /**
   * List proposals
   */
  listProposals(filter) {
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
  cancelProposal(proposalId, cancelerId) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.proposerId !== cancelerId) {
      throw new Error("Only proposer can cancel");
    }
    if (!["draft", "pending", "active"].includes(proposal.status)) {
      throw new Error(`Cannot cancel proposal in status: ${proposal.status}`);
    }
    proposal.status = "cancelled";
    proposal.cancelledAt = /* @__PURE__ */ new Date();
    return proposal;
  }
  // ==========================================================================
  // Voting
  // ==========================================================================
  /**
   * Cast a vote
   */
  castVote(voterId, input) {
    const voter = this.voters.get(voterId);
    if (!voter) throw new Error("Voter not found");
    const proposal = this.proposals.get(input.proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "active") {
      throw new Error(`Cannot vote on proposal in status: ${proposal.status}`);
    }
    const now = /* @__PURE__ */ new Date();
    if (now < proposal.startTime || now > proposal.endTime) {
      throw new Error("Voting period not active");
    }
    const proposalVotes = this.votes.get(input.proposalId) || [];
    const existingVote = proposalVotes.find((v) => v.voterId === voterId);
    if (existingVote && !this.config.allowVoteChanging) {
      throw new Error("Already voted and vote changing not allowed");
    }
    const votingPower = this.getVotingPower(voterId).totalPower;
    if (votingPower === BigInt(0)) {
      throw new Error("No voting power");
    }
    if (existingVote) {
      switch (existingVote.choice) {
        case "for":
          proposal.forVotes -= existingVote.votingPower;
          break;
        case "against":
          proposal.againstVotes -= existingVote.votingPower;
          break;
        case "abstain":
          proposal.abstainVotes -= existingVote.votingPower;
          break;
      }
      const voteIndex = proposalVotes.indexOf(existingVote);
      proposalVotes.splice(voteIndex, 1);
    }
    const vote = {
      id: this.generateId("vote"),
      proposalId: input.proposalId,
      voterId,
      voterAddress: voter.address,
      choice: input.choice,
      votingPower,
      reason: input.reason,
      votedAt: now
    };
    switch (input.choice) {
      case "for":
        proposal.forVotes += votingPower;
        break;
      case "against":
        proposal.againstVotes += votingPower;
        break;
      case "abstain":
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
  getVotes(proposalId) {
    return this.votes.get(proposalId) || [];
  }
  /**
   * Get vote by voter for a proposal
   */
  getVote(proposalId, voterId) {
    const votes = this.votes.get(proposalId) || [];
    return votes.find((v) => v.voterId === voterId);
  }
  // ==========================================================================
  // Proposal Resolution
  // ==========================================================================
  /**
   * Calculate proposal result
   */
  calculateResult(proposalId) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error("Proposal not found");
    const totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
    const quorumRequired = proposal.config.totalVotingSupply * BigInt(proposal.config.quorumPercent) / BigInt(100);
    const quorumReached = totalVotes >= quorumRequired;
    const votesForApproval = proposal.forVotes + proposal.againstVotes;
    const approvalPercent = votesForApproval > BigInt(0) ? Number(proposal.forVotes * BigInt(1e4) / votesForApproval) / 100 : 0;
    const participationPercent = proposal.config.totalVotingSupply > BigInt(0) ? Number(
      totalVotes * BigInt(1e4) / proposal.config.totalVotingSupply
    ) / 100 : 0;
    const passed = quorumReached && approvalPercent >= proposal.config.approvalThreshold;
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
      participationPercent
    };
  }
  /**
   * Finalize proposal (after voting period ends)
   */
  finalizeProposal(proposalId) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "active") {
      throw new Error(`Cannot finalize proposal in status: ${proposal.status}`);
    }
    const now = /* @__PURE__ */ new Date();
    if (now <= proposal.endTime) {
      throw new Error("Voting period not ended");
    }
    const result = this.calculateResult(proposalId);
    proposal.status = result.passed ? "passed" : "rejected";
    return proposal;
  }
  /**
   * Execute proposal (after timelock)
   */
  executeProposal(proposalId) {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) throw new Error("Proposal not found");
    if (proposal.status !== "passed") {
      throw new Error(`Cannot execute proposal in status: ${proposal.status}`);
    }
    const now = /* @__PURE__ */ new Date();
    const executionTime = new Date(
      proposal.endTime.getTime() + proposal.config.executionDelaySeconds * 1e3
    );
    if (now < executionTime) {
      throw new Error("Execution delay not passed");
    }
    proposal.status = "executed";
    proposal.executedAt = now;
    return proposal;
  }
  /**
   * Check and update proposal statuses
   */
  updateProposalStatuses() {
    const updated = [];
    const now = /* @__PURE__ */ new Date();
    for (const proposal of this.proposals.values()) {
      if (proposal.status === "active" && now > proposal.endTime) {
        this.finalizeProposal(proposal.id);
        updated.push(proposal);
      }
    }
    return updated;
  }
};
function createGovernanceEngine(config) {
  return new GovernanceEngine(config);
}
export {
  GovernanceEngine,
  createGovernanceEngine
};
//# sourceMappingURL=index.js.map