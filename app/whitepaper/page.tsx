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

export default function Whitepaper403Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-white font-mono selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black pt-14">
      {/* Header */}
      <section className="relative py-24 px-6 border-b border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeIn}>
              <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs uppercase tracking-widest mb-8 inline-block">
                &larr; Back to Home
              </Link>
            </motion.div>

            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500 mb-8"
              variants={fadeIn}
            >
              DRAFT_V0.1.0 &mdash; THEORETICAL
            </motion.div>

            <motion.h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2" variants={fadeIn}>
              $<span className="text-purple-500">403</span>
            </motion.h1>

            <motion.p className="text-xs text-zinc-400 dark:text-zinc-600 uppercase tracking-[0.3em] mb-4" variants={fadeIn}>
              The Conditions Machine &mdash; Programmable Permissions for the Open Web
            </motion.p>

            <motion.p className="text-zinc-400 max-w-2xl mb-4 text-lg" variants={fadeIn}>
              A state machine for permissions, restrictions, and programmable conditions &mdash; enforced on-chain, earned through Proof-of-Work.
            </motion.p>

            <motion.div className="flex items-center gap-4 text-zinc-500 text-sm mb-6" variants={fadeIn}>
              <a href="https://x.com/b0ase" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                @b0ase
              </a>
              <span>&middot;</span>
              <span>February 2026</span>
              <span>&middot;</span>
              <span className="text-amber-500">Draft &mdash; Not Definitive</span>
            </motion.div>

            <motion.div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-4 max-w-2xl" variants={fadeIn}>
              <p className="text-amber-400 text-xs leading-relaxed">
                <span className="font-bold uppercase tracking-widest">Note:</span> This is a cursory theoretical draft for discussion. The $403 protocol is designed but not yet implemented.
                Nothing in this document constitutes legal advice, financial advice, or a binding specification. Published for feedback and collaboration.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Abstract */}
      <Section title="Abstract">
        <p className="text-zinc-400 leading-relaxed">
          We propose <span className="text-zinc-900 dark:text-white">$403</span>, a programmable conditions protocol that runs as an on-chain state machine on BSV.
          Where <span className="text-zinc-900 dark:text-white">$401</span> handles identity (who you are) and <span className="text-zinc-900 dark:text-white">$402</span> handles payment (what you pay),
          $403 handles <em className="text-zinc-900 dark:text-white">permissions</em> &mdash; what you may or may not do, and under what conditions.
          Conditions are expressed as deterministic rules, enforced by miners and indexers, and earned through Proof-of-Work mining via a BSV-21 PoW20 hash-to-mint sCrypt contract.
          The protocol addresses multiple permission classes: securities compliance, age-gating, self-imposed restrictions (savings, pensions),
          time-locks, geographic restrictions, identity-gated access, and arbitrary programmable conditions.
          Indexers who validate condition state perform <em className="text-zinc-900 dark:text-white">Proof of Indexing</em> &mdash; verifiable work that
          earns them $403 tokens and ensures the network remains honest.
        </p>
      </Section>

      {/* Why 403? */}
      <Section title="Why 403?">
        <p className="text-zinc-400 leading-relaxed mb-6">
          HTTP 403 means &ldquo;Forbidden&rdquo; &mdash; the server understood the request but refuses to authorize it.
          This is the missing piece in the $40x trinity:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-black">
            <div className="text-xs font-bold text-green-500 uppercase tracking-widest mb-3">$401 &mdash; Identity</div>
            <p className="text-zinc-500 text-sm leading-relaxed">Who are you? Root key, OAuth strands, attestations. The subject of every condition.</p>
          </div>
          <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-black">
            <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3">$402 &mdash; Payment</div>
            <p className="text-zinc-500 text-sm leading-relaxed">What do you pay? Tokenized access, serving revenue, economic incentives. The currency of every condition.</p>
          </div>
          <div className="border border-purple-500/30 p-6 bg-purple-500/5">
            <div className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">$403 &mdash; Conditions</div>
            <p className="text-zinc-500 text-sm leading-relaxed">What are you allowed to do? Programmable rules, restrictions, gates. The logic layer.</p>
          </div>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          Without $403, permissions are ad-hoc: hardcoded in application logic, unauditable, unportable.
          With $403, permissions become <em className="text-zinc-900 dark:text-white">first-class on-chain objects</em> &mdash; inspectable, composable, transferable, and enforced by the network itself.
        </p>
      </Section>

      {/* The State Machine */}
      <Section title="The Conditions State Machine">
        <p className="text-zinc-400 leading-relaxed mb-6">
          Every $403 condition is a <em className="text-zinc-900 dark:text-white">finite state machine</em> (FSM) inscribed on-chain.
          A condition has states, transitions, and guards. Transitions fire when guards evaluate to true.
          Guards can reference: $401 identity data, $402 payment state, block height, timestamps, external oracle data, or other conditions.
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 mb-6 font-mono text-sm">
          <div className="text-purple-400 mb-2">// Condition: Age-Gated Content Access</div>
          <div className="text-zinc-500">{'{'}</div>
          <div className="text-zinc-400 ml-4">&quot;id&quot;: &quot;$403/age-gate/18+&quot;,</div>
          <div className="text-zinc-400 ml-4">&quot;states&quot;: [&quot;LOCKED&quot;, &quot;UNLOCKED&quot;, &quot;EXPIRED&quot;],</div>
          <div className="text-zinc-400 ml-4">&quot;initial&quot;: &quot;LOCKED&quot;,</div>
          <div className="text-zinc-400 ml-4">&quot;transitions&quot;: {'{'}</div>
          <div className="text-zinc-400 ml-8">&quot;LOCKED &rarr; UNLOCKED&quot;: {'{'}</div>
          <div className="text-purple-400 ml-12">&quot;guard&quot;: &quot;$401.strand(&#39;gov-id&#39;).age &gt;= 18&quot;</div>
          <div className="text-zinc-400 ml-8">{'}'},</div>
          <div className="text-zinc-400 ml-8">&quot;UNLOCKED &rarr; EXPIRED&quot;: {'{'}</div>
          <div className="text-purple-400 ml-12">&quot;guard&quot;: &quot;block.height &gt; anchor + 52560&quot;</div>
          <div className="text-zinc-400 ml-8">{'}'}</div>
          <div className="text-zinc-400 ml-4">{'}'},</div>
          <div className="text-zinc-400 ml-4">&quot;effects&quot;: {'{'}</div>
          <div className="text-zinc-400 ml-8">&quot;UNLOCKED&quot;: &quot;grant($402/content-access)&quot;</div>
          <div className="text-zinc-400 ml-4">{'}'}</div>
          <div className="text-zinc-500">{'}'}</div>
        </div>

        <p className="text-zinc-400 leading-relaxed">
          Conditions are composable. A content platform might require <em className="text-zinc-900 dark:text-white">$403/age-gate/18+ AND $403/geo/UK AND $401.strands &gt;= 2</em>.
          Each condition evaluates independently; the conjunction is itself a condition.
        </p>
      </Section>

      {/* Permission Classes */}
      <Section title="Permission Classes">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The $403 protocol must handle fundamentally different categories of permission. Each class has distinct legal, ethical, and technical requirements:
        </p>

        <div className="space-y-4 mb-6">
          <PermissionClass
            name="Securities Compliance"
            color="text-red-400"
            borderColor="border-red-500/30"
            examples={[
              'Accredited investor verification (income/net-worth threshold)',
              'Reg D / Reg S geographic restrictions on token offerings',
              'Lock-up periods: tokens non-transferable for N blocks after issuance',
              'Maximum holder counts (e.g., Reg D 506(b) = 35 non-accredited)',
              'Mandatory KYC/AML gates before any token transfer',
            ]}
            theory="Securities conditions are RESTRICTIVE — they default to FORBIDDEN and require explicit qualification. The state machine starts LOCKED. Guards reference $401 identity strands (KYC provider attestation, accredited investor strand, jurisdiction strand). These conditions are typically imposed by the token ISSUER and cannot be removed by the holder."
          />

          <PermissionClass
            name="Age-Related Restrictions"
            color="text-amber-400"
            borderColor="border-amber-500/30"
            examples={[
              'Content ratings: 13+, 16+, 18+, 21+ (alcohol/gambling)',
              'COPPA compliance: data collection restrictions for under-13',
              'Graduated access: more permissions unlock at higher ages',
              'Parental override: guardian key can grant/revoke access',
            ]}
            theory="Age conditions require a TRUSTED ATTESTOR — someone who verified the age claim. This could be a government ID verification service ($401 strand), a parent/guardian co-signature, or a self-declaration (weakest). The condition state machine has a one-way ratchet: once age-verified, the state doesn't revert (you don't get younger). Parental overrides introduce a second key with REVOKE authority."
          />

          <PermissionClass
            name="Self-Imposed Restrictions"
            color="text-blue-400"
            borderColor="border-blue-500/30"
            examples={[
              'Savings lock: funds non-transferable until block height N',
              'Pension plan: periodic withdrawals only, capped per period',
              'Spending limits: max N sats per day/week/month',
              'Cooling-off periods: 48-hour delay on large transfers',
              'Dead man\'s switch: auto-transfer if no activity for N blocks',
            ]}
            theory="Self-imposed conditions are the most philosophically interesting. The holder VOLUNTARILY restricts their own future self. This requires the condition to be IRREVOCABLE once set — otherwise the restriction is meaningless. The sCrypt contract enforces this: once a savings lock is inscribed, no key can unlock it before the specified block height. This is commitment technology — using the blockchain as a pre-commitment device. Pension conditions use periodic unlock windows: the state machine cycles through LOCKED → WITHDRAWAL_WINDOW → LOCKED, triggered by block height."
          />

          <PermissionClass
            name="Geographic / Jurisdictional"
            color="text-green-400"
            borderColor="border-green-500/30"
            examples={[
              'Sanctions compliance: block transfers to/from sanctioned jurisdictions',
              'Data residency: content only served from approved regions',
              'Tax jurisdiction: automatic reporting triggers per jurisdiction',
              'Gambling licenses: access only from licensed territories',
            ]}
            theory="Geographic conditions reference $401 jurisdiction strands or IP-based attestations. These are DYNAMIC — a user's jurisdiction can change, and the condition must re-evaluate. The state machine supports REVOCATION: if a user moves to a sanctioned jurisdiction, their access transitions from UNLOCKED back to LOCKED. Oracle data (IP geolocation services) can provide attestation inputs."
          />

          <PermissionClass
            name="Identity-Gated Access"
            color="text-cyan-400"
            borderColor="border-cyan-500/30"
            examples={[
              'Strand count minimum: "requires 3+ verified OAuth strands"',
              'Specific provider: "requires GitHub attestation"',
              'Reputation threshold: "requires N successful transactions"',
              'Group membership: "requires attestation from DAO X"',
            ]}
            theory="These conditions compose directly with $401. The guard expression evaluates the identity graph: strand count, specific providers, attestation strength (self vs. service), reputation scores. This is the lightest class — no legal compliance burden, just trust calibration."
          />

          <PermissionClass
            name="Temporal / Event-Driven"
            color="text-orange-400"
            borderColor="border-orange-500/30"
            examples={[
              'Time-locked releases: content available after block N',
              'Auction windows: bidding open for N blocks',
              'Vesting schedules: tokens unlock linearly over N blocks',
              'Subscription expiry: access revoked after N blocks without renewal',
            ]}
            theory="Temporal conditions are the simplest class — guards reference only block height or timestamp. No external data, no identity checks, purely deterministic. Vesting schedules use a STAGED state machine: CLIFF → VESTING → VESTED, with partial unlock at each transition. The sCrypt contract can express this directly as a spending condition on the UTXO."
          />

          <PermissionClass
            name="Composite / Programmable"
            color="text-purple-400"
            borderColor="border-purple-500/30"
            examples={[
              'Multi-sig conditions: "2 of 3 keys must approve"',
              'AND/OR composition: "age-gate AND geo-gate OR admin-override"',
              'Cascading conditions: "if condition A expires, fall through to B"',
              'Conditional payments: "$402 payment only if $403 condition met"',
            ]}
            theory="Composite conditions are conditions-of-conditions. The state machine evaluates sub-conditions as inputs. This enables arbitrary business logic: escrow (condition: both parties sign), insurance (condition: oracle attests event), governance (condition: quorum of token holders vote). The $403 condition language is intentionally NOT Turing-complete — it is a restricted, deterministic rule language that can always be evaluated in bounded time."
          />
        </div>
      </Section>

      {/* Token Economics */}
      <Section title="$403 Token Economics">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The $403 token is a BSV-21 token deployed via a PoW20 hash-to-mint sCrypt contract, identical in structure to the $402 token.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">Token Specification</div>
            <div className="space-y-2 text-sm">
              <Row label="Standard" value="BSV-21" />
              <Row label="Minting" value="PoW20 Hash-to-Mint" />
              <Row label="Contract" value="sCrypt (Bitcoin Script)" />
              <Row label="Total Supply" value="21,000,000" />
              <Row label="Decimals" value="8" />
              <Row label="Difficulty" value="Dynamic (retargets per epoch)" />
              <Row label="Purpose" value="Govern the conditions network" />
            </div>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 p-6">
            <div className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">Earning $403</div>
            <div className="space-y-3 text-sm text-zinc-400">
              <p><span className="text-zinc-900 dark:text-white font-bold">Mining:</span> Hash-to-mint. Submit valid PoW to the contract, receive $403 tokens. Same mechanism as $402.</p>
              <p><span className="text-zinc-900 dark:text-white font-bold">Indexing:</span> Validate condition state transitions. Proof of Indexing earns $403.</p>
              <p><span className="text-zinc-900 dark:text-white font-bold">Staking:</span> Stake $403 to run a condition evaluation node. Earn fees from condition checks.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Proof of Indexing */}
      <Section title="Proof of Indexing">
        <p className="text-zinc-400 leading-relaxed mb-6">
          Conditions are only useful if they are <em className="text-zinc-900 dark:text-white">correctly evaluated</em>.
          An indexer that claims &ldquo;condition X is UNLOCKED&rdquo; must prove it did the work to arrive at that state.
          This is Proof of Indexing (PoI).
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 mb-6">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-4">How PoI Works</h3>
          <div className="space-y-4 text-sm text-zinc-400">
            <div className="flex gap-4">
              <span className="text-purple-400 font-bold shrink-0">01</span>
              <p>Indexer processes a batch of condition state transitions (e.g., 1000 conditions evaluated against new block data).</p>
            </div>
            <div className="flex gap-4">
              <span className="text-purple-400 font-bold shrink-0">02</span>
              <p>Indexer constructs a Merkle tree of all (condition_id, previous_state, new_state, guard_inputs) tuples.</p>
            </div>
            <div className="flex gap-4">
              <span className="text-purple-400 font-bold shrink-0">03</span>
              <p>Indexer inscribes the Merkle root on-chain with a PoW nonce (meeting the current difficulty target).</p>
            </div>
            <div className="flex gap-4">
              <span className="text-purple-400 font-bold shrink-0">04</span>
              <p>Any challenger can request a Merkle proof for any specific condition. The indexer must produce it or lose stake.</p>
            </div>
            <div className="flex gap-4">
              <span className="text-purple-400 font-bold shrink-0">05</span>
              <p>Valid PoI submissions earn $403 tokens. Invalid submissions (proven by challenge) slash stake.</p>
            </div>
          </div>
        </div>

        <p className="text-zinc-400 leading-relaxed">
          Proof of Indexing combines Proof-of-Work (the nonce) with Proof-of-Correct-Computation (the Merkle tree of state transitions).
          This means indexers must both <em className="text-zinc-900 dark:text-white">expend energy</em> (unforgeable cost) and <em className="text-zinc-900 dark:text-white">produce correct results</em> (challengeable output).
          Neither alone is sufficient. Together they create an honest conditions network.
        </p>
      </Section>

      {/* sCrypt Contract */}
      <Section title="sCrypt Contract Design">
        <p className="text-zinc-400 leading-relaxed mb-6">
          Each $403 condition is an sCrypt smart contract on BSV. The contract encodes:
        </p>

        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 mb-6 font-mono text-sm">
          <div className="text-purple-400 mb-2">// Simplified $403 Contract Structure</div>
          <div className="text-zinc-400">
            <div>class Condition403 extends SmartContract {'{'}</div>
            <div className="ml-4 text-zinc-500">@prop() states: FixedArray&lt;ByteString, 8&gt;</div>
            <div className="ml-4 text-zinc-500">@prop(true) currentState: bigint</div>
            <div className="ml-4 text-zinc-500">@prop() transitions: FixedArray&lt;Transition, 16&gt;</div>
            <div className="ml-4 text-zinc-500">@prop() issuer: PubKey</div>
            <div className="ml-4 text-zinc-500">@prop() subject: PubKey  // $401 root key</div>
            <div className="ml-4 text-zinc-500">@prop() irrevocable: boolean</div>
            <div className="ml-4">&nbsp;</div>
            <div className="ml-4 text-purple-400">// Transition: evaluate guard, update state</div>
            <div className="ml-4">@method()</div>
            <div className="ml-4">public transition(</div>
            <div className="ml-8 text-zinc-500">transitionIdx: bigint,</div>
            <div className="ml-8 text-zinc-500">guardProof: ByteString,  // Merkle proof of guard inputs</div>
            <div className="ml-8 text-zinc-500">sig: Sig</div>
            <div className="ml-4">) {'{'}</div>
            <div className="ml-8 text-zinc-500">// Verify guard evaluates to true</div>
            <div className="ml-8 text-zinc-500">// Update currentState</div>
            <div className="ml-8 text-zinc-500">// Propagate UTXO with new state</div>
            <div className="ml-4">{'}'}</div>
            <div>{'}'}</div>
          </div>
        </div>

        <p className="text-zinc-400 leading-relaxed">
          The contract lives as a UTXO. Each state transition spends the current UTXO and creates a new one with the updated state.
          This creates an immutable, auditable chain of condition state changes. The <span className="font-mono text-purple-400">irrevocable</span> flag
          is critical for self-imposed restrictions: once set, even the issuer cannot bypass the condition.
        </p>
      </Section>

      {/* Security Model */}
      <Section title="Security Model">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The $403 security model rests on three pillars:
        </p>
        <div className="space-y-6 mb-6">
          <div className="border-l-2 border-purple-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">1. Script Enforcement</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Conditions are enforced by Bitcoin Script (sCrypt contracts). Miners validate every state transition.
              An invalid transition is an invalid transaction &mdash; it will not be mined.
              This is the strongest possible enforcement: the same mechanism that prevents double-spending prevents condition violations.
            </p>
          </div>
          <div className="border-l-2 border-purple-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">2. Proof of Indexing</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Indexers who evaluate conditions must prove their work. The Merkle tree of state transitions is challengeable.
              False claims lose stake. This creates economic incentive for honest indexing &mdash; the same game theory as Bitcoin mining.
            </p>
          </div>
          <div className="border-l-2 border-purple-500 pl-6">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wide mb-2">3. Irrevocability</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Self-imposed restrictions are cryptographically irrevocable. No key, no social recovery, no admin override.
              The script simply will not execute until the condition is met. This is what makes $403 useful for commitment devices:
              savings locks, pension plans, vesting schedules. If the creator could bypass them, they would be worthless.
            </p>
          </div>
        </div>
      </Section>

      {/* Integration */}
      <Section title="Integration with $401 and $402">
        <p className="text-zinc-400 leading-relaxed mb-6">
          The three protocols form a complete stack:
        </p>
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 mb-6 font-mono text-sm text-center">
          <div className="text-green-400 mb-1">$401 : WHO</div>
          <div className="text-zinc-600 mb-1">&darr;</div>
          <div className="text-purple-400 mb-1">$403 : MAY THEY?</div>
          <div className="text-zinc-600 mb-1">&darr;</div>
          <div className="text-yellow-400">$402 : PAY / ACCESS</div>
        </div>

        <div className="space-y-4 text-sm text-zinc-400 mb-6">
          <p>
            <span className="text-zinc-900 dark:text-white font-bold">Request flow:</span> A user requests access to a $402 resource.
            The $402 contract checks $403 conditions before processing payment. $403 conditions reference $401 identity data for evaluation.
          </p>
          <p>
            <span className="text-zinc-900 dark:text-white font-bold">Example:</span> Alice wants to buy $TOKEN.
            $403 checks: Is Alice&apos;s $401 identity verified (2+ strands)? Is she in an approved jurisdiction? Has she passed accredited investor verification?
            If all conditions evaluate to UNLOCKED, the $402 payment proceeds.
          </p>
          <p>
            <span className="text-zinc-900 dark:text-white font-bold">Composability:</span> Any $402 token can reference any number of $403 conditions.
            Conditions can reference other conditions. The entire permission graph is on-chain, auditable, and deterministic.
          </p>
        </div>
      </Section>

      {/* Open Questions */}
      <Section title="Open Questions">
        <p className="text-zinc-400 leading-relaxed mb-6">
          This draft intentionally leaves several questions unresolved:
        </p>
        <div className="space-y-3 text-sm text-zinc-400">
          <Question q="Oracle problem" text="Geographic and age conditions require external data. Who are the trusted attestors? How do we prevent oracle manipulation? The $401 attestation model (multiple attestors, self-signing) provides a framework, but specifics are TBD." />
          <Question q="Gas/fee model" text="Who pays for condition evaluation? The subject (user), the issuer (content creator), or the network (from $403 token inflation)? Each has different incentive implications." />
          <Question q="Condition language" text="How expressive should guard expressions be? Too simple and you can't express real-world rules. Too complex and you risk non-termination or state explosion. The current proposal is a restricted predicate language (no loops, no recursion, bounded evaluation)." />
          <Question q="Regulatory interface" text="Some conditions encode legal requirements (securities law, age gates). Who is liable if the condition is incorrectly specified? The protocol enforces what's written, not what's intended. Legal wrapper entities may be needed for compliance-critical conditions." />
          <Question q="Privacy" text="Condition evaluation reveals information about the subject (their age, jurisdiction, investor status). Zero-knowledge proofs could allow condition evaluation without revealing the underlying data. This is architecturally possible but adds significant complexity." />
          <Question q="Upgrade path" text="What happens when laws change? A condition locked to current securities regulation may become non-compliant under new rules. Versioned conditions with sunset clauses are one approach." />
        </div>
      </Section>

      {/* Conclusion */}
      <Section title="Conclusion">
        <p className="text-zinc-400 leading-relaxed mb-4">
          $403 completes the $40x protocol stack. Identity ($401) tells us who. Payment ($402) tells us how much. Conditions ($403) tell us whether.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-4">
          The key insight is that permissions are <em className="text-zinc-900 dark:text-white">state machines</em>.
          They have states (LOCKED, UNLOCKED, EXPIRED). They have transitions (guards that evaluate to true or false).
          They have effects (granting or revoking access). And critically, some of them must be <em className="text-zinc-900 dark:text-white">irrevocable</em> &mdash;
          commitments that even the creator cannot undo.
        </p>
        <p className="text-zinc-400 leading-relaxed mb-4">
          By running conditions as on-chain state machines, enforced by sCrypt contracts and validated by Proof-of-Indexing,
          we create a permission layer that is transparent, auditable, composable, and unstoppable.
        </p>
        <p className="text-zinc-400 leading-relaxed">
          This is a draft. The protocol is designed. The implementation is next.
        </p>
      </Section>

      {/* Footer */}
      <section className="py-16 px-6 border-t border-zinc-200 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-zinc-600 text-xs font-mono">
            $403 Conditions Machine &mdash; Draft v0.1.0 &mdash; February 2026 &mdash; <a href="https://x.com/b0ase" className="text-purple-400 hover:text-purple-300">@b0ase</a>
          </p>
          <p className="text-zinc-700 text-[10px] font-mono mt-2 uppercase tracking-widest">
            Not legal advice. Not financial advice. Not a final specification.
          </p>
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
    <div className="flex justify-between items-baseline">
      <span className="text-zinc-500 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-zinc-900 dark:text-white font-mono">{value}</span>
    </div>
  );
}

function PermissionClass({ name, color, borderColor, examples, theory }: {
  name: string; color: string; borderColor: string; examples: string[]; theory: string;
}) {
  return (
    <div className={`border ${borderColor} p-6 bg-white dark:bg-black`}>
      <div className={`text-xs font-bold ${color} uppercase tracking-widest mb-3`}>{name}</div>
      <div className="space-y-1 mb-4">
        {examples.map((ex, i) => (
          <div key={i} className="flex gap-2 text-sm text-zinc-500">
            <span className="text-zinc-700 dark:text-zinc-600 shrink-0">&bull;</span>
            <span>{ex}</span>
          </div>
        ))}
      </div>
      <p className="text-zinc-400 text-sm leading-relaxed border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <span className={`font-bold uppercase tracking-widest text-[10px] ${color}`}>Theory: </span>
        {theory}
      </p>
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
