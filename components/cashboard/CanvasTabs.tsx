"use client"

import React, { useState, useCallback, useRef } from 'react'
import { X, Edit2, Check, Plus, Play, Pause, Zap, ZoomOut, ZoomIn, ArrowRight } from 'lucide-react'
import WorkflowReactFlowCanvas from './WorkflowReactFlowCanvas'
import { getOrganizationTemplates, getRoleTemplates, getAgentTemplates, getInstrumentTemplates, getContractTemplates, getIntegrationTemplates, getCryptoTemplates, getWalletTemplates } from '../data/templates'

export interface CanvasTab {
  id: string
  title: string
  workflow: {
    nodes: any[]
    connections: any[]
  }
  templates: any[]
  isTemplate?: boolean
  templateData?: any
  nodeCanvasData?: any
}

interface CanvasTabsProps {
  initialTabs?: CanvasTab[]
}

export default function CanvasTabs({ initialTabs }: CanvasTabsProps) {
  // Get all templates - ensure we have comprehensive template data
  const allTemplates = {
    organizations: getOrganizationTemplates(),
    roles: getRoleTemplates(),
    agents: getAgentTemplates(),
    instruments: getInstrumentTemplates(),
    contracts: getContractTemplates(),
    integrations: getIntegrationTemplates(),
    crypto: getCryptoTemplates(),
    wallets: getWalletTemplates()
  }

  // Initialize with default main tab - AUDEX Comprehensive Asset & Monetary Flow Mapping
  const defaultTabs: CanvasTab[] = initialTabs || [{
    id: 'main',
    title: 'AUDEX Corporation - Asset & Monetary Flows',
    workflow: {
      nodes: [
        // === TOP TIER: REVENUE SOURCES (PYRAMID BASE) ===
        { id: 1, name: 'Music Track Streaming', type: 'youtube', x: 100, y: 100, handcashHandle: 'AUDEX_Streaming' },
        { id: 2, name: 'YouTube Ad Revenue', type: 'youtube', x: 300, y: 100, handcashHandle: 'AUDEX_YouTube' },
        { id: 3, name: 'Spotify Royalties', type: 'payment', x: 500, y: 100, handcashHandle: 'AUDEX_Spotify' },
        { id: 4, name: 'Platform Subscriptions', type: 'payment', x: 700, y: 100, handcashHandle: 'AUDEX_Subs' },
        { id: 5, name: 'NFT Music Sales', type: 'instrument', x: 900, y: 100, handcashHandle: 'AUDEX_NFTs' },
        
        // === SECOND TIER: REVENUE AGGREGATION ===
        { id: 10, name: 'AUDEX Revenue Pool', type: 'splitter', x: 500, y: 250, handcashHandle: 'AUDEX_Revenue' },
        
        // === THIRD TIER: CORPORATE DISTRIBUTION ===
        { id: 15, name: 'AUDEX Treasury (51%)', type: 'organization', x: 300, y: 400, handcashHandle: 'AUDEX_Treasury' },
        { id: 16, name: 'Artist Royalty Pool (35%)', type: 'member', x: 500, y: 400, handcashHandle: 'AUDEX_Artists' },
        { id: 17, name: 'Operations Reserve (10%)', type: 'workflow', x: 700, y: 400, handcashHandle: 'AUDEX_Ops' },
        { id: 18, name: 'Platform Development (4%)', type: 'trigger', x: 900, y: 400, handcashHandle: 'AUDEX_Dev' },
        
        // === FOURTH TIER: TOKEN MANAGEMENT ===
        { id: 20, name: 'AUDEX Token Contract', type: 'contract', x: 500, y: 550, handcashHandle: 'AUDEX_Tokens' },
        
        // === FIFTH TIER: DIVIDEND CALCULATION ===
        { id: 30, name: 'Quarterly Dividend Calculator', type: 'decision', x: 500, y: 700, handcashHandle: 'AUDEX_Dividends' },
        
        // === BOTTOM TIER: SHAREHOLDER DISTRIBUTION (PYRAMID TOP) ===
        { id: 21, name: 'Treasury Tokens (51%)', type: 'wallets', x: 200, y: 850, handcashHandle: 'AUDEX_Treasury_Tokens' },
        { id: 22, name: 'Public Shareholders (35%)', type: 'member', x: 400, y: 850, handcashHandle: 'AUDEX_Public' },
        { id: 23, name: 'Artist Token Holders (10%)', type: 'member', x: 600, y: 850, handcashHandle: 'AUDEX_Artist_Tokens' },
        { id: 24, name: 'Team & Advisors (4%)', type: 'role', x: 800, y: 850, handcashHandle: 'AUDEX_Team' },
        
        // === SIDE BRANCH: INDIVIDUAL TRACK ASSETS ===
        { id: 40, name: 'Track NFT #001', type: 'instrument', x: 1100, y: 250, handcashHandle: 'AUDEX_Track001' },
        { id: 41, name: 'Track Royalty Split', type: 'splitter', x: 1100, y: 400, handcashHandle: 'AUDEX_TrackSplit' },
        { id: 42, name: 'Track Shareholders', type: 'member', x: 1100, y: 550, handcashHandle: 'AUDEX_TrackHolders' },
        
        // === SIDE BRANCH: PLATFORM ASSETS ===
        { id: 50, name: 'AUDEX Platform IP', type: 'contract', x: 100, y: 550, handcashHandle: 'AUDEX_Platform' },
        { id: 51, name: 'User Database', type: 'workflow', x: 100, y: 700, handcashHandle: 'AUDEX_Users' },
        { id: 52, name: 'Music Catalog Rights', type: 'instrument', x: 100, y: 850, handcashHandle: 'AUDEX_Catalog' }
      ],
      connections: [
        // PYRAMID FLOW: Revenue sources to main pool (Tier 1 → Tier 2)
        { from: 1, to: 10, type: 'payment' },
        { from: 2, to: 10, type: 'payment' },
        { from: 3, to: 10, type: 'payment' },
        { from: 4, to: 10, type: 'payment' },
        { from: 5, to: 10, type: 'payment' },
        
        // Main pool to corporate distribution (Tier 2 → Tier 3)
        { from: 10, to: 15, type: 'payment' },
        { from: 10, to: 16, type: 'payment' },
        { from: 10, to: 17, type: 'payment' },
        { from: 10, to: 18, type: 'payment' },
        
        // Corporate distribution to token contract (Tier 3 → Tier 4)
        { from: 15, to: 20, type: 'payment' },
        { from: 16, to: 20, type: 'payment' },
        
        // Token contract to dividend calculator (Tier 4 → Tier 5)
        { from: 20, to: 30, type: 'payment' },
        
        // Dividend calculator to shareholders (Tier 5 → Tier 6)
        { from: 30, to: 21, type: 'payment' },
        { from: 30, to: 22, type: 'payment' },
        { from: 30, to: 23, type: 'payment' },
        { from: 30, to: 24, type: 'payment' },
        
        // SIDE BRANCH: Individual track flows
        { from: 1, to: 40, type: 'payment' },
        { from: 40, to: 41, type: 'payment' },
        { from: 41, to: 42, type: 'payment' },
        
        // SIDE BRANCH: Platform asset connections
        { from: 4, to: 50, type: 'payment' },
        { from: 50, to: 51, type: 'payment' },
        { from: 51, to: 52, type: 'payment' }
      ]
    },
    templates: allTemplates
  }]

  const [tabs, setTabs] = useState<CanvasTab[]>(defaultTabs)
  const [activeTabId, setActiveTabId] = useState<string>('main')
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Canvas controls state
  const [isRunning, setIsRunning] = useState(false)
  const [autoMode, setAutoMode] = useState(false)
  const [canvasScale, setCanvasScale] = useState(35)
  const [connectionStyle, setConnectionStyle] = useState<'bezier' | 'smoothstep' | 'straight'>('bezier')

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId)

  // Tab management functions
  const createNewTab = useCallback((template?: any) => {
    const newTabId = `tab-${Date.now()}`
    const newTab: CanvasTab = {
      id: newTabId,
      title: template ? template.name : 'New Canvas',
      workflow: { nodes: [], connections: [] },
      templates: allTemplates,
      isTemplate: !!template,
      templateData: template
    }

    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTabId)
  }, [])

  const createNodeCanvasTab = useCallback((node: any) => {
    const newTabId = `node-${node.id}-${Date.now()}`
    const newTab: CanvasTab = {
      id: newTabId,
      title: `${node.data.label} Details`,
      workflow: { nodes: [], connections: [] },
      templates: allTemplates,
      isTemplate: false,
      nodeCanvasData: node
    }

    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTabId)
  }, [])

  const closeTab = useCallback((tabId: string) => {
    if (tabId === 'main') return // Don't allow closing main tab

    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId)
      // If we're closing the active tab, switch to main
      if (activeTabId === tabId) {
        setActiveTabId('main')
      }
      return newTabs
    })
  }, [activeTabId])

  // Title editing functions
  const startEditingTitle = useCallback((tabId: string, currentTitle: string) => {
    setEditingTabId(tabId)
    setEditingTitle(currentTitle)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }, [])

  const saveTitle = useCallback(() => {
    if (editingTabId && editingTitle.trim()) {
      setTabs(prev => prev.map(tab => 
        tab.id === editingTabId 
          ? { ...tab, title: editingTitle.trim() }
          : tab
      ))
    }
    setEditingTabId(null)
    setEditingTitle('')
  }, [editingTabId, editingTitle])

  const cancelEdit = useCallback(() => {
    setEditingTabId(null)
    setEditingTitle('')
  }, [])

  // Canvas control handlers
  const toggleWorkflowStatus = () => setIsRunning(!isRunning)
  const toggleAutoMode = () => setAutoMode(!autoMode)
  const zoomOut = () => {
    setCanvasScale(Math.max(10, canvasScale - 10))
    // Trigger zoom out on React Flow instance
    if (window.reactFlowInstance) {
      const currentZoom = window.reactFlowInstance.getZoom()
      window.reactFlowInstance.zoomTo(Math.max(0.1, currentZoom - 0.1))
    }
  }
  const zoomIn = () => {
    setCanvasScale(Math.min(200, canvasScale + 10))
    // Trigger zoom in on React Flow instance
    if (window.reactFlowInstance) {
      const currentZoom = window.reactFlowInstance.getZoom()
      window.reactFlowInstance.zoomTo(Math.min(2, currentZoom + 0.1))
    }
  }
  const resetView = () => {
    setCanvasScale(35)
    // Reset React Flow view
    if (window.reactFlowInstance) {
      window.reactFlowInstance.fitView({ duration: 300 })
    }
  }
  const cycleConnectionStyle = () => {
    setConnectionStyle(prev => {
      switch (prev) {
        case 'bezier': return 'smoothstep'
        case 'smoothstep': return 'straight'
        case 'straight': return 'bezier'
        default: return 'bezier'
      }
    })
  }

  // Handle tab switching
  const handleTabClick = useCallback((tabId: string) => {
    console.log('🔄 Tab clicked:', tabId, 'Current active:', activeTabId)
    setActiveTabId(tabId)
    console.log('🔄 Active tab set to:', tabId)
  }, [activeTabId])

  // Debug logging
  React.useEffect(() => {
    console.log('🔄 Active tab changed to:', activeTabId, activeTab?.title)
  }, [activeTabId, activeTab])

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex items-center bg-black/40 backdrop-blur-sm border-b border-white/10 px-3 py-2 min-h-[52px] overflow-x-auto">
        {/* Tabs */}
        <div className="flex items-center gap-2 flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer group relative ${
                activeTabId === tab.id
                  ? 'bg-white/15 text-white border border-white/30 shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/8 border border-transparent'
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              {/* Tab Title - Editable */}
              {editingTabId === tab.id ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveTitle()
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    onBlur={saveTitle}
                    className="bg-white/20 text-white px-2 py-1 rounded text-sm min-w-[100px] max-w-[200px]"
                  />
                  <button onClick={saveTitle} className="text-green-400 hover:text-green-300">
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span 
                    className="whitespace-nowrap max-w-[140px] truncate font-medium" 
                    title={tab.title}
                  >
                    {tab.title}
                  </span>
                  {activeTabId === tab.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditingTitle(tab.id, tab.title)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Close Button */}
              {tab.id !== 'main' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="w-5 h-5 rounded-full hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all ml-1 flex-shrink-0"
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              )}
              
              {/* Active Tab Indicator */}
              {activeTabId === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full" />
              )}
            </div>
          ))}
          
          {/* Add Tab Button */}
          <button
            onClick={() => createNewTab()}
            className="flex items-center gap-1 px-2 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/8 transition-all text-sm"
            title="Add new canvas tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas Controls */}
        <div className="flex items-center gap-2 ml-4 border-l border-white/20 pl-4">
          <button
            onClick={toggleWorkflowStatus}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
              isRunning 
                ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isRunning ? 'Paused' : 'Running'}
          </button>
          
          <button
            onClick={toggleAutoMode}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
              autoMode 
                ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
            }`}
          >
            <Zap className="w-3 h-3" />
            {autoMode ? 'Auto' : 'Manual'}
          </button>
          
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <button onClick={zoomOut} className="hover:text-white transition-colors" title="Zoom Out">
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="min-w-[35px] text-center" title="Current zoom level">
              {window.reactFlowInstance ? Math.round(window.reactFlowInstance.getZoom() * 100) : canvasScale}%
            </span>
            <button onClick={zoomIn} className="hover:text-white transition-colors" title="Zoom In">
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
          
          <button
            onClick={resetView}
            className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            title="Reset canvas view to fit all nodes"
          >
            Reset
          </button>
          
          <button
            onClick={cycleConnectionStyle}
            className="px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all capitalize"
            title={`Current: ${connectionStyle}. Click to cycle through connection styles.`}
          >
            {connectionStyle}
          </button>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 relative">
        {activeTab ? (
          <WorkflowReactFlowCanvas
            key={`canvas-${activeTabId}`} // Force re-render when tab changes
            workflow={activeTab.workflow}
            templates={activeTab.templates}
            onTemplateSelect={createNewTab}
            onNodeCanvasSelect={createNodeCanvasTab}
            tabTitle={activeTab.title}
            nodeCanvasData={activeTab.nodeCanvasData}
            onAddNode={(type: string) => true}
            connectionStyle={connectionStyle}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No active canvas
          </div>
        )}
      </div>
    </div>
  )
}