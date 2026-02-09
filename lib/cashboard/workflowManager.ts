/**
 * Workflow Manager - Handles loading, validation, and organization of workflow JSON files
 */

export interface WorkflowMetadata {
  id: string
  name: string
  version: string
  metadata: {
    company: {
      name: string
      ticker: string
      jurisdiction: string
      website?: string
      description?: string
    }
    industry: string
    type: string
    created: string
    updated: string
    author?: string
    tags?: string[]
    folder: string
  }
  nodes: any[]
  connections: any[]
  layout?: any
  validation?: any
}

export interface WorkflowFolder {
  name: string
  path: string
  workflows: WorkflowMetadata[]
  subfolders: WorkflowFolder[]
  count: number
}

// Industry-based folder structure
export const WORKFLOW_FOLDERS: Record<string, string[]> = {
  "technology": [
    "saas-platforms",
    "fintech",
    "ai-ml",
    "blockchain",
    "cybersecurity",
    "cloud-infrastructure"
  ],
  "media-entertainment": [
    "music-platforms",
    "streaming-services",
    "gaming",
    "content-creation",
    "social-media",
    "publishing"
  ],
  "financial-services": [
    "banking",
    "insurance",
    "investment-management",
    "payment-processing",
    "cryptocurrency",
    "real-estate-finance"
  ],
  "healthcare": [
    "pharmaceuticals",
    "medical-devices",
    "telehealth",
    "biotech",
    "health-insurance",
    "clinical-research"
  ],
  "manufacturing": [
    "automotive",
    "aerospace",
    "electronics",
    "consumer-goods",
    "industrial-equipment",
    "textiles"
  ],
  "retail": [
    "e-commerce",
    "fashion",
    "grocery",
    "luxury-goods",
    "marketplace",
    "supply-chain"
  ],
  "energy": [
    "renewable-energy",
    "oil-gas",
    "utilities",
    "energy-storage",
    "smart-grid",
    "carbon-markets"
  ],
  "real-estate": [
    "commercial",
    "residential",
    "reit",
    "property-management",
    "construction",
    "real-estate-tech"
  ],
  "agriculture": [
    "farming",
    "food-processing",
    "agtech",
    "livestock",
    "aquaculture",
    "vertical-farming"
  ],
  "transportation": [
    "logistics",
    "airlines",
    "shipping",
    "ride-sharing",
    "autonomous-vehicles",
    "public-transport"
  ]
}

// Predefined workflow templates for different company types
export const WORKFLOW_TEMPLATES = {
  "asset_monetary_flow": {
    name: "Asset & Monetary Flow",
    description: "Maps revenue sources, distribution mechanisms, and shareholder allocations",
    requiredNodes: ["revenue_source", "aggregation", "distribution", "shareholders"],
    defaultLayout: "pyramid"
  },
  "organizational_structure": {
    name: "Organizational Structure", 
    description: "Company hierarchy, roles, and reporting relationships",
    requiredNodes: ["leadership", "departments", "roles", "governance"],
    defaultLayout: "hierarchy"
  },
  "revenue_model": {
    name: "Revenue Model",
    description: "How the company generates and processes revenue",
    requiredNodes: ["revenue_streams", "pricing", "customers", "channels"],
    defaultLayout: "process"
  },
  "supply_chain": {
    name: "Supply Chain",
    description: "End-to-end supply chain and logistics mapping",
    requiredNodes: ["suppliers", "manufacturing", "distribution", "customers"],
    defaultLayout: "process"
  },
  "governance": {
    name: "Governance Structure",
    description: "Corporate governance, compliance, and decision-making processes",
    requiredNodes: ["board", "committees", "policies", "compliance"],
    defaultLayout: "hierarchy"
  },
  "compliance": {
    name: "Compliance Framework",
    description: "Regulatory compliance and risk management processes",
    requiredNodes: ["regulations", "controls", "monitoring", "reporting"],
    defaultLayout: "network"
  },
  "operational_process": {
    name: "Operational Process",
    description: "Core business processes and operational workflows",
    requiredNodes: ["inputs", "processes", "outputs", "feedback"],
    defaultLayout: "process"
  }
}

/**
 * Load workflow from JSON file
 */
export async function loadWorkflow(filePath: string): Promise<WorkflowMetadata | null> {
  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      console.error(`Failed to load workflow: ${filePath}`)
      return null
    }
    const workflow = await response.json()
    return validateWorkflow(workflow) ? workflow : null
  } catch (error) {
    console.error(`Error loading workflow ${filePath}:`, error)
    return null
  }
}

/**
 * Validate workflow against schema
 */
export function validateWorkflow(workflow: any): boolean {
  const required = ['id', 'name', 'version', 'metadata', 'nodes', 'connections']
  
  for (const field of required) {
    if (!workflow[field]) {
      console.error(`Missing required field: ${field}`)
      return false
    }
  }

  // Validate metadata structure
  const metadata = workflow.metadata
  if (!metadata.company || !metadata.industry || !metadata.type) {
    console.error('Invalid metadata structure')
    return false
  }

  // Validate nodes
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    console.error('Workflow must have at least one node')
    return false
  }

  // Validate connections
  if (!Array.isArray(workflow.connections)) {
    console.error('Connections must be an array')
    return false
  }

  // Validate node references in connections
  const nodeIds = new Set(workflow.nodes.map((n: any) => n.id))
  for (const conn of workflow.connections) {
    if (!nodeIds.has(conn.from) || !nodeIds.has(conn.to)) {
      console.error(`Invalid connection: ${conn.from} -> ${conn.to}`)
      return false
    }
  }

  return true
}

/**
 * Get workflows organized by folder structure
 */
export function organizeWorkflowsByFolder(workflows: WorkflowMetadata[]): WorkflowFolder[] {
  const folderMap = new Map<string, WorkflowFolder>()
  
  // Initialize folder structure
  Object.entries(WORKFLOW_FOLDERS).forEach(([industry, subfolders]) => {
    const industryFolder: WorkflowFolder = {
      name: industry.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      path: industry,
      workflows: [],
      subfolders: [],
      count: 0
    }
    
    subfolders.forEach(subfolder => {
      industryFolder.subfolders.push({
        name: subfolder.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        path: `${industry}/${subfolder}`,
        workflows: [],
        subfolders: [],
        count: 0
      })
    })
    
    folderMap.set(industry, industryFolder)
  })

  // Organize workflows into folders
  workflows.forEach(workflow => {
    const folderPath = workflow.metadata.folder
    const [industry, subfolder] = folderPath.split('/')
    
    const industryFolder = folderMap.get(industry)
    if (industryFolder) {
      if (subfolder) {
        const subfolderObj = industryFolder.subfolders.find(sf => sf.path === folderPath)
        if (subfolderObj) {
          subfolderObj.workflows.push(workflow)
          subfolderObj.count++
        }
      } else {
        industryFolder.workflows.push(workflow)
      }
      industryFolder.count++
    }
  })

  return Array.from(folderMap.values())
}

/**
 * Search workflows by name, company, or tags
 */
export function searchWorkflows(workflows: WorkflowMetadata[], query: string): WorkflowMetadata[] {
  const searchTerm = query.toLowerCase()
  
  return workflows.filter(workflow => 
    workflow.name.toLowerCase().includes(searchTerm) ||
    workflow.metadata.company.name.toLowerCase().includes(searchTerm) ||
    workflow.metadata.company.ticker.toLowerCase().includes(searchTerm) ||
    workflow.metadata.industry.toLowerCase().includes(searchTerm) ||
    workflow.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    false
  )
}

/**
 * Get workflow statistics
 */
export function getWorkflowStats(workflows: WorkflowMetadata[]) {
  const stats = {
    total: workflows.length,
    byIndustry: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byJurisdiction: {} as Record<string, number>,
    averageNodes: 0,
    averageConnections: 0
  }

  let totalNodes = 0
  let totalConnections = 0

  workflows.forEach(workflow => {
    // By industry
    const industry = workflow.metadata.industry
    stats.byIndustry[industry] = (stats.byIndustry[industry] || 0) + 1

    // By type
    const type = workflow.metadata.type
    stats.byType[type] = (stats.byType[type] || 0) + 1

    // By jurisdiction
    const jurisdiction = workflow.metadata.company.jurisdiction
    stats.byJurisdiction[jurisdiction] = (stats.byJurisdiction[jurisdiction] || 0) + 1

    // Node and connection counts
    totalNodes += workflow.nodes.length
    totalConnections += workflow.connections.length
  })

  stats.averageNodes = workflows.length > 0 ? Math.round(totalNodes / workflows.length) : 0
  stats.averageConnections = workflows.length > 0 ? Math.round(totalConnections / workflows.length) : 0

  return stats
}

/**
 * Export workflow to different formats
 */
export function exportWorkflow(workflow: WorkflowMetadata, format: 'json' | 'yaml' | 'csv') {
  switch (format) {
    case 'json':
      return JSON.stringify(workflow, null, 2)
    
    case 'yaml':
      // Simple YAML conversion (would need yaml library for full implementation)
      return `# ${workflow.name}\nid: ${workflow.id}\nname: "${workflow.name}"\nversion: ${workflow.version}\n# ... (full YAML implementation needed)`
    
    case 'csv':
      // Export nodes as CSV
      const headers = ['ID', 'Name', 'Type', 'X', 'Y', 'HandCash Handle', 'Token Address']
      const rows = workflow.nodes.map(node => [
        node.id,
        node.name,
        node.type,
        node.position.x,
        node.position.y,
        node.handcashHandle || '',
        node.tokenAddress || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    
    default:
      return JSON.stringify(workflow, null, 2)
  }
}

/**
 * Create new workflow from template
 */
export function createWorkflowFromTemplate(
  templateType: keyof typeof WORKFLOW_TEMPLATES,
  companyInfo: {
    name: string
    ticker: string
    industry: string
    jurisdiction: string
    description?: string
  }
): Partial<WorkflowMetadata> {
  const template = WORKFLOW_TEMPLATES[templateType]
  const timestamp = new Date().toISOString()
  
  return {
    id: `${companyInfo.ticker.toLowerCase()}_${templateType}`,
    name: `${companyInfo.name} - ${template.name}`,
    version: "1.0.0",
    metadata: {
      company: companyInfo,
      industry: companyInfo.industry,
      type: templateType,
      created: timestamp,
      updated: timestamp,
      author: "Cashboard System",
      tags: [],
      folder: `${companyInfo.industry.toLowerCase().replace(' ', '-')}/general`
    },
    nodes: [],
    connections: [],
    layout: {
      style: template.defaultLayout,
      direction: "top-down",
      spacing: { horizontal: 200, vertical: 150 }
    },
    validation: {
      requiredNodes: template.requiredNodes,
      constraints: []
    }
  }
}
