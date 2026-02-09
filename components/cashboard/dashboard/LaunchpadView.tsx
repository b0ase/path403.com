'use client'

import React, { useState } from 'react'
import { Building2, FileText, Globe, PieChart, Shield, Coins, CheckCircle, Zap, X } from 'lucide-react'

export default function LaunchpadView() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    organizationName: '',
    tokenSymbol: '',
    tokenName: '',
    totalSupply: '',
    initialPrice: '',
    description: '',
    businessType: 'corporation' as const,
    registrationNumber: '',
    taxId: '',
    incorporationDate: '',
    jurisdiction: '',
    registeredAddress: '',
    website: '',
    email: '',
    phone: '',
    twitter: '',
    linkedin: '',
    telegram: '',
    discord: '',
    publicSale: '',
    teamAllocation: '',
    advisorAllocation: '',
    treasuryReserve: '',
    whitepaper: null as File | null,
    businessPlan: null as File | null,
    complianceDocuments: null as File | null,
    kycCompleted: false,
    amlCompleted: false,
    termsAccepted: false
  })

  const handleInputChange = (field: string, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const handleMintToken = async () => {
    alert(`Token ${formData.tokenSymbol} minting initiated! This would integrate with 1Sat Ordinals schema.`)
  }

  const steps = [
    { id: 1, title: 'Organization Details', icon: Building2 },
    { id: 2, title: 'Business Registration', icon: FileText },
    { id: 3, title: 'Contact & Social', icon: Globe },
    { id: 4, title: 'Token Distribution', icon: PieChart },
    { id: 5, title: 'Legal & Compliance', icon: Shield },
    { id: 6, title: 'Review & Mint', icon: Coins }
  ]

  return (
    <div className="absolute inset-0 top-20 px-6">
      <div className="max-w-full mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Token Launchpad</h1>
          <p className="text-gray-400">Mint your organization's shares as tokens on 1Sat Ordinals schema</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon
              const isActive = step === stepItem.id
              const isCompleted = step > stepItem.id
              
              return (
                <div key={stepItem.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-white/20 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                    }`}>
                      {stepItem.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-px w-12 ${
                      isCompleted ? 'bg-green-500' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}


