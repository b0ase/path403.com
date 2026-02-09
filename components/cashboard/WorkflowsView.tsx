'use client'

import React, { useState } from 'react'
import { Maximize2, MoreVertical, X, Folder, FolderMinus, Plus, Zap } from 'lucide-react'
import type { WorkflowState } from '@/components/cashboard/dashboard.types'

function WorkflowPreview({ workflow }: { workflow: WorkflowState }) {
  const previewWidth = 200
  const previewHeight = 100

  const getNodeBounds = () => {
    if (workflow.nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 200, maxY: 100 }
    }
    const positions = workflow.nodes.map((n) => ({ x: n.x, y: n.y }))
    const minX = Math.min(...positions.map((p) => p.x))
    const maxX = Math.max(...positions.map((p) => p.x))
    const minY = Math.min(...positions.map((p) => p.y))
    const maxY = Math.max(...positions.map((p) => p.y))
    return { minX, minY, maxX, maxY }
  }

  const bounds = getNodeBounds()
  const boundsWidth = bounds.maxX - bounds.minX || 200
  const boundsHeight = bounds.maxY - bounds.minY || 100
  const scale = Math.min(
    (previewWidth - 40) / boundsWidth,
    (previewHeight - 40) / boundsHeight,
    0.3
  )

  const transformPosition = (x: number, y: number) => {
    return {
      x: (x - bounds.minX) * scale + 20,
      y: (y - bounds.minY) * scale + 20,
    }
  }

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start':
        return '#10b981'
      case 'end':
        return '#ef4444'
      case 'process':
        return '#3b82f6'
      case 'decision':
        return '#f59e0b'
      case 'ai-agent':
        return '#8b5cf6'
      case 'human-task':
        return '#f97316'
      case 'integration':
        return '#06b6d4'
      default:
        return '#6b7280'
    }
  }

  if (workflow.nodes.length === 0) {
    return (
      <div
        className="bg-black/20 border border-white/10 rounded-lg flex items-center justify-center"
        style={{ width: previewWidth, height: previewHeight }}
      >
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center mb-2 mx-auto">
            <Zap className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-xs text-gray-400">Empty Workflow</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-black/20 border border-white/10 rounded-lg relative overflow-hidden"
      style={{ width: previewWidth, height: previewHeight }}
    >
      <svg width={previewWidth} height={previewHeight} className="absolute inset-0">
        {workflow.connections.map((connection, index) => {
          const fromNode = workflow.nodes.find((n) => n.id === connection.from)
          const toNode = workflow.nodes.find((n) => n.id === connection.to)
          if (!fromNode || !toNode) return null
          const fromPos = transformPosition(fromNode.x, fromNode.y)
          const toPos = transformPosition(toNode.x, toNode.y)
          return (
            <line
              key={index}
              x1={fromPos.x + 6}
              y1={fromPos.y + 6}
              x2={toPos.x + 6}
              y2={toPos.y + 6}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )
        })}
        {workflow.nodes.map((node) => {
          const pos = transformPosition(node.x, node.y)
          const nodeColor = getNodeColor(node.type as string)
          return (
            <g key={node.id}>
              <circle cx={pos.x + 6} cy={pos.y + 6} r="6" fill={nodeColor} opacity="0.8" />
              <circle cx={pos.x + 6} cy={pos.y + 6} r="3" fill="rgba(255,255,255,0.8)" />
            </g>
          )
        })}
      </svg>
      <div className="absolute bottom-1 right-1 bg-black/50 rounded px-1 py-0.5">
        <span className="text-xs text-gray-300">{workflow.nodes.length}n • {workflow.connections.length}c</span>
      </div>
    </div>
  )
}

export default function WorkflowsView({
  workflows,
  folders,
  selectedWorkflow,
  onCreateWorkflow,
  onCreateFolder,
  onOpenWorkflow,
  onDeleteWorkflow,
  onUpdateWorkflow,
  isMobile
}: {
  workflows: WorkflowState[]
  folders: string[]
  selectedWorkflow: string | null
  onCreateWorkflow: (name: string, description: string, folder?: string) => void
  onCreateFolder: (folderName: string) => void
  onOpenWorkflow: (workflowId: string) => void
  onDeleteWorkflow: (workflowId: string) => void
  onUpdateWorkflow: (workflowId: string, updates: Partial<WorkflowState>) => void
  isMobile: boolean
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('')
  const [showWorkflowTemplates, setShowWorkflowTemplates] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [newWorkflowFolder, setNewWorkflowFolder] = useState('')
  const [showFolderMenu, setShowFolderMenu] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'examples' | 'organizations' | 'roles' | 'agents' | 'instruments' | 'contracts' | 'user-folders'>('examples')

  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowFolderMenu(null)
    }

    if (showFolderMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showFolderMenu])

  const workflowTemplates = [
    {
      name: 'Marketing Campaign',
      description: 'Automated marketing workflow with social media, email, and analytics',
      category: 'Marketing',
      icon: '📢'
    },
    {
      name: 'Product Development',
      description: 'Development lifecycle from planning to deployment',
      category: 'Development',
      icon: '🚀'
    },
    {
      name: 'Financial Process',
      description: 'Invoice processing, approvals, and payment workflows',
      category: 'Finance',
      icon: '💰'
    },
    {
      name: 'HR Onboarding',
      description: 'Employee onboarding with document collection and training',
      category: 'HR',
      icon: '👥'
    },
    {
      name: 'Customer Support',
      description: 'Ticket routing, escalation, and resolution tracking',
      category: 'Support',
      icon: '🎧'
    },
    {
      name: 'Content Production',
      description: 'Content creation, review, approval, and publishing pipeline',
      category: 'Content',
      icon: '📝'
    }
  ]

  const applyWorkflowTemplate = (template: typeof workflowTemplates[0]) => {
    setNewWorkflowName(template.name)
    setNewWorkflowDescription(template.description)
    setShowWorkflowTemplates(false)
  }

  const getFilteredWorkflows = () => {
    let filtered = workflows

    // Filter by view
    switch (activeView) {
      case 'examples':
        filtered = workflows.filter(w => w.name.includes('Example') || w.name.includes('AUDEX') || w.name.includes('DeFi') || w.name.includes('Supply Chain') || w.name.includes('Bitcoin'))
        break
      case 'organizations':
        filtered = workflows.filter(w => w.name.includes('Organization') || w.name.includes('Corp') || w.name.includes('LLC') || w.name.includes('Ltd') || w.name.includes('Bitcoin'))
        break
      case 'roles':
        filtered = workflows.filter(w => w.name.includes('Role') || w.name.includes('Employee') || w.name.includes('Team') || w.name.includes('Position'))
        break
      case 'agents':
        filtered = workflows.filter(w => w.name.includes('AI') || w.name.includes('Agent') || w.name.includes('Bot') || w.name.includes('Assistant'))
        break
      case 'instruments':
        filtered = workflows.filter(w => w.name.includes('Token') || w.name.includes('Share') || w.name.includes('Bond') || w.name.includes('Instrument') || w.name.includes('Bitcoin'))
        break
      case 'contracts':
        filtered = workflows.filter(w => w.name.includes('Contract') || w.name.includes('Agreement') || w.name.includes('Deal') || w.name.includes('Terms') || w.name.includes('Bitcoin'))
        break
      case 'user-folders':
        // Show all workflows organized by folders
        filtered = workflows
        break
    }

    // Filter by folder if selected (only for user-folders view)
    if (selectedFolder && activeView === 'user-folders') {
      filtered = filtered.filter(w => w.folder === selectedFolder)
    }

    return filtered
  }

  const filteredWorkflows = getFilteredWorkflows()

  // Debug logging
  console.log('WorkflowsView render:', { activeView, workflowsCount: workflows.length, filteredCount: filteredWorkflows.length })

  const handleCreate = () => {
    if (newWorkflowName.trim()) {
      onCreateWorkflow(
        newWorkflowName.trim(),
        newWorkflowDescription.trim(),
        newWorkflowFolder.trim() || undefined
      )
      setNewWorkflowName('')
      setNewWorkflowDescription('')
      setNewWorkflowFolder('')
      setShowCreateModal(false)
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setShowCreateFolderModal(false)
    }
  }

  const moveWorkflowToFolder = (workflowId: string, folderName: string | null) => {
    onUpdateWorkflow(workflowId, { folder: folderName || undefined })
    setShowFolderMenu(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'stopped': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running'
      case 'paused': return 'Paused'
      case 'stopped': return 'Stopped'
      default: return 'Unknown'
    }
  }

  return (
    <div className="absolute inset-0 top-20 overflow-y-auto px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`font-bold text-white ${isMobile ? 'text-2xl' : 'text-3xl'} mb-2`}>
            Workflow Browser
          </h1>
          <p className="text-gray-400">
            {activeView === 'examples' && 'Ready-to-use workflow examples and templates • '}
            {activeView === 'organizations' && 'Organization and corporate structure workflows • '}
            {activeView === 'roles' && 'Role and team management workflows • '}
            {activeView === 'agents' && 'AI agent and automation workflows • '}
            {activeView === 'instruments' && 'Financial instrument and token workflows • '}
            {activeView === 'contracts' && 'Contract and agreement workflows • '}
            {activeView === 'user-folders' && 'Your custom workflows organized by folders • '}
            {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} {selectedFolder && activeView === 'user-folders' ? `in "${selectedFolder}"` : ''}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className={`bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 ${isMobile ? 'px-3 py-2 text-sm' : 'px-3 py-2'
              }`}
          >
            <Folder className={isMobile ? "w-4 h-4" : "w-4 h-4"} />
            {!isMobile && <span>New Folder</span>}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
              }`}
          >
            <Plus className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            <span className={isMobile ? 'hidden' : ''}>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* Simple Category Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-red-500/20 border border-red-500/50">
        <div className="w-full text-red-400 text-sm mb-2">DEBUG: Category buttons should be below</div>
        <div className="w-full text-red-400 text-sm mb-2">Active View: {activeView}</div>
        <div className="w-full text-red-400 text-sm mb-2">Total Workflows: {workflows.length}</div>
        <button
          onClick={() => setActiveView('examples')}
          className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${activeView === 'examples'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
        >
          🎯 EXAMPLES
        </button>
        <button
          onClick={() => setActiveView('organizations')}
          className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${activeView === 'organizations'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
        >
          🏢 ORGANIZATIONS
        </button>
        <button
          onClick={() => setActiveView('roles')}
          className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${activeView === 'roles'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
        >
          👥 ROLES
        </button>
        <button
          onClick={() => setActiveView('agents')}
          className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${activeView === 'agents'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
        >
          🤖 AGENTS
        </button>
        <button
          onClick={() => setActiveView('instruments')}
          className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${activeView === 'instruments'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
        >
          💰 INSTRUMENTS
        </button>
        <button
          onClick={() => setActiveView('contracts')}
          className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${activeView === 'contracts'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
        >
          📋 CONTRACTS
        </button>
        <button
          onClick={() => setActiveView('user-folders')}
          className={`px-6 py-3 rounded-lg text-lg font-bold transition-all duration-200 ${activeView === 'user-folders'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
            }`}
        >
          📁 USER FOLDERS
        </button>
      </div>

      {/* Folder Navigation - Only show in user-folders view */}
      {activeView === 'user-folders' && folders.length > 0 && (
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedFolder === null
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
          >
            All Workflows
          </button>
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors flex items-center space-x-1 ${selectedFolder === folder
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              <Folder className="w-3 h-3" />
              <span>{folder}</span>
              <span className="text-xs opacity-75">
                ({workflows.filter(w => w.folder === folder).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {activeView === 'examples' && 'No Examples Available'}
              {activeView === 'organizations' && 'No Organization Workflows'}
              {activeView === 'roles' && 'No Role Workflows'}
              {activeView === 'agents' && 'No Agent Workflows'}
              {activeView === 'instruments' && 'No Instrument Workflows'}
              {activeView === 'contracts' && 'No Contract Workflows'}
              {activeView === 'user-folders' && 'No User Workflows Yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {activeView === 'examples' && 'Ready-to-use workflow examples will appear here for you to explore and customize.'}
              {activeView === 'user' && 'Create your first workflow to automate business processes and manage team coordination.'}
              {activeView === 'library' && 'Community templates and workflow libraries will be available here.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Workflow</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          <div
            onClick={() => setShowCreateModal(true)}
            className={`${isMobile
              ? 'bg-black/20 backdrop-blur-xl border-2 border-dashed border-white/20 rounded-lg p-3 hover:bg-black/30 hover:border-white/30 transition-all duration-200 cursor-pointer group flex items-center justify-center min-h-[60px]'
              : 'bg-black/20 backdrop-blur-xl border-2 border-dashed border-white/20 rounded-xl p-6 hover:bg-black/30 hover:border-white/30 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center min-h-[280px]'
              }`}
          >
            {isMobile ? (
              // Mobile: Compact button layout
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <Plus className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold text-white">Create New Workflow</h3>
                </div>
              </div>
            ) : (
              // Desktop: Full card layout
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                  <Plus className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Create New Workflow</h3>
                <p className="text-gray-400 text-sm">
                  Build automated business processes and team coordination workflows
                </p>
              </div>
            )}
          </div>

          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`${isMobile
                ? 'bg-black/40 backdrop-blur-xl border rounded-lg p-3 hover:bg-black/60 transition-all duration-200 cursor-pointer group'
                : 'bg-black/40 backdrop-blur-xl border rounded-xl p-6 hover:bg-black/60 transition-all duration-200 cursor-pointer group overflow-hidden'
                } ${workflow.name === 'Example Organisation Workflow: AUDEX'
                  ? 'border-gradient-demo animate-pulse-glow shadow-2xl shadow-blue-500/20'
                  : 'border-white/20'
                } ${selectedWorkflow === workflow.id ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''
                }`}
              onClick={() => onOpenWorkflow(workflow.id)}
            >
              {isMobile ? (
                // Mobile: Compact button-like layout
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1 truncate">
                      {workflow.name}
                    </h3>
                    {workflow.folder && (
                      <div className="flex items-center gap-1">
                        <Folder className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400 truncate">{workflow.folder}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.workflowStatus)}`}></div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {getStatusText(workflow.workflowStatus)}
                    </span>
                  </div>
                </div>
              ) : (
                // Desktop: Full card layout
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">
                        {workflow.name}
                      </h3>
                      {workflow.folder && (
                        <div className="flex items-center gap-1 mb-2">
                          <Folder className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-blue-400 truncate">{workflow.folder}</span>
                        </div>
                      )}
                      <p className="text-gray-400 text-sm line-clamp-2 break-words overflow-hidden">
                        {workflow.description}
                      </p>
                    </div>

                    <div className={`flex items-center space-x-2 ml-4 flex-shrink-0`}>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.workflowStatus)}`}></div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {getStatusText(workflow.workflowStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {workflow.nodes.length}
                      </div>
                      <div className="text-xs text-gray-400">Nodes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {workflow.connections.length}
                      </div>
                      <div className="text-xs text-gray-400">Connections</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <WorkflowPreview workflow={workflow} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenWorkflow(workflow.id)
                        }}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                        title="Open Workflow"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons - show on both mobile and desktop */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpenWorkflow(workflow.id)
                  }}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Open Workflow"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowFolderMenu(showFolderMenu === workflow.id ? null : workflow.id)
                    }}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                    title="Move to Folder"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showFolderMenu === workflow.id && (
                    <div className="absolute right-0 top-8 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg py-2 min-w-[160px] z-50">
                      <div className="px-3 py-1 text-xs text-gray-400 border-b border-white/10">Move to folder</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveWorkflowToFolder(workflow.id, null)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <FolderMinus className="w-3 h-3" />
                        No Folder
                      </button>
                      {folders.map(folder => (
                        <button
                          key={folder}
                          onClick={(e) => {
                            e.stopPropagation()
                            moveWorkflowToFolder(workflow.id, folder)
                          }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${workflow.folder === folder
                            ? 'text-blue-400 bg-blue-500/20'
                            : 'text-gray-300 hover:bg-white/10'
                            }`}
                        >
                          <Folder className="w-3 h-3" />
                          {folder}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Are you sure you want to delete this workflow?')) {
                      onDeleteWorkflow(workflow.id)
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete Workflow"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Workflow</h3>
              <button
                onClick={() => setShowWorkflowTemplates(!showWorkflowTemplates)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {showWorkflowTemplates ? 'Hide Templates' : 'Use Template'}
              </button>
            </div>

            {showWorkflowTemplates && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-4">Choose a Template</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workflowTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => applyWorkflowTemplate(template)}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-left transition-all"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{template.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-white font-medium text-sm truncate">{template.name}</h5>
                          <span className="text-xs text-gray-400">{template.category}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Enter workflow name..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate()
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="Describe your workflow..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Folder (optional)
                </label>
                <input
                  type="text"
                  value={newWorkflowFolder}
                  onChange={(e) => setNewWorkflowFolder(e.target.value)}
                  placeholder="Enter folder name or leave empty..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {folders.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Existing folders:</p>
                    <div className="flex flex-wrap gap-1">
                      {folders.map(folder => (
                        <button
                          key={folder}
                          onClick={() => setNewWorkflowFolder(folder)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-xs text-gray-300 rounded transition-colors"
                        >
                          {folder}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-4 border-t border-white/20">
              <button
                onClick={handleCreate}
                disabled={!newWorkflowName.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewWorkflowName('')
                  setNewWorkflowDescription('')
                  setNewWorkflowFolder('')
                  setShowWorkflowTemplates(false)
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Folder</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder()
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-4 border-t border-white/20">
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Folder className="w-4 h-4" />
                <span>Create Folder</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false)
                  setNewFolderName('')
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
