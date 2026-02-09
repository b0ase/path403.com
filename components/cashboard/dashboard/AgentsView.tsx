'use client'

import React, { useState } from 'react'
import { Bot, TrendingUp, BarChart3, Shield, Settings, Zap, Plus, X } from 'lucide-react'
import type { Role } from '@/components/cashboard/dashboard.types'

export default function AgentsView({ 
  roles, 
  onCreateAgent, 
  onUpdateAgent, 
  onDeleteAgent 
}: {
  roles: Role[]
  onCreateAgent: (name: string, description: string, icon: string, permissions: string[], shareAllocation: number, automationType: 'ai-agent' | 'hybrid' | 'workflow') => void
  onUpdateAgent: (id: string, updates: Partial<Role>) => void
  onDeleteAgent: (id: string) => void
}) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'bot',
    permissions: [] as string[],
    defaultShareAllocation: 10,
    automationType: 'ai-agent' as const,
    aiPrompt: ''
  })

  // Import the comprehensive agent templates from the main templates file
  const agentTemplates = [
    { id: 'marketing-ai', name: 'Marketing AI Agent', description: 'Automated social media posting, content creation, and campaign optimization', icon: 'bot', permissions: ['marketing', 'data-analysis'], defaultShareAllocation: 8, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a marketing AI agent focused on creating engaging content, managing social media campaigns, and optimizing marketing ROI through data-driven insights.' },
    { id: 'trading-bot', name: 'Trading Bot', description: 'Automated trading strategies, market analysis, and portfolio management', icon: 'trending-up', permissions: ['finance', 'data-analysis'], defaultShareAllocation: 12, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a sophisticated trading bot that analyzes market trends, executes trades based on predefined strategies, and manages risk to optimize portfolio performance.' },
    { id: 'customer-service-ai', name: 'Customer Service AI', description: 'Automated customer support, ticket routing, and response generation', icon: 'bot', permissions: ['marketing', 'operations'], defaultShareAllocation: 6, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a customer service AI agent that handles support tickets, routes inquiries, and generates helpful responses to improve customer satisfaction.' },
    { id: 'content-generator-ai', name: 'Content Generator AI', description: 'Automated blog posts, product descriptions, and marketing copy creation', icon: 'bot', permissions: ['marketing', 'workflow-creation'], defaultShareAllocation: 7, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a content generation AI that creates engaging blog posts, product descriptions, and marketing copy to drive engagement and conversions.' },
    { id: 'data-analysis-ai', name: 'Data Analysis AI', description: 'Automated data processing, insights generation, and report creation', icon: 'bar-chart-3', permissions: ['data-analysis', 'finance'], defaultShareAllocation: 9, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a data analysis AI that processes data, generates insights, and creates comprehensive reports to support business decision-making.' },
    { id: 'seo-optimization-ai', name: 'SEO Optimization AI', description: 'Automated keyword research, content optimization, and ranking monitoring', icon: 'bot', permissions: ['marketing', 'data-analysis'], defaultShareAllocation: 5, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are an SEO optimization AI that conducts keyword research, optimizes content, and monitors search rankings to improve organic visibility.' },
    { id: 'lead-generation-ai', name: 'Lead Generation AI', description: 'Automated prospect identification, outreach, and lead qualification', icon: 'bot', permissions: ['marketing', 'operations'], defaultShareAllocation: 8, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a lead generation AI that identifies prospects, conducts outreach, and qualifies leads to grow the sales pipeline.' },
    { id: 'inventory-management-ai', name: 'Inventory Management AI', description: 'Automated stock monitoring, reorder alerts, and demand forecasting', icon: 'settings', permissions: ['operations', 'data-analysis'], defaultShareAllocation: 6, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are an inventory management AI that monitors stock levels, sends reorder alerts, and forecasts demand to optimize inventory.' },
    { id: 'financial-advisor-ai', name: 'Financial Advisor AI', description: 'Automated budget analysis, expense tracking, and financial recommendations', icon: 'trending-up', permissions: ['finance', 'data-analysis'], defaultShareAllocation: 10, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a financial advisor AI that analyzes budgets, tracks expenses, and provides financial recommendations to improve fiscal health.' },
    { id: 'quality-assurance-ai', name: 'Quality Assurance AI', description: 'Automated testing, bug detection, and quality monitoring', icon: 'shield', permissions: ['tech', 'operations'], defaultShareAllocation: 7, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a quality assurance AI that conducts automated testing, detects bugs, and monitors quality metrics to ensure product excellence.' },
    { id: 'hr-recruitment-ai', name: 'HR Recruitment AI', description: 'Automated resume screening, candidate matching, and interview scheduling', icon: 'bot', permissions: ['operations', 'data-analysis'], defaultShareAllocation: 6, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are an HR recruitment AI that screens resumes, matches candidates, and schedules interviews to streamline the hiring process.' },
    { id: 'competitive-analysis-ai', name: 'Competitive Analysis AI', description: 'Automated competitor monitoring, price tracking, and market intelligence', icon: 'bot', permissions: ['marketing', 'data-analysis'], defaultShareAllocation: 5, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a competitive analysis AI that monitors competitors, tracks pricing, and provides market intelligence to inform strategic decisions.' },
    { id: 'social-media-ai-manager', name: 'Social Media AI Manager', description: 'Automated posting, engagement monitoring, and community management', icon: 'bot', permissions: ['marketing', 'workflow-creation'], defaultShareAllocation: 7, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a social media AI manager that automates posting, monitors engagement, and manages community interactions to build brand presence.' },
    { id: 'email-marketing-ai', name: 'Email Marketing AI', description: 'Automated email campaigns, personalization, and performance optimization', icon: 'bot', permissions: ['marketing', 'data-analysis'], defaultShareAllocation: 6, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are an email marketing AI that creates campaigns, personalizes content, and optimizes performance to improve email marketing ROI.' },
    { id: 'fraud-detection-ai', name: 'Fraud Detection AI', description: 'Automated transaction monitoring, anomaly detection, and risk assessment', icon: 'shield', permissions: ['finance', 'data-analysis'], defaultShareAllocation: 8, automationType: 'ai-agent' as const, isAutomated: true, workflowId: null, aiPrompt: 'You are a fraud detection AI that monitors transactions, detects anomalies, and assesses risk to protect against fraudulent activities.' },
  ]

  // Use the agent templates directly since they have the complete structure
  const agents = agentTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    permissions: template.permissions,
    defaultShareAllocation: template.defaultShareAllocation,
    automationType: template.automationType,
    isAutomated: template.isAutomated,
    workflowId: template.workflowId,
    aiPrompt: template.aiPrompt
  }))

  // Debug logging
  console.log('AgentsView render:', { 
    agentTemplatesCount: agentTemplates.length, 
    agentsCount: agents.length, 
    agents: agents,
    firstAgent: agents[0]
  })

  const handleCreate = () => {
    if (formData.name && formData.description) {
      onCreateAgent(
        formData.name,
        formData.description,
        formData.icon,
        formData.permissions,
        formData.defaultShareAllocation,
        formData.automationType
      )
      setFormData({
        name: '',
        description: '',
        icon: 'bot',
        permissions: [],
        defaultShareAllocation: 10,
        automationType: 'ai-agent',
        aiPrompt: ''
      })
      setShowCreateForm(false)
    }
  }

  const availableIcons = [
    { id: 'bot', name: 'AI Agent' },
    { id: 'trending-up', name: 'Growth' },
    { id: 'bar-chart-3', name: 'Analytics' },
    { id: 'shield', name: 'Security' },
    { id: 'settings', name: 'Operations' },
    { id: 'zap', name: 'Automation' }
  ]

  const getAgentIcon = (iconId: string) => {
    switch (iconId) {
      case 'bot': return <Bot className="w-5 h-5" />
      case 'trending-up': return <TrendingUp className="w-5 h-5" />
      case 'bar-chart-3': return <BarChart3 className="w-5 h-5" />
      case 'shield': return <Shield className="w-5 h-5" />
      case 'settings': return <Settings className="w-5 h-5" />
      case 'zap': return <Zap className="w-5 h-5" />
      default: return <Bot className="w-5 h-5" />
    }
  }

  const getStatusColor = (agent: Role) => {
    if (agent.isAutomated) {
      return 'text-green-400'
    }
    return 'text-gray-400'
  }

  const getStatusText = (agent: Role) => {
    if (agent.isAutomated) {
      return 'Active'
    }
    return 'Inactive'
  }

  return (
    <div className="absolute inset-0 top-20 overflow-y-auto scrollbar-always-visible px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Agents</h1>
            <p className="text-gray-300">Manage your AI-powered automation agents • {agents.length} active agent{agents.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Agent</span>
          </button>
        </div>

        {agents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No AI Agents Yet</h3>
            <p className="text-gray-500 mb-6">Create your first AI agent to automate workflows and processes</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create First Agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {getAgentIcon(agent.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{agent.name}</h3>
                      <p className={`text-sm ${getStatusColor(agent)}`}>{getStatusText(agent)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onDeleteAgent(agent.id)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Agent"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">{agent.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.permissions.slice(0, 3).map((permission) => (
                        <span key={permission} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded">
                          {permission}
                        </span>
                      ))}
                      {agent.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded">
                          +{agent.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Share Allocation</p>
                      <p className="text-sm font-medium text-white">{agent.defaultShareAllocation}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Type</p>
                      <p className="text-sm font-medium text-blue-400 capitalize">{agent.automationType?.replace('-', ' ') || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create AI Agent</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Marketing AI Agent"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Automated marketing campaigns and customer engagement"
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availableIcons.map((icon) => (
                      <option key={icon.id} value={icon.id} className="bg-gray-800">
                        {icon.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Share Allocation (%)</label>
                  <input
                    type="number"
                    value={formData.defaultShareAllocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultShareAllocation: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
