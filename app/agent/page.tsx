'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/lib/hooks/useChat';
import {
  FaUser,
  FaRobot,
  FaPaperPlane,
  FaCog,
  FaPencilAlt,
  FaPlus,
  FaRocket,
  FaLightbulb,
  FaCode,
  FaMobile,
  FaShoppingCart,
  FaChartLine,
  FaGlobe,
  FaBrain,
  FaCalendarAlt,
  FaClock,
  FaDollarSign,
  FaUsers,
  FaTools,
  FaStar,
  FaCubes,
  FaDatabase,
  FaLock,
  FaBell,
  FaSearch,
  FaEdit,
  FaCloud,
  FaFileUpload,
  FaComments,
  FaCreditCard,
  FaVideo,
  FaChartBar,
  FaShieldAlt,
  FaNetworkWired,
  FaCheck,
  FaTimes,
  FaSave,
  FaCoins,
  FaGem,
  FaExclamationTriangle,
  FaCheckCircle,
  FaFileAlt,
  FaNewspaper,
  FaHashtag,
  FaEnvelope,
  FaBullhorn,
  FaChartPie,
  FaCamera,
  FaPlay,
  FaVolumeUp,
  FaTerminal
} from 'react-icons/fa';
import { FiHome, FiCpu, FiCommand } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import DOMPurify from 'isomorphic-dompurify';

const DEFAULT_SYSTEM_PROMPT = `You are the b0ase.com AI Project Assistant. Guide users through creating their project step by step:

1. First, help them select a project type
2. Then guide them to name their project
3. Next, recommend and help them select modules
4. Finally, prepare them for minting

Be encouraging, specific, and always mention b0ase.com. Keep responses concise but helpful. Ask questions to understand their needs better.`;

const PROJECT_TEMPLATES = [
  {
    id: 'custom',
    name: 'Custom Project',
    icon: FaLightbulb,
    basePrice: 800,
    description: 'Build something unique with b0ase.com\'s full-service development team',
    defaultModules: []
  },
  {
    id: 'web-app',
    name: 'Web Application',
    icon: FaGlobe,
    basePrice: 1200,
    description: 'Modern responsive web applications',
    defaultModules: ['auth', 'database', 'api']
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    icon: FaMobile,
    basePrice: 1500,
    description: 'Cross-platform iOS and Android applications',
    defaultModules: ['auth', 'database', 'notifications']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Store',
    icon: FaShoppingCart,
    basePrice: 1800,
    description: 'Complete online stores with payment processing',
    defaultModules: ['auth', 'database', 'payments', 'file-upload']
  },
  {
    id: 'ai-solution',
    name: 'AI-Powered Solution',
    icon: FaBrain,
    basePrice: 2200,
    description: 'Intelligent applications with AI integration',
    defaultModules: ['ai', 'database', 'api', 'analytics']
  },
  {
    id: 'business-site',
    name: 'Business Website',
    icon: FaChartLine,
    basePrice: 600,
    description: 'Professional websites for businesses',
    defaultModules: ['cms', 'seo']
  }
];

const AVAILABLE_MODULES = [
  { id: 'auth', name: 'Authentication', icon: FaLock, price: 400, description: 'User login, registration, and security', category: 'tech' },
  { id: 'database', name: 'Database Design', icon: FaDatabase, price: 500, description: 'Scalable data storage and management', category: 'tech' },
  { id: 'payments', name: 'Payment System', icon: FaCreditCard, price: 600, description: 'Secure payment processing', category: 'tech' },
  { id: 'chat', name: 'Live Chat', icon: FaComments, price: 450, description: 'Real-time messaging system', category: 'tech' },
  { id: 'file-upload', name: 'File Upload', icon: FaFileUpload, price: 300, description: 'File storage and management', category: 'tech' },
  { id: 'notifications', name: 'Notifications', icon: FaBell, price: 350, description: 'Push notifications and alerts', category: 'tech' },
  { id: 'search', name: 'Search Functionality', icon: FaSearch, price: 400, description: 'Advanced search capabilities', category: 'tech' },
  { id: 'analytics', name: 'Analytics Dashboard', icon: FaChartBar, price: 700, description: 'Data insights and reporting', category: 'tech' },
  { id: 'api', name: 'API Backend', icon: FaCloud, price: 800, description: 'RESTful API development', category: 'tech' },
  { id: 'security', name: 'Security Features', icon: FaShieldAlt, price: 500, description: 'Advanced security measures', category: 'tech' },
  { id: 'ai', name: 'AI Integration', icon: FaBrain, price: 1200, description: 'Machine learning and AI features', category: 'tech' },
  { id: 'cms', name: 'CMS System', icon: FaEdit, price: 550, description: 'Content management system', category: 'tech' },
  { id: 'seo', name: 'SEO Optimization', icon: FaRocket, price: 300, description: 'Search engine optimization', category: 'tech' }
];

const CONTENT_MODULES = [
  { id: 'ai-influencer', name: 'AI Influencer', icon: FaRobot, price: 1000, description: 'Complete AI-powered social media presence', category: 'content' },
  { id: 'website-copy', name: 'Website Copy', icon: FaFileAlt, price: 350, description: 'Persuasive landing page and product copy', category: 'content' },
  { id: 'blog-articles', name: 'Blog Articles', icon: FaNewspaper, price: 200, description: 'Industry authority positioning content', category: 'content' },
  { id: 'social-media-content', name: 'Social Media Content', icon: FaHashtag, price: 275, description: 'Platform-specific engagement content', category: 'content' },
  { id: 'video-scripts', name: 'Video Scripts', icon: FaVideo, price: 400, description: 'Compelling promotional video scripts', category: 'content' },
  { id: 'email-campaigns', name: 'Email Marketing', icon: FaEnvelope, price: 275, description: 'Lead nurturing email campaigns', category: 'content' },
  { id: 'advertising-copy', name: 'Ad Copy', icon: FaBullhorn, price: 200, description: 'High-converting advertising copy', category: 'content' },
  { id: 'infographics', name: 'Infographics', icon: FaChartPie, price: 550, description: 'Visual data storytelling graphics', category: 'content' },
  { id: 'product-photography', name: 'Product Photos', icon: FaCamera, price: 800, description: 'Professional product photography', category: 'content' },
  { id: 'ai-generated-photos', name: 'AI Photos', icon: FaCamera, price: 900, description: 'AI-generated professional photography', category: 'content' },
  { id: 'ai-generated-videos', name: 'AI Videos', icon: FaVideo, price: 1750, description: 'AI-created video content', category: 'content' },
  { id: 'ai-generated-music', name: 'AI Music', icon: FaPlay, price: 650, description: 'Original AI-composed music tracks', category: 'content' },
  { id: 'music-videos', name: 'Music Videos', icon: FaVideo, price: 2500, description: 'AI-powered music videos with lip-sync', category: 'content' },
  { id: 'ai-audio-production', name: 'AI Audio', icon: FaVolumeUp, price: 750, description: 'AI voice generation and audio production', category: 'content' },
  { id: 'social-media-automation', name: 'Social Automation', icon: FaRobot, price: 800, description: 'Automated social media management', category: 'content' },
  { id: 'brand-photography', name: 'Brand Photos', icon: FaUsers, price: 1050, description: 'Team and brand photography', category: 'content' },
  { id: 'promotional-videos', name: 'Promo Videos', icon: FaPlay, price: 1650, description: 'Professional promotional videos', category: 'content' }
];

// Workflow steps
const WORKFLOW_STEPS = {
  UNIVERSAL_MODE: 'universal_mode',
  SELECT_TYPE: 'select_type',
  CONFIRM_TYPE: 'confirm_type',
  NAME_PROJECT: 'name_project',
  SELECT_MODULES: 'select_modules',
  READY_TO_MINT: 'ready_to_mint'
};

const AGENT_CAPABILITIES = [
  { id: 'general', name: 'General Intelligence', icon: FaBrain, description: 'Ask me anything about b0ase.com' },
  { id: 'builder', name: 'Project Builder', icon: FaTools, description: 'interactive project wizard' },
  { id: 'advisor', name: 'Investment Advisor', icon: FaChartLine, description: 'Personal IPO guidance' }
];

const ChatInterface = ({ projectName, selectedModules, projectType, provider, temperature, currentStep, onStepChange, chatHistory, setChatHistory, onProjectNameChange, onModuleToggle }) => {
  const getInitialMessage = () => {
    switch (currentStep) {
      case WORKFLOW_STEPS.UNIVERSAL_MODE:
        return "Greetings. I am the Universal Interface for b0ase.com. My systems are online and fully operational.\n\nI can assist you with:\n- **Building a Project** (Web, Mobile, AI)\n- **Investment Inquiries** (Personal IPO, Tokens)\n\nHow may I serve you today?";
      case WORKFLOW_STEPS.SELECT_TYPE:
        return "Initializing Project Builder Protocol...\n\nPlease select a project architecture from the available templates on the left.";
      case WORKFLOW_STEPS.CONFIRM_TYPE:
        return `Great choice! You've selected a ${projectType} project. This is perfect for ${PROJECT_TEMPLATES.find(t => t.name === projectType)?.description}. Are you ready to proceed with this project type?`;
      case WORKFLOW_STEPS.NAME_PROJECT:
        return `Excellent! Now let's give your ${projectType} project a memorable name. **What would you like to call your project?** Just type the name in the chat and I'll set it up for you!`;
      case WORKFLOW_STEPS.SELECT_MODULES:
        return `Perfect! Your project "${projectName}" is taking shape. Now let's add some powerful modules to enhance your ${projectType}. You can either click on modules below or **tell me what features you need** and I'll recommend the right modules for you!`;
      case WORKFLOW_STEPS.READY_TO_MINT:
        return `Amazing work! Your ${projectType} project "${projectName}" is ready. You've selected ${selectedModules.length} modules and we've discussed all the details. Your project is now ready to be minted as an NFT on b0ase.com. Click 'Send to Mint' when you're ready!`;
      default:
        return "System Online. Awaiting input.";
    }
  };

  const modulesText = selectedModules.length > 0
    ? `Selected modules: ${selectedModules.map(m => {
      const techModule = AVAILABLE_MODULES.find(mod => mod.id === m);
      const contentModule = CONTENT_MODULES.find(mod => mod.id === m);
      return (techModule || contentModule)?.name;
    }).filter(Boolean).join(', ')}`
    : 'No modules selected yet';

  const { messages, input, isLoading, handleInputChange, handleSubmit } = useChat({
    initialMessages: [{
      role: 'agent',
      content: getInitialMessage(),
    }],
    body: {
      systemPrompt: DEFAULT_SYSTEM_PROMPT + ` Current step: ${currentStep}. Project: "${projectName}" (${projectType}). ${modulesText}. Chat history: ${chatHistory}. If user provides a project name during NAME_PROJECT step, respond with "Perfect! I've set your project name to '[NAME]'. Now let's move on to selecting modules." If user requests specific features during SELECT_MODULES step, recommend relevant modules and offer to add them.`,
      temperature,
      model: 'pro',
      provider: provider,
    }
  });

  // Handle auto-population of fields based on user messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      // Auto-populate project name
      if (currentStep === WORKFLOW_STEPS.NAME_PROJECT) {
        const userInput = lastMessage.content.trim();
        // Check if this looks like a project name (not a question)
        if (userInput.length > 0 && !userInput.includes('?') && userInput.split(' ').length <= 6) {
          onProjectNameChange(userInput);
          // Move to next step after a brief delay
          setTimeout(() => {
            onStepChange(WORKFLOW_STEPS.SELECT_MODULES);
          }, 1500);
        }
      }

      // Auto-suggest modules based on keywords
      if (currentStep === WORKFLOW_STEPS.SELECT_MODULES) {
        const userInput = lastMessage.content.toLowerCase();
        const moduleKeywords = {
          'ai-influencer': ['influencer', 'ai influencer', 'social presence', 'ai persona', 'digital influencer', 'virtual influencer', 'ai personality'],
          'auth': ['login', 'authentication', 'user', 'account', 'signin', 'signup'],
          'payments': ['payment', 'checkout', 'stripe', 'paypal', 'billing'],
          'chat': ['chat', 'messaging', 'communication', 'talk'],
          'database': ['database', 'data', 'storage', 'save'],
          'search': ['search', 'find', 'filter', 'lookup'],
          'notifications': ['notification', 'alert', 'notify', 'email'],
          'analytics': ['analytics', 'tracking', 'stats', 'metrics'],
          'file-upload': ['upload', 'file', 'image', 'document'],
          'website-copy': ['copy', 'content', 'writing', 'text'],
          'blog-articles': ['blog', 'article', 'content'],
          'social-media-content': ['social', 'instagram', 'twitter', 'facebook'],
          'video-scripts': ['video', 'script', 'youtube'],
          'email-campaigns': ['email', 'newsletter', 'campaign'],
          'advertising-copy': ['ads', 'advertising', 'marketing']
        };

        Object.entries(moduleKeywords).forEach(([moduleId, keywords]) => {
          if (keywords.some(keyword => userInput.includes(keyword))) {
            if (!selectedModules.includes(moduleId)) {
              onModuleToggle(moduleId);
            }
          }
        });
      }
    }
  }, [messages, currentStep, selectedModules, onProjectNameChange, onModuleToggle, onStepChange]);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages - DISABLED
  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     if (messages.length > 1) {
  //       const { scrollHeight } = chatContainerRef.current;
  //       chatContainerRef.current.scrollTop = scrollHeight;
  //     }
  //   }
  // }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Ensure page loads at the top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update chat history when messages change
  useEffect(() => {
    const newHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    setChatHistory(newHistory);
  }, [messages, setChatHistory]);

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-zinc-900 shadow-2xl overflow-hidden">
      <div className="p-3 border-b border-zinc-900 flex items-center gap-2 flex-shrink-0 bg-black">
        <FiCpu className="text-white" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">SYSTEM_AGENT_V1.0.0</h3>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
        </div>
      </div>

      {/* Instruction Banner */}
      <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 text-zinc-300 rounded-none px-3 py-2 mx-3 mt-3 mb-1 text-xs font-mono">
        <FiCommand className="text-white text-sm mr-1" />
        <span><span className="text-white font-bold">INFO:</span> Explain your idea to the agent to begin construction.</span>
      </div>

      <div ref={chatContainerRef} className="flex-1 p-3 space-y-4 overflow-y-auto font-mono text-sm leading-relaxed">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'agent' && (
              <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800 flex-shrink-0">
                <FaTerminal className="text-white text-xs" />
              </div>
            )}
            <div className={`max-w-lg p-3 rounded-none border ${msg.role === 'agent'
              ? 'bg-black text-zinc-300 border-zinc-800'
              : 'bg-white text-black border-white'}`}>
              <p className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold border-b border-zinc-500">$1</strong>')) }}></p>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center border border-white flex-shrink-0">
                <FaUser className="text-black text-xs" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center border border-zinc-800 flex-shrink-0">
              <FaTerminal className="text-white text-xs" />
            </div>
            <div className="max-w-lg p-3 rounded-none bg-black text-zinc-300 border border-zinc-800">
              <div className="flex items-center gap-1">
                <span className="animate-pulse">_</span>
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Processing</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 flex-shrink-0 border-t border-zinc-900 bg-black">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  (e.target as HTMLTextAreaElement).form?.requestSubmit();
                }
              }}
              placeholder={isLoading ? "SYSTEM_BUSY..." : "ENTER_COMMAND..."}
              className="w-full bg-black border border-zinc-800 rounded-none py-3 pl-3 pr-10 text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-all resize-none text-sm font-mono"
              rows={2}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 w-8 h-8 bg-zinc-900 hover:bg-white border border-zinc-800 hover:border-white group flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPaperPlane className="text-xs text-zinc-400 group-hover:text-black" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AgentPage() {
  const [currentStep, setCurrentStep] = useState(WORKFLOW_STEPS.UNIVERSAL_MODE);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PROJECT_TEMPLATES[0] | null>(null);
  const [pendingTemplate, setPendingTemplate] = useState<typeof PROJECT_TEMPLATES[0] | null>(null);
  const [projectName, setProjectName] = useState('UNNAMED_PROJECT');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProjectName, setTempProjectName] = useState(projectName);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [provider, setProvider] = useState('aiml');
  const [temperature, setTemperature] = useState(0.7);
  const [chatHistory, setChatHistory] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingModule, setPendingModule] = useState<(typeof AVAILABLE_MODULES[0] | typeof CONTENT_MODULES[0]) | null>(null);
  const [activeTab, setActiveTab] = useState<'tech' | 'content'>('tech');
  const { user } = useAuth();
  const router = useRouter();

  const handleTemplateSelect = (template: typeof PROJECT_TEMPLATES[0]) => {
    setPendingTemplate(template);
    setCurrentStep(WORKFLOW_STEPS.CONFIRM_TYPE);
  };

  const confirmTemplate = () => {
    if (pendingTemplate) {
      setSelectedTemplate(pendingTemplate);
      setSelectedModules(pendingTemplate.defaultModules);
      setCurrentStep(WORKFLOW_STEPS.NAME_PROJECT);
      setPendingTemplate(null);

      const templateData = {
        name: pendingTemplate.name,
        title: pendingTemplate.name,
        description: pendingTemplate.description,
        category: pendingTemplate.id === 'web-app' ? 'Web' :
          pendingTemplate.id === 'mobile-app' ? 'Mobile' :
            pendingTemplate.id === 'ecommerce' ? 'E-commerce' :
              pendingTemplate.id === 'ai-solution' ? 'AI' :
                pendingTemplate.id === 'business-site' ? 'Web' : 'SaaS',
        price: `£${pendingTemplate.basePrice}`,
        difficulty: 'Intermediate',
        duration: '4-8 weeks',
        features: ['Custom Development', 'Full Support', 'Modern Design'],
        tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        needsTeam: pendingTemplate.id !== 'business-site',
        needsToken: pendingTemplate.id === 'custom',
        needsAgent: pendingTemplate.id === 'ai-solution',
        needsWebsite: true,
      };

      localStorage.setItem('selectedProjectTemplate', JSON.stringify(templateData));
    }
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleSaveProjectName = () => {
    if (tempProjectName.trim()) {
      setProjectName(tempProjectName.trim());
      setCurrentStep(WORKFLOW_STEPS.SELECT_MODULES);
    } else {
      setTempProjectName(projectName);
    }
    setIsEditingName(false);
  };

  const handleModuleClick = (module) => {
    setPendingModule(module);
    setShowConfirmation(true);
  };

  const confirmAddModule = () => {
    if (pendingModule) {
      setSelectedModules(prev =>
        prev.includes(pendingModule.id)
          ? prev.filter(id => id !== pendingModule.id)
          : [...prev, pendingModule.id]
      );
    }
    setShowConfirmation(false);
    setPendingModule(null);

    // Check if we should move to final step
    if (selectedModules.length >= 2 && currentStep === WORKFLOW_STEPS.SELECT_MODULES) {
      setTimeout(() => setCurrentStep(WORKFLOW_STEPS.READY_TO_MINT), 1000);
    }
  };

  const calculateTotalPrice = () => {
    if (!selectedTemplate) return 0;
    const modulesCost = selectedModules.reduce((total, moduleId) => {
      const techModule = AVAILABLE_MODULES.find(m => m.id === moduleId);
      const contentModule = CONTENT_MODULES.find(m => m.id === moduleId);
      const selectedModule = techModule || contentModule;
      return total + (selectedModule?.price || 0);
    }, 0);
    return selectedTemplate.basePrice + modulesCost;
  };

  const handleMintProject = () => {
    const projectSummary = {
      name: projectName,
      type: selectedTemplate?.name || 'Unknown',
      modules: selectedModules.map(id => {
        const techModule = AVAILABLE_MODULES.find(m => m.id === id);
        const contentModule = CONTENT_MODULES.find(m => m.id === id);
        return (techModule || contentModule)?.name;
      }).filter(Boolean),
      totalPrice: calculateTotalPrice(),
      chatHistory: chatHistory,
      timestamp: new Date().toISOString()
    };

    const completeProjectData = {
      ...projectSummary,
      template: selectedTemplate,
      selectedModules: selectedModules,
      moduleDetails: selectedModules.map(id => {
        const techModule = AVAILABLE_MODULES.find(m => m.id === id);
        const contentModule = CONTENT_MODULES.find(m => m.id === id);
        return techModule || contentModule;
      }).filter(Boolean)
    };

    localStorage.setItem('projectToMint', JSON.stringify(completeProjectData));

    if (user) {
      router.push('/mint');
    } else {
      router.push('/signup?source=mint');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative font-mono selection:bg-white selection:text-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Header Title moved to top left or removed in favor of terminal look, keeping minimal title */}
          <div className="mb-8 flex items-end gap-4 border-b border-zinc-900 pb-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
              AGENT<span className="text-zinc-600">_CLI</span>
            </h2>
            <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
              v2.4.0-STABLE
            </div>
          </div>

          <div className="w-full max-w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              {/* Left Sidebar: Controls */}
              <div className="lg:col-span-1 space-y-4">

                {/* Project Status Panel */}
                <div className="bg-black border border-zinc-900 p-0">
                  <div className="bg-zinc-900/50 px-3 py-2 border-b border-zinc-900 flex justify-between items-center">
                    <span className="text-xs font-bold text-zinc-400 uppercase">Project_Status</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  </div>

                  <div className="p-3 space-y-3">
                    {/* Project Name Input */}
                    {(currentStep !== WORKFLOW_STEPS.SELECT_TYPE && currentStep !== WORKFLOW_STEPS.CONFIRM_TYPE) && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">PROJECT_ID</div>
                        <div className="flex items-center gap-2">
                          {isEditingName ? (
                            <div className="flex w-full items-center gap-1">
                              <input
                                type="text"
                                value={tempProjectName}
                                onChange={(e) => setTempProjectName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveProjectName();
                                  if (e.key === 'Escape') {
                                    setIsEditingName(false);
                                    setTempProjectName(projectName);
                                  }
                                }}
                                className="w-full bg-black border border-zinc-700 text-white text-xs p-1 focus:outline-none focus:border-white font-mono"
                                autoFocus
                              />
                              <button onClick={handleSaveProjectName} className="text-green-500 hover:text-white"><FaCheck size={10} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full group">
                              <span className="text-sm font-bold text-white font-mono">{projectName}</span>
                              <button onClick={handleNameEdit} className="text-zinc-600 group-hover:text-white transition-colors"><FaPencilAlt size={10} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Current Stage Indicator */}
                    <div className="space-y-1">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">CURRENT_STAGE</div>
                      <div className="text-xs text-white bg-zinc-900 px-2 py-1 inline-block border border-zinc-800">
                        {currentStep === WORKFLOW_STEPS.UNIVERSAL_MODE && 'UNIVERSAL_TERMINAL'}
                        {currentStep === WORKFLOW_STEPS.SELECT_TYPE && 'INIT_SELECTION'}
                        {currentStep === WORKFLOW_STEPS.CONFIRM_TYPE && 'VERIFICATION'}
                        {currentStep === WORKFLOW_STEPS.NAME_PROJECT && 'IDENTIFICATION'}
                        {currentStep === WORKFLOW_STEPS.SELECT_MODULES && 'CONFIGURATION'}
                        {currentStep === WORKFLOW_STEPS.READY_TO_MINT && 'FINALIZATION'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Capabilities / Templates List */}
                {currentStep === WORKFLOW_STEPS.UNIVERSAL_MODE ? (
                  <div className="space-y-2">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider px-1">SYSTEM_CAPABILITIES</div>
                    {AGENT_CAPABILITIES.map((cap) => (
                      <button
                        key={cap.id}
                        onClick={() => {
                          if (cap.id === 'builder') setCurrentStep(WORKFLOW_STEPS.SELECT_TYPE);
                        }}
                        className={`w-full text-left p-2 border border-zinc-900 bg-black hover:bg-zinc-900 group transition-all duration-200 ${cap.id === 'builder' ? 'cursor-pointer hover:border-zinc-700' : 'cursor-default'}`}
                      >
                        <div className="flex items-center gap-3">
                          <cap.icon className="text-zinc-500 group-hover:text-zinc-300 text-sm" />
                          <div className="flex-1">
                            <div className="font-bold text-xs uppercase tracking-wide text-zinc-300">{cap.name}</div>
                            <div className="text-[10px] text-zinc-600 leading-tight">{cap.description}</div>
                          </div>
                          {cap.id === 'builder' && <div className="text-[10px] font-mono opacity-50 text-green-500">INIT</div>}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : currentStep === WORKFLOW_STEPS.SELECT_TYPE ? (
                  <div className="space-y-2">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider px-1">AVAILABLE_TEMPLATES</div>
                    <button
                      onClick={() => setCurrentStep(WORKFLOW_STEPS.UNIVERSAL_MODE)}
                      className="w-full text-left p-2 mb-2 border border-dashed border-zinc-800 text-zinc-500 text-xs uppercase hover:text-white hover:border-white transition-colors"
                    >
                      ← Return to Universal Mode
                    </button>
                    {PROJECT_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full text-left p-2 border border-zinc-900 bg-black hover:bg-white hover:text-black group transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <template.icon className="text-zinc-500 group-hover:text-black text-sm" />
                          <div className="flex-1">
                            <div className="font-bold text-xs uppercase tracking-wide">{template.name}</div>
                          </div>
                          <div className="text-[10px] font-mono opacity-50">£{template.basePrice}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}

                {/* Pending Confirmation */}
                {currentStep === WORKFLOW_STEPS.CONFIRM_TYPE && pendingTemplate && (
                  <div className="border border-white bg-black p-3 space-y-4">
                    <div className="text-xs uppercase font-bold text-center border-b border-zinc-800 pb-2">Confirm Selection</div>
                    <div className="text-center space-y-2">
                      <pendingTemplate.icon className="mx-auto text-2xl text-white" />
                      <div className="font-bold text-sm uppercase">{pendingTemplate.name}</div>
                      <div className="text-xs text-zinc-400 leading-tight">{pendingTemplate.description}</div>
                      <div className="font-mono text-sm">£{pendingTemplate.basePrice}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={confirmTemplate} className="bg-white text-black text-xs font-bold py-2 uppercase hover:bg-zinc-200">Confirm</button>
                      <button onClick={() => setCurrentStep(WORKFLOW_STEPS.SELECT_TYPE)} className="border border-zinc-700 text-zinc-400 text-xs font-bold py-2 uppercase hover:border-white hover:text-white">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Active Template Details */}
                {selectedTemplate && currentStep !== WORKFLOW_STEPS.SELECT_TYPE && (
                  <div className="border border-zinc-900 p-3 bg-black space-y-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <selectedTemplate.icon />
                      <span className="text-xs font-bold uppercase">{selectedTemplate.name}</span>
                    </div>
                    <div className="h-px bg-zinc-900 w-full"></div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-500">BASE_COST:</span>
                      <span className="text-white">£{selectedTemplate.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-500">MODULES:</span>
                      <span className="text-white">£{calculateTotalPrice() - selectedTemplate.basePrice}</span>
                    </div>
                    <div className="h-px bg-white w-full"></div>
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-white">TOTAL:</span>
                      <span className="text-white">£{calculateTotalPrice()}</span>
                    </div>

                    {currentStep === WORKFLOW_STEPS.READY_TO_MINT && (
                      <button
                        onClick={handleMintProject}
                        className="w-full mt-4 bg-white text-black py-2 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200"
                      >
                        Initialize Mint
                      </button>
                    )}
                  </div>
                )}


              </div>

              {/* Main Workspace */}
              <div className="lg:col-span-3 space-y-4">

                {/* Chat Interface */}
                <div className="h-[500px] border border-zinc-800">
                  <ChatInterface
                    key={`${projectName}-${selectedTemplate?.id || 'none'}-${selectedModules.join(',')}-${provider}-${currentStep}`}
                    projectName={projectName}
                    selectedModules={selectedModules}
                    projectType={selectedTemplate?.name || pendingTemplate?.name || 'Unknown'}
                    provider={provider}
                    temperature={temperature}
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                    chatHistory={chatHistory}
                    setChatHistory={setChatHistory}
                    onProjectNameChange={setProjectName}
                    onModuleToggle={(moduleId) => {
                      setSelectedModules(prev =>
                        prev.includes(moduleId)
                          ? prev.filter(id => id !== moduleId)
                          : [...prev, moduleId]
                      );
                    }}
                  />
                </div>

                {/* Module Selection Panel */}
                {currentStep === WORKFLOW_STEPS.SELECT_MODULES && selectedTemplate && (
                  <div className="border-t border-zinc-900 pt-4">

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setActiveTab('tech')}
                          className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all ${activeTab === 'tech' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
                        >
                          System_Modules
                        </button>
                        <button
                          onClick={() => setActiveTab('content')}
                          className={`text-xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-all ${activeTab === 'content' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}
                        >
                          Content_Modules
                        </button>
                      </div>
                      <div className="text-xs font-mono text-zinc-500">
                        {selectedModules.length} SELECTED
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                      {(activeTab === 'tech' ? AVAILABLE_MODULES : CONTENT_MODULES).map((module) => {
                        const isSelected = selectedModules.includes(module.id);
                        return (
                          <button
                            key={module.id}
                            onClick={() => handleModuleClick(module)}
                            className={`
                                 p-3 text-left border transition-all duration-200 h-full flex flex-col justify-between
                                 ${isSelected
                                ? 'bg-white border-white text-black'
                                : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                              }
                               `}
                          >
                            <div className="space-y-2 mb-2">
                              <div className="flex justify-between items-start">
                                <module.icon className={isSelected ? 'text-black' : 'text-zinc-600'} />
                                {isSelected && <FaCheckCircle size={12} />}
                              </div>
                              <div className={`text-[10px] font-bold uppercase leading-tight ${isSelected ? 'text-black' : 'text-white'}`}>{module.name}</div>
                              <div className={`text-[10px] leading-tight ${isSelected ? 'text-zinc-600' : 'text-zinc-600'} line-clamp-2`}>{module.description}</div>
                            </div>
                            <div className={`text-xs font-mono font-bold pt-2 border-t ${isSelected ? 'border-black/10' : 'border-zinc-900'}`}>£{module.price}</div>
                          </button>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Module Confirmation Modal */}
        {showConfirmation && pendingModule && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black border border-white w-full max-w-sm p-0 shadow-2xl">
              <div className="bg-white text-black px-4 py-2 font-bold uppercase text-sm flex justify-between items-center">
                <span>System_Confirm</span>
                <FaTerminal />
              </div>
              <div className="p-6 text-center space-y-4">
                <pendingModule.icon className="mx-auto text-3xl text-white mb-2" />
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">{pendingModule.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{pendingModule.description}</p>
                </div>
                <div className="font-mono text-xl border-y border-zinc-800 py-2 my-2">£{pendingModule.price}</div>
                <div className="flex gap-2 pt-2">
                  <button onClick={confirmAddModule} className="flex-1 bg-white text-black py-2 text-xs font-bold uppercase hover:bg-zinc-200">
                    {selectedModules.includes(pendingModule.id) ? 'Remove' : 'Install'}
                  </button>
                  <button onClick={() => { setShowConfirmation(false); setPendingModule(null); }} className="flex-1 border border-zinc-700 text-zinc-400 py-2 text-xs font-bold uppercase hover:border-white hover:text-white">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </motion.section>
    </motion.div>
  );
}