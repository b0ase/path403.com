'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Crypto wallet addresses for receiving investment
const WALLET_ADDRESSES = {
  eth: '0xe1aBe52c85DbCbFbA1798D0fA5C6E9400189D0Ec',
  bsv: '1BmKV5CucGmhLxU8gpKS9aAYCB1kz1KDhf', // TODO: Update with actual BSV address
  btc: '1BmKV5CucGmhLxU8gpKS9aAYCB1kz1KDhf', // TODO: Update with actual BTC address
  sol: '', // TODO: Add Solana address
}

const CAP_TABLE = [
  { holder: 'b0ase Ventures (Studio)', tokens: '500,000,000', percentage: '50%', status: 'Locked', type: 'company' },
  { holder: 'Richard Boase (Founder)', tokens: '400,000,000', percentage: '40%', status: 'Vesting', type: 'founder' },
  { holder: 'Investor Pool', tokens: '100,000,000', percentage: '10%', status: 'Available', type: 'available' },
]

const USE_OF_FUNDS = [
  { item: 'AI API Costs (Claude/Kimi)', percentage: 60, amount: '£600' },
  { item: 'Infrastructure (Hosting/DB)', percentage: 20, amount: '£200' },
  { item: 'Legal/Compliance', percentage: 10, amount: '£100' },
  { item: 'Marketing/Launch', percentage: 10, amount: '£100' },
]

const ROADMAP = [
  { phase: 'Phase 1', title: 'Core Engine', status: 'complete', items: ['AI Chat Interface', 'Startup Package Generator', 'Session Management'] },
  { phase: 'Phase 2', title: 'Token Infrastructure', status: 'current', items: ['Token Creation', 'Cap Table Management', 'Investor Portal'] },
  { phase: 'Phase 3', title: 'Full Automation', status: 'upcoming', items: ['Website Generation', 'Social Media Setup', 'KYC Integration'] },
  { phase: 'Phase 4', title: 'Scale', status: 'upcoming', items: ['Multi-tenant Support', 'White-label Option', 'API Access'] },
]

export default function KintsugiInvestPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showCrypto, setShowCrypto] = useState(false)
  const [cryptoChain, setCryptoChain] = useState<'eth' | 'btc' | 'sol' | 'bsv'>('eth')

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invest/kintsugi/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Failed to register interest:', err)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Studio Investment Banner */}
      <div className="bg-blue-500/10 border-b border-blue-500/20 py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 text-sm">
          <span className="text-blue-400">Looking for portfolio exposure?</span>
          <Link
            href="/invest/boase"
            className="px-3 py-1 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-400 transition-colors"
          >
            Invest in $BOASE (Studio Token)
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1 mb-6 text-sm font-mono bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
              Product Token — Direct Kintsugi Ownership
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Invest in
              <span className="text-amber-400"> Kintsugi</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              Kintsugi is an AI engine that helps people build software projects.
              We&apos;re looking for aligned investors who believe in consultative AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#invest"
                className="px-8 py-4 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
              >
                Let&apos;s Talk Investment
              </a>
              <Link
                href="/kintsugi"
                className="px-8 py-4 border border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
              >
                Try Kintsugi
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Opportunity */}
      <section className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">The Opportunity</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">The Problem</h3>
              <p className="text-zinc-400">
                Starting a startup requires weeks of setup: legal, tokens, website, social, KYC.
                Most founders give up before they start.
              </p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">The Solution</h3>
              <p className="text-zinc-400">
                Kintsugi automates the entire process. Describe your idea, get a complete
                startup package in one conversation.
              </p>
            </div>
            <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">The Model</h3>
              <p className="text-zinc-400">
                Custom arrangements per project — consulting, development, equity deals.
                Revenue scales with each successful project partnership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cap Table */}
      <section className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Cap Table</h2>
          <p className="text-zinc-400 mb-6">
            $KINTSUGI has 1 billion tokens. 10% is available for investors — price negotiable based on investment size and involvement.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Holder</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Tokens</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">%</th>
                  <th className="text-right py-3 px-4 text-zinc-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {CAP_TABLE.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          row.type === 'available' ? 'bg-green-500' :
                          row.type === 'founder' ? 'bg-amber-500' : 'bg-zinc-500'
                        }`} />
                        {row.holder}
                      </div>
                    </td>
                    <td className="text-right py-4 px-4 font-mono text-sm">{row.tokens}</td>
                    <td className="text-right py-4 px-4 font-semibold">{row.percentage}</td>
                    <td className="text-right py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        row.status === 'Available' ? 'bg-green-500/10 text-green-400' :
                        row.status === 'Vesting' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-zinc-500/10 text-zinc-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-zinc-500 mt-4">
            b0ase Ventures (50%) flows value to $BOASE token holders. Founder tokens vest over 2 years.
          </p>
        </div>
      </section>

      {/* Use of Funds */}
      <section className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Use of Funds (First £1,000)</h2>
          <div className="space-y-4">
            {USE_OF_FUNDS.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span>{item.item}</span>
                  <span className="text-zinc-400">{item.amount} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-zinc-500 mt-6">
            Primary use: AI API costs (Claude, Kimi) to power the Kintsugi chat engine.
            £1,000 covers approximately 12 months of moderate usage.
          </p>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Roadmap</h2>
          <div className="space-y-6">
            {ROADMAP.map((phase, i) => (
              <div
                key={i}
                className={`p-6 rounded-xl border ${
                  phase.status === 'complete' ? 'bg-green-500/5 border-green-500/20' :
                  phase.status === 'current' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                    phase.status === 'complete' ? 'bg-green-500/10 text-green-400' :
                    phase.status === 'current' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-zinc-700 text-zinc-400'
                  }`}>
                    {phase.phase}
                  </span>
                  <h3 className="font-semibold">{phase.title}</h3>
                  {phase.status === 'complete' && <span className="text-green-400">✓</span>}
                  {phase.status === 'current' && <span className="text-amber-400">→</span>}
                </div>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-sm text-zinc-400">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Team</h2>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-2xl">
              RB
            </div>
            <div>
              <h3 className="text-xl font-semibold">Richard Boase</h3>
              <p className="text-zinc-400 mb-3">Founder, b0ase.com</p>
              <p className="text-zinc-400 text-sm max-w-xl">
                Building venture infrastructure since 2023. b0ase.com is a full-stack venture studio
                with 117 developer services, blockchain integration, and AI-powered tools.
                Kintsugi is the culmination of this infrastructure — automated startup creation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="invest" className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Interested in Investing?</h2>
          <p className="text-zinc-400 mb-8">
            We&apos;re open to investors who want to be involved. Investment amount and equity are negotiable — let&apos;s discuss.
          </p>

          {!submitted ? (
            <div className="space-y-6">
              {/* Payment Method Toggle */}
              <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
                <button
                  onClick={() => setShowCrypto(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !showCrypto ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Express Interest
                </button>
                <button
                  onClick={() => setShowCrypto(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    showCrypto ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Pay with Crypto
                </button>
              </div>

              {!showCrypto ? (
                <form onSubmit={handleInterestSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
                  >
                    Express Interest
                  </button>
                  <p className="text-xs text-zinc-500">
                    Expressing interest is not a commitment. We&apos;ll send you the subscription agreement to review.
                  </p>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Chain Selection */}
                  <div className="grid grid-cols-4 gap-2">
                    {(['eth', 'btc', 'bsv', 'sol'] as const).map((chain) => (
                      <button
                        key={chain}
                        onClick={() => setCryptoChain(chain)}
                        disabled={!WALLET_ADDRESSES[chain]}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          cryptoChain === chain
                            ? 'bg-zinc-700 text-white'
                            : !WALLET_ADDRESSES[chain]
                            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                        }`}
                      >
                        {chain.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Wallet Address */}
                  {WALLET_ADDRESSES[cryptoChain] ? (
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
                      <p className="text-xs text-zinc-400 mb-2">
                        Contact us first to discuss investment amount, then send {cryptoChain.toUpperCase()} to:
                      </p>
                      <code className="block p-3 bg-black rounded text-xs font-mono text-amber-400 break-all select-all">
                        {WALLET_ADDRESSES[cryptoChain]}
                      </code>
                      <p className="text-xs text-zinc-500 mt-3">
                        Email <a href="mailto:kintsugi@b0ase.com" className="text-amber-400">kintsugi@b0ase.com</a> to start the conversation.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700 text-center">
                      <p className="text-zinc-500 text-sm">
                        {cryptoChain.toUpperCase()} payments coming soon. Use ETH or contact us directly.
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-zinc-500 space-y-1">
                    <p>• Payment verified within 24 hours</p>
                    <p>• Subscription agreement sent after verification</p>
                    <p>• Tokens allocated upon agreement signature</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-xl font-semibold text-green-400 mb-2">Interest Registered</h3>
              <p className="text-zinc-400">
                We&apos;ll send the $KINTSUGI Subscription Agreement to {email} within 24 hours.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            $KINTSUGI is a product token of b0ase.com. Not financial advice.
          </p>
          <div className="flex gap-6">
            <Link href="/kintsugi" className="text-sm text-zinc-400 hover:text-white">Try Demo</Link>
            <Link href="/portfolio" className="text-sm text-zinc-400 hover:text-white">Portfolio</Link>
            <Link href="/" className="text-sm text-zinc-400 hover:text-white">b0ase.com</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
