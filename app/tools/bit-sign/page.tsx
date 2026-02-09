'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiEdit3, FiFileText, FiShield, FiCheck, FiPlus, FiArrowRight, FiUser } from 'react-icons/fi';
import { SignatureDisplay } from '@/components/bitsign';
import { createClient } from '@/lib/supabase/client';

interface UserSignature {
  id: string;
  signature_name: string;
  signature_type: 'drawn' | 'typed';
  svg_data?: string;
  typed_text?: string;
  typed_font?: string;
  wallet_address?: string;
  wallet_type?: string;
  inscription_txid?: string;
  inscription_url?: string;
  is_default?: boolean;
  created_at: string;
}

export default function BitSignPage() {
  const [signatures, setSignatures] = useState<UserSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadSignatures = async () => {
      // Identity First: Check Supabase auth
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const authenticated = !!user;
      setIsAuthenticated(authenticated);

      if (authenticated) {
        try {
          const res = await fetch('/api/signatures');
          const data = await res.json();
          if (!data.error) {
            setSignatures(data.signatures || []);
          }
        } catch (err) {
          console.error('Failed to load signatures:', err);
        }
      }

      setLoading(false);
    };

    checkAuthAndLoadSignatures();
  }, []);

  const defaultSignature = signatures.find((s) => s.is_default) || signatures[0];

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="relative py-20 px-4 border-b border-zinc-900">
        <div className="max-w-pillar mx-auto">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-900 rounded-pillar text-[10px] uppercase tracking-widest text-zinc-500 mb-6">
              <FiShield size={14} className="text-blue-500" />
              AUTHENTICATION_READY: VERIFIED_IDENTITY
            </div>

            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6">
              BIT<span className="text-zinc-800">.SIGN</span>
            </h1>

            <p className="text-sm text-zinc-500 uppercase tracking-widest max-w-2xl mx-auto mb-12">
              Legally binding digital attestations. Immutable on-chain proof of intent.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/user/account/signatures/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all rounded-pillar"
              >
                <FiPlus size={18} />
                INIT_ENROLLMENT
              </Link>
              <Link
                href="/user/account/signatures"
                className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-950 text-zinc-400 font-bold uppercase tracking-widest text-xs border border-zinc-900 hover:border-zinc-700 hover:text-white transition-all rounded-pillar"
              >
                <FiFileText size={18} />
                ACCESS_ARCHIVE
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-pillar mx-auto">

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-pillar">
              <div className="w-12 h-12 bg-blue-500/10 rounded-pillar flex items-center justify-center mb-4">
                <FiEdit3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Draw or Type</h3>
              <p className="text-zinc-400 text-sm">
                Create your signature by drawing with your mouse/finger, or type your name with stylish signature fonts.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-pillar">
              <div className="w-12 h-12 bg-green-500/10 rounded-pillar flex items-center justify-center mb-4">
                <FiShield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Wallet Verification</h3>
              <p className="text-zinc-400 text-sm">
                Verify your identity by signing with your crypto wallet. Supports MetaMask, Phantom, and HandCash.
              </p>
            </div>

            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-pillar">
              <div className="w-12 h-12 bg-orange-500/10 rounded-pillar flex items-center justify-center mb-4">
                <FiCheck className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Blockchain Proof</h3>
              <p className="text-zinc-400 text-sm">
                Inscribe your signatures and signed documents on the BSV blockchain for permanent, verifiable proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Signature - Only show when authenticated */}
      {!loading && isAuthenticated && (
        <section className="py-16 px-4 border-t border-zinc-900">
          <div className="max-w-pillar mx-auto">

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Your Signature</h2>
              {signatures.length > 0 && (
                <Link
                  href="/user/account/signatures"
                  className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  View all <FiArrowRight size={14} />
                </Link>
              )}
            </div>

            {defaultSignature ? (
              <div className="max-w-md">
                <SignatureDisplay
                  signature={defaultSignature}
                  showDetails
                  size="lg"
                />
              </div>
            ) : (
              <div className="p-8 bg-zinc-900/50 border border-dashed border-zinc-700 rounded-lg text-center">
                <FiEdit3 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">You haven&apos;t created a signature yet</p>
                <Link
                  href="/user/account/signatures/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-pillar"
                >
                  <FiPlus size={16} />
                  Create Your First Signature
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sign In Prompt - Show when not authenticated */}
      {!loading && !isAuthenticated && (
        <section className="py-16 px-4 border-t border-zinc-900">
          <div className="max-w-pillar mx-auto">

            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-pillar text-center">
              <FiUser className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Sign In to Manage Signatures</h3>
              <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                Create an account or sign in to create, manage, and use your blockchain-verified signatures.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors rounded-pillar"
              >
                Sign In
                <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-16 px-4 border-t border-zinc-900">
        <div className="max-w-pillar mx-auto">
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-12 text-center">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Create', desc: 'Draw or type your signature' },
              { step: 2, title: 'Verify', desc: 'Sign with your crypto wallet' },
              { step: 3, title: 'Inscribe', desc: 'Record on BSV blockchain' },
              { step: 4, title: 'Sign', desc: 'Apply to any document' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 border-t border-zinc-900 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold uppercase tracking-tight mb-4">
            Ready to Sign?
          </h2>
          <p className="text-zinc-400 mb-8">
            Create your blockchain-verified signature in under a minute.
          </p>
          <Link
            href="/user/account/signatures/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider transition-colors rounded-pillar"
          >
            Get Started
            <FiArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
