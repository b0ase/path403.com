# Machine-to-Machine Infrastructure: Gap Analysis

Based on the BSV Strategic Thesis, here's what exists vs what's needed.

---

## The Pattern: capture → normalise → commit → prove → settle

### CAPTURE Layer

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Stripe webhook receiver | ✅ Exists | `app/api/marketplace/webhooks/stripe` | Works |
| PayPal webhook receiver | ✅ Exists | `app/api/marketplace/webhooks/paypal` | Works |
| ETH event listener | ❌ Missing | - | Need to capture ETH txs |
| SOL event listener | ❌ Missing | - | Need to capture SOL txs |
| Generic webhook receiver | ❌ Missing | - | For arbitrary external events |
| Agent action capture | ⚠️ Partial | `lib/agent-executor.ts` | Executes but doesn't meter |

### NORMALISE Layer

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Payment normalisation | ⚠️ Partial | `lib/payment-router.ts` | Basic, needs expansion |
| Event schema | ❌ Missing | - | Standard format for all events |
| Cross-chain normaliser | ❌ Missing | - | ETH/SOL → common format |
| AI output normaliser | ❌ Missing | - | Agent outputs → standard format |

### COMMIT Layer

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| BSV inscription | ✅ Exists | `lib/bsv-inscription.ts` | Works |
| Receipt inscription | ✅ Exists | `lib/bsv-receipt.ts` | Works |
| Batch committer | ❌ Missing | - | Efficient batching needed |
| Hash anchor | ❌ Missing | - | Quick hash-only inscriptions |

### PROVE Layer

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Receipt generation | ✅ Exists | `lib/bsv-receipt.ts` | Works |
| Proof verification | ⚠️ Partial | `lib/payment-verification.ts` | Multi-chain but incomplete |
| Anchor lookup | ❌ Missing | - | Find BSV anchor for external event |
| Proof API | ❌ Missing | - | Public API to verify proofs |

### SETTLE Layer

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| Ledger entries | ✅ Exists | `lib/ledger-payments.ts` | Works |
| Dividend distribution | ⚠️ Broken | - | Calculates but doesn't execute |
| Usage billing | ❌ Missing | - | Bill based on metered usage |
| Settlement reconciliation | ❌ Missing | - | Match captures to settlements |

---

## UTXO Metering (Critical Gap)

The thesis describes using UTXOs as a native usage ledger:

```
Agent action → UTXO minted/spent → Usage tracked → Billing generated
```

### Current State

- Agent executor runs tasks
- No UTXO metering
- No per-action cost tracking
- No usage-based billing

### Needed

```typescript
// lib/utxo-meter.ts (NEW)

interface MeterEvent {
  agent_id: string
  action_type: 'task_start' | 'api_call' | 'compute' | 'task_complete'
  timestamp: number
  utxo_txid: string
  satoshis: number
}

// Each agent action mints/spends a UTXO
async function meterAction(event: MeterEvent): Promise<string> {
  // Create UTXO for this action
  // Returns txid
}

// Calculate cost from UTXO chain
async function calculateUsage(agent_id: string, period: DateRange): Promise<number> {
  // Sum all UTXOs for this agent in period
}
```

---

## Event Capture Architecture (Missing)

Need a generic event capture system:

```typescript
// lib/event-capture.ts (NEW)

interface CapturedEvent {
  source: 'stripe' | 'paypal' | 'eth' | 'sol' | 'webhook' | 'agent'
  event_type: string
  event_id: string
  payload: Record<string, any>
  timestamp: number

  // Processing status
  normalised: boolean
  committed: boolean
  commit_txid?: string
}

// Capture from any source
async function captureEvent(event: CapturedEvent): Promise<void>

// Process pending events in batches
async function processCaptureQueue(): Promise<void>
```

---

## Batch Committer (Missing)

Individual inscriptions are inefficient. Need batching:

```typescript
// lib/batch-committer.ts (NEW)

interface CommitBatch {
  events: CapturedEvent[]
  merkle_root: string
  batch_txid?: string
}

// Batch up to 1000 events into single inscription
async function createBatch(events: CapturedEvent[]): Promise<CommitBatch>

// Commit batch to BSV (one UTXO for 1000 events)
async function commitBatch(batch: CommitBatch): Promise<string>
```

---

## Implementation Priority

### Phase 1: Core Capture (Week 1-2)

1. Generic webhook receiver (`/api/capture/webhook`)
2. Event schema definition
3. Event queue (database table)
4. Basic normalisation

### Phase 2: Commit & Prove (Week 3-4)

1. Batch committer (merkle tree)
2. Hash anchor function
3. Proof lookup API
4. Anchor mapping table

### Phase 3: Metering (Week 5-6)

1. UTXO meter for agents
2. Usage calculation
3. Per-action cost tracking
4. Usage-based billing

### Phase 4: Settlement (Week 7-8)

1. Fix dividend execution
2. Settlement reconciliation
3. Automated billing generation
4. Revenue share distribution

---

## Database Tables Needed

```sql
-- Event capture queue
CREATE TABLE captured_events (
  id UUID PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,

  -- Processing
  normalised BOOLEAN DEFAULT FALSE,
  normalised_payload JSONB,
  committed BOOLEAN DEFAULT FALSE,
  commit_txid VARCHAR(100),
  batch_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commit batches
CREATE TABLE commit_batches (
  id UUID PRIMARY KEY,
  event_count INT NOT NULL,
  merkle_root VARCHAR(64) NOT NULL,
  batch_txid VARCHAR(100),
  committed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UTXO metering
CREATE TABLE utxo_meters (
  id UUID PRIMARY KEY,
  agent_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  utxo_txid VARCHAR(100) NOT NULL,
  satoshis BIGINT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,

  -- Billing
  billed BOOLEAN DEFAULT FALSE,
  invoice_id UUID
);

-- Anchor mappings (external event → BSV proof)
CREATE TABLE anchor_mappings (
  id UUID PRIMARY KEY,
  source VARCHAR(20) NOT NULL,
  external_id VARCHAR(255) NOT NULL,  -- Stripe payment_intent, ETH txid, etc.
  bsv_txid VARCHAR(100) NOT NULL,
  batch_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(source, external_id)
);
```

---

## API Endpoints Needed

| Endpoint | Purpose |
|----------|---------|
| `POST /api/capture/webhook` | Generic event capture |
| `POST /api/capture/eth` | ETH event capture |
| `POST /api/capture/sol` | SOL event capture |
| `GET /api/prove/:external_id` | Lookup BSV anchor for external event |
| `GET /api/usage/:agent_id` | Get metered usage for agent |
| `POST /api/batch/commit` | Trigger batch commit |

---

## Revenue Opportunities

Once this infrastructure exists:

| Service | Pricing | Margin |
|---------|---------|--------|
| Event anchoring (per 1000) | £10 | ~99% |
| Agent metering (per agent/month) | £50 | ~95% |
| Cross-chain proof API | £0.01/proof | ~99% |
| Audit trail service | £100/month | ~90% |
| Settlement reconciliation | £500/month | ~85% |

---

## Summary

**What we have:**
- Payment capture (Stripe/PayPal)
- BSV inscription
- Receipt generation
- Ledger accounting

**What's missing:**
- Generic event capture
- Batch committing
- UTXO metering
- Proof lookup API
- Settlement execution

**The gap is the automation layer** - the bots that:
1. Detect events worth anchoring
2. Normalise messy data
3. Batch efficiently
4. Meter everything

Once built, this becomes the **invisible truth layer** that creates structural margin.
