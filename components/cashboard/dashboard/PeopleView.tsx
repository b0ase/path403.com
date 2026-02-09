'use client'

import React, { useState } from 'react'
import { Plus, X, FileText } from 'lucide-react'
import type { Organization, HandCashHandle, KYCDocument, PeopleViewProps } from '@/components/cashboard/dashboard.types'

export default function PeopleView({ organizations, selectedOrganization, onUpdateShareAllocation }: PeopleViewProps) {
  const [selectedMember, setSelectedMember] = useState<HandCashHandle | null>(null)
  const [showMemberProfile, setShowMemberProfile] = useState(false)
  const [editingMember, setEditingMember] = useState<HandCashHandle | null>(null)
  const [showKYCUpload, setShowKYCUpload] = useState(false)
  const [showCreateMemberForm, setShowCreateMemberForm] = useState(false)
  const [showMemberTemplates, setShowMemberTemplates] = useState(false)
  const [selectedMemberCategory, setSelectedMemberCategory] = useState('All')
  const [memberFormData, setMemberFormData] = useState({
    handle: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
    publicAddress: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    memberType: 'employee' as 'employee' | 'customer' | 'supplier' | 'contractor' | 'advisor' | 'investor' | 'partner' | 'other',
    organizationId: selectedOrganization || ''
  })
  const [newKYCDoc, setNewKYCDoc] = useState({
    type: 'passport' as KYCDocument['type'],
    name: '',
    notes: ''
  })

  const currentOrg = organizations.find((org: Organization) => org.id === selectedOrganization)

  const openMemberProfile = (member: HandCashHandle) => {
    setSelectedMember(member)
    setEditingMember({ ...member })
    setShowMemberProfile(true)
  }

  const getKYCStatusColor = (status: HandCashHandle['kycStatus']) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'not_started': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status: HandCashHandle['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      case 'pending': return 'bg-yellow-500'
    }
  }

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const memberTemplates = [
    { id: '1', name: 'CEO/Founder', category: 'Employee', type: 'employee' as const, description: 'Chief Executive Officer', handle: 'ceo', firstName: 'John', lastName: 'Smith', email: 'ceo@company.com', phone: '+1-555-0001' },
    { id: '2', name: 'CTO/Tech Lead', category: 'Employee', type: 'employee' as const, description: 'Chief Technology Officer', handle: 'cto', firstName: 'Jane', lastName: 'Doe', email: 'cto@company.com', phone: '+1-555-0002' },
    { id: '3', name: 'Investor', category: 'Investor', type: 'investor' as const, description: 'Angel Investor', handle: 'angel', firstName: 'Michael', lastName: 'Johnson', email: 'michael@investor.com', phone: '+1-555-0003' },
    { id: '4', name: 'Advisor', category: 'Advisor', type: 'advisor' as const, description: 'Business Advisor', handle: 'advisor', firstName: 'Lisa', lastName: 'Brown', email: 'lisa@advisor.com', phone: '+1-555-0004' },
  ]

  const memberCategories = ['All', 'Employee', 'Investor', 'Advisor', 'Customer', 'Supplier', 'Contractor', 'Partner']

  const applyMemberTemplate = (template: typeof memberTemplates[0]) => {
    setMemberFormData({
      ...memberFormData,
      handle: template.handle,
      firstName: template.firstName,
      lastName: template.lastName,
      email: template.email,
      phone: template.phone,
      memberType: template.type,
    })
    setShowMemberTemplates(false)
  }

  const handleCreateMember = () => {
    console.log('Creating member:', memberFormData)
    setShowCreateMemberForm(false)
  }

  const filteredMemberTemplates = selectedMemberCategory === 'All' 
    ? memberTemplates 
    : memberTemplates.filter(template => template.category === selectedMemberCategory)

  return (
    <div className="absolute inset-0 top-24 overflow-y-auto px-6 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">People</h1>
            <p className="text-gray-300">Manage team members, KYC status, and share allocations</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMemberCategory}
              onChange={(e) => setSelectedMemberCategory(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {memberCategories.map((category) => (
                <option key={category} value={category} className="bg-gray-800">
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateMemberForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Member</span>
            </button>
          </div>
        </div>

        {/* People Grid */}
        <div className="mb-4">
          <p className="text-gray-400 text-sm">
            Showing {currentOrg?.members?.length || 0} members • 
            {currentOrg?.members?.filter(m => m.kycStatus === 'approved').length || 0} verified • 
            {currentOrg?.members?.filter(m => m.kycStatus === 'pending').length || 0} pending
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentOrg?.members?.map((member: HandCashHandle) => (
            <div key={member.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.firstName?.[0]}{member.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{member.displayName}</h3>
                    <p className="text-sm text-gray-400">{member.handle}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getKYCStatusColor(member.kycStatus)}`}>
                  {member.kycStatus === 'approved' ? '✓' : member.kycStatus === 'pending' ? '⏳' : member.kycStatus === 'rejected' ? '✗' : '○'}
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Role:</p>
                  <p className="text-sm text-white font-medium">{member.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email:</p>
                  <p className="text-sm text-white">{member.email}</p>
                </div>
                {member.publicAddress && (
                  <div>
                    <p className="text-xs text-gray-400">Address:</p>
                    <p className="text-sm text-white font-mono">{member.publicAddress.slice(0, 8)}...</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Last Active:</p>
                  <p className="text-sm text-white">{formatLastActive(member.lastActive)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Share Allocation:</p>
                  <p className="text-sm text-white font-medium">{member.shareAllocation}%</p>
                </div>
              </div>
              
              <button
                onClick={() => openMemberProfile(member)}
                className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Click to view profile →
              </button>
            </div>
          ))}
        </div>

        {/* Member Profile Modal */}
        {showMemberProfile && selectedMember && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">{selectedMember.displayName} Profile</h3>
                <button
                  onClick={() => setShowMemberProfile(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="text-white">{selectedMember.firstName} {selectedMember.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Handle</p>
                      <p className="text-white font-mono">{selectedMember.handle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{selectedMember.email}</p>
                    </div>
                    {selectedMember.phone && (
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <p className="text-white">{selectedMember.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-400">Role</p>
                      <p className="text-white">{selectedMember.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Share Allocation</p>
                      <p className="text-white">{selectedMember.shareAllocation}%</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Status & Verification</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-400">KYC Status</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getKYCStatusColor(selectedMember.kycStatus)}`}>
                        {selectedMember.kycStatus === 'approved' ? '✓ Approved' : 
                         selectedMember.kycStatus === 'pending' ? '⏳ Pending' : 
                         selectedMember.kycStatus === 'rejected' ? '✗ Rejected' : 
                         '○ Not Started'}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Account Status</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMember.status)}`}>
                        {selectedMember.status === 'active' ? 'Active' : 
                         selectedMember.status === 'pending' ? 'Pending' : 
                         'Inactive'}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Joined</p>
                      <p className="text-white">{formatLastActive(selectedMember.joinedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Active</p>
                      <p className="text-white">{formatLastActive(selectedMember.lastActive)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedMember.kycDocuments && selectedMember.kycDocuments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-white mb-3">KYC Documents</h4>
                  <div className="space-y-2">
                    {selectedMember.kycDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-400">{doc.type}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {doc.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  )
}
