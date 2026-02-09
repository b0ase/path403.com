'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import ClientSignupForm from '@/components/ClientSignupForm';

export default function ClientsPage() {
  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-cyan-500/30 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.div
          className="mb-12 border-b border-zinc-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <Link href="/clients/kintsugi" className="bg-zinc-900/50 p-2 md:p-3 border border-zinc-800 self-start rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors group">
              <Image
                src="/images/blog/kintsugi-bowl.jpg"
                alt="Kintsugi"
                width={80}
                height={80}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                START_A_PROJECT
              </h1>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                CLIENT_ONBOARDING
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl leading-relaxed">
            Tell us about your project. Select the services you need, and we&apos;ll create a custom proposal for you.
          </p>
          <Link
            href="/clients/kintsugi"
            className="inline-flex items-center gap-2 mt-4 text-amber-500 hover:text-amber-400 transition-colors text-sm"
          >
            <span>Or chat with Kintsugi to explore what we can build together</span>
            <span>→</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <ClientSignupForm />
        </motion.div>
      </motion.section>
    </motion.div>
  );
}