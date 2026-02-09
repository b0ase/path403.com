'use client'

import React from 'react'
import {
  MousePointer,
  Hand,
  Link,
  Trash2,
  ZoomIn,
  Grid,
  Hash,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
  DollarSign,
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  Users,
  Building,
  Crown,
  UserCheck,
  Banknote,
  Plug,
  Globe,
  Database,
  Mail,
  MessageSquare,
  Bell,
  CheckSquare,
  Eye,
  Clock,
  GitBranch,
  Router,
  Layers,
  Package,
  Copy,
  RefreshCw,
  Bot,
  Wallet,
  User,
  Play,
  Headphones,
  Send,
  Palette,
  PlayCircle,
  TrendingUp,
  BarChart3,
  CreditCard,
  Split,
  Zap,
} from 'lucide-react'
import {
  WorkflowNode,
  Connection,
  CanvasTool,
  WorkflowState,
  WorkflowViewProps,
  Organization,
  FinancialInstrument,
  Contract,
  Role,
  NodeContentItem,
} from './types'

// Workflow View Component
export default function WorkflowView({ 
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
    { type: 'contract' as const, name: 'Contract', icon: getColoredNodeIcon('contract'), category: 'Basic' },
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
        <div className={`bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl transition-all duration-300 p-2 ${
          isPaletteCollapsed ? 'max-h-12 overflow-hidden' : 'max-h-[40rem]'
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
                className={`text-xs p-1 rounded transition-colors ${
                  snapToGrid 
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
          <div className={`transition-all duration-300 ${
            isPaletteCollapsed ? 'opacity-0 max-h-0' : 'opacity-100 max-h-[36rem]'
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
        className={`flex-1 relative overflow-hidden ${
          isPanning ? 'cursor-grab active:cursor-grabbing' :
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
            className={`absolute bg-black/60 backdrop-blur-xl border rounded-xl transition-all duration-300 shadow-2xl hover:shadow-white/5 group ${
              isSelected ? 'border-blue-400/60 ring-2 ring-blue-400/30 shadow-blue-400/20' : 
              isConnecting ? 'ring-2 ring-green-400/50 shadow-green-400/20 border-green-400/60' :
              getNodeBorderColor(node.type)
            } ${
              workflow.currentTool === 'delete' ? 'hover:border-red-400/60 hover:ring-2 hover:ring-red-400/30' : ''
            } ${
              workflow.currentTool === 'select' ? 'cursor-move' :
              workflow.currentTool === 'connect' ? 'cursor-crosshair' :
              workflow.currentTool === 'delete' ? 'cursor-not-allowed' :
              workflow.currentTool === 'zoom' ? 'cursor-zoom-in' :
              'cursor-pointer'
            } ${
              isMobile ? 'p-2 w-40' : 'p-4 w-60'
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
              className={`w-full bg-transparent border-none text-white font-medium focus:outline-none placeholder-gray-500 focus:placeholder-gray-400 transition-colors ${
                isMobile ? 'text-sm' : 'text-base'
              }`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              value={node.description}
              onChange={(e) => onNodeUpdate(node.id, { description: e.target.value })}
              placeholder="Description"
              className={`w-full bg-transparent border-none text-gray-400 focus:outline-none resize-none placeholder-gray-500 focus:placeholder-gray-400 transition-colors ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}
              rows={isMobile ? 2 : 1}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        )
      })}
    </div>

    {/* Selected Node Details Panel */}
    {selectedNodeDetails && workflow.nodes.find(n => n.id === selectedNodeDetails) && (
      <div 
        className="absolute top-0 right-0 h-full w-full md:w-96 bg-black/80 backdrop-blur-xl border-l border-white/20 z-50 p-6 overflow-y-auto scrollbar-always-visible"
        data-allow-scroll="true"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Node Details</h2>
          <button
            onClick={() => setSelectedNodeDetails(null)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {(() => {
          const node = workflow.nodes.find(n => n.id === selectedNodeDetails)!
          const content = getNodeInternalContent(node)
          
          return (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg">
                  {getLargeColoredNodeIcon(node.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{node.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">{node.type} Node</p>
                </div>
              </div>

              {/* Node Details Table */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">ID</span>
                      <span className="text-gray-500 font-mono">{node.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)} bg-opacity-20`}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">{content.title}</h4>
                  <div className="space-y-2 text-sm">
                    {content.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-300">{item.label}</span>
                        <span className="text-white font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Metadata</h4>
                  <pre className="text-xs text-gray-300 bg-black/50 p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(node.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          )
        })()}
      </div>
    )}

    {/* Business Item Selection Modal */}
    {showBusinessModal && (
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={() => setShowBusinessModal(null)}
      >
        <div 
          className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Select a {showBusinessModal}</h2>
            <button onClick={() => setShowBusinessModal(null)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto">
            <BusinessItemSelector
              type={showBusinessModal}
              organizations={organizations}
              roles={roles}
              instruments={instruments}
              contracts={contracts}
              wallets={wallets}
              workflows={allWorkflows}
              onSelect={handleBusinessItemSelect}
            />
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

