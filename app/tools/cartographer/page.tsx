'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FiMap, FiGitBranch, FiLayers, FiExternalLink } from 'react-icons/fi'
import Link from 'next/link'

export default function CartographerPage() {
  return (
    <motion.div className="min-h-screen bg-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.section className="px-4 md:px-8 py-16">
        <div className="max-w-pillar mx-auto">

          <motion.div className="mb-8 border-b border-zinc-900 pb-8">
            <div className="flex items-start gap-6">
              <div className="bg-gray-900/50 p-4 border border-gray-800 rounded-pillar">
                <FiMap className="text-4xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Cartographer</h1>
                <p className="text-zinc-500">AI-powered codebase mapping tool</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-600">
                  <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-pillar">Third-party tool</span>
                  <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-pillar">Claude Plugin</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-8">
            <div className="border border-zinc-800 p-6 bg-zinc-950 rounded-pillar">
              <h2 className="text-2xl font-bold mb-4">What is Cartographer?</h2>
              <p className="text-zinc-400 mb-4">
                Cartographer is a Claude Code plugin that automatically maps and documents codebases of any size.
                It uses parallel Sonnet subagents with 1M token context windows to analyze large projects efficiently.
              </p>
              <p className="text-zinc-400">
                This tool is developed and maintained by the Claude Code plugin marketplace.
                b0ase.com uses it for maintaining our codebase documentation.
              </p>
            </div>

            <div className="border border-zinc-800 p-6 bg-zinc-950 rounded-pillar">
              <h2 className="text-2xl font-bold mb-4">Features</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FiGitBranch className="text-xl text-zinc-500 mt-1" />
                  <div>
                    <h3 className="font-bold">Parallel Analysis</h3>
                    <p className="text-sm text-zinc-500">Spawns multiple Sonnet subagents to analyze large codebases in parallel</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiLayers className="text-xl text-zinc-500 mt-1" />
                  <div>
                    <h3 className="font-bold">Architecture Diagrams</h3>
                    <p className="text-sm text-zinc-500">Generates Mermaid diagrams showing system architecture and data flows</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiMap className="text-xl text-zinc-500 mt-1" />
                  <div>
                    <h3 className="font-bold">Module Documentation</h3>
                    <p className="text-sm text-zinc-500">Documents each module with purpose, exports, dependencies, and gotchas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiExternalLink className="text-xl text-zinc-500 mt-1" />
                  <div>
                    <h3 className="font-bold">Incremental Updates</h3>
                    <p className="text-sm text-zinc-500">Detects changes since last map and only updates affected sections</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-zinc-800 p-6 bg-zinc-950 rounded-pillar">
              <h2 className="text-2xl font-bold mb-4">Output</h2>
              <p className="text-zinc-400 mb-4">
                Cartographer generates a comprehensive <code className="bg-zinc-800 px-2 py-1 rounded-pillar">docs/CODEBASE_MAP.md</code> file containing:
              </p>
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                <li>System overview with architecture diagrams</li>
                <li>Directory structure with purpose annotations</li>
                <li>Module-by-module documentation</li>
                <li>Data flow diagrams for key processes</li>
                <li>Coding conventions and patterns</li>
                <li>Common gotchas and warnings</li>
                <li>Navigation guide for common tasks</li>
              </ul>
            </div>

            <div className="border border-zinc-800 p-6 bg-zinc-950 rounded-pillar">
              <h2 className="text-2xl font-bold mb-4">Our Codebase Map</h2>
              <p className="text-zinc-400 mb-4">
                View the b0ase.com codebase documentation generated by Cartographer:
              </p>
              <div className="flex gap-4">
                <Link
                  href="https://github.com/b0ase/b0ase.com/blob/main/docs/CODEBASE_MAP.md"
                  target="_blank"
                  className="bg-white text-black px-4 py-2 font-bold uppercase hover:bg-zinc-200 transition-colors inline-flex items-center gap-2 rounded-pillar"
                >
                  <FiExternalLink /> View on GitHub
                </Link>
                <Link
                  href="/docs"
                  className="border border-zinc-700 text-white px-4 py-2 font-bold uppercase hover:border-white transition-colors rounded-pillar"
                >
                  Browse All Docs
                </Link>
              </div>
            </div>

            <div className="border border-yellow-900/50 bg-yellow-950/20 p-6 rounded-pillar">
              <h2 className="text-lg font-bold text-yellow-500 mb-2">Attribution</h2>
              <p className="text-zinc-400 text-sm">
                Cartographer is a third-party tool from the Claude Code plugin marketplace.
                It is not developed or maintained by b0ase.com. We use it as part of our
                development workflow and recommend it for teams managing large codebases.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
