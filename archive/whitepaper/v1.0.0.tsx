'use client';

import Link from 'next/link';

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pt-20 pb-16">
      {/* Navigation */}
      <div className="max-w-[800px] mx-auto px-8 pt-8 print:hidden">
        <div className="mb-8">
          <Link href="/" className="text-gray-500 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Whitepaper Content */}
      <div className="max-w-[800px] mx-auto px-8 font-serif text-gray-900 dark:text-gray-100">

        {/* Title */}
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-6 tracking-tight text-white">
            $402 Token Standard
          </h1>
          <p className="text-lg italic text-zinc-400 mb-6">
            A Peer-to-Peer System for Content Monetization<br />
            Through Unilateral Token Contracts
          </p>
          <p className="text-base text-zinc-400">
            <a href="https://x.com/b0ase" target="_blank" rel="noopener noreferrer" className="hover:underline">@b0ase</a>
          </p>
          <p className="text-sm text-zinc-500 mt-4">
            February 2026
          </p>
        </header>

        {/* Abstract */}
        <section className="mb-10">
          <h2 className="text-center text-sm font-bold uppercase tracking-wider mb-4 text-white">Abstract</h2>
          <p className="text-justify text-[15px] leading-relaxed indent-8 text-gray-800 dark:text-gray-200">
            We propose a protocol for turning any URL path into a priced, tokenized market. The $402 standard
            uses HTTP 402 "Payment Required" responses to create <em>unilateral token contracts</em>—offers
            that become binding agreements upon payment. Unlike traditional paywalls requiring subscriptions or
            advertising, $402 enables <em>atomic micropayments</em> where content access and token acquisition
            occur in a single transaction. The protocol introduces <em>sqrt_decay pricing</em>, a mathematical
            model that rewards early participants while maintaining market fairness. Combined with x402 payment
            verification for multi-chain support and MCP integration for AI agents, $402 creates a new primitive
            for the internet economy: content as property with deterministic pricing and automated enforcement.
          </p>
        </section>

        {/* 1. Introduction */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">1. Introduction</h2>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            The internet was built on a contradiction. HTTP 402 "Payment Required" was defined in 1999, yet
            two decades later, the web still runs on advertising and subscription models that misalign creator
            incentives with consumer value. The vision of native web payments never materialized—until now.
          </p>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            The $402 Token Standard resolves this by defining a complete protocol for:
          </p>
          <ul className="list-disc list-inside text-[15px] leading-relaxed mb-3 ml-4 text-gray-800 dark:text-gray-200">
            <li><strong>Discovery</strong> — Machine-readable pricing at any URL</li>
            <li><strong>Acquisition</strong> — Atomic token purchase with content delivery</li>
            <li><strong>Verification</strong> — Multi-chain payment proofs via x402 facilitator</li>
            <li><strong>Inscription</strong> — Permanent record on BSV blockchain</li>
          </ul>
          <p className="text-justify text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            This paper describes the technical specification, economic model, and reference implementation
            at path402.com.
          </p>
        </section>

        {/* 2. The Problem */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">2. The Problem</h2>

          <h3 className="text-base font-bold mb-2 text-white">2.1 Broken Monetization Models</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            Current web monetization suffers from fundamental flaws. Advertising requires privacy invasion
            and attention manipulation. Subscriptions create high friction and fatigue. Paywalls offer poor
            UX with no price discovery. Tips rely on unpredictable goodwill. None provide deterministic,
            fair pricing that benefits both creators and consumers.
          </p>

          <h3 className="text-base font-bold mb-2 text-white">2.2 The AI Agent Problem</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            AI agents present a new challenge: they need to access and pay for content programmatically,
            without human intervention. Existing systems require human login, credit card entry, CAPTCHA
            solving, and subscription management. None of these work for autonomous agents. The web needs
            a native payment layer that machines can use directly.
          </p>

          <h3 className="text-base font-bold mb-2 text-white">2.3 The HTTP 402 Void</h3>
          <p className="text-justify text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            HTTP 402 "Payment Required" was reserved in HTTP/1.1 for "future use." Twenty-five years later,
            it remains undefined. Coinbase's x402 protocol provides payment verification, but no standard
            exists for discovering prices before hitting paywalls, deterministic pricing that prevents
            arbitrary charges, or token-based access rights that users own.
          </p>
        </section>

        {/* 3. The $402 Solution */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">3. The $402 Solution</h2>

          <h3 className="text-base font-bold mb-2 text-white">3.1 Core Concept: $addresses</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            The $402 protocol introduces <em>$addresses</em>—URL paths prefixed with $ that represent
            tokenized content markets:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4  text-sm mb-4 overflow-x-auto font-mono text-gray-800 dark:text-gray-200">
{`$example.com                 → Site-level token
$example.com/$api            → Section token
$example.com/$api/$premium   → Content token`}
          </pre>
          <p className="text-justify text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            Each $ segment creates an independent market with its own price curve, token supply, holder
            registry, and revenue distribution rules.
          </p>

          <h3 className="text-base font-bold mb-2 mt-4 text-white">3.2 HTTP 402 Response</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            When a client requests $402-protected content without valid tokens, servers respond:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4  text-sm mb-4 overflow-x-auto font-mono text-gray-800 dark:text-gray-200">
{`HTTP/1.1 402 Payment Required
X-402-Version: 1.0.0
X-402-Price: 10
X-402-Token: $example.com

{
  "price_sats": 10,
  "token": "$example.com",
  "pricing_model": "sqrt_decay",
  "treasury_remaining": 500000000,
  "discovery_url": "/.well-known/x402.json",
  "accepts": ["bsv", "base", "sol", "eth"]
}`}
          </pre>

          <h3 className="text-base font-bold mb-2 text-white">3.3 Discovery Protocol</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            All $402-compliant servers expose <code className="bg-gray-100 dark:bg-gray-800 px-1  font-mono text-sm text-gray-800 dark:text-gray-200">/.well-known/x402.json</code> containing
            token metadata, pricing parameters, and facilitator endpoints.
          </p>
        </section>

        {/* 4. Unilateral Contract Theory */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">4. Unilateral Contract Theory</h2>

          <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 my-4 italic text-zinc-400 text-[15px]">
            "A unilateral contract is a promise exchanged for an act. The promisor makes a promise in
            exchange for the promisee's performance of a specified act."
            <span className="block mt-1 text-sm not-italic">— Contract Law, Restatement (Second)</span>
          </blockquote>

          <h3 className="text-base font-bold mb-2 text-white">4.1 The $402 Offer</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            Every HTTP 402 response constitutes a <em>unilateral offer</em>:
          </p>
          <ul className="list-disc list-inside text-[15px] leading-relaxed mb-3 ml-4 text-gray-800 dark:text-gray-200">
            <li><strong>Offer</strong>: "Pay X satoshis and receive token T plus content C"</li>
            <li><strong>Acceptance</strong>: Payment to the specified address</li>
            <li><strong>Consideration</strong>: Satoshis exchanged for token + content</li>
            <li><strong>Performance</strong>: Immediate content delivery upon payment confirmation</li>
          </ul>

          <h3 className="text-base font-bold mb-2 text-white">4.2 Binding Through Performance</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            The contract becomes binding through the act of payment, not through explicit agreement.
            This creates deterministic terms (price computed algorithmically), atomic execution (payment
            and delivery in single transaction), immutable record (payment proof inscribed on BSV), and
            transferable rights (token ownership conveys access).
          </p>
        </section>

        {/* 5. Token Economics */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">5. Token Economics</h2>

          <h3 className="text-base font-bold mb-2 text-white">5.1 sqrt_decay Pricing Model</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            The default pricing model uses square root decay based on remaining treasury:
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-4  mb-4 text-center">
            <p className="font-mono text-lg mb-2 text-white">
              price = base_price / √(treasury_remaining + 1)
            </p>
            <p className="text-sm text-zinc-400">
              Where base_price = 223,610 sats (calibrated so 1 BSV ≈ 1% of supply)
            </p>
          </div>
          <p className="text-justify text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            As treasury depletes, price <em>increases</em>. Early buyers are rewarded with lower prices.
          </p>

          <h3 className="text-base font-bold mb-2 mt-4 text-white">5.2 Price Schedule</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                  <th className="text-left py-2 pr-4">Treasury Remaining</th>
                  <th className="text-left py-2 pr-4">Price (sats)</th>
                  <th className="text-left py-2">% Sold</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-zinc-800">
                  <td className="py-2 pr-4">500,000,000</td>
                  <td className="py-2 pr-4">10</td>
                  <td className="py-2">0%</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 pr-4">100,000,000</td>
                  <td className="py-2 pr-4">22</td>
                  <td className="py-2">80%</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 pr-4">10,000,000</td>
                  <td className="py-2 pr-4">71</td>
                  <td className="py-2">98%</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 pr-4">1,000,000</td>
                  <td className="py-2 pr-4">224</td>
                  <td className="py-2">99.8%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">1,000</td>
                  <td className="py-2 pr-4">7,072</td>
                  <td className="py-2">99.9998%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-bold mb-2 text-white">5.3 Revenue Distribution</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            Content creators implementing $402 configure revenue splits via the discovery document:
          </p>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4  text-sm mb-4 overflow-x-auto font-mono text-gray-800 dark:text-gray-200">
{`"revenue_split": {
  "issuer_bps": 8000,      // 80% to creator
  "facilitator_bps": 2000  // 20% to platform
}`}
          </pre>
        </section>

        {/* 6. x402 Facilitator */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">6. x402 Facilitator Protocol</h2>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            PATH402.com operates as an x402 facilitator—a payment verification service compatible with
            Coinbase's x402 protocol specification. This enables $402 to accept payments from multiple chains.
          </p>

          <h3 className="text-base font-bold mb-2 text-white">6.1 Multi-Chain Support</h3>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-2 pr-4">Network</th>
                <th className="text-left py-2 pr-4">Status</th>
                <th className="text-left py-2">Assets</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4">BSV</td>
                <td className="py-2 pr-4">Primary</td>
                <td className="py-2">BSV, BSV-20 tokens</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4">Base</td>
                <td className="py-2 pr-4">Supported</td>
                <td className="py-2">USDC, ETH</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4">Solana</td>
                <td className="py-2 pr-4">Supported</td>
                <td className="py-2">USDC, SOL</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Ethereum</td>
                <td className="py-2 pr-4">Supported</td>
                <td className="py-2">USDC, ETH, USDT</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-base font-bold mb-2 text-white">6.2 Verification Flow</h3>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4  text-sm mb-4 overflow-x-auto font-mono text-gray-800 dark:text-gray-200">
{`1. Client → Server: GET /protected-content
2. Server → Client: 402 + X-402-Facilitator header
3. Client → Facilitator: POST /api/x402/verify
4. Facilitator: Verify payment on source chain
5. Facilitator → BSV: Inscribe payment proof
6. Facilitator → Client: { valid: true }
7. Client → Server: GET /content + Authorization
8. Server: Verify with facilitator, deliver content`}
          </pre>
        </section>

        {/* 7. AI Agent Integration */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">7. AI Agent Integration</h2>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            $402 is designed for AI agents as first-class consumers. The MCP (Model Context Protocol)
            server enables Claude, GPT, and other LLMs to discover, evaluate, and acquire content
            autonomously.
          </p>

          <h3 className="text-base font-bold mb-2 text-white">7.1 MCP Tools — Discovery & Evaluation</h3>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-2 pr-4 font-mono text-white">Tool</th>
                <th className="text-left py-2 text-white">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_discover</td>
                <td className="py-2">Probe $address — get pricing, supply, revenue model</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_batch_discover</td>
                <td className="py-2">Discover multiple $addresses simultaneously</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_evaluate</td>
                <td className="py-2">Assess ROI viability before purchasing</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_economics</td>
                <td className="py-2">Analyze breakeven points and projections</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_price_schedule</td>
                <td className="py-2">View price curve across supply levels</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-base font-bold mb-2 text-white">7.2 MCP Tools — Acquisition & Wallet</h3>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-2 pr-4 font-mono text-white">Tool</th>
                <th className="text-left py-2 text-white">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_acquire</td>
                <td className="py-2">Pay and receive token + gated content</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_set_budget</td>
                <td className="py-2">Configure agent spending parameters</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_wallet</td>
                <td className="py-2">View balance, holdings, net position</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_transfer</td>
                <td className="py-2">Transfer tokens to another address</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_history</td>
                <td className="py-2">View transaction history</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-base font-bold mb-2 text-white">7.3 MCP Tools — Serving & Revenue</h3>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-2 pr-4 font-mono text-white">Tool</th>
                <th className="text-left py-2 text-white">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_serve</td>
                <td className="py-2">Distribute content and earn revenue</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_servable</td>
                <td className="py-2">List all servable content with stats</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-blue-400">path402_register</td>
                <td className="py-2">Register new $address as issuer</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-base font-bold mb-2 text-white">7.4 x402 Facilitator Tools</h3>
          <table className="w-full text-sm border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="text-left py-2 pr-4 font-mono text-white">Tool</th>
                <th className="text-left py-2 text-white">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 dark:text-gray-200">
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-green-400">x402_verify</td>
                <td className="py-2">Verify payment proof from any chain</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-green-400">x402_settle</td>
                <td className="py-2">Settle cross-chain payment via facilitator</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 font-mono text-green-400">x402_inscription</td>
                <td className="py-2">Get/create BSV inscription proof</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 8. Investment Thesis */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">8. Investment Thesis</h2>

          <h3 className="text-base font-bold mb-2 text-white">8.1 Market Opportunity</h3>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            The digital content market exceeds $600B (2025). The emerging AI agent economy is projected
            at $200B+ by 2028. $402 provides infrastructure for both markets.
          </p>

          <h3 className="text-base font-bold mb-2 text-white">8.2 Competitive Moat</h3>
          <ul className="list-disc list-inside text-[15px] leading-relaxed mb-3 ml-4 text-gray-800 dark:text-gray-200">
            <li><strong>Protocol lock-in</strong> — HTTP 402 standard creates network effects</li>
            <li><strong>First-mover in AI payments</strong> — MCP integration before competitors</li>
            <li><strong>Multi-chain facilitator</strong> — Captures volume from all ecosystems</li>
            <li><strong>BSV inscription layer</strong> — Permanent proofs create switching costs</li>
          </ul>

          <h3 className="text-base font-bold mb-2 text-white">8.3 Revenue Model</h3>
          <table className="w-full text-sm border-collapse mb-4">
            <tbody>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 text-zinc-400">Facilitator fee</td>
                <td className="py-2 font-mono">20% (2000 bps)</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 text-zinc-400">Verification fee</td>
                <td className="py-2 font-mono">200 sats</td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="py-2 pr-4 text-zinc-400">Inscription fee</td>
                <td className="py-2 font-mono">500 sats</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-zinc-400">Settlement fee</td>
                <td className="py-2 font-mono">0.1%</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 9. Roadmap */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">9. Roadmap</h2>

          <div className="space-y-3 text-[15px]">
            <div className="flex gap-4">
              <span className="font-bold text-green-700 dark:text-green-400 w-20">Q1 2026</span>
              <span>Protocol specification, MCP server v1.0.0, x402 facilitator ✓</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-blue-700 dark:text-blue-400 w-20">Q2 2026</span>
              <span>Token exchange UI, global $address registry, creator tools</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-purple-700 dark:text-purple-400 w-20">Q3 2026</span>
              <span>Agent SDK, self-funding agent templates, agent marketplace</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-gray-700 dark:text-gray-400 w-20">Q4 2026</span>
              <span>Enterprise API, white-label facilitator, cross-facilitator federation</span>
            </div>
          </div>
        </section>

        {/* 10. Conclusion */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">10. Conclusion</h2>
          <p className="text-justify text-[15px] leading-relaxed mb-3 text-gray-800 dark:text-gray-200">
            The $402 Token Standard represents a fundamental shift in how the internet handles value
            exchange. By combining HTTP 402, unilateral contract theory, and deterministic pricing, we
            create a system where content creators earn directly from consumers, early supporters are
            rewarded for their belief, AI agents can autonomously participate in the economy, and every
            transaction creates a permanent, verifiable record.
          </p>
          <p className="text-justify text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            HTTP 402 was reserved for "future use" in 1999. That future is now.
          </p>
        </section>

        {/* References */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3 text-white">References</h2>
          <ol className="list-decimal list-inside text-[14px] leading-relaxed space-y-1 text-gray-800 dark:text-gray-200">
            <li>Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System.</li>
            <li>RFC 2616 (1999). HTTP/1.1 Status Code 402 Payment Required.</li>
            <li>Coinbase (2024). x402 Protocol Specification.</li>
            <li>Anthropic (2024). Model Context Protocol (MCP).</li>
            <li>Open BSV License version 4.</li>
          </ol>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-800 pt-4 mt-8 text-sm text-zinc-500">
          <p>
            This whitepaper is released under the{' '}
            <a href="https://github.com/b0ase/path402-com/blob/main/LICENSE" className="text-blue-400 hover:underline">
              Open BSV License version 4
            </a>.
          </p>
          <p className="mt-2">
            Version 1.0.0 · February 2026 · <a href="https://path402.com" className="text-blue-400 hover:underline">path402.com</a>
          </p>
        </footer>

      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
          }
          .print\\:hidden {
            display: none !important;
          }
          nav, button {
            display: none !important;
          }
        }

        @page {
          margin: 2cm;
        }
      `}</style>
    </div>
  );
}
