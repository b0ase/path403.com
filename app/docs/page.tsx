'use client';

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 }
};

export default function DocsPage() {
  const [domainInput, setDomainInput] = useState('');
  const [handleInput, setHandleInput] = useState('');
  const [issuerAddressInput, setIssuerAddressInput] = useState('');
  const [templateResult, setTemplateResult] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [issuerError, setIssuerError] = useState<string | null>(null);
  const [issuerLoading, setIssuerLoading] = useState(false);

  const tocItems = [
    { id: "what-is-path402", label: "What is $402?" },
    { id: "addresses", label: "$addresses" },
    { id: "pricing-models", label: "Pricing Models" },
    { id: "issuer-verification", label: "Issuer Verification" },
    { id: "mcp-server", label: "MCP Server" },
    { id: "tools", label: "Available Tools" },
    { id: "self-funding", label: "Self-Funding Agents" },
  ];

  const pricingModels = [
    { title: "sqrt_decay (Recommended)", desc: "Price = Base / √(supply + 1). Early buyers pay more, price decreases with supply.", note: "Key insight: Every buyer except the last achieves positive ROI." },
    { title: "Fixed", desc: "Same price for everyone, regardless of supply." },
    { title: "Logarithmic Decay", desc: "Gentler price decrease than sqrt_decay." },
    { title: "Linear with Floor", desc: "Linear decrease to a minimum price." },
  ];

  const tools = [
    { name: "path402_discover", desc: "Probe a $address — get pricing, supply, revenue model" },
    { name: "path402_evaluate", desc: "Budget check — should the agent buy? Returns ROI estimate" },
    { name: "path402_acquire", desc: "Pay and receive token + content" },
    { name: "path402_serve", desc: "Serve content to a requester and earn revenue" },
    { name: "path402_wallet", desc: "View balance, tokens held, total spent/earned" },
    { name: "path402_economics", desc: "Deep dive into breakeven, ROI projections" },
    { name: "path402_batch_discover", desc: "Discover multiple $addresses at once" },
    { name: "path402_price_schedule", desc: "See how price decays with supply" },
    { name: "path402_set_budget", desc: "Configure the agent's spending budget" },
  ];

  const resources = [
    { href: "https://github.com/b0ase/path402", title: "GitHub Repository", desc: "Source code and issues", external: true },
    { href: "https://www.npmjs.com/package/path402", title: "npm Package", desc: "Install and use", external: true },
    { href: "/exchange", title: "Exchange", desc: "Discover and acquire tokens", external: false },
    { href: "https://b0ase.com/exchange", title: "Live Exchange", desc: "Trade real tokens at b0ase.com", external: true },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn}>
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white text-sm mb-4 inline-block">
              ← Back to Home
            </Link>
          </motion.div>
          <motion.h1
            className="text-5xl font-bold text-zinc-900 dark:text-white mb-4"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            Documentation
          </motion.h1>
          <motion.p
            className="text-zinc-400"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            Everything you need to know about the $402 protocol.
          </motion.p>
          <motion.div variants={fadeIn} transition={{ delay: 0.3 }} className="mt-6">
            <Link
              href="/docs/spec"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Read Full Specification →
            </Link>
          </motion.div>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          className="border border-zinc-200 dark:border-zinc-800 p-6 mb-12 bg-zinc-50 dark:bg-zinc-950 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ borderColor: "rgba(128,128,128,0.4)" }}
        >
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wider">Contents</h2>
          <ul className="space-y-2 text-sm">
            {tocItems.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <a href={`#${item.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                  {item.label}
                </a>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* What is $402 */}
        <motion.section
          id="what-is-path402"
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">What is $402?</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            $402 is a protocol that turns any URL path into a priced, tokenised market. Put a{" "}
            <code className="text-zinc-900 dark:text-white bg-zinc-900 px-2 py-1 ">$</code> in front of a path segment
            and it becomes an economic object with a price curve, a supply count, holders who serve
            the content, and revenue that flows to participants.
          </p>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            The name combines:
          </p>
          <ul className="list-disc list-inside text-zinc-400 space-y-2 mb-4">
            <li><strong className="text-zinc-900 dark:text-white">$PATH</strong> — the namespace/directory concept (every $address is a path)</li>
            <li><strong className="text-zinc-900 dark:text-white">402</strong> — HTTP 402 Payment Required (the response that triggers payment)</li>
            <li><strong className="text-zinc-900 dark:text-white">BRC-105</strong> — The normative BSV payment handshake for HTTP 402 responses</li>
            <li><strong className="text-zinc-900 dark:text-white">BRC-24</strong> — Lookup Service model for decentralized content discovery</li>
          </ul>
        </motion.section>

        {/* $addresses */}
        <motion.section
          id="addresses"
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">$addresses</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            Content behind <code className="text-zinc-900 dark:text-white bg-zinc-900 px-2 py-1 ">$</code> path segments
            is $402-gated. Each segment is an independent market.
          </p>
          <motion.pre
            className="bg-zinc-900 p-6 font-mono text-sm text-zinc-400 overflow-x-auto mb-4 "
            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            {`$example.com                    → site-level token (cheap)
$example.com/$blog              → section token
$example.com/$blog/$my-post     → content token (the actual content)`}
          </motion.pre>
          <p className="text-zinc-400 leading-relaxed">
            Each <code className="text-zinc-900 dark:text-white bg-zinc-900 px-1 ">$</code> segment creates a new market
            with its own price curve, supply, and token holders.
          </p>
        </motion.section>

        {/* Pricing Models */}
        <motion.section
          id="pricing-models"
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl font-bold text-zinc-900 dark:text-white mb-6"
            variants={fadeIn}
          >
            Pricing Models
          </motion.h2>
          <div className="space-y-4">
            {pricingModels.map((model, i) => (
              <motion.div
                key={i}
                className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950 "
                variants={scaleIn}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{
                  borderColor: "rgba(255,255,255,0.3)",
                  transition: { duration: 0.2 }
                }}
              >
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{model.title}</h3>
                <p className="text-zinc-400 text-sm mb-2">{model.desc}</p>
                {model.note && (
                  <p className="text-zinc-500 text-sm italic">{model.note}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Issuer Verification */}
        <motion.section
          id="issuer-verification"
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Issuer Verification</h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Issuers must prove domain control (DNS + well-known) and bind it to a BSV address
            with an on-chain signature. Use this panel to generate the template and check status.
            Full spec: <Link className="text-blue-400 hover:text-blue-300" href="/docs/domain-verification">Domain Verification</Link>
          </p>

          <div className="border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Domain</label>
                <input
                  className="w-full mt-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-white"
                  placeholder="example.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Handle</label>
                <input
                  className="w-full mt-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-white"
                  placeholder="@handle"
                  value={handleInput}
                  onChange={(e) => setHandleInput(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500">Issuer Address</label>
                <input
                  className="w-full mt-2 bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-900 dark:text-white"
                  placeholder="1ABC..."
                  value={issuerAddressInput}
                  onChange={(e) => setIssuerAddressInput(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <button
                className="px-4 py-2 bg-zinc-900 text-white text-xs uppercase tracking-widest"
                onClick={async () => {
                  setIssuerLoading(true);
                  setIssuerError(null);
                  setTemplateResult(null);
                  try {
                    const res = await fetch('/api/domain/verify-template', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        domain: domainInput,
                        handle: handleInput,
                        issuer_address: issuerAddressInput,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || 'Failed to generate template');
                    }
                    setTemplateResult(JSON.stringify(data, null, 2));
                  } catch (err) {
                    setIssuerError(err instanceof Error ? err.message : 'Failed to generate template');
                  } finally {
                    setIssuerLoading(false);
                  }
                }}
                disabled={issuerLoading}
              >
                {issuerLoading ? 'Generating...' : 'Generate Template'}
              </button>
              <button
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-xs uppercase tracking-widest text-zinc-700 dark:text-zinc-300"
                onClick={async () => {
                  setIssuerLoading(true);
                  setIssuerError(null);
                  setVerifyResult(null);
                  try {
                    const res = await fetch('/api/domain/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        domain: domainInput,
                        handle: handleInput,
                        issuer_address: issuerAddressInput,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || 'Failed to verify domain');
                    }
                    setVerifyResult(JSON.stringify(data, null, 2));
                  } catch (err) {
                    setIssuerError(err instanceof Error ? err.message : 'Failed to verify domain');
                  } finally {
                    setIssuerLoading(false);
                  }
                }}
                disabled={issuerLoading}
              >
                Check Verification
              </button>
            </div>

            {issuerError && (
              <div className="text-red-500 text-sm mb-3">{issuerError}</div>
            )}

            {templateResult && (
              <div className="mb-4">
                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Template</div>
                <pre className="bg-black text-zinc-200 text-xs p-4 overflow-x-auto">{templateResult}</pre>
              </div>
            )}

            {verifyResult && (
              <div>
                <div className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Verification Result</div>
                <pre className="bg-black text-zinc-200 text-xs p-4 overflow-x-auto">{verifyResult}</pre>
              </div>
            )}
          </div>
        </motion.section>

        {/* MCP Server */}
        <motion.section
          id="mcp-server"
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">MCP Server</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            The path402 enables AI agents to interact with $402 content.
          </p>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Installation</h3>
          <motion.pre
            className="bg-zinc-900 p-6 font-mono text-sm text-zinc-400 overflow-x-auto mb-6 "
            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            npm install path402
          </motion.pre>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Claude Desktop Configuration</h3>
          <motion.pre
            className="bg-zinc-900 p-6 font-mono text-sm text-zinc-400 overflow-x-auto mb-6 "
            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            {`{
  "mcpServers": {
    "path402": {
      "command": "npx",
      "args": ["path402"]
    }
  }
}`}
          </motion.pre>
          <p className="text-gray-400">
            Add this to your <code className="text-zinc-900 dark:text-white bg-zinc-900 px-1 ">claude_desktop_config.json</code> file.
          </p>
        </motion.section>

        {/* Tools */}
        <motion.section
          id="tools"
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Available Tools</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 text-zinc-500 font-medium">Tool</th>
                  <th className="text-left py-3 text-zinc-500 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                {tools.map((tool, i) => (
                  <motion.tr
                    key={tool.name}
                    className="border-b border-zinc-800"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  >
                    <td className="py-3 font-mono text-blue-400">{tool.name}</td>
                    <td className="py-3">{tool.desc}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Self-Funding Agents */}
        <motion.section
          id="self-funding"
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">Self-Funding Agents</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            The vision: an AI agent that starts with a small balance and grows it by:
          </p>
          <ol className="list-decimal list-inside text-zinc-400 space-y-2 mb-6">
            <li>Acquiring undervalued tokens early</li>
            <li>Serving content to later buyers</li>
            <li>Reinvesting earnings into new tokens</li>
            <li>Eventually operating at profit</li>
          </ol>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            This is possible because sqrt_decay pricing mathematically guarantees positive returns
            for early buyers. The agent's job is to identify good opportunities early.
          </p>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">Agent Strategy Tips</h3>
          <ul className="list-disc list-inside text-zinc-400 space-y-2">
            <li><strong className="text-zinc-900 dark:text-white">Buy early:</strong> Position matters. #5 earns more than #500.</li>
            <li><strong className="text-zinc-900 dark:text-white">Check breakeven:</strong> If breakeven requires 1000+ future buyers, skip.</li>
            <li><strong className="text-zinc-900 dark:text-white">Diversify:</strong> Hold multiple tokens to average out risk.</li>
            <li><strong className="text-zinc-900 dark:text-white">Serve actively:</strong> Revenue only flows when you serve and provide BRC-104 proof.</li>
            <li><strong className="text-zinc-900 dark:text-white">Monitor ROI:</strong> Use path402_servable to track performance and BRC-24 signals.</li>
          </ul>
        </motion.section>

        {/* Links */}
        <motion.section
          className="border-t border-zinc-800 pt-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-sm font-medium text-zinc-500 mb-6 uppercase tracking-wider"
            variants={fadeIn}
          >
            Resources
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ x: 4 }}
              >
                {resource.external ? (
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-zinc-200 dark:border-zinc-800 p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors  bg-zinc-50 dark:bg-zinc-950"
                  >
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{resource.title}</h3>
                    <p className="text-zinc-400 text-sm">{resource.desc}</p>
                  </a>
                ) : (
                  <Link
                    href={resource.href}
                    className="block border border-zinc-200 dark:border-zinc-800 p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors  bg-zinc-50 dark:bg-zinc-950"
                  >
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{resource.title}</h3>
                    <p className="text-zinc-400 text-sm">{resource.desc}</p>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
