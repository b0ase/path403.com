'use client'

import React, { useState } from 'react'
import { Plus, X, Building2 } from 'lucide-react'
import type { Organization, OrganizationsViewProps } from '@/components/cashboard/dashboard.types'

export default function OrganizationsView({ 
  organizations, 
  selectedOrganization, 
  onSelectOrganization, 
  onDeselectOrganization,
  onCreateOrganization 
}: OrganizationsViewProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    tokenSymbol: '',
    businessType: 'corporation' as 'corporation' | 'llc' | 'partnership' | 'nonprofit' | 'charity' | 'sole_proprietorship' | 'cooperative' | 'other',
    jurisdiction: 'US' as 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'SG' | 'HK' | 'other',
    industry: '',
    size: 'small' as 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  })

  const handleCreate = () => {
    if (formData.name && formData.description && formData.tokenSymbol) {
      onCreateOrganization(formData.name, formData.description, formData.tokenSymbol)
      setFormData({ 
        name: '', 
        description: '', 
        tokenSymbol: '',
        businessType: 'corporation',
        jurisdiction: 'US',
        industry: '',
        size: 'small'
      })
      setShowCreateForm(false)
    }
  }

  const handleOrganizationClick = (orgId: string) => {
    if (selectedOrganization === orgId) {
      onDeselectOrganization()
    } else {
      onSelectOrganization(orgId)
    }
  }

  const organizationTemplates = [
    { id: '1', name: 'Technology Corporation', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Technology', size: 'medium', description: 'Software development and technology services company', tokenSymbol: 'TECH', icon: '🏢' },
    { id: '2', name: 'Manufacturing Corp', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Manufacturing', size: 'large', description: 'Industrial manufacturing and production company', tokenSymbol: 'MANU', icon: '🏭' },
    { id: '3', name: 'Financial Services Inc', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Financial Services', size: 'enterprise', description: 'Banking and financial services corporation', tokenSymbol: 'FINS', icon: '🏦' },
    { id: '4', name: 'Healthcare Systems Corp', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Healthcare', size: 'large', description: 'Healthcare services and medical technology', tokenSymbol: 'HLTH', icon: '🏥' },
    { id: '5', name: 'Creative Studio LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Creative Services', size: 'small', description: 'Creative design and marketing agency', tokenSymbol: 'CRTV', icon: '🎨' },
    { id: '6', name: 'Real Estate Holdings LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Real Estate', size: 'medium', description: 'Property investment and management company', tokenSymbol: 'REAL', icon: '🏠' },
    { id: '7', name: 'Consulting Group LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Consulting', size: 'small', description: 'Business strategy and management consulting', tokenSymbol: 'CONS', icon: '💼' },
    { id: '8', name: 'Food & Beverage LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Food & Beverage', size: 'medium', description: 'Restaurant and food service operations', tokenSymbol: 'FOOD', icon: '🍽️' },
    { id: '9', name: 'Innovation Labs Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Research & Development', size: 'medium', description: 'R&D and innovation services company', tokenSymbol: 'INNO', icon: '🔬' },
    { id: '10', name: 'Digital Marketing Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Marketing', size: 'small', description: 'Digital marketing and advertising agency', tokenSymbol: 'DIGI', icon: '📱' },
    { id: '11', name: 'Logistics Solutions Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Logistics', size: 'large', description: 'Supply chain and logistics management', tokenSymbol: 'LOGI', icon: '🚛' },
    { id: '12', name: 'Green Energy Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Energy', size: 'medium', description: 'Renewable energy solutions provider', tokenSymbol: 'GREN', icon: '🌱' },
    { id: '13', name: 'Education Foundation', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Education', size: 'medium', description: 'Educational programs and scholarship foundation', tokenSymbol: 'EDUC', icon: '📚' },
    { id: '14', name: 'Environmental Alliance', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Environmental', size: 'large', description: 'Environmental conservation and advocacy organization', tokenSymbol: 'ENVR', icon: '🌍' },
    { id: '15', name: 'Community Health Network', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Healthcare', size: 'large', description: 'Community healthcare services and clinics', tokenSymbol: 'COMM', icon: '🏥' },
    { id: '16', name: 'Arts & Culture Society', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Arts & Culture', size: 'medium', description: 'Arts education and cultural preservation', tokenSymbol: 'ARTS', icon: '🎭' },
    { id: '17', name: 'Children\'s Welfare Charity', category: 'Charity', businessType: 'charity', jurisdiction: 'UK', industry: 'Social Services', size: 'large', description: 'Child welfare and family support services', tokenSymbol: 'CHLD', icon: '👶' },
    { id: '18', name: 'Food Bank Network', category: 'Charity', businessType: 'charity', jurisdiction: 'US', industry: 'Social Services', size: 'medium', description: 'Food distribution and hunger relief', tokenSymbol: 'FOOD', icon: '🍞' },
    { id: '19', name: 'Animal Rescue Foundation', category: 'Charity', businessType: 'charity', jurisdiction: 'CA', industry: 'Animal Welfare', size: 'medium', description: 'Animal rescue and rehabilitation services', tokenSymbol: 'ANIM', icon: '🐕' },
    { id: '20', name: 'Disaster Relief Fund', category: 'Charity', businessType: 'charity', jurisdiction: 'US', industry: 'Emergency Services', size: 'large', description: 'Emergency response and disaster relief', tokenSymbol: 'EMER', icon: '🚨' },
    { id: '21', name: 'Local Coffee Shop', category: 'Small Business', businessType: 'sole_proprietorship', jurisdiction: 'US', industry: 'Food & Beverage', size: 'startup', description: 'Neighborhood coffee shop and bakery', tokenSymbol: 'CAFE', icon: '☕' },
    { id: '22', name: 'Handcraft Store', category: 'Small Business', businessType: 'sole_proprietorship', jurisdiction: 'US', industry: 'Retail', size: 'startup', description: 'Handmade crafts and artisan goods', tokenSymbol: 'CRFT', icon: '🧶' },
    { id: '23', name: 'Auto Repair Shop', category: 'Small Business', businessType: 'llc', jurisdiction: 'US', industry: 'Automotive', size: 'small', description: 'Automotive repair and maintenance services', tokenSymbol: 'AUTO', icon: '🔧' },
    { id: '24', name: 'Fitness Studio', category: 'Small Business', businessType: 'llc', jurisdiction: 'US', industry: 'Health & Fitness', size: 'small', description: 'Personal training and fitness classes', tokenSymbol: 'FIT', icon: '💪' },
    { id: '25', name: 'Legal Partnership', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Legal Services', size: 'medium', description: 'Law firm partnership specializing in corporate law', tokenSymbol: 'LAW', icon: '⚖️' },
    { id: '26', name: 'Medical Practice', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Healthcare', size: 'medium', description: 'Multi-physician medical practice', tokenSymbol: 'MED', icon: '👩‍⚕️' },
    { id: '27', name: 'Accounting Firm', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Professional Services', size: 'medium', description: 'CPA firm providing accounting services', tokenSymbol: 'CPA', icon: '📊' },
    { id: '28', name: 'Architecture Studio', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Architecture', size: 'small', description: 'Architectural design and planning services', tokenSymbol: 'ARCH', icon: '🏗️' },
    { id: '29', name: 'Farmers Cooperative', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Agriculture', size: 'large', description: 'Agricultural cooperative for local farmers', tokenSymbol: 'FARM', icon: '🚜' },
    { id: '30', name: 'Workers Cooperative', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Manufacturing', size: 'medium', description: 'Worker-owned manufacturing cooperative', tokenSymbol: 'WORK', icon: '👷' },
    { id: '31', name: 'Housing Cooperative', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Real Estate', size: 'large', description: 'Residential housing cooperative', tokenSymbol: 'HOME', icon: '🏘️' },
    { id: '32', name: 'Credit Union', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Financial Services', size: 'large', description: 'Member-owned financial cooperative', tokenSymbol: 'CRED', icon: '🏛️' },
    { id: '33', name: 'Global Trading Pty Ltd', category: 'International', businessType: 'corporation', jurisdiction: 'AU', industry: 'Import/Export', size: 'large', description: 'International trade and export company', tokenSymbol: 'TRAD', icon: '🌏' },
    { id: '34', name: 'European Consulting GmbH', category: 'International', businessType: 'corporation', jurisdiction: 'DE', industry: 'Consulting', size: 'medium', description: 'Management consulting across Europe', tokenSymbol: 'EURO', icon: '🇪🇺' },
    { id: '35', name: 'Asian Holdings Pte Ltd', category: 'International', businessType: 'corporation', jurisdiction: 'SG', industry: 'Investment', size: 'large', description: 'Investment holding company in Asia', tokenSymbol: 'ASIA', icon: '🏙️' },
    { id: '36', name: 'French Innovation SARL', category: 'International', businessType: 'corporation', jurisdiction: 'FR', industry: 'Technology', size: 'medium', description: 'French technology innovation company', tokenSymbol: 'FRIN', icon: '🇫🇷' }
  ]

  const organizationCategories = ['All', 'Corporation', 'LLC', 'LTD', 'Non-Profit', 'Charity', 'Small Business', 'Partnership', 'Cooperative', 'International']

  const getBusinessTypeSuffix = (businessType: string, jurisdiction: string) => {
    switch (businessType) {
      case 'llc':
        return jurisdiction === 'US' ? 'LLC' : 'Ltd'
      case 'corporation':
        if (jurisdiction === 'US') return 'Inc.'
        if (jurisdiction === 'UK') return 'Ltd'
        if (jurisdiction === 'CA') return 'Corp.'
        if (jurisdiction === 'AU') return 'Pty Ltd'
        if (jurisdiction === 'DE') return 'GmbH'
        if (jurisdiction === 'FR') return 'SARL'
        if (jurisdiction === 'SG') return 'Pte Ltd'
        if (jurisdiction === 'HK') return 'Limited'
        return 'Corp.'
      case 'partnership':
        return 'LLP'
      case 'nonprofit':
        return 'Foundation'
      case 'charity':
        return 'Charity'
      case 'cooperative':
        return 'Co-op'
      default:
        return ''
    }
  }

  const applyOrganizationTemplate = (template: typeof organizationTemplates[0]) => {
    const suffix = getBusinessTypeSuffix(template.businessType, template.jurisdiction)
    const fullName = suffix ? `${template.name} ${suffix}` : template.name
    
    setFormData({
      name: fullName,
      description: template.description,
      tokenSymbol: template.tokenSymbol,
      businessType: template.businessType as any,
      jurisdiction: template.jurisdiction as any,
      industry: template.industry,
      size: template.size as any
    })
    setShowTemplates(false)
  }

  const filteredOrganizationTemplates = selectedCategory === 'All' 
    ? organizationTemplates 
    : organizationTemplates.filter(template => template.category === selectedCategory)

  return (
    <div className="absolute inset-0 top-20 overflow-y-auto scrollbar-always-visible px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Organizations</h1>
            <p className="text-gray-300">Manage your business organizations and token allocations</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 px-6 py-3 rounded-xl flex items-center space-x-3 text-white shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create Organization</span>
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create New Organization</h2>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {showTemplates ? 'Hide Templates' : 'Use Template'}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {showTemplates && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-medium text-white mb-4">Choose an Organization Template</h4>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {organizationCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                    {filteredOrganizationTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => applyOrganizationTemplate(template)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg p-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-2xl">{template.icon}</div>
                          <div className="flex-1">
                            <h5 className="text-white font-medium text-sm">{template.name}</h5>
                            <p className="text-gray-400 text-xs">{template.jurisdiction} • {template.businessType.toUpperCase()}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-xs line-clamp-2">{template.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-blue-400 text-xs font-mono">{template.tokenSymbol}</span>
                          <span className="text-gray-400 text-xs capitalize">{template.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Acme Corporation Inc."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the organization..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Token Symbol</label>
                    <input
                      type="text"
                      value={formData.tokenSymbol}
                      onChange={(e) => setFormData({ ...formData, tokenSymbol: e.target.value.toUpperCase() })}
                      placeholder="ACME"
                      maxLength={8}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Technology, Healthcare, Finance..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Legal Structure</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="corporation">Corporation</option>
                      <option value="llc">Limited Liability Company (LLC)</option>
                      <option value="partnership">Partnership</option>
                      <option value="nonprofit">Non-Profit Organization</option>
                      <option value="charity">Charity</option>
                      <option value="sole_proprietorship">Sole Proprietorship</option>
                      <option value="cooperative">Cooperative</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jurisdiction</label>
                    <select
                      value={formData.jurisdiction}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="US">🇺🇸 United States</option>
                      <option value="UK">🇬🇧 United Kingdom</option>
                      <option value="CA">🇨🇦 Canada</option>
                      <option value="AU">🇦🇺 Australia</option>
                      <option value="DE">🇩🇪 Germany</option>
                      <option value="FR">🇫🇷 France</option>
                      <option value="SG">🇸🇬 Singapore</option>
                      <option value="HK">🇭🇰 Hong Kong</option>
                      <option value="other">🌍 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="startup">Startup (1-10 employees)</option>
                      <option value="small">Small Business (11-50 employees)</option>
                      <option value="medium">Medium Business (51-250 employees)</option>
                      <option value="large">Large Business (251-1000 employees)</option>
                      <option value="enterprise">Enterprise (1000+ employees)</option>
                    </select>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <h5 className="text-sm font-medium text-white mb-2">Legal Suffix Preview</h5>
                    <p className="text-gray-300 text-sm">
                      {formData.name && (
                        <span>
                          {formData.name}
                          {getBusinessTypeSuffix(formData.businessType, formData.jurisdiction) && 
                            ` ${getBusinessTypeSuffix(formData.businessType, formData.jurisdiction)}`
                          }
                        </span>
                      )}
                      {!formData.name && <span className="text-gray-500">Enter organization name to see preview</span>}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-white/20 mt-6">
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Organization
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Organization Templates</h2>
              <p className="text-gray-400 text-sm">Browse and create organizations from pre-built templates</p>
            </div>
            <div className="text-sm text-gray-400">
              {filteredOrganizationTemplates.length} templates available
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {organizationCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category}
                <span className="ml-2 text-xs opacity-75">
                  ({category === 'All' 
                    ? organizationTemplates.length 
                    : organizationTemplates.filter(t => t.category === category).length})
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-96 overflow-y-auto scrollbar-always-visible">
            {filteredOrganizationTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  applyOrganizationTemplate(template)
                  setShowCreateForm(true)
                }}
                className="bg-black/40 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl group-hover:scale-110 transition-transform">{template.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white font-medium text-sm truncate">{template.name}</h5>
                    <p className="text-gray-400 text-xs">{template.jurisdiction} • {template.businessType.toUpperCase()}</p>
                  </div>
                </div>
                <p className="text-gray-300 text-xs line-clamp-3 mb-3">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-xs font-mono bg-blue-500/10 px-2 py-1 rounded">{template.tokenSymbol}</span>
                  <span className="text-gray-400 text-xs capitalize bg-white/5 px-2 py-1 rounded">{template.size}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{template.industry}</span>
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to create →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrganizationTemplates.length === 0 && (
            <div className="text-center py-12 bg-black/20 rounded-xl border border-white/10">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
              <p className="text-gray-400">Try selecting a different category or clear your filters</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Your Organizations</h2>
              <p className="text-gray-400 text-sm">Manage your existing organizations</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org: Organization) => (
            <div
              key={org.id}
              className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer transition-all hover:shadow-white/5 relative group ${
                selectedOrganization === org.id ? 'ring-2 ring-blue-400 shadow-blue-400/20' : ''
              }`}
              onClick={() => handleOrganizationClick(org.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  org.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  org.status === 'inactive' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {org.status}
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-4">{org.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Token:</span>
                  <span className="text-white font-medium">{org.tokenSymbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Members:</span>
                  <span className="text-white">{org.members.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Shares:</span>
                  <span className="text-white">{org.totalShares.toLocaleString()}</span>
                </div>
              </div>
              
              <div className={`transition-opacity mt-4 pt-3 border-t border-white/10 ${
                selectedOrganization === org.id 
                  ? 'opacity-100' 
                  : 'opacity-0 group-hover:opacity-100'
              }`}>
                <p className={`text-xs text-center ${
                  selectedOrganization === org.id
                    ? 'text-red-400'
                    : 'text-blue-400'
                }`}>
                  {selectedOrganization === org.id
                    ? 'Click to deselect →'
                    : 'Click to select →'
                  }
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
