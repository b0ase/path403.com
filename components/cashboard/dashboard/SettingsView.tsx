'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import type { ApiKey, SshKey, McpServer } from '@/components/cashboard/dashboard.types'

export default function SettingsView({ 
  apiKeys, 
  sshKeys, 
  mcpServers, 
  onCreateApiKey, 
  onDeleteApiKey, 
  onCreateSshKey, 
  onDeleteSshKey, 
  onCreateMcpServer, 
  onDeleteMcpServer, 
  onToggleMcpServer 
}: {
  apiKeys: ApiKey[]
  sshKeys: SshKey[]
  mcpServers: McpServer[]
  onCreateApiKey: (name: string, permissions: string[]) => void
  onDeleteApiKey: (id: string) => void
  onCreateSshKey: (name: string, publicKey: string) => void
  onDeleteSshKey: (id: string) => void
  onCreateMcpServer: (name: string, url: string, description: string) => void
  onDeleteMcpServer: (id: string) => void
  onToggleMcpServer: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'api-keys' | 'ssh-keys' | 'mcp-servers'>('api-keys')

  const handleCreateApiKey = () => {
    const name = prompt('Enter API key name:')
    if (name) {
      const permissions = prompt('Enter permissions (comma-separated):')?.split(',').map(p => p.trim()) || []
      onCreateApiKey(name, permissions)
    }
  }

  const handleCreateSshKey = () => {
    const name = prompt('Enter SSH key name:')
    const publicKey = prompt('Enter public key:')
    if (name && publicKey) {
      onCreateSshKey(name, publicKey)
    }
  }

  const handleCreateMcpServer = () => {
    const name = prompt('Enter MCP server name:')
    const url = prompt('Enter MCP server URL:')
    const description = prompt('Enter description:') || ''
    if (name && url) {
      onCreateMcpServer(name, url, description)
    }
  }

  return (
    <div className="absolute inset-0 top-20 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300">Manage your API keys, SSH keys, and MCP servers</p>
        </div>
    </div>
  )
}
