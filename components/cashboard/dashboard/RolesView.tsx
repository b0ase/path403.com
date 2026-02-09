'use client'

import React, { useState } from 'react'
import { Crown, Bot, TrendingUp, BarChart3, Palette, Shield, Settings, Users, Plus, X } from 'lucide-react'
import type { Role, RolesViewProps } from '@/components/cashboard/dashboard.types'

export default function RolesView({ roles, selectedOrganization, onAddMember, onCreateRole, onUpdateRole, onDeleteRole }: Omit<RolesViewProps, 'organizations'>) {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false)
  const [showRoleDetail, setShowRoleDetail] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({ handle: '', displayName: '' })
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    icon: 'bot',
    permissions: [] as string[],
    defaultShareAllocation: 10,
    automationType: 'ai-agent' as 'ai-agent' | 'workflow' | 'hybrid'
  })
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const availablePermissions = [
    'admin', 'finance', 'tech', 'marketing', 'legal', 'operations', 
    'automation', 'workflow-creation', 'ai-training', 'data-analysis'
  ]

  const availableIcons = [
    { id: 'bot', name: 'AI Agent', icon: <Bot /> },
    { id: 'crown', name: 'Leadership', icon: <Crown /> },
    { id: 'trending-up', name: 'Growth', icon: <TrendingUp /> },
    { id: 'bar-chart-3', name: 'Analytics', icon: <BarChart3 /> },
    { id: 'palette', name: 'Creative', icon: <Palette /> },
    { id: 'shield', name: 'Security', icon: <Shield /> },
    { id: 'settings', name: 'Operations', icon: <Settings /> },
    { id: 'users', name: 'Team', icon: <Users /> }
  ]

  const handleAddMember = () => {
    if (selectedOrganization && selectedRole && formData.handle && formData.displayName) {
      onAddMember(selectedOrganization, formData.handle, formData.displayName, selectedRole.id)
      setFormData({ handle: '', displayName: '' })
      setShowAddMemberForm(false)
    }
  }

  const handleCreateRole = () => {
    if (roleFormData.name && roleFormData.description) {
      onCreateRole(
        roleFormData.name,
        roleFormData.description,
        roleFormData.icon,
        roleFormData.permissions,
        roleFormData.defaultShareAllocation,
        roleFormData.automationType
      )
      setRoleFormData({
        name: '',
        description: '',
        icon: 'bot',
        permissions: [],
        defaultShareAllocation: 10,
        automationType: 'ai-agent'
      })
      setShowCreateRoleForm(false)
    }
  }

  const togglePermission = (permission: string) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const roleTemplates = [
    { name: 'Chief Executive Officer', description: 'Overall company leadership, strategic direction, and stakeholder relations', icon: 'crown', permissions: ['admin', 'finance', 'operations', 'data-analysis'], defaultShareAllocation: 25, automationType: 'workflow' as const, category: 'Executive' },
    { name: 'Chief Technology Officer', description: 'Technology strategy, product development, and engineering leadership', icon: 'cpu', permissions: ['tech', 'admin', 'workflow-creation'], defaultShareAllocation: 20, automationType: 'workflow' as const, category: 'Executive' },
    { name: 'Chief Operating Officer', description: 'Daily operations, process optimization, and business execution', icon: 'settings', permissions: ['operations', 'admin', 'finance'], defaultShareAllocation: 18, automationType: 'workflow' as const, category: 'Executive' },
    { name: 'Chief Financial Officer', description: 'Financial planning, budgeting, fundraising, and fiscal management', icon: 'bar-chart-3', permissions: ['finance', 'admin', 'data-analysis'], defaultShareAllocation: 15, automationType: 'workflow' as const, category: 'Executive' },
    { name: 'Chief Marketing Officer', description: 'Marketing strategy, brand management, and customer acquisition', icon: 'trending-up', permissions: ['marketing', 'admin', 'data-analysis'], defaultShareAllocation: 12, automationType: 'workflow' as const, category: 'Executive' },
    { name: 'Senior Software Engineer', description: 'Full-stack development, architecture decisions, and technical mentorship', icon: 'code', permissions: ['tech', 'workflow-creation'], defaultShareAllocation: 8, automationType: 'workflow' as const, category: 'Engineering' },
    { name: 'Frontend Developer', description: 'User interface development, responsive design, and user experience', icon: 'monitor', permissions: ['tech', 'marketing'], defaultShareAllocation: 6, automationType: 'workflow' as const, category: 'Engineering' },
    { name: 'Backend Developer', description: 'Server-side development, API design, and database management', icon: 'server', permissions: ['tech', 'operations'], defaultShareAllocation: 6, automationType: 'workflow' as const, category: 'Engineering' },
  ]

  const roleCategories = ['All', 'Executive', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'Human Resources', 'Customer Support', 'Legal']
  
  const filteredRoleTemplates = selectedCategory === 'All' 
    ? roleTemplates 
    : roleTemplates.filter(template => template.category === selectedCategory)

  const applyRoleTemplate = (template: typeof roleTemplates[0]) => {
    setRoleFormData({
      name: template.name,
      description: template.description,
      icon: template.icon,
      permissions: template.permissions,
      defaultShareAllocation: template.defaultShareAllocation,
      automationType: template.automationType
    })
    setShowTemplates(false)
  }

  const IconComponent = ({ iconName }: { iconName: string }) => {
    const icon = availableIcons.find(i => i.id === iconName)
    return icon ? <>{icon.icon}</> : <Bot />
  }

  return (
    <div className="absolute inset-0 top-20 overflow-y-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Roles & Permissions</h1>
          <p className="text-gray-300">Define roles, assign permissions, and manage your team structure</p>
        </div>
        <button
          onClick={() => setShowCreateRoleForm(true)}
          className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 px-6 py-3 rounded-xl flex items-center space-x-3 text-white shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-blue-400/50 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <IconComponent iconName={role.icon} />
                <h3 className="text-lg font-semibold text-white">{role.name}</h3>
              </div>
              <div className="text-xs text-gray-400 capitalize">{role.automationType}</div>
            </div>
            <p className="text-gray-300 text-sm mb-4 h-16 overflow-hidden">{role.description}</p>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map(p => (
                  <span key={p} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-full">{p}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => { setSelectedRole(role); setShowAddMemberForm(true) }}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Add Member
              </button>
              <button 
                onClick={() => { setSelectedRole(role); setShowRoleDetail(true) }}
                className="text-gray-400 hover:text-white text-sm"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
