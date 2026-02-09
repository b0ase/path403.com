export interface HandCashHandle {
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
  walletType?: 'handcash' | 'phantom' | 'metamask' | 'bitcoin' | 'ethereum'
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

export interface KYCDocument {
  id: string
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement' | 'other'
  name: string
  url?: string
  uploadedAt: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
}

export interface Contract {
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

export interface ContractIntegration {
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

export interface ContractAutomation {
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

export interface ContractMilestone {
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

export interface ContractNotification {
  id: string
  type: 'email' | 'sms' | 'in_app' | 'webhook'
  recipients: string[] // Member IDs or email addresses
  subject: string
  message: string
  triggerEvent: string
  isActive: boolean
}

export interface ContractTerm {
  id: string
  title: string
  content: string
  category: 'payment' | 'delivery' | 'performance' | 'termination' | 'liability' | 'intellectual_property' | 'confidentiality' | 'dispute_resolution' | 'other'
  isRequired: boolean
  order: number
}

export interface ContractDocument {
  id: string
  name: string
  type: 'contract' | 'amendment' | 'addendum' | 'exhibit' | 'signature_page' | 'other'
  url?: string
  uploadedAt: string
  uploadedBy: string
  version: number
  isActive: boolean
}

export interface ContractsViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
  roles?: Role[]
  instruments?: FinancialInstrument[]
  workflows?: WorkflowState[]
  onCreateContract?: (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export interface Wallet {
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

export interface WalletTransaction {
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

export interface WalletsViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
}

export interface Organization {
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

export interface Role {
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

export interface WorkflowNode {
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

export interface Connection {
  id: string
  from: string
  to: string
  type: 'success' | 'failure' | 'conditional' | 'payment' | 'task'
  condition?: string
  amount?: number
}

export interface CanvasTool {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  shortcut?: string
  active?: boolean
}

export interface WorkflowState {
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

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  status: 'sending' | 'sent' | 'error'
}

export interface AppState {
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

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  createdAt: string
  lastUsed?: string
  isActive: boolean
}

export interface SshKey {
  id: string
  name: string
  publicKey: string
  fingerprint: string
  createdAt: string
  lastUsed?: string
  isActive: boolean
}

export interface McpServer {
  id: string
  name: string
  url: string
  description: string
  isActive: boolean
  createdAt: string
}

export interface UserProfile {
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

export interface WorkflowViewProps {
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

export interface OrganizationsViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
  onSelectOrganization: (orgId: string) => void
  onDeselectOrganization: () => void
  onCreateOrganization: (name: string, description: string, tokenSymbol: string) => void
}

export interface RolesViewProps {
  roles: Role[]
  organizations: Organization[]
  selectedOrganization: string | null
  onAddMember: (organizationId: string, handle: string, displayName: string, roleId: string) => void
  onCreateRole: (name: string, description: string, icon: string, permissions: string[], defaultShareAllocation: number, automationType: 'ai-agent' | 'workflow' | 'hybrid') => void
  onUpdateRole: (roleId: string, updates: Partial<Role>) => void
  onDeleteRole: (roleId: string) => void
}

export interface PeopleViewProps {
  organizations: Organization[]
  selectedOrganization: string | null
  onUpdateShareAllocation: (organizationId: string, personId: string, shares: number) => void
}

export interface FinancialInstrument {
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

export interface InstrumentsViewProps {
  instruments: FinancialInstrument[]
  organizations: Organization[]
  selectedOrganization: string | null
  onCreateInstrument: (instrument: Omit<FinancialInstrument, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateInstrument: (id: string, updates: Partial<FinancialInstrument>) => void
  onDeleteInstrument: (id: string) => void
  onSelectOrganization: (orgId: string) => void
  onDeselectOrganization: () => void
}

export interface SecurityProduct {
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


