'use client'

import { useState } from 'react'
import { ShieldIcon, Building2, FileText, CreditCard, UserCheck, CheckCircle, Clock, AlertCircle, Link, Wallet, User, ChevronDown, ChevronRight, Plus, X, Globe, Banknote, Shield, FileCheck } from 'lucide-react'

interface RegistrationViewProps {
  organizations: any[]
  selectedOrganization: string | null
}

interface ServiceConnection {
  id: string
  name: string
  type: 'tax' | 'banking' | 'kyc' | 'compliance'
  status: 'connected' | 'pending' | 'disconnected' | 'error'
  organizationId?: string
  walletId?: string
  lastSync?: string
  nextSync?: string
}

export default function RegistrationView({ organizations, selectedOrganization }: RegistrationViewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOrgForService, setSelectedOrgForService] = useState<string | null>(null)
  const [selectedWallets, setSelectedWallets] = useState<string[]>([])
  const [showOrgSelector, setShowOrgSelector] = useState(false)
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('overview')

  // Mock service connections
  const [serviceConnections, setServiceConnections] = useState<ServiceConnection[]>([
    {
      id: '1',
      name: 'HMRC Tax Authority',
      type: 'tax',
      status: 'pending',
      organizationId: '1',
      lastSync: '2024-01-15T10:00:00Z',
      nextSync: '2024-01-22T10:00:00Z'
    },
    {
      id: '2',
      name: 'Barclays Business Banking',
      type: 'banking',
      status: 'connected',
      organizationId: '1',
      lastSync: '2024-01-20T16:00:00Z',
      nextSync: '2024-01-27T16:00:00Z'
    },
    {
      id: '3',
      name: 'Jumio KYC Verification',
      type: 'kyc',
      status: 'connected',
      organizationId: '1',
      lastSync: '2024-01-18T14:00:00Z',
      nextSync: '2024-01-25T14:00:00Z'
    }
  ])

  const handleSubmit = async (formType: string) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitting(false)
  }

  const connectService = async (serviceType: string, orgId?: string, walletIds?: string[]) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Add new service connection
    const newConnection: ServiceConnection = {
      id: Date.now().toString(),
      name: `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} Service`,
      type: serviceType as any,
      status: 'pending',
      organizationId: orgId,
      walletId: walletIds?.[0],
      lastSync: new Date().toISOString(),
      nextSync: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    setServiceConnections(prev => [...prev, newConnection])
    setIsSubmitting(false)
    setShowOrgSelector(false)
    setShowWalletSelector(false)
    setSelectedOrgForService(null)
    setSelectedWallets([])
  }

  const disconnectService = (serviceId: string) => {
    setServiceConnections(prev => prev.map(conn => 
      conn.id === serviceId ? { ...conn, status: 'disconnected' } : conn
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'disconnected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'error': return 'bg-red-600/20 text-red-500 border-red-600/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'disconnected': return <X className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'tax': return <FileCheck className="w-5 h-5" />
      case 'banking': return <Banknote className="w-5 h-5" />
      case 'kyc': return <Shield className="w-5 h-5" />
      case 'compliance': return <FileText className="w-5 h-5" />
      default: return <Globe className="w-5 h-5" />
    }
  }

  const currentOrg = organizations.find(org => org.id === selectedOrganization)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Register & Connect</h1>
              <p className="text-gray-400">Selectively connect your businesses, wallets, and identity with tax, banking, and KYC services</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowOrgSelector(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Service</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-black/40 rounded-lg p-1">
          {['overview', 'organizations', 'wallets', 'services', 'kyc'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            {/* Connection Status Overview */}
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Connection Status Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Connected Services</h4>
                  <p className="text-green-400 text-sm">{serviceConnections.filter(s => s.status === 'connected').length}</p>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Pending Connections</h4>
                  <p className="text-yellow-400 text-sm">{serviceConnections.filter(s => s.status === 'pending').length}</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <Building2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Organizations</h4>
                  <p className="text-blue-400 text-sm">{organizations.length}</p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <Wallet className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Wallets</h4>
                  <p className="text-purple-400 text-sm">5</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveSection('organizations')}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg p-4 text-left transition-colors"
                >
                  <Building2 className="w-8 h-8 text-blue-400 mb-3" />
                  <h4 className="text-white font-medium mb-2">Manage Organizations</h4>
                  <p className="text-gray-400 text-sm">Connect businesses to services</p>
                </button>
                
                <button
                  onClick={() => setActiveSection('wallets')}
                  className="bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg p-4 text-left transition-colors"
                >
                  <Wallet className="w-8 h-8 text-green-400 mb-3" />
                  <h4 className="text-white font-medium mb-2">Manage Wallets</h4>
                  <p className="text-gray-400 text-sm">Link wallets to identity</p>
                </button>
                
                <button
                  onClick={() => setActiveSection('services')}
                  className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg p-4 text-left transition-colors"
                >
                  <Globe className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="text-white font-medium mb-2">Service Connections</h4>
                  <p className="text-gray-400 text-sm">Manage external integrations</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Organizations Section */}
        {activeSection === 'organizations' && (
          <div className="space-y-6">
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Organization Management</h3>
              <p className="text-gray-400 mb-6">Select which organizations to connect with external services</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.map((org) => (
                  <div key={org.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{org.name}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        org.id === selectedOrganization ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {org.id === selectedOrganization ? 'Selected' : 'Available'}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{org.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Members:</span>
                        <span className="text-white">{org.members?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">{org.status}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => connectService('tax', org.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Connect Tax Services
                      </button>
                      <button
                        onClick={() => connectService('banking', org.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Connect Banking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Wallets Section */}
        {activeSection === 'wallets' && (
          <div className="space-y-6">
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Wallet Management</h3>
              <p className="text-gray-400 mb-6">Select which wallets to link with your verified identity</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: '1', name: 'HandCash Wallet', type: 'handcash', address: '$alice_dev', status: 'linked' },
                  { id: '2', name: 'MetaMask Wallet', type: 'metamask', address: '0x742d35...', status: 'linked' },
                  { id: '3', name: 'Phantom Wallet', type: 'phantom', address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', status: 'linked' },
                  { id: '4', name: 'Hardware Wallet', type: 'hardware', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', status: 'unlinked' },
                  { id: '5', name: 'Exchange Wallet', type: 'exchange', address: 'Binance Account', status: 'unlinked' }
                ].map((wallet) => (
                  <div key={wallet.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{wallet.name}</h4>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        wallet.status === 'linked' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {wallet.status === 'linked' ? 'Linked' : 'Unlinked'}
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3 font-mono">{wallet.address}</p>
                    
                    <div className="space-y-2">
                      {wallet.status === 'linked' ? (
                        <button
                          onClick={() => {/* Handle unlink */}}
                          className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Unlink Wallet
                        </button>
                      ) : (
                        <button
                          onClick={() => {/* Handle link */}}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                        >
                          Link to Identity
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Services Section */}
        {activeSection === 'services' && (
          <div className="space-y-6">
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Service Connections</h3>
              <p className="text-gray-400 mb-6">Manage your connections to external services</p>
              
              <div className="space-y-4">
                {serviceConnections.map((service) => (
                  <div key={service.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          {getServiceIcon(service.type)}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{service.name}</h4>
                          <p className="text-gray-400 text-sm capitalize">{service.type} Service</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(service.status)}
                            <span>{service.status.charAt(0).toUpperCase() + service.status.slice(1)}</span>
                          </div>
                        </div>
                        
                        {service.status === 'connected' && (
                          <button
                            onClick={() => disconnectService(service.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {service.status === 'connected' && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Last Sync:</span>
                            <span className="text-white ml-2">{new Date(service.lastSync!).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Next Sync:</span>
                            <span className="text-white ml-2">{new Date(service.nextSync!).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KYC Section */}
        {activeSection === 'kyc' && (
          <div className="space-y-6">
            {/* Identity Status Overview */}
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Identity Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Identity Verified</h4>
                  <p className="text-green-400 text-sm">Complete</p>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">KYC Level</h4>
                  <p className="text-yellow-400 text-sm">Level 2</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <Link className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Wallets Linked</h4>
                  <p className="text-blue-400 text-sm">3 of 5</p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <ShieldIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="text-white font-medium">Security Score</h4>
                  <p className="text-purple-400 text-sm">85/100</p>
                </div>
              </div>
            </div>

            {/* KYC Level Overview */}
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">KYC Level Progress</h3>
              <p className="text-gray-400 mb-6">Current verification level and requirements for next level</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Level 1 - Basic</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Email verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Phone verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Basic identity check</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Level 2 - Enhanced</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Document verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Address verification</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">Biometric verification</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Level 3 - Advanced</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Enhanced due diligence</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Source of funds</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Ongoing monitoring</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KYC Verification Steps */}
            <div className="bg-black/40 border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">KYC Verification Steps</h3>
              <p className="text-gray-400 mb-6">Complete these steps to achieve higher KYC levels</p>
              
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Basic Identity Verification', description: 'Email, phone, and basic identity check', status: 'completed' },
                  { step: 2, title: 'Document Verification', description: 'Upload government-issued ID and proof of address', status: 'in_progress' },
                  { step: 3, title: 'Biometric Verification', description: 'Facial recognition and liveness detection', status: 'pending' },
                  { step: 4, title: 'Enhanced Due Diligence', description: 'Source of funds and ongoing monitoring', status: 'locked' }
                ].map((step) => (
                  <div key={step.step} className={`flex items-center justify-between p-4 rounded-lg border ${
                    step.status === 'completed' ? 'bg-green-500/20 border-green-500/30' :
                    step.status === 'in_progress' ? 'bg-yellow-500/20 border-yellow-500/30' :
                    'bg-gray-500/20 border-gray-500/30'
                  }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'in_progress' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}>
                        <span className="text-white font-bold">{step.step}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{step.title}</h4>
                        <p className="text-gray-300 text-sm">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {step.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {step.status === 'in_progress' && <Clock className="w-5 h-5 text-yellow-400" />}
                      {step.status === 'pending' && <AlertCircle className="w-5 h-5 text-gray-400" />}
                      {step.status === 'locked' && <AlertCircle className="w-5 h-5 text-gray-400" />}
                      <span className={`text-sm ${
                        step.status === 'completed' ? 'text-green-400' :
                        step.status === 'in_progress' ? 'text-yellow-400' :
                        'text-gray-400'
                      }`}>
                        {step.status === 'completed' ? 'Completed' :
                         step.status === 'in_progress' ? 'In Progress' :
                         step.status === 'pending' ? 'Pending' : 'Locked'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Service Connection Modal */}
        {showOrgSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-white/20 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Connect Service</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Organization</label>
                  <select
                    value={selectedOrgForService || ''}
                    onChange={(e) => setSelectedOrgForService(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">Choose an organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => connectService('tax', selectedOrgForService || undefined)}
                    disabled={!selectedOrgForService || isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Connecting...' : 'Connect Tax'}
                  </button>
                  <button
                    onClick={() => connectService('banking', selectedOrgForService || undefined)}
                    disabled={!selectedOrgForService || isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Connecting...' : 'Connect Banking'}
                  </button>
                </div>
                
                <button
                  onClick={() => setShowOrgSelector(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
