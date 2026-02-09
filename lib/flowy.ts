import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

// Types
export interface FlowyNode {
  id: string
  type: FlowyNodeType
  label: string
  position: [number, number]
  data?: Record<string, any>
}

export interface FlowyEdge {
  id?: string
  from: string
  to: string
  type: FlowyEdgeType
  label?: string
  animated?: boolean
}

export interface FlowyDocument {
  name: string
  description?: string
  type: 'business' | 'software' | 'hybrid'
  version?: number
  updated?: string
  nodes: FlowyNode[]
  edges: FlowyEdge[]
}

export type FlowyNodeType =
  // Business
  | 'revenue'
  | 'wallet'
  | 'splitter'
  | 'shareholder'
  | 'social'
  | 'product'
  | 'subscription'
  // Software
  | 'api'
  | 'database'
  | 'service'
  | 'frontend'
  | 'webhook'
  | 'queue'
  | 'cache'
  // Shared
  | 'trigger'
  | 'decision'
  | 'action'
  | 'note'

export type FlowyEdgeType =
  | 'payment'
  | 'data'
  | 'auth'
  | 'event'
  | 'dependency'
  | 'reference'

// Directory where .flowy files are stored
const FLOWS_DIR = path.join(process.cwd(), 'content', 'flows')

/**
 * Parse a .flowy YAML string into a FlowyDocument
 */
export function parseFlowy(content: string): FlowyDocument {
  const doc = yaml.load(content) as FlowyDocument

  // Validate required fields
  if (!doc.name) throw new Error('Flowy document missing required field: name')
  if (!doc.nodes || !Array.isArray(doc.nodes)) throw new Error('Flowy document missing required field: nodes')
  if (!doc.edges) doc.edges = []
  if (!doc.type) doc.type = 'hybrid'

  // Generate edge IDs if missing
  doc.edges = doc.edges.map((edge, i) => ({
    ...edge,
    id: edge.id || `edge-${edge.from}-${edge.to}-${i}`
  }))

  // Default animated for payment edges
  doc.edges = doc.edges.map(edge => ({
    ...edge,
    animated: edge.animated ?? edge.type === 'payment'
  }))

  return doc
}

/**
 * Load a .flowy file by slug
 */
export async function loadFlowy(slug: string): Promise<FlowyDocument | null> {
  const filePath = path.join(FLOWS_DIR, `${slug}.flowy`)

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return parseFlowy(content)
  } catch (error) {
    console.error(`Failed to load flowy file: ${slug}`, error)
    return null
  }
}

/**
 * List all available .flowy files
 */
export function listFlowyFiles(): string[] {
  try {
    const files = fs.readdirSync(FLOWS_DIR)
    return files
      .filter(f => f.endsWith('.flowy'))
      .map(f => f.replace('.flowy', ''))
  } catch (error) {
    console.error('Failed to list flowy files', error)
    return []
  }
}

/**
 * Convert FlowyDocument to ReactFlow format for Cashboard
 */
export function flowyToReactFlow(doc: FlowyDocument) {
  const nodes = doc.nodes.map(node => ({
    id: node.id,
    type: mapNodeTypeToReactFlow(node.type),
    position: { x: node.position[0], y: node.position[1] },
    data: {
      label: node.label,
      flowyType: node.type,
      ...node.data
    }
  }))

  const edges = doc.edges.map(edge => ({
    id: edge.id!,
    source: edge.from,
    target: edge.to,
    type: 'default',
    animated: edge.animated,
    label: edge.label,
    data: {
      flowyType: edge.type
    },
    style: {
      strokeDasharray: '5 5'
    }
  }))

  return { nodes, edges }
}

/**
 * Convert ReactFlow format back to FlowyDocument
 */
export function reactFlowToFlowy(
  name: string,
  description: string,
  type: 'business' | 'software' | 'hybrid',
  rfNodes: any[],
  rfEdges: any[]
): FlowyDocument {
  const nodes: FlowyNode[] = rfNodes.map(node => ({
    id: node.id,
    type: node.data?.flowyType || 'action',
    label: node.data?.label || node.id,
    position: [Math.round(node.position.x), Math.round(node.position.y)],
    data: Object.fromEntries(
      Object.entries(node.data || {}).filter(([k]) => !['label', 'flowyType'].includes(k))
    )
  }))

  const edges: FlowyEdge[] = rfEdges.map(edge => ({
    from: edge.source,
    to: edge.target,
    type: edge.data?.flowyType || 'data',
    label: edge.label,
    animated: edge.animated
  }))

  return {
    name,
    description,
    type,
    version: 1,
    updated: new Date().toISOString().split('T')[0],
    nodes,
    edges
  }
}

/**
 * Serialize FlowyDocument to YAML string
 */
export function serializeFlowy(doc: FlowyDocument): string {
  return yaml.dump(doc, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  })
}

/**
 * Map flowy node types to ReactFlow node types
 */
function mapNodeTypeToReactFlow(flowyType: FlowyNodeType): string {
  // Map to existing Cashboard node types or default
  const mapping: Record<string, string> = {
    revenue: 'payment',
    wallet: 'wallets',
    splitter: 'splitter',
    shareholder: 'member',
    social: 'youtube',
    product: 'instrument',
    subscription: 'payment',
    api: 'webhook',
    database: 'workflow',
    service: 'trigger',
    frontend: 'workflow',
    webhook: 'webhook',
    queue: 'trigger',
    cache: 'workflow',
    trigger: 'trigger',
    decision: 'decision',
    action: 'workflow',
    note: 'workflow'
  }
  return mapping[flowyType] || 'workflow'
}

/**
 * Convert FlowyDocument to Mermaid diagram syntax
 */
export function flowyToMermaid(doc: FlowyDocument): string {
  const lines: string[] = ['flowchart TD']

  // Add nodes
  for (const node of doc.nodes) {
    const shape = getMermaidShape(node.type)
    lines.push(`    ${node.id}${shape.open}"${node.label}"${shape.close}`)
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

function getMermaidShape(type: FlowyNodeType): { open: string, close: string } {
  const shapes: Record<string, { open: string, close: string }> = {
    revenue: { open: '([', close: '])' },      // Stadium
    wallet: { open: '[(', close: ')]' },       // Cylinder
    splitter: { open: '{', close: '}' },       // Diamond
    shareholder: { open: '((', close: '))' },  // Circle
    social: { open: '>', close: ']' },         // Flag
    decision: { open: '{', close: '}' },       // Diamond
    database: { open: '[(', close: ')]' },     // Cylinder
    api: { open: '[[', close: ']]' },          // Subroutine
    default: { open: '[', close: ']' }         // Rectangle
  }
  return shapes[type] || shapes.default
}

function getMermaidArrow(type: FlowyEdgeType, animated?: boolean): string {
  if (type === 'payment') return animated ? '==>' : '-->'
  if (type === 'data') return '-->'
  if (type === 'auth') return '-.->'
  if (type === 'dependency') return '-.->|depends|'
  return '-->'
}
