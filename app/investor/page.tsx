'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface TokenHolding {
  token_symbol: string
  holder_name: string
  allocation_tokens: number
  allocation_percentage: number
  status: string
  price_per_token: number
}

interface InvestorData {
  email: string
  name: string
  holdings: TokenHolding[]
  total_value_gbp: number
  documents: { name: string; url: string }[]
}

export default function InvestorDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<InvestorData | null>(null)
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)

  const checkHoldings = async () => {
    if (!email) return
    setChecking(true)
    try {
      const res = await fetch(`/api/investor/holdings?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      } else {
        setData(null)
      }
    } catch (err) {
      console.error('Failed to fetch holdings:', err)
    } finally {
      setChecking(false)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Investor Dashboard</h1>
          <Link href="/" className="text-zinc-400 hover:text-white">
            &larr; Back to b0ase
          </Link>
        </div>

        {!data ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8">
            <h2 className="text-xl font-semibold mb-4">Check Your Holdings</h2>
            <p className="text-zinc-400 mb-6">
              Enter your email to view your token holdings and investment documents.
            </p>
            <div className="flex gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={checkHoldings}
                disabled={checking || !email}
                className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                {checking ? 'Checking...' : 'View Holdings'}
              </button>
            </div>
            <p className="text-sm text-zinc-500 mt-4">
              Don&apos;t have an investment yet?{' '}
              <Link href="/invest/kintsugi" className="text-amber-400 hover:underline">
                Invest in $KINTSUGI
              </Link>
            </p>
          </div>
        ) : (
          <>
            {/* Portfolio Overview */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-zinc-400 text-sm mb-1">Total Holdings</p>
                <p className="text-2xl font-bold">{data.holdings.length} tokens</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-zinc-400 text-sm mb-1">Est. Value</p>
                <p className="text-2xl font-bold">£{data.total_value_gbp.toLocaleString()}</p>
              </div>
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                <p className="text-zinc-400 text-sm mb-1">Status</p>
                <p className="text-2xl font-bold text-green-400">Active</p>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden mb-8">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="text-lg font-semibold">Your Token Holdings</h2>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                    <th className="text-left py-3 px-4">Token</th>
                    <th className="text-right py-3 px-4">Tokens</th>
                    <th className="text-right py-3 px-4">%</th>
                    <th className="text-right py-3 px-4">Value</th>
                    <th className="text-right py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.holdings.map((holding, i) => (
                    <tr key={i} className="border-b border-zinc-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 text-sm font-mono">
                            ${holding.token_symbol.slice(0, 1)}
                          </span>
                          <span className="font-medium">${holding.token_symbol}</span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-mono text-sm">
                        {holding.allocation_tokens.toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-4 font-semibold">
                        {holding.allocation_percentage}%
                      </td>
                      <td className="text-right py-4 px-4">
                        £{(holding.allocation_tokens * holding.price_per_token).toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          holding.status === 'confirmed' ? 'bg-green-500/10 text-green-400' :
                          holding.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-zinc-500/10 text-zinc-400'
                        }`}>
                          {holding.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Documents */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Documents</h2>
              <div className="space-y-3">
                <a
                  href="/legal/kintsugi-subscription-agreement.html"
                  target="_blank"
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <span>$KINTSUGI Subscription Agreement</span>
                  </div>
                  <span className="text-zinc-400">View →</span>
                </a>
                {data.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📄</span>
                      <span>{doc.name}</span>
                    </div>
                    <span className="text-zinc-400">View →</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setData(null)}
                className="px-4 py-2 border border-zinc-700 rounded-lg hover:border-zinc-500 transition-colors"
              >
                Sign Out
              </button>
              <Link
                href="/invest/kintsugi"
                className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
              >
                Invest More
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
