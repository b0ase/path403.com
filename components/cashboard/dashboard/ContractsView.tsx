'use client'

import React, { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import type { Organization, Role, FinancialInstrument, Contract, ContractIntegration, ContractMilestone, ContractNotification, ContractAutomation, ContractsViewProps } from '@/components/cashboard/dashboard.types'
import { getOrganizationTemplates, getRoleTemplates, getAgentTemplates, getInstrumentTemplates, getContractTemplates, getIntegrationTemplates } from '@/data/cashboard/templates'

export default function ContractsView({ organizations, selectedOrganization, roles = [], instruments = [] }: ContractsViewProps) {
  const [showCreateContract, setShowCreateContract] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [contractData, setContractData] = useState({
    name: '',
    type: 'service' as Contract['type'],
    description: '',
    parties: [''],
    value: 0,
    currency: 'USD',
    startDate: '',
    endDate: '',
    organizationId: selectedOrganization || '',
    workflow: {
      id: '',
      name: '',
      description: '',
      organizations: [] as string[],
      roles: [] as string[],
      members: [] as string[],
      instruments: [] as string[],
      integrations: [] as ContractIntegration[],
      automations: [] as ContractAutomation[],
      milestones: [] as ContractMilestone[],
      notifications: [] as ContractNotification[]
    }
  })

  const currentOrg = organizations.find(org => org.id === selectedOrganization)
  const allMembers = organizations.flatMap(org => org.members)

  const contractTemplates = [
    { id: '1', name: 'Service Agreement', type: 'service', description: 'Standard service delivery contract', icon: '📋', defaultDuration: 12 },
    { id: '2', name: 'Employment Contract', type: 'employment', description: 'Employee hiring agreement', icon: '👤', defaultDuration: 24 },
  ]

  const integrationTemplates = [
    { type: 'document_signing' as const, name: 'DocuSign Integration', description: 'Automated document signing workflow', icon: '✍️' },
    { type: 'payment' as const, name: 'Payment Gateway', description: 'Automated payment processing', icon: '💳' },
  ]

  useEffect(() => {
    try {
      (window as any).__templates = {
        organizationTemplates: getOrganizationTemplates(),
        roleTemplates: getRoleTemplates(),
        agentTemplates: getAgentTemplates(),
        instrumentTemplates: getInstrumentTemplates(),
        contractTemplates: getContractTemplates(),
        integrationTemplates: getIntegrationTemplates(),
      }
      localStorage.setItem('__templates', JSON.stringify((window as any).__templates))
    } catch {}
  }, [])

  const handleTemplateSelect = (template: typeof contractTemplates[0]) => {
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + template.defaultDuration)
    
    setContractData(prev => ({
      ...prev,
      name: template.name,
      type: template.type as Contract['type'],
      description: template.description,
      endDate: endDate.toISOString().split('T')[0],
      workflow: {
        ...prev.workflow,
        name: `${template.name} Workflow`,
        description: `Automated workflow for ${template.name.toLowerCase()}`
      }
    }))
    setCurrentStep(2)
  }

  const addIntegration = (template: typeof integrationTemplates[0]) => {
    const newIntegration: ContractIntegration = {
      id: Date.now().toString(),
      type: template.type,
      name: template.name,
      description: template.description,
      isActive: true,
      triggerEvents: ['contract_created'],
      configuration: {}
    }
    
    setContractData(prev => ({
      ...prev,
      workflow: {
        ...prev.workflow,
        integrations: [...prev.workflow.integrations, newIntegration]
      }
    }))
  }

  const addMilestone = () => {
    const newMilestone: ContractMilestone = {
      id: Date.now().toString(),
      name: 'New Milestone',
      description: '',
      dueDate: '',
      status: 'pending',
      assignedTo: [],
      deliverables: [],
      paymentAmount: 0,
      currency: 'USD'
    }
    
    setContractData(prev => ({
      ...prev,
      workflow: {
        ...prev.workflow,
        milestones: [...prev.workflow.milestones, newMilestone]
      }
    }))
  }

  const handleCreateContract = () => {
    console.log('Creating contract with workflow:', contractData)
    setShowCreateContract(false)
    setCurrentStep(1)
    setContractData({
      name: '',
      type: 'service',
      description: '',
      parties: [''],
      value: 0,
      currency: 'USD',
      startDate: '',
      endDate: '',
      organizationId: selectedOrganization || '',
      workflow: {
        id: '', name: '', description: '', organizations: [], roles: [], members: [], instruments: [], integrations: [], automations: [], milestones: [], notifications: []
      }
    })
  }

  return (
    <div className="absolute inset-0 top-24 overflow-y-auto px-6 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contract Workflows</h1>
            <p className="text-gray-300">Create and manage smart contract workflows with automation</p>
          </div>
          <button
            onClick={() => setShowCreateContract(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Contract Workflow</span>
          </button>
        </div>
    </div>
  )
}
