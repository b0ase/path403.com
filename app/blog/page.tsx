'use client';

import { motion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay, ease }
  })
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.6, delay }
  })
};

const posts = [
  {
    title: 'DNS-DEX: The Stock Exchange Where Every Ticker Is a URL',
    description: 'How a TXT record, a token, and a 51% vote turn any domain name into a publicly traded company.',
    href: 'https://b0ase.com/blog/dns-dex-stock-exchange-urls',
    date: '2026-02-09',
    tag: 'dns-dex',
  },
  {
    title: '$401: The Cinema Ticket and the ID Check',
    description: 'A standard for proving who you are, what you own, and what you\'re willing to stake your name on.',
    href: 'https://b0ase.com/blog/401-cinema-ticket-id-check',
    date: '2026-02-09',
    tag: 'identity',
  },
  {
    title: '$401 and $402: Red Blood and Blue Blood',
    description: 'Why identity tokens flow one way, content tokens flow the other, and neither one is money.',
    href: 'https://b0ase.com/blog/401-402-red-blue-blood',
    date: '2026-02-09',
    tag: 'synthesis',
  },
  {
    title: 'The $402 Ecosystem: A Modular Internet Where Everything Has a Price',
    description: 'Identity tokens, content tokens, code tokens, and the client that binds them all.',
    href: 'https://b0ase.com/blog/402-ecosystem-identity-code-tokens',
    date: '2026-02-09',
    tag: 'ecosystem',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-[1920px] mx-auto px-6 md:px-16 py-16">
        <motion.div
          initial="hidden"
          animate="visible"
        >
          <motion.div custom={0} variants={fadeIn} className="mb-8">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-2">
              The $402 Protocol Series
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 font-display">
              BLOG<span className="text-zinc-300 dark:text-zinc-700">.SYS</span>
            </h1>
          </motion.div>

          <div className="border border-zinc-200 dark:border-zinc-800">
            {posts.map((post, i) => (
              <motion.a
                key={post.href}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                custom={0.1 + i * 0.08}
                variants={fadeUp}
                className={`block p-8 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors ${
                  i < posts.length - 1 ? 'border-b border-zinc-200 dark:border-zinc-800' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[8px] font-mono text-amber-500 uppercase tracking-widest">{post.tag}</span>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{post.date}</span>
                    </div>
                    <h2 className="text-lg font-black tracking-tight mb-2">{post.title}</h2>
                    <p className="text-zinc-500 text-sm">{post.description}</p>
                  </div>
                  <span className="text-zinc-400 text-lg shrink-0">&rarr;</span>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
