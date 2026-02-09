'use client'

import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import type { FlowyDocument } from '@/lib/flowy'

interface FlowyRendererProps {
  document: FlowyDocument
  className?: string
  theme?: 'dark' | 'light'
}

// Convert FlowyDocument to Mermaid syntax (client-side version)
function flowyToMermaidClient(doc: FlowyDocument): string {
  const lines: string[] = ['flowchart TD']

  // Add nodes
  for (const node of doc.nodes) {
    const shape = getMermaidShape(node.type)
    const label = node.label.replace(/"/g, "'")
    lines.push(`    ${node.id}${shape.open}"${label}"${shape.close}`)
  }

  lines.push('')

  // Add edges
  for (const edge of doc.edges) {
    const arrow = getMermaidArrow(edge.type, edge.animated)
    const label = edge.label ? `|${edge.label}|` : ''
    lines.push(`    ${edge.from} ${arrow}${label} ${edge.to}`)
  }

  return lines.join('\n')
}

function getMermaidShape(type: string): { open: string, close: string } {
  const shapes: Record<string, { open: string, close: string }> = {
    revenue: { open: '([', close: '])' },
    wallet: { open: '[(', close: ')]' },
    splitter: { open: '{', close: '}' },
    shareholder: { open: '((', close: '))' },
    social: { open: '>', close: ']' },
    subscription: { open: '([', close: '])' },
    decision: { open: '{', close: '}' },
    database: { open: '[(', close: ')]' },
    api: { open: '[[', close: ']]' },
    service: { open: '[/', close: '/]' },
    frontend: { open: '[', close: ']' },
    product: { open: '{{', close: '}}' },
    trigger: { open: '>', close: ']' },
    action: { open: '[', close: ']' },
    note: { open: '(', close: ')' },
  }
  return shapes[type] || { open: '[', close: ']' }
}

function getMermaidArrow(type: string, animated?: boolean): string {
  if (type === 'payment') return animated !== false ? '==>' : '-->'
  if (type === 'data') return '-->'
  if (type === 'auth') return '-.->'
  if (type === 'dependency') return '-.->'
  if (type === 'reference') return '-.->'
  if (type === 'event') return '-->'
  return '-->'
}

export function FlowyRenderer({ document, className = '', theme = 'dark' }: FlowyRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'dark' ? 'dark' : 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      securityLevel: 'loose'
    })
  }, [theme])

  useEffect(() => {
    let cancelled = false

    const renderDiagram = async () => {
      if (!containerRef.current) return

      try {
        const mermaidSyntax = flowyToMermaidClient(document)
        const id = `flowy-${document.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`

        const { svg } = await mermaid.render(id, mermaidSyntax)

        // Check ref and cancelled state after async operation
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          setRendered(true)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Mermaid render error:', err)
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
        }
      }
    }

    renderDiagram()

    return () => {
      cancelled = true
    }
  }, [document])

  return (
    <div className={`flowy-renderer ${className}`}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-white/10">
        <h3 className="text-2xl font-bold text-white">{document.name}</h3>
        {document.description && (
          <p className="text-gray-400 mt-1">{document.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="px-2 py-0.5 bg-white/10 rounded">{document.type}</span>
          {document.updated && <span>Updated: {String(document.updated)}</span>}
          <span>{document.nodes.length} nodes</span>
          <span>{document.edges.length} connections</span>
        </div>
      </div>

      {/* Diagram - full width */}
      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <p className="font-semibold">Failed to render diagram</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flowy-diagram w-full overflow-x-auto [&_svg]:w-full [&_svg]:h-auto [&_svg]:min-h-[500px]"
        />
      )}

      {/* Legend - Dynamic based on document type */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500 mb-2">Legend:</p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {document.type === 'software' ? (
            <>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500/50"></span>
                Frontend
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded border-2 border-cyan-500/50"></span>
                API
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-purple-500/50"></span>
                Database
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 skew-x-12 bg-orange-500/50"></span>
                Service
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1">
                <span className="w-4 border-t-2 border-white/50"></span>
                Data flow
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 border-t-2 border-dashed border-cyan-500/50"></span>
                Auth
              </span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
                Revenue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500/50"></span>
                Wallet
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rotate-45 bg-yellow-500/50"></span>
                Splitter
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border-2 border-purple-500/50"></span>
                Shareholder
              </span>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1">
                <span className="w-4 border-t-2 border-white/50"></span>
                Data
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 border-t-2 border-green-500"></span>
                Payment
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FlowyRenderer
