'use client'

import { useState } from 'react'
import { UserCheck, ShieldIcon, User, CheckCircle, Clock, AlertCircle, Wallet, Link, FileText } from 'lucide-react'

interface IdentityViewProps {
  organizations: any[]
  selectedOrganization: string | null
}

export default function IdentityView({ organizations, selectedOrganization }: IdentityViewProps) {
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerification = async (type: string) => {
    setIsVerifying(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsVerifying(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Identity & KYC</h1>
              <p className="text-gray-400">Identity verification, KYC compliance, and wallet linking</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleVerification('kyc')}
                disabled={isVerifying}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isVerifying ? 'Verifying...' : 'Verify Identity'}
              </button>
            </div>
          </div>
        </div>

        {/* Identity Status Overview */}
        <div className="bg-black/40 border border-white/20 rounded-xl p-6 mb-6">
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
        <div className="bg-black/40 border border-white/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">KYC Level</h3>
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

        {/* Wallet Linking Overview */}
        <div className="bg-black/40 border border-white/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Wallet Identity Linking</h3>
          <p className="text-gray-400 mb-6">Link your wallets to your verified identity for enhanced security</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium mb-3">Linked Wallets</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-5 h-5 text-green-400" />
                    <span className="text-white">HandCash Wallet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Linked</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-5 h-5 text-blue-400" />
                    <span className="text-white">MetaMask Wallet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 text-sm">Linked</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-5 h-5 text-purple-400" />
                    <span className="text-white">Phantom Wallet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm">Linked</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-medium mb-3">Unlinked Wallets</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-5 h-5 text-gray-400" />
                    <span className="text-white">Hardware Wallet</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">Link</button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wallet className="w-5 h-5 text-gray-400" />
                    <span className="text-white">Exchange Wallet</span>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">Link</button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Tip:</strong> Linking wallets to your verified identity provides enhanced security and compliance benefits.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication & Identity Providers */}
        <div className="bg-black/40 border border-white/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">Authentication & Identity Providers</h3>
          <p className="text-gray-400 mb-6">Manage your authentication methods and identity providers</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                  <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4 className="text-white font-medium mb-2">HandCash</h4>
              <p className="text-gray-400 text-sm mb-3">Primary identity provider</p>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  <path d="M8 16c0 2.21 1.79 4 4 4s4-1.79 4-4" fill="none" stroke="#a855f7" strokeWidth="2"/>
                  <circle cx="9" cy="11" r="1" fill="#a855f7"/>
                  <circle cx="15" cy="11" r="1" fill="#a855f7"/>
                </svg>
              </div>
              <h4 className="text-white font-medium mb-2">Phantom</h4>
              <p className="text-gray-400 text-sm mb-3">Secondary identity provider</p>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Connected</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
              <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="text-white font-medium mb-2">Traditional KYC</h4>
              <p className="text-gray-400 text-sm mb-3">Government ID verification</p>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* KYC Verification Steps */}
        <div className="bg-black/40 border border-white/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">KYC Verification Steps</h3>
          <p className="text-gray-400 mb-6">Complete these steps to achieve higher KYC levels</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Basic Identity Verification</h4>
                  <p className="text-gray-300 text-sm">Email, phone, and basic identity check</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 text-sm">Completed</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Document Verification</h4>
                  <p className="text-gray-300 text-sm">Upload government-issued ID and proof of address</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 text-sm">In Progress</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Biometric Verification</h4>
                  <p className="text-gray-300 text-sm">Facial recognition and liveness detection</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Pending</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-500/20 border border-gray-500/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <div>
                  <h4 className="text-white font-medium">Enhanced Due Diligence</h4>
                  <p className="text-gray-300 text-sm">Source of funds and ongoing monitoring</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">Locked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Identity Linking */}
        <div className="bg-black/40 border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Wallet Identity Linking</h3>
          <p className="text-gray-400 mb-6">Link your wallets to your verified identity for enhanced security and compliance</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-white font-medium mb-3">Benefits of Linking</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <ShieldIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm">Enhanced security and fraud protection</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm">Compliance with regulatory requirements</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Link className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm">Seamless cross-wallet operations</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <FileText className="w-5 h-5 text-green-400" />
                  <span className="text-white text-sm">Simplified reporting and auditing</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-white font-medium mb-3">Linking Process</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <span className="text-white text-sm">Verify wallet ownership</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <span className="text-white text-sm">Sign verification message</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <span className="text-white text-sm">Complete identity verification</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <span className="text-white text-sm">Wallet linked to identity</span>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Link New Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
