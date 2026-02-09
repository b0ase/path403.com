'use client'

import React, { useState, useRef } from 'react'
import { X, Zap } from 'lucide-react'
import WorkflowReactFlowCanvas from './WorkflowReactFlowCanvas'

interface DemoModalProps {
  isOpen: boolean
  onClose: () => void
}

// AUDEX Demo Workflow Definition
const getAUDEXDemoWorkflow = () => ({
  id: 'audex-demo',
  name: 'AUDEX Corporation - Asset & Monetary Flows',
  description: 'Interactive demo of AUDEX revenue distribution and royalty management',
  nodes: [
    // Revenue Sources
    { id: '1', name: 'Music Track Streaming', type: 'youtube', x: 100, y: 100, handcashHandle: 'AUDEX_Streaming' },
    { id: '2', name: 'YouTube Ad Revenue', type: 'youtube', x: 300, y: 100, handcashHandle: 'AUDEX_YouTube' },
    { id: '3', name: 'Spotify Royalties', type: 'payment', x: 500, y: 100, handcashHandle: 'AUDEX_Spotify' },
    { id: '4', name: 'Platform Subscriptions', type: 'payment', x: 700, y: 100, handcashHandle: 'AUDEX_Subs' },
    { id: '5', name: 'NFT Music Sales', type: 'instrument', x: 900, y: 100, handcashHandle: 'AUDEX_NFTs' },
    
    // Revenue Aggregation
    { id: '10', name: 'AUDEX Revenue Pool', type: 'splitter', x: 500, y: 250, handcashHandle: 'AUDEX_Revenue' },
    
    // Corporate Distribution
    { id: '15', name: 'AUDEX Treasury (51%)', type: 'organization', x: 300, y: 400, handcashHandle: 'AUDEX_Treasury' },
    { id: '16', name: 'Artist Royalty Pool (35%)', type: 'member', x: 500, y: 400, handcashHandle: 'AUDEX_Artists' },
    { id: '17', name: 'Operations Reserve (10%)', type: 'workflow', x: 700, y: 400, handcashHandle: 'AUDEX_Ops' },
    { id: '18', name: 'Platform Development (4%)', type: 'trigger', x: 900, y: 400, handcashHandle: 'AUDEX_Dev' },
    
    // Artist Distribution
    { id: '20', name: 'Lead Vocalist (40%)', type: 'member', x: 200, y: 550, handcashHandle: 'AUDEX_Lead' },
    { id: '21', name: 'Producer/Composer (30%)', type: 'member', x: 400, y: 550, handcashHandle: 'AUDEX_Producer' },
    { id: '22', name: 'Sound Engineer (20%)', type: 'member', x: 600, y: 550, handcashHandle: 'AUDEX_Engineer' },
    { id: '23', name: 'Session Musicians (10%)', type: 'member', x: 800, y: 550, handcashHandle: 'AUDEX_Session' },
  ],
  connections: [
    // Revenue to Pool
    { from: '1', to: '10' },
    { from: '2', to: '10' },
    { from: '3', to: '10' },
    { from: '4', to: '10' },
    { from: '5', to: '10' },
    
    // Pool to Corporate Distribution
    { from: '10', to: '15' },
    { from: '10', to: '16' },
    { from: '10', to: '17' },
    { from: '10', to: '18' },
    
    // Artist Pool to Individual Artists
    { from: '16', to: '20' },
    { from: '16', to: '21' },
    { from: '16', to: '22' },
    { from: '16', to: '23' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  folder: 'Demo'
})

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [canvasScale, setCanvasScale] = useState(0.6)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-[95vw] max-w-7xl h-[90vh] bg-black/90 border border-white/20 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AUDEX Corporation Demo</h2>
              <p className="text-gray-400">Interactive workflow canvas - explore the revenue flow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* ReactFlow Canvas */}
        <div className="h-full">
          <WorkflowReactFlowCanvas 
            workflow={getAUDEXDemoWorkflow()}
            tabTitle="AUDEX Corporation - Revenue Distribution Demo"
            onAddNode={() => {}}
            onDeleteNode={() => {}}
            onUpdateNode={() => {}}
            onConnect={() => {}}
            onDisconnect={() => {}}
            canvasScale={canvasScale}
            canvasOffset={canvasOffset}
            setCanvasScale={setCanvasScale}
            setCanvasOffset={setCanvasOffset}
            resetCanvasView={() => {
              setCanvasScale(0.6)
              setCanvasOffset({ x: 0, y: 0 })
            }}
            onBackToWorkflows={onClose}
            selectedNodeDetails={null}
            setSelectedNodeDetails={() => {}}
            organizations={[]}
            roles={[]}
            instruments={[]}
            contracts={[]}
            wallets={[]}
            workflows={[]}
            sidebarOpen={false}
          />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Interactive Demo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Click nodes to explore</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Close Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
