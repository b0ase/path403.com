'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiTwitter, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';

interface TokenizedAccount {
  username: string;
  token_id: string;
  name: string;
  icon_url?: string;
  total_supply: number;
  current_price_sats: number;
  issuer_handle?: string;
  created_at: string;
}

export default function TwitterDirectoryPage() {
  const [accounts, setAccounts] = useState<TokenizedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/twitter/tokenized')
      .then(res => res.json())
      .then(data => {
        setAccounts(data.accounts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <FiTwitter className="text-sky-400" size={28} />
            <h1 className="text-3xl font-bold">Tokenized Twitter Accounts</h1>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Every account below has a tradeable $402 token. Buy tokens to syndicate
            their content and earn from serving it. Creators earn 70% of every purchase.
          </p>

          {/* Stats bar */}
          <div className="flex gap-8 mt-8">
            <div className="flex items-center gap-2">
              <FiUsers className="text-zinc-500" size={16} />
              <span className="text-zinc-400 text-sm">
                <span className="text-white font-mono font-bold">{accounts.length}</span> tokenized accounts
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-zinc-500" size={16} />
              <span className="text-zinc-400 text-sm">sqrt_decay pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <FiDollarSign className="text-zinc-500" size={16} />
              <span className="text-zinc-400 text-sm">$0.01 per token via HandCash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse text-zinc-500">Loading tokenized accounts...</div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <FiTwitter className="mx-auto text-zinc-700" size={48} />
            <h2 className="text-xl font-bold text-zinc-400">No tokenized accounts yet</h2>
            <p className="text-zinc-600 max-w-md mx-auto">
              Be the first to tokenize your Twitter account.
              Connect your Twitter and HandCash wallet to get started.
            </p>
            <Link
              href="/user/account"
              className="inline-block mt-4 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm transition-colors"
            >
              Connect & Tokenize
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account, i) => (
              <motion.div
                key={account.token_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors"
              >
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    {account.icon_url ? (
                      <img
                        src={account.icon_url}
                        alt={account.username}
                        className="w-10 h-10 rounded-full border border-zinc-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <FiTwitter className="text-sky-400" size={16} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white truncate">
                        {account.name || `@${account.username}`}
                      </div>
                      <div className="text-zinc-500 text-sm">@{account.username}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <div className="text-zinc-600 text-[10px] uppercase tracking-wider">Token</div>
                      <div className="text-sky-400 font-mono text-xs mt-0.5">
                        ${account.username.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-600 text-[10px] uppercase tracking-wider">Supply</div>
                      <div className="text-white font-mono text-xs mt-0.5">{account.total_supply}</div>
                    </div>
                    <div>
                      <div className="text-zinc-600 text-[10px] uppercase tracking-wider">Price</div>
                      <div className="text-white font-mono text-xs mt-0.5">
                        {account.current_price_sats} <span className="text-zinc-600">sats</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://x.com/${account.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 text-xs text-zinc-400 hover:text-sky-400 border border-zinc-800 hover:border-sky-500/30 transition-colors"
                    >
                      View on X
                    </a>
                    <Link
                      href={`/user/account?tab=connections`}
                      className="flex-1 text-center py-2 text-xs bg-sky-500 hover:bg-sky-400 text-black font-bold transition-colors"
                    >
                      Buy Token
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA for non-tokenized users */}
        {accounts.length > 0 && (
          <div className="mt-16 border border-zinc-800 p-8 text-center bg-gradient-to-r from-sky-500/5 to-transparent">
            <h2 className="text-xl font-bold mb-2">Tokenize your Twitter account</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-lg mx-auto">
              Turn your audience into an asset. Token holders can syndicate your content
              and you earn 70% of every purchase. All it takes is connecting Twitter + HandCash.
            </p>
            <Link
              href="/user/account"
              className="inline-block px-6 py-3 bg-sky-500 hover:bg-sky-400 text-black font-bold text-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
