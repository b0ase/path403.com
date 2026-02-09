"use client"

import React, { useState, useEffect } from 'react'
import { 
  Folder, FolderOpen, FileText, Search, Plus, Filter, Grid, List, 
  Building, Calendar, Tag, Globe, TrendingUp, Users, Zap, Eye, Download
} from 'lucide-react'
import { WorkflowMetadata, WorkflowFolder, organizeWorkflowsByFolder, searchWorkflows, getWorkflowStats, WORKFLOW_TEMPLATES } from '@/lib/cashboard/workflowManager'

interface WorkflowDashboardProps {
  onSelectWorkflow: (workflow: WorkflowMetadata) => void
  onCreateWorkflow: () => void
}

export default function WorkflowDashboard({ onSelectWorkflow, onCreateWorkflow }: WorkflowDashboardProps) {
  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([])
  const [folders, setFolders] = useState<WorkflowFolder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterIndustry, setFilterIndustry] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Mock data - in real app, this would load from your workflows directory
  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true)
      
      // Mock workflow data - replace with actual file loading
      const mockWorkflows: WorkflowMetadata[] = [
        // AUDEX workflow (from our JSON file)
        {
          id: "audex_asset_monetary_flow",
          name: "AUDEX Corporation - Asset & Monetary Flows",
          version: "1.0.0",
          metadata: {
            company: {
              name: "AUDEX Corporation",
              ticker: "AUDEX",
              jurisdiction: "US",
              website: "https://audex.com",
              description: "Digital music platform with NFT integration"
            },
            industry: "Media & Entertainment",
            type: "asset_monetary_flow",
            created: "2024-01-20T00:00:00Z",
            updated: "2024-01-20T00:00:00Z",
            author: "Cashboard System",
            tags: ["music", "nft", "tokenization"],
            folder: "media-entertainment/music-platforms"
          },
          nodes: Array(20).fill(null).map((_, i) => ({ id: i + 1, name: `Node ${i + 1}`, type: 'payment' })),
          connections: Array(15).fill(null).map((_, i) => ({ id: `conn${i}`, from: i + 1, to: i + 2 }))
        },
        // Stripe workflow
        {
          id: "stripe_payment_processing_flow",
          name: "Stripe Inc. - Payment Processing & Revenue Flow",
          version: "1.0.0",
          metadata: {
            company: {
              name: "Stripe Inc.",
              ticker: "STRIPE",
              jurisdiction: "US",
              website: "https://stripe.com",
              description: "Global payment processing platform"
            },
            industry: "Technology",
            type: "revenue_model",
            created: "2024-01-20T00:00:00Z",
            updated: "2024-01-20T00:00:00Z",
            author: "Cashboard System",
            tags: ["payments", "fintech", "saas"],
            folder: "technology/fintech"
          },
          nodes: Array(9).fill(null).map((_, i) => ({ id: i + 1, name: `Node ${i + 1}`, type: 'payment' })),
          connections: Array(8).fill(null).map((_, i) => ({ id: `conn${i}`, from: i + 1, to: i + 2 }))
        },
        // Pfizer workflow
        {
          id: "pfizer_drug_development_revenue",
          name: "Pfizer Inc. - Drug Development & Revenue Model",
          version: "1.0.0",
          metadata: {
            company: {
              name: "Pfizer Inc.",
              ticker: "PFE",
              jurisdiction: "US",
              website: "https://pfizer.com",
              description: "Global pharmaceutical company"
            },
            industry: "Healthcare",
            type: "revenue_model",
            created: "2024-01-20T00:00:00Z",
            updated: "2024-01-20T00:00:00Z",
            author: "Cashboard System",
            tags: ["pharmaceuticals", "drug-development"],
            folder: "healthcare/pharmaceuticals"
          },
          nodes: Array(12).fill(null).map((_, i) => ({ id: i + 1, name: `Node ${i + 1}`, type: 'payment' })),
          connections: Array(11).fill(null).map((_, i) => ({ id: `conn${i}`, from: i + 1, to: i + 2 }))
        }
      ]

      setWorkflows(mockWorkflows)
      setFolders(organizeWorkflowsByFolder(mockWorkflows))
      setLoading(false)
    }

    loadWorkflows()
  }, [])

  // Filter and search workflows
  const filteredWorkflows = React.useMemo(() => {
    let filtered = workflows

    // Apply search
    if (searchQuery) {
      filtered = searchWorkflows(filtered, searchQuery)
    }

    // Apply industry filter
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(w => w.metadata.industry === filterIndustry)
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(w => w.metadata.type === filterType)
    }

    // Apply folder filter
    if (selectedFolder) {
      filtered = filtered.filter(w => w.metadata.folder.startsWith(selectedFolder))
    }

    return filtered
  }, [workflows, searchQuery, filterIndustry, filterType, selectedFolder])

  const stats = getWorkflowStats(workflows)

  const getIndustryIcon = (industry: string) => {
    switch (industry.toLowerCase()) {
      case 'technology': return <Zap className="w-4 h-4" />
      case 'healthcare': return <Users className="w-4 h-4" />
      case 'media & entertainment': return <TrendingUp className="w-4 h-4" />
      default: return <Building className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset_monetary_flow': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'revenue_model': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'organizational_structure': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'supply_chain': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflow Library</h1>
          <p className="text-gray-400 mt-1">
            {stats.total} workflows across {Object.keys(stats.byIndustry).length} industries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          
          {/* Hidden file input for import */}
          <input
            type="file"
            id="workflow-import"
            accept=".json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const importData = JSON.parse(e.target?.result as string);
                    console.log('📥 Imported workflow data:', importData);
                    
                    // Check if this is a Cashboard workflow export
                    const isCashboardExport = importData.metadata?.type === 'workflow_export';
                    
                    if (isCashboardExport && importData.workflow && importData.workflow.nodes) {
                      // Import Cashboard workflow export
                      console.log('📋 Importing Cashboard workflow export to dashboard');
                      
                      const newWorkflow: WorkflowMetadata = {
                        id: `imported_${Date.now()}`,
                        name: importData.metadata.name || 'Imported Workflow',
                        version: importData.metadata.version || '1.0.0',
                        metadata: {
                          company: {
                            name: importData.metadata.name || 'Imported Company',
                            ticker: 'IMP',
                            jurisdiction: 'US',
                            description: importData.metadata.description || 'Imported workflow from Cashboard'
                          },
                          industry: 'Technology',
                          type: 'workflow_import',
                          created: new Date().toISOString(),
                          updated: new Date().toISOString(),
                          author: importData.metadata.author || 'Cashboard User',
                          tags: ['imported', 'workflow', 'cashboard'],
                          folder: 'imported'
                        },
                        nodes: importData.workflow.nodes || [],
                        connections: importData.workflow.edges || []
                      };
                      
                      // Add to workflows list
                      setWorkflows(prev => [...prev, newWorkflow]);
                      
                      // Show success message with details
                      const nodeCount = importData.workflow.nodes.length;
                      const edgeCount = importData.workflow.edges?.length || 0;
                      alert(`✅ Cashboard workflow imported successfully!\n\n📊 Details:\n• ${nodeCount} nodes\n• ${edgeCount} connections\n• Canvas settings preserved\n\nWorkflow: ${newWorkflow.name}`);
                      
                    } else if (importData.metadata && importData.workflow && importData.workflow.nodes) {
                      // Handle generic workflow format
                      console.log('📋 Importing generic workflow format to dashboard');
                      
                      const newWorkflow: WorkflowMetadata = {
                        id: `imported_${Date.now()}`,
                        name: importData.metadata.name || 'Imported Workflow',
                        version: importData.metadata.version || '1.0.0',
                        metadata: {
                          company: {
                            name: importData.metadata.name || 'Imported Company',
                            ticker: 'IMP',
                            jurisdiction: 'US',
                            description: importData.metadata.description || 'Imported workflow'
                          },
                          industry: 'Technology',
                          type: 'workflow_import',
                          created: new Date().toISOString(),
                          updated: new Date().toISOString(),
                          author: importData.metadata.author || 'Cashboard User',
                          tags: ['imported', 'workflow'],
                          folder: 'imported'
                        },
                        nodes: importData.workflow.nodes || [],
                        connections: importData.workflow.edges || []
                      };
                      
                      // Add to workflows list
                      setWorkflows(prev => [...prev, newWorkflow]);
                      
                      // Show success message
                      alert(`✅ Workflow "${newWorkflow.name}" imported successfully!`);
                    } else {
                      throw new Error('Invalid workflow file format - missing required data structure');
                    }
                  } catch (error) {
                    console.error('❌ Failed to import workflow:', error);
                    alert('❌ Failed to import workflow.\n\nPlease ensure the file is a valid workflow JSON file exported from Cashboard or another compatible workflow tool.');
                  }
                };
                reader.readAsText(file);
              }
              // Reset the input
              event.target.value = '';
            }}
          />
          
          <button
            onClick={() => document.getElementById('workflow-import')?.click()}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            title="Import workflow from JSON file"
          >
            <Download className="w-4 h-4 rotate-180" />
            Import
          </button>
          
          <button
            onClick={onCreateWorkflow}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Workflows</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Building className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Industries</p>
              <p className="text-xl font-bold text-white">{Object.keys(stats.byIndustry).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Nodes</p>
              <p className="text-xl font-bold text-white">{stats.averageNodes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Globe className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Jurisdictions</p>
              <p className="text-xl font-bold text-white">{Object.keys(stats.byJurisdiction).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search workflows, companies, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Industries</option>
          {Object.keys(stats.byIndustry).map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {Object.keys(WORKFLOW_TEMPLATES).map(type => (
            <option key={type} value={type}>{WORKFLOW_TEMPLATES[type as keyof typeof WORKFLOW_TEMPLATES].name}</option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Folders</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === null ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  <span>All Workflows</span>
                  <span className="ml-auto text-xs">({workflows.length})</span>
                </div>
              </button>
              {folders.map(folder => (
                <div key={folder.path}>
                  <button
                    onClick={() => setSelectedFolder(folder.path)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedFolder === folder.path ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {selectedFolder === folder.path ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                      <span>{folder.name}</span>
                      <span className="ml-auto text-xs">({folder.count})</span>
                    </div>
                  </button>
                  {folder.subfolders.length > 0 && (
                    <div className="ml-4 mt-1 space-y-1">
                      {folder.subfolders.map(subfolder => (
                        <button
                          key={subfolder.path}
                          onClick={() => setSelectedFolder(subfolder.path)}
                          className={`w-full text-left px-3 py-1 rounded text-sm transition-colors ${
                            selectedFolder === subfolder.path ? 'bg-blue-500/20 text-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="w-3 h-3" />
                            <span>{subfolder.name}</span>
                            <span className="ml-auto text-xs">({subfolder.count})</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Workflows Grid/List */}
        <div className="lg:col-span-3">
          {filteredWorkflows.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No workflows found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={onCreateWorkflow}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create New Workflow
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {filteredWorkflows.map(workflow => (
                <div
                  key={workflow.id}
                  className={`bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center gap-4' : ''
                  }`}
                  onClick={() => onSelectWorkflow(workflow)}
                >
                  <div className={`flex-1 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-center gap-2 mb-2">
                        {getIndustryIcon(workflow.metadata.industry)}
                        <h3 className="font-semibold text-white text-sm">{workflow.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-400">{workflow.metadata.company.ticker}</span>
                        <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(workflow.metadata.type)}`}>
                          {WORKFLOW_TEMPLATES[workflow.metadata.type as keyof typeof WORKFLOW_TEMPLATES]?.name || workflow.metadata.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {workflow.metadata.company.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>{workflow.nodes.length} nodes</span>
                          <span>{workflow.connections.length} connections</span>
                        </div>
                        <span>{formatDate(workflow.metadata.updated)}</span>
                      </div>
                    </div>
                    {viewMode === 'list' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectWorkflow(workflow)
                          }}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                          title="View Workflow"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle export
                          }}
                          className="p-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded transition-colors"
                          title="Export Workflow"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {viewMode === 'grid' && (
                    <div className="flex items-center gap-1 mt-2">
                      {workflow.metadata.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
