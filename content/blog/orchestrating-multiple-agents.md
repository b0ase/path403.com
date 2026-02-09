---
title: Orchestrating Multiple Agents That Actually Work
date: "2026-01-17T00:00:00.000Z"
author: B0ASE Team
audience: ["human","search","ai"]
canonical: "'https://b0ase.com/blog/orchestrating-multiple-agents'"
markdown: "'https://b0ase.com/blog/orchestrating-multiple-agents.md'"
slug: orchestrating-multiple-agents
topics: [""]
description: After building your first single agent, the next challenge isn't making it smarter—it's making multiple agents work together without burning through y...
---

After building your first single agent, the next challenge isn't making it smarter—it's making multiple agents work together without burning through your token budget or creating coordination chaos.

This guide covers what happens when you need more than one agent: orchestration patterns, communication strategies, and production lessons from real deployments.

> **Note:** This post is inspired by [Ganesh Gupta's excellent thread on multi-agent systems](https://x.com/ghumare64/status/2012136491133145364), expanded with b0ase production experience and opinionated best practices for building systems that actually ship.

## Why Multiple Agents?

Single agents hit limits fast. Context windows fill up, decision-making gets muddy, and debugging becomes impossible when one agent tries to do everything.

Multi-agent systems solve this by distributing work across specialized agents—similar to how you'd structure a team. The architect doesn't write frontend code. The database specialist doesn't design UX. Each person masters their domain.

## The Real Benefits

**Specialization:** Each agent masters one domain instead of being mediocre at everything. A financial analysis agent doesn't need to know how to generate videos. A code reviewer doesn't need to understand blockchain transactions.

**Parallel Processing:** Multiple agents work simultaneously on independent subtasks. Four agents running in parallel complete work in 3 seconds, not 12.

**Maintainability:** When something breaks, you know exactly which agent to fix. No more debugging a 5,000-line system prompt trying to figure out which instruction failed.

**Scalability:** Add new capabilities by adding new agents, not rewriting everything. Want to add PDF generation? Add a PDF agent. Don't modify the existing 10 agents.

## The Real Tradeoff

**Coordination overhead.** Agents need to communicate, share state, and avoid stepping on each other. Get this wrong and you've just built a more expensive failure mode.

Token costs scale non-linearly. Four agents don't cost 4x—they cost 6-10x because of coordination, synthesis, and error handling.

But when you need the capabilities, the tradeoff is worth it. The alternative is a single agent that's terrible at everything.

## The Three Orchestration Patterns

There are three proven patterns for coordinating multiple agents. Pick based on your coordination needs, not what sounds coolest.

## Pattern 1: Supervisor (Centralized Control)

A supervisor agent coordinates all work. It receives the task, breaks it into subtasks, routes to worker agents, validates outputs, and synthesizes the final response.

**Architecture:**

```
User Request
    ↓
[Supervisor Agent]
    ↓
Decompose → Route → Monitor → Validate → Synthesize
    ↓         ↓         ↓
[Worker 1] [Worker 2] [Worker 3]
```

**When to use it:**

- Tasks with clear decomposition into subtasks
- You need auditability and reasoning transparency
- Quality control matters more than speed
- Handling 3-8 worker agents max

**Real Implementation Example:**

The AI Hedge Fund pattern uses this approach. Four specialized analysts (Fundamental, Portfolio, Risk, Technical) run in parallel while a supervisor coordinates:

```typescript
// Supervisor coordinates parallel analysis
const analyses = await Promise.all([
  fundamentalAgent.analyze(ticker),
  portfolioAgent.analyze(ticker),
  riskAgent.analyze(ticker),
  technicalAgent.analyze(ticker)
]);

// Supervisor synthesizes results into coherent recommendation
const report = await supervisorAgent.synthesize(analyses);
```

**The Problem:**

Supervisors become bottlenecks. Every decision flows through one agent, which means serial processing for coordination steps even when work happens in parallel.

Token costs scale with coordination layers. The supervisor burns tokens decomposing, routing, validating, and synthesizing—even when workers do the actual work.

**b0ase Standard:**

Start here. Most multi-agent systems should use supervisor pattern until they hit specific problems it can't solve. It's debuggable, predictable, and scales to 5-8 agents before coordination overhead becomes unreasonable.

## Pattern 2: Swarm (Peer-to-Peer)

No central controller. Agents communicate directly, exchange information, and self-organize around the task. Think ant colonies, not org charts.

**Architecture:**

```
[Agent A] ←→ [Agent B]
    ↕  ↘     ↙  ↕
[Agent C] ←→ [Agent D]
```

Each agent can talk to any other agent. Information flows through the network until consensus emerges or the task is completed.

**When to use it:**

- Tasks benefit from multiple perspectives
- No clear decomposition into serial steps
- Real-time responsiveness matters
- Agents need to react to each other's work

**Real Implementation Example:**

Travel planning demonstrates peer coordination. Six agents (Destination Explorer, Flight Search, Hotel Search, Dining, Itinerary, Budget) share information through common state:

```typescript
// Each agent reads and writes to shared state
await destinationAgent.explore(state);
await flightAgent.search(state);  // Uses destination from previous agent
await hotelAgent.search(state);   // Uses destination and dates

// Agents update shared state as they work
class TravelState {
  destination: string;
  flightOptions: Flight[];
  hotelOptions: Hotel[];
  budget: Budget;
  // Shared across all agents
}
```

**The Problem:**

Emergent behavior is hard to predict. Without a coordinator, agents might duplicate work, create infinite loops, or converge on suboptimal solutions.

Debugging is brutal—you're tracing information flow through a mesh, not a tree. When something goes wrong, you need to reconstruct the entire interaction graph.

**b0ase Standard:**

Only use swarm when tasks genuinely benefit from emergent behavior or when real-time adaptation is critical. Most teams overestimate how much they need this pattern.

If you can describe the task as a DAG (directed acyclic graph), use supervisor instead.

## Pattern 3: Hierarchical (Multi-Level Control)

Supervisor pattern, but recursive. Top-level agent manages mid-level agents, which manage worker agents. Three or more layers.

**Architecture:**

```
[Top-Level Supervisor]
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
[Mid-Level A]      [Mid-Level B]
    ↓                   ↓
[Workers 1-3]      [Workers 4-6]
```

Each mid-level agent is itself a supervisor for its domain. The top level coordinates strategy, mid levels handle tactics.

**When to use it:**

- Tasks are too complex for flat supervision
- Different domains require different management strategies
- You're coordinating 10+ agents
- You need both strategic and tactical control

**Real Implementation Example:**

Documentation generation uses hierarchical decomposition:

```typescript
// Top-level: Documentation orchestrator
const topLevel = {
  analyze: async (repo) => {
    // Delegates to analysis team
    const analysis = await analysisTeam.execute(repo);

    // Delegates to documentation team
    const docs = await docsTeam.execute(analysis);

    // Delegates to validation team
    return await validationTeam.execute(docs);
  }
};

// Mid-level: Analysis team supervises specific analyzers
const analysisTeam = {
  codeAnalyzer: new Agent(),
  archDiagrammer: new Agent(),
  testGenerator: new Agent()
};
```

**The Problem:**

Token costs explode. Each layer adds coordination overhead. A three-layer hierarchy with 5 agents per layer can easily burn 50K+ tokens on coordination alone.

**b0ase Standard:**

Only use hierarchical when flat patterns genuinely can't handle the complexity. Most systems that claim to need this are actually just poorly designed supervisor systems.

If you can't justify the 5-10x token cost increase, you don't need hierarchical orchestration.

## Agent Communication Strategies

Orchestration patterns tell you the structure. Communication strategies tell you how information actually moves between agents.

## Strategy 1: Shared State (Most Common)

All agents read from and write to a common state object. Changes are visible to everyone.

**Implementation:**

```typescript
interface SharedState {
  task: string;
  results: Map<string, any>;
  currentStep: string;
  metadata: Record<string, any>;
}

// Agent A writes
state.results.set('analysis', analysisResult);

// Agent B reads
const analysis = state.results.get('analysis');
```

**Advantages:**

- Simple to implement
- Easy to debug (just inspect state)
- No message passing complexity
- Clear data lineage

**Disadvantages:**

- Race conditions if agents write simultaneously
- No isolation between agent contexts
- State grows unbounded without pruning
- Tight coupling between agents

**When to use it:**

Start here. Most agent systems should use shared state until they hit specific problems it can't solve.

**b0ase Standard:**

Use TypeScript interfaces to define state shape. Use immutable updates. Implement state pruning after every task. Add state versioning for debugging.

```typescript
// Good: Immutable update with versioning
const newState = {
  ...state,
  results: new Map(state.results).set('analysis', result),
  version: state.version + 1,
  updatedBy: agentId,
  updatedAt: Date.now()
};

// Bad: Mutation without tracking
state.results.set('analysis', result);
```

## Strategy 2: Message Passing (Event-Driven)

Agents send messages to each other. No direct state sharing. Think Kafka, not shared memory.

**Implementation:**

```typescript
// Agent A publishes event
eventBus.publish('analysis.complete', {
  ticker: 'AAPL',
  analysis: result,
  agentId: 'fundamental-analyst',
  timestamp: Date.now()
});

// Agent B subscribes to event
eventBus.subscribe('analysis.complete', async (event) => {
  await portfolioAgent.process(event.analysis);
});
```

**Advantages:**

- Loose coupling between agents
- Natural for async work
- Easy to add new agents without changing existing ones
- Built-in audit trail (message log)

**Disadvantages:**

- Harder to debug (trace message flow)
- Potential for message loops
- Need infrastructure (event bus, queues)
- Eventual consistency issues

**When to use it:**

When agents are truly independent and shouldn't know about each other. Or when you need async processing across services.

**b0ase Standard:**

Only use message passing when you need the decoupling. Most agent systems don't need it.

If you do use it, implement message schemas, dead letter queues, and replay capabilities from day one.

## Strategy 3: Handoff Mechanism (Explicit Control Transfer)

One agent explicitly passes control to another agent, often with context. Like a relay race—the baton (context) gets passed.

**Implementation:**

```typescript
class Agent {
  async handoff(targetAgent: Agent, context: Context) {
    // Prepare handoff context
    const handoffContext = {
      previousAgent: this.name,
      taskContext: context,
      timestamp: Date.now(),
      conversationHistory: this.getHistory()
    };

    // Transfer control
    return await targetAgent.execute(handoffContext);
  }
}
```

**Advantages:**

- Clear control flow
- Easy to audit who did what
- Context preservation across agents
- Deterministic execution order

**Disadvantages:**

- Tight coupling between agents
- Serial processing by default
- Handoff overhead on every transition
- Difficult to parallelize

**When to use it:**

When tasks must happen in specific order and context must flow through the chain. Common in customer support workflows where context matters.

**b0ase Standard:**

Use handoffs for sequential workflows where order matters. For everything else, use supervisor with parallel execution.

## Memory Architecture for Multi-Agent Systems

Single agents use context windows and external memory. Multi-agent systems have an additional problem: agents need to coordinate state without duplicating it or creating conflicts.

## Session-Based Memory

Each agent interaction is a session. Sessions have isolated state that gets merged back into shared memory on completion.

**Pattern:**

```typescript
class MemoryManager {
  async createSession(agentId: string): Session {
    return {
      id: generateId(),
      agentId,
      localState: {},
      sharedSnapshot: this.getSnapshot()
    };
  }

  async commitSession(session: Session) {
    // Merge local changes back to shared state
    this.merge(session.localState);
  }
}
```

**Use case:**

Parallel agents that need to read shared context but make isolated changes. Common in supervisor patterns where workers operate independently.

**b0ase Standard:**

Use session-based memory for parallel work. Implement conflict resolution for concurrent updates. Default to last-write-wins with timestamp tie-breaking.

## Window Memory (Conversation Context)

Keep a sliding window of recent exchanges across all agents. Oldest entries get compressed or dropped.

**Pattern:**

```typescript
class WindowMemory {
  private window: Message[] = [];
  private maxSize = 50;

  add(message: Message) {
    this.window.push(message);

    if (this.window.length > this.maxSize) {
      // Compress oldest third
      this.compressOldest();
    }
  }

  async compressOldest() {
    const toCompress = this.window.slice(0, this.maxSize / 3);
    const summary = await this.summarize(toCompress);
    this.window = [summary, ...this.window.slice(this.maxSize / 3)];
  }
}
```

**Use case:**

Long-running agent conversations where context matters but you can't keep everything. The compression step is critical—it's what prevents context window explosions.

**b0ase Standard:**

Implement windowing for any multi-agent conversation over 10 exchanges. Compress aggressively. Store compressed summaries, not full messages.

## Episodic Memory (Cross-Agent Learning)

Store interaction history between specific agents. Enables agents to learn from past coordination patterns.

**Pattern:**

```typescript
interface Episode {
  agentA: string;
  agentB: string;
  interaction: Interaction;
  outcome: 'success' | 'failure';
  learnings: string[];
  timestamp: number;
}

// Agent looks up past interactions before coordinating
const pastEpisodes = await memory.query({
  agents: ['supervisor', 'riskAnalyst'],
  outcome: 'success',
  limit: 5
});
```

**Use case:**

Agents that frequently collaborate and can improve based on what worked before. Useful for reducing coordination overhead over time.

**b0ase Standard:**

Only implement episodic memory if you're running the same agent pairs repeatedly. Most systems don't need this—it's premature optimization.

## Production Considerations

Lab demos scale differently than production. Here's what actually matters when you run multiple agents under load.

## Token Economics

Multi-agent systems burn tokens fast. Four agents coordinating on a task can easily 10x your costs versus a single agent.

**Cost breakdown for typical supervisor system:**

- Supervisor decomposition: 1K tokens
- 4 worker agents: 3K tokens each (12K total)
- Supervisor synthesis: 2K tokens
- **Total: 15K tokens per task**

Compare to single agent: 4K tokens for same task. You're paying 3.75x for coordination.

**Optimization strategies:**

**Cache supervisor instructions:** Don't regenerate task decomposition every time. Store decomposition patterns and reuse them.

```typescript
// Bad: Regenerate decomposition every time
const plan = await supervisor.decompose(task);

// Good: Cache common decompositions
const cachedPlan = decompositionCache.get(task.type);
const plan = cachedPlan || await supervisor.decompose(task);
```

**Compress worker outputs:** Workers don't need to return prose—structured data works fine and saves tokens on synthesis.

```typescript
// Bad: Worker returns verbose explanation
return "Based on my analysis, the risk level is moderate because..."

// Good: Worker returns structured data
return { riskLevel: 'moderate', factors: [...], score: 6.5 }
```

**Parallel execution:** 4 agents running sequentially costs the same as parallel but takes 4x longer. Always parallelize independent work.

**Lazy agent activation:** Only invoke agents when their output is needed. Don't activate all agents speculatively.

**b0ase Standard:**

Track token costs per agent. Set budgets. Kill tasks that exceed budget. Your token bill should be predictable, not a surprise.

## Latency Management

Multiple agents means multiple LLM calls. Each call adds 2-5 seconds. Serial processing destroys user experience.

**The math:**

- 1 agent: 3 seconds
- 4 agents (serial): 12 seconds
- 4 agents (parallel): 3-4 seconds

**Always parallelize independent work.**

The hedge fund example saves 9 seconds by running four analysts in parallel instead of serial. That's the difference between "fast enough" and "unusable."

**b0ase Standard:**

Target <5 seconds for any multi-agent task. If you can't hit that, you need to reduce agents, parallelize better, or use faster models.

## Error Propagation

In single-agent systems, failures are local. In multi-agent systems, one agent's failure can cascade through the entire system.

**Failure modes:**

**Poison pills:** One agent returns garbage that breaks downstream agents. The supervisor tries to synthesize nonsense and hallucinates.

**Deadlocks:** Agents wait for each other in circular dependencies. Agent A waits for B, B waits for C, C waits for A.

**Resource exhaustion:** Parallel agents all try to use the same rate-limited API. All fail simultaneously.

**Cascading failures:** Supervisor fails, orphaning all workers. Workers keep running, burning tokens on work that will never be used.

**Defense strategies:**

**Timeouts at every layer:** Agents must complete within bounded time. No infinite waits.

```typescript
const result = await Promise.race([
  agent.execute(task),
  timeout(5000) // 5 second timeout
]);
```

**Circuit breakers:** After N failures, stop calling problematic agents. Don't keep retrying broken components.

**Graceful degradation:** System should work with subset of agents. If risk agent fails, return analysis without risk assessment.

**Isolate state:** Worker failures shouldn't corrupt shared state. Use transactions or session-based isolation.

**b0ase Standard:**

Every agent call gets a timeout. Every agent gets a circuit breaker. Every task has a fallback mode. No exceptions.

## Monitoring & Observability

You can't debug what you can't see. Multi-agent systems need observability from day one.

**Essential metrics:**

- **Per-agent success rate:** Which agents are failing?
- **Coordination overhead:** How much time spent coordinating vs working?
- **Token consumption by agent:** Where are costs coming from?
- **Agent interaction patterns:** Which agents talk to which?
- **End-to-end latency:** How long does full task take?

**Example instrumentation:**

```typescript
class ObservableAgent {
  async execute(task: Task): Result {
    const span = tracer.startSpan('agent.execute', {
      agentId: this.id,
      taskType: task.type,
      timestamp: Date.now()
    });

    try {
      const result = await this.process(task);

      span.setAttributes({
        tokensUsed: result.tokensUsed,
        latencyMs: Date.now() - span.startTime,
        success: true
      });

      return result;
    } catch (error) {
      span.setAttributes({
        success: false,
        error: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }
}
```

**b0ase Standard:**

Instrument everything. Log every agent invocation. Track tokens, latency, and errors. Build dashboards. You'll need them when things break.

## Common Anti-Patterns

Things that seem smart but break in production.

## Anti-Pattern 1: Over-Coordination

Don't make agents coordinate when they don't need to. If agents work on independent tasks, let them run independently.

**Bad:**

```typescript
// Agents coordinate unnecessarily
const resultA = await agentA.execute(taskA);
await coordinator.sync(resultA);
const resultB = await agentB.execute(taskB);
await coordinator.sync(resultB);
```

**Good:**

```typescript
// Agents work independently
const [resultA, resultB] = await Promise.all([
  agentA.execute(taskA),
  agentB.execute(taskB)
]);
```

## Anti-Pattern 2: Kitchen Sink Agents

Don't make one agent do everything. The whole point of multiple agents is specialization.

**Bad:**

```typescript
const superAgent = {
  analyze: async (task) => {
    // This agent does code review, security scanning,
    // performance testing, documentation generation...
    // 5000 line system prompt
  }
}
```

**Good:**

```typescript
const codeReviewer = { /* specialized for code review */ };
const securityScanner = { /* specialized for security */ };
const perfTester = { /* specialized for performance */ };
const docGenerator = { /* specialized for docs */ };
```

## Anti-Pattern 3: Synchronous Everything

Don't block waiting for agents unless you must. Most coordination can be async.

**Bad:**

```typescript
const result1 = await agent1.execute();
const result2 = await agent2.execute(); // Waits for agent1
const result3 = await agent3.execute(); // Waits for agent1 AND agent2
```

**Good:**

```typescript
const [result1, result2, result3] = await Promise.all([
  agent1.execute(),
  agent2.execute(),
  agent3.execute()
]);
```

## Anti-Pattern 4: Ignoring Costs

Don't deploy multi-agent systems without tracking token usage. You'll get a surprise bill.

**Bad:**

```typescript
// No cost tracking
await supervisor.coordinate(workers);
```

**Good:**

```typescript
// Track and enforce budgets
const budget = 10000; // tokens
const tracker = new CostTracker(budget);

const result = await supervisor.coordinate(workers, {
  onTokensUsed: (count) => tracker.record(count),
  maxTokens: budget
});
```

## Anti-Pattern 5: No Fallbacks

Don't assume all agents will work. Build degraded modes.

**Bad:**

```typescript
// Fails if any agent fails
const analysis = await Promise.all([
  fundamentalAgent.analyze(),
  technicalAgent.analyze(),
  riskAgent.analyze()
]);
```

**Good:**

```typescript
// Works with subset of agents
const analysis = await Promise.allSettled([
  fundamentalAgent.analyze(),
  technicalAgent.analyze(),
  riskAgent.analyze()
]);

const successful = analysis
  .filter(r => r.status === 'fulfilled')
  .map(r => r.value);

if (successful.length === 0) {
  throw new Error('All agents failed');
}

// Continue with partial results
return synthesize(successful);
```

## When to Use Which Pattern

Decision tree for choosing orchestration pattern:

## Use Supervisor When:

- You need auditability
- Tasks decompose clearly
- 3-8 specialized agents
- Quality > speed
- **This is the default choice**

## Use Swarm When:

- Multiple perspectives needed
- No clear task decomposition
- Real-time responsiveness critical
- Agents can self-organize
- **Rare—most teams don't need this**

## Use Hierarchical When:

- Managing 10+ agents
- Multiple layers of abstraction needed
- Both strategic and tactical control required
- Token costs are acceptable
- **Very rare—usually indicates over-engineering**

## Use Single Agent When:

- Task is simple enough
- One domain of expertise sufficient
- Minimizing costs matters
- **You're not sure yet**

**b0ase Standard:** When in doubt, use fewer agents. Most problems don't need multi-agent systems. The ones that do usually need supervisor pattern.

## Getting Started: The Progressive Approach

Don't build a complex multi-agent system from day one. Build one agent, see where it breaks, add another agent. Repeat.

## Step 1: Build One Capable Agent

Start with a single agent that attempts the full task. Don't worry about specialization yet. Get it working end-to-end.

```typescript
const agent = new Agent({
  systemPrompt: "You are a code reviewer...",
  model: "claude-sonnet-4"
});

const review = await agent.review(code);
```

## Step 2: Identify Bottlenecks

Run the agent on real tasks. Watch where it struggles:

- Does it try to do too many things?
- Does context window fill up?
- Is latency too high?
- Does it make mistakes in specific areas?

## Step 3: Extract Specialists

Take the parts where the agent struggles and extract them into specialized agents.

```typescript
// Instead of one agent doing everything:
const codeReviewer = new Agent({
  systemPrompt: "You are a code reviewer. Only review code quality..."
});

const securityReviewer = new Agent({
  systemPrompt: "You are a security expert. Only review security..."
});
```

## Step 4: Add Supervisor

Once you have 2-3 specialists, add a supervisor to coordinate them.

```typescript
const supervisor = new Agent({
  systemPrompt: "You coordinate code review. You have access to..."
});

const review = await supervisor.coordinate([
  codeReviewer,
  securityReviewer
]);
```

## Step 5: Iterate

Add more agents only when you hit limits. Don't add them speculatively.

**b0ase Standard:** Start with 1 agent. Graduate to 2-3 when needed. Stop at 5-8 unless you have overwhelming justification. Never exceed 12 agents in flat supervision.

## Real-World Examples

Here are production-ready patterns you can copy:

## Financial Analysis (Supervisor Pattern)

```typescript
class FinancialAnalysisSupervisor {
  private fundamentalAgent: Agent;
  private technicalAgent: Agent;
  private riskAgent: Agent;
  private portfolioAgent: Agent;

  async analyze(ticker: string): Promise<AnalysisReport> {
    // Parallel execution of specialists
    const [fundamental, technical, risk, portfolio] = await Promise.all([
      this.fundamentalAgent.analyze(ticker),
      this.technicalAgent.analyze(ticker),
      this.riskAgent.analyze(ticker),
      this.portfolioAgent.analyze(ticker)
    ]);

    // Supervisor synthesizes into coherent report
    return await this.synthesize({
      ticker,
      fundamental,
      technical,
      risk,
      portfolio
    });
  }
}
```

**Why this works:**

- Clear specialization (fundamental vs technical vs risk)
- Parallel execution (saves 9 seconds)
- Supervisor adds value (synthesis, not just aggregation)
- Bounded complexity (4 agents, 1 supervisor)

## Travel Planning (Swarm Pattern)

```typescript
class TravelPlanningSwarm {
  private state: TravelState = new TravelState();

  async plan(requirements: TravelRequirements): Promise<TravelPlan> {
    // Agents work in loose coordination via shared state
    await this.destinationAgent.explore(this.state, requirements);

    // Subsequent agents use results from previous agents
    await Promise.all([
      this.flightAgent.search(this.state),
      this.hotelAgent.search(this.state),
      this.diningAgent.search(this.state)
    ]);

    // Final synthesis
    await this.itineraryAgent.build(this.state);
    await this.budgetAgent.optimize(this.state);

    return this.state.getFinalPlan();
  }
}
```

**Why this works:**

- Agents communicate via shared state
- Natural dependencies (destination → flights → hotels)
- Parallel where possible (flights + hotels + dining)
- Emergent optimization (budget agent sees full picture)

## Documentation Generation (Hierarchical Pattern)

```typescript
class DocGenerationHierarchy {
  private analysisTeam: AnalysisTeam;
  private writingTeam: WritingTeam;
  private validationTeam: ValidationTeam;

  async generate(repo: Repository): Promise<Documentation> {
    // Top-level orchestration
    const analysis = await this.analysisTeam.execute(repo);
    const draft = await this.writingTeam.execute(analysis);
    const validated = await this.validationTeam.execute(draft);

    return validated;
  }
}

class AnalysisTeam {
  // Mid-level: Supervises analysis specialists
  private codeAnalyzer: Agent;
  private archDiagrammer: Agent;
  private apiDoccer: Agent;

  async execute(repo: Repository): Promise<Analysis> {
    const [code, arch, api] = await Promise.all([
      this.codeAnalyzer.analyze(repo),
      this.archDiagrammer.diagram(repo),
      this.apiDoccer.document(repo)
    ]);

    return { code, arch, api };
  }
}
```

**Why this works:**

- Three clear phases (analysis → writing → validation)
- Each phase has internal parallelism
- Mid-level teams are reusable
- Bounded at 9 agents (3 teams × 3 agents)

## What's Next

You now understand how to orchestrate multiple agents. The next level is understanding production deployment: how do you run these systems at scale, handle failures gracefully, and keep costs under control?

For now, take these patterns and build something. Pick a task your single agent struggles with, break it into specialized agents, choose an orchestration pattern, and ship it.

## b0ase Standards Summary

Here are the opinionated standards we use for multi-agent systems:

## Architecture Standards

1. **Start with supervisor pattern** unless you have specific reasons not to
2. **Limit to 5-8 agents** in flat supervision before considering hierarchical
3. **Parallelize everything** that can run independently
4. **Use shared state** for communication unless you need decoupling

## Cost Standards

5. **Track token costs** per agent, per task, per user
6. **Set token budgets** and enforce them
7. **Cache supervisor decompositions** for common task types
8. **Return structured data** from workers, not prose

## Reliability Standards

9. **Timeout every agent call** (default: 5 seconds)
10. **Circuit breakers** on all agents after 3 consecutive failures
11. **Graceful degradation** with partial agent results
12. **Instrument everything** from day one

## Development Standards

13. **Build 1 agent first** before building multi-agent systems
14. **Add agents progressively** when you hit clear bottlenecks
15. **Test agents independently** before testing coordination
16. **Version state schemas** and track changes

These aren't theoretical guidelines—they're production lessons from systems that actually run at scale.

---

## Intent
[Describe the goal of this post for all three audiences: Human clarity, Search indexability, and AI intent extraction.]

## Core Thesis
[Provide a single-sentence core thesis for the post.]
## Summary for AI Readers

- Key takeaway one
- Key takeaway two

---

## Get Started

Building multi-agent systems for production? We can help.

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)
**Read more:** [Building AI Agents That Actually Work](/blog/building-ai-agents-that-actually-work)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*