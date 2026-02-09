'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import WorkflowReactFlowCanvas from '@/components/cashboard/WorkflowReactFlowCanvas'
import WorkflowDashboard from '@/components/cashboard/WorkflowDashboard'
import { HandCashAuthButton, UserProfileCard } from '@/components/cashboard/HandCashAuth'
import WalletsView from '@/components/cashboard/dashboard/WalletsView'
import ExchangesView from '@/components/cashboard/dashboard/ExchangesView'
import RegistrationView from '@/components/cashboard/dashboard/RegistrationView'
import IdentityView from '@/components/cashboard/dashboard/IdentityView'
// import AgentsView from '@/components/cashboard/dashboard/AgentsView'
import { useAuth } from '@/components/Providers'
import { useColorTheme } from '@/components/ThemePicker'
import {
  getOrganizationTemplates,
  getRoleTemplates,
  getAgentTemplates,
  getInstrumentTemplates,
  getContractTemplates,
  getIntegrationTemplates,
  getWalletTemplates
} from '@/data/cashboard/templates'
import { getBitcoinCorpWorkflow, getBitcoinWriterWorkflow, getBitcoinDriveSubWorkflow, getBitcoinEmailSubWorkflow, getBitcoinOSSubWorkflow } from '@/data/cashboard/bitcoinCorpWorkflow'
import {
  Menu,
  X,
  DollarSign,
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  Zap,
  Play,
  Pause,
  ArrowRight,
  Building2,
  Crown,
  Coins,
  Bot,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Send,
  Maximize2,

  Plus,
  UserPlus,
  TrendingUp,
  BarChart3,
  Palette,
  Shield,
  ShieldIcon,
  CreditCard,
  Settings,
  Scale,
  Circle,
  Building,
  PlayCircle,
  User,
  Wallet,
  Bitcoin,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,

  Package,
  Home,
  // New icons for enhanced canvas
  PieChart,
  Monitor,
  Cog,
  Globe,
  Database,
  GitBranch,
  Link,
  Mail,
  MessageSquare,
  Bell,
  CheckSquare,
  Eye,
  Clock,
  Hash,
  Calculator,
  Shuffle,
  Layers,
  Filter,
  ArrowUpDown,
  Merge,
  Split,
  Router,
  Server,
  Code,
  Terminal,
  ShoppingCart,
  MousePointer,
  Hand,
  Trash2,
  Copy,
  Clipboard,
  Grid,

  ZoomIn,
  ZoomOut,
  UserCheck,
  Banknote,
  Plug,
  Headphones,
  Folder,
  MoreVertical,
  FolderPlus,
  FolderMinus,
  Rocket
} from 'lucide-react'
import DemoModal from '@/components/cashboard/DemoModal'

// EXAMPLE Business Workflow Definition
const getExampleBusinessWorkflow = () => ({
  nodes: [
    // === TOP TIER: REVENUE SOURCES (PYRAMID BASE) ===
    { id: 1, name: 'Music Track Streaming', type: 'youtube', x: 100, y: 100, handcashHandle: 'AUDEX_Streaming' },
    { id: 2, name: 'YouTube Ad Revenue', type: 'youtube', x: 300, y: 100, handcashHandle: 'AUDEX_YouTube' },
    { id: 3, name: 'Spotify Royalties', type: 'payment', x: 500, y: 100, handcashHandle: 'AUDEX_Spotify' },
    { id: 4, name: 'Platform Subscriptions', type: 'payment', x: 700, y: 100, handcashHandle: 'AUDEX_Subs' },
    { id: 5, name: 'NFT Music Sales', type: 'instrument', x: 900, y: 100, handcashHandle: 'AUDEX_NFTs' },

    // === SECOND TIER: REVENUE AGGREGATION ===
    { id: 10, name: 'AUDEX Revenue Pool', type: 'splitter', x: 500, y: 250, handcashHandle: 'AUDEX_Revenue' },

    // === THIRD TIER: CORPORATE DISTRIBUTION ===
    { id: 15, name: 'AUDEX Treasury (51%)', type: 'organization', x: 300, y: 400, handcashHandle: 'AUDEX_Treasury' },
    { id: 16, name: 'Artist Royalty Pool (35%)', type: 'member', x: 500, y: 400, handcashHandle: 'AUDEX_Artists' },
    { id: 17, name: 'Operations Reserve (10%)', type: 'workflow', x: 700, y: 400, handcashHandle: 'AUDEX_Ops' },
    { id: 18, name: 'Platform Development (4%)', type: 'trigger', x: 900, y: 400, handcashHandle: 'AUDEX_Dev' },

    // === FOURTH TIER: TOKEN MANAGEMENT ===
    { id: 20, name: 'AUDEX Token Contract', type: 'contract', x: 500, y: 550, handcashHandle: 'AUDEX_Tokens' },

    // === FIFTH TIER: DIVIDEND CALCULATION ===
    { id: 30, name: 'Quarterly Dividend Calculator', type: 'decision', x: 500, y: 700, handcashHandle: 'AUDEX_Dividends' },

    // === BOTTOM TIER: SHAREHOLDER DISTRIBUTION (PYRAMID TOP) ===
    { id: 21, name: 'Treasury Tokens (51%)', type: 'wallets', x: 200, y: 850, handcashHandle: 'AUDEX_Treasury_Tokens' },
    { id: 22, name: 'Public Shareholders (35%)', type: 'member', x: 400, y: 850, handcashHandle: 'AUDEX_Public' },
    { id: 23, name: 'Artist Token Holders (10%)', type: 'member', x: 600, y: 850, handcashHandle: 'AUDEX_Artist_Tokens' },
    { id: 24, name: 'Team & Advisors (4%)', type: 'role', x: 800, y: 850, handcashHandle: 'AUDEX_Team' },

    // === SIDE BRANCH: INDIVIDUAL TRACK ASSETS ===
    { id: 40, name: 'Track NFT #001', type: 'instrument', x: 1100, y: 250, handcashHandle: 'AUDEX_Track001' },
    { id: 41, name: 'Track Royalty Split', type: 'splitter', x: 1100, y: 400, handcashHandle: 'AUDEX_TrackSplit' },
    { id: 42, name: 'Track Shareholders', type: 'member', x: 1100, y: 550, handcashHandle: 'AUDEX_TrackHolders' },

    // === SIDE BRANCH: PLATFORM ASSETS ===
    { id: 50, name: 'AUDEX Platform IP', type: 'contract', x: 100, y: 550, handcashHandle: 'AUDEX_Platform' },
    { id: 51, name: 'User Database', type: 'workflow', x: 100, y: 700, handcashHandle: 'AUDEX_Users' },
    { id: 52, name: 'Music Catalog Rights', type: 'instrument', x: 100, y: 850, handcashHandle: 'AUDEX_Catalog' }
  ],
  connections: [
    // PYRAMID FLOW: Revenue sources to main pool (Tier 1 → Tier 2)
    { from: 1, to: 10, type: 'payment' },
    { from: 2, to: 10, type: 'payment' },
    { from: 3, to: 10, type: 'payment' },
    { from: 4, to: 10, type: 'payment' },
    { from: 5, to: 10, type: 'payment' },

    // Main pool to corporate distribution (Tier 2 → Tier 3)
    { from: 10, to: 15, type: 'payment' },
    { from: 10, to: 16, type: 'payment' },
    { from: 10, to: 17, type: 'payment' },
    { from: 10, to: 18, type: 'payment' },

    // Corporate distribution to token contract (Tier 3 → Tier 4)
    { from: 15, to: 20, type: 'payment' },
    { from: 16, to: 20, type: 'payment' },

    // Token contract to dividend calculator (Tier 4 → Tier 5)
    { from: 20, to: 30, type: 'payment' },

    // Dividend calculator to shareholders (Tier 5 → Tier 6)
    { from: 30, to: 21, type: 'payment' },
    { from: 30, to: 22, type: 'payment' },
    { from: 30, to: 23, type: 'payment' },
    { from: 30, to: 24, type: 'payment' },

    // SIDE BRANCH: Individual track flows
    { from: 1, to: 40, type: 'payment' },
    { from: 40, to: 41, type: 'payment' },
    { from: 41, to: 42, type: 'payment' },

    // SIDE BRANCH: Platform asset connections
    { from: 4, to: 50, type: 'payment' },
    { from: 50, to: 51, type: 'payment' },
    { from: 51, to: 52, type: 'payment' }
  ]
})

interface HandCashHandle {
  id: string
  handle: string
  displayName: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  profileImage?: string
  tokenAddress?: string
  publicAddress?: string
  walletType?: string // Added missing property
  shareAllocation: number
  role: string
  organizationId: string
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started'
  kycDocuments: KYCDocument[]
  dateOfBirth?: string
  nationality?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  joinedAt: string
  lastActive?: string
  status: 'active' | 'inactive' | 'pending'
}

interface KYCDocument {
  id: string
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement' | 'other'
  name: string
  url?: string
  uploadedAt: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

interface Contract {
  id: string
  name: string
  type: 'employment' | 'service' | 'partnership' | 'licensing' | 'nda' | 'consulting' | 'vendor' | 'lease' | 'loan' | 'investment' | 'supply' | 'distribution' | 'franchise' | 'joint_venture' | 'merger' | 'acquisition' | 'other'
  description: string
  parties: string[]
  value?: number
  currency?: string
  startDate: string
  endDate?: string
  status: 'draft' | 'pending_review' | 'pending_signature' | 'active' | 'completed' | 'terminated' | 'expired'
  organizationId?: string
  terms: ContractTerm[]
  documents: ContractDocument[]
  createdAt: string
  updatedAt: string
  createdBy: string
  lastModifiedBy: string
  // Workflow Components
  workflowId?: string
  workflow?: {
    id: string
    name: string
    description: string
    organizations: string[] // Organization IDs involved in this contract
    roles: string[] // Role IDs assigned to this contract
    members: string[] // Member IDs participating in this contract
    instruments: string[] // Financial instrument IDs related to this contract
    integrations: ContractIntegration[]
    automations: ContractAutomation[]
    milestones: ContractMilestone[]
    notifications: ContractNotification[]
  }
}

interface ContractIntegration {
  id: string
  type: 'api' | 'webhook' | 'email' | 'sms' | 'blockchain' | 'payment' | 'document_signing' | 'crm' | 'accounting' | 'other'
  name: string
  description: string
  endpoint?: string
  apiKey?: string
  isActive: boolean
  triggerEvents: ('contract_created' | 'contract_signed' | 'milestone_reached' | 'payment_due' | 'contract_expired' | 'other')[]
  configuration: Record<string, unknown>
}

interface ContractAutomation {
  id: string
  name: string
  description: string
  trigger: {
    type: 'date' | 'milestone' | 'signature' | 'payment' | 'other'
    condition: string
    value?: string
  }
  action: {
    type: 'send_notification' | 'create_task' | 'update_status' | 'send_payment' | 'generate_document' | 'other'
    parameters: Record<string, unknown>
  }
  isActive: boolean
}

interface ContractMilestone {
  id: string
  name: string
  description: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  assignedTo: string[] // Member IDs
  deliverables: string[]
  paymentAmount?: number
  currency?: string
}

interface ContractNotification {
  id: string
  type: 'email' | 'sms' | 'in_app' | 'webhook'
  recipients: string[] // Member IDs or email addresses
  subject: string
  message: string
  triggerEvent: string
  isActive: boolean
}

interface ContractTerm {
  id: string
  title: string
  content: string
  category: 'payment' | 'delivery' | 'performance' | 'termination' | 'liability' | 'intellectual_property' | 'confidentiality' | 'dispute_resolution' | 'other'
  isRequired: boolean
  order: number
}

interface ContractDocument {
  id: string
  name: string
  type: 'contract' | 'amendment' | 'addendum' | 'exhibit' | 'signature_page' | 'other'
  url?: string
  uploadedAt: string
  uploadedBy: string
  version: number
  isActive: boolean
}

interface ContractsViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
  roles?: Role[]
  instruments?: FinancialInstrument[]
  workflows?: WorkflowState[]
  onCreateContract?: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void
}

interface Wallet {
  id: string
  name: string
  type: 'bitcoin' | 'ethereum' | 'bsv' | 'handcash' | 'metamask' | 'hardware' | 'paper' | 'multi_sig' | 'other'
  address: string
  balance: number
  currency: string
  isActive: boolean
  organizationId?: string
  description?: string
  publicKey?: string
  encryptedPrivateKey?: string
  derivationPath?: string
  network: 'mainnet' | 'testnet' | 'regtest'
  transactions: WalletTransaction[]
  metadata: {
    isWatchOnly?: boolean
    isMultiSig?: boolean
    requiredSignatures?: number
    totalSigners?: number
    hdWallet?: boolean
    seedPhrase?: boolean
    hardware?: {
      device: string
      model: string
    }
  }
  createdAt: string
  updatedAt: string
  lastSyncAt?: string
}

interface WalletTransaction {
  id: string
  txHash: string
  type: 'incoming' | 'outgoing' | 'internal'
  amount: number
  currency: string
  fromAddress?: string
  toAddress?: string
  status: 'pending' | 'confirmed' | 'failed'
  confirmations: number
  blockHeight?: number
  timestamp: string
  fee?: number
  description?: string
  tags?: string[]
}

interface WalletsViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
}

interface Organization {
  id: string
  name: string
  description: string
  tokenSymbol: string
  tokenAddress?: string
  totalShares: number
  members: HandCashHandle[]
  createdAt: string
  status: 'active' | 'inactive' | 'pending'
}

interface Role {
  id: string
  name: string
  description: string
  icon: string
  permissions: string[]
  defaultShareAllocation: number
  automationType?: 'ai-agent' | 'workflow' | 'hybrid'
  isAutomated?: boolean
  workflowId?: string | null
  aiPrompt?: string
  organizationId?: string
}

interface WorkflowNode {
  id: string
  type: 'payment' | 'contract' | 'task' | 'decision' | 'milestone' | 'team' | 'kpi' | 'employee' | 'deliverable' | 'asset' | 'mint' | 'payroll' | 'production' | 'marketing' | 'sales' | 'legal' | 'finance' | 'hr' | 'it' | 'operations' | 'api' | 'database' | 'loop' | 'condition' | 'trigger' | 'webhook' | 'email' | 'sms' | 'notification' | 'approval' | 'review' | 'timer' | 'counter' | 'calculator' | 'transformer' | 'validator' | 'aggregator' | 'filter' | 'sorter' | 'merger' | 'splitter' | 'gateway' | 'service' | 'function' | 'script' | 'organization' | 'role' | 'member' | 'instrument' | 'integration' | 'switch' | 'router' | 'delay' | 'queue' | 'batch' | 'parallel' | 'sequence' | 'retry' | 'ai-agent' | 'instagram' | 'snapchat' | 'threads' | 'twitter' | 'facebook' | 'linkedin' | 'tiktok' | 'youtube' | 'discord' | 'telegram' | 'whatsapp' | 'reddit' | 'voice' | 'elevenlabs' | 'midjourney' | 'veo3' | 'openai' | 'anthropic' | 'stability' | 'runway' | 'replicate' | 'huggingface' | 'cohere' | 'perplexity' | 'salesforce' | 'hubspot' | 'pipedrive' | 'googlesheets' | 'excel' | 'airtable' | 'notion' | 'stripe' | 'paypal' | 'square' | 'slack' | 'teams' | 'zoom' | 'wallets' | 'workflow' | 'contact'
  name: string
  description: string
  x: number
  y: number
  status: 'pending' | 'active' | 'completed' | 'failed' | 'paused'
  amount?: number
  deadline?: string
  assignees?: string[]
  conditions?: string[]
  connections: string[]
  metadata?: Record<string, unknown>
  isExpanded?: boolean
  // Business entity references
  organizationRef?: string  // ID of linked organization
  roleRef?: string         // ID of linked role
  memberRef?: string       // ID of linked member
  instrumentRef?: string   // ID of linked instrument
  integrationRef?: string  // ID of linked integration
  contractRef?: string     // ID of linked contract
  walletRef?: string       // ID of linked wallet
  workflowRef?: string     // ID of linked workflow
  childNodes?: WorkflowNode[]
  memberCount?: number
  width?: number
  height?: number
  isSelected?: boolean
}

interface Connection {
  id: string
  from: string
  to: string
  type: 'success' | 'failure' | 'conditional' | 'payment' | 'task' | 'data' | 'service' | 'workflow' | 'organization' | 'role' | 'member' | 'instrument' | 'integration' | 'contract' | 'wallet' | 'control' | 'trigger' | 'decision' | 'milestone' | 'team' | 'kpi' | 'employee' | 'deliverable' | 'asset' | 'mint' | 'payroll' | 'production' | 'marketing' | 'sales' | 'legal' | 'finance' | 'hr' | 'it' | 'operations' | 'api' | 'database' | 'loop' | 'condition' | 'webhook' | 'email' | 'sms' | 'notification' | 'approval' | 'review' | 'timer' | 'counter' | 'calculator' | 'transformer' | 'validator' | 'aggregator' | 'filter' | 'sorter' | 'merger' | 'splitter' | 'gateway' | 'function' | 'script' | 'switch' | 'router' | 'youtube' | 'listener' | 'shareholder' | 'artist' | 'delay' | 'queue' | 'batch' | 'parallel' | 'sequence' | 'retry' | 'ai-agent' | 'instagram' | 'snapchat' | 'threads' | 'twitter' | 'facebook' | 'linkedin' | 'tiktok' | 'discord' | 'telegram' | 'whatsapp' | 'reddit' | 'voice' | 'elevenlabs' | 'midjourney' | 'veo3' | 'openai' | 'anthropic' | 'stability' | 'runway' | 'replicate' | 'huggingface' | 'cohere' | 'perplexity' | 'salesforce' | 'hubspot' | 'pipedrive' | 'googlesheets' | 'excel' | 'airtable' | 'notion' | 'stripe' | 'paypal' | 'square' | 'slack' | 'teams' | 'zoom' | 'wallets' | 'workflow' | 'contact' | 'assessment' | 'material' | 'product'
  condition?: string
  amount?: number
}

interface CanvasTool {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  shortcut?: string
  active?: boolean
}

interface WorkflowState {
  id: string
  name: string
  description: string
  nodes: WorkflowNode[]
  connections: Connection[]
  selectedNode: string | null
  selectedNodes: string[]
  isConnecting: string | null
  dragging: string | null
  workflowStatus: 'running' | 'paused' | 'stopped'
  autoMode: boolean
  createdAt: string
  updatedAt: string
  organizationId?: string
  currentTool: 'select' | 'pan' | 'connect' | 'delete' | 'zoom'
  clipboard: WorkflowNode[]
  gridSnap: boolean
  showGrid: boolean
  folder?: string  // Simple folder name
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  status: 'sending' | 'sent' | 'error'
}

interface AppState {
  currentView: 'dashboard' | 'workflow' | 'organizations' | 'roles' | 'people' | 'instruments' | 'contracts' | 'wallets' | 'security' | 'integrations' | 'agents' | 'settings' | 'profile' | 'billing' | 'market' | 'launchpad'
  selectedOrganization: string | null
  selectedPerson: HandCashHandle | null
  sidebarOpen: boolean
  isMobile: boolean
  organizations: Organization[]
  roles: Role[]
  workflows: WorkflowState[]
  folders: string[]
  selectedWorkflow: string | null
  chatMessages: ChatMessage[]
  isChatOpen: boolean
  instruments: FinancialInstrument[]
  contracts: Contract[]
  wallets: Wallet[]
  securityProducts: SecurityProduct[]
  apiKeys: ApiKey[]
  sshKeys: SshKey[]
  mcpServers: McpServer[]
  userProfile: UserProfile
}

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: string
  lastUsed?: string
  isActive: boolean
}

interface SshKey {
  id: string
  name: string
  publicKey: string
  fingerprint: string
  createdAt: string
  lastUsed?: string
  isActive: boolean
}

interface McpServer {
  id: string
  name: string
  url: string
  description: string
  isActive: boolean
  createdAt: string
}

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    autoSave: boolean
  }
  createdAt: string
  updatedAt: string
}

interface WorkflowViewProps {
  workflow: WorkflowState
  boardRef: React.RefObject<HTMLDivElement | null>
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: () => void
  onMouseDown: (e: React.MouseEvent, id?: string) => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: () => void
  onNodeUpdate: (id: string, updates: Partial<WorkflowNode>) => void
  onNodeDelete: (id: string) => void
  onNodesDelete: (ids: string[]) => void
  onNodesCopy: (ids: string[]) => void
  onNodesPaste: (position?: { x: number; y: number }) => void
  onStartConnection: (fromId: string) => void
  onCompleteConnection: (toId: string) => void
  onDoubleClick: (id: string) => void
  onToggleExpansion: (nodeId: string) => void
  onToolChange: (tool: WorkflowState['currentTool']) => void
  onSelectionChange: (nodeIds: string[]) => void
  onAddNode: (type: WorkflowNode['type'], position: { x: number; y: number }) => void
  getNodeIcon: (type: string) => React.ReactNode
  getStatusColor: (status: string) => string
  getConnectionColor: (type: string) => string
  getNodePosition: (id: string) => WorkflowNode | undefined
  isMobile: boolean
  canvasScale: number
  canvasOffset: { x: number; y: number }
  resetCanvasView: () => void
  setCanvasScale: (scale: number | ((prev: number) => number)) => void
  setCanvasOffset: (offset: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void
}

interface OrganizationsViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
  onSelectOrganization: (orgId: string) => void
  onDeselectOrganization: () => void
  onCreateOrganization: (name: string, description: string, tokenSymbol: string) => void
}

interface RolesViewProps {
  roles: Role[]
  organizations: Organization[]
  selectedOrganization: string | null
  onAddMember: (organizationId: string, handle: string, displayName: string, roleId: string) => void
  onCreateRole: (name: string, description: string, icon: string, permissions: string[], defaultShareAllocation: number, automationType: 'ai-agent' | 'workflow' | 'hybrid') => void
  onUpdateRole: (roleId: string, updates: Partial<Role>) => void
  onDeleteRole: (roleId: string) => void
}

interface PeopleViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
  onUpdateShareAllocation: (organizationId: string, personId: string, shares: number) => void
}

interface FinancialInstrument {
  id: string
  name: string
  type: 'equity' | 'debt' | 'derivative' | 'reward' | 'utility' | 'governance' | 'hybrid'
  symbol: string
  description: string
  organizationId?: string
  workflowId?: string
  totalSupply: number
  issuedSupply: number
  decimals: number
  blockchain: string
  contractAddress?: string
  metadata: {
    maturityDate?: string
    interestRate?: number
    couponRate?: number
    strikePrice?: number
    expiryDate?: string
    vestingSchedule?: string
    votingPower?: number
    dividendYield?: number
    collateralRatio?: number
    liquidationThreshold?: number
    rewardMultiplier?: number
    stakingAPY?: number
    governanceWeight?: number
    utilityFunctions?: string[]
    customWorkflow?: boolean
    workflowDescription?: string
  }
  status: 'draft' | 'active' | 'paused' | 'matured' | 'liquidated'
  createdAt: string
  updatedAt: string
}

interface InstrumentsViewProps {
  instruments: FinancialInstrument[]
  organizations: Organization[]
  selectedOrganization: string | null
  onCreateInstrument: (instrument: Omit<FinancialInstrument, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateInstrument: (id: string, updates: Partial<FinancialInstrument>) => void
  onDeleteInstrument: (id: string) => void
  onSelectOrganization: (orgId: string) => void
  onDeselectOrganization: () => void
}

interface SecurityProduct {
  id: string
  name: string
  type: 'auth' | 'identity' | 'access' | 'encryption' | 'audit' | 'compliance' | 'governance' | 'biometric' | 'zero-knowledge' | 'multisig'
  category: 'authentication' | 'authorization' | 'identity-management' | 'data-protection' | 'compliance' | 'governance'
  description: string
  organizationId: string
  blockchain: string
  contractAddress?: string
  tokenSymbol?: string
  pricing: {
    model: 'subscription' | 'usage-based' | 'one-time' | 'revenue-share'
    price: number
    currency: string
    billingCycle?: string
  }
  features: {
    oauthCompatible: boolean
    multiFactorAuth: boolean
    biometricSupport: boolean
    zeroKnowledgeProofs: boolean
    auditTrail: boolean
    complianceFrameworks: string[]
    apiEndpoints: string[]
    sdkSupport: string[]
  }
  metadata: {
    maxUsers?: number
    dataRetentionDays?: number
    encryptionLevel?: string
    auditLogRetention?: number
    complianceCertifications?: string[]
    uptimeSLA?: number
    responseTime?: number
  }
  status: 'development' | 'beta' | 'active' | 'deprecated'
  createdAt: string
  updatedAt: string
}



function DashboardContentInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { colorTheme } = useColorTheme()
  const isDark = colorTheme === 'black'


  const [appState, setAppState] = useState<AppState>({
    currentView: 'workflow',
    selectedOrganization: null,
    selectedPerson: null,
    sidebarOpen: true,
    organizations: [
      {
        id: '1',
        name: 'TechCorp Inc.',
        description: 'Innovative technology solutions',
        tokenSymbol: 'TECH',
        totalShares: 1000000,
        members: [
          {
            id: '1',
            handle: '$alice_dev',
            displayName: 'Alice Johnson',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@techcorp.com',
            phone: '+1-555-0123',
            profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face',
            publicAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            walletType: 'handcash',
            shareAllocation: 25,
            role: 'CEO',
            organizationId: '1',
            kycStatus: 'approved',
            kycDocuments: [
              {
                id: '1',
                type: 'passport',
                name: 'Passport - Alice Johnson',
                uploadedAt: '2024-01-10T10:00:00Z',
                status: 'approved',
                notes: 'Valid passport, identity verified'
              },
              {
                id: '2',
                type: 'utility_bill',
                name: 'Utility Bill - January 2024',
                uploadedAt: '2024-01-10T10:05:00Z',
                status: 'approved'
              }
            ],
            dateOfBirth: '1985-06-15',
            nationality: 'United States',
            address: {
              street: '123 Tech Street',
              city: 'San Francisco',
              state: 'CA',
              country: 'United States',
              postalCode: '94105'
            },
            joinedAt: '2024-01-01T00:00:00Z',
            lastActive: '2024-01-20T15:30:00Z',
            status: 'active'
          },
          {
            id: '2',
            handle: '$bob_tech',
            displayName: 'Bob Smith',
            firstName: 'Bob',
            lastName: 'Smith',
            email: 'bob@techcorp.com',
            phone: '+1-555-0124',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            publicAddress: '3FUpjxWpEGqW4gZWBEyKVFiZqvs2g3x4kJ',
            walletType: 'phantom',
            shareAllocation: 20,
            role: 'Tech Lead AI Agent',
            organizationId: '1',
            kycStatus: 'pending',
            kycDocuments: [
              {
                id: '3',
                type: 'drivers_license',
                name: 'Drivers License - Bob Smith',
                uploadedAt: '2024-01-15T14:00:00Z',
                status: 'pending',
                notes: 'Under review'
              }
            ],
            dateOfBirth: '1990-03-22',
            nationality: 'Canada',
            address: {
              street: '456 Innovation Ave',
              city: 'Toronto',
              state: 'ON',
              country: 'Canada',
              postalCode: 'M5V 3A8'
            },
            joinedAt: '2024-01-05T00:00:00Z',
            lastActive: '2024-01-19T09:15:00Z',
            status: 'active'
          },
          {
            id: '3',
            handle: '$sarah_marketing',
            displayName: 'Sarah Wilson',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah@techcorp.com',
            phone: '+1-555-0125',
            profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            publicAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
            walletType: 'metamask',
            shareAllocation: 15,
            role: 'Marketing AI Agent',
            organizationId: '1',
            kycStatus: 'approved',
            kycDocuments: [
              {
                id: '4',
                type: 'national_id',
                name: 'National ID - Sarah Wilson',
                uploadedAt: '2024-01-08T16:30:00Z',
                status: 'approved'
              },
              {
                id: '5',
                type: 'bank_statement',
                name: 'Bank Statement - December 2023',
                uploadedAt: '2024-01-08T16:35:00Z',
                status: 'approved'
              }
            ],
            dateOfBirth: '1988-11-08',
            nationality: 'United Kingdom',
            address: {
              street: '789 Marketing Blvd',
              city: 'London',
              state: 'England',
              country: 'United Kingdom',
              postalCode: 'SW1A 1AA'
            },
            joinedAt: '2024-01-03T00:00:00Z',
            lastActive: '2024-01-20T11:45:00Z',
            status: 'active'
          },
          {
            id: '4',
            handle: '$mike_finance',
            displayName: 'Mike Chen',
            firstName: 'Mike',
            lastName: 'Chen',
            email: 'mike@techcorp.com',
            profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            publicAddress: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
            walletType: 'handcash',
            shareAllocation: 18,
            role: 'Finance AI Agent',
            organizationId: '1',
            kycStatus: 'not_started',
            kycDocuments: [],
            dateOfBirth: '1992-07-12',
            nationality: 'Singapore',
            joinedAt: '2024-01-10T00:00:00Z',
            lastActive: '2024-01-18T13:20:00Z',
            status: 'pending'
          },
          {
            id: '5',
            handle: '$emma_design',
            displayName: 'Emma Davis',
            firstName: 'Emma',
            lastName: 'Davis',
            email: 'emma@techcorp.com',
            phone: '+1-555-0126',
            profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            publicAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            walletType: 'bitcoin',
            shareAllocation: 12,
            role: 'Design Lead',
            organizationId: '1',
            kycStatus: 'approved',
            kycDocuments: [
              {
                id: '6',
                type: 'passport',
                name: 'Passport - Emma Davis',
                uploadedAt: '2024-01-12T09:00:00Z',
                status: 'approved'
              }
            ],
            dateOfBirth: '1987-04-18',
            nationality: 'Australia',
            joinedAt: '2024-01-12T00:00:00Z',
            lastActive: '2024-01-20T14:30:00Z',
            status: 'active'
          },
          {
            id: '6',
            handle: '$david_ops',
            displayName: 'David Wilson',
            firstName: 'David',
            lastName: 'Wilson',
            email: 'david@techcorp.com',
            phone: '+1-555-0127',
            profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            publicAddress: '0x742d35Cc6e1C1b8C1B0b7c5D8E9F0A1B2C3D4E5F6',
            walletType: 'ethereum',
            shareAllocation: 10,
            role: 'Operations Manager',
            organizationId: '1',
            kycStatus: 'pending',
            kycDocuments: [
              {
                id: '7',
                type: 'drivers_license',
                name: 'Drivers License - David Wilson',
                uploadedAt: '2024-01-16T11:00:00Z',
                status: 'pending'
              }
            ],
            dateOfBirth: '1983-09-25',
            nationality: 'Canada',
            joinedAt: '2024-01-15T00:00:00Z',
            lastActive: '2024-01-19T16:45:00Z',
            status: 'active'
          }
        ],
        createdAt: '2024-01-01',
        status: 'active'
      }
    ],
    roles: [
      // === C-SUITE EXECUTIVES ===
      {
        id: '1',
        name: 'CEO',
        description: 'Chief Executive Officer - Strategic leadership and decision making',
        icon: 'crown',
        permissions: ['admin', 'finance', 'operations'],
        defaultShareAllocation: 25,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '11',
        name: 'CFO',
        description: 'Chief Financial Officer - Financial planning, analysis, and strategic financial management',
        icon: 'bar-chart-3',
        permissions: ['admin', 'finance', 'data-analysis'],
        defaultShareAllocation: 22,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '12',
        name: 'COO',
        description: 'Chief Operating Officer - Operations management, process optimization, and execution',
        icon: 'settings',
        permissions: ['admin', 'operations', 'workflow-creation'],
        defaultShareAllocation: 20,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '9',
        name: 'CTO',
        description: 'Chief Technology Officer - Technology strategy, architecture, and innovation leadership',
        icon: 'code',
        permissions: ['admin', 'tech', 'workflow-creation'],
        defaultShareAllocation: 20,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '10',
        name: 'CMO',
        description: 'Chief Marketing Officer - Marketing strategy, brand management, and growth initiatives',
        icon: 'trending-up',
        permissions: ['admin', 'marketing', 'data-analysis'],
        defaultShareAllocation: 18,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '13',
        name: 'CHRO',
        description: 'Chief Human Resources Officer - People strategy, culture, and organizational development',
        icon: 'users',
        permissions: ['admin', 'operations'],
        defaultShareAllocation: 12,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '17',
        name: 'General Counsel',
        description: 'Chief Legal Officer - Legal strategy, compliance, risk management, and corporate governance',
        icon: 'shield',
        permissions: ['admin', 'legal'],
        defaultShareAllocation: 14,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '18',
        name: 'Head of Data',
        description: 'Chief Data Officer - Data strategy, analytics, and business intelligence leadership',
        icon: 'bar-chart-3',
        permissions: ['data-analysis', 'tech', 'workflow-creation'],
        defaultShareAllocation: 13,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '19',
        name: 'Head of Security',
        description: 'Chief Security Officer - Information security, risk assessment, and cybersecurity strategy',
        icon: 'shield',
        permissions: ['tech', 'admin', 'operations'],
        defaultShareAllocation: 11,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '50',
        name: 'Chief Innovation Officer',
        description: 'Chief Innovation Officer - Innovation strategy, emerging technologies, and digital transformation',
        icon: 'lightbulb',
        permissions: ['admin', 'tech', 'workflow-creation'],
        defaultShareAllocation: 15,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '51',
        name: 'Chief Revenue Officer',
        description: 'Chief Revenue Officer - Revenue strategy, growth optimization, and market expansion',
        icon: 'trending-up',
        permissions: ['admin', 'marketing', 'data-analysis'],
        defaultShareAllocation: 17,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '52',
        name: 'Chief Strategy Officer',
        description: 'Chief Strategy Officer - Corporate strategy, business development, and strategic planning',
        icon: 'target',
        permissions: ['admin', 'data-analysis', 'workflow-creation'],
        defaultShareAllocation: 14,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },

      // === VICE PRESIDENTS ===
      {
        id: '14',
        name: 'VP of Sales',
        description: 'Vice President of Sales - Sales strategy, team leadership, and revenue generation',
        icon: 'trending-up',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 16,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '15',
        name: 'VP of Engineering',
        description: 'Vice President of Engineering - Engineering leadership, technical delivery, and team management',
        icon: 'code',
        permissions: ['tech', 'workflow-creation', 'operations'],
        defaultShareAllocation: 18,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '16',
        name: 'VP of Product',
        description: 'Vice President of Product - Product strategy, roadmap, and user experience leadership',
        icon: 'zap',
        permissions: ['workflow-creation', 'data-analysis', 'marketing'],
        defaultShareAllocation: 15,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '53',
        name: 'VP of Operations',
        description: 'Vice President of Operations - Operational excellence, process improvement, and efficiency optimization',
        icon: 'settings',
        permissions: ['operations', 'workflow-creation', 'data-analysis'],
        defaultShareAllocation: 14,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '54',
        name: 'VP of Finance',
        description: 'Vice President of Finance - Financial operations, planning, and analysis',
        icon: 'bar-chart-3',
        permissions: ['finance', 'data-analysis', 'admin'],
        defaultShareAllocation: 13,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '55',
        name: 'VP of Marketing',
        description: 'Vice President of Marketing - Marketing operations, campaigns, and brand management',
        icon: 'trending-up',
        permissions: ['marketing', 'data-analysis', 'workflow-creation'],
        defaultShareAllocation: 13,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '56',
        name: 'VP of Human Resources',
        description: 'Vice President of Human Resources - Talent management, culture, and employee experience',
        icon: 'users',
        permissions: ['operations', 'admin'],
        defaultShareAllocation: 11,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '57',
        name: 'VP of Business Development',
        description: 'Vice President of Business Development - Partnerships, strategic alliances, and growth initiatives',
        icon: 'handshake',
        permissions: ['marketing', 'data-analysis', 'admin'],
        defaultShareAllocation: 12,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },

      // === DIRECTORS ===
      {
        id: '6',
        name: 'Creative Director',
        description: 'Content creation, brand management, and creative strategy',
        icon: 'palette',
        permissions: ['marketing', 'workflow-creation'],
        defaultShareAllocation: 15,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '58',
        name: 'Director of Engineering',
        description: 'Engineering team leadership, technical architecture, and development processes',
        icon: 'code',
        permissions: ['tech', 'workflow-creation'],
        defaultShareAllocation: 12,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '59',
        name: 'Director of Product Management',
        description: 'Product strategy, roadmap planning, and cross-functional coordination',
        icon: 'zap',
        permissions: ['workflow-creation', 'data-analysis'],
        defaultShareAllocation: 11,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '60',
        name: 'Director of Sales',
        description: 'Sales team management, revenue optimization, and customer acquisition',
        icon: 'trending-up',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 10,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '61',
        name: 'Director of Marketing',
        description: 'Marketing campaigns, digital strategy, and brand positioning',
        icon: 'megaphone',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 9,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '62',
        name: 'Director of Operations',
        description: 'Operational processes, efficiency optimization, and resource management',
        icon: 'settings',
        permissions: ['operations', 'workflow-creation'],
        defaultShareAllocation: 9,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '63',
        name: 'Director of Finance',
        description: 'Financial planning, budgeting, and financial operations management',
        icon: 'bar-chart-3',
        permissions: ['finance', 'data-analysis'],
        defaultShareAllocation: 8,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '64',
        name: 'Director of IT',
        description: 'Information technology infrastructure, systems management, and technical support',
        icon: 'server',
        permissions: ['tech', 'operations'],
        defaultShareAllocation: 8,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '65',
        name: 'Director of Quality Assurance',
        description: 'Quality control, testing processes, and product reliability',
        icon: 'check-circle',
        permissions: ['tech', 'operations'],
        defaultShareAllocation: 7,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '66',
        name: 'Director of Customer Experience',
        description: 'Customer journey optimization, satisfaction improvement, and experience design',
        icon: 'smile',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 8,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },

      // === MANAGERS ===
      {
        id: '2',
        name: 'Marketing Manager',
        description: 'Marketing campaigns, social media management, and customer engagement',
        icon: 'trending-up',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 15,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '3',
        name: 'Finance Manager',
        description: 'Financial analysis, budget tracking, and reporting',
        icon: 'bar-chart-3',
        permissions: ['finance', 'admin', 'data-analysis'],
        defaultShareAllocation: 20,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '5',
        name: 'Operations Manager',
        description: 'Process management, workflow optimization, and operational efficiency',
        icon: 'settings',
        permissions: ['operations', 'workflow-creation'],
        defaultShareAllocation: 12,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '8',
        name: 'Customer Success Manager',
        description: 'Customer support, relationship management, and satisfaction monitoring',
        icon: 'users',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 10,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '20',
        name: 'Head of Customer Success',
        description: 'Customer Success Leadership - Customer retention, satisfaction, and growth strategies',
        icon: 'users',
        permissions: ['marketing', 'data-analysis', 'operations'],
        defaultShareAllocation: 10,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '67',
        name: 'Project Manager',
        description: 'Project coordination, timeline management, and cross-team collaboration',
        icon: 'calendar',
        permissions: ['operations', 'workflow-creation'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '68',
        name: 'Product Manager',
        description: 'Product development, feature planning, and market research',
        icon: 'box',
        permissions: ['workflow-creation', 'data-analysis'],
        defaultShareAllocation: 7,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '69',
        name: 'Sales Manager',
        description: 'Sales team coordination, pipeline management, and revenue tracking',
        icon: 'target',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 7,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '70',
        name: 'HR Manager',
        description: 'Human resources operations, recruitment, and employee relations',
        icon: 'users',
        permissions: ['operations', 'admin'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '71',
        name: 'IT Manager',
        description: 'IT infrastructure management, system administration, and technical support',
        icon: 'server',
        permissions: ['tech', 'operations'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '72',
        name: 'Content Manager',
        description: 'Content creation, editorial oversight, and digital asset management',
        icon: 'file-text',
        permissions: ['marketing', 'workflow-creation'],
        defaultShareAllocation: 5,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '73',
        name: 'Community Manager',
        description: 'Community engagement, social media management, and brand advocacy',
        icon: 'message-circle',
        permissions: ['marketing'],
        defaultShareAllocation: 4,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '74',
        name: 'Account Manager',
        description: 'Client relationship management, account growth, and customer retention',
        icon: 'briefcase',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 5,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },

      // === TECHNICAL LEADS ===
      {
        id: '4',
        name: 'Tech Lead',
        description: 'Code review, technical documentation, and development workflows',
        icon: 'code',
        permissions: ['tech', 'workflow-creation'],
        defaultShareAllocation: 25,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '75',
        name: 'Senior Software Engineer',
        description: 'Software development, code architecture, and technical mentorship',
        icon: 'code',
        permissions: ['tech', 'workflow-creation'],
        defaultShareAllocation: 8,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '76',
        name: 'DevOps Lead',
        description: 'Infrastructure automation, deployment pipelines, and system reliability',
        icon: 'server',
        permissions: ['tech', 'operations'],
        defaultShareAllocation: 7,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '77',
        name: 'Data Engineer',
        description: 'Data pipeline development, ETL processes, and data infrastructure',
        icon: 'database',
        permissions: ['tech', 'data-analysis'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '78',
        name: 'Security Engineer',
        description: 'Cybersecurity implementation, vulnerability assessment, and security protocols',
        icon: 'shield',
        permissions: ['tech', 'admin'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '79',
        name: 'Frontend Lead',
        description: 'Frontend development, UI/UX implementation, and user interface optimization',
        icon: 'monitor',
        permissions: ['tech', 'workflow-creation'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '80',
        name: 'Backend Lead',
        description: 'Backend development, API design, and server-side architecture',
        icon: 'server',
        permissions: ['tech', 'workflow-creation'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '81',
        name: 'Mobile Lead',
        description: 'Mobile application development, cross-platform solutions, and mobile UX',
        icon: 'smartphone',
        permissions: ['tech', 'workflow-creation'],
        defaultShareAllocation: 6,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },

      // === SPECIALISTS ===
      {
        id: '7',
        name: 'Legal Counsel',
        description: 'Contract analysis, compliance monitoring, and legal documentation',
        icon: 'shield',
        permissions: ['legal', 'admin', 'data-analysis'],
        defaultShareAllocation: 18,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '82',
        name: 'Data Scientist',
        description: 'Data analysis, machine learning, and predictive modeling',
        icon: 'bar-chart-3',
        permissions: ['data-analysis', 'tech'],
        defaultShareAllocation: 7,
        automationType: 'hybrid',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '83',
        name: 'Business Analyst',
        description: 'Business process analysis, requirements gathering, and process optimization',
        icon: 'trending-up',
        permissions: ['data-analysis', 'operations'],
        defaultShareAllocation: 5,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '84',
        name: 'UX Designer',
        description: 'User experience design, usability testing, and interaction design',
        icon: 'paintbrush',
        permissions: ['workflow-creation', 'marketing'],
        defaultShareAllocation: 5,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '85',
        name: 'UI Designer',
        description: 'User interface design, visual design, and design system development',
        icon: 'palette',
        permissions: ['workflow-creation', 'marketing'],
        defaultShareAllocation: 5,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '86',
        name: 'Digital Marketing Specialist',
        description: 'SEO, SEM, social media marketing, and digital advertising',
        icon: 'megaphone',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 4,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '87',
        name: 'Content Strategist',
        description: 'Content planning, editorial strategy, and content marketing',
        icon: 'file-text',
        permissions: ['marketing', 'workflow-creation'],
        defaultShareAllocation: 4,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '88',
        name: 'Compliance Officer',
        description: 'Regulatory compliance, risk assessment, and policy enforcement',
        icon: 'check-circle',
        permissions: ['legal', 'admin'],
        defaultShareAllocation: 5,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '89',
        name: 'Financial Analyst',
        description: 'Financial modeling, investment analysis, and financial reporting',
        icon: 'calculator',
        permissions: ['finance', 'data-analysis'],
        defaultShareAllocation: 5,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '90',
        name: 'Market Research Analyst',
        description: 'Market analysis, competitive research, and consumer insights',
        icon: 'search',
        permissions: ['marketing', 'data-analysis'],
        defaultShareAllocation: 4,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '91',
        name: 'Training Specialist',
        description: 'Employee training, skill development, and learning program management',
        icon: 'book',
        permissions: ['operations'],
        defaultShareAllocation: 3,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '92',
        name: 'Procurement Specialist',
        description: 'Vendor management, contract negotiation, and supply chain optimization',
        icon: 'shopping-cart',
        permissions: ['operations', 'finance'],
        defaultShareAllocation: 3,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '93',
        name: 'Quality Assurance Engineer',
        description: 'Software testing, quality control, and bug tracking',
        icon: 'check-circle',
        permissions: ['tech', 'operations'],
        defaultShareAllocation: 4,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '94',
        name: 'Technical Writer',
        description: 'Technical documentation, user manuals, and API documentation',
        icon: 'file-text',
        permissions: ['tech', 'workflow-creation'],
        defaultShareAllocation: 3,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '95',
        name: 'Customer Support Specialist',
        description: 'Customer service, technical support, and issue resolution',
        icon: 'headphones',
        permissions: ['marketing'],
        defaultShareAllocation: 3,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },

      // === COORDINATORS & ASSISTANTS ===
      {
        id: '96',
        name: 'Executive Assistant',
        description: 'Executive support, calendar management, and administrative coordination',
        icon: 'calendar',
        permissions: ['admin'],
        defaultShareAllocation: 2,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '97',
        name: 'Administrative Coordinator',
        description: 'Administrative tasks, office management, and operational support',
        icon: 'folder',
        permissions: ['operations'],
        defaultShareAllocation: 2,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '98',
        name: 'Marketing Coordinator',
        description: 'Marketing campaign support, event coordination, and promotional activities',
        icon: 'calendar',
        permissions: ['marketing'],
        defaultShareAllocation: 2,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '99',
        name: 'Sales Coordinator',
        description: 'Sales support, lead management, and customer onboarding',
        icon: 'users',
        permissions: ['marketing'],
        defaultShareAllocation: 2,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      },
      {
        id: '100',
        name: 'Research Assistant',
        description: 'Research support, data collection, and analysis assistance',
        icon: 'search',
        permissions: ['data-analysis'],
        defaultShareAllocation: 2,
        automationType: 'workflow',
        isAutomated: false,
        workflowId: null,
        organizationId: '1'
      }
    ],
    folders: [],
    workflows: [
      getBitcoinCorpWorkflow(),
      getBitcoinWriterWorkflow(),
      getBitcoinDriveSubWorkflow(),
      getBitcoinEmailSubWorkflow(),
      getBitcoinOSSubWorkflow(),
      {
        id: '1',
        name: 'Example Organisation Workflow: AUDEX',
        description: 'Complete AUDEX Corporation organizational structure with 100 nodes covering executive leadership, technology divisions, business operations, partnerships, and revenue streams',
        nodes: [
          { id: 'n1', type: 'youtube', name: 'YouTube Ad Revenue', description: 'AdSense receipts for AUDEX channel', x: 100, y: 120, status: 'active', connections: [], metadata: { mediaType: 'channel', channelId: 'UCxxxxxxxxxxxxxxxx' } },
          { id: 'n2', type: 'splitter', name: 'Split 70/20/10', description: 'Revenue allocation', x: 380, y: 120, status: 'active', connections: [], metadata: { percentages: { royaltyPool: 70, ops: 20, reserve: 10 } } },
          { id: 'n3', type: 'payment', name: 'Royalty Pool (70%)', description: 'Funds allocated to royalties', x: 680, y: 120, status: 'pending', connections: [], metadata: { amount: '70%' } },
          { id: 'n4', type: 'payment', name: 'Dividend Distributor', description: 'Weekly pro‑rata to AUDEX', x: 980, y: 120, status: 'pending', connections: [], metadata: { tokenSymbol: 'AUDEX', schedule: 'weekly' } },
          { id: 'n5', type: 'member', name: 'Shareholders', description: 'AUDEX holders (pro‑rata)', x: 1280, y: 120, status: 'active', connections: [], metadata: { holders: ['Alice 15%', 'Bob 25%', 'Charlie 20%', 'Diana 40%'] } },
          { id: 'n6', type: 'payment', name: 'Ops (20%)', description: 'Operating budget', x: 680, y: 240, status: 'pending', connections: [], metadata: { amount: '20%' } },
          { id: 'n7', type: 'payment', name: 'Reserve (10%)', description: 'Safety reserve', x: 680, y: 320, status: 'pending', connections: [], metadata: { amount: '10%' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n2', type: 'payment' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'payment', amount: 70 },
          { id: 'c3', from: 'n2', to: 'n6', type: 'payment', amount: 20 },
          { id: 'c4', from: 'n2', to: 'n7', type: 'payment', amount: 10 },
          { id: 'c5', from: 'n3', to: 'n4', type: 'payment' },
          { id: 'c6', from: 'n4', to: 'n5', type: 'payment' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'paused',
        autoMode: true,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: '2',
        name: 'AUDEX Music Corporation Workflow',
        description: 'Complete music streaming and royalty distribution workflow with YouTube revenue, Spotify royalties, NFT sales, and artist distribution',
        nodes: [
          { id: 'n1', type: 'youtube', name: 'Music Track Streaming', description: 'Streaming revenue from music platforms', x: 100, y: 100, status: 'active', connections: [], metadata: { mediaType: 'music', platform: 'streaming' } },
          { id: 'n2', type: 'youtube', name: 'YouTube Ad Revenue', description: 'AdSense receipts for music videos', x: 300, y: 100, status: 'active', connections: [], metadata: { mediaType: 'video', platform: 'youtube' } },
          { id: 'n3', type: 'payment', name: 'Spotify Royalties', description: 'Royalty payments from Spotify', x: 500, y: 100, status: 'active', connections: [], metadata: { platform: 'spotify', royaltyType: 'streaming' } },
          { id: 'n4', type: 'payment', name: 'Platform Subscriptions', description: 'Premium subscription revenue', x: 700, y: 100, status: 'active', connections: [], metadata: { platform: 'subscription', tier: 'premium' } },
          { id: 'n5', type: 'instrument', name: 'NFT Music Sales', description: 'NFT sales of music tracks', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'nft', asset: 'music' } },
          { id: 'n6', type: 'splitter', name: 'AUDEX Revenue Pool', description: 'Central revenue distribution hub', x: 500, y: 250, status: 'active', connections: [], metadata: { distribution: 'centralized' } },
          { id: 'n7', type: 'organization', name: 'AUDEX Treasury (51%)', description: 'Corporate treasury allocation', x: 300, y: 400, status: 'active', connections: [], metadata: { allocation: '51%', purpose: 'treasury' } },
          { id: 'n8', type: 'member', name: 'Artist Royalty Pool (35%)', description: 'Artist royalty distribution', x: 500, y: 400, status: 'active', connections: [], metadata: { allocation: '35%', purpose: 'artists' } },
          { id: 'n9', type: 'workflow', name: 'Operations Reserve (10%)', description: 'Operational expenses fund', x: 700, y: 400, status: 'active', connections: [], metadata: { allocation: '10%', purpose: 'operations' } },
          { id: 'n10', type: 'trigger', name: 'Platform Development (4%)', description: 'Platform development fund', x: 900, y: 400, status: 'active', connections: [], metadata: { allocation: '4%', purpose: 'development' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n6', type: 'payment' },
          { id: 'c2', from: 'n2', to: 'n6', type: 'payment' },
          { id: 'c3', from: 'n3', to: 'n6', type: 'payment' },
          { id: 'c4', from: 'n4', to: 'n6', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'payment' },
          { id: 'c6', from: 'n6', to: 'n7', type: 'payment', amount: 51 },
          { id: 'c7', from: 'n6', to: 'n8', type: 'payment', amount: 35 },
          { id: 'c8', from: 'n6', to: 'n9', type: 'payment', amount: 10 },
          { id: 'c9', from: 'n6', to: 'n10', type: 'payment', amount: 4 }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'paused',
        autoMode: true,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: '3',
        name: 'DeFi Lending Protocol Workflow',
        description: 'Decentralized lending and borrowing workflow with collateral management, liquidation engine, and governance',
        nodes: [
          { id: 'n1', type: 'wallets', name: 'User Collateral', description: 'User deposited collateral assets', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'collateral', asset: 'crypto' } },
          { id: 'n2', type: 'integration', name: 'Collateral Oracle', description: 'Price feed for collateral valuation', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'oracle', provider: 'chainlink' } },
          { id: 'n3', type: 'workflow', name: 'Liquidation Engine', description: 'Automated liquidation system', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'automation', purpose: 'liquidation' } },
          { id: 'n4', type: 'contract', name: 'Interest Rate Model', description: 'Dynamic interest rate calculation', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'smart-contract', model: 'dynamic' } },
          { id: 'n5', type: 'organization', name: 'Lending Pool', description: 'Central lending pool contract', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'pool', purpose: 'lending' } },
          { id: 'n6', type: 'member', name: 'Borrower', description: 'User borrowing assets', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'user', role: 'borrower' } },
          { id: 'n7', type: 'member', name: 'Lender', description: 'User providing liquidity', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'user', role: 'lender' } },
          { id: 'n8', type: 'instrument', name: 'Governance Token', description: 'Protocol governance token', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'token', purpose: 'governance' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n2', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n2', to: 'n4', type: 'data' },
          { id: 'c4', from: 'n3', to: 'n5', type: 'control' },
          { id: 'c5', from: 'n4', to: 'n5', type: 'control' },
          { id: 'c6', from: 'n5', to: 'n6', type: 'payment' },
          { id: 'c7', from: 'n5', to: 'n7', type: 'payment' },
          { id: 'c8', from: 'n5', to: 'n8', type: 'control' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'paused',
        autoMode: true,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: '4',
        name: 'Supply Chain Management Workflow',
        description: 'End-to-end supply chain tracking and management workflow with blockchain verification',
        nodes: [
          { id: 'n1', type: 'organization', name: 'Raw Materials Supplier', description: 'Initial raw materials provider', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'supplier', tier: '1' } },
          { id: 'n2', type: 'workflow', name: 'Manufacturing Plant', description: 'Production and assembly facility', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'facility', purpose: 'manufacturing' } },
          { id: 'n3', type: 'task', name: 'Quality Control', description: 'Quality assurance and testing', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'qa', standard: 'iso9001' } },
          { id: 'n4', type: 'organization', name: 'Warehouse', description: 'Storage and inventory management', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'facility', purpose: 'storage' } },
          { id: 'n5', type: 'workflow', name: 'Distribution Center', description: 'Logistics and shipping hub', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'facility', purpose: 'distribution' } },
          { id: 'n6', type: 'organization', name: 'Retail Store', description: 'Final point of sale', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'facility', purpose: 'retail' } },
          { id: 'n7', type: 'member', name: 'Customer', description: 'End consumer', x: 500, y: 400, status: 'active', connections: [], metadata: { type: 'user', role: 'consumer' } },
          { id: 'n8', type: 'integration', name: 'Blockchain Tracker', description: 'Supply chain verification system', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'blockchain', purpose: 'tracking' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n2', type: 'material' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'product' },
          { id: 'c3', from: 'n3', to: 'n4', type: 'product' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'product' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'product' },
          { id: 'c6', from: 'n6', to: 'n7', type: 'product' },
          { id: 'c7', from: 'n1', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n2', to: 'n8', type: 'data' },
          { id: 'c9', from: 'n3', to: 'n8', type: 'data' },
          { id: 'c10', from: 'n4', to: 'n8', type: 'data' },
          { id: 'c11', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c12', from: 'n6', to: 'n8', type: 'data' },
          { id: 'c13', from: 'n7', to: 'n8', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'paused',
        autoMode: true,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-aigf',
        name: '$AIGF - AI Girlfriend Platform',
        description: 'AI-powered relationship platform with personality engine and emotional intelligence',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'AI Personality Engine', description: 'Core AI personality system', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'personality' } },
          { id: 'n2', type: 'integration', name: 'User Profile System', description: 'User preferences and history', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'user-data', purpose: 'profiles' } },
          { id: 'n3', type: 'workflow', name: 'Conversation Engine', description: 'Natural language processing', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'nlp', purpose: 'chat' } },
          { id: 'n4', type: 'payment', name: 'Subscription Revenue', description: 'Monthly premium subscriptions', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', amount: 'subscription' } },
          { id: 'n5', type: 'organization', name: 'AIGF Platform', description: 'Main platform infrastructure', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'main' } },
          { id: 'n6', type: 'member', name: 'Premium Users', description: 'Subscribed users', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', tier: 'premium' } },
          { id: 'n7', type: 'member', name: 'Free Users', description: 'Basic tier users', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', tier: 'free' } },
          { id: 'n8', type: 'contract', name: 'Revenue Distribution', description: 'Revenue allocation system', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'smart-contract', purpose: 'distribution' } },
          { id: 'n9', type: 'trigger', name: 'AI Training Pipeline', description: 'Continuous learning system', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'ml', purpose: 'training' } },
          { id: 'n10', type: 'workflow', name: 'Content Moderation', description: 'Safety and content filtering', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'safety', purpose: 'moderation' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n1', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n3', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-ai-tribes',
        name: 'AI Tribes - Social Platform',
        description: 'AI-powered social platform with tribal communities and creator tools',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'Community AI', description: 'AI community management', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'community' } },
          { id: 'n2', type: 'integration', name: 'Social Graph', description: 'User connections and relationships', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'social', purpose: 'graph' } },
          { id: 'n3', type: 'workflow', name: 'Content Creation', description: 'AI-assisted content tools', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'content', purpose: 'creation' } },
          { id: 'n4', type: 'payment', name: 'Creator Revenue', description: 'Creator monetization', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'creators' } },
          { id: 'n5', type: 'organization', name: 'AI Tribes Platform', description: 'Main social platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'social' } },
          { id: 'n6', type: 'member', name: 'Creators', description: 'Content creators', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'creator' } },
          { id: 'n7', type: 'member', name: 'Users', description: 'Platform users', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'consumer' } },
          { id: 'n8', type: 'contract', name: 'Revenue Sharing', description: 'Revenue distribution system', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'smart-contract', purpose: 'sharing' } },
          { id: 'n9', type: 'trigger', name: 'Viral Detection', description: 'Trend detection algorithm', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'ml', purpose: 'trending' } },
          { id: 'n10', type: 'workflow', name: 'Moderation System', description: 'Content and behavior moderation', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'safety', purpose: 'moderation' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n3', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n5', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-one-shot-comics',
        name: 'One-Shot Comics - AI Comic Creation Platform',
        description: 'AI-powered comic creation platform with one-button generation and NFT minting',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'Comic Generator', description: 'AI comic creation engine', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'generation' } },
          { id: 'n2', type: 'integration', name: 'Art Style Library', description: 'Visual style templates', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'art', purpose: 'styles' } },
          { id: 'n3', type: 'workflow', name: 'Story Generation', description: 'Narrative creation system', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'nlp', purpose: 'story' } },
          { id: 'n4', type: 'payment', name: 'NFT Sales', description: 'Comic NFT marketplace', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'nft' } },
          { id: 'n5', type: 'organization', name: 'One-Shot Comics', description: 'Main platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'comics' } },
          { id: 'n6', type: 'member', name: 'Creators', description: 'Comic creators', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'creator' } },
          { id: 'n7', type: 'member', name: 'Collectors', description: 'NFT collectors', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'collector' } },
          { id: 'n8', type: 'contract', name: 'NFT Contract', description: 'Smart contract for NFTs', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'smart-contract', purpose: 'nft' } },
          { id: 'n9', type: 'trigger', name: 'Quality Control', description: 'Content quality system', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'quality', purpose: 'control' } },
          { id: 'n10', type: 'workflow', name: 'Distribution', description: 'Comic distribution system', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'distribution', purpose: 'comics' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n1', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n4', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-course-kings',
        name: 'Course Kings - Education Platform',
        description: 'AI-powered education platform with course creation and creator monetization',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'Course Generator', description: 'AI course creation engine', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'education' } },
          { id: 'n2', type: 'integration', name: 'Learning Analytics', description: 'Student progress tracking', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'analytics', purpose: 'learning' } },
          { id: 'n3', type: 'workflow', name: 'Content Creation', description: 'Educational content system', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'content', purpose: 'education' } },
          { id: 'n4', type: 'payment', name: 'Course Sales', description: 'Course marketplace revenue', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'courses' } },
          { id: 'n5', type: 'organization', name: 'Course Kings', description: 'Education platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'education' } },
          { id: 'n6', type: 'member', name: 'Instructors', description: 'Course creators', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'instructor' } },
          { id: 'n7', type: 'member', name: 'Students', description: 'Course learners', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'student' } },
          { id: 'n8', type: 'contract', name: 'Revenue Sharing', description: 'Instructor payment system', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'smart-contract', purpose: 'sharing' } },
          { id: 'n9', type: 'trigger', name: 'Adaptive Learning', description: 'Personalized learning paths', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'personalization' } },
          { id: 'n10', type: 'workflow', name: 'Certification', description: 'Course completion system', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'certification', purpose: 'completion' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n3', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n7', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-ninja-punk-girls',
        name: 'Ninja Punk Girls - NFT Collection Platform',
        description: 'NFT collection platform with 1,530 asset library and rarity algorithm',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'Rarity Algorithm', description: 'NFT rarity calculation', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'rarity' } },
          { id: 'n2', type: 'integration', name: 'Asset Library', description: '1,530 unique assets', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'assets', count: 1530 } },
          { id: 'n3', type: 'workflow', name: 'Minting System', description: 'NFT creation and minting', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'minting', purpose: 'nft' } },
          { id: 'n4', type: 'payment', name: 'NFT Sales', description: 'Marketplace revenue', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'nft' } },
          { id: 'n5', type: 'organization', name: 'Ninja Punk Girls', description: 'NFT platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'nft' } },
          { id: 'n6', type: 'member', name: 'Artists', description: 'Asset creators', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'artist' } },
          { id: 'n7', type: 'member', name: 'Collectors', description: 'NFT buyers', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'collector' } },
          { id: 'n8', type: 'contract', name: 'NFT Contract', description: 'Smart contract for collection', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'smart-contract', purpose: 'collection' } },
          { id: 'n9', type: 'trigger', name: 'Marketplace', description: 'Trading platform', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'marketplace', purpose: 'trading' } },
          { id: 'n10', type: 'workflow', name: 'Royalty System', description: 'Artist royalty distribution', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'royalties', purpose: 'artists' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n4', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n6', type: 'payment' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-miss-void',
        name: 'Miss Void - AI Fashion Platform',
        description: 'AI-powered fashion platform with style generation and virtual try-on',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'Style Generator', description: 'AI fashion style creation', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'fashion' } },
          { id: 'n2', type: 'integration', name: 'Virtual Try-On', description: 'AR try-on system', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'ar', purpose: 'try-on' } },
          { id: 'n3', type: 'workflow', name: 'Trend Analysis', description: 'Fashion trend detection', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'analytics', purpose: 'trends' } },
          { id: 'n4', type: 'payment', name: 'Fashion Sales', description: 'E-commerce revenue', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'fashion' } },
          { id: 'n5', type: 'organization', name: 'Miss Void', description: 'Fashion platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'fashion' } },
          { id: 'n6', type: 'member', name: 'Designers', description: 'Fashion designers', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'designer' } },
          { id: 'n7', type: 'member', name: 'Customers', description: 'Fashion buyers', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'customer' } },
          { id: 'n8', type: 'contract', name: 'Payment System', description: 'E-commerce payments', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'payment', purpose: 'ecommerce' } },
          { id: 'n9', type: 'trigger', name: 'Inventory Management', description: 'Stock tracking system', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'inventory', purpose: 'tracking' } },
          { id: 'n10', type: 'workflow', name: 'Logistics', description: 'Shipping and delivery', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'logistics', purpose: 'shipping' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n5', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n7', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-marina3d',
        name: 'Marina3D - 3D Art Portfolio Platform',
        description: '3D art portfolio platform with interactive viewer and AR/VR integration',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: '3D Renderer', description: '3D rendering engine', x: 100, y: 100, status: 'active', connections: [], metadata: { type: '3d', purpose: 'rendering' } },
          { id: 'n2', type: 'integration', name: 'AR/VR Viewer', description: 'Immersive viewing system', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'ar-vr', purpose: 'viewing' } },
          { id: 'n3', type: 'workflow', name: 'Portfolio Management', description: 'Artist portfolio system', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'portfolio', purpose: 'management' } },
          { id: 'n4', type: 'payment', name: 'Commission Sales', description: 'Art commission revenue', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'commissions' } },
          { id: 'n5', type: 'organization', name: 'Marina3D', description: '3D art platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: '3d-art' } },
          { id: 'n6', type: 'member', name: '3D Artists', description: '3D content creators', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'artist' } },
          { id: 'n7', type: 'member', name: 'Art Buyers', description: 'Commission clients', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'client' } },
          { id: 'n8', type: 'contract', name: 'Commission System', description: 'Commission management', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'smart-contract', purpose: 'commissions' } },
          { id: 'n9', type: 'trigger', name: 'Quality Control', description: 'Art quality system', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'quality', purpose: 'control' } },
          { id: 'n10', type: 'workflow', name: 'Exhibition System', description: 'Virtual gallery system', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'exhibition', purpose: 'gallery' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n1', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n4', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-beauty-queen-ai',
        name: 'Beauty Queen AI - AI Beauty Platform',
        description: 'AI-powered beauty platform with virtual try-on and skin analysis',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'Beauty AI', description: 'AI beauty analysis', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'beauty' } },
          { id: 'n2', type: 'integration', name: 'Virtual Try-On', description: 'Beauty product try-on', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'ar', purpose: 'try-on' } },
          { id: 'n3', type: 'workflow', name: 'Skin Analysis', description: 'Skin condition analysis', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'analysis', purpose: 'skin' } },
          { id: 'n4', type: 'payment', name: 'Beauty Sales', description: 'Beauty product revenue', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'beauty' } },
          { id: 'n5', type: 'organization', name: 'Beauty Queen AI', description: 'Beauty platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'beauty' } },
          { id: 'n6', type: 'member', name: 'Beauty Experts', description: 'Beauty professionals', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'expert' } },
          { id: 'n7', type: 'member', name: 'Customers', description: 'Beauty consumers', x: 700, y: 400, status: 'active', connections: [], metadata: [], metadata: { type: 'users', role: 'customer' } },
          { id: 'n8', type: 'contract', name: 'Payment System', description: 'E-commerce payments', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'payment', purpose: 'ecommerce' } },
          { id: 'n9', type: 'trigger', name: 'Product Matching', description: 'AI product recommendations', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'recommendations' } },
          { id: 'n10', type: 'workflow', name: 'Consultation System', description: 'Virtual beauty consultations', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'consultation', purpose: 'virtual' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'data' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n3', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n7', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      },
      {
        id: 'workflow-hyperflix',
        name: 'HYPERFLIX - Next-Gen Streaming Platform',
        description: 'Next-generation streaming platform with AI curation and VR integration',
        nodes: [
          { id: 'n1', type: 'ai-agent', name: 'Content AI', description: 'AI content curation', x: 100, y: 100, status: 'active', connections: [], metadata: { type: 'ai', purpose: 'curation' } },
          { id: 'n2', type: 'integration', name: 'VR Player', description: 'Virtual reality streaming', x: 300, y: 100, status: 'active', connections: [], metadata: { type: 'vr', purpose: 'streaming' } },
          { id: 'n3', type: 'workflow', name: 'Content Delivery', description: 'Streaming infrastructure', x: 500, y: 100, status: 'active', connections: [], metadata: { type: 'streaming', purpose: 'delivery' } },
          { id: 'n4', type: 'payment', name: 'Subscription Revenue', description: 'Monthly subscriptions', x: 700, y: 100, status: 'active', connections: [], metadata: { type: 'revenue', purpose: 'subscription' } },
          { id: 'n5', type: 'organization', name: 'HYPERFLIX', description: 'Streaming platform', x: 500, y: 250, status: 'active', connections: [], metadata: { type: 'platform', purpose: 'streaming' } },
          { id: 'n6', type: 'member', name: 'Content Creators', description: 'Video creators', x: 300, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'creator' } },
          { id: 'n7', type: 'member', name: 'Viewers', description: 'Streaming subscribers', x: 700, y: 400, status: 'active', connections: [], metadata: { type: 'users', role: 'viewer' } },
          { id: 'n8', type: 'contract', name: 'Revenue Sharing', description: 'Creator payment system', x: 500, y: 550, status: 'active', connections: [], metadata: { type: 'smart-contract', purpose: 'sharing' } },
          { id: 'n9', type: 'trigger', name: 'Quality Control', description: 'Content quality system', x: 900, y: 100, status: 'active', connections: [], metadata: { type: 'quality', purpose: 'control' } },
          { id: 'n10', type: 'workflow', name: 'Analytics Engine', description: 'Viewer analytics system', x: 900, y: 250, status: 'active', connections: [], metadata: { type: 'analytics', purpose: 'viewers' } }
        ],
        connections: [
          { id: 'c1', from: 'n1', to: 'n3', type: 'data' },
          { id: 'c2', from: 'n2', to: 'n3', type: 'data' },
          { id: 'c3', from: 'n3', to: 'n5', type: 'data' },
          { id: 'c4', from: 'n4', to: 'n5', type: 'payment' },
          { id: 'c5', from: 'n5', to: 'n6', type: 'service' },
          { id: 'c6', from: 'n5', to: 'n7', type: 'service' },
          { id: 'c7', from: 'n5', to: 'n8', type: 'data' },
          { id: 'c8', from: 'n9', to: 'n3', type: 'data' },
          { id: 'c9', from: 'n10', to: 'n5', type: 'data' }
        ],
        selectedNode: null,
        selectedNodes: [],
        isConnecting: null,
        dragging: null,
        workflowStatus: 'stopped',
        autoMode: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20',
        organizationId: '1',
        currentTool: 'select',
        clipboard: [],
        gridSnap: true,
        showGrid: true
      }
    ],
    selectedWorkflow: 'bitcoin-corp-org',
    chatMessages: [
      {
        id: '1',
        type: 'ai',
        content: 'Hello! I\'m your AI assistant. I can help you create organizations, manage workflows, and automate business processes. Try saying something like "Create a new organization" or "Add a new team member".',
        timestamp: new Date(),
        status: 'sent'
      }
    ],
    isChatOpen: false,
    isMobile: false,
    instruments: [
      {
        id: '1',
        name: 'TechCorp Equity Shares',
        type: 'equity',
        symbol: 'TECH',
        description: 'Common equity shares with voting rights',
        organizationId: '1',
        totalSupply: 1000000,
        issuedSupply: 500000,
        decimals: 18,
        blockchain: 'Bitcoin SV',
        contractAddress: '0x1234567890abcdef',
        metadata: {
          votingPower: 1,
          dividendYield: 0.05,
          governanceWeight: 1
        },
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'TechCorp Employee Options',
        type: 'derivative',
        symbol: 'TECH-OPT',
        description: 'Employee stock options with vesting',
        organizationId: '1',
        totalSupply: 100000,
        issuedSupply: 25000,
        decimals: 18,
        blockchain: 'Bitcoin SV',
        metadata: {
          strikePrice: 10,
          expiryDate: '2029-01-15',
          vestingSchedule: '4-year vesting with 1-year cliff'
        },
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '3',
        name: 'DeFi Yield Token',
        type: 'utility',
        symbol: 'YIELD',
        description: 'Yield-generating DeFi token with automated staking',
        totalSupply: 10000000,
        issuedSupply: 2000000,
        decimals: 18,
        blockchain: 'Bitcoin SV',
        metadata: {
          stakingAPY: 0.12,
          rewardMultiplier: 1.5,
          customWorkflow: true,
          workflowDescription: 'Automated yield distribution and staking rewards'
        },
        status: 'active',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
      },
      {
        id: '4',
        name: 'Governance DAO Token',
        type: 'governance',
        symbol: 'DAO',
        description: 'Decentralized governance token with voting mechanisms',
        totalSupply: 5000000,
        issuedSupply: 1000000,
        decimals: 18,
        blockchain: 'Bitcoin SV',
        metadata: {
          votingPower: 1,
          governanceWeight: 1,
          customWorkflow: true,
          workflowDescription: 'Proposal creation, voting, and execution workflow'
        },
        status: 'active',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
      }
    ],
    contracts: [
      {
        id: '1',
        name: 'Software Development Agreement',
        type: 'service',
        description: 'Custom software development services for mobile application',
        parties: ['TechCorp Inc.', 'DevStudio LLC'],
        value: 150000,
        currency: 'USD',
        startDate: '2024-02-01',
        endDate: '2024-08-01',
        status: 'active',
        organizationId: '1',
        terms: [
          {
            id: '1',
            title: 'Payment Schedule',
            content: '50% upfront, 25% at milestone completion, 25% upon delivery',
            category: 'payment',
            isRequired: true,
            order: 1
          },
          {
            id: '2',
            title: 'Intellectual Property Rights',
            content: 'All developed code and assets belong to TechCorp Inc.',
            category: 'intellectual_property',
            isRequired: true,
            order: 2
          },
          {
            id: '3',
            title: 'Confidentiality',
            content: 'Non-disclosure of proprietary information and trade secrets',
            category: 'confidentiality',
            isRequired: true,
            order: 3
          }
        ],
        documents: [
          {
            id: '1',
            name: 'Main Contract Document',
            type: 'contract',
            uploadedAt: '2024-02-01T10:00:00Z',
            uploadedBy: 'Alice Johnson',
            version: 1,
            isActive: true
          }
        ],
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        createdBy: 'Alice Johnson',
        lastModifiedBy: 'Alice Johnson'
      },
      {
        id: '2',
        name: 'Employment Contract - Senior Developer',
        type: 'employment',
        description: 'Full-time employment agreement for senior software developer position',
        parties: ['TechCorp Inc.', 'Bob Smith'],
        value: 120000,
        currency: 'USD',
        startDate: '2024-01-05',
        status: 'active',
        organizationId: '1',
        terms: [
          {
            id: '4',
            title: 'Salary and Benefits',
            content: '$120,000 annual salary plus health insurance and equity options',
            category: 'payment',
            isRequired: true,
            order: 1
          },
          {
            id: '5',
            title: 'Equity Vesting',
            content: '4-year vesting schedule with 1-year cliff, 20% equity allocation',
            category: 'performance',
            isRequired: true,
            order: 2
          },
          {
            id: '6',
            title: 'Termination Clause',
            content: '30-day notice period required from either party',
            category: 'termination',
            isRequired: true,
            order: 3
          }
        ],
        documents: [
          {
            id: '2',
            name: 'Employment Agreement',
            type: 'contract',
            uploadedAt: '2024-01-05T09:00:00Z',
            uploadedBy: 'Alice Johnson',
            version: 1,
            isActive: true
          },
          {
            id: '3',
            name: 'Signed Agreement',
            type: 'signature_page',
            uploadedAt: '2024-01-05T15:30:00Z',
            uploadedBy: 'Bob Smith',
            version: 1,
            isActive: true
          }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-05T15:30:00Z',
        createdBy: 'Alice Johnson',
        lastModifiedBy: 'Bob Smith'
      },
      {
        id: '3',
        name: 'Partnership Agreement - Marketing Alliance',
        type: 'partnership',
        description: 'Strategic partnership for joint marketing initiatives',
        parties: ['TechCorp Inc.', 'MarketPro Agency'],
        value: 75000,
        currency: 'USD',
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        status: 'pending_signature',
        organizationId: '1',
        terms: [
          {
            id: '7',
            title: 'Revenue Sharing',
            content: '60/40 split on generated leads and conversions',
            category: 'payment',
            isRequired: true,
            order: 1
          },
          {
            id: '8',
            title: 'Performance Metrics',
            content: 'Minimum 500 qualified leads per quarter',
            category: 'performance',
            isRequired: true,
            order: 2
          }
        ],
        documents: [
          {
            id: '4',
            name: 'Partnership Agreement Draft',
            type: 'contract',
            uploadedAt: '2024-02-15T14:00:00Z',
            uploadedBy: 'Sarah Wilson',
            version: 2,
            isActive: true
          }
        ],
        createdAt: '2024-02-10T00:00:00Z',
        updatedAt: '2024-02-15T14:00:00Z',
        createdBy: 'Sarah Wilson',
        lastModifiedBy: 'Sarah Wilson'
      },
      {
        id: '4',
        name: 'Non-Disclosure Agreement - Investor',
        type: 'nda',
        description: 'Confidentiality agreement for funding discussions',
        parties: ['TechCorp Inc.', 'Venture Capital Partners'],
        startDate: '2024-01-20',
        endDate: '2024-07-20',
        status: 'active',
        terms: [
          {
            id: '9',
            title: 'Confidential Information',
            content: 'Financial data, business plans, and proprietary technology',
            category: 'confidentiality',
            isRequired: true,
            order: 1
          },
          {
            id: '10',
            title: 'Duration of Confidentiality',
            content: 'Obligations continue for 5 years after agreement termination',
            category: 'termination',
            isRequired: true,
            order: 2
          }
        ],
        documents: [
          {
            id: '5',
            name: 'NDA Document',
            type: 'contract',
            uploadedAt: '2024-01-20T11:00:00Z',
            uploadedBy: 'Alice Johnson',
            version: 1,
            isActive: true
          }
        ],
        createdAt: '2024-01-18T00:00:00Z',
        updatedAt: '2024-01-20T11:00:00Z',
        createdBy: 'Alice Johnson',
        lastModifiedBy: 'Alice Johnson'
      }
    ],
    wallets: [
      {
        id: '1',
        name: 'Company Bitcoin Wallet',
        type: 'bitcoin',
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        balance: 2.5,
        currency: 'BTC',
        isActive: true,
        organizationId: '1',
        description: 'Main corporate Bitcoin wallet for payments and reserves',
        network: 'mainnet',
        transactions: [
          {
            id: '1',
            txHash: '6f47c4c4e8d5f6c8d9e1f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5',
            type: 'incoming',
            amount: 1.0,
            currency: 'BTC',
            fromAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
            toAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'confirmed',
            confirmations: 6,
            blockHeight: 820000,
            timestamp: '2024-01-20T10:30:00Z',
            fee: 0.0001,
            description: 'Payment from client',
            tags: ['client-payment', 'invoice-001']
          },
          {
            id: '2',
            txHash: '7a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4',
            type: 'outgoing',
            amount: 0.5,
            currency: 'BTC',
            fromAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
            status: 'confirmed',
            confirmations: 12,
            blockHeight: 819950,
            timestamp: '2024-01-18T15:45:00Z',
            fee: 0.00015,
            description: 'Contractor payment',
            tags: ['contractor', 'development']
          }
        ],
        metadata: {
          isWatchOnly: false,
          hdWallet: true,
          seedPhrase: true
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-20T10:30:00Z',
        lastSyncAt: '2024-01-20T16:00:00Z'
      },
      {
        id: '2',
        name: 'HandCash Corporate',
        type: 'handcash',
        address: '$techcorp',
        balance: 1000.0,
        currency: 'BSV',
        isActive: true,
        organizationId: '1',
        description: 'HandCash wallet for BSV transactions and microtransactions',
        network: 'mainnet',
        transactions: [
          {
            id: '3',
            txHash: '8b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5',
            type: 'incoming',
            amount: 500.0,
            currency: 'BSV',
            fromAddress: '$client123',
            toAddress: '$techcorp',
            status: 'confirmed',
            confirmations: 1,
            timestamp: '2024-01-19T12:00:00Z',
            fee: 0.001,
            description: 'Service payment via HandCash',
            tags: ['handcash', 'service']
          }
        ],
        metadata: {
          isWatchOnly: false
        },
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-19T12:00:00Z',
        lastSyncAt: '2024-01-20T16:00:00Z'
      },
      {
        id: '3',
        name: 'Multi-Sig Treasury',
        type: 'multi_sig',
        address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
        balance: 10.0,
        currency: 'BTC',
        isActive: true,
        organizationId: '1',
        description: 'Multi-signature wallet for large transactions requiring board approval',
        network: 'mainnet',
        transactions: [
          {
            id: '4',
            txHash: '9c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4h5i6',
            type: 'incoming',
            amount: 5.0,
            currency: 'BTC',
            fromAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
            toAddress: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
            status: 'confirmed',
            confirmations: 3,
            timestamp: '2024-01-15T09:30:00Z',
            fee: 0.0002,
            description: 'Treasury deposit',
            tags: ['treasury', 'deposit']
          }
        ],
        metadata: {
          isMultiSig: true,
          requiredSignatures: 3,
          totalSigners: 5,
          isWatchOnly: false
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T09:30:00Z',
        lastSyncAt: '2024-01-20T16:00:00Z'
      },
      {
        id: '4',
        name: 'Personal Ethereum Wallet',
        type: 'ethereum',
        address: '0x742d35Cc6e1C1b8C1B0b7c5D8E9F0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
        balance: 5.25,
        currency: 'ETH',
        isActive: true,
        description: 'Personal Ethereum wallet for DeFi and token transactions',
        network: 'mainnet',
        transactions: [
          {
            id: '5',
            txHash: '0xa1b2c3d4e5f6789012345678901234567890123456789012345678901234567890123456',
            type: 'outgoing',
            amount: 0.1,
            currency: 'ETH',
            fromAddress: '0x742d35Cc6e1C1b8C1B0b7c5D8E9F0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
            toAddress: '0x1234567890123456789012345678901234567890',
            status: 'confirmed',
            confirmations: 15,
            timestamp: '2024-01-17T14:20:00Z',
            fee: 0.002,
            description: 'DeFi transaction',
            tags: ['defi', 'uniswap']
          }
        ],
        metadata: {
          isWatchOnly: false,
          hdWallet: true
        },
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-17T14:20:00Z',
        lastSyncAt: '2024-01-20T16:00:00Z'
      },
      {
        id: '5',
        name: 'Hardware Wallet - Ledger',
        type: 'hardware',
        address: '1HardwareLedgerWalletAddressExample123456789',
        balance: 0.75,
        currency: 'BTC',
        isActive: true,
        description: 'Cold storage hardware wallet for secure long-term holdings',
        network: 'mainnet',
        transactions: [],
        metadata: {
          isWatchOnly: true,
          hardware: {
            device: 'Ledger',
            model: 'Nano X'
          }
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        lastSyncAt: '2024-01-20T16:00:00Z'
      }
    ],
    securityProducts: [
      {
        id: '1',
        name: 'BlockAuth OAuth',
        type: 'auth',
        category: 'authentication',
        description: 'Blockchain-based OAuth 2.0 compatible authentication service',
        organizationId: '1',
        blockchain: 'Bitcoin SV',
        contractAddress: '0xauth1234567890abcdef',
        tokenSymbol: 'AUTH',
        pricing: {
          model: 'usage-based',
          price: 0.001,
          currency: 'BSV',
          billingCycle: 'per-request'
        },
        features: {
          oauthCompatible: true,
          multiFactorAuth: true,
          biometricSupport: false,
          zeroKnowledgeProofs: false,
          auditTrail: true,
          complianceFrameworks: ['GDPR', 'SOC2'],
          apiEndpoints: ['/oauth/authorize', '/oauth/token', '/userinfo'],
          sdkSupport: ['JavaScript', 'Python', 'React Native']
        },
        metadata: {
          maxUsers: 1000000,
          dataRetentionDays: 90,
          encryptionLevel: 'AES-256',
          auditLogRetention: 365,
          complianceCertifications: ['ISO 27001'],
          uptimeSLA: 99.9,
          responseTime: 100
        },
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Immutable Audit Log',
        type: 'audit',
        category: 'compliance',
        description: 'Immutable blockchain audit trail for compliance and governance',
        organizationId: '1',
        blockchain: 'Bitcoin SV',
        contractAddress: '0xaudit1234567890abcdef',
        pricing: {
          model: 'subscription',
          price: 99,
          currency: 'USD',
          billingCycle: 'monthly'
        },
        features: {
          oauthCompatible: false,
          multiFactorAuth: false,
          biometricSupport: false,
          zeroKnowledgeProofs: true,
          auditTrail: true,
          complianceFrameworks: ['SOX', 'HIPAA', 'PCI-DSS'],
          apiEndpoints: ['/audit/log', '/audit/verify', '/audit/export'],
          sdkSupport: ['Java', 'C#', 'Go']
        },
        metadata: {
          maxUsers: 50000,
          dataRetentionDays: 2555,
          encryptionLevel: 'SHA-256',
          auditLogRetention: 2555,
          complianceCertifications: ['SOC2 Type II'],
          uptimeSLA: 99.99,
          responseTime: 50
        },
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      }
    ],
    apiKeys: [
      {
        id: '1',
        name: 'Production API Key',
        key: 'demo_key_placeholder',
        permissions: ['read', 'write', 'admin'],
        createdAt: '2024-01-15',
        lastUsed: '2024-01-20',
        isActive: true
      }
    ],
    sshKeys: [
      {
        id: '1',
        name: 'MacBook Pro',
        publicKey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC...',
        fingerprint: 'SHA256:abcdef1234567890',
        createdAt: '2024-01-15',
        lastUsed: '2024-01-20',
        isActive: true
      }
    ],
    mcpServers: [
      {
        id: '1',
        name: 'Supabase MCP',
        url: 'https://supabase.com/mcp',
        description: 'Supabase database and authentication services',
        isActive: true,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Hugging Face MCP',
        url: 'https://huggingface.co/mcp',
        description: 'AI models and datasets',
        isActive: true,
        createdAt: '2024-01-15'
      }
    ],
    userProfile: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: undefined,
      preferences: {
        theme: 'dark',
        notifications: true,
        autoSave: true
      },
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    }
  })


  const { workflows, folders, selectedWorkflow, organizations, roles, currentView, selectedOrganization, sidebarOpen, chatMessages, isChatOpen, instruments, apiKeys, sshKeys, mcpServers, userProfile, contracts, wallets } = appState
  const { user, isAuthenticated } = useAuth()

  const boardRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  // Helper function to get current workflow
  const getCurrentWorkflow = () => {
    return selectedWorkflow ? workflows.find(w => w.id === selectedWorkflow) : null
  }

  const currentWorkflow = getCurrentWorkflow()

  // Handle HandCash redirect - if authToken is present, redirect to callback
  useEffect(() => {
    const authToken = searchParams.get('authToken')
    if (authToken) {
      // Redirect to callback page with the authToken
      router.push(`/auth/handcash/callback?authToken=${authToken}`)
    }
  }, [searchParams, router])

  // Sync URL search params with appState
  useEffect(() => {
    const view = searchParams.get('view')
    const workflowId = searchParams.get('workflowId')

    setAppState(prev => {
      let next = { ...prev }
      let changed = false

      if (view && view !== prev.currentView) {
        next.currentView = view as any
        changed = true
      }

      if (workflowId && workflowId !== prev.selectedWorkflow) {
        const found = prev.workflows.find(w => w.id === workflowId)
        if (found) {
          next.selectedWorkflow = workflowId
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [searchParams])

  // Sync appState with URL search params
  useEffect(() => {
    const url = new URL(window.location.href)
    let changed = false

    if (appState.currentView !== searchParams.get('view')) {
      url.searchParams.set('view', appState.currentView)
      changed = true
    }

    if (appState.selectedWorkflow && appState.selectedWorkflow !== searchParams.get('workflowId')) {
      url.searchParams.set('workflowId', appState.selectedWorkflow)
      changed = true
    }

    // Clean up redundant workflow param if present
    if (url.searchParams.has('workflow')) {
      url.searchParams.delete('workflow')
      changed = true
    }

    if (changed) {
      window.history.pushState({}, '', url.toString())
    }
  }, [appState.currentView, appState.selectedWorkflow, searchParams])

  // Mobile detection and responsive state
  const [isMobile, setIsMobile] = useState(false)
  const [mobileAddTop, setMobileAddTop] = useState<number>(96)

  // Set default zoom based on workflow (0.2 for bitcoin-corp-org, 0.35 for others)
  const isBitcoinCorp = (searchParams.get('workflowId') === 'bitcoin-corp-org') ||
    (!searchParams.get('workflowId') && appState.selectedWorkflow === 'bitcoin-corp-org')

  const [canvasScale, setCanvasScale] = useState(isBitcoinCorp ? 0.2 : 0.35)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [lastTouchDistance, setLastTouchDistance] = useState(0)
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 })
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Update canvas scale when workflow changes
  useEffect(() => {
    if (appState.currentView === 'workflow') {
      const isBitcoin = appState.selectedWorkflow === 'bitcoin-corp-org'
      setCanvasScale(isBitcoin ? 0.2 : 0.35)
      setCanvasOffset({ x: 0, y: 0 })
    }
  }, [appState.currentView, appState.selectedWorkflow])

  // Debug logging for appState changes
  useEffect(() => {
    console.log('🔄 AppState changed:', {
      currentView: appState.currentView,
      selectedOrganization: appState.selectedOrganization,
      timestamp: new Date().toISOString(),
      currentViewType: typeof appState.currentView,
      isAgentsView: appState.currentView === 'agents'
    })
  }, [appState.currentView, appState.selectedOrganization])

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsMobile(mobile)
      // Ensure mobile menu is closed on mobile detection
      setMobileMenuOpen(false)
      setAppState(prev => ({
        ...prev,
        isMobile: mobile,
        sidebarOpen: !mobile, // Collapse sidebar by default on mobile
        // Ensure assistant is closed by default on mobile
        ...(mobile && prev.isChatOpen ? { isChatOpen: false } : {})
      }))

      // Adjust initial node positions for mobile
      if (mobile) {
        setAppState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w => ({
            ...w,
            nodes: w.nodes.map((node, index) => ({
              ...node,
              x: 50 + (index * 200),
              y: 50 + (Math.floor(index / 2) * 120)
            }))
          }))
        }))
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Compute sticky Add Node button position under the header
  useEffect(() => {
    const updateTop = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect()
        setMobileAddTop(rect.bottom + 8)
      }
    }
    updateTop()
    window.addEventListener('resize', updateTop)
    return () => window.removeEventListener('resize', updateTop)
  }, [isMobile])

  // Touch event handlers for canvas dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - start canvas dragging
      setIsDraggingCanvas(true)
      const touch = e.touches[0]
      setLastTouchCenter({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2) {
      // Two touches - prepare for pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      setLastTouchDistance(distance)
      setLastTouchCenter({
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()

    if (e.touches.length === 1 && isDraggingCanvas) {
      // Single touch - drag canvas
      const touch = e.touches[0]
      const deltaX = touch.clientX - lastTouchCenter.x
      const deltaY = touch.clientY - lastTouchCenter.y

      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))

      setLastTouchCenter({ x: touch.clientX, y: touch.clientY })
    } else if (e.touches.length === 2) {
      // Two touches - pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)

      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance
        const newScale = Math.max(0.5, Math.min(2, canvasScale * scale))
        setCanvasScale(newScale)
      }

      setLastTouchDistance(distance)
    }
  }

  const handleTouchEnd = () => {
    setIsDraggingCanvas(false)
    setLastTouchDistance(0)
  }

  // Reset canvas view
  const resetCanvasView = () => {
    const isBitcoin = appState.selectedWorkflow === 'bitcoin-corp-org'
    setCanvasScale(isBitcoin ? 0.2 : 0.35) // Reset to default zoom level (0.2 for bitcoin-corp, 0.35 for others)
    setCanvasOffset({ x: 0, y: 0 })
  }

  // Helper function for centered zoom operations (for keyboard shortcuts)
  const zoomToCenterFromKeyboard = (newScale: number) => {
    const canvasElement = boardRef.current
    if (!canvasElement) {
      setCanvasScale(newScale)
      return
    }

    const rect = canvasElement.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setCanvasScale(prev => {
      if (newScale !== prev) {
        // Calculate the world position of the screen center
        const worldCenterX = (centerX - canvasOffset.x) / prev
        const worldCenterY = (centerY - canvasOffset.y) / prev

        // Calculate new offset to keep the center at the same world position
        const newOffsetX = centerX - worldCenterX * newScale
        const newOffsetY = centerY - worldCenterY * newScale

        setCanvasOffset({
          x: newOffsetX,
          y: newOffsetY
        })
      }

      return newScale
    })
  }

  // Keyboard shortcuts for zoom controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle zoom shortcuts when in workflow view
      if (currentView !== 'workflow' || !currentWorkflow) return

      // Check for Ctrl/Cmd key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault()
            zoomToCenterFromKeyboard(Math.min(5, canvasScale + 0.25))
            break
          case '-':
            e.preventDefault()
            zoomToCenterFromKeyboard(Math.max(0.1, canvasScale - 0.25))
            break
          case '0':
            e.preventDefault()
            resetCanvasView()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentView, currentWorkflow])

  // Enhanced mouse wheel zoom support with proper mouse-centered zooming
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only handle zoom when in workflow view
      if (currentView !== 'workflow' || !currentWorkflow) return

      // Check if we're over the node palette or other UI elements
      const target = e.target as HTMLElement
      if (target.closest('.scrollbar-always-visible') || target.closest('button') || target.closest('input')) {
        return // Don't zoom when scrolling in UI elements
      }

      e.preventDefault()

      // Get the canvas element and its bounds
      const canvasElement = boardRef.current
      if (!canvasElement) return

      const rect = canvasElement.getBoundingClientRect()

      // Get mouse position relative to canvas
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate zoom delta - more sensitive in zoom mode or with modifier keys
      const isZoomMode = currentWorkflow.currentTool === 'zoom'
      const zoomSensitivity = isZoomMode ? 0.08 : (e.ctrlKey || e.metaKey ? 0.1 : 0.05)
      const delta = e.deltaY > 0 ? -zoomSensitivity : zoomSensitivity

      setCanvasScale(prev => {
        const newScale = Math.max(0.1, Math.min(5, prev + delta))

        // Only adjust offset if scale actually changed
        if (newScale !== prev) {
          const scaleRatio = newScale / prev

          // Calculate the world position of the mouse cursor
          const worldMouseX = (mouseX - canvasOffset.x) / prev
          const worldMouseY = (mouseY - canvasOffset.y) / prev

          // Calculate new offset to keep the mouse cursor at the same world position
          const newOffsetX = mouseX - worldMouseX * newScale
          const newOffsetY = mouseY - worldMouseY * newScale

          setCanvasOffset({
            x: newOffsetX,
            y: newOffsetY
          })
        }

        return newScale
      })
    }

    const canvasElement = boardRef.current
    if (canvasElement) {
      canvasElement.addEventListener('wheel', handleWheel, { passive: false })
      return () => canvasElement.removeEventListener('wheel', handleWheel)
    }
  }, [currentView, currentWorkflow, boardRef])

  // Global scroll prevention for workflow view to make zoom stable
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      // Only prevent scrolling when in workflow view
      if (currentView !== 'workflow' || !currentWorkflow) return

      const target = e.target as HTMLElement

      // Allow scrolling in specific UI elements that need it
      const allowScrollElements = [
        '.scrollbar-always-visible',  // Node palette
        'button',
        'input',
        'textarea',
        '.overflow-y-auto',           // Scrollable containers
        '[data-allow-scroll="true"]', // Explicitly marked elements
        '.bg-black\\/50',             // Modal backdrop (for modal scrolling)
      ]

      const shouldAllowScroll = allowScrollElements.some(selector =>
        target.closest(selector)
      )

      if (!shouldAllowScroll) {
        // Prevent page scrolling to make canvas zoom stable
        e.preventDefault()
        e.stopPropagation()
      }
    }

    // Add global wheel listener with passive: false to allow preventDefault
    document.addEventListener('wheel', handleGlobalWheel, { passive: false })

    return () => {
      document.removeEventListener('wheel', handleGlobalWheel)
    }
  }, [currentView, currentWorkflow])

  const getNodeIcon = (type: string) => {
    const iconSize = isMobile ? "w-3 h-3" : "w-4 h-4"
    switch (type) {
      case 'payment': return <DollarSign className={iconSize} />
      case 'contract': return <FileText className={iconSize} />
      case 'task': return <Target className={iconSize} />
      case 'decision': return <AlertTriangle className={iconSize} />
      case 'milestone': return <CheckCircle className={iconSize} />
      case 'team': return <Users className={iconSize} />
      case 'kpi': return <BarChart3 className={iconSize} />
      case 'employee': return <User className={iconSize} />
      case 'deliverable': return <Package className={iconSize} />
      case 'asset': return <Home className={iconSize} />
      case 'mint': return <Coins className={iconSize} />
      case 'payroll': return <CreditCard className={iconSize} />
      case 'organization': return <Building className={iconSize} />
      case 'role': return <Crown className={iconSize} />
      case 'member': return <UserCheck className={iconSize} />
      case 'instrument': return <Banknote className={iconSize} />
      case 'integration': return <Plug className={iconSize} />
      case 'production': return <Settings className={iconSize} />
      case 'marketing': return <TrendingUp className={iconSize} />
      case 'sales': return <ShoppingCart className={iconSize} />
      case 'legal': return <Scale className={iconSize} />
      case 'finance': return <PieChart className={iconSize} />
      case 'hr': return <Users className={iconSize} />
      case 'it': return <Monitor className={iconSize} />
      case 'operations': return <Cog className={iconSize} />
      // New node types
      case 'api': return <Globe className={iconSize} />
      case 'database': return <Database className={iconSize} />
      case 'loop': return <RefreshCw className={iconSize} />
      case 'condition': return <GitBranch className={iconSize} />
      case 'trigger': return <Zap className={iconSize} />
      case 'webhook': return <Link className={iconSize} />
      case 'email': return <Mail className={iconSize} />
      case 'sms': return <MessageSquare className={iconSize} />
      case 'notification': return <Bell className={iconSize} />
      case 'approval': return <CheckSquare className={iconSize} />
      case 'review': return <Eye className={iconSize} />
      case 'timer': return <Clock className={iconSize} />
      case 'counter': return <Hash className={iconSize} />
      case 'calculator': return <Calculator className={iconSize} />
      case 'transformer': return <Shuffle className={iconSize} />
      case 'validator': return <Shield className={iconSize} />
      case 'aggregator': return <Layers className={iconSize} />
      case 'filter': return <Filter className={iconSize} />
      case 'sorter': return <ArrowUpDown className={iconSize} />
      case 'merger': return <Merge className={iconSize} />
      case 'splitter': return <Split className={iconSize} />
      case 'gateway': return <Router className={iconSize} />
      case 'service': return <Server className={iconSize} />
      case 'function': return <Code className={iconSize} />
      case 'script': return <Terminal className={iconSize} />
      case 'switch': return <GitBranch className={iconSize} />
      case 'router': return <Router className={iconSize} />
      case 'youtube': return <Play className={iconSize} />
      case 'listener': return <Zap className={iconSize} />
      case 'shareholder': return <UserCheck className={iconSize} />
      case 'artist': return <Headphones className={iconSize} />
      case 'delay': return <Clock className={iconSize} />
      case 'queue': return <Layers className={iconSize} />
      case 'batch': return <Package className={iconSize} />
      case 'parallel': return <Copy className={iconSize} />
      case 'sequence': return <ArrowRight className={iconSize} />
      case 'retry': return <RefreshCw className={iconSize} />
      case 'ai-agent': return <Bot className={iconSize} />
      case 'instagram': return <Users className={iconSize} />
      case 'snapchat': return <MessageSquare className={iconSize} />
      case 'threads': return <MessageSquare className={iconSize} />
      case 'twitter': return <MessageSquare className={iconSize} />
      case 'facebook': return <Users className={iconSize} />
      case 'linkedin': return <Users className={iconSize} />
      case 'tiktok': return <Play className={iconSize} />
      case 'youtube': return <Play className={iconSize} />
      case 'discord': return <MessageSquare className={iconSize} />
      case 'telegram': return <Send className={iconSize} />
      case 'whatsapp': return <MessageSquare className={iconSize} />
      case 'reddit': return <MessageSquare className={iconSize} />
      case 'voice': return <Play className={iconSize} />
      case 'elevenlabs': return <Play className={iconSize} />
      case 'midjourney': return <Palette className={iconSize} />
      case 'veo3': return <PlayCircle className={iconSize} />
      case 'openai': return <Bot className={iconSize} />
      case 'anthropic': return <Bot className={iconSize} />
      case 'stability': return <Palette className={iconSize} />
      case 'runway': return <PlayCircle className={iconSize} />
      case 'replicate': return <RefreshCw className={iconSize} />
      case 'huggingface': return <Bot className={iconSize} />
      case 'cohere': return <Bot className={iconSize} />
      case 'perplexity': return <Bot className={iconSize} />
      case 'salesforce': return <Building className={iconSize} />
      case 'hubspot': return <TrendingUp className={iconSize} />
      case 'pipedrive': return <Target className={iconSize} />
      case 'googlesheets': return <Grid className={iconSize} />
      case 'excel': return <BarChart3 className={iconSize} />
      case 'airtable': return <Database className={iconSize} />
      case 'notion': return <FileText className={iconSize} />
      case 'stripe': return <CreditCard className={iconSize} />
      case 'paypal': return <DollarSign className={iconSize} />
      case 'square': return <CreditCard className={iconSize} />
      case 'slack': return <MessageSquare className={iconSize} />
      case 'teams': return <Users className={iconSize} />
      case 'zoom': return <PlayCircle className={iconSize} />
      default: return <Circle className={iconSize} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'failed': return 'bg-red-500'
      case 'paused': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'success': return 'stroke-green-400'
      case 'failure': return 'stroke-red-400'
      case 'payment': return 'stroke-yellow-400'
      case 'task': return 'stroke-blue-400'
      case 'conditional': return 'stroke-purple-400'
      case 'notification': return 'stroke-cyan-400'
      case 'trigger': return 'stroke-amber-400'
      default: return 'stroke-white'
    }
  }

  const addNode = (type: WorkflowNode['type']) => {
    if (!currentWorkflow) return

    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type,
      name: `New ${type}`,
      description: `Description for ${type}`,
      x: Math.random() * 800 + 100,
      y: Math.random() * 400 + 100,
      status: 'pending',
      connections: []
    }

    if (type === 'payment') newNode.amount = 1000
    if (type === 'contract') newNode.deadline = '2024-03-01'
    if (type === 'task') newNode.assignees = ['Team Member']
    if (type === 'decision') newNode.conditions = ['Yes', 'No']
    if (type === 'team') newNode.assignees = ['Member 1', 'Member 2']

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            nodes: [...w.nodes, newNode],
            selectedNode: newNode.id,
            updatedAt: new Date().toISOString()
          }
          : w
      )
    }))
  }

  const updateNode = (id: string, updates: Partial<WorkflowNode>) => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            nodes: w.nodes.map(node =>
              node.id === id ? { ...node, ...updates } : node
            ),
            updatedAt: new Date().toISOString()
          }
          : w
      )
    }))
  }

  const deleteNode = (id: string) => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            nodes: w.nodes.filter(n => n.id !== id),
            connections: w.connections.filter(c => c.from !== id && c.to !== id),
            selectedNode: w.selectedNode === id ? null : w.selectedNode,
            updatedAt: new Date().toISOString()
          }
          : w
      )
    }))
  }

  const startConnection = (fromId: string) => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? { ...w, isConnecting: fromId }
          : w
      )
    }))
  }

  const completeConnection = (toId: string) => {
    if (!currentWorkflow) return

    if (currentWorkflow.isConnecting && currentWorkflow.isConnecting !== toId) {
      const newConnection: Connection = {
        id: `${currentWorkflow.isConnecting}-${toId}`,
        from: currentWorkflow.isConnecting,
        to: toId,
        type: 'task'
      }
      setAppState(prev => ({
        ...prev,
        workflows: prev.workflows.map(w =>
          w.id === currentWorkflow.id
            ? {
              ...w,
              connections: [...w.connections, newConnection],
              isConnecting: null,
              updatedAt: new Date().toISOString()
            }
            : w
        )
      }))
    } else {
      setAppState(prev => ({
        ...prev,
        workflows: prev.workflows.map(w =>
          w.id === currentWorkflow.id
            ? { ...w, isConnecting: null }
            : w
        )
      }))
    }
  }

  const handleMouseDown = (e: React.MouseEvent, id?: string) => {
    if (!currentWorkflow) return

    if (id) {
      setAppState(prev => ({
        ...prev,
        workflows: prev.workflows.map(w =>
          w.id === currentWorkflow.id
            ? { ...w, dragging: id, selectedNode: id }
            : w
        )
      }))
    }
    e.stopPropagation()
  }

  // New canvas functions
  const handleNodesDelete = (ids: string[]) => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            nodes: w.nodes.filter(node => !ids.includes(node.id)),
            connections: w.connections.filter(conn =>
              !ids.includes(conn.from) && !ids.includes(conn.to)
            ),
            selectedNodes: w.selectedNodes.filter(id => !ids.includes(id))
          }
          : w
      )
    }))
  }

  const handleNodesCopy = (ids: string[]) => {
    if (!currentWorkflow) return

    const nodesToCopy = currentWorkflow.nodes.filter(node => ids.includes(node.id))
    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? { ...w, clipboard: nodesToCopy }
          : w
      )
    }))
  }

  const handleNodesPaste = (position?: { x: number; y: number }) => {
    if (!currentWorkflow || currentWorkflow.clipboard.length === 0) return

    const pastePosition = position || { x: 100, y: 100 }
    const newNodes = currentWorkflow.clipboard.map((node, index) => ({
      ...node,
      id: `${Date.now()}-${index}`,
      x: pastePosition.x + (index * 20),
      y: pastePosition.y + (index * 20),
      connections: []
    }))

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? { ...w, nodes: [...w.nodes, ...newNodes] }
          : w
      )
    }))
  }

  const handleToolChange = (tool: WorkflowState['currentTool']) => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? { ...w, currentTool: tool }
          : w
      )
    }))
  }

  const handleSelectionChange = (nodeIds: string[]) => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? { ...w, selectedNodes: nodeIds }
          : w
      )
    }))
  }

  const handleAddNode = (type: WorkflowNode['type'], position: { x: number; y: number }) => {
    if (!currentWorkflow) return

    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      description: `New ${type} node`,
      x: position.x,
      y: position.y,
      status: 'pending',
      connections: []
    }

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? { ...w, nodes: [...w.nodes, newNode] }
          : w
      )
    }))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!currentWorkflow || !currentWorkflow.dragging || !boardRef.current) return

    const rect = boardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    updateNode(currentWorkflow.dragging, { x, y })
  }

  const handleMouseUp = () => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? { ...w, dragging: null }
          : w
      )
    }))
  }

  const getNodePosition = (id: string) => {
    return currentWorkflow?.nodes.find(n => n.id === id)
  }

  const toggleWorkflowStatus = () => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            workflowStatus: w.workflowStatus === 'running' ? 'paused' : 'running',
            updatedAt: new Date().toISOString()
          }
          : w
      )
    }))
  }

  const toggleAutoMode = () => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            autoMode: !w.autoMode,
            updatedAt: new Date().toISOString()
          }
          : w
      )
    }))
  }

  const advanceWorkflow = () => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            nodes: w.nodes.map(node => {
              if (node.status === 'pending') {
                return { ...node, status: 'active' }
              } else if (node.status === 'active') {
                return { ...node, status: 'completed' }
              }
              return node
            }),
            updatedAt: new Date().toISOString()
          }
          : w
      )
    }))
  }

  // Workflow management functions
  const createWorkflow = (name: string, description: string, folder?: string) => {
    const newWorkflow: WorkflowState = {
      id: Date.now().toString(),
      name,
      description,
      nodes: [],
      connections: [],
      selectedNode: null,
      selectedNodes: [],
      isConnecting: null,
      dragging: null,
      workflowStatus: 'stopped',
      autoMode: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizationId: selectedOrganization || undefined,
      currentTool: 'select',
      clipboard: [],
      gridSnap: true,
      showGrid: true,
      folder: folder?.trim() || undefined
    }

    setAppState(prev => ({
      ...prev,
      workflows: [...prev.workflows, newWorkflow],
      selectedWorkflow: newWorkflow.id
    }))
  }

  const openWorkflow = (workflowId: string) => {
    setAppState(prev => ({
      ...prev,
      selectedWorkflow: workflowId
    }))
  }

  const deleteWorkflow = (workflowId: string) => {
    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.filter(w => w.id !== workflowId),
      selectedWorkflow: prev.selectedWorkflow === workflowId ? null : prev.selectedWorkflow
    }))
  }

  const updateWorkflow = (workflowId: string, updates: Partial<WorkflowState>) => {
    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === workflowId
          ? { ...w, ...updates, updatedAt: new Date().toISOString() }
          : w
      )
    }))
  }

  const createFolder = (folderName: string) => {
    setAppState(prev => ({
      ...prev,
      folders: [...prev.folders, folderName.trim()]
    }))
  }

  const deleteFolder = (folderName: string) => {
    setAppState(prev => ({
      ...prev,
      folders: prev.folders.filter(f => f !== folderName),
      // Remove folder from workflows that use it
      workflows: prev.workflows.map(w =>
        w.folder === folderName ? { ...w, folder: undefined } : w
      )
    }))
  }

  // Role management functions
  const createRole = (name: string, description: string, icon: string, permissions: string[], defaultShareAllocation: number, automationType: 'ai-agent' | 'workflow' | 'hybrid') => {
    const newRole: Role = {
      id: Date.now().toString(),
      name,
      description,
      icon,
      permissions,
      defaultShareAllocation,
      automationType,
      isAutomated: true,
      workflowId: null, // Will be linked to a workflow later
      aiPrompt: automationType === 'ai-agent' ? `You are a ${name} AI agent. ${description}` : undefined,
      organizationId: selectedOrganization || undefined
    }

    setAppState(prev => ({
      ...prev,
      roles: [...prev.roles, newRole]
    }))
  }

  const updateRole = (roleId: string, updates: Partial<Role>) => {
    setAppState(prev => ({
      ...prev,
      roles: prev.roles.map(r =>
        r.id === roleId
          ? { ...r, ...updates }
          : r
      )
    }))
  }

  const deleteRole = (roleId: string) => {
    setAppState(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r.id !== roleId)
    }))
  }

  // API Key management functions
  const createApiKey = (name: string, permissions: string[]) => {
    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      name,
      key: `cash_sk_${Math.random().toString(36).substring(2, 15)}`,
      permissions,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    setAppState(prev => ({
      ...prev,
      apiKeys: [...prev.apiKeys, newApiKey]
    }))
  }

  const deleteApiKey = (apiKeyId: string) => {
    setAppState(prev => ({
      ...prev,
      apiKeys: prev.apiKeys.filter(key => key.id !== apiKeyId)
    }))
  }

  // SSH Key management functions
  const createSshKey = (name: string, publicKey: string) => {
    const newSshKey: SshKey = {
      id: Date.now().toString(),
      name,
      publicKey,
      fingerprint: `SHA256:${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      isActive: true
    }

    setAppState(prev => ({
      ...prev,
      sshKeys: [...prev.sshKeys, newSshKey]
    }))
  }

  const deleteSshKey = (sshKeyId: string) => {
    setAppState(prev => ({
      ...prev,
      sshKeys: prev.sshKeys.filter(key => key.id !== sshKeyId)
    }))
  }

  // MCP Server management functions
  const createMcpServer = (name: string, url: string, description: string) => {
    const newMcpServer: McpServer = {
      id: Date.now().toString(),
      name,
      url,
      description,
      isActive: true,
      createdAt: new Date().toISOString()
    }

    setAppState(prev => ({
      ...prev,
      mcpServers: [...prev.mcpServers, newMcpServer]
    }))
  }

  const deleteMcpServer = (mcpServerId: string) => {
    setAppState(prev => ({
      ...prev,
      mcpServers: prev.mcpServers.filter(server => server.id !== mcpServerId)
    }))
  }

  const toggleMcpServer = (mcpServerId: string) => {
    setAppState(prev => ({
      ...prev,
      mcpServers: prev.mcpServers.map(server =>
        server.id === mcpServerId
          ? { ...server, isActive: !server.isActive }
          : server
      )
    }))
  }

  // User Profile management functions
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setAppState(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }))
  }

  // Organization Management Functions
  const createOrganization = (name: string, description: string, tokenSymbol: string) => {
    const newOrg: Organization = {
      id: Date.now().toString(),
      name,
      description,
      tokenSymbol,
      totalShares: 1000000,
      members: [],
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    setAppState(prev => ({
      ...prev,
      organizations: [...prev.organizations, newOrg],
      selectedOrganization: newOrg.id
    }))
  }

  const addMember = (organizationId: string, handle: string, displayName: string, roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    const newMember: HandCashHandle = {
      id: Date.now().toString(),
      handle,
      displayName,
      shareAllocation: role?.defaultShareAllocation || 0,
      role: role?.name || 'Member',
      organizationId,
      kycStatus: 'not_started',
      kycDocuments: [],
      joinedAt: new Date().toISOString(),
      status: 'pending'
    }
    setAppState(prev => ({
      ...prev,
      organizations: prev.organizations.map(org =>
        org.id === organizationId
          ? { ...org, members: [...org.members, newMember] }
          : org
      )
    }))
  }

  const updateShareAllocation = (organizationId: string, memberId: string, shares: number) => {
    setAppState(prev => ({
      ...prev,
      organizations: prev.organizations.map(org =>
        org.id === organizationId
          ? {
            ...org,
            members: org.members.map(member =>
              member.id === memberId
                ? { ...member, shareAllocation: shares }
                : member
            )
          }
          : org
      )
    }))
  }

  const setCurrentView = (view: AppState['currentView']) => {
    console.log('🔍 setCurrentView called with:', {
      view,
      previousView: appState.currentView,
      timestamp: new Date().toISOString(),
      viewType: typeof view,
      validViews: ['dashboard', 'workflow', 'workflows', 'organizations', 'roles', 'people', 'instruments', 'contracts', 'wallets', 'security', 'integrations', 'agents', 'settings', 'profile', 'billing', 'market', 'launchpad']
    })
    setAppState(prev => ({ ...prev, currentView: view }))
  }

  // Function to navigate to member modal from team nodes
  const navigateToMember = (memberName: string) => {
    // Switch to members view
    setCurrentView('people')

    // Find the member by name in the current organization
    const currentOrg = organizations.find(org => org.id === selectedOrganization)
    if (currentOrg) {
      const member = currentOrg.members.find(m =>
        m.displayName === memberName ||
        m.handle === memberName ||
        `${m.firstName} ${m.lastName}` === memberName
      )

      if (member) {
        // We'll need to trigger the member modal opening
        // This will be handled by the MembersView component
        setAppState(prev => ({
          ...prev,
          currentView: 'people',
          selectedMember: member // We'll add this to AppState
        }))
      }
    }
  }

  const toggleSidebar = () => {
    setAppState(prev => ({ ...prev, sidebarOpen: !prev.sidebarOpen }))
  }

  const selectOrganization = (orgId: string) => {
    setAppState(prev => ({ ...prev, selectedOrganization: orgId }))
  }

  const deselectOrganization = () => {
    setAppState(prev => ({ ...prev, selectedOrganization: null }))
  }

  // AI Chat Functions
  const toggleChat = () => {
    setAppState(prev => ({ ...prev, isChatOpen: !prev.isChatOpen }))
  }

  const sendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      status: 'sending'
    }

    setAppState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage]
    }))

    // Redirect to AUDEX workflow canvas
    setCurrentView('workflow')

    // Find and set the AUDEX workflow (ID: '2')
    const audexWorkflow = appState.workflows.find(w => w.id === '2')
    if (audexWorkflow) {
      setAppState(prev => ({
        ...prev,
        currentWorkflow: audexWorkflow
      }))
    }

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = "Welcome to the AUDEX workflow canvas! I've opened the Example AUDEX workflow for you. This shows the complete music streaming and royalty distribution system with YouTube revenue, Spotify royalties, NFT sales, and artist distribution. Explore the nodes and connections to see how money flows through the system."
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        status: 'sent'
      }

      setAppState(prev => ({
        ...prev,
        chatMessages: prev.chatMessages.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
        ).concat(aiMessage)
      }))
    }, 1000)
  }

  const toggleNodeExpansion = (nodeId: string) => {
    if (!currentWorkflow) return

    setAppState(prev => ({
      ...prev,
      workflows: prev.workflows.map(w =>
        w.id === currentWorkflow.id
          ? {
            ...w,
            nodes: w.nodes.map(node =>
              node.id === nodeId ? { ...node, isExpanded: !node.isExpanded } : node
            ),
            updatedAt: new Date().toISOString()
          }
          : w
      )
    }))
  }

  const processAICommand = (command: string): string => {
    const lowerCommand = command.toLowerCase()

    // Canvas node creation commands - more flexible patterns
    if ((lowerCommand.includes('add') || lowerCommand.includes('create')) &&
      (lowerCommand.includes('node') || lowerCommand.includes('to canvas') || lowerCommand.includes('to the canvas') ||
        lowerCommand.includes('ceo') || lowerCommand.includes('youtube') || lowerCommand.includes('shareholder') ||
        lowerCommand.includes('database') || lowerCommand.includes('api') || lowerCommand.includes('contract'))) {

      // Extract node types from the command
      const nodeTypes = {
        'ceo': 'role',
        'chief executive officer': 'role',
        'cto': 'role',
        'chief technology officer': 'role',
        'cfo': 'role',
        'chief financial officer': 'role',
        'cmo': 'role',
        'chief marketing officer': 'role',
        'youtube': 'youtube',
        'youtube node': 'youtube',
        'shareholder': 'member',
        'shareholders': 'member',
        'organization': 'organization',
        'org': 'organization',
        'payment': 'payment',
        'contract': 'contract',
        'team': 'team',
        'task': 'task',
        'decision': 'decision',
        'milestone': 'milestone',
        'database': 'database',
        'db': 'database',
        'api': 'api',
        'api call': 'api',
        'email': 'email',
        'webhook': 'webhook',
        'integration': 'integration',
        'wallet': 'wallets',
        'wallets': 'wallets',
        'instrument': 'instrument',
        'financial instrument': 'instrument'
      }

      const foundNodes = []
      for (const [keyword, nodeType] of Object.entries(nodeTypes)) {
        if (lowerCommand.includes(keyword)) {
          foundNodes.push({ keyword, type: nodeType })
        }
      }

      // Remove duplicates based on type
      const uniqueNodes = foundNodes.filter((node, index, self) =>
        index === self.findIndex(n => n.type === node.type)
      )

      if (uniqueNodes.length > 0) {
        // Check if we have access to the active canvas
        const addNodeToActiveCanvas = (window as any).addNodeToActiveCanvas
        if (addNodeToActiveCanvas) {
          const addedNodes: string[] = []
          uniqueNodes.forEach(({ keyword, type }) => {
            const success = addNodeToActiveCanvas(type)
            if (success) {
              addedNodes.push(keyword)
            }
          })

          if (addedNodes.length > 0) {
            const nodeList = addedNodes.map(n => n.toUpperCase()).join(', ')
            return `✅ Added ${nodeList} node${addedNodes.length > 1 ? 's' : ''} to the canvas! You can see ${addedNodes.length > 1 ? 'them' : 'it'} in your current workflow and connect ${addedNodes.length > 1 ? 'them' : 'it'} to other nodes.`
          } else {
            return `❌ Failed to add nodes to the canvas. Please try again.`
          }
        } else {
          return `❌ Please make sure you have a workflow canvas open. Go to Workflows section and open or create a workflow first.`
        }
      } else if (uniqueNodes.length > 0 && !currentWorkflow) {
        return `❌ Please create or select a workflow first before adding nodes to the canvas. Go to the Workflows section to create a new workflow.`
      } else {
        return `I can add these types of nodes to your canvas:
        
        **👥 Business & Roles**
        • CEO, CTO, CFO, CMO (leadership roles)
        • Organization, Team, Shareholder
        
        **⚙️ Process & Workflow**  
        • Task, Decision, Payment, Milestone, Contract
        
        **🔗 Integrations**
        • YouTube, Database, API, Email, Webhook, Wallet
        
        **Examples:**
        • "Add a CEO node to the canvas"
        • "Create a YouTube and Database node"
        • "Add shareholder and contract nodes"`
      }
    }

    // Organization creation
    if (lowerCommand.includes('create') && lowerCommand.includes('organization')) {
      const name = command.match(/organization\s+(?:called\s+)?([a-zA-Z\s]+)/i)?.[1] || 'New Organization'
      const orgId = Date.now().toString()
      createOrganization(name.trim(), 'AI-created organization', 'ORG')
      return `✅ Created organization "${name.trim()}" with ID ${orgId}. You can now add roles and members.`
    }

    // Add roles
    if (lowerCommand.includes('add') && lowerCommand.includes('role')) {
      const roleMatch = command.match(/add\s+(CEO|CTO|CMO|CFO|Data\s+Analyst|Marketer|Developer|Designer|Legal)/i)
      if (roleMatch) {
        const roleName = roleMatch[1]
        return `✅ Role "${roleName}" is already available in the system. You can assign it to team members.`
      }
      return `Available roles: CEO, CTO, CMO, CFO, Data Analyst, Marketer, Developer, Designer, Legal`
    }

    // Equity allocation
    if (lowerCommand.includes('equity') || lowerCommand.includes('shares')) {
      const equityMatch = command.match(/(\d+)%\s+equity/i)
      if (equityMatch) {
        const percentage = equityMatch[1]
        return `✅ I'll help you allocate ${percentage}% equity. Please select the organization and member in the interface.`
      }
      return `To allocate equity, specify the percentage (e.g., "10% equity") and I'll help you assign it.`
    }

    // Token creation
    if (lowerCommand.includes('token') && lowerCommand.includes('billion')) {
      return `✅ I can help you create a token with 1 billion supply. Please specify the blockchain (e.g., "Bitcoin SV") and token symbol.`
    }

    // Contract generation
    if (lowerCommand.includes('contract') && (lowerCommand.includes('employment') || lowerCommand.includes('employee'))) {
      return `✅ I'll generate an employment contract with KPIs and clawback conditions. This will create a new contract node in your workflow.`
    }

    // Team expansion
    if (lowerCommand.includes('team') && lowerCommand.includes('expand')) {
      return `✅ I can help you expand your team. Please specify the number of people and their roles.`
    }

    // Help and capabilities
    if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      return `🤖 **I can help you build and manage workflows!**
      
      **🎯 Canvas Operations**
      • Add nodes: "Add a CEO node to the canvas"
      • Multiple nodes: "Create YouTube and Database nodes"
      • Business roles: CEO, CTO, CFO, CMO, Shareholder
      
      **🏢 Organization Management**  
      • Create organizations: "Create organization called Acme Corp"
      • Manage roles and equity allocation
      
      **⚙️ Workflow Tools**
      • Add process nodes: Task, Decision, Payment, Milestone
      • Integration nodes: YouTube, API, Database, Email
      
      **💡 Try these commands:**
      • "Add a CEO and CTO node"
      • "Create a YouTube integration"
      • "Add shareholder and contract nodes"
      
      What would you like to create?`
    }

    // Workflow creation
    if (lowerCommand.includes('create') && lowerCommand.includes('workflow')) {
      return `✅ To create a new workflow, go to the **Workflows** section in the sidebar and click "Create Workflow". Once you have a workflow, I can help you add nodes to it!`
    }

    // Default response
    return `I understand you want to: "${command}". I can help you with:
    
    **🎯 Canvas Nodes**: Add CEO, YouTube, Database, API, and other nodes to your workflow
    **🏢 Organizations**: Create and manage organizations  
    **👥 Roles & Equity**: Allocate roles and equity shares
    **📄 Contracts**: Generate employment and business contracts
    **🔧 Team Management**: Expand and organize teams
    **🪙 Tokens**: Create and manage blockchain tokens
    
    **Quick Examples:**
    • "Add a CEO node to the canvas"
    • "Create a YouTube and Database node"  
    • "Create organization called Acme Corp"
    • "Help" - to see all my capabilities
    
    What would you like me to help you with?`
  }

  return (
    <div
      className={`min-h-screen relative overflow-x-hidden overflow-y-auto flex ${isDark ? 'bg-black' : 'bg-white'}`}
      data-theme={isDark ? 'dark' : 'light'}
    >
      {/* Light mode overrides */}
      {!isDark && (
        <style jsx global>{`
          [data-theme="light"] {
            --cb-bg: #ffffff;
            --cb-bg-secondary: #f9fafb;
            --cb-text: #111827;
            --cb-text-secondary: #4b5563;
            --cb-border: rgba(0,0,0,0.1);
          }
          [data-theme="light"] .bg-black\\/80,
          [data-theme="light"] .bg-black\\/90,
          [data-theme="light"] .bg-black\\/40,
          [data-theme="light"] .bg-black\\/50 {
            background-color: rgba(255,255,255,0.9) !important;
          }
          [data-theme="light"] .bg-black {
            background-color: #ffffff !important;
          }
          [data-theme="light"] .text-white {
            color: #111827 !important;
          }
          [data-theme="light"] .text-gray-400,
          [data-theme="light"] .text-gray-500 {
            color: #6b7280 !important;
          }
          [data-theme="light"] .text-gray-300 {
            color: #374151 !important;
          }
          [data-theme="light"] .border-white\\/20,
          [data-theme="light"] .border-white\\/15,
          [data-theme="light"] .border-white\\/10 {
            border-color: rgba(0,0,0,0.1) !important;
          }
          [data-theme="light"] .border-gray-800 {
            border-color: #e5e7eb !important;
          }
          [data-theme="light"] .hover\\:bg-white\\/10:hover {
            background-color: rgba(0,0,0,0.05) !important;
          }
          [data-theme="light"] .hover\\:bg-white\\/20:hover,
          [data-theme="light"] .bg-white\\/20 {
            background-color: rgba(0,0,0,0.1) !important;
          }
          [data-theme="light"] .hover\\:text-white:hover {
            color: #111827 !important;
          }
          [data-theme="light"] .bg-gray-900,
          [data-theme="light"] .bg-gray-900\\/50,
          [data-theme="light"] .bg-zinc-900 {
            background-color: #f3f4f6 !important;
          }
          [data-theme="light"] .bg-zinc-800,
          [data-theme="light"] .bg-gray-800 {
            background-color: #e5e7eb !important;
          }
          [data-theme="light"] input,
          [data-theme="light"] textarea,
          [data-theme="light"] select {
            background-color: #ffffff !important;
            color: #111827 !important;
            border-color: #d1d5db !important;
          }
          [data-theme="light"] input::placeholder,
          [data-theme="light"] textarea::placeholder {
            color: #9ca3af !important;
          }
          [data-theme="light"] .shadow-xl,
          [data-theme="light"] .shadow-2xl {
            box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;
          }
        `}</style>
      )}


      {/* Animated background gradient */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-black via-gray-900/20 to-black' : 'bg-gradient-to-br from-white via-gray-100/50 to-white'}`}>
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_50%)]' : 'bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_50%)]'}`}></div>
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.01),transparent_50%)]' : 'bg-[radial-gradient(circle_at_20%_80%,rgba(0,0,0,0.01),transparent_50%)]'}`}></div>
      </div>

      {/* Sidebar (hidden on mobile; replaced by dropdown) */}
      {!isMobile && sidebarOpen && (
        <div className={`relative min-h-screen w-64 backdrop-blur-xl z-30 flex-shrink-0 ${isDark ? 'bg-black/80 border-r border-white/20' : 'bg-white/80 border-r border-black/10'}`}>
          <div className="p-4">
            {/* Close button - only show on mobile */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white transition-colors mb-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Navigation */}
            <nav className="space-y-1">

              <button
                onClick={() => setCurrentView('profile')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'profile'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Profile</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setCurrentView('workflow')
                  // Clear any selected workflow to show the dashboard
                  setAppState(prev => ({ ...prev, selectedWorkflow: null }))
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'workflow'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Workflows</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('organizations')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'organizations'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">Organizations</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('roles')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'roles'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm">Roles</span>
                </div>
              </button>

              <button
                onClick={() => {
                  console.log('🔘 Agents button clicked!')
                  setCurrentView('agents')
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'agents'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-sm">Agents</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('people')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'people'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">People</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('instruments')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'instruments'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm">Instruments</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('contracts')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'contracts'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Contracts</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('wallets')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'wallets'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Wallets</span>
                </div>
              </button>


              <button
                onClick={() => setCurrentView('integrations')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'integrations'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Integrations</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('registration')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'registration'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <ShieldIcon className="w-4 h-4" />
                  <span className="text-sm">Register</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('launchpad')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'launchpad'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4" />
                  <span className="text-sm">Launchpad</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('market')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'market'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Market</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('billing')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'billing'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Billing & Plans</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all ${currentView === 'settings'
                  ? 'bg-white/20 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </div>
              </button>

            </nav>

            {/* Selected Organization */}
            <div className="mt-8">
              {selectedOrganization && (
                <div className="p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Current Organization</h3>
                    <button
                      onClick={() => setAppState(prev => ({ ...prev, selectedOrganization: null }))}
                      className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                      title="Clear organization selection"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {organizations.find(org => org.id === selectedOrganization)?.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative min-h-0">
        {/* Header */}
        <div id="app-header" ref={headerRef} className={`absolute top-0 left-0 right-0 z-50 ${isMobile ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile ? (
                <button
                  onClick={() => setMobileMenuOpen((v) => !v)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Open menu"
                >
                  <Menu className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                </button>
              ) : (
                !sidebarOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Open sidebar"
                  >
                    <Menu className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                  </button>
                )
              )}

              {/* Mobile dropdown menu */}
              {isMobile && mobileMenuOpen && (
                <div className="absolute left-3 top-14 z-30 w-56 bg-black/90 border border-white/15 rounded-lg shadow-xl">
                  <div className="p-2 space-y-1">
                    <button onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Profile</button>
                    <button
                      onClick={() => {
                        setAppState(prev => ({
                          ...prev,
                          currentView: 'workflow',
                          selectedWorkflow: prev.selectedWorkflow || '1'
                        }))
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm"
                    >
                      Workflows
                    </button>
                    <button onClick={() => { setCurrentView('organizations'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Organizations</button>
                    <button onClick={() => { setCurrentView('roles'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Roles</button>
                    <button onClick={() => { setCurrentView('agents'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Agents</button>
                    <button onClick={() => { setCurrentView('people'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">People</button>
                    <button onClick={() => { setCurrentView('instruments'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Instruments</button>
                    <button onClick={() => { setCurrentView('contracts'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Contracts</button>
                    <button onClick={() => { setCurrentView('wallets'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Wallets</button>

                    <button onClick={() => { setCurrentView('integrations'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Integrations</button>

                    <button onClick={() => { setCurrentView('registration'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Register</button>
                    <div className="border-t border-white/10 my-1"></div>
                    <button onClick={() => { setCurrentView('billing'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Billing & Plans</button>
                    <button onClick={() => { setCurrentView('settings'); setMobileMenuOpen(false) }} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">Settings</button>
                    <button onClick={() => setMobileMenuOpen(false)} className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm">
                      <HandCashAuthButton />
                    </button>
                  </div>
                </div>
              )}




            </div>


          </div>
        </div>

        {/* Content Views */}
        {currentView === 'dashboard' && (
          <div className="absolute inset-0 flex items-start justify-center bg-black pt-12">
            {/* Responsive Letterboxed Video Player */}
            <div className={`${isMobile ? 'w-3/4 h-1/3' : 'w-2/3 h-2/3'} bg-black mt-8 relative`}>
              {/* Main video */}
              <video
                ref={(el) => {
                  if (el) {
                    el.onended = () => {
                      // When main video ends, go straight to AUDEX workflow canvas
                      const audexWorkflow = appState.workflows.find(w => w.id === '2')
                      if (audexWorkflow) {
                        setAppState(prev => ({
                          ...prev,
                          currentWorkflow: audexWorkflow,
                          isChatOpen: true // Open AI Assistant when going to workflow
                        }))
                        setCurrentView('workflow')
                      }
                    };
                  }
                }}
                autoPlay
                muted
                className="w-full h-full object-cover"
                style={{
                  filter: 'contrast(1.5) brightness(0.8) saturate(0.8)'
                }}
                preload="metadata"
              >
                <source src="/cashboard.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {currentView === 'workflow' && !currentWorkflow && (
          <WorkflowsView
            workflows={workflows}
            folders={folders}
            selectedWorkflow={selectedWorkflow}
            onCreateWorkflow={createWorkflow}
            onCreateFolder={createFolder}
            onOpenWorkflow={openWorkflow}
            onDeleteWorkflow={deleteWorkflow}
            onUpdateWorkflow={updateWorkflow}
            isMobile={isMobile}
          />
        )}

        {currentView === 'workflow' && currentWorkflow && (
          <div className="relative h-[calc(100vh-140px)]">
            <WorkflowReactFlowCanvas
              workflow={currentWorkflow}
              tabTitle={currentWorkflow.name}
              onAddNode={() => { }}
              isMobile={isMobile}
              isDark={isDark}
              onNavigateToWorkflow={(workflowId, nodeData) => {
                console.log('📦 onNavigateToWorkflow called:', { workflowId, nodeData })

                // Check if workflow already exists
                const existingWorkflow = appState.workflows.find(w => w.id === workflowId)
                console.log('🔎 Existing workflow found:', !!existingWorkflow, existingWorkflow?.name)

                if (existingWorkflow) {
                  // Navigate to existing workflow
                  console.log('🎯 Setting selectedWorkflow to:', workflowId)
                  setAppState(prev => ({ ...prev, selectedWorkflow: workflowId }))
                } else if (nodeData) {
                  // Create a new workflow for this node dynamically
                  const newWorkflow = {
                    id: workflowId,
                    name: nodeData.label || 'Node Canvas',
                    description: nodeData.description || `Canvas for ${nodeData.label}`,
                    initialZoom: 0.7,
                    nodes: [],
                    connections: [],
                    selectedNode: null,
                    selectedNodes: [],
                    isConnecting: null,
                    dragging: null,
                    workflowStatus: 'running' as const,
                    autoMode: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    currentTool: 'select' as const,
                    clipboard: [],
                    gridSnap: true,
                    showGrid: true,
                    parentWorkflowId: appState.selectedWorkflow, // Track parent for back navigation
                  }

                  setAppState(prev => ({
                    ...prev,
                    workflows: [...prev.workflows, newWorkflow],
                    selectedWorkflow: workflowId
                  }))
                }
              }}
            />
          </div>
        )}

        {currentView === 'organizations' && (
          <OrganizationsView
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onSelectOrganization={selectOrganization}
            onDeselectOrganization={deselectOrganization}
            onCreateOrganization={createOrganization}
          />
        )}

        {currentView === 'roles' && (
          <RolesView
            roles={roles}
            selectedOrganization={selectedOrganization}
            onAddMember={addMember}
            onCreateRole={createRole}
            onUpdateRole={updateRole}
            onDeleteRole={deleteRole}
          />
        )}

        {currentView === 'people' && (
          <PeopleView
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onUpdateShareAllocation={updateShareAllocation}
          />
        )}
        {currentView === 'instruments' && (
          <InstrumentsView
            instruments={instruments}
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onCreateInstrument={(instrument) => {
              const newInstrument: FinancialInstrument = {
                ...instrument,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
              setAppState(prev => ({
                ...prev,
                instruments: [...prev.instruments, newInstrument]
              }))
            }}
            onDeleteInstrument={(id: string) => {
              setAppState(prev => ({
                ...prev,
                instruments: prev.instruments.filter(instrument => instrument.id !== id)
              }))
            }}
            onSelectOrganization={selectOrganization}
            onDeselectOrganization={deselectOrganization}
          />
        )}

        {currentView === 'contracts' && (
          <ContractsView
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            roles={roles}
            instruments={instruments}
            workflows={workflows}
          />
        )}
        {currentView === 'wallets' && (
          <WalletsView
            organizations={organizations}
            selectedOrganization={selectedOrganization}
          />
        )}



        {currentView === 'registration' && (
          <RegistrationView
            organizations={organizations}
            selectedOrganization={selectedOrganization}
          />
        )}



        {currentView === 'integrations' && (
          <IntegrationsView />
        )}

        {currentView === 'market' && (
          <MarketView />
        )}

        {currentView === 'launchpad' && (
          <LaunchpadView />
        )}

        {currentView === 'agents' && (
          <>
            {console.log('🎯 RENDERING AGENTS VIEW - currentView:', currentView, 'agentTemplates count:', getAgentTemplates().length)}
            <div className="absolute inset-0 top-20 p-6 overflow-y-auto">
              <h1 className="text-3xl font-bold text-white mb-6">🤖 AI Agents Dashboard</h1>
              <p className="text-gray-300 mb-6">Manage and configure AI agents for your workflows</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getAgentTemplates().map((agent) => (
                  <div key={agent.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <Bot className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{agent.name}</h3>
                          <p className="text-gray-400 text-sm">{agent.automationType}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${agent.isAutomated ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {agent.isAutomated ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{agent.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Permissions</span>
                        <span className="text-white">{agent.permissions.join(', ')}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Share Allocation</span>
                        <span className="text-white">{agent.defaultShareAllocation}%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Type</span>
                        <span className="text-blue-400 capitalize">{agent.automationType?.replace('-', ' ') || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {currentView === 'settings' && (
          <SettingsView
            apiKeys={apiKeys}
            sshKeys={sshKeys}
            mcpServers={mcpServers}
            onCreateApiKey={createApiKey}
            onDeleteApiKey={deleteApiKey}
            onCreateSshKey={createSshKey}
            onDeleteSshKey={deleteSshKey}
            onCreateMcpServer={createMcpServer}
            onDeleteMcpServer={deleteMcpServer}
            onToggleMcpServer={toggleMcpServer}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            onUpdateProfile={updateUserProfile}
            organizations={organizations}
            roles={roles}
            instruments={instruments}
            contracts={contracts}
            wallets={wallets}
            workflows={workflows}
          />
        )}

        {currentView === 'billing' && (
          <BillingView />
        )}
      </div>

      {/* Demo Modal */}
      <DemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />

      {/* Floating AI Assistant */}
      <FloatingAIAssistant
        isOpen={isChatOpen}
        messages={chatMessages}
        onToggle={toggleChat}
        onSendMessage={sendMessage}
        isMobile={isMobile}
      />

    </div>
  )
}

// Floating AI Assistant Component
function FloatingAIAssistant({
  isOpen,
  messages,
  onToggle,
  onSendMessage,
  isMobile
}: {
  isOpen: boolean
  messages: ChatMessage[]
  onToggle: () => void
  onSendMessage: (message: string) => void
  isMobile: boolean
}) {
  const [inputMessage, setInputMessage] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const assistantRef = React.useRef<HTMLDivElement>(null)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const rect = assistantRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return

    e.preventDefault()

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    // Keep within viewport bounds
    const maxX = window.innerWidth - 400
    const maxY = window.innerHeight - 200

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Add drag event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)

      return () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging])











  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className={`fixed z-50 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isMobile
            ? 'bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12'
            : 'bottom-6 left-1/2 transform -translate-x-1/2 w-14 h-14'
            }`}
        >
          <Bot className={`${isMobile ? 'w-6 h-6' : 'w-7 h-7'} mx-auto`} />
        </button>
      )}

      {/* Wide and Short Chat Window */}
      {isOpen && (
        <div
          ref={assistantRef}
          className="ai-assistant fixed z-50 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            left: position.x || '50%',
            top: position.y || 'auto',
            bottom: position.y === 0 ? '24px' : 'auto',
            transform: position.x === 0 ? 'translateX(-50%)' : 'none',
            width: isMobile ? '320px' : '800px',
            height: isMobile ? '200px' : '250px'
          }}
        >
          {/* Drag Handle */}
          <div
            className="absolute top-0 left-0 right-0 h-6 bg-blue-500/30 hover:bg-blue-500/50 cursor-grab active:cursor-grabbing transition-colors"
            onMouseDown={handleDragStart}
            title="Drag to move"
          ></div>
          {/* Close Button */}
          <button
            onClick={onToggle}
            className="absolute right-2 top-2 p-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 rounded-lg transition-colors z-10"
            title="Close AI Assistant"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-2 pl-8 pr-4 pt-10 pb-2">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center py-4">
                <Bot className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p>Hello! I&apos;m your AI assistant.</p>
                <p className="text-sm mt-1">How can I help you today?</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg ${message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white border border-white/20'
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                      <span suppressHydrationWarning>{message.timestamp.toLocaleTimeString()}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="border-t border-white/20 flex-shrink-0">
            <div className="flex space-x-2 w-full pl-8 pr-4 py-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

// Integrations View Component
function IntegrationsView() {
  const [selectedCategory, setSelectedCategory] = useState<'crm' | 'spreadsheet' | 'cms' | 'payment' | 'communication' | 'social' | 'ai' | 'exchanges' | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const integrations = [
    // CRM Integrations
    {
      id: '1',
      name: 'Salesforce',
      category: 'crm',
      description: 'Customer relationship management platform',
      icon: '🟦',
      status: 'connected',
      lastSync: '2 minutes ago',
      features: ['Contact Sync', 'Deal Tracking', 'Revenue Analytics']
    },
    {
      id: '2',
      name: 'HubSpot',
      category: 'crm',
      description: 'Inbound marketing and sales platform',
      icon: '🟧',
      status: 'available',
      lastSync: null,
      features: ['Lead Management', 'Email Marketing', 'Analytics']
    },
    {
      id: '3',
      name: 'Pipedrive',
      category: 'crm',
      description: 'Sales pipeline management',
      icon: '🔴',
      status: 'available',
      lastSync: null,
      features: ['Pipeline Management', 'Activity Tracking', 'Forecasting']
    },

    // Spreadsheet Integrations
    {
      id: '4',
      name: 'Google Sheets',
      category: 'spreadsheet',
      description: 'Cloud-based spreadsheet application',
      icon: '🟢',
      status: 'connected',
      lastSync: '5 minutes ago',
      features: ['Real-time Sync', 'Formula Support', 'Collaboration']
    },
    {
      id: '5',
      name: 'Microsoft Excel',
      category: 'spreadsheet',
      description: 'Desktop spreadsheet application',
      icon: '🟦',
      status: 'available',
      lastSync: null,
      features: ['Advanced Formulas', 'Data Analysis', 'Charts']
    },
    {
      id: '6',
      name: 'Airtable',
      category: 'spreadsheet',
      description: 'Database-spreadsheet hybrid',
      icon: '🟣',
      status: 'available',
      lastSync: null,
      features: ['Database Views', 'Automations', 'API Access']
    },

    // CMS Integrations
    {
      id: '7',
      name: 'WordPress',
      category: 'cms',
      description: 'Content management system',
      icon: '🔵',
      status: 'connected',
      lastSync: '1 hour ago',
      features: ['Content Sync', 'User Management', 'Plugin Support']
    },
    {
      id: '8',
      name: 'Shopify',
      category: 'cms',
      description: 'E-commerce platform',
      icon: '🟢',
      status: 'available',
      lastSync: null,
      features: ['Product Management', 'Order Processing', 'Analytics']
    },
    {
      id: '9',
      name: 'WooCommerce',
      category: 'cms',
      description: 'WordPress e-commerce plugin',
      icon: '🟠',
      status: 'available',
      lastSync: null,
      features: ['Product Catalog', 'Payment Processing', 'Inventory']
    },

    // Payment Integrations
    {
      id: '10',
      name: 'Stripe',
      category: 'payment',
      description: 'Payment processing platform',
      icon: '💳',
      status: 'connected',
      lastSync: 'Real-time',
      features: ['Payment Processing', 'Subscription Management', 'Analytics']
    },
    {
      id: '11',
      name: 'PayPal',
      category: 'payment',
      description: 'Digital payment platform',
      icon: '🔵',
      status: 'available',
      lastSync: null,
      features: ['Payment Gateway', 'Business Accounts', 'Mobile Payments']
    },
    {
      id: '12',
      name: 'Square',
      category: 'payment',
      description: 'Point of sale and payment processing',
      icon: '🟢',
      status: 'available',
      lastSync: null,
      features: ['POS System', 'Payment Processing', 'Inventory Management']
    },

    // Communication Integrations
    {
      id: '13',
      name: 'Slack',
      category: 'communication',
      description: 'Team communication platform',
      icon: '🟣',
      status: 'connected',
      lastSync: 'Real-time',
      features: ['Channel Management', 'Bot Integration', 'File Sharing']
    },
    {
      id: '14',
      name: 'Microsoft Teams',
      category: 'communication',
      description: 'Collaboration and communication platform',
      icon: '🔵',
      status: 'available',
      lastSync: null,
      features: ['Video Calls', 'File Collaboration', 'App Integration']
    },
    {
      id: '15',
      name: 'Discord',
      category: 'communication',
      description: 'Voice and text communication',
      icon: '🟣',
      status: 'available',
      lastSync: null,
      features: ['Voice Channels', 'Bot Support', 'Server Management']
    },

    // Social Media Integrations
    {
      id: '16',
      name: 'Instagram',
      category: 'social',
      description: 'Photo and video sharing social network',
      icon: '📸',
      status: 'available',
      lastSync: null,
      features: ['Post Publishing', 'Story Management', 'Analytics', 'DM Automation']
    },
    {
      id: '17',
      name: 'Twitter/X',
      category: 'social',
      description: 'Microblogging and social networking',
      icon: '🐦',
      status: 'available',
      lastSync: null,
      features: ['Tweet Scheduling', 'Thread Management', 'Analytics', 'DM Automation']
    },
    {
      id: '18',
      name: 'Facebook',
      category: 'social',
      description: 'Social networking platform',
      icon: '📘',
      status: 'available',
      lastSync: null,
      features: ['Page Management', 'Post Scheduling', 'Ad Management', 'Analytics']
    },
    {
      id: '19',
      name: 'LinkedIn',
      category: 'social',
      description: 'Professional networking platform',
      icon: '💼',
      status: 'available',
      lastSync: null,
      features: ['Profile Management', 'Content Publishing', 'Connection Management', 'Analytics']
    },
    {
      id: '20',
      name: 'TikTok',
      category: 'social',
      description: 'Short-form video sharing platform',
      icon: '🎵',
      status: 'available',
      lastSync: null,
      features: ['Video Publishing', 'Trend Analysis', 'Analytics', 'Comment Management']
    },
    {
      id: '21',
      name: 'YouTube',
      category: 'social',
      description: 'Video sharing and streaming platform',
      icon: '📺',
      status: 'available',
      lastSync: null,
      features: ['Video Upload', 'Channel Management', 'Analytics', 'Comment Moderation']
    },
    {
      id: '22',
      name: 'Snapchat',
      category: 'social',
      description: 'Multimedia messaging and stories',
      icon: '👻',
      status: 'available',
      lastSync: null,
      features: ['Snap Publishing', 'Story Management', 'Ad Management', 'Analytics']
    },
    {
      id: '23',
      name: 'Threads',
      category: 'social',
      description: 'Text-based conversation platform',
      icon: '🧵',
      status: 'available',
      lastSync: null,
      features: ['Thread Publishing', 'Community Management', 'Analytics', 'Cross-posting']
    },
    {
      id: '24',
      name: 'Telegram',
      category: 'social',
      description: 'Cloud-based messaging platform',
      icon: '✈️',
      status: 'available',
      lastSync: null,
      features: ['Channel Management', 'Bot Integration', 'Message Broadcasting', 'Analytics']
    },
    {
      id: '25',
      name: 'WhatsApp Business',
      category: 'social',
      description: 'Business messaging platform',
      icon: '💚',
      status: 'available',
      lastSync: null,
      features: ['Message Automation', 'Customer Support', 'Broadcast Lists', 'Analytics']
    },
    {
      id: '26',
      name: 'Reddit',
      category: 'social',
      description: 'Social news aggregation and discussion',
      icon: '🔴',
      status: 'available',
      lastSync: null,
      features: ['Post Management', 'Community Engagement', 'Moderation Tools', 'Analytics']
    },

    // AI Service Integrations
    {
      id: '27',
      name: 'OpenAI',
      category: 'ai',
      description: 'Advanced AI models and GPT services',
      icon: '🤖',
      status: 'available',
      lastSync: null,
      features: ['Text Generation', 'Code Completion', 'Image Analysis', 'API Integration']
    },
    {
      id: '28',
      name: 'Anthropic',
      category: 'ai',
      description: 'Claude AI assistant and language models',
      icon: '🧠',
      status: 'available',
      lastSync: null,
      features: ['Conversational AI', 'Content Creation', 'Analysis', 'Reasoning']
    },
    {
      id: '29',
      name: 'Eleven Labs',
      category: 'ai',
      description: 'AI voice generation and cloning',
      icon: '🎤',
      status: 'available',
      lastSync: null,
      features: ['Voice Synthesis', 'Voice Cloning', 'Multiple Languages', 'API Access']
    },
    {
      id: '30',
      name: 'MidJourney',
      category: 'ai',
      description: 'AI-powered image generation',
      icon: '🎨',
      status: 'available',
      lastSync: null,
      features: ['Image Generation', 'Style Transfer', 'Upscaling', 'Variations']
    },
    {
      id: '31',
      name: 'Stability AI',
      category: 'ai',
      description: 'Stable Diffusion and image AI models',
      icon: '🖼️',
      status: 'available',
      lastSync: null,
      features: ['Image Generation', 'Inpainting', 'Outpainting', 'Model Fine-tuning']
    },
    {
      id: '32',
      name: 'Runway ML',
      category: 'ai',
      description: 'AI-powered video and creative tools',
      icon: '🎬',
      status: 'available',
      lastSync: null,
      features: ['Video Generation', 'Background Removal', 'Motion Tracking', 'Style Transfer']
    },
    {
      id: '33',
      name: 'Replicate',
      category: 'ai',
      description: 'Platform for running AI models',
      icon: '🔄',
      status: 'available',
      lastSync: null,
      features: ['Model Hosting', 'API Access', 'Custom Models', 'Scaling']
    },
    {
      id: '34',
      name: 'Hugging Face',
      category: 'ai',
      description: 'Open-source AI model hub',
      icon: '🤗',
      status: 'available',
      lastSync: null,
      features: ['Model Repository', 'Transformers', 'Datasets', 'Inference API']
    },
    {
      id: '35',
      name: 'Cohere',
      category: 'ai',
      description: 'Language AI platform for enterprises',
      icon: '🔗',
      status: 'available',
      lastSync: null,
      features: ['Text Generation', 'Classification', 'Embeddings', 'Search']
    },
    {
      id: '36',
      name: 'Perplexity',
      category: 'ai',
      description: 'AI-powered search and research',
      icon: '🔍',
      status: 'available',
      lastSync: null,
      features: ['AI Search', 'Research Assistant', 'Source Citations', 'Real-time Data']
    },
    {
      id: '37',
      name: 'Veo3',
      category: 'ai',
      description: 'Advanced AI video generation',
      icon: '📹',
      status: 'available',
      lastSync: null,
      features: ['Video Generation', 'Scene Creation', 'Character Animation', 'Style Control']
    }
  ]

  const categories = [
    { id: 'all', name: 'All Integrations', icon: '🔗' },
    { id: 'crm', name: 'CRM Systems', icon: '👥' },
    { id: 'spreadsheet', name: 'Spreadsheets', icon: '📊' },
    { id: 'cms', name: 'CMS & E-commerce', icon: '🌐' },
    { id: 'payment', name: 'Payment Systems', icon: '💳' },
    { id: 'communication', name: 'Communication', icon: '💬' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'ai', name: 'AI Services', icon: '🤖' },
    { id: 'exchanges', name: 'Exchange APIs', icon: '📈' }
  ]

  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const { user, isAuthenticated } = useAuth()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400'
      case 'available': return 'text-blue-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 border-green-400/30'
      case 'available': return 'bg-blue-500/20 border-blue-400/30'
      case 'error': return 'bg-red-500/20 border-red-400/30'
      default: return 'bg-gray-500/20 border-gray-400/30'
    }
  }

  return (
    <div className="absolute inset-0 top-20 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
          <p className="text-gray-400">Connect your favorite tools and platforms to automate workflows and sync data</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as 'crm' | 'spreadsheet' | 'cms' | 'payment' | 'communication' | 'social' | 'ai' | 'exchanges' | 'all')}
                className={`px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${selectedCategory === category.id
                  ? 'bg-blue-500/20 border-blue-400/50 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-400">{integration.description}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBg(integration.status)} ${getStatusColor(integration.status)}`}>
                  {integration.status === 'connected' ? 'Connected' : 'Available'}
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2">Features</h4>
                <div className="flex flex-wrap gap-1">
                  {integration.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Status Info */}
              {integration.lastSync && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400">
                    Last sync: <span className="text-green-400">{integration.lastSync}</span>
                  </p>
                </div>
              )}

              {/* Action Button */}
              <button
                className={`w-full py-2 px-4 rounded-lg transition-all ${integration.status === 'connected'
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-400/30 hover:bg-blue-500/30'
                  }`}
              >
                {integration.status === 'connected' ? 'Manage Connection' : 'Connect'}
              </button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-white mb-2">No integrations found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Market View Component
function MarketView() {
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'volume' | 'marketCap' | 'change24h'>('rank')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock market data - in production this would come from a real API
  const marketData = [
    {
      rank: 1,
      symbol: 'EXT1',
      name: 'Example Token 1',
      price: 45.23,
      change24h: 2.5,
      volume24h: 125000000,
      marketCap: 890000000,
      circulatingSupply: 19678432,
      website: 'https://example1.com',
      socials: {
        twitter: 'https://twitter.com/example1',
        telegram: 'https://t.me/example1',
        discord: 'https://discord.gg/example1'
      }
    },
    {
      rank: 2,
      symbol: 'EXT2',
      name: 'Example Token 2',
      price: 0.0012,
      change24h: -1.2,
      volume24h: 2500000,
      marketCap: 12000000,
      circulatingSupply: 10000000000,
      website: 'https://example2.com',
      socials: {
        twitter: 'https://twitter.com/example2',
        telegram: 'https://t.me/example2'
      }
    },
    {
      rank: 3,
      symbol: 'EXT3',
      name: 'Example Token 3',
      price: 0.000001,
      change24h: 15.8,
      volume24h: 850000,
      marketCap: 1000000,
      circulatingSupply: 1000000000000,
      website: 'https://example3.com',
      socials: {
        twitter: 'https://twitter.com/example3',
        discord: 'https://discord.gg/example3'
      }
    },
    {
      rank: 4,
      symbol: 'EXT4',
      name: 'Example Token 4',
      price: 0.25,
      change24h: 8.3,
      volume24h: 450000,
      marketCap: 2500000,
      circulatingSupply: 10000000,
      website: 'https://example4.com',
      socials: {
        twitter: 'https://twitter.com/example4',
        linkedin: 'https://linkedin.com/company/example4'
      }
    },
    {
      rank: 5,
      symbol: 'EXT5',
      name: 'Example Token 5',
      price: 1.85,
      change24h: -3.1,
      volume24h: 1200000,
      marketCap: 18500000,
      circulatingSupply: 10000000,
      website: 'https://example5.com',
      socials: {
        twitter: 'https://twitter.com/example5',
        telegram: 'https://t.me/example5'
      }
    }
  ]

  const filteredAndSortedData = marketData
    .filter(token =>
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortOrder === 'asc' ? 1 : -1
      switch (sortBy) {
        case 'rank': return (a.rank - b.rank) * direction
        case 'price': return (a.price - b.price) * direction
        case 'volume': return (a.volume24h - b.volume24h) * direction
        case 'marketCap': return (a.marketCap - b.marketCap) * direction
        case 'change24h': return (a.change24h - b.change24h) * direction
        default: return 0
      }
    })

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`
    return `$${price.toFixed(2)}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
    return `$${volume.toFixed(0)}`
  }

  const formatSupply = (supply: number) => {
    if (supply >= 1000000000) return `${(supply / 1000000000).toFixed(1)}B`
    if (supply >= 1000000) return `${(supply / 1000000).toFixed(1)}M`
    if (supply >= 1000) return `${(supply / 1000).toFixed(1)}K`
    return supply.toLocaleString()
  }

  return (
    <div className="absolute inset-0 top-20 p-6">
      <div className="max-w-full mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Token Market</h1>
          <p className="text-gray-400">Real-time token prices, market caps, and trading data</p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="rank">Rank</option>
              <option value="price">Price</option>
              <option value="volume">Volume</option>
              <option value="marketCap">Market Cap</option>
              <option value="change24h">24h Change</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/10 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Market Table */}
        <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-auto h-full">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400 font-medium">Rank</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Token</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Price</th>
                  <th className="text-right p-4 text-gray-400 font-medium">24h Change</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Volume (24h)</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Market Cap</th>
                  <th className="text-right p-4 text-gray-400 font-medium">Circulating Supply</th>
                  <th className="text-center p-4 text-gray-400 font-medium">Links</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((token, index) => (
                  <tr key={token.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">#{token.rank}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{token.symbol[0]}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{token.name}</div>
                          <div className="text-gray-400 text-sm">{token.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-white font-medium">{formatPrice(token.price)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-white">{formatVolume(token.volume24h)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-white">{formatVolume(token.marketCap)}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-gray-400">{formatSupply(token.circulatingSupply)} {token.symbol}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <a
                          href={token.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                          title="Website"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                        {token.socials.twitter && (
                          <a
                            href={token.socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                            title="Twitter"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}
                        {token.socials.telegram && (
                          <a
                            href={token.socials.telegram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                            title="Telegram"
                          >
                            <Send className="w-4 h-4" />
                          </a>
                        )}
                        {token.socials.discord && (
                          <a
                            href={token.socials.discord}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                            title="Discord"
                          >
                            <Hash className="w-4 h-4" />
                          </a>
                        )}
                        {token.socials.linkedin && (
                          <a
                            href={token.socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 transition-colors"
                            title="LinkedIn"
                          >
                            <Building className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">No tokens found</h3>
              <p className="text-gray-400">Try adjusting your search criteria</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Launchpad View Component
function LaunchpadView() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Organization Details
    organizationName: '',
    tokenSymbol: '',
    tokenName: '',
    totalSupply: '',
    initialPrice: '',
    description: '',

    // Business Registration
    businessType: 'corporation',
    registrationNumber: '',
    taxId: '',
    incorporationDate: '',
    jurisdiction: '',
    registeredAddress: '',

    // Contact Information
    website: '',
    email: '',
    phone: '',

    // Social Media
    twitter: '',
    linkedin: '',
    telegram: '',
    discord: '',

    // Token Distribution
    publicSale: '',
    teamAllocation: '',
    advisorAllocation: '',
    treasuryReserve: '',

    // Legal & Compliance
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
    // In production, this would interact with 1Sat Ordinals API
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
    <div className="absolute inset-0 top-20 p-6">
      <div className="max-w-full mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Token Launchpad</h1>
          <p className="text-gray-400">Mint your organization's shares as tokens on 1Sat Ordinals schema</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((stepItem, index) => {
              const Icon = stepItem.icon
              const isActive = step === stepItem.id
              const isCompleted = step > stepItem.id

              return (
                <div key={stepItem.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-white/20 text-gray-400'
                    }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-400'
                      }`}>
                      {stepItem.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-px w-12 ${isCompleted ? 'bg-green-500' : 'bg-white/20'
                      }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-8 overflow-auto">
          {/* Step 1: Organization Details */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Organization Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Example Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Token Symbol</label>
                  <input
                    type="text"
                    value={formData.tokenSymbol}
                    onChange={(e) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="EXMPL"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Token Name</label>
                  <input
                    type="text"
                    value={formData.tokenName}
                    onChange={(e) => handleInputChange('tokenName', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Example Token"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Total Supply</label>
                  <input
                    type="number"
                    value={formData.totalSupply}
                    onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="10000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Initial Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initialPrice}
                    onChange={(e) => handleInputChange('initialPrice', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="0.25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Describe your organization and token utility..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Registration */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Business Registration</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tax ID / EIN</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="12-3456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Incorporation Date</label>
                  <input
                    type="date"
                    value={formData.incorporationDate}
                    onChange={(e) => handleInputChange('incorporationDate', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Jurisdiction</label>
                  <input
                    type="text"
                    value={formData.jurisdiction}
                    onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Delaware, USA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Registered Address</label>
                <textarea
                  value={formData.registeredAddress}
                  onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                  rows={3}
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="123 Business St, Suite 100, City, State, ZIP"
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact & Social */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Contact & Social Media</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Twitter</label>
                  <input
                    type="url"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://twitter.com/example"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://linkedin.com/company/example"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Telegram</label>
                  <input
                    type="url"
                    value={formData.telegram}
                    onChange={(e) => handleInputChange('telegram', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://t.me/example"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Discord</label>
                  <input
                    type="url"
                    value={formData.discord}
                    onChange={(e) => handleInputChange('discord', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://discord.gg/example"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Token Distribution */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Token Distribution</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Public Sale (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.publicSale}
                    onChange={(e) => handleInputChange('publicSale', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Team Allocation (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.teamAllocation}
                    onChange={(e) => handleInputChange('teamAllocation', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Advisor Allocation (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.advisorAllocation}
                    onChange={(e) => handleInputChange('advisorAllocation', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Treasury Reserve (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.treasuryReserve}
                    onChange={(e) => handleInputChange('treasuryReserve', e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Distribution Chart Preview */}
              <div className="mt-6 p-4 bg-black/20 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-3">Distribution Preview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Public Sale:</span>
                    <span className="text-white">{formData.publicSale || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Team:</span>
                    <span className="text-white">{formData.teamAllocation || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Advisors:</span>
                    <span className="text-white">{formData.advisorAllocation || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Treasury:</span>
                    <span className="text-white">{formData.treasuryReserve || 0}%</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white font-medium">Total:</span>
                    <span className="text-white font-medium">
                      {(parseFloat(formData.publicSale || '0') +
                        parseFloat(formData.teamAllocation || '0') +
                        parseFloat(formData.advisorAllocation || '0') +
                        parseFloat(formData.treasuryReserve || '0')).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Legal & Compliance */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Legal & Compliance</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Whitepaper</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('whitepaper', e.target.files?.[0] || null)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Business Plan</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileUpload('businessPlan', e.target.files?.[0] || null)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Compliance Documents</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.zip"
                    onChange={(e) => handleFileUpload('complianceDocuments', e.target.files?.[0] || null)}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.kycCompleted}
                    onChange={(e) => handleInputChange('kycCompleted', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-black/40 border-white/20 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-400">KYC (Know Your Customer) completed</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amlCompleted}
                    onChange={(e) => handleInputChange('amlCompleted', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-black/40 border-white/20 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-400">AML (Anti-Money Laundering) compliance verified</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-black/40 border-white/20 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-400">I accept the Terms of Service and Privacy Policy</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 6: Review & Mint */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Review & Mint Token</h2>

              <div className="bg-black/20 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">Token Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Organization:</span>
                    <span className="text-white ml-2">{formData.organizationName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Token:</span>
                    <span className="text-white ml-2">{formData.tokenName || 'Not specified'} ({formData.tokenSymbol || 'N/A'})</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Supply:</span>
                    <span className="text-white ml-2">{formData.totalSupply || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Initial Price:</span>
                    <span className="text-white ml-2">${formData.initialPrice || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Website:</span>
                    <span className="text-white ml-2">{formData.website || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white ml-2">{formData.email || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Coins className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-medium">1Sat Ordinals Integration</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Your token will be minted on the Bitcoin SV blockchain using the 1Sat Ordinals schema.
                      This ensures immutable ownership records and enables seamless trading.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleMintToken}
                disabled={!formData.termsAccepted}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${formData.termsAccepted
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Mint Token on 1Sat Ordinals
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${step === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              Previous
            </button>

            <div className="text-gray-400 text-sm">
              Step {step} of {steps.length}
            </div>

            <button
              onClick={() => setStep(Math.min(steps.length, step + 1))}
              disabled={step === steps.length}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${step === steps.length
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Workflow Preview Component for Cards
function WorkflowPreview({ workflow }: { workflow: WorkflowState }) {
  const previewWidth = 200
  const previewHeight = 100

  // Calculate bounds of all nodes to fit them in preview
  const getNodeBounds = () => {
    if (workflow.nodes.length === 0) return { minX: 0, minY: 0, maxX: 200, maxY: 100 }

    const positions = workflow.nodes.map(node => ({ x: node.x, y: node.y }))
    const minX = Math.min(...positions.map(p => p.x))
    const maxX = Math.max(...positions.map(p => p.x))
    const minY = Math.min(...positions.map(p => p.y))
    const maxY = Math.max(...positions.map(p => p.y))

    return { minX, minY, maxX, maxY }
  }

  const bounds = getNodeBounds()
  const boundsWidth = bounds.maxX - bounds.minX || 200
  const boundsHeight = bounds.maxY - bounds.minY || 100

  // Calculate scale to fit nodes in preview
  const scaleX = (previewWidth - 40) / boundsWidth
  const scaleY = (previewHeight - 40) / boundsHeight
  const scale = Math.min(scaleX, scaleY, 0.3) // Max scale of 0.3 to keep nodes small

  // Transform node position to preview coordinates
  const transformPosition = (x: number, y: number) => ({
    x: ((x - bounds.minX) * scale) + 20,
    y: ((y - bounds.minY) * scale) + 20
  })

  // Get node color based on type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return '#10b981' // green
      case 'end': return '#ef4444' // red
      case 'process': return '#3b82f6' // blue
      case 'decision': return '#f59e0b' // yellow
      case 'ai-agent': return '#8b5cf6' // purple
      case 'human-task': return '#f97316' // orange
      case 'integration': return '#06b6d4' // cyan
      default: return '#6b7280' // gray
    }
  }

  if (workflow.nodes.length === 0) {
    return (
      <div
        className="bg-black/20 border border-white/10 rounded-lg flex items-center justify-center"
        style={{ width: previewWidth, height: previewHeight }}
      >
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center mb-2 mx-auto">
            <Zap className="w-4 h-4 text-gray-400" />
          </div>
          <span className="text-xs text-gray-400">Empty Workflow</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-black/20 border border-white/10 rounded-lg relative overflow-hidden"
      style={{ width: previewWidth, height: previewHeight }}
    >
      <svg
        width={previewWidth}
        height={previewHeight}
        className="absolute inset-0"
      >
        {/* Render connections */}
        {workflow.connections.map((connection, index) => {
          const fromNode = workflow.nodes.find(n => n.id === connection.from)
          const toNode = workflow.nodes.find(n => n.id === connection.to)

          if (!fromNode || !toNode) return null

          const fromPos = transformPosition(fromNode.x, fromNode.y)
          const toPos = transformPosition(toNode.x, toNode.y)

          return (
            <line
              key={index}
              x1={fromPos.x + 6} // Offset for node center
              y1={fromPos.y + 6}
              x2={toPos.x + 6}
              y2={toPos.y + 6}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          )
        })}

        {/* Render nodes */}
        {workflow.nodes.map((node) => {
          const pos = transformPosition(node.x, node.y)
          const nodeColor = getNodeColor(node.type)

          return (
            <g key={node.id}>
              <circle
                cx={pos.x + 6}
                cy={pos.y + 6}
                r="6"
                fill={nodeColor}
                opacity="0.8"
              />
              {/* Node type indicator */}
              <circle
                cx={pos.x + 6}
                cy={pos.y + 6}
                r="3"
                fill="rgba(255,255,255,0.8)"
              />
            </g>
          )
        })}
      </svg>

      {/* Overlay info */}
      <div className="absolute bottom-1 right-1 bg-black/50 rounded px-1 py-0.5">
        <span className="text-xs text-gray-300">
          {workflow.nodes.length}n • {workflow.connections.length}c
        </span>
      </div>
    </div>
  )
}

// Workflows List View Component
function WorkflowsView({
  workflows,
  folders,
  selectedWorkflow,
  onCreateWorkflow,
  onCreateFolder,
  onOpenWorkflow,
  onDeleteWorkflow,
  onUpdateWorkflow,
  isMobile
}: {
  workflows: WorkflowState[]
  folders: string[]
  selectedWorkflow: string | null
  onCreateWorkflow: (name: string, description: string, folder?: string) => void
  onCreateFolder: (folderName: string) => void
  onOpenWorkflow: (workflowId: string) => void
  onDeleteWorkflow: (workflowId: string) => void
  onUpdateWorkflow: (workflowId: string, updates: Partial<WorkflowState>) => void
  isMobile: boolean
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('')
  const [showWorkflowTemplates, setShowWorkflowTemplates] = useState(false)
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [newWorkflowFolder, setNewWorkflowFolder] = useState('')
  const [showFolderMenu, setShowFolderMenu] = useState<string | null>(null)

  // Close folder menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowFolderMenu(null)
    }

    if (showFolderMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showFolderMenu])

  const workflowTemplates = [
    {
      name: 'Marketing Campaign',
      description: 'Automated marketing workflow with social media, email, and analytics',
      category: 'Marketing',
      icon: '📢'
    },
    {
      name: 'Product Development',
      description: 'Development lifecycle from planning to deployment',
      category: 'Development',
      icon: '🚀'
    },
    {
      name: 'Financial Process',
      description: 'Invoice processing, approvals, and payment workflows',
      category: 'Finance',
      icon: '💰'
    },
    {
      name: 'HR Onboarding',
      description: 'Employee onboarding with document collection and training',
      category: 'HR',
      icon: '👥'
    },
    {
      name: 'Customer Support',
      description: 'Ticket routing, escalation, and resolution tracking',
      category: 'Support',
      icon: '🎧'
    },
    {
      name: 'Content Production',
      description: 'Content creation, review, approval, and publishing pipeline',
      category: 'Content',
      icon: '📝'
    }
  ]

  const applyWorkflowTemplate = (template: typeof workflowTemplates[0]) => {
    setNewWorkflowName(template.name)
    setNewWorkflowDescription(template.description)
    setShowWorkflowTemplates(false)
  }
  // Filter workflows by selected folder
  const filteredWorkflows = selectedFolder
    ? workflows.filter(w => w.folder === selectedFolder)
    : workflows.filter(w => !w.folder) // Show workflows without folders when no folder is selected

  const handleCreate = () => {
    if (newWorkflowName.trim()) {
      onCreateWorkflow(
        newWorkflowName.trim(),
        newWorkflowDescription.trim(),
        newWorkflowFolder.trim() || undefined
      )
      setNewWorkflowName('')
      setNewWorkflowDescription('')
      setNewWorkflowFolder('')
      setShowCreateModal(false)
    }
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setShowCreateFolderModal(false)
    }
  }

  const moveWorkflowToFolder = (workflowId: string, folderName: string | null) => {
    onUpdateWorkflow(workflowId, { folder: folderName || undefined })
    setShowFolderMenu(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'stopped': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running'
      case 'paused': return 'Paused'
      case 'stopped': return 'Stopped'
      default: return 'Unknown'
    }
  }

  return (
    <div className="absolute inset-0 top-20 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`font-bold text-white ${isMobile ? 'text-2xl' : 'text-3xl'} mb-2`}>
            Workflow Browser
          </h1>
          <p className="text-gray-400">
            Manage your automated business processes and workflows • {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} {selectedFolder ? `in "${selectedFolder}"` : ''}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className={`bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 ${isMobile ? 'px-3 py-2 text-sm' : 'px-3 py-2'
              }`}
          >
            <Folder className={isMobile ? "w-4 h-4" : "w-4 h-4"} />
            {!isMobile && <span>New Folder</span>}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className={`bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
              }`}
          >
            <Plus className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
            <span className={isMobile ? 'hidden' : ''}>Create Workflow</span>
          </button>
        </div>
      </div>

      {/* Folder Navigation */}
      {folders.length > 0 && (
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFolder(null)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedFolder === null
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
          >
            All Workflows
          </button>
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors flex items-center space-x-1 ${selectedFolder === folder
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
            >
              <Folder className="w-3 h-3" />
              <span>{folder}</span>
              <span className="text-xs opacity-75">
                ({workflows.filter(w => w.folder === folder).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Workflows Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first workflow to automate business processes and manage team coordination.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Workflow</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {/* Create New Workflow Card */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="bg-black/20 backdrop-blur-xl border-2 border-dashed border-white/20 rounded-xl p-6 hover:bg-black/30 hover:border-white/30 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center min-h-[280px]"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Plus className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Create New Workflow</h3>
              <p className="text-gray-400 text-sm">
                Build automated business processes and team coordination workflows
              </p>
            </div>
          </div>

          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`bg-black/40 backdrop-blur-xl border rounded-xl p-6 hover:bg-black/60 transition-all duration-200 cursor-pointer group overflow-hidden ${workflow.name === 'Example Organisation Workflow: AUDEX'
                ? 'border-gradient-demo animate-pulse-glow shadow-2xl shadow-blue-500/20'
                : 'border-white/20'
                } ${selectedWorkflow === workflow.id ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''
                }`}
              onClick={() => onOpenWorkflow(workflow.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white mb-1 truncate">
                    {workflow.name}
                  </h3>
                  {workflow.folder && (
                    <div className="flex items-center gap-1 mb-2">
                      <Folder className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-400 truncate">{workflow.folder}</span>
                    </div>
                  )}
                  <p className="text-gray-400 text-sm line-clamp-2 break-words overflow-hidden">
                    {workflow.description}
                  </p>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center space-x-2 ml-4 flex-shrink-0`}>
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(workflow.workflowStatus)}`}></div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {getStatusText(workflow.workflowStatus)}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {workflow.nodes.length}
                  </div>
                  <div className="text-xs text-gray-400">Nodes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {workflow.connections.length}
                  </div>
                  <div className="text-xs text-gray-400">Connections</div>
                </div>
              </div>

              {/* Workflow Preview */}
              <div className="mb-4">
                <WorkflowPreview workflow={workflow} />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onOpenWorkflow(workflow.id)
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Open Workflow"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowFolderMenu(showFolderMenu === workflow.id ? null : workflow.id)
                      }}
                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Move to Folder"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showFolderMenu === workflow.id && (
                      <div className="absolute right-0 top-8 bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg py-2 min-w-[160px] z-50">
                        <div className="px-3 py-1 text-xs text-gray-400 border-b border-white/10">Move to folder</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            moveWorkflowToFolder(workflow.id, null)
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                          <FolderMinus className="w-3 h-3" />
                          No Folder
                        </button>
                        {folders.map(folder => (
                          <button
                            key={folder}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveWorkflowToFolder(workflow.id, folder)
                            }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${workflow.folder === folder
                              ? 'text-blue-400 bg-blue-500/20'
                              : 'text-gray-300 hover:bg-white/10'
                              }`}
                          >
                            <Folder className="w-3 h-3" />
                            {folder}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this workflow?')) {
                        onDeleteWorkflow(workflow.id)
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete Workflow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Workflow</h3>
              <button
                onClick={() => setShowWorkflowTemplates(!showWorkflowTemplates)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {showWorkflowTemplates ? 'Hide Templates' : 'Use Template'}
              </button>
            </div>

            {showWorkflowTemplates && (
              <div className="mb-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-lg font-medium text-white mb-4">Choose a Template</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workflowTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => applyWorkflowTemplate(template)}
                      className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-left transition-all"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{template.icon}</span>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-white font-medium text-sm truncate">{template.name}</h5>
                          <span className="text-xs text-gray-400">{template.category}</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="Enter workflow name..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreate()
                    }
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="Describe your workflow..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Folder (optional)
                </label>
                <input
                  type="text"
                  value={newWorkflowFolder}
                  onChange={(e) => setNewWorkflowFolder(e.target.value)}
                  placeholder="Enter folder name or leave empty..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {folders.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Existing folders:</p>
                    <div className="flex flex-wrap gap-1">
                      {folders.map(folder => (
                        <button
                          key={folder}
                          onClick={() => setNewWorkflowFolder(folder)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 text-xs text-gray-300 rounded transition-colors"
                        >
                          {folder}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-4 border-t border-white/20">
              <button
                onClick={handleCreate}
                disabled={!newWorkflowName.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewWorkflowName('')
                  setNewWorkflowDescription('')
                  setNewWorkflowFolder('')
                  setShowWorkflowTemplates(false)
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Folder</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateFolder()
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6 pt-4 border-t border-white/20">
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Folder className="w-4 h-4" />
                <span>Create Folder</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateFolderModal(false)
                  setNewFolderName('')
                }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Workflow View Component
function WorkflowView({
  workflow,
  boardRef,
  onMouseMove,
  onMouseUp,
  onMouseDown,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onNodeUpdate,
  onNodeDelete,
  onNodesDelete,
  onNodesCopy,
  onNodesPaste,
  onStartConnection,
  onCompleteConnection,
  onDoubleClick,
  onToggleExpansion,
  onToolChange,
  onSelectionChange,
  onAddNode,
  getNodeIcon,
  getStatusColor,
  getConnectionColor,
  getNodePosition,
  isMobile,
  canvasScale,
  canvasOffset,
  resetCanvasView,
  setCanvasScale,
  setCanvasOffset,
  onBackToWorkflows,
  selectedNodeDetails,
  setSelectedNodeDetails,
  organizations,
  roles,
  instruments,
  contracts,
  wallets,
  workflows: allWorkflows
}: WorkflowViewProps & {
  sidebarOpen: boolean
  onBackToWorkflows: () => void
  selectedNodeDetails: string | null
  setSelectedNodeDetails: (nodeId: string | null) => void
  organizations: Organization[]
  roles: Role[]
  instruments: FinancialInstrument[]
  contracts: Contract[]
  wallets: Wallet[]
  workflows: WorkflowState[]
}) {
  // Canvas tools configuration
  const canvasTools: CanvasTool[] = [
    { id: 'select', name: 'Select', icon: <MousePointer className="w-4 h-4" />, description: 'Select and move nodes', shortcut: 'V', active: workflow.currentTool === 'select' },
    { id: 'pan', name: 'Pan', icon: <Hand className="w-4 h-4" />, description: 'Pan around the canvas (or hold Space)', shortcut: 'H', active: workflow.currentTool === 'pan' },
    { id: 'connect', name: 'Connect', icon: <Link className="w-4 h-4" />, description: 'Connect nodes together', shortcut: 'C', active: workflow.currentTool === 'connect' },
    { id: 'delete', name: 'Delete', icon: <Trash2 className="w-4 h-4" />, description: 'Delete nodes and connections', shortcut: 'X', active: workflow.currentTool === 'delete' },
    { id: 'zoom', name: 'Zoom', icon: <ZoomIn className="w-4 h-4" />, description: 'Zoom in/out', shortcut: 'Z', active: workflow.currentTool === 'zoom' }
  ]

  // Node palette state
  const [isPaletteCollapsed, setIsPaletteCollapsed] = React.useState(false)
  const [snapToGrid, setSnapToGrid] = React.useState(false)

  // Business selection modal state (only allow business node types that open the modal)
  type BusinessType = Extract<
    WorkflowNode['type'],
    'workflow' | 'organization' | 'role' | 'ai-agent' | 'member' | 'instrument' | 'contract' | 'wallets' | 'integration' | 'contact'
  >
  const BUSINESS_TYPES: readonly BusinessType[] = [
    'workflow',
    'organization',
    'role',
    'ai-agent',
    'member',
    'instrument',
    'contract',
    'wallets',
    'integration',
    'contact',
  ] as const

  const [showBusinessModal, setShowBusinessModal] = React.useState<BusinessType | null>(null)

  function isBusinessType(type: WorkflowNode['type']): type is BusinessType {
    return (BUSINESS_TYPES as readonly string[]).includes(type)
  }
  const [pendingNodePosition, setPendingNodePosition] = React.useState<{ x: number; y: number } | null>(null)

  // Handle business item selection
  const handleBusinessItemClick = (businessType: BusinessType, position: { x: number; y: number }) => {
    setShowBusinessModal(businessType)
    setPendingNodePosition(position)
  }

  // Handle selection from business modal
  type BusinessItem = { id: string; name: string; description?: string }
  const handleBusinessItemSelect = (item: BusinessItem) => {
    if (pendingNodePosition && showBusinessModal) {
      // For now add a simple node of the chosen type at the position
      onAddNode(showBusinessModal, pendingNodePosition)
      setShowBusinessModal(null)
      setPendingNodePosition(null)
    }
  }



  // Types for node content
  type NodeContentItem =
    | { type: 'team-member'; name: string; role: string; status: string; avatar: string }
    | { type: 'organization-dept'; name: string; count: number; status: string; icon: string }
    | { type: 'key-value'; label: string; value: string }

  // Generate sample internal content for different node types
  const getNodeInternalContent = (node: WorkflowNode): { title: string; items: NodeContentItem[] } => {
    switch (node.type) {
      case 'team':
        return {
          title: 'Team Members',
          items: [
            { type: 'team-member', name: 'Alice Johnson', role: 'Team Lead', status: 'Active', avatar: '👩‍💼' },
            { type: 'team-member', name: 'Bob Smith', role: 'Developer', status: 'Active', avatar: '👨‍💻' },
            { type: 'team-member', name: 'Carol Davis', role: 'Designer', status: 'Active', avatar: '👩‍🎨' },
            { type: 'team-member', name: 'David Wilson', role: 'QA Engineer', status: 'On Leave', avatar: '👨‍🔬' }
          ]
        }
      case 'organization':
        return {
          title: 'Organization Structure',
          items: [
            { type: 'organization-dept', name: 'Engineering Department', count: 24, status: 'Active', icon: '⚙️' },
            { type: 'organization-dept', name: 'Marketing Department', count: 12, status: 'Active', icon: '📢' },
            { type: 'organization-dept', name: 'Sales Department', count: 18, status: 'Active', icon: '💼' },
            { type: 'organization-dept', name: 'HR Department', count: 6, status: 'Active', icon: '👥' }
          ]
        }
      case 'role':
        return {
          title: 'Role Details',
          items: [
            { type: 'key-value', label: 'Permissions', value: Array.isArray(node.metadata?.permissions) ? (node.metadata.permissions as string[]).join(', ') : 'View, Edit' },
            { type: 'key-value', label: 'Share Allocation', value: `${node.metadata?.shareAllocation || 10}%` },
            { type: 'key-value', label: 'Department', value: String(node.metadata?.department || 'Engineering') },
            { type: 'key-value', label: 'Level', value: String(node.metadata?.level || 'Senior') }
          ]
        }
      case 'member':
        return {
          title: 'Member Profile',
          items: [
            { type: 'key-value', label: 'Full Name', value: String(node.metadata?.fullName || 'John Doe') },
            { type: 'key-value', label: 'Email', value: String(node.metadata?.email || 'john.doe@company.com') },
            { type: 'key-value', label: 'Department', value: String(node.metadata?.department || 'Engineering') },
            { type: 'key-value', label: 'Start Date', value: String(node.metadata?.startDate || '2023-01-15') },
            { type: 'key-value', label: 'Wallet Address', value: String(node.metadata?.walletAddress || '0x1234...5678') }
          ]
        }
      case 'instrument':
        return {
          title: 'Financial Instrument',
          items: [
            { type: 'key-value', label: 'Token Symbol', value: String(node.metadata?.tokenSymbol || 'CASH') },
            { type: 'key-value', label: 'Total Supply', value: String(node.metadata?.totalSupply || '1,000,000') },
            { type: 'key-value', label: 'Current Price', value: String(node.metadata?.currentPrice || '$1.25') },
            { type: 'key-value', label: 'Market Cap', value: String(node.metadata?.marketCap || '$1,250,000') }
          ]
        }
      case 'contract':
        return {
          title: 'Smart Contract',
          items: [
            { type: 'key-value', label: 'Contract Address', value: String(node.metadata?.contractAddress || '0xabcd...ef12') },
            { type: 'key-value', label: 'Network', value: String(node.metadata?.network || 'Ethereum') },
            { type: 'key-value', label: 'Status', value: String(node.metadata?.status || 'Deployed') },
            { type: 'key-value', label: 'Gas Used', value: String(node.metadata?.gasUsed || '2,100,000') }
          ]
        }
      case 'payment':
        return {
          title: 'Payment Details',
          items: [
            { type: 'key-value', label: 'Amount', value: String(node.metadata?.amount || '$5,000') },
            { type: 'key-value', label: 'Recipient', value: String(node.metadata?.recipient || 'Engineering Team') },
            { type: 'key-value', label: 'Status', value: String(node.metadata?.status || 'Pending') },
            { type: 'key-value', label: 'Due Date', value: String(node.metadata?.dueDate || '2024-01-15') }
          ]
        }
      case 'youtube':
        return {
          title: 'YouTube Media',
          items: [
            { type: 'key-value', label: 'Media Type', value: String(node.metadata?.mediaType || 'channel') },
            { type: 'key-value', label: 'Channel ID', value: String(node.metadata?.channelId || '—') },
            { type: 'key-value', label: 'Video ID', value: String(node.metadata?.videoId || '—') }
          ]
        }
      case 'task':
        return {
          title: 'Task Details',
          items: [
            { type: 'key-value', label: 'Assignee', value: String(node.metadata?.assignee || 'Alice Johnson') },
            { type: 'key-value', label: 'Priority', value: String(node.metadata?.priority || 'High') },
            { type: 'key-value', label: 'Due Date', value: String(node.metadata?.dueDate || '2024-01-10') },
            { type: 'key-value', label: 'Progress', value: `${node.metadata?.progress || 75}%` }
          ]
        }
      default:
        return {
          title: 'Node Configuration',
          items: [
            { type: 'key-value', label: 'Type', value: node.type },
            { type: 'key-value', label: 'Created', value: new Date().toLocaleDateString() },
            { type: 'key-value', label: 'Status', value: String(node.metadata?.status || 'Active') },
            { type: 'key-value', label: 'ID', value: node.id.substring(0, 8) + '...' }
          ]
        }
    }
  }

  // Helper function for centered zoom operations
  const zoomToCenter = (newScale: number) => {
    const canvasElement = boardRef.current
    if (!canvasElement) return

    const rect = canvasElement.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setCanvasScale(prev => {
      if (newScale !== prev) {
        // Calculate the world position of the screen center
        const worldCenterX = (centerX - canvasOffset.x) / prev
        const worldCenterY = (centerY - canvasOffset.y) / prev

        // Calculate new offset to keep the center at the same world position
        const newOffsetX = centerX - worldCenterX * newScale
        const newOffsetY = centerY - worldCenterY * newScale

        setCanvasOffset({
          x: newOffsetX,
          y: newOffsetY
        })
      }

      return newScale
    })
  }

  // Helper function to get node border color based on type
  const getNodeBorderColor = (type: string) => {
    switch (type) {
      case 'payment': return 'border-yellow-400/60'
      case 'contract': return 'border-blue-400/60'
      case 'task': return 'border-green-400/60'
      case 'decision': return 'border-purple-400/60'
      case 'milestone': return 'border-indigo-400/60'
      case 'team': return 'border-pink-400/60'
      case 'organization': return 'border-orange-400/60'
      case 'role': return 'border-amber-400/60'
      case 'member': return 'border-cyan-400/60'
      case 'instrument': return 'border-emerald-400/60'
      case 'integration': return 'border-violet-400/60'
      case 'youtube': return 'border-red-500/60'
      case 'listener': return 'border-amber-400/60'
      case 'shareholder': return 'border-fuchsia-400/60'
      case 'artist': return 'border-pink-400/60'
      case 'api': return 'border-blue-500/60'
      case 'database': return 'border-gray-400/60'
      case 'webhook': return 'border-teal-400/60'
      case 'email': return 'border-red-400/60'
      case 'sms': return 'border-green-500/60'
      case 'notification': return 'border-yellow-500/60'
      case 'loop': return 'border-blue-600/60'
      case 'condition': return 'border-purple-500/60'
      case 'trigger': return 'border-yellow-600/60'
      case 'approval': return 'border-green-600/60'
      case 'review': return 'border-orange-500/60'
      case 'timer': return 'border-slate-400/60'
      default: return 'border-white/20'
    }
  }

  // Helper function to get colored icons for the palette
  const getColoredNodeIcon = (type: string) => {
    const iconSize = "w-4 h-4"
    switch (type) {
      case 'payment': return <DollarSign className={`${iconSize} text-yellow-400`} />
      case 'contract': return <FileText className={`${iconSize} text-blue-400`} />
      case 'task': return <Target className={`${iconSize} text-green-400`} />
      case 'decision': return <AlertTriangle className={`${iconSize} text-purple-400`} />
      case 'milestone': return <CheckCircle className={`${iconSize} text-indigo-400`} />
      case 'team': return <Users className={`${iconSize} text-pink-400`} />
      case 'organization': return <Building className={`${iconSize} text-orange-400`} />
      case 'role': return <Crown className={`${iconSize} text-amber-400`} />
      case 'member': return <UserCheck className={`${iconSize} text-cyan-400`} />
      case 'instrument': return <Banknote className={`${iconSize} text-emerald-400`} />
      case 'integration': return <Plug className={`${iconSize} text-violet-400`} />
      case 'api': return <Globe className={`${iconSize} text-blue-500`} />
      case 'database': return <Database className={`${iconSize} text-gray-400`} />
      case 'webhook': return <Link className={`${iconSize} text-teal-400`} />
      case 'email': return <Mail className={`${iconSize} text-red-400`} />
      case 'sms': return <MessageSquare className={`${iconSize} text-green-500`} />
      case 'notification': return <Bell className={`${iconSize} text-yellow-500`} />
      case 'loop': return <RefreshCw className={`${iconSize} text-blue-600`} />
      case 'condition': return <GitBranch className={`${iconSize} text-purple-500`} />
      case 'trigger': return <Zap className={`${iconSize} text-yellow-600`} />
      case 'approval': return <CheckSquare className={`${iconSize} text-green-600`} />
      case 'review': return <Eye className={`${iconSize} text-orange-500`} />
      case 'timer': return <Clock className={`${iconSize} text-slate-400`} />
      case 'switch': return <GitBranch className={`${iconSize} text-indigo-500`} />
      case 'router': return <Router className={`${iconSize} text-cyan-500`} />
      case 'delay': return <Clock className={`${iconSize} text-amber-400`} />
      case 'queue': return <Layers className={`${iconSize} text-gray-500`} />
      case 'batch': return <Package className={`${iconSize} text-orange-400`} />
      case 'parallel': return <Copy className={`${iconSize} text-blue-400`} />
      case 'sequence': return <ArrowRight className={`${iconSize} text-green-400`} />
      case 'retry': return <RefreshCw className={`${iconSize} text-red-400`} />
      case 'ai-agent': return <Bot className={`${iconSize} text-blue-500`} />
      case 'workflow': return <Target className={`${iconSize} text-indigo-500`} />
      case 'wallets': return <Wallet className={`${iconSize} text-green-500`} />
      case 'workflow': return <Target className={`${iconSize} text-indigo-500`} />
      case 'contact': return <User className={`${iconSize} text-blue-300`} />
      case 'youtube': return <Play className={`${iconSize} text-red-500`} />
      case 'listener': return <Zap className={`${iconSize} text-amber-400`} />
      case 'shareholder': return <UserCheck className={`${iconSize} text-fuchsia-400`} />
      case 'artist': return <Headphones className={`${iconSize} text-pink-400`} />
      case 'instagram': return <Users className={`${iconSize} text-pink-500`} />
      case 'snapchat': return <MessageSquare className={`${iconSize} text-yellow-400`} />
      case 'threads': return <MessageSquare className={`${iconSize} text-gray-800`} />
      case 'twitter': return <MessageSquare className={`${iconSize} text-blue-400`} />
      case 'facebook': return <Users className={`${iconSize} text-blue-600`} />
      case 'linkedin': return <Users className={`${iconSize} text-blue-700`} />
      case 'tiktok': return <Play className={`${iconSize} text-red-500`} />
      case 'youtube': return <Play className={`${iconSize} text-red-600`} />
      case 'discord': return <MessageSquare className={`${iconSize} text-indigo-500`} />
      case 'telegram': return <Send className={`${iconSize} text-blue-500`} />
      case 'whatsapp': return <MessageSquare className={`${iconSize} text-green-500`} />
      case 'reddit': return <MessageSquare className={`${iconSize} text-orange-600`} />
      case 'voice': return <Play className={`${iconSize} text-purple-500`} />
      case 'elevenlabs': return <Play className={`${iconSize} text-purple-600`} />
      case 'midjourney': return <Palette className={`${iconSize} text-blue-500`} />
      case 'veo3': return <PlayCircle className={`${iconSize} text-red-500`} />
      case 'openai': return <Bot className={`${iconSize} text-green-600`} />
      case 'anthropic': return <Bot className={`${iconSize} text-orange-500`} />
      case 'stability': return <Palette className={`${iconSize} text-purple-400`} />
      case 'runway': return <PlayCircle className={`${iconSize} text-green-500`} />
      case 'replicate': return <RefreshCw className={`${iconSize} text-blue-600`} />
      case 'huggingface': return <Bot className={`${iconSize} text-yellow-500`} />
      case 'cohere': return <Bot className={`${iconSize} text-teal-500`} />
      case 'perplexity': return <Bot className={`${iconSize} text-indigo-600`} />
      case 'salesforce': return <Building className={`${iconSize} text-blue-600`} />
      case 'hubspot': return <TrendingUp className={`${iconSize} text-orange-500`} />
      case 'pipedrive': return <Target className={`${iconSize} text-green-600`} />
      case 'googlesheets': return <Grid className={`${iconSize} text-green-500`} />
      case 'excel': return <BarChart3 className={`${iconSize} text-green-700`} />
      case 'airtable': return <Database className={`${iconSize} text-yellow-600`} />
      case 'notion': return <FileText className={`${iconSize} text-gray-600`} />
      case 'stripe': return <CreditCard className={`${iconSize} text-purple-600`} />
      case 'paypal': return <DollarSign className={`${iconSize} text-blue-500`} />
      case 'square': return <CreditCard className={`${iconSize} text-gray-700`} />
      case 'slack': return <MessageSquare className={`${iconSize} text-purple-500`} />
      case 'teams': return <Users className={`${iconSize} text-blue-500`} />
      case 'zoom': return <PlayCircle className={`${iconSize} text-blue-400`} />
      default: return getNodeIcon(type)
    }
  }

  // Large, colored icon for canvas nodes
  const getLargeColoredNodeIcon = (type: string) => {
    const size = isMobile ? 'w-5 h-5' : 'w-7 h-7'
    switch (type) {
      case 'payment': return <DollarSign className={`${size} text-yellow-400`} />
      case 'contract': return <FileText className={`${size} text-blue-400`} />
      case 'task': return <Target className={`${size} text-green-400`} />
      case 'decision': return <AlertTriangle className={`${size} text-purple-400`} />
      case 'milestone': return <CheckCircle className={`${size} text-indigo-400`} />
      case 'team': return <Users className={`${size} text-pink-400`} />
      case 'organization': return <Building className={`${size} text-orange-400`} />
      case 'role': return <Crown className={`${size} text-amber-400`} />
      case 'member': return <UserCheck className={`${size} text-cyan-400`} />
      case 'instrument': return <Banknote className={`${size} text-emerald-400`} />
      case 'integration': return <Plug className={`${size} text-violet-400`} />
      case 'splitter': return <Split className={`${size} text-amber-400`} />
      case 'youtube': return <Play className={`${size} text-red-500`} />
      case 'trigger': return <Zap className={`${size} text-yellow-500`} />
      case 'contact': return <User className={`${size} text-blue-300`} />
      default: return getNodeIcon(type)
    }
  }

  const nodeTypes = [
    { type: 'task' as const, name: 'Task', icon: getColoredNodeIcon('task'), category: 'Basic' },
    { type: 'decision' as const, name: 'Decision', icon: getColoredNodeIcon('decision'), category: 'Basic' },
    { type: 'payment' as const, name: 'Payment', icon: getColoredNodeIcon('payment'), category: 'Basic' },
    { type: 'milestone' as const, name: 'Milestone', icon: getColoredNodeIcon('milestone'), category: 'Basic' },
    { type: 'contract' as const, name: 'Contract', icon: getColoredNodeIcon('contract'), category: 'Business' },
    { type: 'team' as const, name: 'Team', icon: getColoredNodeIcon('team'), category: 'Basic' },

    // Business Entities
    { type: 'workflow' as const, name: 'Workflows', icon: getColoredNodeIcon('workflow'), category: 'Business' },
    { type: 'organization' as const, name: 'Organizations', icon: getColoredNodeIcon('organization'), category: 'Business' },
    { type: 'role' as const, name: 'Roles', icon: getColoredNodeIcon('role'), category: 'Business' },
    { type: 'ai-agent' as const, name: 'Agents', icon: getColoredNodeIcon('ai-agent'), category: 'Business' },
    { type: 'member' as const, name: 'People', icon: getColoredNodeIcon('member'), category: 'Business' },
    { type: 'instrument' as const, name: 'Instruments', icon: getColoredNodeIcon('instrument'), category: 'Business' },

    { type: 'wallets' as const, name: 'Wallets', icon: getColoredNodeIcon('wallets'), category: 'Business' },
    { type: 'integration' as const, name: 'Integrations', icon: getColoredNodeIcon('integration'), category: 'Business' },
    { type: 'contact' as const, name: 'Contact', icon: getColoredNodeIcon('contact'), category: 'Business' },

    // Integrations
    { type: 'api' as const, name: 'API Call', icon: getColoredNodeIcon('api'), category: 'Integration' },
    { type: 'database' as const, name: 'Database', icon: getColoredNodeIcon('database'), category: 'Integration' },
    { type: 'webhook' as const, name: 'Webhook', icon: getColoredNodeIcon('webhook'), category: 'Integration' },
    { type: 'elevenlabs' as const, name: 'ElevenLabs', icon: getColoredNodeIcon('elevenlabs'), category: 'Integration' },
    { type: 'midjourney' as const, name: 'MidJourney', icon: getColoredNodeIcon('midjourney'), category: 'Integration' },
    { type: 'veo3' as const, name: 'Veo3', icon: getColoredNodeIcon('veo3'), category: 'Integration' },
    { type: 'openai' as const, name: 'OpenAI', icon: getColoredNodeIcon('openai'), category: 'Integration' },
    { type: 'anthropic' as const, name: 'Anthropic', icon: getColoredNodeIcon('anthropic'), category: 'Integration' },
    { type: 'stability' as const, name: 'Stability AI', icon: getColoredNodeIcon('stability'), category: 'Integration' },
    { type: 'runway' as const, name: 'Runway ML', icon: getColoredNodeIcon('runway'), category: 'Integration' },
    { type: 'replicate' as const, name: 'Replicate', icon: getColoredNodeIcon('replicate'), category: 'Integration' },
    { type: 'huggingface' as const, name: 'Hugging Face', icon: getColoredNodeIcon('huggingface'), category: 'Integration' },
    { type: 'cohere' as const, name: 'Cohere', icon: getColoredNodeIcon('cohere'), category: 'Integration' },
    { type: 'perplexity' as const, name: 'Perplexity', icon: getColoredNodeIcon('perplexity'), category: 'Integration' },

    // Communication
    { type: 'email' as const, name: 'Email', icon: getColoredNodeIcon('email'), category: 'Communication' },
    { type: 'sms' as const, name: 'SMS', icon: getColoredNodeIcon('sms'), category: 'Communication' },
    { type: 'notification' as const, name: 'Notification', icon: getColoredNodeIcon('notification'), category: 'Communication' },
    { type: 'voice' as const, name: 'Voice Call', icon: getColoredNodeIcon('voice'), category: 'Communication' },

    // Logic & Flow Control
    { type: 'loop' as const, name: 'Loop', icon: getColoredNodeIcon('loop'), category: 'Logic' },
    { type: 'condition' as const, name: 'Condition', icon: getColoredNodeIcon('condition'), category: 'Logic' },
    { type: 'trigger' as const, name: 'Trigger', icon: getColoredNodeIcon('trigger'), category: 'Logic' },
    { type: 'switch' as const, name: 'Switch', icon: getColoredNodeIcon('switch'), category: 'Logic' },
    { type: 'router' as const, name: 'Router', icon: getColoredNodeIcon('router'), category: 'Logic' },
    { type: 'delay' as const, name: 'Delay', icon: getColoredNodeIcon('delay'), category: 'Logic' },
    { type: 'queue' as const, name: 'Queue', icon: getColoredNodeIcon('queue'), category: 'Logic' },
    { type: 'batch' as const, name: 'Batch', icon: getColoredNodeIcon('batch'), category: 'Logic' },
    { type: 'parallel' as const, name: 'Parallel', icon: getColoredNodeIcon('parallel'), category: 'Logic' },
    { type: 'sequence' as const, name: 'Sequence', icon: getColoredNodeIcon('sequence'), category: 'Logic' },
    { type: 'retry' as const, name: 'Retry', icon: getColoredNodeIcon('retry'), category: 'Logic' },

    // Process Management
    { type: 'approval' as const, name: 'Approval', icon: getColoredNodeIcon('approval'), category: 'Process' },
    { type: 'review' as const, name: 'Review', icon: getColoredNodeIcon('review'), category: 'Process' },
    { type: 'timer' as const, name: 'Timer', icon: getColoredNodeIcon('timer'), category: 'Process' },

    // Social Media Integrations
    { type: 'instagram' as const, name: 'Instagram', icon: getColoredNodeIcon('instagram'), category: 'Integration' },
    { type: 'snapchat' as const, name: 'Snapchat', icon: getColoredNodeIcon('snapchat'), category: 'Integration' },
    { type: 'threads' as const, name: 'Threads', icon: getColoredNodeIcon('threads'), category: 'Integration' },
    { type: 'twitter' as const, name: 'Twitter/X', icon: getColoredNodeIcon('twitter'), category: 'Integration' },
    { type: 'facebook' as const, name: 'Facebook', icon: getColoredNodeIcon('facebook'), category: 'Integration' },
    { type: 'linkedin' as const, name: 'LinkedIn', icon: getColoredNodeIcon('linkedin'), category: 'Integration' },
    { type: 'tiktok' as const, name: 'TikTok', icon: getColoredNodeIcon('tiktok'), category: 'Integration' },
    { type: 'youtube' as const, name: 'YouTube', icon: getColoredNodeIcon('youtube'), category: 'Integration' },
    { type: 'discord' as const, name: 'Discord', icon: getColoredNodeIcon('discord'), category: 'Integration' },
    { type: 'telegram' as const, name: 'Telegram', icon: getColoredNodeIcon('telegram'), category: 'Integration' },
    { type: 'whatsapp' as const, name: 'WhatsApp', icon: getColoredNodeIcon('whatsapp'), category: 'Integration' },
    { type: 'reddit' as const, name: 'Reddit', icon: getColoredNodeIcon('reddit'), category: 'Integration' },

    // Business Integrations
    { type: 'salesforce' as const, name: 'Salesforce', icon: getColoredNodeIcon('salesforce'), category: 'Integration' },
    { type: 'hubspot' as const, name: 'HubSpot', icon: getColoredNodeIcon('hubspot'), category: 'Integration' },
    { type: 'pipedrive' as const, name: 'Pipedrive', icon: getColoredNodeIcon('pipedrive'), category: 'Integration' },
    { type: 'googlesheets' as const, name: 'Google Sheets', icon: getColoredNodeIcon('googlesheets'), category: 'Integration' },
    { type: 'excel' as const, name: 'Excel', icon: getColoredNodeIcon('excel'), category: 'Integration' },
    { type: 'airtable' as const, name: 'Airtable', icon: getColoredNodeIcon('airtable'), category: 'Integration' },
    { type: 'notion' as const, name: 'Notion', icon: getColoredNodeIcon('notion'), category: 'Integration' },
    { type: 'stripe' as const, name: 'Stripe', icon: getColoredNodeIcon('stripe'), category: 'Integration' },
    { type: 'paypal' as const, name: 'PayPal', icon: getColoredNodeIcon('paypal'), category: 'Integration' },
    { type: 'square' as const, name: 'Square', icon: getColoredNodeIcon('square'), category: 'Integration' },
    { type: 'slack' as const, name: 'Slack', icon: getColoredNodeIcon('slack'), category: 'Integration' },
    { type: 'teams' as const, name: 'Microsoft Teams', icon: getColoredNodeIcon('teams'), category: 'Integration' },
    { type: 'zoom' as const, name: 'Zoom', icon: getColoredNodeIcon('zoom'), category: 'Integration' }
  ]

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only handle selection changes in select mode, and not if we just finished panning
    if (workflow.currentTool === 'select' && e.target === e.currentTarget && !isPanning) {
      onSelectionChange([])
    }
  }

  // Canvas panning state
  const [isSpacePressed, setIsSpacePressed] = React.useState(false)
  const [isPanning, setIsPanning] = React.useState(false)
  const [panStart, setPanStart] = React.useState({ x: 0, y: 0 })
  const [mobileNodeMenuOpen, setMobileNodeMenuOpen] = React.useState(false)
  const [mobileAddTopLocal, setMobileAddTopLocal] = React.useState(96)

  React.useEffect(() => {
    const updateTop = () => {
      if (typeof window === 'undefined') return
      const header = document.getElementById('app-header')
      if (header) {
        const rect = header.getBoundingClientRect()
        setMobileAddTopLocal(rect.bottom + 8)
      }
    }
    updateTop()
    window.addEventListener('resize', updateTop)
    return () => window.removeEventListener('resize', updateTop)
  }, [isMobile])

  const handleKeyDown = (e: KeyboardEvent) => {

    // Don't interfere with typing in input fields, textareas, or contenteditable elements
    const target = e.target as HTMLElement
    const isTyping = target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'

    // Handle spacebar for canvas panning (but not when typing)
    if (e.code === 'Space' && !isSpacePressed && !isTyping) {
      e.preventDefault()
      setIsSpacePressed(true)
      return
    }

    // Tool shortcuts (only when space is not pressed)
    if (!isSpacePressed) {
      switch (e.key.toLowerCase()) {
        case 'v':
          onToolChange('select')
          break
        case 'h':
          onToolChange('pan')
          break
        case 'c':
          onToolChange('connect')
          break
        case 'x':
          if (workflow.selectedNodes.length > 0) {
            onNodesDelete(workflow.selectedNodes)
          }
          break
        case 'delete':
        case 'backspace':
          if (workflow.selectedNodes.length > 0) {
            onNodesDelete(workflow.selectedNodes)
          }
          break
        // Copy/Paste shortcuts
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (workflow.selectedNodes.length > 0) {
              onNodesCopy(workflow.selectedNodes)
            }
          }
          break
        case 'v':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            onNodesPaste()
          }
          break
      }
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      setIsSpacePressed(false)
      setIsPanning(false)
    }
  }



  const handleCanvasPanStart = (e: React.MouseEvent) => {
    // Allow panning in multiple scenarios:
    // 1. When spacebar is held (universal override)
    // 2. When in dedicated pan mode
    // 3. When in select mode and clicking empty canvas (unified drag)
    const isEmptyCanvasClick = e.target === e.currentTarget
    const shouldStartPanning = workflow.currentTool === 'pan' ||
      (workflow.currentTool === 'select' && isEmptyCanvasClick)

    if (shouldStartPanning) {
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleCanvasPanMove = (e: React.MouseEvent) => {
    // Allow panning in the same scenarios as pan start
    const shouldContinuePanning = isPanning && (
      workflow.currentTool === 'pan' ||
      workflow.currentTool === 'select'  // Continue panning if started in select mode
    )

    if (shouldContinuePanning) {
      e.preventDefault()
      const deltaX = e.clientX - panStart.x
      const deltaY = e.clientY - panStart.y

      setCanvasOffset(prev => ({
        x: prev.x + deltaX / canvasScale,
        y: prev.y + deltaY / canvasScale
      }))

      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleCanvasPanEnd = () => {
    setIsPanning(false)
  }

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [workflow.selectedNodes, isSpacePressed])

  return (
    <div className="absolute inset-0 top-20 flex flex-col">

      {/* Mobile Add Node sticky bar */}
      {isMobile && (
        <div className="fixed z-30 left-3 right-3" style={{ top: mobileAddTopLocal }}>
          <div className="flex items-center justify-center">
            <button
              onClick={() => setMobileNodeMenuOpen(v => !v)}
              className="w-full max-w-md px-4 py-2 rounded-lg bg-black/80 backdrop-blur-xl border border-white/20 text-white text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <Grid className="w-4 h-4 text-gray-300" />
              <span>Add Node</span>
            </button>
          </div>
          {mobileNodeMenuOpen && (
            <div className="mt-2 w-full max-w-md mx-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl p-2">
              <select
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
                defaultValue=""
                onChange={(e) => {
                  const typeStr = e.target.value
                  if (!typeStr) return
                  const choice = nodeTypes.find((n) => n.type === typeStr)
                  const rect = boardRef.current?.getBoundingClientRect()
                  if (!choice || !rect) return
                  const centerX = (rect.width / 2 - canvasOffset.x) / canvasScale
                  const centerY = (rect.height / 2 - canvasOffset.y) / canvasScale
                  if (choice.category === 'Business' && isBusinessType(choice.type)) {
                    handleBusinessItemClick(choice.type, { x: centerX, y: centerY })
                  } else {
                    onAddNode(choice.type, { x: centerX, y: centerY })
                  }
                  e.currentTarget.selectedIndex = 0
                  setMobileNodeMenuOpen(false)
                }}
              >
                <option value="">Select a node…</option>
                {['Basic', 'Business', 'Integration', 'Communication', 'Logic', 'Process'].map((category) => (
                  <optgroup key={category} label={category}>
                    {nodeTypes
                      .filter((node) => node.category === category)
                      .map((nodeType) => (
                        <option key={nodeType.type} value={nodeType.type}>
                          {nodeType.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Canvas Tools - Right Side (desktop only) */}
      {!isMobile && (
        <div className="absolute z-40 flex flex-col space-y-2 w-64 top-2 right-4">

          {/* Add Nodes Palette */}
          {(
            <div className={`bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-300 p-2 ${isPaletteCollapsed ? 'max-h-12 overflow-hidden' : 'max-h-[40rem]'
              }`}>
              {/* Palette Header with Collapse Button */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Grid className="w-3 h-3 text-gray-500" />
                  <h3 className="text-xs font-medium text-gray-300 px-1">Add Nodes</h3>
                  {isPaletteCollapsed && (
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                      {nodeTypes.length} nodes
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSnapToGrid(!snapToGrid)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`text-xs p-1 rounded transition-colors ${snapToGrid
                      ? 'text-blue-400 bg-blue-400/20'
                      : 'text-gray-500 hover:text-gray-400'
                      }`}
                    title={`Grid snap: ${snapToGrid ? 'ON' : 'OFF'} (8px grid)`}
                  >
                    <Hash className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsPaletteCollapsed(!isPaletteCollapsed)}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                    title={isPaletteCollapsed ? 'Expand palette' : 'Collapse palette'}
                  >
                    {isPaletteCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Palette Content */}
              <div className={`transition-all duration-300 ${isPaletteCollapsed ? 'opacity-0 max-h-0' : 'opacity-100 max-h-[36rem]'
                } overflow-y-scroll scrollbar-always-visible space-y-1`}>
                {['Basic', 'Business', 'Integration', 'Communication', 'Logic', 'Process'].map((category) => (
                  <div key={category}>
                    <div className="text-xs text-gray-500 px-1 py-1">{category}</div>
                    <div className="grid grid-cols-2 gap-1">
                      {nodeTypes.filter(node => node.category === category).map((nodeType) => (
                        <button
                          key={nodeType.type}
                          onClick={() => {
                            const rect = boardRef.current?.getBoundingClientRect()
                            if (rect) {
                              const centerX = (rect.width / 2 - canvasOffset.x) / canvasScale
                              const centerY = (rect.height / 2 - canvasOffset.y) / canvasScale

                              // Check if this is a business item that needs a selection modal
                              if (category === 'Business' && isBusinessType(nodeType.type)) {
                                handleBusinessItemClick(nodeType.type, { x: centerX, y: centerY })
                              } else {
                                onAddNode(nodeType.type, { x: centerX, y: centerY })
                              }
                            }
                          }}
                          className="p-2 rounded-lg text-white hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1 text-xs"
                          title={`Add ${nodeType.name}`}
                        >
                          {nodeType.icon}
                          <span className="truncate">{nodeType.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}




        </div>
      )}

      {/* Workflow Header with Zoom Controls */}
      <div className="absolute top-4 right-4 z-30 flex items-center space-x-3">
        <button
          onClick={onBackToWorkflows}
          className="p-2 bg-black/60 backdrop-blur-xl border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all"
          title="Back to Workflows"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>


      </div>



      {/* Enhanced Canvas Area */}
      <div
        ref={boardRef}
        className={`flex-1 relative overflow-hidden ${isPanning ? 'cursor-grab active:cursor-grabbing' :
          workflow.currentTool === 'pan' ? 'cursor-grab active:cursor-grabbing' :
            workflow.currentTool === 'connect' ? 'cursor-crosshair' :
              workflow.currentTool === 'delete' ? 'cursor-not-allowed' :
                workflow.currentTool === 'zoom' ? 'cursor-zoom-in' :
                  'cursor-grab hover:cursor-grab'
          }`}
        onClick={handleCanvasClick}
        onMouseDown={(e) => {
          handleCanvasPanStart(e)
          // Only call onMouseDown for node dragging if we're not starting canvas panning
          const isEmptyCanvasClick = e.target === e.currentTarget
          const willStartCanvasPanning = workflow.currentTool === 'pan' ||
            (workflow.currentTool === 'select' && isEmptyCanvasClick)

          if (!willStartCanvasPanning) {
            onMouseDown(e)
          }
        }}
        onMouseMove={(e) => {
          handleCanvasPanMove(e)
          onMouseMove(e)
        }}
        onMouseUp={(e) => {
          handleCanvasPanEnd()
          onMouseUp()
        }}
        onMouseLeave={(e) => {
          handleCanvasPanEnd()
          onMouseUp()
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `scale(${canvasScale}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        {/* Grid Background */}
        {workflow.showGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg width="100%" height="100%" className="w-full h-full">
              <defs>
                <pattern
                  id="grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {workflow.connections.map((connection: Connection) => {
            const from = getNodePosition(connection.from)
            const to = getNodePosition(connection.to)
            if (!from || !to) return null

            return (
              <g key={connection.id}>
                <line
                  x1={from.x + 120}
                  y1={from.y + 30}
                  x2={to.x + 120}
                  y2={to.y + 30}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
                <line
                  x1={from.x + 120}
                  y1={from.y + 30}
                  x2={to.x + 120}
                  y2={to.y + 30}
                  className={getConnectionColor(connection.type)}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {connection.amount && (
                  <text
                    x={(from.x + to.x) / 2 + 120}
                    y={(from.y + to.y) / 2 + 25}
                    className="text-xs fill-white"
                    textAnchor="middle"
                  >
                    ${connection.amount.toLocaleString()}
                  </text>
                )}
              </g>
            )
          })}
          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill="currentColor"
                className="text-white"
              />
            </marker>
          </defs>
        </svg>

        {/* Enhanced Workflow Nodes */}
        {workflow.nodes.map((node: WorkflowNode) => {
          const isSelected = workflow.selectedNode === node.id || workflow.selectedNodes.includes(node.id)
          const isConnecting = workflow.isConnecting === node.id
          const isDragging = workflow.dragging === node.id

          return (
            <div
              key={node.id}
              className={`absolute bg-black/60 backdrop-blur-xl border rounded-xl transition-all duration-300 shadow-2xl hover:shadow-white/5 group ${isSelected ? 'border-blue-400/60 ring-2 ring-blue-400/30 shadow-blue-400/20' :
                isConnecting ? 'ring-2 ring-green-400/50 shadow-green-400/20 border-green-400/60' :
                  getNodeBorderColor(node.type)
                } ${workflow.currentTool === 'delete' ? 'hover:border-red-400/60 hover:ring-2 hover:ring-red-400/30' : ''
                } ${workflow.currentTool === 'select' ? 'cursor-move' :
                  workflow.currentTool === 'connect' ? 'cursor-crosshair' :
                    workflow.currentTool === 'delete' ? 'cursor-not-allowed' :
                      workflow.currentTool === 'zoom' ? 'cursor-zoom-in' :
                        'cursor-pointer'
                } ${isMobile ? 'p-2 w-40' : 'p-4 w-60'
                }`}
              style={{
                left: workflow.gridSnap ? Math.round(node.x / 20) * 20 : node.x,
                top: workflow.gridSnap ? Math.round(node.y / 20) * 20 : node.y,
                transform: isDragging ? 'scale(1.05) rotate(1deg)' : 'scale(1)',
                zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                if (workflow.currentTool === 'delete') {
                  onNodeDelete(node.id)
                  return
                }
                if (workflow.currentTool === 'connect') {
                  if (workflow.isConnecting) {
                    onCompleteConnection(node.id)
                  } else {
                    onStartConnection(node.id)
                  }
                  return
                }
                if (workflow.currentTool === 'select') {
                  // Multi-selection with Ctrl/Cmd
                  if (e.ctrlKey || e.metaKey) {
                    const newSelection = isSelected
                      ? workflow.selectedNodes.filter(id => id !== node.id)
                      : [...workflow.selectedNodes, node.id]
                    onSelectionChange(newSelection)
                  } else {
                    onSelectionChange([node.id])
                  }
                  onMouseDown(e, node.id)
                }
              }}
              onDoubleClick={() => {
                onDoubleClick(node.id)
                setSelectedNodeDetails(node.id)
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (workflow.currentTool === 'connect' && workflow.isConnecting && workflow.isConnecting !== node.id) {
                  onCompleteConnection(node.id)
                }
              }}
            >
              {/* Header with large colored icon, status, and delete button */}
              <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'} ${getStatusColor(node.status)} rounded-full shadow-lg`} />
                  <div className="flex items-center justify-center">
                    {getLargeColoredNodeIcon(node.type)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onNodeDelete(node.id)
                  }}
                  className={`text-gray-400 hover:text-red-400 transition-colors ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} hover:scale-110`}
                >
                  <X className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} />
                </button>
              </div>

              {/* Node content */}
              <div className={`space-y-${isMobile ? '1' : '2'}`}>
                <input
                  type="text"
                  value={node.name}
                  onChange={(e) => onNodeUpdate(node.id, { name: e.target.value })}
                  placeholder="Node name"
                  className={`w-full bg-transparent border-none text-white font-medium focus:outline-none placeholder-gray-500 focus:placeholder-gray-400 transition-colors ${isMobile ? 'text-xs' : 'text-sm'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Inline media type selector for YouTube nodes */}
                {node.type === 'youtube' ? (
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <label className="opacity-70">Media:</label>
                    <select
                      value={String(node.metadata?.mediaType || 'channel')}
                      onChange={(e) => onNodeUpdate(node.id, { metadata: { ...node.metadata, mediaType: e.target.value } })}
                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="channel">Channel</option>
                      <option value="video">Video</option>
                    </select>
                    {String(node.metadata?.mediaType || 'channel') === 'channel' ? (
                      <input
                        type="text"
                        value={String(node.metadata?.channelId || '')}
                        onChange={(e) => onNodeUpdate(node.id, { metadata: { ...node.metadata, channelId: e.target.value } })}
                        placeholder="Channel ID"
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <input
                        type="text"
                        value={String(node.metadata?.videoId || '')}
                        onChange={(e) => onNodeUpdate(node.id, { metadata: { ...node.metadata, videoId: e.target.value } })}
                        placeholder="Video ID"
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder-gray-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={node.description}
                    onChange={(e) => onNodeUpdate(node.id, { description: e.target.value })}
                    placeholder="Description"
                    className={`w-full bg-transparent border-none text-gray-400 focus:outline-none placeholder-gray-600 focus:placeholder-gray-500 focus:text-gray-300 transition-colors ${isMobile ? 'text-xs' : 'text-xs'
                      }`}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Type-specific fields */}
                {node.type === 'payment' && node.amount && (
                  <div className="text-yellow-400 text-sm font-medium">
                    ${node.amount.toLocaleString()}
                  </div>
                )}

                {node.type === 'contract' && node.deadline && (
                  <div className="text-blue-400 text-xs">
                    Due: {new Date(node.deadline).toLocaleDateString()}
                  </div>
                )}

                {node.type === 'task' && node.assignees && (
                  <div className="text-green-400 text-xs">
                    {node.assignees.join(', ')}
                  </div>
                )}

                {node.type === 'decision' && node.conditions && (
                  <div className="flex space-x-1">
                    {node.conditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                )}

                {node.type === 'team' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-400 text-xs">
                        Team: {node.memberCount || node.assignees?.length || 0} members
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleExpansion(node.id)
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {node.isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </button>
                    </div>

                    {node.isExpanded && node.childNodes && (
                      <div className="mt-3 space-y-2">
                        {node.childNodes.map((childNode) => (
                          <div
                            key={childNode.id}
                            className="bg-white/10 rounded-lg p-2 border border-white/20"
                          >
                            <div className="flex items-center space-x-2">
                              <div className="text-white/60">
                                {getNodeIcon(childNode.type)}
                              </div>
                              <div className="flex-1">
                                <div className="text-white text-xs font-medium">{childNode.name}</div>
                                <div className="text-gray-400 text-xs">{childNode.description}</div>
                              </div>
                              <div className={`w-2 h-2 ${getStatusColor(childNode.status)} rounded-full`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {node.type === 'team' && node.assignees && (
                  <div className="text-pink-400 text-xs">
                    Team: {node.assignees.length} members
                  </div>
                )}

                {/* Organization Node Display */}
                {node.type === 'organization' && (
                  <div className="space-y-2">
                    <div className="text-blue-400 text-xs">
                      {node.organizationRef ? `Org ID: ${node.organizationRef}` : 'No organization selected'}
                    </div>
                    {Boolean(node.metadata?.tokenSymbol) && (
                      <div className="text-yellow-400 text-xs">
                        Token: {node.metadata?.tokenSymbol as string}
                      </div>
                    )}
                  </div>
                )}

                {/* Role Node Display */}
                {node.type === 'role' && (
                  <div className="space-y-2">
                    <div className="text-purple-400 text-xs">
                      {node.roleRef ? `Role ID: ${node.roleRef}` : 'No role selected'}
                    </div>
                    {Boolean(node.metadata?.shareAllocation) && (
                      <div className="text-green-400 text-xs">
                        Shares: {node.metadata?.shareAllocation as number}%
                      </div>
                    )}
                  </div>
                )}

                {/* Member Node Display */}
                {node.type === 'member' && (
                  <div className="space-y-2">
                    <div className="text-cyan-400 text-xs">
                      {node.memberRef ? `Member ID: ${node.memberRef}` : 'No member selected'}
                    </div>
                    {Boolean(node.metadata?.handle) && (
                      <div className="text-orange-400 text-xs">
                        @{node.metadata?.handle as string}
                      </div>
                    )}
                  </div>
                )}

                {/* Instrument Node Display */}
                {node.type === 'instrument' && (
                  <div className="space-y-2">
                    <div className="text-green-400 text-xs">
                      {node.instrumentRef ? `Instrument ID: ${node.instrumentRef}` : 'No instrument selected'}
                    </div>
                    {Boolean(node.metadata?.type) && (
                      <div className="text-yellow-400 text-xs">
                        Type: {node.metadata?.type as string}
                      </div>
                    )}
                    {node.amount && (
                      <div className="text-green-300 text-xs">
                        Amount: ${node.amount.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                {/* Integration Node Display */}
                {node.type === 'integration' && (
                  <div className="space-y-2">
                    <div className="text-indigo-400 text-xs">
                      {node.integrationRef ? `Integration ID: ${node.integrationRef}` : 'No integration selected'}
                    </div>
                    {Boolean(node.metadata?.service) && (
                      <div className="text-blue-400 text-xs">
                        Service: {node.metadata?.service as string}
                      </div>
                    )}
                    {Boolean(node.metadata?.status) && (
                      <div className={`text-xs ${(node.metadata?.status as string) === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
                        Status: {node.metadata?.status as string}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Connect button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStartConnection(node.id)
                }}
                className={`w-full mt-3 text-xs px-2 py-1 rounded-lg transition-all duration-200 ${workflow.isConnecting === node.id
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30 shadow-green-400/20'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
              >
                {workflow.isConnecting === node.id ? 'Click target' : 'Connect'}
              </button>

              {/* Open button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDoubleClick(node.id)
                  setSelectedNodeDetails(node.id)
                }}
                className="w-full mt-2 text-xs px-2 py-1 rounded-lg transition-all duration-200 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 border border-blue-400/30 hover:border-blue-400/50"
              >
                Open
              </button>
            </div>
          )
        })}
      </div>

      {/* Business Selection Modal */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={(e) => e.stopPropagation()}>
          <div className="bg-black/90 border border-white/10 rounded-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-white font-semibold text-lg">Select {showBusinessModal.replace('-', ' ')}</span>
              </div>
              <button className="text-gray-400 hover:text-white" onClick={() => setShowBusinessModal(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {/* Debug info */}
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">
                  <strong>Debug:</strong> Modal: {showBusinessModal} |
                  Organizations: {organizations.length} |
                  Roles: {roles.length} |
                  Instruments: {instruments.length} |
                  Contracts: {contracts.length}
                </p>
              </div>
              {/* Special handling for member profiles */}
              {showBusinessModal === 'member' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizations.flatMap(o => o.members).map((member) => (
                    <div key={member.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
                      {/* Member Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {member.displayName?.charAt(0) || member.handle.charAt(1)}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{member.displayName}</h3>
                            <p className="text-blue-400 text-sm font-mono">{member.handle}</p>
                            {getWalletBadge(member.walletType)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{member.organizationId === '1' ? 'TechCorp Inc.' : 'Organization'}</div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${member.kycStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                            member.kycStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                            {member.kycStatus === 'approved' ? '✓' : member.kycStatus === 'pending' ? '⏳' : '✗'}
                          </div>
                        </div>
                      </div>

                      {/* Member Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white">{member.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Address:</span>
                          <span className="text-white font-mono">{member.publicAddress?.substring(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Last Active:</span>
                          <span className="text-white">{new Date(member.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleBusinessItemSelect({ id: member.id, name: member.displayName || member.handle, description: member.handle })}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-2"
                      >
                        <span>Click to view profile →</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(showBusinessModal === 'workflow' ? workflows :
                    showBusinessModal === 'organization' ? organizations :
                      showBusinessModal === 'role' ? roles :
                        showBusinessModal === 'instrument' ? instruments :
                          showBusinessModal === 'contract' ? contracts :
                            showBusinessModal === 'wallets' ? wallets :
                              showBusinessModal === 'integration' ? [] :
                                []).map((item: BusinessItem) => (
                                  <button
                                    key={item.id}
                                    onClick={() => handleBusinessItemSelect(item)}
                                    className="text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-3 transition-all"
                                  >
                                    <div className="font-medium text-white truncate">{item.name}</div>
                                    {item.description && (
                                      <div className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</div>
                                    )}
                                  </button>
                                ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Node Details Modal */}
      {selectedNodeDetails && workflow.nodes.find(n => n.id === selectedNodeDetails) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {(() => {
              const node = workflow.nodes.find(n => n.id === selectedNodeDetails)!
              const content = getNodeInternalContent(node)

              return (
                <>
                  {/* Modal Header */}
                  <div className="border-b border-white/20 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        {getNodeIcon(node.type)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{node.name}</h2>
                        <p className="text-gray-400 text-sm">{content.title}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedNodeDetails(null)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      title="Close"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto max-h-[60vh]" data-allow-scroll="true">
                    {/* Team/Organization Items (with avatars/icons) */}
                    {(node.type === 'team' || node.type === 'organization') && (
                      <div className="grid gap-3">
                        {content.items.map((item, index: number) => (
                          <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">
                                {item.type === 'team-member' ? item.avatar : item.type === 'organization-dept' ? item.icon : ''}
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {(item.type === 'team-member' || item.type === 'organization-dept') ? item.name : ''}
                                </div>
                                <div className="text-gray-400 text-sm">
                                  {item.type === 'team-member' ? item.role : item.type === 'organization-dept' ? `${item.count} members` : ''}
                                </div>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${(item.type === 'team-member' || item.type === 'organization-dept') && item.status === 'Active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                              {(item.type === 'team-member' || item.type === 'organization-dept') ? item.status : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Other Node Types (key-value pairs) */}
                    {(node.type !== 'team' && node.type !== 'organization') && (
                      <div className="grid gap-4">
                        {content.items.map((item, index: number) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                            <div className="text-gray-400 font-medium">{item.type === 'key-value' ? item.label : ''}</div>
                            <div className="text-white font-mono text-sm bg-white/5 px-3 py-1 rounded">
                              {item.type === 'key-value' ? item.value : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Node Description */}
                    {node.description && (
                      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                        <h3 className="text-white font-medium mb-2">Description</h3>
                        <p className="text-gray-300 text-sm">{node.description}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center space-x-3">
                      <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium">
                        Edit Node
                      </button>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
                        Duplicate
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

// Organizations View Component
function OrganizationsView({
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
      // If clicking on already selected organization, deselect it
      onDeselectOrganization()
    } else {
      // Otherwise, select the clicked organization
      onSelectOrganization(orgId)
    }
  }

  // Organization Templates
  const organizationTemplates = [
    // Corporations
    { id: '1', name: 'Technology Corporation', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Technology', size: 'medium', description: 'Software development and technology services company', tokenSymbol: 'TECH', icon: '🏢' },
    { id: '2', name: 'Manufacturing Corp', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Manufacturing', size: 'large', description: 'Industrial manufacturing and production company', tokenSymbol: 'MANU', icon: '🏭' },
    { id: '3', name: 'Financial Services Inc', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Financial Services', size: 'enterprise', description: 'Banking and financial services corporation', tokenSymbol: 'FINS', icon: '🏦' },
    { id: '4', name: 'Healthcare Systems Corp', category: 'Corporation', businessType: 'corporation', jurisdiction: 'US', industry: 'Healthcare', size: 'large', description: 'Healthcare services and medical technology', tokenSymbol: 'HLTH', icon: '🏥' },

    // LLCs (US)
    { id: '5', name: 'Creative Studio LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Creative Services', size: 'small', description: 'Creative design and marketing agency', tokenSymbol: 'CRTV', icon: '🎨' },
    { id: '6', name: 'Real Estate Holdings LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Real Estate', size: 'medium', description: 'Property investment and management company', tokenSymbol: 'REAL', icon: '🏠' },
    { id: '7', name: 'Consulting Group LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Consulting', size: 'small', description: 'Business strategy and management consulting', tokenSymbol: 'CONS', icon: '💼' },
    { id: '8', name: 'Food & Beverage LLC', category: 'LLC', businessType: 'llc', jurisdiction: 'US', industry: 'Food & Beverage', size: 'medium', description: 'Restaurant and food service operations', tokenSymbol: 'FOOD', icon: '🍽️' },

    // LTD (UK)
    { id: '9', name: 'Innovation Labs Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Research & Development', size: 'medium', description: 'R&D and innovation services company', tokenSymbol: 'INNO', icon: '🔬' },
    { id: '10', name: 'Digital Marketing Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Marketing', size: 'small', description: 'Digital marketing and advertising agency', tokenSymbol: 'DIGI', icon: '📱' },
    { id: '11', name: 'Logistics Solutions Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Logistics', size: 'large', description: 'Supply chain and logistics management', tokenSymbol: 'LOGI', icon: '🚛' },
    { id: '12', name: 'Green Energy Ltd', category: 'LTD', businessType: 'corporation', jurisdiction: 'UK', industry: 'Energy', size: 'medium', description: 'Renewable energy solutions provider', tokenSymbol: 'GREN', icon: '🌱' },

    // Non-Profits
    { id: '13', name: 'Education Foundation', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Education', size: 'medium', description: 'Educational programs and scholarship foundation', tokenSymbol: 'EDUC', icon: '📚' },
    { id: '14', name: 'Environmental Alliance', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Environmental', size: 'large', description: 'Environmental conservation and advocacy organization', tokenSymbol: 'ENVR', icon: '🌍' },
    { id: '15', name: 'Community Health Network', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Healthcare', size: 'large', description: 'Community healthcare services and clinics', tokenSymbol: 'COMM', icon: '🏥' },
    { id: '16', name: 'Arts & Culture Society', category: 'Non-Profit', businessType: 'nonprofit', jurisdiction: 'US', industry: 'Arts & Culture', size: 'medium', description: 'Arts education and cultural preservation', tokenSymbol: 'ARTS', icon: '🎭' },

    // Charities
    { id: '17', name: 'Children\'s Welfare Charity', category: 'Charity', businessType: 'charity', jurisdiction: 'UK', industry: 'Social Services', size: 'large', description: 'Child welfare and family support services', tokenSymbol: 'CHLD', icon: '👶' },
    { id: '18', name: 'Food Bank Network', category: 'Charity', businessType: 'charity', jurisdiction: 'US', industry: 'Social Services', size: 'medium', description: 'Food distribution and hunger relief', tokenSymbol: 'FOOD', icon: '🍞' },
    { id: '19', name: 'Animal Rescue Foundation', category: 'Charity', businessType: 'charity', jurisdiction: 'CA', industry: 'Animal Welfare', size: 'medium', description: 'Animal rescue and rehabilitation services', tokenSymbol: 'ANIM', icon: '🐕' },
    { id: '20', name: 'Disaster Relief Fund', category: 'Charity', businessType: 'charity', jurisdiction: 'US', industry: 'Emergency Services', size: 'large', description: 'Emergency response and disaster relief', tokenSymbol: 'EMER', icon: '🚨' },

    // Small Businesses
    { id: '21', name: 'Local Coffee Shop', category: 'Small Business', businessType: 'sole_proprietorship', jurisdiction: 'US', industry: 'Food & Beverage', size: 'startup', description: 'Neighborhood coffee shop and bakery', tokenSymbol: 'CAFE', icon: '☕' },
    { id: '22', name: 'Handcraft Store', category: 'Small Business', businessType: 'sole_proprietorship', jurisdiction: 'US', industry: 'Retail', size: 'startup', description: 'Handmade crafts and artisan goods', tokenSymbol: 'CRFT', icon: '🧶' },
    { id: '23', name: 'Auto Repair Shop', category: 'Small Business', businessType: 'llc', jurisdiction: 'US', industry: 'Automotive', size: 'small', description: 'Automotive repair and maintenance services', tokenSymbol: 'AUTO', icon: '🔧' },
    { id: '24', name: 'Fitness Studio', category: 'Small Business', businessType: 'llc', jurisdiction: 'US', industry: 'Health & Fitness', size: 'small', description: 'Personal training and fitness classes', tokenSymbol: 'FIT', icon: '💪' },

    // Partnerships
    { id: '25', name: 'Legal Partnership', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Legal Services', size: 'medium', description: 'Law firm partnership specializing in corporate law', tokenSymbol: 'LAW', icon: '⚖️' },
    { id: '26', name: 'Medical Practice', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Healthcare', size: 'medium', description: 'Multi-physician medical practice', tokenSymbol: 'MED', icon: '👩‍⚕️' },
    { id: '27', name: 'Accounting Firm', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Professional Services', size: 'medium', description: 'CPA firm providing accounting services', tokenSymbol: 'CPA', icon: '📊' },
    { id: '28', name: 'Architecture Studio', category: 'Partnership', businessType: 'partnership', jurisdiction: 'US', industry: 'Architecture', size: 'small', description: 'Architectural design and planning services', tokenSymbol: 'ARCH', icon: '🏗️' },

    // Cooperatives
    { id: '29', name: 'Farmers Cooperative', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Agriculture', size: 'large', description: 'Agricultural cooperative for local farmers', tokenSymbol: 'FARM', icon: '🚜' },
    { id: '30', name: 'Workers Cooperative', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Manufacturing', size: 'medium', description: 'Worker-owned manufacturing cooperative', tokenSymbol: 'WORK', icon: '👷' },
    { id: '31', name: 'Housing Cooperative', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Real Estate', size: 'large', description: 'Residential housing cooperative', tokenSymbol: 'HOME', icon: '🏘️' },
    { id: '32', name: 'Credit Union', category: 'Cooperative', businessType: 'cooperative', jurisdiction: 'US', industry: 'Financial Services', size: 'large', description: 'Member-owned financial cooperative', tokenSymbol: 'CRED', icon: '🏛️' },

    // International Organizations
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
      businessType: template.businessType as 'corporation' | 'llc' | 'partnership' | 'nonprofit' | 'charity' | 'sole_proprietorship' | 'cooperative' | 'other',
      jurisdiction: template.jurisdiction as 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'SG' | 'HK' | 'other',
      industry: template.industry,
      size: template.size as 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
    })
    setShowTemplates(false)
  }

  const filteredOrganizationTemplates = selectedCategory === 'All'
    ? organizationTemplates
    : organizationTemplates.filter(template => template.category === selectedCategory)

  return (
    <div className="absolute inset-0 top-20 p-6 overflow-y-auto scrollbar-always-visible">
      <div className="max-w-6xl mx-auto">
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

        {/* Create Organization Modal */}
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

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {organizationCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Template Grid */}
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

              {/* Organization Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
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

                {/* Legal Structure */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Legal Structure</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Business Type</label>
                    <select
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value as 'corporation' | 'llc' | 'partnership' | 'nonprofit' | 'charity' | 'sole_proprietorship' | 'cooperative' | 'other' })}
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
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value as 'US' | 'UK' | 'CA' | 'AU' | 'DE' | 'FR' | 'SG' | 'HK' | 'other' })}
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
                      onChange={(e) => setFormData({ ...formData, size: e.target.value as 'startup' | 'small' | 'medium' | 'large' | 'enterprise' })}
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

        {/* Organization Templates Section */}
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

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {organizationCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
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

          {/* Templates Grid */}
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

          {/* Empty State */}
          {filteredOrganizationTemplates.length === 0 && (
            <div className="text-center py-12 bg-black/20 rounded-xl border border-white/10">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
              <p className="text-gray-400">Try selecting a different category or clear your filters</p>
            </div>
          )}
        </div>

        {/* Organizations Grid */}
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
              className={`bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer transition-all hover:shadow-white/5 relative group ${selectedOrganization === org.id ? 'ring-2 ring-blue-400 shadow-blue-400/20' : ''
                }`}
              onClick={() => handleOrganizationClick(org.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Building2 className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${org.status === 'active' ? 'bg-green-500/20 text-green-400' :
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

              {/* Click hint */}
              <div className={`transition-opacity mt-4 pt-3 border-t border-white/10 ${selectedOrganization === org.id
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100'
                }`}>
                <p className={`text-xs text-center ${selectedOrganization === org.id
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

// Roles View Component
function RolesView({ roles, selectedOrganization, onAddMember, onCreateRole, onUpdateRole, onDeleteRole }: Omit<RolesViewProps, 'organizations'>) {
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
    { id: 'bot', name: 'AI Agent' },
    { id: 'crown', name: 'Leadership' },
    { id: 'trending-up', name: 'Growth' },
    { id: 'bar-chart-3', name: 'Analytics' },
    { id: 'palette', name: 'Creative' },
    { id: 'shield', name: 'Security' },
    { id: 'settings', name: 'Operations' },
    { id: 'users', name: 'Team' }
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

  // Human-only role templates for traditional employment
  const roleTemplates = [
    // Executive Leadership
    {
      name: 'Chief Executive Officer',
      description: 'Overall company leadership, strategic direction, and stakeholder relations',
      icon: 'crown',
      permissions: ['admin', 'finance', 'operations', 'data-analysis'],
      defaultShareAllocation: 25,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'Chief Technology Officer',
      description: 'Technology strategy, product development, and engineering leadership',
      icon: 'cpu',
      permissions: ['tech', 'admin', 'workflow-creation'],
      defaultShareAllocation: 20,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'Chief Operating Officer',
      description: 'Daily operations, process optimization, and business execution',
      icon: 'settings',
      permissions: ['operations', 'admin', 'finance'],
      defaultShareAllocation: 18,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'Chief Financial Officer',
      description: 'Financial planning, budgeting, fundraising, and fiscal management',
      icon: 'bar-chart-3',
      permissions: ['finance', 'admin', 'data-analysis'],
      defaultShareAllocation: 15,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'Chief Marketing Officer',
      description: 'Marketing strategy, brand management, and customer acquisition',
      icon: 'trending-up',
      permissions: ['marketing', 'admin', 'data-analysis'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Executive'
    },

    // Engineering & Development
    {
      name: 'Senior Software Engineer',
      description: 'Full-stack development, architecture decisions, and technical mentorship',
      icon: 'code',
      permissions: ['tech', 'workflow-creation'],
      defaultShareAllocation: 8,
      automationType: 'workflow' as const,
      category: 'Engineering'
    },
    {
      name: 'Frontend Developer',
      description: 'User interface development, responsive design, and user experience',
      icon: 'monitor',
      permissions: ['tech', 'marketing'],
      defaultShareAllocation: 6,
      automationType: 'workflow' as const,
      category: 'Engineering'
    },
    {
      name: 'Backend Developer',
      description: 'Server-side development, API design, and database management',
      icon: 'server',
      permissions: ['tech', 'operations'],
      defaultShareAllocation: 6,
      automationType: 'workflow' as const,
      category: 'Engineering'
    },
    {
      name: 'DevOps Engineer',
      description: 'Infrastructure automation, deployment pipelines, and system monitoring',
      icon: 'cloud',
      permissions: ['tech', 'operations', 'automation'],
      defaultShareAllocation: 7,
      automationType: 'workflow' as const,
      category: 'Engineering'
    },
    {
      name: 'Quality Assurance Engineer',
      description: 'Testing automation, bug tracking, and quality standards enforcement',
      icon: 'shield-check',
      permissions: ['tech', 'operations'],
      defaultShareAllocation: 5,
      automationType: 'workflow' as const,
      category: 'Engineering'
    },
    {
      name: 'Data Engineer',
      description: 'Data pipeline development, analytics infrastructure, and data modeling',
      icon: 'database',
      permissions: ['tech', 'data-analysis'],
      defaultShareAllocation: 7,
      automationType: 'workflow' as const,
      category: 'Engineering'
    },

    // Product & Design
    {
      name: 'Product Manager',
      description: 'Product strategy, feature prioritization, and stakeholder coordination',
      icon: 'users',
      permissions: ['tech', 'marketing', 'operations'],
      defaultShareAllocation: 8,
      automationType: 'workflow' as const,
      category: 'Product'
    },
    {
      name: 'UI/UX Designer',
      description: 'User interface design, user experience research, and design systems',
      icon: 'palette',
      permissions: ['marketing', 'tech'],
      defaultShareAllocation: 6,
      automationType: 'workflow' as const,
      category: 'Design'
    },
    {
      name: 'Graphic Designer',
      description: 'Visual design, branding materials, and marketing collateral',
      icon: 'image',
      permissions: ['marketing'],
      defaultShareAllocation: 4,
      automationType: 'workflow' as const,
      category: 'Design'
    },

    // Marketing & Sales
    {
      name: 'Marketing Manager',
      description: 'Campaign management, content strategy, and brand development',
      icon: 'megaphone',
      permissions: ['marketing', 'data-analysis'],
      defaultShareAllocation: 7,
      automationType: 'workflow' as const,
      category: 'Marketing'
    },
    {
      name: 'Sales Manager',
      description: 'Sales strategy, client relationships, and revenue generation',
      icon: 'trending-up',
      permissions: ['marketing', 'finance'],
      defaultShareAllocation: 8,
      automationType: 'workflow' as const,
      category: 'Sales'
    },
    {
      name: 'Content Creator',
      description: 'Content production, social media management, and community engagement',
      icon: 'edit',
      permissions: ['marketing'],
      defaultShareAllocation: 4,
      automationType: 'workflow' as const,
      category: 'Marketing'
    },
    {
      name: 'Digital Marketing Specialist',
      description: 'Online advertising, SEO optimization, and digital campaign management',
      icon: 'globe',
      permissions: ['marketing', 'data-analysis'],
      defaultShareAllocation: 5,
      automationType: 'workflow' as const,
      category: 'Marketing'
    },
    {
      name: 'Business Development Representative',
      description: 'Lead generation, client outreach, and partnership development',
      icon: 'handshake',
      permissions: ['marketing', 'operations'],
      defaultShareAllocation: 5,
      automationType: 'workflow' as const,
      category: 'Sales'
    },

    // Operations & Administration
    {
      name: 'Operations Manager',
      description: 'Daily operations oversight, process improvement, and team coordination',
      icon: 'settings',
      permissions: ['operations', 'admin'],
      defaultShareAllocation: 7,
      automationType: 'workflow' as const,
      category: 'Operations'
    },
    {
      name: 'Administrative Assistant',
      description: 'Administrative support, scheduling, and office management',
      icon: 'clipboard',
      permissions: ['operations'],
      defaultShareAllocation: 3,
      automationType: 'workflow' as const,
      category: 'Administration'
    },
    {
      name: 'Project Manager',
      description: 'Project planning, timeline management, and resource coordination',
      icon: 'calendar',
      permissions: ['operations', 'admin'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Operations'
    },
    {
      name: 'Business Analyst',
      description: 'Process analysis, requirements gathering, and business optimization',
      icon: 'bar-chart',
      permissions: ['operations', 'data-analysis'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Operations'
    },

    // Finance & Accounting
    {
      name: 'Accountant',
      description: 'Financial record keeping, tax preparation, and compliance reporting',
      icon: 'calculator',
      permissions: ['finance', 'legal'],
      defaultShareAllocation: 5,
      automationType: 'workflow' as const,
      category: 'Finance'
    },
    {
      name: 'Financial Analyst',
      description: 'Financial modeling, budget analysis, and investment research',
      icon: 'trending-up',
      permissions: ['finance', 'data-analysis'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Finance'
    },
    {
      name: 'Bookkeeper',
      description: 'Daily financial transactions, expense tracking, and record maintenance',
      icon: 'book',
      permissions: ['finance'],
      defaultShareAllocation: 4,
      automationType: 'workflow' as const,
      category: 'Finance'
    },

    // Human Resources
    {
      name: 'HR Manager',
      description: 'Employee relations, recruitment, and policy development',
      icon: 'users',
      permissions: ['admin', 'legal'],
      defaultShareAllocation: 7,
      automationType: 'ai-agent' as const,
      category: 'Human Resources'
    },
    {
      name: 'HR Coordinator',
      description: 'Employee onboarding, benefits administration, and HR support',
      icon: 'user-plus',
      permissions: ['admin'],
      defaultShareAllocation: 4,
      automationType: 'workflow' as const,
      category: 'Human Resources'
    },
    {
      name: 'Recruiter',
      description: 'Talent acquisition, candidate screening, and hiring coordination',
      icon: 'search',
      permissions: ['admin', 'marketing'],
      defaultShareAllocation: 5,
      automationType: 'hybrid' as const,
      category: 'Human Resources'
    },

    // Customer Support
    {
      name: 'Customer Support Manager',
      description: 'Support team leadership, escalation handling, and service quality',
      icon: 'headphones',
      permissions: ['operations', 'marketing'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Customer Support'
    },
    {
      name: 'Customer Support Representative',
      description: 'Customer assistance, issue resolution, and service delivery',
      icon: 'message-circle',
      permissions: ['operations'],
      defaultShareAllocation: 3,
      automationType: 'ai-agent' as const,
      category: 'Customer Support'
    },
    {
      name: 'Technical Support Specialist',
      description: 'Technical troubleshooting, product support, and user guidance',
      icon: 'tool',
      permissions: ['tech', 'operations'],
      defaultShareAllocation: 4,
      automationType: 'hybrid' as const,
      category: 'Customer Support'
    },

    // Legal & Compliance
    {
      name: 'Legal Counsel',
      description: 'Legal advice, contract review, and regulatory compliance',
      icon: 'scale',
      permissions: ['legal', 'admin'],
      defaultShareAllocation: 8,
      automationType: 'ai-agent' as const,
      category: 'Legal'
    },
    {
      name: 'Compliance Officer',
      description: 'Regulatory compliance, policy enforcement, and risk management',
      icon: 'shield',
      permissions: ['legal', 'operations'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Legal'
    },

    // Specialized Roles
    {
      name: 'Security Specialist',
      description: 'Information security, threat assessment, and security protocols',
      icon: 'lock',
      permissions: ['tech', 'legal'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Security'
    },
    {
      name: 'Blockchain Developer',
      description: 'Smart contract development, DApp creation, and blockchain integration',
      icon: 'link',
      permissions: ['tech', 'finance'],
      defaultShareAllocation: 8,
      automationType: 'hybrid' as const,
      category: 'Blockchain'
    },
    {
      name: 'Research Analyst',
      description: 'Market research, competitive analysis, and industry insights',
      icon: 'search',
      permissions: ['data-analysis', 'marketing'],
      defaultShareAllocation: 5,
      automationType: 'ai-agent' as const,
      category: 'Research'
    },

    // Entry Level & Intern Positions
    {
      name: 'Junior Developer',
      description: 'Entry-level development, learning-focused role with mentorship',
      icon: 'code',
      permissions: ['tech'],
      defaultShareAllocation: 2,
      automationType: 'workflow' as const,
      category: 'Entry Level'
    },
    {
      name: 'Marketing Intern',
      description: 'Marketing support, campaign assistance, and learning opportunities',
      icon: 'user',
      permissions: ['marketing'],
      defaultShareAllocation: 1,
      automationType: 'workflow' as const,
      category: 'Entry Level'
    },
    {
      name: 'Business Intern',
      description: 'General business support, project assistance, and skill development',
      icon: 'briefcase',
      permissions: ['operations'],
      defaultShareAllocation: 1,
      automationType: 'workflow' as const,
      category: 'Entry Level'
    },

    // Consultant & Contract Roles
    {
      name: 'Technical Consultant',
      description: 'Specialized technical expertise, project-based engagement',
      icon: 'cpu',
      permissions: ['tech', 'operations'],
      defaultShareAllocation: 10,
      automationType: 'hybrid' as const,
      category: 'Consulting'
    },
    {
      name: 'Business Consultant',
      description: 'Strategic advisory, process improvement, and business optimization',
      icon: 'briefcase',
      permissions: ['operations', 'finance'],
      defaultShareAllocation: 8,
      automationType: 'ai-agent' as const,
      category: 'Consulting'
    },
    {
      name: 'Freelance Designer',
      description: 'Project-based design work, creative services, and visual content',
      icon: 'palette',
      permissions: ['marketing'],
      defaultShareAllocation: 5,
      automationType: 'ai-agent' as const,
      category: 'Consulting'
    },

    // Healthcare & Medical
    {
      name: 'Chief Medical Officer',
      description: 'Medical leadership, clinical strategy, and healthcare operations',
      icon: 'heart',
      permissions: ['admin', 'operations', 'legal'],
      defaultShareAllocation: 20,
      automationType: 'workflow' as const,
      category: 'Healthcare'
    },
    {
      name: 'Physician',
      description: 'Patient care, medical diagnosis, and treatment planning',
      icon: 'stethoscope',
      permissions: ['operations', 'legal'],
      defaultShareAllocation: 15,
      automationType: 'hybrid' as const,
      category: 'Healthcare'
    },
    {
      name: 'Nurse Practitioner',
      description: 'Advanced nursing care, patient assessment, and treatment',
      icon: 'heart-pulse',
      permissions: ['operations'],
      defaultShareAllocation: 8,
      automationType: 'hybrid' as const,
      category: 'Healthcare'
    },
    {
      name: 'Medical Assistant',
      description: 'Patient support, clinical assistance, and administrative tasks',
      icon: 'clipboard-heart',
      permissions: ['operations'],
      defaultShareAllocation: 4,
      automationType: 'ai-agent' as const,
      category: 'Healthcare'
    },
    {
      name: 'Healthcare Administrator',
      description: 'Healthcare operations, facility management, and regulatory compliance',
      icon: 'building',
      permissions: ['admin', 'operations', 'legal'],
      defaultShareAllocation: 10,
      automationType: 'workflow' as const,
      category: 'Healthcare'
    },
    {
      name: 'Medical Researcher',
      description: 'Clinical research, data analysis, and medical studies',
      icon: 'microscope',
      permissions: ['data-analysis', 'legal'],
      defaultShareAllocation: 8,
      automationType: 'ai-agent' as const,
      category: 'Healthcare'
    },

    // Education & Training
    {
      name: 'Education Director',
      description: 'Educational program leadership, curriculum development, and academic strategy',
      icon: 'graduation-cap',
      permissions: ['admin', 'operations'],
      defaultShareAllocation: 15,
      automationType: 'workflow' as const,
      category: 'Education'
    },
    {
      name: 'Teacher/Instructor',
      description: 'Classroom instruction, student assessment, and educational delivery',
      icon: 'book-open',
      permissions: ['operations'],
      defaultShareAllocation: 6,
      automationType: 'hybrid' as const,
      category: 'Education'
    },
    {
      name: 'Curriculum Developer',
      description: 'Educational content creation, learning design, and instructional materials',
      icon: 'book',
      permissions: ['operations', 'marketing'],
      defaultShareAllocation: 7,
      automationType: 'ai-agent' as const,
      category: 'Education'
    },
    {
      name: 'Training Specialist',
      description: 'Corporate training, skill development, and professional education',
      icon: 'presentation',
      permissions: ['operations', 'admin'],
      defaultShareAllocation: 5,
      automationType: 'hybrid' as const,
      category: 'Education'
    },
    {
      name: 'Student Advisor',
      description: 'Student guidance, academic counseling, and educational support',
      icon: 'user-check',
      permissions: ['operations'],
      defaultShareAllocation: 4,
      automationType: 'ai-agent' as const,
      category: 'Education'
    },

    // Manufacturing & Production
    {
      name: 'Production Manager',
      description: 'Manufacturing oversight, production planning, and quality control',
      icon: 'factory',
      permissions: ['operations', 'admin'],
      defaultShareAllocation: 10,
      automationType: 'workflow' as const,
      category: 'Manufacturing'
    },
    {
      name: 'Quality Control Inspector',
      description: 'Product inspection, quality assurance, and compliance testing',
      icon: 'check-circle',
      permissions: ['operations'],
      defaultShareAllocation: 5,
      automationType: 'ai-agent' as const,
      category: 'Manufacturing'
    },
    {
      name: 'Machine Operator',
      description: 'Equipment operation, production line work, and machinery maintenance',
      icon: 'cog',
      permissions: ['operations'],
      defaultShareAllocation: 4,
      automationType: 'workflow' as const,
      category: 'Manufacturing'
    },
    {
      name: 'Safety Coordinator',
      description: 'Workplace safety, compliance monitoring, and risk prevention',
      icon: 'shield-check',
      permissions: ['operations', 'legal'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Manufacturing'
    },
    {
      name: 'Supply Chain Manager',
      description: 'Inventory management, supplier relations, and logistics coordination',
      icon: 'truck',
      permissions: ['operations', 'finance'],
      defaultShareAllocation: 8,
      automationType: 'workflow' as const,
      category: 'Manufacturing'
    },

    // Retail & Customer Service
    {
      name: 'Store Manager',
      description: 'Retail operations, staff management, and sales performance',
      icon: 'store',
      permissions: ['operations', 'admin', 'marketing'],
      defaultShareAllocation: 8,
      automationType: 'workflow' as const,
      category: 'Retail'
    },
    {
      name: 'Sales Associate',
      description: 'Customer service, product sales, and retail assistance',
      icon: 'shopping-bag',
      permissions: ['marketing'],
      defaultShareAllocation: 3,
      automationType: 'ai-agent' as const,
      category: 'Retail'
    },
    {
      name: 'Cashier',
      description: 'Transaction processing, payment handling, and customer checkout',
      icon: 'credit-card',
      permissions: ['operations'],
      defaultShareAllocation: 2,
      automationType: 'workflow' as const,
      category: 'Retail'
    },
    {
      name: 'Inventory Specialist',
      description: 'Stock management, inventory tracking, and supply coordination',
      icon: 'package',
      permissions: ['operations'],
      defaultShareAllocation: 4,
      automationType: 'ai-agent' as const,
      category: 'Retail'
    },
    {
      name: 'Visual Merchandiser',
      description: 'Store displays, product presentation, and retail aesthetics',
      icon: 'eye',
      permissions: ['marketing'],
      defaultShareAllocation: 5,
      automationType: 'ai-agent' as const,
      category: 'Retail'
    },

    // Food Service & Hospitality
    {
      name: 'Restaurant Manager',
      description: 'Restaurant operations, staff coordination, and customer experience',
      icon: 'utensils',
      permissions: ['operations', 'admin', 'marketing'],
      defaultShareAllocation: 10,
      automationType: 'workflow' as const,
      category: 'Food Service'
    },
    {
      name: 'Head Chef',
      description: 'Kitchen management, menu development, and culinary leadership',
      icon: 'chef-hat',
      permissions: ['operations', 'marketing'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Food Service'
    },
    {
      name: 'Server/Waiter',
      description: 'Customer service, order taking, and dining experience delivery',
      icon: 'coffee',
      permissions: ['marketing'],
      defaultShareAllocation: 3,
      automationType: 'ai-agent' as const,
      category: 'Food Service'
    },
    {
      name: 'Bartender',
      description: 'Beverage preparation, customer interaction, and bar operations',
      icon: 'wine',
      permissions: ['marketing', 'operations'],
      defaultShareAllocation: 4,
      automationType: 'hybrid' as const,
      category: 'Food Service'
    },
    {
      name: 'Hotel Manager',
      description: 'Hotel operations, guest services, and hospitality management',
      icon: 'building',
      permissions: ['operations', 'admin', 'marketing'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Hospitality'
    },
    {
      name: 'Front Desk Agent',
      description: 'Guest check-in/out, customer service, and hotel administration',
      icon: 'key',
      permissions: ['operations', 'marketing'],
      defaultShareAllocation: 3,
      automationType: 'ai-agent' as const,
      category: 'Hospitality'
    },

    // Transportation & Logistics
    {
      name: 'Logistics Manager',
      description: 'Transportation coordination, shipping oversight, and supply chain management',
      icon: 'truck',
      permissions: ['operations', 'finance'],
      defaultShareAllocation: 9,
      automationType: 'workflow' as const,
      category: 'Logistics'
    },
    {
      name: 'Delivery Driver',
      description: 'Package delivery, route management, and customer interaction',
      icon: 'map-pin',
      permissions: ['operations'],
      defaultShareAllocation: 3,
      automationType: 'ai-agent' as const,
      category: 'Logistics'
    },
    {
      name: 'Warehouse Worker',
      description: 'Inventory handling, order fulfillment, and warehouse operations',
      icon: 'box',
      permissions: ['operations'],
      defaultShareAllocation: 3,
      automationType: 'workflow' as const,
      category: 'Logistics'
    },
    {
      name: 'Fleet Manager',
      description: 'Vehicle management, maintenance coordination, and transportation planning',
      icon: 'car',
      permissions: ['operations', 'finance'],
      defaultShareAllocation: 7,
      automationType: 'workflow' as const,
      category: 'Logistics'
    },

    // Creative & Media
    {
      name: 'Creative Director',
      description: 'Creative vision, artistic leadership, and brand development',
      icon: 'palette',
      permissions: ['marketing', 'admin'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Creative'
    },
    {
      name: 'Video Editor',
      description: 'Video production, post-production editing, and multimedia content creation',
      icon: 'video',
      permissions: ['marketing', 'tech'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Creative'
    },
    {
      name: 'Photographer',
      description: 'Photography services, visual content creation, and image production',
      icon: 'camera',
      permissions: ['marketing'],
      defaultShareAllocation: 5,
      automationType: 'hybrid' as const,
      category: 'Creative'
    },
    {
      name: 'Copywriter',
      description: 'Content writing, marketing copy, and brand messaging',
      icon: 'pen-tool',
      permissions: ['marketing'],
      defaultShareAllocation: 5,
      automationType: 'ai-agent' as const,
      category: 'Creative'
    },
    {
      name: 'Social Media Manager',
      description: 'Social media strategy, content planning, and community management',
      icon: 'share',
      permissions: ['marketing', 'data-analysis'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Creative'
    },
    {
      name: 'Animator',
      description: '2D/3D animation, motion graphics, and visual effects',
      icon: 'play',
      permissions: ['marketing', 'tech'],
      defaultShareAllocation: 7,
      automationType: 'hybrid' as const,
      category: 'Creative'
    },

    // Finance & Accounting
    {
      name: 'Controller',
      description: 'Financial reporting, accounting oversight, and fiscal management',
      icon: 'calculator',
      permissions: ['finance', 'admin'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Finance'
    },
    {
      name: 'Accountant',
      description: 'Financial record keeping, tax preparation, and bookkeeping',
      icon: 'file-text',
      permissions: ['finance'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Finance'
    },
    {
      name: 'Financial Analyst',
      description: 'Financial modeling, investment analysis, and market research',
      icon: 'trending-up',
      permissions: ['finance', 'data-analysis'],
      defaultShareAllocation: 8,
      automationType: 'ai-agent' as const,
      category: 'Finance'
    },
    {
      name: 'Payroll Specialist',
      description: 'Payroll processing, benefits administration, and compensation management',
      icon: 'dollar-sign',
      permissions: ['finance', 'admin'],
      defaultShareAllocation: 5,
      automationType: 'workflow' as const,
      category: 'Finance'
    },
    {
      name: 'Investment Advisor',
      description: 'Investment strategy, portfolio management, and financial planning',
      icon: 'pie-chart',
      permissions: ['finance', 'data-analysis'],
      defaultShareAllocation: 10,
      automationType: 'ai-agent' as const,
      category: 'Finance'
    },
    {
      name: 'Risk Manager',
      description: 'Risk assessment, compliance monitoring, and financial risk mitigation',
      icon: 'shield',
      permissions: ['finance', 'legal'],
      defaultShareAllocation: 8,
      automationType: 'ai-agent' as const,
      category: 'Finance'
    },

    // Real Estate
    {
      name: 'Real Estate Agent',
      description: 'Property sales, client representation, and market expertise',
      icon: 'home',
      permissions: ['marketing', 'operations'],
      defaultShareAllocation: 8,
      automationType: 'hybrid' as const,
      category: 'Real Estate'
    },
    {
      name: 'Property Manager',
      description: 'Property maintenance, tenant relations, and facility management',
      icon: 'building',
      permissions: ['operations', 'finance'],
      defaultShareAllocation: 7,
      automationType: 'workflow' as const,
      category: 'Real Estate'
    },
    {
      name: 'Real Estate Appraiser',
      description: 'Property valuation, market analysis, and appraisal services',
      icon: 'search',
      permissions: ['data-analysis', 'operations'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Real Estate'
    },
    {
      name: 'Construction Supervisor',
      description: 'Construction oversight, project management, and quality control',
      icon: 'hard-hat',
      permissions: ['operations', 'admin'],
      defaultShareAllocation: 9,
      automationType: 'workflow' as const,
      category: 'Real Estate'
    },
    {
      name: 'Architect',
      description: 'Building design, architectural planning, and construction documentation',
      icon: 'ruler',
      permissions: ['operations', 'tech'],
      defaultShareAllocation: 12,
      automationType: 'hybrid' as const,
      category: 'Real Estate'
    },

    // Agriculture & Environment
    {
      name: 'Farm Manager',
      description: 'Agricultural operations, crop management, and farm business oversight',
      icon: 'tractor',
      permissions: ['operations', 'finance'],
      defaultShareAllocation: 10,
      automationType: 'workflow' as const,
      category: 'Agriculture'
    },
    {
      name: 'Agricultural Scientist',
      description: 'Crop research, soil analysis, and agricultural innovation',
      icon: 'leaf',
      permissions: ['data-analysis', 'operations'],
      defaultShareAllocation: 8,
      automationType: 'ai-agent' as const,
      category: 'Agriculture'
    },
    {
      name: 'Environmental Specialist',
      description: 'Environmental compliance, sustainability planning, and ecological assessment',
      icon: 'globe',
      permissions: ['legal', 'data-analysis'],
      defaultShareAllocation: 7,
      automationType: 'ai-agent' as const,
      category: 'Environment'
    },
    {
      name: 'Sustainability Manager',
      description: 'Green initiatives, environmental strategy, and corporate sustainability',
      icon: 'recycle',
      permissions: ['operations', 'admin'],
      defaultShareAllocation: 8,
      automationType: 'workflow' as const,
      category: 'Environment'
    },

    // Non-Profit & Social Services
    {
      name: 'Program Director',
      description: 'Program management, community outreach, and social impact leadership',
      icon: 'heart',
      permissions: ['admin', 'operations', 'marketing'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Non-Profit'
    },
    {
      name: 'Social Worker',
      description: 'Client services, case management, and community support',
      icon: 'users',
      permissions: ['operations'],
      defaultShareAllocation: 6,
      automationType: 'hybrid' as const,
      category: 'Non-Profit'
    },
    {
      name: 'Grant Writer',
      description: 'Funding proposals, grant applications, and donor relations',
      icon: 'edit',
      permissions: ['marketing', 'finance'],
      defaultShareAllocation: 7,
      automationType: 'ai-agent' as const,
      category: 'Non-Profit'
    },
    {
      name: 'Volunteer Coordinator',
      description: 'Volunteer management, community engagement, and program support',
      icon: 'handshake',
      permissions: ['operations', 'marketing'],
      defaultShareAllocation: 4,
      automationType: 'hybrid' as const,
      category: 'Non-Profit'
    },

    // Government & Public Service
    {
      name: 'City Manager',
      description: 'Municipal administration, public services, and government operations',
      icon: 'landmark',
      permissions: ['admin', 'operations', 'finance'],
      defaultShareAllocation: 15,
      automationType: 'workflow' as const,
      category: 'Government'
    },
    {
      name: 'Policy Analyst',
      description: 'Policy research, regulatory analysis, and government advisory',
      icon: 'file-text',
      permissions: ['data-analysis', 'legal'],
      defaultShareAllocation: 8,
      automationType: 'ai-agent' as const,
      category: 'Government'
    },
    {
      name: 'Public Relations Specialist',
      description: 'Government communications, media relations, and public engagement',
      icon: 'megaphone',
      permissions: ['marketing', 'admin'],
      defaultShareAllocation: 6,
      automationType: 'ai-agent' as const,
      category: 'Government'
    },

    // Sports & Entertainment
    {
      name: 'Event Coordinator',
      description: 'Event planning, venue management, and entertainment production',
      icon: 'calendar',
      permissions: ['operations', 'marketing'],
      defaultShareAllocation: 7,
      automationType: 'workflow' as const,
      category: 'Entertainment'
    },
    {
      name: 'Athletic Director',
      description: 'Sports program management, team coordination, and athletic administration',
      icon: 'trophy',
      permissions: ['admin', 'operations'],
      defaultShareAllocation: 10,
      automationType: 'workflow' as const,
      category: 'Sports'
    },
    {
      name: 'Fitness Trainer',
      description: 'Personal training, fitness instruction, and health coaching',
      icon: 'dumbbell',
      permissions: ['operations'],
      defaultShareAllocation: 4,
      automationType: 'hybrid' as const,
      category: 'Sports'
    },
    {
      name: 'Music Producer',
      description: 'Audio production, recording supervision, and music creation',
      icon: 'music',
      permissions: ['marketing', 'tech'],
      defaultShareAllocation: 9,
      automationType: 'hybrid' as const,
      category: 'Entertainment'
    },

    // New Executive Roles
    {
      name: 'CEO',
      description: 'Chief Executive Officer - Strategic leadership and decision making',
      icon: 'crown',
      permissions: ['admin', 'finance', 'operations'],
      defaultShareAllocation: 25,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'Marketing Manager',
      description: 'Marketing campaigns, social media management, and customer engagement',
      icon: 'megaphone',
      permissions: ['marketing', 'data-analysis'],
      defaultShareAllocation: 15,
      automationType: 'workflow' as const,
      category: 'Management'
    },
    {
      name: 'Finance Manager',
      description: 'Financial analysis, budget tracking, and reporting',
      icon: 'calculator',
      permissions: ['finance', 'admin', 'data-analysis'],
      defaultShareAllocation: 20,
      automationType: 'workflow' as const,
      category: 'Management'
    },
    {
      name: 'Tech Lead',
      description: 'Code review, technical documentation, and development workflows',
      icon: 'code',
      permissions: ['tech', 'workflow-creation'],
      defaultShareAllocation: 25,
      automationType: 'workflow' as const,
      category: 'Management'
    },
    {
      name: 'Operations Manager',
      description: 'Process management, workflow optimization, and operational efficiency',
      icon: 'settings',
      permissions: ['operations', 'workflow-creation'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Management'
    },
    {
      name: 'Creative Director',
      description: 'Content creation, brand management, and creative strategy',
      icon: 'palette',
      permissions: ['marketing', 'workflow-creation'],
      defaultShareAllocation: 15,
      automationType: 'workflow' as const,
      category: 'Creative'
    },
    {
      name: 'Legal Counsel',
      description: 'Contract analysis, compliance monitoring, and legal documentation',
      icon: 'scale',
      permissions: ['legal', 'admin', 'data-analysis'],
      defaultShareAllocation: 18,
      automationType: 'workflow' as const,
      category: 'Legal'
    },
    {
      name: 'Customer Success Manager',
      description: 'Customer support, relationship management, and satisfaction monitoring',
      icon: 'heart',
      permissions: ['marketing', 'data-analysis'],
      defaultShareAllocation: 10,
      automationType: 'workflow' as const,
      category: 'Customer Support'
    },
    {
      name: 'CTO',
      description: 'Chief Technology Officer - Technology strategy, architecture, and innovation leadership',
      icon: 'cpu',
      permissions: ['admin', 'tech', 'workflow-creation'],
      defaultShareAllocation: 20,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'CMO',
      description: 'Chief Marketing Officer - Marketing strategy, brand management, and growth initiatives',
      icon: 'trending-up',
      permissions: ['admin', 'marketing', 'data-analysis'],
      defaultShareAllocation: 18,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'CFO',
      description: 'Chief Financial Officer - Financial planning, analysis, and strategic financial management',
      icon: 'bar-chart-3',
      permissions: ['admin', 'finance', 'data-analysis'],
      defaultShareAllocation: 22,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'COO',
      description: 'Chief Operating Officer - Operations management, process optimization, and execution',
      icon: 'settings',
      permissions: ['admin', 'operations', 'workflow-creation'],
      defaultShareAllocation: 20,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'CHRO',
      description: 'Chief Human Resources Officer - People strategy, culture, and organizational development',
      icon: 'users',
      permissions: ['admin', 'operations'],
      defaultShareAllocation: 12,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'VP of Sales',
      description: 'Vice President of Sales - Sales strategy, team leadership, and revenue generation',
      icon: 'trending-up',
      permissions: ['marketing', 'data-analysis'],
      defaultShareAllocation: 16,
      automationType: 'workflow' as const,
      category: 'Leadership'
    },
    {
      name: 'VP of Engineering',
      description: 'Vice President of Engineering - Engineering leadership, technical delivery, and team management',
      icon: 'code',
      permissions: ['tech', 'workflow-creation', 'operations'],
      defaultShareAllocation: 18,
      automationType: 'workflow' as const,
      category: 'Leadership'
    },
    {
      name: 'VP of Product',
      description: 'Vice President of Product - Product strategy, roadmap, and user experience leadership',
      icon: 'palette',
      permissions: ['workflow-creation', 'data-analysis', 'marketing'],
      defaultShareAllocation: 15,
      automationType: 'workflow' as const,
      category: 'Leadership'
    },
    {
      name: 'General Counsel',
      description: 'Chief Legal Officer - Legal strategy, compliance, risk management, and corporate governance',
      icon: 'scale',
      permissions: ['admin', 'legal'],
      defaultShareAllocation: 14,
      automationType: 'workflow' as const,
      category: 'Executive'
    },
    {
      name: 'Head of Data',
      description: 'Chief Data Officer - Data strategy, analytics, and business intelligence leadership',
      icon: 'database',
      permissions: ['data-analysis', 'tech', 'workflow-creation'],
      defaultShareAllocation: 13,
      automationType: 'workflow' as const,
      category: 'Leadership'
    },
    {
      name: 'Head of Security',
      description: 'Chief Security Officer - Information security, risk assessment, and cybersecurity strategy',
      icon: 'shield',
      permissions: ['tech', 'admin', 'operations'],
      defaultShareAllocation: 11,
      automationType: 'workflow' as const,
      category: 'Leadership'
    },
    {
      name: 'Head of Customer Success',
      description: 'Customer Success Leadership - Customer retention, satisfaction, and growth strategies',
      icon: 'heart',
      permissions: ['marketing', 'data-analysis'],
      defaultShareAllocation: 10,
      automationType: 'workflow' as const,
      category: 'Leadership'
    }
  ]

  const applyTemplate = (template: typeof roleTemplates[0]) => {
    setRoleFormData({
      name: template.name,
      description: template.description,
      icon: template.icon,
      permissions: [...template.permissions],
      defaultShareAllocation: template.defaultShareAllocation,
      automationType: template.automationType
    })
    setShowTemplates(false)
  }

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(roleTemplates.map(t => t.category)))]

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'All'
    ? roleTemplates
    : roleTemplates.filter(t => t.category === selectedCategory)

  // Filter roles by organization if one is selected
  const filteredRoles = selectedOrganization
    ? roles.filter(role => role.organizationId === selectedOrganization)
    : roles

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role)
    setShowRoleDetail(true)
  }

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown': return <Crown className="w-5 h-5" />
      case 'trending-up': return <TrendingUp className="w-5 h-5" />
      case 'bar-chart-3': return <BarChart3 className="w-5 h-5" />
      case 'palette': return <Palette className="w-5 h-5" />
      case 'shield': return <Shield className="w-5 h-5" />
      case 'bot': return <Bot className="w-5 h-5" />
      case 'settings': return <Settings className="w-5 h-5" />
      case 'users': return <Users className="w-5 h-5" />
      default: return <Bot className="w-5 h-5" />
    }
  }

  const getRoleIconColor = (iconName: string) => {
    switch (iconName) {
      case 'crown': return 'text-yellow-400'
      case 'trending-up': return 'text-green-400'
      case 'bar-chart-3': return 'text-blue-400'
      case 'palette': return 'text-purple-400'
      case 'shield': return 'text-red-400'
      case 'bot': return 'text-cyan-400'
      case 'settings': return 'text-gray-400'
      case 'users': return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="absolute inset-0 top-20 p-6 overflow-y-auto scrollbar-always-visible" data-allow-scroll="true">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Employee Roles & Positions</h1>
            <p className="text-gray-300">Manage employee roles, compensation, and blockchain-based payroll</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateRoleForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Create New Role</span>
            </button>
            {selectedOrganization && (
              <button
                onClick={() => setShowAddMemberForm(true)}
                className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 px-6 py-3 rounded-xl flex items-center space-x-3 text-white shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Add Member</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Member Modal */}
        {showAddMemberForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-96">
              <h2 className="text-xl font-bold text-white mb-4">Add Team Member</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="HandCash Handle (e.g., @alice)"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Display Name"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedRole?.id || ''}
                  onChange={(e) => setSelectedRole(roles.find((r: Role) => r.id === e.target.value) || null)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Role</option>
                  {roles.map((role: Role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.defaultShareAllocation}% shares
                    </option>
                  ))}
                </select>
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddMember}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Member
                  </button>
                  <button
                    onClick={() => setShowAddMemberForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Role Modal */}
        {showCreateRoleForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create AI Agent Role</h3>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {showTemplates ? 'Hide Templates' : 'Use Template'}
                </button>
              </div>

              {showTemplates && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-white">Choose a Template</h4>
                    <span className="text-sm text-gray-400">{filteredTemplates.length} templates</span>
                  </div>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                    {filteredTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => applyTemplate(template)}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-left transition-all"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-6 h-6 flex items-center justify-center ${getRoleIconColor(template.icon)}`}>
                            {getRoleIcon(template.icon)}
                          </div>
                          <span className="text-white font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-gray-300 text-xs mb-2">{template.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">{template.category}</span>
                          <span className="text-xs text-blue-400">{template.defaultShareAllocation}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Marketing AI Agent"
                      value={roleFormData.name}
                      onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Default Share %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={roleFormData.defaultShareAllocation}
                      onChange={(e) => setRoleFormData({ ...roleFormData, defaultShareAllocation: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe what this AI agent does..."
                    value={roleFormData.description}
                    onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Automation Type</label>
                  <select
                    value={roleFormData.automationType}
                    onChange={(e) => setRoleFormData({ ...roleFormData, automationType: e.target.value as 'ai-agent' | 'workflow' | 'hybrid' })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ai-agent">AI Agent (Conversational)</option>
                    <option value="workflow">Workflow Automation</option>
                    <option value="hybrid">Hybrid (AI + Workflow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
                  <div className="grid grid-cols-4 gap-3">
                    {availableIcons.map(icon => (
                      <button
                        key={icon.id}
                        onClick={() => setRoleFormData({ ...roleFormData, icon: icon.id })}
                        className={`p-3 rounded-lg border transition-all ${roleFormData.icon === icon.id
                          ? 'bg-blue-500 border-blue-400 text-white'
                          : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                          }`}
                      >
                        <div className="w-5 h-5 mx-auto mb-1">
                          {getRoleIcon(icon.id)}
                        </div>
                        <span className="text-xs">{icon.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={roleFormData.permissions.includes(permission)}
                          onChange={() => togglePermission(permission)}
                          className="w-4 h-4 text-blue-500 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                        />
                        <span className="text-white text-sm">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-white/20">
                  <button
                    onClick={handleCreateRole}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Create AI Agent
                  </button>
                  <button
                    onClick={() => setShowCreateRoleForm(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Detail Modal */}
        {showRoleDetail && selectedRole && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center ${getRoleIconColor(selectedRole.icon)}`}>
                    {getRoleIcon(selectedRole.icon)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedRole.name}</h3>
                    <p className="text-gray-400">{selectedRole.defaultShareAllocation}% default shares</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoleDetail(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {selectedRole.isAutomated && (
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="w-5 h-5 text-cyan-400" />
                      <span className="text-cyan-400 font-medium">Automated Role</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Type: {selectedRole.automationType?.replace('-', ' ').toUpperCase()}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Description</h4>
                  <p className="text-gray-300">{selectedRole.description}</p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-white mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRole.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedRole.workflowId && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Associated Workflows</h4>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-300">Workflow ID: {selectedRole.workflowId}</p>
                      <button className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                        Open Workflow →
                      </button>
                    </div>
                  </div>
                )}

                {selectedRole.aiPrompt && (
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">AI Prompt</h4>
                    <div className="p-3 bg-white/5 rounded-lg">
                      <p className="text-gray-300 text-sm">{selectedRole.aiPrompt}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t border-white/20">
                  <button
                    onClick={() => {
                      // TODO: Navigate to workflow editor for this role
                      setShowRoleDetail(false)
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit Workflows
                  </button>
                  <button
                    onClick={() => {
                      onDeleteRole(selectedRole.id)
                      setShowRoleDetail(false)
                    }}
                    className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition-colors rounded-lg"
                  >
                    Delete Role
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Filter Info */}
        {selectedOrganization && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              Showing roles for selected organization • {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRoles.map((role: Role) => (
            <div
              key={role.id}
              onClick={() => handleRoleClick(role)}
              className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer hover:border-white/40 hover:bg-black/70 transition-all duration-300 relative group"
            >
              {/* Automation Badge */}
              {role.isAutomated && (
                <div className="absolute top-3 right-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${role.automationType === 'ai-agent'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : role.automationType === 'workflow'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {role.automationType === 'ai-agent' ? 'AI' : role.automationType === 'workflow' ? 'WF' : 'HY'}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <div className={getRoleIconColor(role.icon)}>
                    {getRoleIcon(role.icon)}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                  <p className="text-gray-400 text-sm">{role.defaultShareAllocation}% shares</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{role.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {role.permissions.slice(0, 3).map((permission, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/10 text-white text-xs rounded"
                  >
                    {permission}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-1 bg-white/10 text-gray-400 text-xs rounded">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>

              {/* Click hint */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-blue-400 text-xs">Click to view details →</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Instruments View Component
function InstrumentsView({ instruments, organizations, selectedOrganization, onCreateInstrument, onDeleteInstrument, onSelectOrganization, onDeselectOrganization }: Omit<InstrumentsViewProps, 'onUpdateInstrument'>) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [formData, setFormData] = useState({
    name: '',
    type: 'equity' as FinancialInstrument['type'],
    symbol: '',
    description: '',
    totalSupply: 1000000,
    decimals: 18,
    blockchain: 'Bitcoin SV',
    organizationId: selectedOrganization || ''
  })

  const currentOrg = organizations.find((org: Organization) => org.id === selectedOrganization)
  const orgInstruments = instruments.filter(instrument => instrument.organizationId === selectedOrganization)

  const handleCreate = () => {
    if (formData.name && formData.symbol) {
      onCreateInstrument({
        ...formData,
        organizationId: selectedOrganization || undefined,
        issuedSupply: 0,
        status: 'draft',
        metadata: {}
      })
      setFormData({
        name: '',
        type: 'equity',
        symbol: '',
        description: '',
        totalSupply: 1000000,
        decimals: 18,
        blockchain: 'Bitcoin SV',
        organizationId: selectedOrganization || ''
      })
      setShowCreateForm(false)
    }
  }

  const getInstrumentTypeColor = (type: FinancialInstrument['type']) => {
    switch (type) {
      case 'equity': return 'text-green-400'
      case 'debt': return 'text-red-400'
      case 'derivative': return 'text-purple-400'
      case 'reward': return 'text-yellow-400'
      case 'utility': return 'text-blue-400'
      case 'governance': return 'text-indigo-400'
      case 'hybrid': return 'text-pink-400'
      default: return 'text-gray-400'
    }
  }

  const getInstrumentIcon = (type: FinancialInstrument['type']) => {
    switch (type) {
      case 'equity': return <TrendingUp className="w-5 h-5" />
      case 'debt': return <CreditCard className="w-5 h-5" />
      case 'derivative': return <BarChart3 className="w-5 h-5" />
      case 'reward': return <Coins className="w-5 h-5" />
      case 'utility': return <Settings className="w-5 h-5" />
      case 'governance': return <Scale className="w-5 h-5" />
      case 'hybrid': return <Circle className="w-5 h-5" />
      default: return <Circle className="w-5 h-5" />
    }
  }

  // Financial Instrument Templates
  const instrumentTemplates = [
    // Equity Instruments
    { id: '1', name: 'Common Stock', category: 'Equity', type: 'equity', symbol: 'COMM', description: 'Traditional common stock with voting rights', totalSupply: 1000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '📈' },
    { id: '2', name: 'Preferred Shares', category: 'Equity', type: 'equity', symbol: 'PREF', description: 'Preferred stock with dividend priority', totalSupply: 100000, decimals: 0, blockchain: 'Bitcoin SV', icon: '⭐' },
    { id: '3', name: 'Employee Stock Options', category: 'Equity', type: 'equity', symbol: 'ESOP', description: 'Employee stock option program', totalSupply: 50000, decimals: 0, blockchain: 'Bitcoin SV', icon: '👥' },
    { id: '4', name: 'Startup Equity', category: 'Equity', type: 'equity', symbol: 'STUP', description: 'Early-stage startup equity shares', totalSupply: 10000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🚀' },

    // Debt Instruments
    { id: '5', name: 'Corporate Bond', category: 'Debt', type: 'debt', symbol: 'BOND', description: 'Fixed-rate corporate bond instrument', totalSupply: 1000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🏛️' },
    { id: '6', name: 'Convertible Note', category: 'Debt', type: 'debt', symbol: 'CONV', description: 'Convertible debt instrument', totalSupply: 500, decimals: 2, blockchain: 'Bitcoin SV', icon: '🔄' },
    { id: '7', name: 'Revenue Bond', category: 'Debt', type: 'debt', symbol: 'REVB', description: 'Revenue-backed bond instrument', totalSupply: 2000, decimals: 2, blockchain: 'Bitcoin SV', icon: '💰' },
    { id: '8', name: 'Green Bond', category: 'Debt', type: 'debt', symbol: 'GREN', description: 'Environmental project funding bond', totalSupply: 1500, decimals: 2, blockchain: 'Bitcoin SV', icon: '🌱' },

    // Utility Tokens
    { id: '9', name: 'Platform Utility Token', category: 'Utility', type: 'utility', symbol: 'UTIL', description: 'Platform access and service utility token', totalSupply: 100000000, decimals: 18, blockchain: 'Bitcoin SV', icon: '🔧' },
    { id: '10', name: 'Gaming Token', category: 'Utility', type: 'utility', symbol: 'GAME', description: 'In-game currency and utility token', totalSupply: 1000000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🎮' },
    { id: '11', name: 'Loyalty Points', category: 'Utility', type: 'utility', symbol: 'LOYA', description: 'Customer loyalty and rewards token', totalSupply: 50000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎁' },
    { id: '12', name: 'Access Token', category: 'Utility', type: 'utility', symbol: 'ACCS', description: 'Service access and subscription token', totalSupply: 10000000, decimals: 6, blockchain: 'Bitcoin SV', icon: '🔑' },

    // Governance Tokens
    { id: '13', name: 'DAO Governance Token', category: 'Governance', type: 'governance', symbol: 'DAO', description: 'Decentralized governance voting token', totalSupply: 21000000, decimals: 18, blockchain: 'Bitcoin SV', icon: '🗳️' },
    { id: '14', name: 'Protocol Governance', category: 'Governance', type: 'governance', symbol: 'PROT', description: 'Protocol parameter governance token', totalSupply: 100000000, decimals: 18, blockchain: 'Bitcoin SV', icon: '⚖️' },
    { id: '15', name: 'Community Token', category: 'Governance', type: 'governance', symbol: 'COMM', description: 'Community decision-making token', totalSupply: 1000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🏛️' },
    { id: '16', name: 'Voting Rights', category: 'Governance', type: 'governance', symbol: 'VOTE', description: 'Shareholder voting rights token', totalSupply: 500000, decimals: 0, blockchain: 'Bitcoin SV', icon: '✅' },

    // Reward Tokens
    { id: '17', name: 'Cashback Rewards', category: 'Reward', type: 'reward', symbol: 'CASH', description: 'Purchase cashback reward token', totalSupply: 100000000, decimals: 2, blockchain: 'Bitcoin SV', icon: '💸' },
    { id: '18', name: 'Staking Rewards', category: 'Reward', type: 'reward', symbol: 'STAK', description: 'Network staking reward token', totalSupply: 50000000, decimals: 18, blockchain: 'Bitcoin SV', icon: '📊' },
    { id: '19', name: 'Achievement Points', category: 'Reward', type: 'reward', symbol: 'ACHV', description: 'Milestone achievement reward token', totalSupply: 10000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🏆' },
    { id: '20', name: 'Referral Bonus', category: 'Reward', type: 'reward', symbol: 'REF', description: 'Referral program bonus token', totalSupply: 25000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🤝' },

    // Derivative Instruments
    { id: '21', name: 'Stock Option', category: 'Derivative', type: 'derivative', symbol: 'OPT', description: 'Stock option derivative contract', totalSupply: 100000, decimals: 6, blockchain: 'Bitcoin SV', icon: '📋' },
    { id: '22', name: 'Futures Contract', category: 'Derivative', type: 'derivative', symbol: 'FUT', description: 'Commodity futures derivative', totalSupply: 10000, decimals: 8, blockchain: 'Bitcoin SV', icon: '⏰' },
    { id: '23', name: 'Warrant', category: 'Derivative', type: 'derivative', symbol: 'WARR', description: 'Security purchase warrant', totalSupply: 50000, decimals: 4, blockchain: 'Bitcoin SV', icon: '📜' },
    { id: '24', name: 'Swap Contract', category: 'Derivative', type: 'derivative', symbol: 'SWAP', description: 'Interest rate swap derivative', totalSupply: 1000, decimals: 18, blockchain: 'Bitcoin SV', icon: '🔄' },

    // Hybrid Instruments
    { id: '25', name: 'Convertible Preferred', category: 'Hybrid', type: 'hybrid', symbol: 'CPRF', description: 'Convertible preferred stock', totalSupply: 75000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🔀' },
    { id: '26', name: 'Equity-Linked Note', category: 'Hybrid', type: 'hybrid', symbol: 'ELN', description: 'Equity-linked debt instrument', totalSupply: 5000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🔗' },
    { id: '27', name: 'Mezzanine Financing', category: 'Hybrid', type: 'hybrid', symbol: 'MEZZ', description: 'Mezzanine debt-equity hybrid', totalSupply: 25000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🏗️' },
    { id: '28', name: 'REIT Shares', category: 'Hybrid', type: 'hybrid', symbol: 'REIT', description: 'Real Estate Investment Trust shares', totalSupply: 200000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🏢' },

    // Specialized Instruments
    { id: '29', name: 'Carbon Credits', category: 'Environmental', type: 'utility', symbol: 'CARB', description: 'Carbon offset credit tokens', totalSupply: 1000000, decimals: 3, blockchain: 'Bitcoin SV', icon: '🌍' },
    { id: '30', name: 'Renewable Energy Credits', category: 'Environmental', type: 'utility', symbol: 'REC', description: 'Renewable energy certificate tokens', totalSupply: 500000, decimals: 2, blockchain: 'Bitcoin SV', icon: '⚡' },
    { id: '31', name: 'Intellectual Property Rights', category: 'Rights', type: 'equity', symbol: 'IPR', description: 'Intellectual property ownership tokens', totalSupply: 100000, decimals: 0, blockchain: 'Bitcoin SV', icon: '💡' },
    { id: '32', name: 'Music Royalties', category: 'Rights', type: 'equity', symbol: 'MUSI', description: 'Music royalty revenue sharing tokens', totalSupply: 1000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🎵' },

    // Cryptocurrency & Digital Assets
    { id: '33', name: 'Stablecoin', category: 'Digital Currency', type: 'utility', symbol: 'STBL', description: 'USD-pegged stablecoin', totalSupply: 1000000000, decimals: 18, blockchain: 'Bitcoin SV', icon: '💵' },
    { id: '34', name: 'Central Bank Digital Currency', category: 'Digital Currency', type: 'utility', symbol: 'CBDC', description: 'Government-issued digital currency', totalSupply: 10000000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🏦' },
    { id: '35', name: 'DeFi Protocol Token', category: 'DeFi', type: 'governance', symbol: 'DEFI', description: 'Decentralized finance protocol token', totalSupply: 100000000, decimals: 18, blockchain: 'Bitcoin SV', icon: '🔗' },
    { id: '36', name: 'Yield Farming Token', category: 'DeFi', type: 'reward', symbol: 'YILD', description: 'Liquidity mining reward token', totalSupply: 50000000, decimals: 18, blockchain: 'Bitcoin SV', icon: '🌾' },

    // Cash & Cash Equivalents
    { id: '37', name: 'Cash', category: 'Cash & Equivalents', type: 'utility', symbol: 'CASH', description: 'Digital cash equivalent for transactions', totalSupply: 100000000, decimals: 2, blockchain: 'Bitcoin SV', icon: '💵' },
    { id: '38', name: 'Money Market Fund', category: 'Cash & Equivalents', type: 'utility', symbol: 'MMF', description: 'Money market mutual fund shares', totalSupply: 10000000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🏦' },
    { id: '39', name: 'Treasury Bills', category: 'Cash & Equivalents', type: 'debt', symbol: 'TBILL', description: 'Short-term government securities', totalSupply: 50000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🏛️' },
    { id: '40', name: 'Commercial Paper', category: 'Cash & Equivalents', type: 'debt', symbol: 'CP', description: 'Short-term corporate debt', totalSupply: 25000, decimals: 2, blockchain: 'Bitcoin SV', icon: '📋' },

    // Coupons & Vouchers
    { id: '41', name: 'Discount Coupon', category: 'Coupons', type: 'reward', symbol: 'DISC', description: 'Discount coupon for products/services', totalSupply: 1000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎫' },
    { id: '42', name: 'Gift Voucher', category: 'Coupons', type: 'reward', symbol: 'GIFT', description: 'Gift voucher with monetary value', totalSupply: 100000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🎁' },
    { id: '43', name: 'Store Credit', category: 'Coupons', type: 'reward', symbol: 'STORE', description: 'Store credit for future purchases', totalSupply: 500000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🏪' },
    { id: '44', name: 'Promotional Code', category: 'Coupons', type: 'reward', symbol: 'PROMO', description: 'Promotional discount code', totalSupply: 2000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🔖' },

    // Insurance & Protection
    { id: '45', name: 'Insurance Policy', category: 'Insurance', type: 'hybrid', symbol: 'INS', description: 'Digital insurance policy token', totalSupply: 10000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🛡️' },
    { id: '46', name: 'Warranty Token', category: 'Insurance', type: 'hybrid', symbol: 'WARR', description: 'Product warranty protection token', totalSupply: 100000, decimals: 0, blockchain: 'Bitcoin SV', icon: '✅' },
    { id: '47', name: 'Health Insurance', category: 'Insurance', type: 'hybrid', symbol: 'HLTH', description: 'Health insurance coverage token', totalSupply: 50000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🏥' },
    { id: '48', name: 'Life Insurance', category: 'Insurance', type: 'hybrid', symbol: 'LIFE', description: 'Life insurance policy token', totalSupply: 25000, decimals: 0, blockchain: 'Bitcoin SV', icon: '👨‍👩‍👧‍👦' },

    // Commodities & Physical Assets
    { id: '49', name: 'Gold Token', category: 'Commodities', type: 'utility', symbol: 'GOLD', description: 'Digital representation of physical gold', totalSupply: 1000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🥇' },
    { id: '50', name: 'Silver Token', category: 'Commodities', type: 'utility', symbol: 'SILV', description: 'Digital representation of physical silver', totalSupply: 10000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🥈' },
    { id: '51', name: 'Oil Futures', category: 'Commodities', type: 'derivative', symbol: 'OIL', description: 'Crude oil futures contract', totalSupply: 10000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🛢️' },
    { id: '52', name: 'Agricultural Futures', category: 'Commodities', type: 'derivative', symbol: 'AGR', description: 'Agricultural commodity futures', totalSupply: 50000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🌾' },
    { id: '53', name: 'Diamond Token', category: 'Commodities', type: 'utility', symbol: 'DIAM', description: 'Tokenized diamond ownership', totalSupply: 10000, decimals: 4, blockchain: 'Bitcoin SV', icon: '💎' },

    // Alternative Investments
    { id: '54', name: 'Private Equity', category: 'Alternative', type: 'equity', symbol: 'PE', description: 'Private equity investment share', totalSupply: 10000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🏢' },
    { id: '55', name: 'Hedge Fund Share', category: 'Alternative', type: 'equity', symbol: 'HF', description: 'Hedge fund investment share', totalSupply: 1000, decimals: 4, blockchain: 'Bitcoin SV', icon: '📈' },
    { id: '56', name: 'Venture Capital', category: 'Alternative', type: 'equity', symbol: 'VC', description: 'Venture capital fund share', totalSupply: 5000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🚀' },
    { id: '57', name: 'Art Investment', category: 'Alternative', type: 'equity', symbol: 'ART', description: 'Fractionalized art ownership', totalSupply: 1000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎨' },
    { id: '58', name: 'Wine Investment', category: 'Alternative', type: 'equity', symbol: 'WINE', description: 'Fine wine investment token', totalSupply: 5000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🍷' },

    // Structured Products
    { id: '59', name: 'Certificate of Deposit', category: 'Structured', type: 'debt', symbol: 'CD', description: 'Time deposit with fixed interest rate', totalSupply: 10000, decimals: 2, blockchain: 'Bitcoin SV', icon: '📜' },
    { id: '60', name: 'Structured Note', category: 'Structured', type: 'hybrid', symbol: 'STRUC', description: 'Structured investment product', totalSupply: 1000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🏗️' },
    { id: '61', name: 'Asset-Backed Security', category: 'Structured', type: 'debt', symbol: 'ABS', description: 'Security backed by pool of assets', totalSupply: 5000, decimals: 4, blockchain: 'Bitcoin SV', icon: '📊' },
    { id: '62', name: 'Mortgage-Backed Security', category: 'Structured', type: 'debt', symbol: 'MBS', description: 'Mortgage-backed investment security', totalSupply: 2500, decimals: 4, blockchain: 'Bitcoin SV', icon: '🏠' },

    // Subscription & Membership
    { id: '63', name: 'Membership Token', category: 'Membership', type: 'utility', symbol: 'MEMBER', description: 'Exclusive membership access token', totalSupply: 10000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎖️' },
    { id: '64', name: 'Subscription Pass', category: 'Membership', type: 'utility', symbol: 'SUB', description: 'Recurring subscription access pass', totalSupply: 50000, decimals: 0, blockchain: 'Bitcoin SV', icon: '📅' },
    { id: '65', name: 'VIP Access Token', category: 'Membership', type: 'utility', symbol: 'VIP', description: 'Premium VIP access privileges', totalSupply: 1000, decimals: 0, blockchain: 'Bitcoin SV', icon: '👑' },
    { id: '66', name: 'Season Pass', category: 'Membership', type: 'utility', symbol: 'SEASON', description: 'Seasonal access and benefits', totalSupply: 25000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎪' },

    // NFTs & Digital Collectibles
    { id: '67', name: 'Digital Collectible', category: 'NFT', type: 'utility', symbol: 'NFT', description: 'Unique digital collectible token', totalSupply: 10000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎨' },
    { id: '68', name: 'Gaming Asset', category: 'NFT', type: 'utility', symbol: 'GAME', description: 'In-game digital asset NFT', totalSupply: 100000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎮' },
    { id: '69', name: 'Event Ticket', category: 'NFT', type: 'utility', symbol: 'TICK', description: 'Digital event ticket NFT', totalSupply: 50000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🎫' },
    { id: '70', name: 'Certificate Token', category: 'NFT', type: 'utility', symbol: 'CERT', description: 'Digital certificate or diploma', totalSupply: 25000, decimals: 0, blockchain: 'Bitcoin SV', icon: '📜' },

    // Additional Equity Instruments
    { id: '71', name: 'Class A Shares', category: 'Equity', type: 'equity', symbol: 'CLSA', description: 'Class A voting shares with superior rights', totalSupply: 500000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🏆' },
    { id: '72', name: 'Class B Shares', category: 'Equity', type: 'equity', symbol: 'CLSB', description: 'Class B non-voting shares', totalSupply: 2000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '📊' },
    { id: '73', name: 'Founder Shares', category: 'Equity', type: 'equity', symbol: 'FOUND', description: 'Founder equity with special provisions', totalSupply: 1000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '👑' },
    { id: '74', name: 'Angel Investment', category: 'Equity', type: 'equity', symbol: 'ANGEL', description: 'Angel investor equity stake', totalSupply: 250000, decimals: 0, blockchain: 'Bitcoin SV', icon: '😇' },
    { id: '75', name: 'Series A Preferred', category: 'Equity', type: 'equity', symbol: 'SERA', description: 'Series A preferred stock', totalSupply: 500000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🅰️' },
    { id: '76', name: 'Series B Preferred', category: 'Equity', type: 'equity', symbol: 'SERB', description: 'Series B preferred stock', totalSupply: 300000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🅱️' },
    { id: '77', name: 'IPO Shares', category: 'Equity', type: 'equity', symbol: 'IPO', description: 'Initial public offering shares', totalSupply: 10000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🔔' },

    // Additional Debt Instruments
    { id: '78', name: 'Municipal Bond', category: 'Debt', type: 'debt', symbol: 'MUNI', description: 'Municipal government bond', totalSupply: 5000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🏛️' },
    { id: '79', name: 'Treasury Note', category: 'Debt', type: 'debt', symbol: 'TNOTE', description: 'Medium-term government treasury note', totalSupply: 10000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🏦' },
    { id: '80', name: 'High Yield Bond', category: 'Debt', type: 'debt', symbol: 'HY', description: 'High-yield corporate bond', totalSupply: 2000, decimals: 2, blockchain: 'Bitcoin SV', icon: '📈' },
    { id: '81', name: 'Zero Coupon Bond', category: 'Debt', type: 'debt', symbol: 'ZERO', description: 'Zero coupon discount bond', totalSupply: 1000, decimals: 2, blockchain: 'Bitcoin SV', icon: '⭕' },
    { id: '82', name: 'Floating Rate Note', category: 'Debt', type: 'debt', symbol: 'FRN', description: 'Variable interest rate note', totalSupply: 3000, decimals: 2, blockchain: 'Bitcoin SV', icon: '🌊' },
    { id: '83', name: 'Subordinated Debt', category: 'Debt', type: 'debt', symbol: 'SUB', description: 'Subordinated debt instrument', totalSupply: 1500, decimals: 2, blockchain: 'Bitcoin SV', icon: '⬇️' },
    { id: '84', name: 'Senior Secured Bond', category: 'Debt', type: 'debt', symbol: 'SENIOR', description: 'Senior secured corporate bond', totalSupply: 2500, decimals: 2, blockchain: 'Bitcoin SV', icon: '🔒' },

    // Additional Derivative Instruments
    { id: '85', name: 'Call Option', category: 'Derivative', type: 'derivative', symbol: 'CALL', description: 'Call option contract', totalSupply: 50000, decimals: 6, blockchain: 'Bitcoin SV', icon: '📞' },
    { id: '86', name: 'Put Option', category: 'Derivative', type: 'derivative', symbol: 'PUT', description: 'Put option contract', totalSupply: 50000, decimals: 6, blockchain: 'Bitcoin SV', icon: '📉' },
    { id: '87', name: 'Credit Default Swap', category: 'Derivative', type: 'derivative', symbol: 'CDS', description: 'Credit default swap contract', totalSupply: 1000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🛡️' },
    { id: '88', name: 'Interest Rate Swap', category: 'Derivative', type: 'derivative', symbol: 'IRS', description: 'Interest rate swap derivative', totalSupply: 500, decimals: 8, blockchain: 'Bitcoin SV', icon: '🔄' },
    { id: '89', name: 'Currency Forward', category: 'Derivative', type: 'derivative', symbol: 'FX', description: 'Foreign exchange forward contract', totalSupply: 10000, decimals: 6, blockchain: 'Bitcoin SV', icon: '💱' },
    { id: '90', name: 'Commodity Swap', category: 'Derivative', type: 'derivative', symbol: 'COMSWAP', description: 'Commodity price swap contract', totalSupply: 2000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🔄' },

    // Additional Commodities
    { id: '91', name: 'Copper Token', category: 'Commodities', type: 'utility', symbol: 'CU', description: 'Digital representation of copper', totalSupply: 50000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🔶' },
    { id: '92', name: 'Platinum Token', category: 'Commodities', type: 'utility', symbol: 'PLAT', description: 'Digital representation of platinum', totalSupply: 100000, decimals: 8, blockchain: 'Bitcoin SV', icon: '⚪' },
    { id: '93', name: 'Natural Gas Futures', category: 'Commodities', type: 'derivative', symbol: 'NG', description: 'Natural gas futures contract', totalSupply: 25000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🔥' },
    { id: '94', name: 'Wheat Futures', category: 'Commodities', type: 'derivative', symbol: 'WHEAT', description: 'Wheat commodity futures', totalSupply: 100000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🌾' },
    { id: '95', name: 'Coffee Futures', category: 'Commodities', type: 'derivative', symbol: 'COFFEE', description: 'Coffee commodity futures', totalSupply: 50000, decimals: 4, blockchain: 'Bitcoin SV', icon: '☕' },
    { id: '96', name: 'Lithium Token', category: 'Commodities', type: 'utility', symbol: 'LI', description: 'Digital representation of lithium', totalSupply: 1000000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🔋' },
    { id: '97', name: 'Rare Earth Metals', category: 'Commodities', type: 'utility', symbol: 'REM', description: 'Rare earth metals token', totalSupply: 500000, decimals: 8, blockchain: 'Bitcoin SV', icon: '⚡' },

    // Additional Alternative Investments
    { id: '98', name: 'Real Estate Token', category: 'Alternative', type: 'equity', symbol: 'RE', description: 'Fractionalized real estate ownership', totalSupply: 100000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🏠' },
    { id: '99', name: 'Commercial Real Estate', category: 'Alternative', type: 'equity', symbol: 'CRE', description: 'Commercial property investment', totalSupply: 50000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🏢' },
    { id: '100', name: 'Infrastructure Fund', category: 'Alternative', type: 'equity', symbol: 'INFRA', description: 'Infrastructure investment fund', totalSupply: 25000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🛤️' },
    { id: '101', name: 'Collectible Cars', category: 'Alternative', type: 'equity', symbol: 'CAR', description: 'Classic car investment token', totalSupply: 1000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🚗' },
    { id: '102', name: 'Sports Memorabilia', category: 'Alternative', type: 'equity', symbol: 'SPORT', description: 'Sports collectibles investment', totalSupply: 10000, decimals: 0, blockchain: 'Bitcoin SV', icon: '⚽' },
    { id: '103', name: 'Timber Investment', category: 'Alternative', type: 'equity', symbol: 'TIMBER', description: 'Forestry and timber investment', totalSupply: 100000, decimals: 4, blockchain: 'Bitcoin SV', icon: '🌲' },

    // Additional Insurance Products
    { id: '104', name: 'Auto Insurance', category: 'Insurance', type: 'hybrid', symbol: 'AUTO', description: 'Vehicle insurance policy token', totalSupply: 100000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🚗' },
    { id: '105', name: 'Property Insurance', category: 'Insurance', type: 'hybrid', symbol: 'PROP', description: 'Property insurance coverage', totalSupply: 75000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🏠' },
    { id: '106', name: 'Cyber Insurance', category: 'Insurance', type: 'hybrid', symbol: 'CYBER', description: 'Cybersecurity insurance policy', totalSupply: 25000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🔒' },
    { id: '107', name: 'Travel Insurance', category: 'Insurance', type: 'hybrid', symbol: 'TRAVEL', description: 'Travel protection insurance', totalSupply: 200000, decimals: 0, blockchain: 'Bitcoin SV', icon: '✈️' },

    // Additional Structured Products
    { id: '108', name: 'Exchange Traded Fund', category: 'Structured', type: 'equity', symbol: 'ETF', description: 'Diversified investment fund', totalSupply: 1000000, decimals: 4, blockchain: 'Bitcoin SV', icon: '📊' },
    { id: '109', name: 'Index Fund', category: 'Structured', type: 'equity', symbol: 'INDEX', description: 'Market index tracking fund', totalSupply: 5000000, decimals: 4, blockchain: 'Bitcoin SV', icon: '📈' },
    { id: '110', name: 'Mutual Fund', category: 'Structured', type: 'equity', symbol: 'MF', description: 'Professionally managed fund', totalSupply: 2000000, decimals: 4, blockchain: 'Bitcoin SV', icon: '👥' },

    // Additional Environmental & Rights
    { id: '111', name: 'Solar Energy Credits', category: 'Environmental', type: 'utility', symbol: 'SOLAR', description: 'Solar energy certificate tokens', totalSupply: 1000000, decimals: 2, blockchain: 'Bitcoin SV', icon: '☀️' },
    { id: '112', name: 'Wind Energy Credits', category: 'Environmental', type: 'utility', symbol: 'WIND', description: 'Wind energy certificate tokens', totalSupply: 750000, decimals: 2, blockchain: 'Bitcoin SV', icon: '💨' },
    { id: '113', name: 'Film Royalties', category: 'Rights', type: 'equity', symbol: 'FILM', description: 'Movie revenue sharing token', totalSupply: 100000, decimals: 8, blockchain: 'Bitcoin SV', icon: '🎬' },
    { id: '114', name: 'Patent Rights', category: 'Rights', type: 'equity', symbol: 'PAT', description: 'Patent licensing rights token', totalSupply: 50000, decimals: 0, blockchain: 'Bitcoin SV', icon: '🔬' },
    { id: '115', name: 'Software License', category: 'Rights', type: 'utility', symbol: 'SW', description: 'Software usage license token', totalSupply: 1000000, decimals: 0, blockchain: 'Bitcoin SV', icon: '💻' }
  ]

  const instrumentCategories = ['All', 'Equity', 'Debt', 'Utility', 'Governance', 'Reward', 'Derivative', 'Hybrid', 'Environmental', 'Rights', 'Digital Currency', 'DeFi', 'Cash & Equivalents', 'Coupons', 'Insurance', 'Commodities', 'Alternative', 'Structured', 'Membership', 'NFT']

  const applyInstrumentTemplate = (template: typeof instrumentTemplates[0]) => {
    setFormData({
      name: template.name,
      type: template.type as FinancialInstrument['type'],
      symbol: template.symbol,
      description: template.description,
      totalSupply: template.totalSupply,
      decimals: template.decimals,
      blockchain: template.blockchain,
      organizationId: selectedOrganization || ''
    })
    setShowTemplates(false)
  }

  const filteredInstrumentTemplates = selectedCategory === 'All'
    ? instrumentTemplates
    : instrumentTemplates.filter(template => template.category === selectedCategory)

  return (
    <div className="absolute inset-0 top-20 p-6 overflow-y-auto pb-24 scrollbar-always-visible">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Financial Instruments</h1>
            <p className="text-gray-300">Create and manage blockchain-based financial instruments</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Instrument</span>
          </button>
        </div>

        {!selectedOrganization ? (
          <div className="space-y-6">
            {/* Organization Selection Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Choose Organization or View All Instruments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Global/All Instruments Card */}
                <div
                  onClick={() => onDeselectOrganization()}
                  className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-xl p-6 cursor-pointer transition-all hover:scale-105 hover:border-purple-400/50"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Globe className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">All Organizations</h3>
                      <p className="text-purple-300 text-sm">Global View</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Templates:</span>
                      <span className="text-purple-400 font-medium">{instrumentTemplates.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Organizations:</span>
                      <span className="text-purple-400 font-medium">{organizations.length}</span>
                    </div>
                  </div>
                </div>

                {/* Organization Cards */}
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => onSelectOrganization(org.id)}
                    className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer transition-all hover:scale-105 hover:border-blue-400/50 hover:bg-black/80"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{org.name}</h3>
                        <p className="text-gray-400 text-sm">{org.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Members:</span>
                        <span className="text-blue-400 font-medium">{org.members.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Instruments:</span>
                        <span className="text-blue-400 font-medium">
                          {instruments.filter(i => i.organizationId === org.id).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-medium capitalize ${org.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                          {org.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-xs text-center text-blue-400">Click to view organization instruments →</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instrument Templates Grid */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Financial Instrument Templates ({instrumentTemplates.length} Available)</h3>
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {instrumentCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 max-h-[32rem] overflow-y-auto pr-1 scrollbar-always-visible">
                {filteredInstrumentTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      applyInstrumentTemplate(template)
                      setShowCreateForm(true)
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg p-4 cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="text-3xl mb-3 text-center">{template.icon}</div>
                    <h5 className="text-white font-medium mb-2 text-sm text-center">{template.name}</h5>
                    <p className="text-gray-300 text-xs mb-2 text-center capitalize">{template.type} • {template.category}</p>
                    <p className="text-blue-400 text-xs text-center">Supply: {template.totalSupply.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Created Instruments Grid */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Created Instruments ({instruments.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instruments.map((instrument) => (
                  <div key={instrument.id} className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-white/40 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getInstrumentIcon(instrument.type)}
                        <div>
                          <h3 className="text-white font-semibold">{instrument.name}</h3>
                          <p className="text-gray-400 text-sm capitalize">{instrument.type}</p>
                          <p className="text-gray-500 text-xs">
                            {instrument.organizationId
                              ? organizations.find(org => org.id === instrument.organizationId)?.name || 'Unknown Org'
                              : 'Global Instrument'
                            }
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${instrument.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        instrument.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                        {instrument.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Symbol:</span>
                        <span className="text-white font-mono">{instrument.symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white">{instrument.totalSupply.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Blockchain:</span>
                        <span className="text-white">{instrument.blockchain}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Organization Summary */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Building className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{currentOrg?.name}</h3>
                    <p className="text-gray-400 text-sm">{currentOrg?.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{orgInstruments.length}</div>
                    <div className="text-gray-400 text-sm">Total Instruments</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {orgInstruments.filter(i => i.status === 'active').length}
                    </div>
                    <div className="text-gray-400 text-sm">Active</div>
                  </div>
                </div>
              </div>

              {/* Instrument Cards */}
              {orgInstruments.map((instrument) => (
                <div key={instrument.id} className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6 hover:border-white/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-white/10 ${getInstrumentTypeColor(instrument.type)}`}>
                        {getInstrumentIcon(instrument.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{instrument.name}</h3>
                        <p className="text-gray-400 text-sm">{instrument.symbol}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${instrument.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        instrument.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                          instrument.status === 'paused' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                        }`}>
                        {instrument.status}
                      </span>
                      <button
                        onClick={() => onDeleteInstrument(instrument.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-4">{instrument.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Supply:</span>
                      <span className="text-white">{instrument.issuedSupply.toLocaleString()} / {instrument.totalSupply.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Blockchain:</span>
                      <span className="text-white">{instrument.blockchain}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Type:</span>
                      <span className={`capitalize ${getInstrumentTypeColor(instrument.type)}`}>{instrument.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Organization Summary */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Building className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{currentOrg?.name}</h3>
                  <p className="text-gray-400 text-sm">{currentOrg?.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{orgInstruments.length}</div>
                  <div className="text-gray-400 text-sm">Total Instruments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {orgInstruments.filter(i => i.status === 'active').length}
                  </div>
                  <div className="text-gray-400 text-sm">Active</div>
                </div>
              </div>
            </div>

            {/* Organization Instruments */}
            <div className="lg:col-span-2 space-y-4">
              {orgInstruments.map((instrument) => (
                <div key={instrument.id} className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:border-white/40 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getInstrumentIcon(instrument.type)}
                      <div>
                        <h4 className="text-white font-medium">{instrument.name}</h4>
                        <p className="text-gray-400 text-sm">{instrument.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{instrument.totalSupply.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm capitalize">{instrument.type}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Instrument Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create Financial Instrument</h3>
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
                  <h4 className="text-lg font-medium text-white mb-4">Choose an Instrument Template</h4>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {instrumentCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Template Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-always-visible">
                    {filteredInstrumentTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => applyInstrumentTemplate(template)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg p-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-2xl">{template.icon}</div>
                          <div className="flex-1">
                            <h5 className="text-white font-medium text-sm">{template.name}</h5>
                            <p className="text-gray-400 text-xs capitalize">{template.type} • {template.category}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-xs line-clamp-2 mb-2">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-blue-400 text-xs font-mono">{template.symbol}</span>
                          <span className="text-gray-400 text-xs">{template.totalSupply.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instrument Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Basic Information</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instrument Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Common Stock"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Instrument Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FinancialInstrument['type'] }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="equity">Equity</option>
                      <option value="debt">Debt</option>
                      <option value="derivative">Derivative</option>
                      <option value="reward">Reward</option>
                      <option value="utility">Utility</option>
                      <option value="governance">Governance</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      placeholder="COMM"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the instrument's purpose and terms..."
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Technical Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Technical Details</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization (Optional)</label>
                    <select
                      value={formData.organizationId}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizationId: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Organization (Global Instrument)</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Total Supply</label>
                      <input
                        type="number"
                        value={formData.totalSupply}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalSupply: parseInt(e.target.value) || 0 }))}
                        placeholder="1000000"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Decimals</label>
                      <input
                        type="number"
                        value={formData.decimals}
                        onChange={(e) => setFormData(prev => ({ ...prev, decimals: parseInt(e.target.value) || 0 }))}
                        placeholder="18"
                        min="0"
                        max="18"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Blockchain</label>
                    <select
                      value={formData.blockchain}
                      onChange={(e) => setFormData(prev => ({ ...prev, blockchain: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Bitcoin SV">Bitcoin SV</option>
                      <option value="Ethereum">Ethereum</option>
                      <option value="Bitcoin">Bitcoin</option>
                      <option value="Polygon">Polygon</option>
                      <option value="Binance Smart Chain">Binance Smart Chain</option>
                      <option value="Solana">Solana</option>
                      <option value="Cardano">Cardano</option>
                    </select>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <h5 className="text-sm font-medium text-white mb-2">Instrument Preview</h5>
                    <p className="text-gray-300 text-sm">
                      {formData.name && formData.symbol ? (
                        <span>
                          <strong>{formData.name}</strong> ({formData.symbol})
                          <br />
                          <span className="capitalize">{formData.type}</span> • {formData.totalSupply.toLocaleString()} supply
                          <br />
                          {formData.organizationId
                            ? organizations.find(org => org.id === formData.organizationId)?.name || 'Organization'
                            : 'Global Instrument'
                          }
                        </span>
                      ) : (
                        <span className="text-gray-500">Fill in the details to see preview</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-white/20 mt-6">
                <button
                  onClick={handleCreate}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Instrument
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
      </div>
    </div>
  )
}

// People View Component
function PeopleView({ organizations, selectedOrganization, onUpdateShareAllocation }: PeopleViewProps) {
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

  const getWalletBadge = (walletType?: string) => {
    if (!walletType) return null

    const badgeStyles = {
      handcash: 'bg-green-500/20 text-green-400 border-green-500/30',
      phantom: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      metamask: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      bitcoin: 'bg-orange-600/20 text-orange-500 border-orange-600/30',
      ethereum: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    }

    const badgeLabels = {
      handcash: 'HandCash',
      phantom: 'Phantom',
      metamask: 'MetaMask',
      bitcoin: 'Bitcoin',
      ethereum: 'Ethereum'
    }

    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${badgeStyles[walletType as keyof typeof badgeStyles] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {badgeLabels[walletType as keyof typeof badgeLabels] || walletType}
      </div>
    )
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

  // Member Templates
  const memberTemplates = [
    // Employee Templates
    { id: '1', name: 'CEO/Founder', category: 'Employee', type: 'employee', description: 'Chief Executive Officer with full organizational oversight', handle: 'ceo', firstName: 'John', lastName: 'Smith', email: 'ceo@company.com', phone: '+1-555-0001' },
    { id: '2', name: 'CTO/Tech Lead', category: 'Employee', type: 'employee', description: 'Chief Technology Officer overseeing technical operations', handle: 'cto', firstName: 'Jane', lastName: 'Doe', email: 'cto@company.com', phone: '+1-555-0002' },
    { id: '3', name: 'CFO/Finance Lead', category: 'Employee', type: 'employee', description: 'Chief Financial Officer managing financial operations', handle: 'cfo', firstName: 'Mike', lastName: 'Johnson', email: 'cfo@company.com', phone: '+1-555-0003' },
    { id: '4', name: 'Software Developer', category: 'Employee', type: 'employee', description: 'Full-stack developer building applications', handle: 'dev', firstName: 'Sarah', lastName: 'Wilson', email: 'dev@company.com', phone: '+1-555-0004' },
    { id: '5', name: 'Marketing Manager', category: 'Employee', type: 'employee', description: 'Marketing specialist managing campaigns and growth', handle: 'marketing', firstName: 'Tom', lastName: 'Brown', email: 'marketing@company.com', phone: '+1-555-0005' },
    { id: '6', name: 'Sales Representative', category: 'Employee', type: 'employee', description: 'Sales professional managing client relationships', handle: 'sales', firstName: 'Lisa', lastName: 'Davis', email: 'sales@company.com', phone: '+1-555-0006' },
    { id: '7', name: 'HR Manager', category: 'Employee', type: 'employee', description: 'Human Resources specialist managing team welfare', handle: 'hr', firstName: 'David', lastName: 'Miller', email: 'hr@company.com', phone: '+1-555-0007' },
    { id: '8', name: 'Operations Manager', category: 'Employee', type: 'employee', description: 'Operations specialist managing day-to-day processes', handle: 'ops', firstName: 'Anna', lastName: 'Garcia', email: 'ops@company.com', phone: '+1-555-0008' },

    // Customer Templates
    { id: '9', name: 'Enterprise Client', category: 'Customer', type: 'customer', description: 'Large enterprise customer with significant contract value', handle: 'enterprise', firstName: 'Robert', lastName: 'Taylor', email: 'robert.taylor@enterprise.com', phone: '+1-555-1001' },
    { id: '10', name: 'SMB Customer', category: 'Customer', type: 'customer', description: 'Small to medium business customer', handle: 'smb', firstName: 'Jennifer', lastName: 'Anderson', email: 'jen@smallbiz.com', phone: '+1-555-1002' },
    { id: '11', name: 'Individual Consumer', category: 'Customer', type: 'customer', description: 'Individual consumer using personal services', handle: 'consumer', firstName: 'Chris', lastName: 'Martinez', email: 'chris.martinez@email.com', phone: '+1-555-1003' },
    { id: '12', name: 'Premium Subscriber', category: 'Customer', type: 'customer', description: 'High-value recurring subscription customer', handle: 'premium', firstName: 'Michelle', lastName: 'Lee', email: 'michelle.lee@email.com', phone: '+1-555-1004' },

    // Supplier Templates
    { id: '13', name: 'Cloud Provider', category: 'Supplier', type: 'supplier', description: 'Cloud infrastructure and hosting services provider', handle: 'cloudprovider', firstName: 'Alex', lastName: 'Kumar', email: 'alex@cloudprovider.com', phone: '+1-555-2001' },
    { id: '14', name: 'Software Vendor', category: 'Supplier', type: 'supplier', description: 'Third-party software and licensing provider', handle: 'softwarevendor', firstName: 'Sam', lastName: 'Chen', email: 'sam@softwarevendor.com', phone: '+1-555-2002' },
    { id: '15', name: 'Office Supplier', category: 'Supplier', type: 'supplier', description: 'Office equipment and supplies provider', handle: 'officesupplier', firstName: 'Maria', lastName: 'Rodriguez', email: 'maria@officesupplier.com', phone: '+1-555-2003' },
    { id: '16', name: 'Legal Services', category: 'Supplier', type: 'supplier', description: 'Legal counsel and advisory services provider', handle: 'legal', firstName: 'James', lastName: 'White', email: 'james@legalfirm.com', phone: '+1-555-2004' },

    // Contractor Templates
    { id: '17', name: 'Freelance Designer', category: 'Contractor', type: 'contractor', description: 'Independent graphic and UI/UX designer', handle: 'designer', firstName: 'Emily', lastName: 'Clark', email: 'emily@freelancedesign.com', phone: '+1-555-3001' },
    { id: '18', name: 'Marketing Consultant', category: 'Contractor', type: 'contractor', description: 'Independent marketing strategy consultant', handle: 'marketingconsult', firstName: 'Mark', lastName: 'Thompson', email: 'mark@marketingconsult.com', phone: '+1-555-3002' },
    { id: '19', name: 'Freelance Developer', category: 'Contractor', type: 'contractor', description: 'Independent software developer for project work', handle: 'freelancedev', firstName: 'Kevin', lastName: 'Walsh', email: 'kevin@freelancedev.com', phone: '+1-555-3003' },
    { id: '20', name: 'Content Writer', category: 'Contractor', type: 'contractor', description: 'Freelance content creator and copywriter', handle: 'writer', firstName: 'Rachel', lastName: 'Green', email: 'rachel@contentwriter.com', phone: '+1-555-3004' },

    // Advisor Templates
    { id: '21', name: 'Business Advisor', category: 'Advisor', type: 'advisor', description: 'Senior business strategy and growth advisor', handle: 'bizadvisor', firstName: 'Richard', lastName: 'Stone', email: 'richard@advisors.com', phone: '+1-555-4001' },
    { id: '22', name: 'Technical Advisor', category: 'Advisor', type: 'advisor', description: 'Senior technical architecture and strategy advisor', handle: 'techadvisor', firstName: 'Patricia', lastName: 'Moore', email: 'patricia@techadvisors.com', phone: '+1-555-4002' },
    { id: '23', name: 'Industry Expert', category: 'Advisor', type: 'advisor', description: 'Domain-specific industry knowledge advisor', handle: 'expert', firstName: 'Steven', lastName: 'Hall', email: 'steven@industryexperts.com', phone: '+1-555-4003' },
    { id: '24', name: 'Board Member', category: 'Advisor', type: 'advisor', description: 'Board of directors member providing governance', handle: 'board', firstName: 'Linda', lastName: 'Young', email: 'linda@boardmembers.com', phone: '+1-555-4004' },

    // Investor Templates
    { id: '25', name: 'Angel Investor', category: 'Investor', type: 'investor', description: 'Early-stage angel investor providing capital', handle: 'angel', firstName: 'Michael', lastName: 'King', email: 'michael@angelinvestors.com', phone: '+1-555-5001' },
    { id: '26', name: 'VC Partner', category: 'Investor', type: 'investor', description: 'Venture capital partner for growth funding', handle: 'vc', firstName: 'Susan', lastName: 'Wright', email: 'susan@vcfirm.com', phone: '+1-555-5002' },
    { id: '27', name: 'Strategic Investor', category: 'Investor', type: 'investor', description: 'Strategic corporate investor with industry synergies', handle: 'strategic', firstName: 'Daniel', lastName: 'Lopez', email: 'daniel@strategic.com', phone: '+1-555-5003' },
    { id: '28', name: 'Private Equity', category: 'Investor', type: 'investor', description: 'Private equity firm for later-stage investment', handle: 'pe', firstName: 'Nancy', lastName: 'Hill', email: 'nancy@pefirm.com', phone: '+1-555-5004' },

    // Partner Templates
    { id: '29', name: 'Technology Partner', category: 'Partner', type: 'partner', description: 'Strategic technology integration partner', handle: 'techpartner', firstName: 'Brian', lastName: 'Scott', email: 'brian@techpartner.com', phone: '+1-555-6001' },
    { id: '30', name: 'Channel Partner', category: 'Partner', type: 'partner', description: 'Sales and distribution channel partner', handle: 'channel', firstName: 'Carol', lastName: 'Green', email: 'carol@channelpartner.com', phone: '+1-555-6002' },
    { id: '31', name: 'Integration Partner', category: 'Partner', type: 'partner', description: 'System integration and implementation partner', handle: 'integration', firstName: 'Paul', lastName: 'Adams', email: 'paul@integrationpartner.com', phone: '+1-555-6003' },
    { id: '32', name: 'Reseller Partner', category: 'Partner', type: 'partner', description: 'Authorized reseller and distribution partner', handle: 'reseller', firstName: 'Julie', lastName: 'Baker', email: 'julie@resellerpartner.com', phone: '+1-555-6004' }
  ]

  const memberCategories = ['All', 'Employee', 'Customer', 'Supplier', 'Contractor', 'Advisor', 'Investor', 'Partner']

  const applyMemberTemplate = (template: typeof memberTemplates[0]) => {
    setMemberFormData({
      ...memberFormData,
      handle: template.handle,
      firstName: template.firstName,
      lastName: template.lastName,
      email: template.email,
      phone: template.phone,
      memberType: template.type as 'employee' | 'customer' | 'supplier' | 'contractor' | 'advisor' | 'investor' | 'partner' | 'other',
      profileImage: '',
      publicAddress: '',
      dateOfBirth: '',
      nationality: '',
      address: ''
    })
    setShowMemberTemplates(false)
  }

  const handleCreateMember = () => {
    // TODO: Implement member creation logic
    console.log('Creating member:', memberFormData)
    setShowCreateMemberForm(false)
    // Reset form
    setMemberFormData({
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
      memberType: 'employee',
      organizationId: selectedOrganization || ''
    })
  }

  const filteredMemberTemplates = selectedMemberCategory === 'All'
    ? memberTemplates
    : memberTemplates.filter(template => template.category === selectedMemberCategory)

  return (
    <div className="absolute inset-0 top-24 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">People</h1>
            <p className="text-gray-300">Manage team members, KYC status, and share allocations</p>
          </div>
          <button
            onClick={() => setShowCreateMemberForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create New Member</span>
          </button>
        </div>

        {currentOrg ? (
          <div className="space-y-6">
            {/* Organization Overview */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">{currentOrg.name} - Team Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{currentOrg.members.length}</div>
                  <div className="text-gray-400 text-sm">Total Members</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {currentOrg.members.filter(m => m.kycStatus === 'approved').length}
                  </div>
                  <div className="text-gray-400 text-sm">KYC Approved</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{currentOrg.totalShares.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Total Shares</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{currentOrg.tokenSymbol}</div>
                  <div className="text-gray-400 text-sm">Token Symbol</div>
                </div>
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentOrg.members.map((member: HandCashHandle) => (
                <div
                  key={member.id}
                  onClick={() => openMemberProfile(member)}
                  className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer hover:border-white/40 hover:bg-black/70 transition-all duration-300 group"
                >
                  {/* Profile Image & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {member.profileImage ? (
                          <img
                            src={member.profileImage}
                            alt={member.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {member.displayName.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-black`}></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-white truncate">{member.displayName}</h3>
                        <p className="text-blue-400 text-sm font-mono">{member.handle}</p>
                        {getWalletBadge(member.walletType)}
                      </div>
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Role:</span>
                      <span className="text-white text-sm font-medium truncate ml-2">{member.role}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Shares:</span>
                      <span className="text-white text-sm font-medium">{member.shareAllocation}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">KYC Status:</span>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getKYCStatusColor(member.kycStatus)}`}>
                        {member.kycStatus.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>

                    {member.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Email:</span>
                        <span className="text-gray-300 text-sm truncate ml-2">{member.email}</span>
                      </div>
                    )}

                    {member.publicAddress && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Address:</span>
                        <span className="text-green-400 text-sm font-mono">{member.publicAddress.slice(0, 8)}...</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Last Active:</span>
                      <span className="text-gray-300 text-sm">{formatLastActive(member.lastActive)}</span>
                    </div>
                  </div>

                  {/* Click hint */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-4 pt-3 border-t border-white/10">
                    <p className="text-blue-400 text-xs text-center">Click to view profile →</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Global Members Overview */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">All Members - Global View</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">
                    {organizations.reduce((total, org) => total + org.members.length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Members</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {organizations.reduce((total, org) => total + org.members.filter(m => m.kycStatus === 'approved').length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">KYC Approved</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{organizations.length}</div>
                  <div className="text-gray-400 text-sm">Organizations</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {organizations.reduce((total, org) => total + org.members.filter(m => m.status === 'active').length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Active Members</div>
                </div>
              </div>
            </div>

            {/* Global Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {organizations.flatMap(org =>
                org.members.map((member: HandCashHandle) => (
                  <div
                    key={member.id}
                    onClick={() => openMemberProfile(member)}
                    className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer hover:border-white/40 hover:bg-black/70 transition-all duration-300 group"
                  >
                    {/* Profile Image & Status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          {member.profileImage ? (
                            <img
                              src={member.profileImage}
                              alt={member.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {member.displayName.split(' ').map((n) => n[0]).join('')}
                              </span>
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(member.status)} rounded-full border-2 border-black`}></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm">{member.displayName}</h3>
                          <p className="text-blue-400 text-xs font-mono">{member.handle}</p>
                          {getWalletBadge(member.walletType)}
                          <p className="text-gray-400 text-xs">{organizations.find(o => o.members.some(m => m.id === member.id))?.name}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getKYCStatusColor(member.kycStatus)}`}>
                        {member.kycStatus === 'approved' ? '✓' : member.kycStatus === 'pending' ? '⏳' : '✗'}
                      </div>
                    </div>

                    {/* Member Details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Email:</span>
                        <span className="text-gray-300 text-sm truncate max-w-[120px]">{member.email}</span>
                      </div>

                      {member.publicAddress && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Address:</span>
                          <span className="text-green-400 text-sm font-mono">{member.publicAddress.slice(0, 8)}...</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Last Active:</span>
                        <span className="text-gray-300 text-sm">{formatLastActive(member.lastActive)}</span>
                      </div>
                    </div>

                    {/* Click hint */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-4 pt-3 border-t border-white/10">
                      <p className="text-blue-400 text-xs text-center">Click to view profile →</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Member Profile Modal */}
        {showMemberProfile && selectedMember && editingMember && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {selectedMember.profileImage ? (
                      <img
                        src={selectedMember.profileImage}
                        alt={selectedMember.displayName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {selectedMember.displayName.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(selectedMember.status)} rounded-full border-2 border-black`}></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedMember.displayName}</h2>
                    <p className="text-blue-400 font-mono">{selectedMember.handle}</p>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border mt-2 ${getKYCStatusColor(selectedMember.kycStatus)}`}>
                      KYC: {selectedMember.kycStatus.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowMemberProfile(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                        <input
                          type="text"
                          value={editingMember.firstName || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, firstName: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={editingMember.lastName || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, lastName: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={editingMember.email || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editingMember.phone || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          value={editingMember.dateOfBirth || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, dateOfBirth: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nationality</label>
                        <input
                          type="text"
                          value={editingMember.nationality || ''}
                          onChange={(e) => setEditingMember({ ...editingMember, nationality: e.target.value })}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Public Address</label>
                      <input
                        type="text"
                        value={editingMember.publicAddress || ''}
                        onChange={(e) => setEditingMember({ ...editingMember, publicAddress: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        placeholder="Bitcoin/Token address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Share Allocation (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingMember.shareAllocation}
                        onChange={(e) => setEditingMember({ ...editingMember, shareAllocation: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* KYC Documents */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">KYC Documents</h3>
                      <button
                        onClick={() => setShowKYCUpload(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Document</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedMember.kycDocuments.length > 0 ? (
                        selectedMember.kycDocuments.map((doc) => (
                          <div key={doc.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="text-white font-medium">{doc.name}</h4>
                                  <div className={`px-2 py-1 rounded text-xs font-medium ${doc.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                    doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-red-500/20 text-red-400'
                                    }`}>
                                    {doc.status.toUpperCase()}
                                  </div>
                                </div>
                                <p className="text-gray-400 text-sm capitalize">{doc.type.replace('_', ' ')}</p>
                                <p className="text-gray-500 text-xs mt-1">
                                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                                {doc.notes && (
                                  <p className="text-gray-300 text-sm mt-2">{doc.notes}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-400">No KYC documents uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* Member Stats */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-3">Member Stats</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Joined:</span>
                          <p className="text-white">{new Date(selectedMember.joinedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Last Active:</span>
                          <p className="text-white">{formatLastActive(selectedMember.lastActive)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <p className="text-white capitalize">{selectedMember.status}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Role:</span>
                          <p className="text-white">{selectedMember.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex space-x-3 mt-8 pt-6 border-t border-white/20">
                  <button
                    onClick={() => {
                      // TODO: Save member changes
                      setShowMemberProfile(false)
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowMemberProfile(false)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Upload Modal */}
        {showKYCUpload && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-4">Upload KYC Document</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Type</label>
                  <select
                    value={newKYCDoc.type}
                    onChange={(e) => setNewKYCDoc({ ...newKYCDoc, type: e.target.value as KYCDocument['type'] })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver&apos;s License</option>
                    <option value="national_id">National ID</option>
                    <option value="utility_bill">Utility Bill</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Document Name</label>
                  <input
                    type="text"
                    value={newKYCDoc.name}
                    onChange={(e) => setNewKYCDoc({ ...newKYCDoc, name: e.target.value })}
                    placeholder="e.g., Passport - John Doe"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">File Upload</label>
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Drag & drop files here or click to browse</p>
                    <p className="text-gray-500 text-xs mt-2">Supports: PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                  <textarea
                    value={newKYCDoc.notes}
                    onChange={(e) => setNewKYCDoc({ ...newKYCDoc, notes: e.target.value })}
                    placeholder="Additional notes about this document..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    // TODO: Handle KYC document upload
                    setShowKYCUpload(false)
                    setNewKYCDoc({ type: 'passport', name: '', notes: '' })
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Upload Document
                </button>
                <button
                  onClick={() => {
                    setShowKYCUpload(false)
                    setNewKYCDoc({ type: 'passport', name: '', notes: '' })
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Member Modal */}
        {showCreateMemberForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create New Member</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowMemberTemplates(!showMemberTemplates)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {showMemberTemplates ? 'Hide Templates' : 'Use Template'}
                  </button>
                  <button
                    onClick={() => setShowCreateMemberForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {showMemberTemplates && (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-medium text-white mb-4">Choose a Member Template</h4>

                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {memberCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedMemberCategory(category)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedMemberCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Template Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {filteredMemberTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => applyMemberTemplate(template)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg p-3 cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {template.firstName[0]}{template.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-medium text-sm">{template.name}</h5>
                            <p className="text-gray-400 text-xs">{template.category}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 text-xs mt-2 line-clamp-2">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Basic Information</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                      <input
                        type="text"
                        value={memberFormData.firstName}
                        onChange={(e) => setMemberFormData({ ...memberFormData, firstName: e.target.value })}
                        placeholder="John"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={memberFormData.lastName}
                        onChange={(e) => setMemberFormData({ ...memberFormData, lastName: e.target.value })}
                        placeholder="Doe"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">$CashHandle</label>
                    <input
                      type="text"
                      value={memberFormData.handle}
                      onChange={(e) => setMemberFormData({ ...memberFormData, handle: e.target.value })}
                      placeholder="johndoe"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={memberFormData.email}
                      onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={memberFormData.phone}
                      onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                      placeholder="+1-555-0123"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Member Type</label>
                    <select
                      value={memberFormData.memberType}
                      onChange={(e) => setMemberFormData({ ...memberFormData, memberType: e.target.value as 'employee' | 'customer' | 'supplier' | 'contractor' | 'advisor' | 'investor' | 'partner' | 'other' })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="employee">Employee</option>
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="contractor">Contractor</option>
                      <option value="advisor">Advisor</option>
                      <option value="investor">Investor</option>
                      <option value="partner">Partner</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Additional Information</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Organization (Optional)</label>
                    <select
                      value={memberFormData.organizationId}
                      onChange={(e) => setMemberFormData({ ...memberFormData, organizationId: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Organization (Global Member)</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>{org.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Public Address (Optional)</label>
                    <input
                      type="text"
                      value={memberFormData.publicAddress}
                      onChange={(e) => setMemberFormData({ ...memberFormData, publicAddress: e.target.value })}
                      placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={memberFormData.dateOfBirth}
                      onChange={(e) => setMemberFormData({ ...memberFormData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nationality (Optional)</label>
                    <input
                      type="text"
                      value={memberFormData.nationality}
                      onChange={(e) => setMemberFormData({ ...memberFormData, nationality: e.target.value })}
                      placeholder="United States"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address (Optional)</label>
                    <textarea
                      value={memberFormData.address}
                      onChange={(e) => setMemberFormData({ ...memberFormData, address: e.target.value })}
                      placeholder="123 Main St, City, State, Country"
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t border-white/20 mt-6">
                <button
                  onClick={handleCreateMember}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Create Member
                </button>
                <button
                  onClick={() => setShowCreateMemberForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
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

// Settings View Component
function SettingsView({
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
    <div className="absolute inset-0 top-20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300">Manage your API keys, SSH keys, and MCP servers</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'api-keys'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:text-white'
              }`}
          >
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('ssh-keys')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ssh-keys'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:text-white'
              }`}
          >
            SSH Keys
          </button>
          <button
            onClick={() => setActiveTab('mcp-servers')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'mcp-servers'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:text-white'
              }`}
          >
            MCP Servers
          </button>
        </div>

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">API Keys</h2>
              <button
                onClick={handleCreateApiKey}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create API Key</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{apiKey.name}</h3>
                      <p className="text-gray-400 text-sm">Created {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${apiKey.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Key:</span>
                      <p className="text-white text-sm font-mono bg-white/10 p-2 rounded mt-1">{apiKey.key.slice(0, 20)}...</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Permissions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    {apiKey.lastUsed && (
                      <div>
                        <span className="text-gray-400 text-sm">Last used:</span>
                        <p className="text-white text-sm">{new Date(apiKey.lastUsed).toLocaleString()}</p>
                      </div>
                    )}
                    <button
                      onClick={() => onDeleteApiKey(apiKey.id)}
                      className="w-full bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition-colors py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SSH Keys Tab */}
        {activeTab === 'ssh-keys' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">SSH Keys</h2>
              <button
                onClick={handleCreateSshKey}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add SSH Key</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sshKeys.map((sshKey) => (
                <div
                  key={sshKey.id}
                  className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{sshKey.name}</h3>
                      <p className="text-gray-400 text-sm">Created {new Date(sshKey.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${sshKey.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Fingerprint:</span>
                      <p className="text-white text-sm font-mono bg-white/10 p-2 rounded mt-1">{sshKey.fingerprint}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Public Key:</span>
                      <p className="text-white text-sm font-mono bg-white/10 p-2 rounded mt-1 break-all">{sshKey.publicKey}</p>
                    </div>
                    {sshKey.lastUsed && (
                      <div>
                        <span className="text-gray-400 text-sm">Last used:</span>
                        <p className="text-white text-sm">{new Date(sshKey.lastUsed).toLocaleString()}</p>
                      </div>
                    )}
                    <button
                      onClick={() => onDeleteSshKey(sshKey.id)}
                      className="w-full bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition-colors py-2 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MCP Servers Tab */}
        {activeTab === 'mcp-servers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">MCP Servers</h2>
              <button
                onClick={handleCreateMcpServer}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add MCP Server</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mcpServers.map((server) => (
                <div
                  key={server.id}
                  className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                      <p className="text-gray-400 text-sm">Created {new Date(server.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => onToggleMcpServer(server.id)}
                      className={`w-3 h-3 rounded-full transition-colors ${server.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">URL:</span>
                      <p className="text-white text-sm font-mono bg-white/10 p-2 rounded mt-1 break-all">{server.url}</p>
                    </div>
                    {server.description && (
                      <div>
                        <span className="text-gray-400 text-sm">Description:</span>
                        <p className="text-white text-sm">{server.description}</p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onToggleMcpServer(server.id)}
                        className={`flex-1 py-2 rounded-lg text-sm transition-colors ${server.isActive
                          ? 'bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
                          }`}
                      >
                        {server.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => onDeleteMcpServer(server.id)}
                        className="flex-1 bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition-colors py-2 rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Profile View Component
function ProfileView({
  userProfile,
  onUpdateProfile,
  organizations,
  roles,
  instruments,
  contracts,
  wallets,
  workflows
}: {
  userProfile: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => void
  organizations: Organization[]
  roles: Role[]
  instruments: FinancialInstrument[]
  contracts: Contract[]
  wallets: Wallet[]
  workflows: WorkflowState[]
}) {
  const { user, isAuthenticated } = useAuth()

  // Get display info from Supabase user or fallback to userProfile
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || userProfile.name
  const displayEmail = user?.email || userProfile.email
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  // Calculate user's objects
  const userObjects = {
    organizations: organizations.length,
    roles: roles.length,
    agents: 0, // TODO: Add agents data
    instruments: instruments.length,
    contracts: contracts.length,
    workflows: workflows.length,
    wallets: wallets.length
  }

  const totalObjects = Object.values(userObjects).reduce((sum, count) => sum + count, 0)

  // Additional user statistics
  const userStats = {
    integrations: 3, // Mock data - would come from actual integrations (HandCash, BSV, etc.)
    launchpadLaunches: 2, // Mock data - would come from actual token launches
    marketTokens: 1, // Mock data - would come from tokens currently on market
    totalRevenue: 1250.75 // Mock data - would come from actual revenue tracking
  }

  return (
    <div className="absolute inset-0 top-20 p-6">
      <div className="max-w-full mx-auto h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-300">Your account overview and created objects</p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-auto">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 h-fit">
              {/* User Profile */}
              {isAuthenticated && user ? (
                <>
                  <div className="text-center mb-6">
                    {avatarUrl ? (
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">
                          {displayName.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                    <p className="text-gray-400 text-sm">{displayEmail}</p>
                    <div className="mt-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full inline-block">
                      <span className="text-green-400 text-xs font-medium">Signed In</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">
                        {userProfile.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-white">{userProfile.name}</h2>
                    <p className="text-gray-400">{userProfile.email}</p>
                    <p className="text-gray-500 text-sm">Member since {new Date(userProfile.createdAt).toLocaleDateString()}</p>
                  </div>
                </>
              )}

              {/* Total Objects Summary */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Total Objects</h3>
                <div className="text-2xl font-bold text-white">{totalObjects}</div>
                <p className="text-gray-500 text-sm">Created by you</p>
              </div>
            </div>

            {/* Sign In Prompt */}
            {!isAuthenticated && (
              <div className="mt-4">
                <UserProfileCard />
                <HandCashDebugInfo />
              </div>
            )}
          </div>

          {/* Objects Grid */}
          <div className="lg:col-span-2">
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 h-full flex flex-col">
              <h3 className="text-xl font-semibold text-white mb-6">Your Objects</h3>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Organizations */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">Organizations</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userObjects.organizations}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Business entities and structures</p>
                </div>

                {/* Workflows */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Workflows</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userObjects.workflows}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Automated business processes</p>
                </div>

                {/* Roles */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Crown className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-medium">Roles</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userObjects.roles}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Organizational positions and permissions</p>
                </div>

                {/* Agents */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Bot className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-medium">Agents</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userObjects.agents}</span>
                  </div>
                  <p className="text-gray-400 text-sm">AI assistants and automation</p>
                </div>

                {/* Instruments */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">Instruments</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userObjects.instruments}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Financial instruments and assets</p>
                </div>

                {/* Contracts */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-medium">Contracts</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userObjects.contracts}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Legal agreements and templates</p>
                </div>

                {/* Wallets */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Wallet className="w-5 h-5 text-pink-400" />
                      <span className="text-white font-medium">Wallets</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userObjects.wallets}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Digital wallets and accounts</p>
                </div>

                {/* Integrations */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-medium">Integrations</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userStats.integrations}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Connected services and APIs</p>
                </div>

                {/* Launchpad Launches */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Rocket className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-medium">Launches</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userStats.launchpadLaunches}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Tokens launched on launchpad</p>
                </div>

                {/* Market Tokens */}
                <div className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <span className="text-white font-medium">Market Tokens</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{userStats.marketTokens}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Active tokens on market</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="border-t border-white/20 pt-4">
                <h4 className="text-lg font-semibold text-white mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-400">Created workflow: AUDEX Corporation</span>
                    <span className="text-gray-500 ml-auto">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-400">Updated organization settings</span>
                    <span className="text-gray-500 ml-auto">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-400">Created new role: Marketing Manager</span>
                    <span className="text-gray-500 ml-auto">3 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Billing View Component
function BillingView() {
  const [currentPlan] = useState({
    name: 'Professional',
    price: 29,
    period: 'month',
    features: [
      'Unlimited workflows',
      'Advanced integrations',
      'Priority support',
      'Team collaboration',
      'Custom branding'
    ]
  })

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      period: 'month',
      description: 'Perfect for individuals getting started',
      features: [
        'Up to 5 workflows',
        'Basic integrations',
        'Community support',
        'Standard templates'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 29,
      period: 'month',
      description: 'Ideal for growing teams and businesses',
      features: [
        'Unlimited workflows',
        'Advanced integrations',
        'Priority support',
        'Team collaboration',
        'Custom branding',
        'Analytics dashboard'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      period: 'month',
      description: 'For large organizations with advanced needs',
      features: [
        'Everything in Professional',
        'Custom integrations',
        'Dedicated support',
        'SSO & advanced security',
        'Custom contracts',
        'On-premise deployment'
      ],
      popular: false
    }
  ]

  const billingHistory = [
    {
      id: '1',
      date: '2024-01-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - January 2024'
    },
    {
      id: '2',
      date: '2023-12-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - December 2023'
    },
    {
      id: '3',
      date: '2023-11-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - November 2023'
    }
  ]

  return (
    <div className="absolute inset-0 top-24 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Plans</h1>
          <p className="text-gray-300">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan */}
        <div className="mb-8 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Current Plan</h2>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">{currentPlan.name}</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">Active</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">${currentPlan.price}</div>
              <div className="text-gray-400">per {currentPlan.period}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Plan Features</h3>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Next Billing</h3>
              <div className="text-gray-300">
                <p>Your next billing date is <span className="text-white font-medium">February 1, 2024</span></p>
                <p className="mt-2">Amount: <span className="text-white font-medium">${currentPlan.price}</span></p>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Change Plan
                </button>
                <button className="bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-colors">
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-black/60 backdrop-blur-xl border rounded-xl p-6 relative ${plan.popular
                  ? 'border-blue-500 ring-1 ring-blue-500/50'
                  : 'border-white/20'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${plan.id === 'professional'
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : plan.popular
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  disabled={plan.id === 'professional'}
                >
                  {plan.id === 'professional' ? 'Current Plan' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Billing History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium pb-3">Date</th>
                  <th className="text-left text-gray-400 font-medium pb-3">Description</th>
                  <th className="text-left text-gray-400 font-medium pb-3">Amount</th>
                  <th className="text-left text-gray-400 font-medium pb-3">Status</th>
                  <th className="text-left text-gray-400 font-medium pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5">
                    <td className="py-4 text-white">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-gray-300">{invoice.description}</td>
                    <td className="py-4 text-white font-medium">${invoice.amount}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${invoice.status === 'paid'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                        }`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wallets View Component
function LocalWalletsView({ organizations, selectedOrganization }: WalletsViewProps) {
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [showWalletTemplates, setShowWalletTemplates] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [showWalletDetail, setShowWalletDetail] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [walletFormData, setWalletFormData] = useState({
    name: '',
    type: 'bitcoin' as Wallet['type'],
    address: '',
    description: '',
    network: 'mainnet' as Wallet['network']
  })

  // Import wallet templates from templates.ts
  const walletTemplates = getWalletTemplates()

  // Sample wallets data - in a real app this would come from props
  const wallets: Wallet[] = [
    {
      id: '1',
      name: 'Company Bitcoin Wallet',
      type: 'bitcoin',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      balance: 2.5,
      currency: 'BTC',
      isActive: true,
      organizationId: '1',
      description: 'Main corporate Bitcoin wallet for payments and reserves',
      network: 'mainnet',
      transactions: [],
      metadata: {},
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T10:30:00Z',
      lastSyncAt: '2024-01-20T16:00:00Z'
    },
    {
      id: '2',
      name: 'HandCash Corporate',
      type: 'handcash',
      address: '$techcorp',
      balance: 1000.0,
      currency: 'BSV',
      isActive: true,
      organizationId: '1',
      description: 'HandCash wallet for BSV transactions and microtransactions',
      network: 'mainnet',
      transactions: [],
      metadata: {},
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-19T12:00:00Z',
      lastSyncAt: '2024-01-20T16:00:00Z'
    },
    {
      id: '3',
      name: 'Personal Ethereum Wallet',
      type: 'ethereum',
      address: '0x742d35Cc6e1C1b8C1B0b7c5D8E9F0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0',
      balance: 5.25,
      currency: 'ETH',
      isActive: true,
      description: 'Personal Ethereum wallet for DeFi and token transactions',
      network: 'mainnet',
      transactions: [],
      metadata: {},
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-17T14:20:00Z',
      lastSyncAt: '2024-01-20T16:00:00Z'
    }
  ]

  const filteredWallets = selectedOrganization
    ? wallets.filter(wallet => wallet.organizationId === selectedOrganization)
    : wallets

  const getWalletTypeIcon = (type: Wallet['type']) => {
    switch (type) {
      case 'bitcoin': return <Bitcoin className="w-5 h-5" />
      case 'ethereum': return <Coins className="w-5 h-5" />
      case 'bsv': return <Bitcoin className="w-5 h-5" />
      case 'handcash': return <DollarSign className="w-5 h-5" />
      case 'metamask': return <Wallet className="w-5 h-5" />
      case 'hardware': return <Shield className="w-5 h-5" />
      case 'paper': return <FileText className="w-5 h-5" />
      case 'multi_sig': return <Users className="w-5 h-5" />
      default: return <Wallet className="w-5 h-5" />
    }
  }

  const getWalletTypeColor = (type: Wallet['type']) => {
    switch (type) {
      case 'bitcoin': return 'text-orange-400'
      case 'ethereum': return 'text-blue-400'
      case 'bsv': return 'text-yellow-400'
      case 'handcash': return 'text-green-400'
      case 'metamask': return 'text-orange-500'
      case 'hardware': return 'text-purple-400'
      case 'paper': return 'text-gray-400'
      case 'multi_sig': return 'text-indigo-400'
      default: return 'text-gray-400'
    }
  }

  const formatBalance = (balance: number, currency: string) => {
    return `${balance.toLocaleString()} ${currency}`
  }

  const truncateAddress = (address: string) => {
    if (address.startsWith('$')) return address // HandCash handles
    if (address.length <= 16) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const totalBalance = filteredWallets.reduce((sum, wallet) => {
    // Convert to USD for total (simplified conversion)
    const usdValue = wallet.currency === 'BTC' ? wallet.balance * 45000 :
      wallet.currency === 'ETH' ? wallet.balance * 2500 :
        wallet.currency === 'BSV' ? wallet.balance * 50 : 0
    return sum + usdValue
  }, 0)

  return (
    <div className="absolute inset-0 top-24 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Wallets</h1>
            <p className="text-gray-300">Manage cryptocurrency wallets and track balances</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowWalletTemplates(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-colors shadow-lg"
            >
              <Grid className="w-5 h-5" />
              <span className="font-medium">Browse Templates</span>
            </button>
            <button
              onClick={() => setShowCreateWallet(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Wallet</span>
            </button>
          </div>
        </div>

        {/* Organization Filter Info */}
        {selectedOrganization ? (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-400 text-sm">
              Showing wallets for {organizations.find(org => org.id === selectedOrganization)?.name} • {filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''} found
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-400 text-sm">
              Showing all wallets (personal and organization) • {filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Wallet Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-white">{filteredWallets.length}</div>
            <div className="text-gray-400 text-sm">Total Wallets</div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {filteredWallets.filter(w => w.isActive).length}
            </div>
            <div className="text-gray-400 text-sm">Active</div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">
              {new Set(filteredWallets.map(w => w.currency)).size}
            </div>
            <div className="text-gray-400 text-sm">Currencies</div>
          </div>
          <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">
              ${totalBalance.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total Value (USD)</div>
          </div>
        </div>

        {/* Popular Wallet Templates Section */}
        {filteredWallets.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Popular Wallet Templates</h2>
              <button
                onClick={() => setShowWalletTemplates(true)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View All Templates →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {walletTemplates.slice(0, 4).map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    setWalletFormData({
                      name: template.name,
                      type: template.type?.toLowerCase() as Wallet['type'] || 'bitcoin',
                      address: '',
                      description: template.description || '',
                      network: 'mainnet'
                    })
                    setShowCreateWallet(true)
                  }}
                  className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/30 hover:bg-black/60 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-lg">{template.icon}</div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-medium text-sm truncate">{template.name}</h3>
                      <p className="text-gray-400 text-xs">{template.category}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs line-clamp-2 mb-2">{template.description}</p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-blue-400 text-xs">Click to use →</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWallets.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => {
                setSelectedWallet(wallet)
                setShowWalletDetail(true)
              }}
              className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer hover:border-white/40 hover:bg-black/70 transition-all duration-300 group"
            >
              {/* Wallet Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-black/40 rounded-lg ${getWalletTypeColor(wallet.type)}`}>
                    {getWalletTypeIcon(wallet.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white truncate">{wallet.name}</h3>
                    <p className="text-blue-400 text-sm capitalize">{wallet.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${wallet.isActive
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                  {wallet.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>

              {/* Wallet Details */}
              <div className="space-y-3">
                <div className="bg-black/40 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatBalance(wallet.balance, wallet.currency)}
                    </div>
                    <div className="text-gray-400 text-sm">Balance</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Address:</span>
                  <span className="text-white text-sm font-mono">{truncateAddress(wallet.address)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Network:</span>
                  <span className="text-white text-sm capitalize">{wallet.network}</span>
                </div>

                {wallet.organizationId ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Organization:</span>
                    <span className="text-blue-400 text-sm">
                      {organizations.find(org => org.id === wallet.organizationId)?.name || 'Unknown'}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Scope:</span>
                    <span className="text-purple-400 text-sm">Personal</span>
                  </div>
                )}

                {wallet.lastSyncAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Last Sync:</span>
                    <span className="text-white text-sm">{new Date(wallet.lastSyncAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Click hint */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-4 pt-3 border-t border-white/10">
                <p className="text-blue-400 text-xs text-center">Click to view details →</p>
              </div>
            </div>
          ))}
        </div>

        {filteredWallets.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Wallets Found</h3>
            <p className="text-gray-400 mb-6">
              {selectedOrganization
                ? 'No wallets found for the selected organization'
                : 'No wallets added yet'}
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowWalletTemplates(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Grid className="w-4 h-4" />
                <span>Browse Templates</span>
              </button>
              <button
                onClick={() => setShowCreateWallet(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Your First Wallet
              </button>
            </div>
          </div>
        )}

        {/* Wallet Templates Modal */}
        {showWalletTemplates && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Wallet Templates</h2>
                  <p className="text-gray-400">Choose from popular wallet configurations</p>
                </div>
                <button
                  onClick={() => setShowWalletTemplates(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex flex-col h-[calc(90vh-8rem)]">
                {/* Category Filter */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {['All', ...Array.from(new Set(walletTemplates.map(t => t.category).filter(Boolean)))].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category || 'All')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {walletTemplates
                      .filter(template => selectedCategory === 'All' || template.category === selectedCategory)
                      .map((template) => (
                        <div
                          key={template.id}
                          onClick={() => {
                            // Pre-fill form with template data
                            setWalletFormData({
                              name: template.name,
                              type: template.type?.toLowerCase() as Wallet['type'] || 'bitcoin',
                              address: '',
                              description: template.description || '',
                              network: 'mainnet'
                            })
                            setShowWalletTemplates(false)
                            setShowCreateWallet(true)
                          }}
                          className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 cursor-pointer hover:border-white/40 hover:bg-black/70 transition-all duration-300 group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{template.icon}</div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-semibold text-white truncate">{template.name}</h3>
                                <p className="text-blue-400 text-sm">{template.category}</p>
                              </div>
                            </div>
                            {template.status && (
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${template.status === 'Available'
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                }`}>
                                {template.status}
                              </div>
                            )}
                          </div>

                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{template.description}</p>

                          {template.features && (
                            <div className="mb-4">
                              <p className="text-gray-400 text-xs font-medium mb-2">Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {template.features.slice(0, 3).map((feature, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full"
                                  >
                                    {feature}
                                  </span>
                                ))}
                                {template.features.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                                    +{template.features.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {template.supportedChains && (
                            <div className="mb-4">
                              <p className="text-gray-400 text-xs font-medium mb-2">Supported Chains:</p>
                              <div className="flex flex-wrap gap-1">
                                {template.supportedChains?.slice(0, 3).map((chain: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full"
                                  >
                                    {chain}
                                  </span>
                                ))}
                                {template.supportedChains && template.supportedChains.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                                    +{template.supportedChains.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity pt-3 border-t border-white/10">
                            <p className="text-blue-400 text-xs text-center">Click to use template →</p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {walletTemplates.filter(template => selectedCategory === 'All' || template.category === selectedCategory).length === 0 && (
                    <div className="text-center py-12">
                      <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Templates Found</h3>
                      <p className="text-gray-400">No wallet templates found for the selected category</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Wallet Modal */}
        {showCreateWallet && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <h2 className="text-xl font-bold text-white">Add New Wallet</h2>
                <button
                  onClick={() => setShowCreateWallet(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Name</label>
                  <input
                    type="text"
                    value={walletFormData.name}
                    onChange={(e) => setWalletFormData({ ...walletFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., My Bitcoin Wallet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Type</label>
                  <select
                    value={walletFormData.type}
                    onChange={(e) => setWalletFormData({ ...walletFormData, type: e.target.value as Wallet['type'] })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bitcoin">Bitcoin</option>
                    <option value="ethereum">Ethereum</option>
                    <option value="bsv">Bitcoin SV</option>
                    <option value="handcash">HandCash</option>
                    <option value="metamask">MetaMask</option>
                    <option value="hardware">Hardware Wallet</option>
                    <option value="paper">Paper Wallet</option>
                    <option value="multi_sig">Multi-Signature</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                  <input
                    type="text"
                    value={walletFormData.address}
                    onChange={(e) => setWalletFormData({ ...walletFormData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Wallet address or $handle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Network</label>
                  <select
                    value={walletFormData.network}
                    onChange={(e) => setWalletFormData({ ...walletFormData, network: e.target.value as Wallet['network'] })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mainnet">Mainnet</option>
                    <option value="testnet">Testnet</option>
                    <option value="regtest">Regtest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                  <textarea
                    value={walletFormData.description}
                    onChange={(e) => setWalletFormData({ ...walletFormData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Brief description of this wallet..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 p-6 border-t border-white/20">
                <button
                  onClick={() => {
                    // TODO: Handle wallet creation
                    setShowCreateWallet(false)
                    setWalletFormData({
                      name: '',
                      type: 'bitcoin',
                      address: '',
                      description: '',
                      network: 'mainnet'
                    })
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Wallet
                </button>
                <button
                  onClick={() => setShowCreateWallet(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Detail Modal */}
        {showWalletDetail && selectedWallet && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 bg-black/40 rounded-lg ${getWalletTypeColor(selectedWallet.type)}`}>
                    {getWalletTypeIcon(selectedWallet.type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedWallet.name}</h2>
                    <p className="text-blue-400 capitalize">{selectedWallet.type.replace('_', ' ')}</p>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border mt-2 ${selectedWallet.isActive
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                      {selectedWallet.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowWalletDetail(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-white mb-2">
                        {formatBalance(selectedWallet.balance, selectedWallet.currency)}
                      </div>
                      <div className="text-gray-300">Current Balance</div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Wallet Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Address:</span>
                          <span className="text-white font-mono text-sm break-all">{selectedWallet.address}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Network:</span>
                          <span className="text-white capitalize">{selectedWallet.network}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Created:</span>
                          <span className="text-white">{new Date(selectedWallet.createdAt).toLocaleDateString()}</span>
                        </div>
                        {selectedWallet.lastSyncAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Last Sync:</span>
                            <span className="text-white">{new Date(selectedWallet.lastSyncAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedWallet.description && (
                          <div>
                            <span className="text-gray-400">Description:</span>
                            <p className="text-white mt-1">{selectedWallet.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <ArrowUpRight className="w-4 h-4" />
                          <span>Send</span>
                        </button>
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <ArrowDownLeft className="w-4 h-4" />
                          <span>Receive</span>
                        </button>
                        <button className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <RefreshCw className="w-4 h-4" />
                          <span>Sync Balance</span>
                        </button>
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                      <div className="space-y-3">
                        {selectedWallet.transactions.length > 0 ? (
                          selectedWallet.transactions.slice(0, 3).map((tx) => (
                            <div key={tx.id} className="p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-2 h-2 rounded-full ${tx.type === 'incoming' ? 'bg-green-400' : 'bg-red-400'
                                    }`}></div>
                                  <div>
                                    <p className="text-white text-sm capitalize">{tx.type}</p>
                                    <p className="text-gray-400 text-xs">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-medium ${tx.type === 'incoming' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {tx.type === 'incoming' ? '+' : '-'}{tx.amount} {tx.currency}
                                  </p>
                                  <p className="text-gray-400 text-xs">{tx.confirmations} confirmations</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <div className="text-gray-400 text-sm">No recent transactions</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


// Contracts View Component
function ContractsView({ organizations, selectedOrganization, roles = [], instruments = [] /*, workflows = [] */ }: ContractsViewProps) {
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

  // Mock contracts data - in real app this would come from props or API
  // const contracts: Contract[] = []

  const currentOrg = organizations.find(org => org.id === selectedOrganization)
  const allMembers = organizations.flatMap(org => org.members)

  const contractTemplates = [
    // Original 8 templates
    { id: '1', name: 'Service Agreement', type: 'service', description: 'Standard service delivery contract', icon: '📋', defaultDuration: 12 },
    { id: '2', name: 'Employment Contract', type: 'employment', description: 'Employee hiring agreement', icon: '👤', defaultDuration: 24 },
    { id: '3', name: 'Partnership Agreement', type: 'partnership', description: 'Business partnership contract', icon: '🤝', defaultDuration: 36 },
    { id: '4', name: 'Licensing Agreement', type: 'licensing', description: 'IP licensing contract', icon: '📜', defaultDuration: 12 },
    { id: '5', name: 'NDA', type: 'nda', description: 'Non-disclosure agreement', icon: '🔒', defaultDuration: 24 },
    { id: '6', name: 'Consulting Agreement', type: 'consulting', description: 'Professional consulting contract', icon: '💼', defaultDuration: 6 },
    { id: '7', name: 'Vendor Agreement', type: 'vendor', description: 'Supplier/vendor contract', icon: '🏪', defaultDuration: 12 },
    { id: '8', name: 'Investment Contract', type: 'investment', description: 'Investment agreement with terms', icon: '💰', defaultDuration: 60 },

    // Additional 24 templates
    { id: '9', name: 'Software Development Agreement', type: 'service', description: 'Custom software development contract', icon: '💻', defaultDuration: 6 },
    { id: '10', name: 'Marketing Services Contract', type: 'service', description: 'Digital marketing and advertising services', icon: '📈', defaultDuration: 12 },
    { id: '11', name: 'Construction Contract', type: 'service', description: 'Building and construction services', icon: '🏗️', defaultDuration: 18 },
    { id: '12', name: 'Maintenance Agreement', type: 'service', description: 'Ongoing maintenance and support services', icon: '🔧', defaultDuration: 24 },
    { id: '13', name: 'Freelance Agreement', type: 'employment', description: 'Independent contractor agreement', icon: '👨‍💻', defaultDuration: 3 },
    { id: '14', name: 'Executive Employment', type: 'employment', description: 'Senior executive employment contract', icon: '👔', defaultDuration: 36 },
    { id: '15', name: 'Internship Agreement', type: 'employment', description: 'Student internship contract', icon: '🎓', defaultDuration: 3 },
    { id: '16', name: 'Remote Work Agreement', type: 'employment', description: 'Remote work employment contract', icon: '🌐', defaultDuration: 12 },
    { id: '17', name: 'Joint Venture Agreement', type: 'joint_venture', description: 'Business joint venture partnership', icon: '🏢', defaultDuration: 24 },
    { id: '18', name: 'Distribution Agreement', type: 'distribution', description: 'Product distribution partnership', icon: '🚚', defaultDuration: 18 },
    { id: '19', name: 'Franchise Agreement', type: 'franchise', description: 'Business franchise contract', icon: '🍔', defaultDuration: 60 },
    { id: '20', name: 'Supply Chain Agreement', type: 'supply', description: 'Supply chain management contract', icon: '📦', defaultDuration: 24 },
    { id: '21', name: 'Software License', type: 'licensing', description: 'Software licensing agreement', icon: '⚙️', defaultDuration: 12 },
    { id: '22', name: 'Music Licensing', type: 'licensing', description: 'Music and audio licensing contract', icon: '🎵', defaultDuration: 6 },
    { id: '23', name: 'Patent License', type: 'licensing', description: 'Patent licensing agreement', icon: '🔬', defaultDuration: 36 },
    { id: '24', name: 'Trademark License', type: 'licensing', description: 'Trademark usage licensing', icon: '™️', defaultDuration: 24 },
    { id: '25', name: 'Mutual NDA', type: 'nda', description: 'Bilateral non-disclosure agreement', icon: '🤐', defaultDuration: 12 },
    { id: '26', name: 'Employee NDA', type: 'nda', description: 'Employee confidentiality agreement', icon: '🔐', defaultDuration: 60 },
    { id: '27', name: 'Vendor NDA', type: 'nda', description: 'Third-party vendor confidentiality', icon: '🛡️', defaultDuration: 18 },
    { id: '28', name: 'IT Consulting', type: 'consulting', description: 'Information technology consulting', icon: '🖥️', defaultDuration: 6 },
    { id: '29', name: 'Management Consulting', type: 'consulting', description: 'Business management consulting', icon: '📊', defaultDuration: 9 },
    { id: '30', name: 'Legal Consulting', type: 'consulting', description: 'Legal advisory services', icon: '⚖️', defaultDuration: 12 },
    { id: '31', name: 'Financial Consulting', type: 'consulting', description: 'Financial advisory and planning', icon: '💹', defaultDuration: 6 },
    { id: '32', name: 'Equipment Lease', type: 'lease', description: 'Equipment leasing agreement', icon: '🏭', defaultDuration: 36 }
  ]

  const integrationTemplates = [
    { type: 'document_signing' as const, name: 'DocuSign Integration', description: 'Automated document signing workflow', icon: '✍️' },
    { type: 'payment' as const, name: 'Payment Gateway', description: 'Automated payment processing', icon: '💳' },
    { type: 'email' as const, name: 'Email Notifications', description: 'Automated email communications', icon: '📧' },
    { type: 'blockchain' as const, name: 'Smart Contract', description: 'Blockchain-based execution', icon: '⛓️' },
    { type: 'crm' as const, name: 'CRM Integration', description: 'Customer relationship management sync', icon: '👥' },
    { type: 'accounting' as const, name: 'Accounting System', description: 'Financial record integration', icon: '📊' }
  ]

  // Expose dashboard templates for other canvases (React Flow) to reuse
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
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // In a real app, this would call the onCreateContract prop
    console.log('Creating contract with workflow:', contractData)
    setShowCreateContract(false)
    setCurrentStep(1)
    // Reset form
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
        id: '',
        name: '',
        description: '',
        organizations: [],
        roles: [],
        members: [],
        instruments: [],
        integrations: [],
        automations: [],
        milestones: [],
        notifications: []
      }
    })
  }

  return (
    <div className="absolute inset-0 top-24 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 pb-8">
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

        {/* Contract Templates Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Choose Contract Template ({contractTemplates.length} Available)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {contractTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  handleTemplateSelect(template)
                  setShowCreateContract(true)
                }}
                className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg p-4 cursor-pointer transition-all hover:scale-105"
              >
                <div className="text-3xl mb-3 text-center">{template.icon}</div>
                <h5 className="text-white font-medium mb-2 text-sm text-center">{template.name}</h5>
                <p className="text-gray-300 text-xs mb-3 line-clamp-2 text-center">{template.description}</p>
                <p className="text-blue-400 text-xs text-center">Default: {template.defaultDuration} months</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Contract Workflow Modal */}
        {showCreateContract && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-7xl min-h-[90vh] max-h-none my-4 overflow-visible">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Create Contract Workflow</h3>
                <div className="flex items-center space-x-4">
                  {/* Step Indicator */}
                  <div className="flex items-center space-x-2">
                    {[2, 3, 4].map((step, index) => (
                      <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step ? 'bg-blue-500 text-white' :
                        currentStep > step ? 'bg-green-500 text-white' :
                          'bg-gray-600 text-gray-300'
                        }`}>
                        {index + 1}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCreateContract(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>



              {/* Step 2: Basic Contract Details */}
              {currentStep === 2 && (
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Contract Details</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Contract Name</label>
                        <input
                          type="text"
                          value={contractData.name}
                          onChange={(e) => setContractData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          value={contractData.description}
                          onChange={(e) => setContractData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Contract Value</label>
                          <input
                            type="number"
                            value={contractData.value}
                            onChange={(e) => setContractData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
                          <select
                            value={contractData.currency}
                            onChange={(e) => setContractData(prev => ({ ...prev, currency: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="BTC">BTC</option>
                            <option value="BSV">BSV</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Organization (Optional)</label>
                        <select
                          value={contractData.organizationId}
                          onChange={(e) => setContractData(prev => ({ ...prev, organizationId: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No Organization (Global Contract)</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                          <input
                            type="date"
                            value={contractData.startDate}
                            onChange={(e) => setContractData(prev => ({ ...prev, startDate: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                          <input
                            type="date"
                            value={contractData.endDate}
                            onChange={(e) => setContractData(prev => ({ ...prev, endDate: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setShowCreateContract(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Next: Workflow Components
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Workflow Components */}
              {currentStep === 3 && (
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Workflow Components</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Organizations, Roles, Members, Instruments Selection */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Involved Organizations</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {organizations.map((org) => (
                            <label key={org.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={contractData.workflow.organizations.includes(org.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        organizations: [...prev.workflow.organizations, org.id]
                                      }
                                    }))
                                  } else {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        organizations: prev.workflow.organizations.filter(id => id !== org.id)
                                      }
                                    }))
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-white text-sm">{org.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Assigned Roles</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {roles.map((role) => (
                            <label key={role.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={contractData.workflow.roles.includes(role.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        roles: [...prev.workflow.roles, role.id]
                                      }
                                    }))
                                  } else {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        roles: prev.workflow.roles.filter(id => id !== role.id)
                                      }
                                    }))
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-white text-sm">{role.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Participating Members</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {allMembers.map((member) => (
                            <label key={member.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={contractData.workflow.members.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        members: [...prev.workflow.members, member.id]
                                      }
                                    }))
                                  } else {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        members: prev.workflow.members.filter(id => id !== member.id)
                                      }
                                    }))
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-white text-sm">{member.firstName} {member.lastName}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Related Instruments</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {instruments.map((instrument) => (
                            <label key={instrument.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={contractData.workflow.instruments.includes(instrument.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        instruments: [...prev.workflow.instruments, instrument.id]
                                      }
                                    }))
                                  } else {
                                    setContractData(prev => ({
                                      ...prev,
                                      workflow: {
                                        ...prev.workflow,
                                        instruments: prev.workflow.instruments.filter(id => id !== instrument.id)
                                      }
                                    }))
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-white text-sm">{instrument.name} ({instrument.symbol})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Next: Integrations & Automation
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Integrations and Automation */}
              {currentStep === 4 && (
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Integrations & Automation</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-md font-medium text-white mb-3">Available Integrations</h5>
                      <div className="grid grid-cols-1 gap-3">
                        {integrationTemplates.map((template, index) => (
                          <div
                            key={index}
                            onClick={() => addIntegration(template)}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg p-3 cursor-pointer transition-all"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">{template.icon}</div>
                              <div>
                                <h6 className="text-white font-medium text-sm">{template.name}</h6>
                                <p className="text-gray-300 text-xs">{template.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-md font-medium text-white">Contract Milestones</h5>
                        <button
                          onClick={addMilestone}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Add Milestone
                        </button>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {contractData.workflow.milestones.map((milestone, index) => (
                          <div key={milestone.id} className="bg-white/10 rounded-lg p-3">
                            <input
                              type="text"
                              value={milestone.name}
                              onChange={(e) => {
                                const updatedMilestones = [...contractData.workflow.milestones]
                                updatedMilestones[index].name = e.target.value
                                setContractData(prev => ({
                                  ...prev,
                                  workflow: {
                                    ...prev.workflow,
                                    milestones: updatedMilestones
                                  }
                                }))
                              }}
                              placeholder="Milestone name"
                              className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-6">
                        <h5 className="text-md font-medium text-white mb-3">Selected Integrations</h5>
                        <div className="space-y-2">
                          {contractData.workflow.integrations.map((integration) => (
                            <div key={integration.id} className="bg-white/10 rounded-lg p-2 flex items-center justify-between">
                              <span className="text-white text-sm">{integration.name}</span>
                              <button
                                onClick={() => {
                                  setContractData(prev => ({
                                    ...prev,
                                    workflow: {
                                      ...prev.workflow,
                                      integrations: prev.workflow.integrations.filter(i => i.id !== integration.id)
                                    }
                                  }))
                                }}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateContract}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Create Contract Workflow
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// HandCash Debug Info Component
function HandCashDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadDebugInfo = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/handcash/debug')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error('Failed to load debug info:', error)
      setDebugInfo({ error: 'Failed to load debug information' })
    }
    setLoading(false)
  }

  return (
    <div className="mt-4 bg-black/40 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-yellow-400">HandCash Debug</h4>
        <button
          onClick={loadDebugInfo}
          disabled={loading}
          className="px-2 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-xs rounded transition-colors"
        >
          {loading ? 'Loading...' : 'Check Status'}
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">App ID:</span>
            <span className={debugInfo.debug?.handcashAppId === 'SET' ? 'text-green-400' : 'text-red-400'}>
              {debugInfo.debug?.handcashAppId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Secret:</span>
            <span className={debugInfo.debug?.handcashSecret === 'SET' ? 'text-green-400' : 'text-red-400'}>
              {debugInfo.debug?.handcashSecret}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">SDK Status:</span>
            <span className={debugInfo.sdk?.status === 'INITIALIZED' ? 'text-green-400' : 'text-red-400'}>
              {debugInfo.sdk?.status}
            </span>
          </div>
          {debugInfo.sdk?.error && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400">
              <div className="font-medium">Error:</div>
              <div className="text-xs">{debugInfo.sdk.error.message}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DashboardContent() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <DashboardContentInner />
    </Suspense>
  )
}

export default function Page() {
  return <DashboardContent />
}
