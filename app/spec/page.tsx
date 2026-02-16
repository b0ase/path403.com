'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Spec403Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono selection:bg-red-500/20 selection:text-white pt-14">
      {/* Header */}
      <section className="relative py-24 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeIn}>
              <Link href="/403" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs uppercase tracking-widest mb-8 inline-block">
                &larr; Back to $403
              </Link>
            </motion.div>

            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8"
              variants={fadeIn}
            >
              SPEC_V0.1.0 &mdash; DRAFT
            </motion.div>

            <motion.h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2" variants={fadeIn}>
              $<span className="text-red-500">403</span> Protocol Specification
            </motion.h1>

            <motion.p className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4" variants={fadeIn}>
              Programmable Access Control on Bitcoin SV
            </motion.p>

            <motion.p className="text-zinc-400 max-w-3xl mb-4 text-lg" variants={fadeIn}>
              The normative specification for the $403 Conditions Machine &mdash; on-chain finite state machines
              for permissions, restrictions, and programmable access control, enforced by sCrypt smart contracts
              and validated through Proof of Indexing.
            </motion.p>

            <motion.div className="flex items-center gap-4 text-zinc-500 text-sm mb-6" variants={fadeIn}>
              <a href="https://x.com/b0ase" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                @b0ase
              </a>
              <span>&middot;</span>
              <span>February 2026</span>
              <span>&middot;</span>
              <span className="text-red-500">Draft &mdash; Subject to Change</span>
            </motion.div>

            <motion.div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 max-w-3xl" variants={fadeIn}>
              <p className="text-amber-400 text-xs leading-relaxed">
                <span className="font-bold uppercase tracking-widest">Status:</span> This specification is in DRAFT status.
                Implementations SHOULD NOT treat this as stable. The key words &ldquo;MUST&rdquo;, &ldquo;MUST NOT&rdquo;,
                &ldquo;SHOULD&rdquo;, &ldquo;MAY&rdquo; are to be interpreted as described in RFC 2119.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Table of Contents */}
      <Section title="Contents">
        <nav className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
          {[
            ['1', 'Introduction'],
            ['2', 'Terminology'],
            ['3', 'Protocol Overview'],
            ['4', 'Condition Object'],
            ['5', 'State Machine'],
            ['6', 'Guard Expression Language'],
            ['7', 'State Transitions'],
            ['8', 'On-Chain Representation'],
            ['9', 'Proof of Indexing'],
            ['10', 'Permission Classes'],
            ['11', 'Integration: $401 & $402'],
            ['12', 'Wire Format'],
            ['13', 'Token Specification'],
            ['14', 'Security Considerations'],
            ['15', 'Open Questions'],
          ].map(([num, title]) => (
            <div key={num} className="flex gap-3 py-1">
              <span className="text-red-500 font-bold w-6 text-right shrink-0">{num}</span>
              <span className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">{title}</span>
            </div>
          ))}
        </nav>
      </Section>

      {/* 1. Introduction */}
      <Section title="1. Introduction">
        <p className="text-zinc-400 leading-relaxed mb-4">
          HTTP 403 means <em className="text-zinc-900 dark:text-white">Forbidden</em> &mdash; the server understood the request but refuses to authorize it.
          The $403 protocol extends this concept to the programmable web: conditions that determine access are no longer ad-hoc application logic
          but <em className="text-zinc-900 dark:text-white">first-class on-chain objects</em> &mdash; inspectable, composable, transferable, and
          enforced by the Bitcoin network itself.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-4">
          $403 is the third protocol in the $40x stack:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-black">
            <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">$401 &mdash; IDENTITY</div>
            <p className="text-zinc-500 text-sm leading-relaxed">Who you are. Root key, OAuth strands, attestations.</p>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-black">
            <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-2">$402 &mdash; PAYMENT</div>
            <p className="text-zinc-500 text-sm leading-relaxed">What you pay. Tokenized URL access, micropayments.</p>
          </div>
          <div className="border border-red-500/30 p-6 bg-red-500/5">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">$403 &mdash; CONDITIONS</div>
            <p className="text-zinc-500 text-sm leading-relaxed">Whether you may. Programmable rules, gates, restrictions.</p>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          This document specifies the data structures, state machine semantics, on-chain encoding,
          guard expression language, Proof of Indexing mechanism, and integration points of the $403 protocol.
        </p>
      </Section>

      {/* 2. Terminology */}
      <Section title="2. Terminology">
        <div className="space-y-3 text-sm">
          <DefRow term="Condition" definition="An on-chain finite state machine (FSM) that evaluates to a permission state (e.g. LOCKED, UNLOCKED, EXPIRED). The atomic unit of the $403 protocol." />
          <DefRow term="Guard" definition="A boolean expression attached to a state transition. The transition fires if and only if the guard evaluates to true." />
          <DefRow term="Effect" definition="An action triggered when a condition enters a specific state (e.g. grant access to a $402 resource, revoke a token)." />
          <DefRow term="Subject" definition="The $401 identity (root key) that the condition applies to." />
          <DefRow term="Issuer" definition="The entity that created the condition. May or may not be the same as the subject." />
          <DefRow term="Indexer" definition="A node that evaluates condition state transitions and produces Proof of Indexing submissions." />
          <DefRow term="Attestor" definition="A trusted third party that provides signed data inputs for guard evaluation (e.g. KYC provider, geolocation oracle)." />
          <DefRow term="Irrevocable" definition="A condition flag indicating that no key — including the issuer — can bypass or remove the condition before its programmed resolution." />
          <DefRow term="PoI" definition="Proof of Indexing. A Merkle-root commitment of state transitions, combined with Proof-of-Work, that proves an indexer correctly evaluated a batch of conditions." />
          <DefRow term="Strand" definition="A $401 identity attestation (e.g. a verified GitHub account, a government ID check, a service credential)." />
        </div>
      </Section>

      {/* 3. Protocol Overview */}
      <Section title="3. Protocol Overview">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The $403 protocol defines a system where access conditions are:
        </p>
        <div className="space-y-4 mb-6">
          {[
            ['Inscribed', 'Conditions are written to the BSV blockchain as UTXOs containing sCrypt smart contracts.'],
            ['Evaluated', 'Guard expressions are checked against current state: $401 identity data, block height, timestamps, oracle attestations.'],
            ['Transitioned', 'When a guard is satisfied, the condition state machine advances. The UTXO is spent and a new one created with the updated state.'],
            ['Indexed', 'Indexers process batches of transitions, construct Merkle trees, and submit Proof of Indexing on-chain.'],
            ['Enforced', 'Other protocols ($402 payment, application logic) query condition state before granting access. Invalid transitions are rejected by miners.'],
          ].map(([label, text], i) => (
            <div key={i} className="flex gap-4">
              <span className="text-red-500 font-bold shrink-0 w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <span className="text-zinc-900 dark:text-white font-bold">{label}.</span>{' '}
                <span className="text-zinc-400">{text}</span>
              </div>
            </div>
          ))}
        </div>
        <CodeBlock title="Request Flow">
          <div className="text-center space-y-1">
            <div className="text-green-400">User presents $401 identity</div>
            <div className="text-zinc-600">&darr;</div>
            <div className="text-red-400">$403 evaluates conditions against identity + context</div>
            <div className="text-zinc-600">&darr;</div>
            <div className="text-zinc-500">[LOCKED] &mdash;&mdash;&mdash; 403 Forbidden &mdash;&mdash;&mdash; [UNLOCKED]</div>
            <div className="text-zinc-600">&darr;</div>
            <div className="text-yellow-400">$402 processes payment / grants access</div>
          </div>
        </CodeBlock>
      </Section>

      {/* 4. Condition Object */}
      <Section title="4. Condition Object">
        <p className="text-zinc-400 leading-relaxed mb-6">
          A Condition is the atomic unit of the $403 protocol. Every condition MUST contain the following fields:
        </p>
        <CodeBlock title="Condition Schema">
          <Line c>{'// $403 Condition Object (JSON representation)'}</Line>
          <Line>{'{'}</Line>
          <Line i={1} f="id"        v='"$403/{class}/{name}"'  c="// Unique condition identifier" />
          <Line i={1} f="version"   v='"0.1.0"'                c="// Protocol version" />
          <Line i={1} f="issuer"    v='"$401:{pubkey}"'        c="// Issuer identity (root key)" />
          <Line i={1} f="subject"   v='"$401:{pubkey}"'        c="// Subject identity (who it applies to)" />
          <Line i={1} f="class"     v='"securities | age | self | geo | identity | temporal | composite"' />
          <Line i={1} f="irrevocable" v='true | false'         c="// Can issuer bypass before resolution?" />
          <Line i={1} f="created"   v='{block_height}'         c="// Block height at inscription" />
          <Line i={1} f="states"    v='["LOCKED", "UNLOCKED", "EXPIRED"]' c="// Finite set of states" />
          <Line i={1} f="initial"   v='"LOCKED"'               c="// Initial state" />
          <Line i={1} f="transitions" v='[...]'                c="// Array of Transition objects" />
          <Line i={1} f="effects"   v='{ "UNLOCKED": "grant($402/resource)" }' c="// State → effect mapping" />
          <Line>{'}'}</Line>
        </CodeBlock>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Required Fields</div>
            <div className="space-y-2 text-sm">
              <Row label="id" value="Unique identifier, namespaced by class" />
              <Row label="issuer" value="$401 root key of creator" />
              <Row label="subject" value="$401 root key of target" />
              <Row label="states" value="Array of 2–8 state names" />
              <Row label="initial" value="Starting state (MUST be in states[])" />
              <Row label="transitions" value="At least 1 valid transition" />
            </div>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Constraints</div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>States array MUST contain 2&ndash;8 entries.</p>
              <p>State names MUST be uppercase ASCII, max 32 chars.</p>
              <p>Every state MUST be reachable from <code className="text-red-400 bg-zinc-950 px-1">initial</code>.</p>
              <p>If <code className="text-red-400 bg-zinc-950 px-1">irrevocable: true</code>, the issuer key MUST NOT appear in any guard as a bypass authority.</p>
              <p>Conditions MAY reference other conditions by ID (composition).</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 5. State Machine */}
      <Section title="5. State Machine">
        <p className="text-zinc-400 leading-relaxed mb-6">
          Every $403 condition is a deterministic finite state machine (FSM). The FSM is defined by:
        </p>
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 mb-6">
          <div className="space-y-3 text-sm font-mono">
            <div className="flex gap-4">
              <span className="text-red-400 w-4 shrink-0">S</span>
              <span className="text-zinc-400">= finite set of states {'{'} s₁, s₂, ..., sₙ {'}'} where n &isin; [2, 8]</span>
            </div>
            <div className="flex gap-4">
              <span className="text-red-400 w-4 shrink-0">s₀</span>
              <span className="text-zinc-400">= initial state, s₀ &isin; S</span>
            </div>
            <div className="flex gap-4">
              <span className="text-red-400 w-4 shrink-0">T</span>
              <span className="text-zinc-400">= set of transitions {'{'} (sᵢ, sⱼ, guard) {'}'} where sᵢ, sⱼ &isin; S</span>
            </div>
            <div className="flex gap-4">
              <span className="text-red-400 w-4 shrink-0">G</span>
              <span className="text-zinc-400">= guard function: context &rarr; boolean</span>
            </div>
            <div className="flex gap-4">
              <span className="text-red-400 w-4 shrink-0">E</span>
              <span className="text-zinc-400">= effect mapping: S &rarr; action (optional)</span>
            </div>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed mb-4">
          A transition from state <code className="text-red-400 bg-zinc-950 px-1">sᵢ</code> to <code className="text-red-400 bg-zinc-950 px-1">sⱼ</code> fires
          if and only if:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400 mb-6 ml-4">
          <li>The current state is <code className="text-red-400 bg-zinc-950 px-1">sᵢ</code></li>
          <li>A valid transition (sᵢ &rarr; sⱼ) exists in T</li>
          <li>The guard <code className="text-red-400 bg-zinc-950 px-1">G(context)</code> evaluates to <code className="text-red-400 bg-zinc-950 px-1">true</code></li>
          <li>The transition transaction is validly signed</li>
        </ol>
        <p className="text-zinc-400 leading-relaxed">
          The FSM is <em className="text-zinc-900 dark:text-white">deterministic</em>: given the same state and context, the same transitions fire.
          The guard language is intentionally NOT Turing-complete &mdash; all guard evaluations MUST terminate in bounded time.
        </p>
      </Section>

      {/* 6. Guard Expression Language */}
      <Section title="6. Guard Expression Language">
        <p className="text-zinc-400 leading-relaxed mb-6">
          Guards are boolean expressions written in a restricted predicate language. The language supports:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Operators</div>
            <div className="space-y-2 text-sm font-mono">
              <Row label="Comparison" value="==  !=  >  <  >=  <=" />
              <Row label="Logical" value="AND  OR  NOT" />
              <Row label="Membership" value="IN  NOT_IN" />
              <Row label="Existence" value="EXISTS  NOT_EXISTS" />
            </div>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Data Sources</div>
            <div className="space-y-2 text-sm font-mono">
              <Row label="$401" value="Identity strands, attestations" />
              <Row label="$402" value="Payment state, token balances" />
              <Row label="block" value="height, timestamp, hash" />
              <Row label="oracle" value="Signed attestation data" />
              <Row label="$403" value="Other condition states" />
            </div>
          </div>
        </div>

        <CodeBlock title="Guard Expression Examples">
          <Line c>{'// Age gate: subject must be 18+ (verified by gov-id strand)'}</Line>
          <Line>{'$401.strand("gov-id").age >= 18'}</Line>
          <Line />
          <Line c>{'// Geographic restriction: not in sanctioned jurisdictions'}</Line>
          <Line>{'$401.strand("geo").country NOT_IN ["KP", "IR", "SY", "CU"]'}</Line>
          <Line />
          <Line c>{'// Time lock: block height must exceed anchor + 52560'}</Line>
          <Line>{'block.height > condition.created + 52560'}</Line>
          <Line />
          <Line c>{'// Composite: age AND geo AND payment'}</Line>
          <Line>{'$403("age-gate-18").state == "UNLOCKED"'}</Line>
          <Line>{'  AND $403("geo-uk").state == "UNLOCKED"'}</Line>
          <Line>{'  AND $402.balance(subject) >= 1000'}</Line>
          <Line />
          <Line c>{'// Identity threshold: at least 3 verified strands'}</Line>
          <Line>{'$401.strand_count(subject) >= 3'}</Line>
          <Line />
          <Line c>{'// Self-imposed savings lock (irrevocable)'}</Line>
          <Line>{'block.height >= 890000'}</Line>
        </CodeBlock>

        <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 mt-6">
          <p className="text-amber-400 text-xs leading-relaxed">
            <span className="font-bold uppercase tracking-widest">Restriction:</span> No loops, no recursion, no unbounded computation.
            Guard evaluation MUST complete in O(n) time where n is the expression depth. Maximum expression depth: 16.
            Maximum referenced conditions in a single guard: 8.
          </p>
        </div>
      </Section>

      {/* 7. State Transitions */}
      <Section title="7. State Transitions">
        <p className="text-zinc-400 leading-relaxed mb-6">
          A Transition object defines a single edge in the state machine graph:
        </p>
        <CodeBlock title="Transition Schema">
          <Line c>{'// Transition Object'}</Line>
          <Line>{'{'}</Line>
          <Line i={1} f="from"  v='"LOCKED"'                          c="// Source state" />
          <Line i={1} f="to"    v='"UNLOCKED"'                        c="// Target state" />
          <Line i={1} f="guard" v={'"$401.strand(\'gov-id\').age >= 18"'} c="// Boolean expression" />
          <Line i={1} f="authority" v='"subject | issuer | any"'       c="// Who may trigger" />
          <Line i={1} f="cooldown"  v='0'                              c="// Min blocks between triggers" />
          <Line>{'}'}</Line>
        </CodeBlock>

        <div className="space-y-4 mt-6">
          <div className="border-l-2 border-red-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Authority</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              <code className="text-red-400 bg-zinc-950 px-1">subject</code> &mdash; only the subject&apos;s $401 key can trigger.
              <code className="text-red-400 bg-zinc-950 px-1 ml-2">issuer</code> &mdash; only the issuer can trigger.
              <code className="text-red-400 bg-zinc-950 px-1 ml-2">any</code> &mdash; anyone with a valid guard proof can trigger (used for time-based auto-transitions).
            </p>
          </div>
          <div className="border-l-2 border-red-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Cooldown</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Minimum number of blocks that MUST pass between consecutive triggers of the same transition.
              Prevents rapid state oscillation. MUST be 0 or greater. A value of 0 means no cooldown.
            </p>
          </div>
          <div className="border-l-2 border-red-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Irrevocable Transitions</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              When <code className="text-red-400 bg-zinc-950 px-1">irrevocable: true</code> is set on the condition, reverse transitions (back to a previous state)
              MUST NOT list the issuer as authority. The issuer cannot undo the condition. Only the guard logic can advance state.
              This is critical for self-imposed restrictions (savings locks, vesting schedules).
            </p>
          </div>
        </div>
      </Section>

      {/* 8. On-Chain Representation */}
      <Section title="8. On-Chain Representation">
        <p className="text-zinc-400 leading-relaxed mb-6">
          Each $403 condition exists as a UTXO on BSV containing an sCrypt smart contract. State transitions spend the current UTXO
          and create a new one with the updated state, forming an immutable chain of state changes.
        </p>
        <CodeBlock title="sCrypt Contract Structure">
          <Line c>{'// Simplified $403 sCrypt Contract'}</Line>
          <Line>{'class Condition403 extends SmartContract {'}</Line>
          <Line i={1}>{'@prop() states: FixedArray<ByteString, 8>'}</Line>
          <Line i={1}>{'@prop(true) currentState: bigint'}</Line>
          <Line i={1}>{'@prop() transitions: FixedArray<Transition, 16>'}</Line>
          <Line i={1}>{'@prop() issuer: PubKey'}</Line>
          <Line i={1}>{'@prop() subject: PubKey         // $401 root key'}</Line>
          <Line i={1}>{'@prop() irrevocable: boolean'}</Line>
          <Line i={1}>{'@prop() createdAt: bigint        // Block height'}</Line>
          <Line />
          <Line i={1} c>{'// Transition: evaluate guard, update state'}</Line>
          <Line i={1}>{'@method()'}</Line>
          <Line i={1}>{'public transition('}</Line>
          <Line i={2}>{'transitionIdx: bigint,'}</Line>
          <Line i={2}>{'guardProof: ByteString,          // Merkle proof of guard inputs'}</Line>
          <Line i={2}>{'sig: Sig                         // Authority signature'}</Line>
          <Line i={1}>{') {'}</Line>
          <Line i={2} c>{'// 1. Verify transition exists for currentState'}</Line>
          <Line i={2} c>{'// 2. Verify guard evaluates to true'}</Line>
          <Line i={2} c>{'// 3. Verify signature matches authority'}</Line>
          <Line i={2} c>{'// 4. Update currentState'}</Line>
          <Line i={2} c>{'// 5. Propagate UTXO with new state'}</Line>
          <Line i={1}>{'}'}</Line>
          <Line>{'}'}</Line>
        </CodeBlock>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Inscription</div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              New condition &rarr; Deploy sCrypt contract as UTXO. Initial state set. Condition ID derived from txid.
            </p>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Transition</div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Spend current UTXO &rarr; new UTXO with updated <code className="text-red-400">currentState</code>. Auditable on-chain history.
            </p>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Query</div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Read latest UTXO for condition ID. Current state is <code className="text-red-400">currentState</code>. No transaction needed for reads.
            </p>
          </div>
        </div>
      </Section>

      {/* 9. Proof of Indexing */}
      <Section title="9. Proof of Indexing">
        <p className="text-zinc-400 leading-relaxed mb-6">
          Conditions are only useful if they are <em className="text-zinc-900 dark:text-white">correctly evaluated</em>.
          Proof of Indexing (PoI) ensures that indexers who report condition states have actually done the computation.
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 mb-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-4">PoI Protocol</h3>
          <div className="space-y-4 text-sm text-zinc-400">
            {[
              'Indexer processes a batch of N condition evaluations (recommended: N = 1000).',
              'For each evaluation, record tuple: (condition_id, prev_state, new_state, guard_inputs_hash, block_height).',
              'Construct a Merkle tree over all tuples. The root is the batch commitment.',
              'Compute a PoW nonce meeting the current difficulty target: SHA256(merkle_root || nonce) < target.',
              'Inscribe on-chain: { merkle_root, nonce, batch_size, indexer_pubkey, stake_txid }.',
              'Challenge window: 144 blocks (~24h). Any party may request a Merkle proof for any condition_id in the batch.',
              'If challenged, indexer MUST produce the Merkle proof. Failure to respond or incorrect proof: stake is slashed.',
              'After challenge window: PoI is finalized. Indexer earns $403 tokens proportional to batch_size.',
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-red-400 font-bold shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Stake Requirements</div>
            <div className="space-y-2 text-sm">
              <Row label="Minimum Stake" value="1,000 $403" />
              <Row label="Slash Penalty" value="100% of stake" />
              <Row label="Challenge Window" value="144 blocks" />
              <Row label="Reward" value="Dynamic (per batch)" />
            </div>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Security Properties</div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p><span className="text-zinc-900 dark:text-white font-bold">Unforgeable cost:</span> PoW nonce requires real energy expenditure.</p>
              <p><span className="text-zinc-900 dark:text-white font-bold">Verifiable:</span> Merkle proofs are O(log n) to verify.</p>
              <p><span className="text-zinc-900 dark:text-white font-bold">Challengeable:</span> Any incorrect state can be proven wrong.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 10. Permission Classes */}
      <Section title="10. Permission Classes">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The $403 protocol defines seven standard permission classes. Each class has distinct guard patterns, authority models, and legal considerations:
        </p>
        <div className="space-y-3">
          <ClassRow name="Securities" color="text-red-400" border="border-red-500/30" desc="Accredited investor checks, lock-up periods, Reg D/S geographic restrictions, KYC/AML gates. Default: LOCKED. Issuer-imposed. Non-bypassable." />
          <ClassRow name="Age" color="text-amber-400" border="border-amber-500/30" desc="Content ratings (13+, 16+, 18+, 21+). Requires trusted attestor. One-way ratchet — age verification doesn't revert. Parental override via co-signature." />
          <ClassRow name="Self-Imposed" color="text-blue-400" border="border-blue-500/30" desc="Savings locks, pension plans, spending limits, cooling-off periods. IRREVOCABLE once set. Commitment technology — the blockchain as pre-commitment device." />
          <ClassRow name="Geographic" color="text-green-400" border="border-green-500/30" desc="Sanctions compliance, data residency, gambling licenses. Dynamic — re-evaluates on jurisdiction change. Supports REVOCATION back to LOCKED." />
          <ClassRow name="Identity" color="text-cyan-400" border="border-cyan-500/30" desc="Strand count minimums, specific provider requirements, reputation thresholds, group membership. Composes directly with $401. Lightest class." />
          <ClassRow name="Temporal" color="text-orange-400" border="border-orange-500/30" desc="Time-locked releases, auction windows, vesting schedules, subscription expiry. Simplest class — guards reference only block height. Purely deterministic." />
          <ClassRow name="Composite" color="text-purple-400" border="border-purple-500/30" desc="AND/OR composition, multi-sig conditions, cascading fallbacks, conditional payments. Conditions-of-conditions. Bounded depth (max 16)." />
        </div>
      </Section>

      {/* 11. Integration */}
      <Section title="11. Integration: $401 & $402">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The three protocols form a complete access control stack. Integration points are well-defined:
        </p>

        <CodeBlock title="Access Request Flow">
          <Line c>{'// 1. User presents identity'}</Line>
          <Line>{'request.identity = $401.resolve(user_pubkey)'}</Line>
          <Line />
          <Line c>{'// 2. $403 evaluates all conditions bound to the resource'}</Line>
          <Line>{'for condition in resource.conditions:'}</Line>
          <Line i={1}>{'state = $403.evaluate(condition.id, request.identity, context)'}</Line>
          <Line i={1}>{'if state != "UNLOCKED":'}</Line>
          <Line i={2}>{'return 403 Forbidden { condition: condition.id, state: state }'}</Line>
          <Line />
          <Line c>{'// 3. All conditions passed — process payment'}</Line>
          <Line>{'$402.process_payment(resource, request.identity)'}</Line>
          <Line />
          <Line c>{'// 4. Grant access'}</Line>
          <Line>{'return 200 OK { token: access_token }'}</Line>
        </CodeBlock>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-green-500/30 p-6">
            <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">$401 Interface</div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p><code className="text-green-400 bg-zinc-950 px-1">$401.resolve(pubkey)</code> &rarr; Identity object with strands</p>
              <p><code className="text-green-400 bg-zinc-950 px-1">$401.strand(type)</code> &rarr; Specific attestation data</p>
              <p><code className="text-green-400 bg-zinc-950 px-1">$401.strand_count()</code> &rarr; Number of verified strands</p>
              <p><code className="text-green-400 bg-zinc-950 px-1">$401.verify(attestation)</code> &rarr; boolean</p>
            </div>
          </div>
          <div className="border border-yellow-500/30 p-6">
            <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">$402 Interface</div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p><code className="text-yellow-400 bg-zinc-950 px-1">$402.balance(pubkey)</code> &rarr; Token balance</p>
              <p><code className="text-yellow-400 bg-zinc-950 px-1">$402.payment_state(resource)</code> &rarr; Paid / Unpaid</p>
              <p><code className="text-yellow-400 bg-zinc-950 px-1">$402.bind_condition(resource, condition_id)</code> &rarr; Link</p>
              <p><code className="text-yellow-400 bg-zinc-950 px-1">$402.process_payment(resource, identity)</code> &rarr; Receipt</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 12. Wire Format */}
      <Section title="12. Wire Format">
        <p className="text-zinc-400 leading-relaxed mb-6">
          $403 messages are encoded as JSON over HTTPS or as on-chain OP_RETURN data. Two primary message types:
        </p>

        <div className="space-y-6">
          <CodeBlock title="EVALUATE Request">
            <Line>{'POST /403/evaluate'}</Line>
            <Line>{'Content-Type: application/json'}</Line>
            <Line />
            <Line>{'{'}</Line>
            <Line i={1} f="condition_id" v='"$403/age-gate/18+"' />
            <Line i={1} f="subject"      v='"$401:02a1b2c3..."' />
            <Line i={1} f="context"      v='{ "block_height": 889500, "timestamp": 1739750400 }' />
            <Line i={1} f="attestations" v='[{ "provider": "gov-id", "data": "...", "sig": "..." }]' />
            <Line>{'}'}</Line>
          </CodeBlock>

          <CodeBlock title="EVALUATE Response">
            <Line>{'{'}</Line>
            <Line i={1} f="condition_id" v='"$403/age-gate/18+"' />
            <Line i={1} f="state"        v='"UNLOCKED"' />
            <Line i={1} f="previous"     v='"LOCKED"' />
            <Line i={1} f="transition_txid" v='"abc123..."' />
            <Line i={1} f="block_height" v='889501' />
            <Line i={1} f="poi_root"     v='"def456..."' c="// Proof of Indexing reference" />
            <Line>{'}'}</Line>
          </CodeBlock>
        </div>
      </Section>

      {/* 13. Token Specification */}
      <Section title="13. Token Specification">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The $403 token governs the conditions network. It is earned through mining and indexing, and staked by condition evaluation nodes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Token Parameters</div>
            <div className="space-y-2 text-sm">
              <Row label="Symbol" value="$403" />
              <Row label="Standard" value="BSV-21" />
              <Row label="Minting" value="PoW20 Hash-to-Mint" />
              <Row label="Contract" value="sCrypt (Bitcoin Script)" />
              <Row label="Total Supply" value="21,000,000" />
              <Row label="Decimals" value="8" />
              <Row label="Block Reward" value="Dynamic (halving)" />
              <Row label="Difficulty" value="Retargets per epoch" />
            </div>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Token Utility</div>
            <div className="space-y-3 text-sm text-zinc-400">
              <p><span className="text-zinc-900 dark:text-white font-bold">Mining:</span> Hash-to-mint. Submit valid PoW to contract, receive $403.</p>
              <p><span className="text-zinc-900 dark:text-white font-bold">Indexing:</span> Earn $403 by submitting valid Proof of Indexing batches.</p>
              <p><span className="text-zinc-900 dark:text-white font-bold">Staking:</span> Stake $403 to run a condition evaluation node. Required for PoI submission.</p>
              <p><span className="text-zinc-900 dark:text-white font-bold">Governance:</span> $403 holders vote on protocol parameter changes (batch size, difficulty, stake minimum).</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 14. Security Considerations */}
      <Section title="14. Security Considerations">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The $403 security model rests on three pillars:
        </p>
        <div className="space-y-6 mb-6">
          <div className="border-l-2 border-red-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Script Enforcement</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Conditions are enforced by Bitcoin Script via sCrypt contracts. Miners validate every state transition.
              An invalid transition is an invalid transaction &mdash; it MUST NOT be mined.
              This provides the same security guarantees as Bitcoin&apos;s double-spend prevention.
            </p>
          </div>
          <div className="border-l-2 border-red-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Proof of Indexing</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Indexers MUST prove their work. The Merkle tree of state transitions is publicly challengeable.
              False claims result in full stake slashing. The economic incentive for honest indexing mirrors Bitcoin mining game theory.
            </p>
          </div>
          <div className="border-l-2 border-red-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Irrevocability</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Self-imposed restrictions are cryptographically irrevocable. No key, no social recovery, no admin override.
              The script will not execute until the programmed condition is met. This is what makes $403 useful as a commitment device.
            </p>
          </div>
          <div className="border-l-2 border-red-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">Guard Bounded Evaluation</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              The guard expression language is intentionally restricted: no loops, no recursion, maximum depth of 16.
              All evaluations terminate in bounded time. This prevents denial-of-service via complex guard expressions.
            </p>
          </div>
        </div>
      </Section>

      {/* 15. Open Questions */}
      <Section title="15. Open Questions">
        <p className="text-zinc-400 leading-relaxed mb-6">
          This specification intentionally leaves several areas for future work:
        </p>
        <div className="space-y-3 text-sm text-zinc-400">
          <Question q="Oracle Trust Model" text="Geographic and age conditions require external attestation data. The specification does not yet define the oracle trust model — how attestors are selected, how their data is verified on-chain, or how oracle manipulation is prevented." />
          <Question q="Fee Model" text="Who pays for condition evaluation? The subject, the issuer, or the network via token inflation? Each model has different incentive properties." />
          <Question q="Guard Language Formalization" text="The guard expression language needs a formal grammar (BNF or PEG). The current description is normative but not machine-parseable." />
          <Question q="Privacy / Zero-Knowledge" text="Condition evaluation reveals information about the subject. ZK proofs could allow evaluation without revealing underlying data. Architecturally possible but adds complexity." />
          <Question q="Upgrade Path" text="What happens when regulations change? Versioned conditions with sunset clauses are proposed but not specified." />
          <Question q="Cross-Chain Conditions" text="Can conditions reference state on other chains? The current spec is BSV-only. Cross-chain bridge conditions are out of scope for v0.1." />
        </div>
      </Section>

      {/* Spec Footer */}
      <section className="py-16 px-6 border-t border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-600 text-xs font-mono">
            $403 Protocol Specification &mdash; Draft v0.1.0 &mdash; February 2026 &mdash; <a href="https://x.com/b0ase" className="text-red-400 hover:text-red-300 transition-colors">@b0ase</a>
          </p>
          <p className="text-zinc-700 text-[10px] font-mono mt-2 uppercase tracking-widest">
            Not legal advice. Not financial advice. Subject to change.
          </p>
          <div className="flex justify-center gap-6 mt-6 text-xs">
            <Link href="/403" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              $403 Overview
            </Link>
            <Link href="/whitepaper" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              Whitepaper
            </Link>
            <a href="https://path402.com" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              $402
            </a>
            <a href="https://path401.com" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">
              $401
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Reusable Components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-16 px-6 border-b border-zinc-200 dark:border-zinc-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white mb-6 uppercase tracking-wide">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-zinc-500 text-xs uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-zinc-900 dark:text-white font-mono text-right">{value}</span>
    </div>
  );
}

function DefRow({ term, definition }: { term: string; definition: string }) {
  return (
    <div className="border-l-2 border-red-500/30 pl-4">
      <span className="text-zinc-900 dark:text-white font-bold">{term}</span>
      <span className="text-zinc-600 mx-2">&mdash;</span>
      <span className="text-zinc-400">{definition}</span>
    </div>
  );
}

function ClassRow({ name, color, border, desc }: { name: string; color: string; border: string; desc: string }) {
  return (
    <div className={`border ${border} p-4 bg-white dark:bg-black`}>
      <span className={`text-xs font-bold ${color} uppercase tracking-widest`}>{name}: </span>
      <span className="text-zinc-400 text-sm">{desc}</span>
    </div>
  );
}

function Question({ q, text }: { q: string; text: string }) {
  return (
    <div className="border-l-2 border-zinc-700 pl-4">
      <span className="text-zinc-900 dark:text-white font-bold">{q}:</span>{' '}
      <span>{text}</span>
    </div>
  );
}

function CodeBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 mb-6">
      <div className="px-8 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{title}</span>
      </div>
      <div className="p-8 font-mono text-sm overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

function Line({ children, i = 0, f, v, c }: { children?: React.ReactNode; i?: number; f?: string; v?: string; c?: boolean | string }) {
  const indent = i * 24;
  if (!children && !f && !v && typeof c !== 'string') {
    return <div className="h-4" />;
  }
  if (typeof c === 'string' && !f) {
    return <div style={{ paddingLeft: indent }} className="text-red-400/60">{c || children}</div>;
  }
  if (c === true && children) {
    return <div style={{ paddingLeft: indent }} className="text-red-400/60">{children}</div>;
  }
  if (f && v) {
    return (
      <div style={{ paddingLeft: indent }}>
        <span className="text-zinc-500">&quot;{f}&quot;</span>
        <span className="text-zinc-600">: </span>
        <span className="text-zinc-400">{v}</span>
        {typeof c === 'string' && <span className="text-red-400/50 ml-4">{c}</span>}
      </div>
    );
  }
  return <div style={{ paddingLeft: indent }} className="text-zinc-400">{children}</div>;
}
