"use client";

import { use, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowLeft, FiMail, FiExternalLink } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

export default function ContractDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [contract, setContract] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load markdown file
    fetch(`/contracts/${slug}.md`)
      .then(res => res.text())
      .then(text => {
        setContract(text);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading contract:', err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-600 font-mono text-sm uppercase">Loading contract...</div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 font-mono text-sm uppercase mb-4">Contract not found</p>
          <Link
            href="/contracts"
            className="inline-block px-6 py-3 border border-zinc-800 text-zinc-500 text-xs font-mono uppercase hover:border-white hover:text-white transition-all"
          >
            ← Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  // Extract metadata and content
  const [metadata, ...contentLines] = contract.split('---\n').filter(Boolean);
  const content = contentLines.join('---\n');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm font-mono uppercase mb-8 transition-colors"
            >
              <FiArrowLeft size={16} /> Back to Contracts
            </Link>

            <div className="flex items-start justify-between gap-6 border-b border-zinc-900 pb-6">
              <div className="flex-1">
                <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-900/20 border border-green-900 text-green-500 mb-3">
                  On-Chain Contract
                </span>
                <h1 className="text-2xl md:text-4xl font-bold mb-2 leading-tight">
                  {slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h1>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">
                  Provider: b0ase.com · Verified GitHub: @b0ase
                </p>
              </div>

              <div className="text-right">
                <a
                  href={`mailto:richard@b0ase.com?subject=Order: ${slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono"
                >
                  <FiMail size={14} /> Order Now
                </a>
              </div>
            </div>
          </div>

          {/* Contract Content */}
          <div className="prose prose-invert prose-sm max-w-none contract-content text-sm leading-relaxed text-zinc-300">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 pt-8 border-t border-zinc-900 flex flex-col md:flex-row gap-4">
            <a
              href={`mailto:richard@b0ase.com?subject=Order: ${slug}&body=I'd like to order this service. Please send me an invoice.`}
              className="flex-1 py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all text-center font-mono"
            >
              Order This Service
            </a>
            <a
              href={`mailto:richard@b0ase.com?subject=Question about: ${slug}`}
              className="flex-1 py-4 border border-zinc-800 text-zinc-400 text-sm font-bold uppercase tracking-widest hover:border-white hover:text-white transition-all text-center font-mono"
            >
              Ask a Question
            </a>
          </div>

          {/* Inscription Info */}
          <div className="mt-8 p-6 border border-blue-900 bg-blue-950/10">
            <h3 className="text-sm font-bold uppercase mb-3 text-blue-400 font-mono">
              On-Chain Inscription
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              This contract will be inscribed on the BSV blockchain as a permanent, verifiable offer.
              Once inscribed, it can be discovered by AI search engines and verified by anyone.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-zinc-600">Status:</span>
              <span className="px-2 py-1 bg-yellow-900/20 border border-yellow-900 text-yellow-500 uppercase">
                Pending Inscription
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
