'use client'

import React from 'react'
import {
  Organization,
  Role,
  FinancialInstrument,
  Contract,
  Wallet,
  WorkflowState,
  BusinessType,
  BusinessItem,
} from './types'

export default function BusinessItemSelector({
  type,
  organizations,
  roles,
  instruments,
  contracts,
  wallets,
  workflows,
  onSelect,
}: {
  type: BusinessType
  organizations: Organization[]
  roles: Role[]
  instruments: FinancialInstrument[]
  contracts: Contract[]
  wallets: Wallet[]
  workflows: WorkflowState[]
  onSelect: (item: BusinessItem) => void
}) {
  const dataMap = {
    organization: organizations,
    role: roles,
    instrument: instruments,
    contract: contracts,
    wallet: wallets,
    workflow: workflows,
    'ai-agent': [], // Add actual data if available
    member: [], // Add actual data if available
    integration: [], // Add actual data if available
    contact: [], // Add actual data if available
  }

  const data: BusinessItem[] = dataMap[type] || []

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div
          key={item.id}
          className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
          onClick={() => onSelect(item)}
        >
          <p className="font-semibold text-white">{item.name}</p>
          <p className="text-sm text-gray-400">{item.description}</p>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-gray-400 text-center py-4">
          No {type} items available.
        </p>
      )}
    </div>
  )
}

