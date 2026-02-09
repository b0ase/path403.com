"use client"

import React, { useState, useEffect } from 'react'
import { X, Save, RotateCcw, Workflow, DollarSign, Users, FileText, Building, Crown, UserCheck, Banknote } from 'lucide-react'
import { Node } from 'reactflow'
import WorkflowReactFlowCanvas from './WorkflowReactFlowCanvas'

export type NodeParameter = {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean' | 'currency' | 'percentage' | 'date' | 'workflow'
  value: any
  options?: string[] // for select type
  placeholder?: string
  description?: string
  validation?: {
    required?: boolean
    min?: number
    max?: number
    pattern?: string
  }
}

export type NodeSchema = {
  kind: string
  title: string
  description: string
  icon: React.ReactNode
  parameters: NodeParameter[]
  hasWorkflow?: boolean
  workflowTemplate?: any
}

interface NodeEditorProps {
  node: Node | null
  isOpen: boolean
  onClose: () => void
  onSave: (nodeId: string, updates: any) => void
}

// Define schemas for different node types
const getNodeSchema = (kind: string): NodeSchema => {
  const schemas: Record<string, NodeSchema> = {
    organization: {
      kind: 'organization',
      title: 'Organization',
      description: 'Configure organization details and structure',
      icon: <Building className="w-5 h-5" />,
      parameters: [
        { key: 'name', label: 'Organization Name', type: 'text', value: '', validation: { required: true } },
        { key: 'type', label: 'Business Type', type: 'select', value: 'corporation', options: ['corporation', 'llc', 'partnership', 'nonprofit', 'charity'] },
        { key: 'jurisdiction', label: 'Jurisdiction', type: 'select', value: 'US', options: ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'SG'] },
        { key: 'industry', label: 'Industry', type: 'text', value: '' },
        { key: 'description', label: 'Description', type: 'textarea', value: '', placeholder: 'Describe the organization...' },
        { key: 'founded', label: 'Founded Date', type: 'date', value: '' },
        { key: 'employees', label: 'Employee Count', type: 'number', value: 0, validation: { min: 0 } },
      ],
      hasWorkflow: true,
      workflowTemplate: {
        nodes: [
          { id: 'leadership', name: 'Leadership Team', type: 'role', x: 200, y: 100 },
          { id: 'operations', name: 'Operations', type: 'role', x: 400, y: 100 },
          { id: 'governance', name: 'Governance', type: 'contract', x: 300, y: 200 }
        ],
        connections: [
          { id: 'lead-ops', from: 'leadership', to: 'operations' },
          { id: 'lead-gov', from: 'leadership', to: 'governance' }
        ]
      }
    },
    
    role: {
      kind: 'role',
      title: 'Role',
      description: 'Define role responsibilities and requirements',
      icon: <Crown className="w-5 h-5" />,
      parameters: [
        { key: 'title', label: 'Role Title', type: 'text', value: '', validation: { required: true } },
        { key: 'department', label: 'Department', type: 'text', value: '' },
        { key: 'level', label: 'Level', type: 'select', value: 'individual', options: ['executive', 'senior', 'mid', 'individual', 'intern'] },
        { key: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', value: '', placeholder: 'List main responsibilities...' },
        { key: 'requirements', label: 'Requirements', type: 'textarea', value: '', placeholder: 'Required skills and experience...' },
        { key: 'salary_min', label: 'Salary Range (Min)', type: 'currency', value: 0 },
        { key: 'salary_max', label: 'Salary Range (Max)', type: 'currency', value: 0 },
        { key: 'equity_percentage', label: 'Equity Percentage', type: 'percentage', value: 0 },
        { key: 'reports_to', label: 'Reports To', type: 'text', value: '' },
      ],
      hasWorkflow: true,
      workflowTemplate: {
        nodes: [
          { id: 'tasks', name: 'Daily Tasks', type: 'task', x: 150, y: 100 },
          { id: 'goals', name: 'Goals & KPIs', type: 'milestone', x: 350, y: 100 },
          { id: 'reviews', name: 'Performance Reviews', type: 'milestone', x: 250, y: 200 }
        ],
        connections: [
          { id: 'tasks-goals', from: 'tasks', to: 'goals' },
          { id: 'goals-reviews', from: 'goals', to: 'reviews' }
        ]
      }
    },

    instrument: {
      kind: 'instrument',
      title: 'Financial Instrument',
      description: 'Configure financial instrument parameters',
      icon: <DollarSign className="w-5 h-5" />,
      parameters: [
        { key: 'name', label: 'Instrument Name', type: 'text', value: '', validation: { required: true } },
        { key: 'type', label: 'Instrument Type', type: 'select', value: 'equity', options: ['equity', 'debt', 'derivative', 'hybrid', 'utility', 'governance'] },
        { key: 'symbol', label: 'Symbol/Ticker', type: 'text', value: '' },
        { key: 'total_supply', label: 'Total Supply', type: 'number', value: 0, validation: { min: 0 } },
        { key: 'unit_price', label: 'Unit Price', type: 'currency', value: 0 },
        { key: 'description', label: 'Description', type: 'textarea', value: '', placeholder: 'Describe the instrument...' },
        { key: 'transferable', label: 'Transferable', type: 'boolean', value: true },
        { key: 'voting_rights', label: 'Voting Rights', type: 'boolean', value: false },
        { key: 'dividend_rate', label: 'Dividend/Interest Rate', type: 'percentage', value: 0 },
      ]
    },

    contract: {
      kind: 'contract',
      title: 'Contract',
      description: 'Define contract terms and conditions',
      icon: <FileText className="w-5 h-5" />,
      parameters: [
        { key: 'title', label: 'Contract Title', type: 'text', value: '', validation: { required: true } },
        { key: 'type', label: 'Contract Type', type: 'select', value: 'service', options: ['service', 'employment', 'partnership', 'licensing', 'nda', 'purchase'] },
        { key: 'parties', label: 'Parties Involved', type: 'textarea', value: '', placeholder: 'List all parties to the contract...' },
        { key: 'start_date', label: 'Start Date', type: 'date', value: '' },
        { key: 'end_date', label: 'End Date', type: 'date', value: '' },
        { key: 'value', label: 'Contract Value', type: 'currency', value: 0 },
        { key: 'terms', label: 'Key Terms', type: 'textarea', value: '', placeholder: 'Outline key terms and conditions...' },
        { key: 'auto_renewal', label: 'Auto Renewal', type: 'boolean', value: false },
        { key: 'jurisdiction', label: 'Governing Law', type: 'text', value: '' },
      ]
    },

    task: {
      kind: 'task',
      title: 'Task',
      description: 'Configure task details and workflow',
      icon: <UserCheck className="w-5 h-5" />,
      parameters: [
        { key: 'name', label: 'Task Name', type: 'text', value: '', validation: { required: true } },
        { key: 'description', label: 'Description', type: 'textarea', value: '', placeholder: 'Describe what needs to be done...' },
        { key: 'priority', label: 'Priority', type: 'select', value: 'medium', options: ['low', 'medium', 'high', 'urgent'] },
        { key: 'status', label: 'Status', type: 'select', value: 'pending', options: ['pending', 'in_progress', 'completed', 'cancelled'] },
        { key: 'assigned_to', label: 'Assigned To', type: 'text', value: '' },
        { key: 'due_date', label: 'Due Date', type: 'date', value: '' },
        { key: 'estimated_hours', label: 'Estimated Hours', type: 'number', value: 0, validation: { min: 0 } },
        { key: 'dependencies', label: 'Dependencies', type: 'textarea', value: '', placeholder: 'List any task dependencies...' },
      ]
    },

    payment: {
      kind: 'payment',
      title: 'Payment',
      description: 'Configure payment details and flow',
      icon: <Banknote className="w-5 h-5" />,
      parameters: [
        { key: 'amount', label: 'Amount', type: 'currency', value: 0, validation: { required: true, min: 0 } },
        { key: 'currency', label: 'Currency', type: 'select', value: 'USD', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] },
        { key: 'from', label: 'From', type: 'text', value: '', validation: { required: true } },
        { key: 'to', label: 'To', type: 'text', value: '', validation: { required: true } },
        { key: 'purpose', label: 'Purpose', type: 'text', value: '' },
        { key: 'schedule', label: 'Schedule', type: 'select', value: 'one_time', options: ['one_time', 'weekly', 'monthly', 'quarterly', 'annually'] },
        { key: 'due_date', label: 'Due Date', type: 'date', value: '' },
        { key: 'reference', label: 'Reference Number', type: 'text', value: '' },
        { key: 'notes', label: 'Notes', type: 'textarea', value: '', placeholder: 'Additional payment notes...' },
      ]
    },

    team: {
      kind: 'team',
      title: 'Team',
      description: 'Manage team structure and members',
      icon: <Users className="w-5 h-5" />,
      parameters: [
        { key: 'name', label: 'Team Name', type: 'text', value: '', validation: { required: true } },
        { key: 'description', label: 'Team Description', type: 'textarea', value: '', placeholder: 'Describe the team purpose and goals...' },
        { key: 'lead', label: 'Team Lead', type: 'text', value: '' },
        { key: 'size', label: 'Team Size', type: 'number', value: 0, validation: { min: 0 } },
        { key: 'department', label: 'Department', type: 'text', value: '' },
        { key: 'budget', label: 'Annual Budget', type: 'currency', value: 0 },
        { key: 'objectives', label: 'Key Objectives', type: 'textarea', value: '', placeholder: 'List main team objectives...' },
        { key: 'meeting_schedule', label: 'Meeting Schedule', type: 'text', value: '', placeholder: 'e.g., Weekly on Mondays' },
      ],
      hasWorkflow: true,
      workflowTemplate: {
        nodes: [
          { id: 'members', name: 'Team Members', type: 'role', x: 150, y: 100 },
          { id: 'projects', name: 'Active Projects', type: 'task', x: 350, y: 100 },
          { id: 'reviews', name: 'Team Reviews', type: 'milestone', x: 250, y: 200 }
        ],
        connections: [
          { id: 'members-projects', from: 'members', to: 'projects' },
          { id: 'projects-reviews', from: 'projects', to: 'reviews' }
        ]
      }
    }
  }

  return schemas[kind] || {
    kind,
    title: kind.charAt(0).toUpperCase() + kind.slice(1),
    description: `Configure ${kind} parameters`,
    icon: <FileText className="w-5 h-5" />,
    parameters: [
      { key: 'name', label: 'Name', type: 'text', value: '', validation: { required: true } },
      { key: 'description', label: 'Description', type: 'textarea', value: '' },
    ]
  }
}

export default function NodeEditor({ node, isOpen, onClose, onSave }: NodeEditorProps) {
  const [parameters, setParameters] = useState<NodeParameter[]>([])
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [workflowData, setWorkflowData] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const schema = node ? getNodeSchema(node.data.kind) : null

  useEffect(() => {
    if (node && schema) {
      // Initialize parameters with current node data
      const initialParams = schema.parameters.map(param => ({
        ...param,
        value: node.data[param.key] ?? param.value
      }))
      setParameters(initialParams)
      setWorkflowData(node.data.workflow || schema.workflowTemplate)
      setHasChanges(false)
    }
  }, [node?.id, node?.data?.kind]) // Use stable node.id and node.data.kind instead of schema

  const handleParameterChange = (key: string, value: any) => {
    setParameters(prev => 
      prev.map(param => 
        param.key === key ? { ...param, value } : param
      )
    )
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!node) return

    const updates: any = {}
    parameters.forEach(param => {
      updates[param.key] = param.value
    })

    if (workflowData) {
      updates.workflow = workflowData
    }

    onSave(node.id, updates)
    setHasChanges(false)
    onClose()
  }

  const handleReset = () => {
    if (node && schema) {
      const resetParams = schema.parameters.map(param => ({
        ...param,
        value: node.data[param.key] ?? param.value
      }))
      setParameters(resetParams)
      setWorkflowData(node.data.workflow || schema.workflowTemplate)
      setHasChanges(false)
    }
  }

  const renderParameterInput = (param: NodeParameter) => {
    const commonClasses = "w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"

    switch (param.type) {
      case 'text':
        return (
          <input
            type="text"
            value={param.value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            placeholder={param.placeholder}
            className={commonClasses}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={param.value || ''}
            onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value) || 0)}
            min={param.validation?.min}
            max={param.validation?.max}
            className={commonClasses}
          />
        )

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400">$</span>
            <input
              type="number"
              value={param.value || ''}
              onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value) || 0)}
              min={0}
              step="0.01"
              className={`${commonClasses} pl-8`}
            />
          </div>
        )

      case 'percentage':
        return (
          <div className="relative">
            <input
              type="number"
              value={param.value || ''}
              onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value) || 0)}
              min={0}
              max={100}
              step="0.1"
              className={`${commonClasses} pr-8`}
            />
            <span className="absolute right-3 top-2 text-gray-400">%</span>
          </div>
        )

      case 'textarea':
        return (
          <textarea
            value={param.value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            placeholder={param.placeholder}
            rows={3}
            className={`${commonClasses} resize-none`}
          />
        )

      case 'select':
        return (
          <select
            value={param.value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            className={commonClasses}
          >
            {param.options?.map(option => (
              <option key={option} value={option} className="bg-gray-800">
                {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        )

      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={param.value || false}
              onChange={(e) => handleParameterChange(param.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white/5 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-300">Enabled</span>
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={param.value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            className={commonClasses}
          />
        )

      default:
        return (
          <input
            type="text"
            value={param.value || ''}
            onChange={(e) => handleParameterChange(param.key, e.target.value)}
            className={commonClasses}
          />
        )
    }
  }

  if (!isOpen || !node || !schema) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-black/90 border border-white/20 rounded-lg w-[800px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {schema.icon}
            <div>
              <h2 className="text-xl font-semibold text-white">{schema.title}</h2>
              <p className="text-sm text-gray-400">{schema.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showWorkflow && schema.hasWorkflow ? (
            <div className="h-96 relative">
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => setShowWorkflow(false)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm text-white transition-colors"
                >
                  ← Back to Parameters
                </button>
              </div>
              <WorkflowReactFlowCanvas
                workflow={workflowData}
                tabTitle={`${node.data.label} Workflow`}
              />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {parameters.map(param => (
                  <div key={param.key} className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      {param.label}
                      {param.validation?.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    {renderParameterInput(param)}
                    {param.description && (
                      <p className="text-xs text-gray-400">{param.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Workflow Section */}
              {schema.hasWorkflow && (
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <Workflow className="w-5 h-5" />
                        Internal Workflow
                      </h3>
                      <p className="text-sm text-gray-400">Configure the internal processes for this {schema.kind}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowWorkflow(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        Edit Workflow
                      </button>
                      <button
                        onClick={() => {
                          // Remove the node from the canvas immediately
                          if ((window as any).deleteNodeFromCanvas) {
                            (window as any).deleteNodeFromCanvas(node.id);
                          }
                          onClose();
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
                        title="Delete this node"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showWorkflow && (
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
