'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

// Crypto wallet addresses for receiving investment
const WALLET_ADDRESSES = {
  eth: '0xe1aBe52c85DbCbFbA1798D0fA5C6E9400189D0Ec',
  bsv: '', // TODO: Add BSV address
  btc: '', // TODO: Add BTC address
  sol: '', // TODO: Add Solana address
}

// Live $BOASE token info
const BOASE_TOKEN = {
  contract: 'c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
  totalSupply: 1_000_000_000,
  chain: 'BSV (BSV21)',
  market: 'https://1sat.market/market/bsv21/c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',
}

const PORTFOLIO_PRODUCTS = [
  { name: 'Kintsugi Engine', token: '$KINTSUGI', status: 'Building', description: 'AI startup creation' },
  { name: 'MoneyButton.store', token: '$MBUTTON', status: 'Live', description: 'Payment infrastructure' },
  { name: 'Developer Marketplace', token: '$DEVMKT', status: 'Live', description: '117 services' },
  { name: 'bWriter', token: '$BWRITER', status: 'Live', description: 'Writing platform' },
]

const INVESTMENT_TIERS = [
  { amount: 999, percentage: 0.1, tokens: 1_000_000, label: 'Supporter' },
  { amount: 4999, percentage: 0.5, tokens: 5_000_000, label: 'Backer' },
  { amount: 9999, percentage: 1.0, tokens: 10_000_000, label: 'Partner' },
]

export default function BoaseInvestPage() {
  const [email, setEmail] = useState('')
  const [selectedTier, setSelectedTier] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [showCrypto, setShowCrypto] = useState(false)
  const [cryptoChain, setCryptoChain] = useState<'eth' | 'btc' | 'sol' | 'bsv'>('eth')
  const [capTable, setCapTable] = useState<any[]>([])

  useEffect(() => {
    // Fetch live cap table
    fetch('/api/treasury?action=captable')
      .then(res => res.json())
      .then(data => {
        if (data.capTable) setCapTable(data.capTable)
      })
      .catch(console.error)
  }, [])

  const handleInterestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invest/boase/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          tier: INVESTMENT_TIERS[selectedTier].label,
          amount: INVESTMENT_TIERS[selectedTier].amount
        })
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch (err) {
      console.error('Failed to register interest:', err)
    }
  }

  const tier = INVESTMENT_TIERS[selectedTier]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative py-20 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-6xl">B</span>
              <div>
                <span className="inline-block px-3 py-1 text-xs font-mono bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                  Studio Investment
                </span>
                <h1 className="text-4xl md:text-5xl font-bold">
                  $BOASE
                </h1>
              </div>
            </div>

            <p className="text-xl text-zinc-400 mb-8 max-w-2xl">
              Invest in the b0ase venture studio. Get exposure to <span className="text-white">every product we build</span> through
              our 50% stake in each. One investment, full portfolio access.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 text-xs">Token</span>
                <p className="font-mono text-sm">$BOASE</p>
              </div>
              <div className="px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 text-xs">Supply</span>
                <p className="font-mono text-sm">1,000,000,000</p>
              </div>
              <div className="px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 text-xs">Chain</span>
                <p className="font-mono text-sm">{BOASE_TOKEN.chain}</p>
              </div>
              <a
                href={BOASE_TOKEN.market}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                <span className="text-blue-400 text-xs">Live Trading</span>
                <p className="font-mono text-sm text-blue-300">1sat.market &rarr;</p>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="text-3xl mb-4">1</div>
              <h3 className="font-semibold mb-2">You Invest in $BOASE</h3>
              <p className="text-sm text-zinc-400">
                Buy $BOASE tokens representing ownership in the b0ase venture studio.
              </p>
            </div>
            <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="text-3xl mb-4">2</div>
              <h3 className="font-semibold mb-2">b0ase Builds Products</h3>
              <p className="text-sm text-zinc-400">
                We create products (Kintsugi, bWriter, etc.) and retain 50% of each product token.
              </p>
            </div>
            <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <div className="text-3xl mb-4">3</div>
              <h3 className="font-semibold mb-2">Value Flows to You</h3>
              <p className="text-sm text-zinc-400">
                Revenue from all products flows through b0ase's 50% stakes to $BOASE holders.
              </p>
            </div>
          </div>

          <div className="p-6 bg-blue-500/5 rounded-xl border border-blue-500/20">
            <h3 className="font-semibold text-blue-400 mb-3">The Studio Model</h3>
            <pre className="text-sm text-zinc-400 font-mono overflow-x-auto">
{`$BOASE Holders
      ↓ own
b0ase Studio (you're investing here)
      ↓ owns 50% of each:
      ├── $KINTSUGI (AI startup engine)
      ├── $BWRITER (writing platform)
      ├── $MBUTTON (payments)
      └── ... every future product`}
            </pre>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-16 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Current Portfolio</h2>
          <p className="text-zinc-400 mb-6">
            As a $BOASE holder, you have exposure to b0ase's 50% stake in each of these:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {PORTFOLIO_PRODUCTS.map((product, i) => (
              <div key={i} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-xl font-bold">
                  {product.token.slice(1, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{product.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      product.status === 'Live' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">{product.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-zinc-400">{product.token}</p>
                  <p className="text-xs text-zinc-600">50% b0ase</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cap Table */}
      <section className="py-16 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Cap Table</h2>

          {capTable.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-zinc-400 font-medium">Holder</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">Tokens</th>
                    <th className="text-right py-3 px-4 text-zinc-400 font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {capTable.map((entry, i) => (
                    <tr key={i} className="border-b border-zinc-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            entry.category === 'founder' ? 'bg-amber-500' :
                            entry.category === 'treasury' ? 'bg-blue-500' :
                            entry.category === 'investor' ? 'bg-green-500' :
                            'bg-zinc-500'
                          }`} />
                          {entry.displayName || entry.holder}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-sm">
                        {entry.tokens?.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {entry.percentage?.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 bg-zinc-900 rounded-xl border border-zinc-800 text-center text-zinc-500">
              Loading cap table...
            </div>
          )}
        </div>
      </section>

      {/* Investment Tiers */}
      <section className="py-16 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Investment Tiers</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {INVESTMENT_TIERS.map((t, i) => (
              <button
                key={i}
                onClick={() => setSelectedTier(i)}
                className={`p-6 rounded-xl border text-left transition-all ${
                  selectedTier === i
                    ? 'bg-blue-500/10 border-blue-500'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <p className="text-sm text-zinc-400 mb-1">{t.label}</p>
                <p className="text-3xl font-bold mb-2">£{t.amount.toLocaleString()}</p>
                <div className="space-y-1 text-sm">
                  <p className="text-zinc-400">{t.percentage}% of $BOASE</p>
                  <p className="text-zinc-500 font-mono">{t.tokens.toLocaleString()} tokens</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Team</h2>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center text-2xl font-bold">
              RB
            </div>
            <div>
              <h3 className="text-xl font-semibold">Richard Boase</h3>
              <p className="text-zinc-400 mb-3">Founder</p>
              <p className="text-zinc-400 text-sm max-w-xl">
                Building b0ase as a venture studio for the AI/blockchain era. Products include Kintsugi
                (AI startup creation), bWriter (writing platform), MoneyButton (payments), and a
                developer marketplace with 117 services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="invest" className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Invest in $BOASE</h2>
          <p className="text-zinc-400 mb-2">
            Selected: <span className="text-white font-semibold">{tier.label}</span> — £{tier.amount.toLocaleString()} for {tier.percentage}%
          </p>
          <p className="text-zinc-500 text-sm mb-8">
            {tier.tokens.toLocaleString()} $BOASE tokens
          </p>

          {!submitted ? (
            <div className="space-y-6">
              {/* Payment Method Toggle */}
              <div className="flex gap-2 p-1 bg-zinc-900 rounded-lg">
                <button
                  onClick={() => setShowCrypto(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !showCrypto ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Express Interest
                </button>
                <button
                  onClick={() => setShowCrypto(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    showCrypto ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-white'
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
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
                  >
                    Express Interest — £{tier.amount.toLocaleString()}
                  </button>
                  <p className="text-xs text-zinc-500">
                    We&apos;ll send you the $BOASE Subscription Agreement to review.
                  </p>
                </form>
              ) : (
                <div className="space-y-4 text-left">
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
                        Send £{tier.amount.toLocaleString()} equivalent in {cryptoChain.toUpperCase()} to:
                      </p>
                      <code className="block p-3 bg-black rounded text-xs font-mono text-blue-400 break-all select-all">
                        {WALLET_ADDRESSES[cryptoChain]}
                      </code>
                      <p className="text-xs text-zinc-500 mt-3">
                        After sending, email <a href="mailto:invest@b0ase.com" className="text-blue-400">invest@b0ase.com</a> with:
                      </p>
                      <ul className="text-xs text-zinc-500 mt-1 ml-4 list-disc">
                        <li>Transaction ID</li>
                        <li>Your email address</li>
                        <li>Selected tier: {tier.label}</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700 text-center">
                      <p className="text-zinc-500 text-sm">
                        {cryptoChain.toUpperCase()} address coming soon. Use ETH or contact us.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="text-4xl mb-3">✓</div>
              <h3 className="text-xl font-semibold text-green-400 mb-2">Interest Registered</h3>
              <p className="text-zinc-400">
                We&apos;ll send the $BOASE Subscription Agreement to {email} within 24 hours.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            $BOASE is a utility token. Not financial advice. High risk.
          </p>
          <div className="flex gap-6">
            <Link href="/legal/boase-subscription-agreement.html" className="text-sm text-zinc-400 hover:text-white">Subscription Agreement</Link>
            <Link href="/invest/kintsugi" className="text-sm text-zinc-400 hover:text-white">Product Demo ($KINTSUGI)</Link>
            <Link href="/token" className="text-sm text-zinc-400 hover:text-white">Token Details</Link>
            <Link href="/" className="text-sm text-zinc-400 hover:text-white">b0ase.com</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
