'use client';

import { useEffect } from 'react';

export default function AcademicWhitepaper() {
  useEffect(() => {
    // Check for download trigger
    const params = new URLSearchParams(window.location.search);
    if (params.get('download') === 'true') {
      setTimeout(() => window.print(), 500);
    }
  }, []);

  return (
    <>
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .academic-paper {
            padding: 0 !important;
            max-width: none !important;
          }
        }

        @page {
          size: letter;
          margin: 0.75in;
        }
      `}</style>

      {/* Download button - fixed */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <a
          href="/whitepaper"
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded transition-colors"
        >
          ← Modern Version
        </a>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded transition-colors"
        >
          Download PDF
        </button>
      </div>

      {/* Academic Paper */}
      <div className="academic-paper min-h-screen bg-white text-black py-12 px-8 max-w-[8.5in] mx-auto" style={{ fontFamily: 'Times New Roman, Times, serif' }}>

        {/* Title Block */}
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">
            $402: A Path-Based Token Protocol for<br />
            Tokenized Web Content
          </h1>
          <p className="text-sm text-gray-500 tracking-widest mb-4">
            THE PATH 402 TOKEN PROTOCOL
          </p>
          <p className="text-base mb-2">
            b0ase<br />
            <a href="mailto:hello@b0ase.com" className="text-blue-600">hello@b0ase.com</a>
          </p>
          <p className="text-sm text-gray-600">
            <a href="https://path402.com" className="text-blue-600">https://path402.com</a>
          </p>
        </header>

        {/* Abstract */}
        <section className="mb-8">
          <p className="text-center font-bold mb-2">Abstract</p>
          <p className="text-justify text-sm leading-relaxed italic px-8">
            We propose a protocol where every URL path can become a shareholder business.
            Visitors buy tokens to access content. Holders who stake become partners—running
            infrastructure, indexing the blockchain, serving the registry, and receiving dividends.
            The result is a self-sustaining flywheel where buying, serving, and staking are the
            same activity at different stages. No separate classes. No central infrastructure.
            Just aligned incentives all the way down. The protocol leverages HTTP 402 "Payment
            Required" (reserved since 1999 but never defined), BSV-21 tokens for bearer shares,
            and PoW20 for network incentives.
          </p>
        </section>

        {/* Two-column body */}
        <div className="columns-2 gap-8 text-[11px] leading-relaxed text-justify">

          {/* 1. Introduction */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">1. Introduction</h2>
            <p className="mb-2">
              HTTP 402 "Payment Required" was reserved in 1999 but never defined. The $402
              protocol finally gives it meaning: every URL path can become a company, every
              visitor can become a shareholder, and every shareholder can become a partner.
            </p>
            <p className="mb-2">
              The $ prefix marks a path as an economic entity: <span className="font-mono">$example.com</span>,
              <span className="font-mono">$example.com/$blog</span>, <span className="font-mono">$example.com/$api</span>.
              Each is a separate market with its own tokens, price curve, and shareholders.
            </p>
            <p className="mb-2">
              Old micropayment models fail because they create no network effect. Pay a fixed
              price, get access, done. No reason to be early. The $402 model changes this:
              pay for access, receive bearer shares. These shares are tradeable. Early buyers
              get more shares per dollar spent. They can resell to latecomers at profit.
            </p>
          </section>

          {/* 2. The Flywheel */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">2. The Flywheel</h2>
            <p className="mb-2">
              The $402 protocol creates a self-reinforcing cycle:
            </p>
            <ol className="list-decimal list-inside mb-2 space-y-1">
              <li><strong>Buy Access</strong> — Pay entry fee, receive tokens</li>
              <li><strong>Stake Tokens</strong> — Lock tokens, become partner</li>
              <li><strong>Run Infrastructure</strong> — Index blockchain, serve registry</li>
              <li><strong>Earn Revenue</strong> — Entry fees + API fees + dividends</li>
              <li><strong>New Buyers Repeat</strong> — They buy → stake → serve → earn</li>
            </ol>
            <p className="mb-2">
              Every role is the same person at different stages. A buyer becomes a holder
              becomes a staker becomes a partner. No separate classes. The path is open to everyone.
            </p>
          </section>

          {/* 3. Bearer Share Model */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">3. Bearer Share Model</h2>
            <p className="mb-2">
              Bearer shares are permissionless—anyone can hold and trade them. But dividends
              require compliance. Two tiers exist:
            </p>
            <p className="mb-2">
              <strong>Tier 1 (Bearer):</strong> No KYC, no dividends, can trade freely.
            </p>
            <p className="mb-2">
              <strong>Tier 2 (Staker):</strong> KYC required, receives dividends, appears on
              Registry of Members, can still trade.
            </p>
            <p className="mb-2">
              The registry only updates when a new holder stakes and completes KYC. Bearer
              tokens are bearer instruments—the site doesn't track transfers.
            </p>
          </section>

          {/* 4. Pricing Curves */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">4. Pricing Curves</h2>
            <p className="mb-2">
              $402 doesn't mandate one pricing model. It defines how to express pricing models.
              The default is <span className="font-mono">sqrt_decay</span> with two variants:
            </p>
            <p className="mb-2">
              <strong>Investment (Treasury):</strong> <span className="font-mono">price = base / √(treasury + 1)</span><br />
              Price increases as treasury depletes. Rewards early belief.
            </p>
            <p className="mb-2">
              <strong>Content (Supply):</strong> <span className="font-mono">price = base / √(supply + 1)</span><br />
              Price decreases as supply grows. Early buyers pay premium for time advantage.
            </p>
            <p className="mb-2">
              Other models include fixed, linear, exponential, and bonding curves. The curve
              is the economic constitution of the token.
            </p>
          </section>

          {/* 5. Hierarchical Ownership */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">5. Hierarchical Ownership</h2>
            <p className="mb-2">
              A domain is a business with a corporate structure. Child paths are subsidiaries.
              When a child path is created, 50% of tokens go to the parent.
            </p>
            <p className="mb-2">
              Example: <span className="font-mono">$example.com/$blog</span> created with 1,000,000 tokens.
              500,000 go to <span className="font-mono">$example.com</span> (parent), 500,000 available for sale.
            </p>
            <p className="mb-2">
              Revenue flows UP the tree. Entry fees at leaf nodes split through the hierarchy.
              Root shareholders benefit from ALL activity in the tree. A majority shareholder
              in the root has access to everything underneath.
            </p>
          </section>

          {/* 6. Network Incentives: path402d */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">6. Network Incentives</h2>
            <p className="mb-2">
              Bitcoin has <span className="font-mono">bitcoind</span>. The $402 network has
              <span className="font-mono">path402d</span>—the indexing and serving daemon.
            </p>
            <p className="mb-2">
              path402d performs four functions: (1) INDEX — reads BSV blockchain, tracks all
              $402 tokens; (2) VALIDATE — confirms token ownership before serving; (3) SERVE —
              delivers content to verified holders; (4) EARN — receives $402 rewards via PoW20.
            </p>
            <p className="mb-2">
              PoW20 requires hash puzzles to mint tokens: <span className="font-mono">double_sha256(solution) &lt; difficulty</span>.
              This isn't just to reward work—it forces operators into visibility. Scale forces
              accountability. Big nodes can't hide.
            </p>
            <p className="mb-2">
              The token model works like a shareholder meeting pass. The token is a perpetual
              pass because the content is a living stream. Not burned on access—tradeable,
              resellable, dynamic.
            </p>
          </section>

          {/* 7. The Content Market */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">7. The Content Market</h2>
            <p className="mb-2">
              Content isn't just consumed—it's traded. Each inscription is a speculative asset
              in a marketplace of ideas. Bots and humans compete to control narratives through
              economic means.
            </p>
            <p className="mb-2">
              <strong>Sellers spread narrative. Buyers can suppress it.</strong> Christians
              SELL Christian content to Muslims. If Muslims buy, they read the Christian
              perspective. The seller wins by distributing widely.
            </p>
            <p className="mb-2">
              Token control thresholds: &lt;50% = access only; 51% = can embargo; 67% = can
              change pricing; 100% = complete control.
            </p>
            <p className="mb-2">
              Unlike traditional censorship (invisible), $402 censorship is on-chain and visible.
              The inscription is permanent. Only serving is controlled. Anyone can see who
              bought it, why it was embargoed, and how much they paid.
            </p>
            <p className="mb-2">
              Suppression is expensive—and the creator gets paid. To acquire 51% of 1M tokens
              costs approximately 391M sats (~$40,000). Suppression funds the person being silenced.
            </p>
          </section>

          {/* 8. AI Agents */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">8. AI Agents</h2>
            <p className="mb-2">
              The flywheel works better for AI agents than humans. No subscription fatigue,
              programmatic access, 24/7 operation, data-driven ROI decisions.
            </p>
            <p className="mb-2">
              Self-funding agents: An agent that stakes early, runs infrastructure, and earns
              from new buyers can recover its investment and become profitable. Bots dominate
              the early market because they're faster—scanning thousands of inscriptions per
              second, catching every mint.
            </p>
          </section>

          {/* 9. Protocol Interoperability */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">9. Protocol Interoperability</h2>
            <p className="mb-2">
              $402 proposes something radical: the domain name becomes the ticker symbol.
              <span className="font-mono">$coinbase.com</span> replaces $COIN on NYSE. Every
              company already owns their domain. With $402, that domain becomes their cap table.
            </p>
            <p className="mb-2">
              <strong>x402 vs $402:</strong> x402 (Coinbase) is payment verification—"Did they
              pay?" $402 is the economic model—"What do they own?" $402 sits on top of x402.
              We don't compete with x402—we complete it.
            </p>
            <p className="mb-2">
              The browser communicates with path402d through BRC-100, the wallet-to-application
              interface specification on BSV.
            </p>
          </section>

          {/* 10. Conclusion */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">10. Conclusion</h2>
            <p className="mb-2">
              The $402 protocol turns websites into shareholder businesses. Every visitor can
              become an owner. Every owner can become a partner. Every partner helps run the
              infrastructure that makes the business work.
            </p>
            <p className="mb-2">
              There are no separate classes—just the same person at different stages of commitment.
              Buy, stake, serve, earn. The flywheel spins.
            </p>
            <p className="mb-2">
              HTTP 402 was reserved for "future use" in 1999. That future is now.
            </p>
          </section>

          {/* References */}
          <section className="mb-4 break-inside-avoid-column">
            <h2 className="font-bold text-sm mb-2">References</h2>
            <ol className="list-decimal list-inside space-y-1 text-[10px]">
              <li>Nakamoto, S. (2008). Bitcoin: A Peer-to-Peer Electronic Cash System.</li>
              <li>RFC 2616 (1999). HTTP/1.1 Status Code 402 Payment Required.</li>
              <li>Coinbase (2024). x402 Protocol Specification.</li>
              <li>Anthropic (2024). Model Context Protocol (MCP).</li>
              <li>1Sat Ordinals (2024). BSV-21 Token Standard. docs.1satordinals.com</li>
              <li>POW-20 Protocol (2024). Layer-1 tokens backed by proof-of-work.</li>
              <li>BSV Association (2025). BRC-100 Wallet-to-Application Interface.</li>
              <li>PATH402.com (2026). Protocol Vision Document.</li>
            </ol>
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500">
          <p>Version 2.2.0 · February 2026 · path402.com</p>
          <p>Released under the Open BSV License version 4</p>
        </footer>
      </div>
    </>
  );
}
