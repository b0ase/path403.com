'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiSend, FiX, FiMenu, FiPlus, FiMessageSquare, FiTrash2, FiChevronLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { portfolioData, Project } from '@/lib/data';
import dynamic from 'next/dynamic';
import { useWallet } from '@/contexts/WalletProvider';
import ConnectWalletModal from '@/components/wallet/ConnectWalletModal';
import { BsWallet2 } from 'react-icons/bs';
import { useAuth } from '@/components/Providers';
import { useColorTheme } from '@/components/ThemePicker';


// Dynamically import Portfolio Money Button
const PortfolioMoneyButton = dynamic(
  () => import('@/components/portfolio/PortfolioMoneyButton'),
  {
    ssr: false,
    loading: () => <div className="w-8 h-8 rounded-full bg-zinc-800" />
  }
);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isDemo?: boolean;
  createdAt?: string;
}

// Context extracted from conversation
interface ConversationContext {
  industry?: string;      // fintech, healthtech, edtech, etc.
  solutionType?: string;  // app, marketplace, AI, platform, etc.
  problemType?: string;   // efficiency, cost, access, automation, etc.
  targetUser?: string;    // b2b, b2c, enterprise, consumers, etc.
  founderBackground?: string; // technical, domain-expert, business, etc.
  teamStatus?: string;    // solo, cofounder, team, etc.
  stage?: string;         // idea, prototype, mvp, revenue, etc.
  name?: string;          // if they mention their name
}

// Session data stored in localStorage
interface KintsugiSession {
  sessionId: string;
  sessionCode: string;  // memorable code like "golden-eagle-42"
  title: string;        // "Fintech App Idea" or defaults to session code
  messages: Message[];
  context: ConversationContext;
  createdAt: string;
  lastActiveAt: string;
  lastTxid?: string;    // Track the last inscription for sequentiality
}

const SESSIONS_STORAGE_KEY = 'kintsugi_sessions';
const CURRENT_SESSION_KEY = 'kintsugi_current_session';

// Generate a memorable session code
function generateSessionCode(): string {
  const adjectives = ['golden', 'silver', 'cosmic', 'digital', 'quantum', 'crystal', 'stellar', 'neon', 'ancient', 'future'];
  const nouns = ['eagle', 'phoenix', 'dragon', 'falcon', 'lion', 'tiger', 'wolf', 'hawk', 'raven', 'fox'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

// Generate session ID
function generateSessionId(): string {
  return `kintsugi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function KintsugiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProposal, setShowProposal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [context, setContext] = useState<ConversationContext>({});
  const [lastTxid, setLastTxid] = useState<string | null>(null);
  const { colorTheme, setColorTheme } = useColorTheme();
  const theme = colorTheme === 'black' ? 'dark' : 'light';


  // Multi-session state
  const [allSessions, setAllSessions] = useState<KintsugiSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected, address, disconnect, provider } = useWallet();
  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingMessageRef = useRef<string>('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');

  // Track processed commands to avoid double-execution
  const processedCommandsRef = useRef<Set<string>>(new Set());

  // Get all portfolio projects - sorted alphabetically
  const allProjects = [...portfolioData.projects].sort((a, b) => a.title.localeCompare(b.title));

  // initializeSession creates a blank new session
  const initializeSession = useCallback(() => {
    const newSession: KintsugiSession = {
      sessionId: generateSessionId(),
      sessionCode: generateSessionCode(), // Used for title initially
      title: generateSessionCode(),
      messages: [],
      context: {},
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      lastTxid: undefined,
    };
    return newSession;
  }, []);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const loadSessions = async () => {
      // 1. Try to load multiple sessions
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      const storedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);
      let sessions: KintsugiSession[] = [];

      if (storedSessions) {
        try {
          sessions = JSON.parse(storedSessions);
        } catch (e) {
          console.error('Failed to load sessions:', e);
        }
      }

      // 2. Migration check: if no multi-sessions but old single session exists
      if (sessions.length === 0) {
        const oldSingleSession = localStorage.getItem('kintsugi_session'); // Old key string literal
        if (oldSingleSession) {
          try {
            const oldSession = JSON.parse(oldSingleSession);
            // Migrate old session structure to new
            const migrated: KintsugiSession = {
              ...oldSession,
              title: oldSession.title || 'Previous Session', // add title if missing
            };
            sessions.push(migrated);
            // Clear old key to finish migration
            localStorage.removeItem('kintsugi_session');
          } catch (e) { console.error('Migration failed', e); }
        }
      }

      // 3. Try to load from server to merge
      try {
        const serverRes = await fetch('/api/kintsugi/sync-session');
        const serverData = await serverRes.json();
        if (serverData.sessions) {
          const serverSessions = serverData.sessions.map((s: any) => ({
            sessionId: s.session_id,
            sessionCode: s.session_code,
            title: s.title,
            messages: s.messages,
            context: s.context,
            createdAt: s.created_at,
            lastActiveAt: s.updated_at,
            lastTxid: s.last_txid
          }));

          // Merge: server takes precedence for same sessionId
          const sessionMap = new Map();
          sessions.forEach(s => sessionMap.set(s.sessionId, s));
          serverSessions.forEach((s: any) => sessionMap.set(s.sessionId, s));
          sessions = Array.from(sessionMap.values());
        }
      } catch (e) {
        // Silently fail if not logged in or server down
      }

      // 4. If still empty, create completely new one
      if (sessions.length === 0) {
        const newSession = initializeSession();
        sessions.push(newSession);
      }

      // Sort by lastActive desc
      sessions.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());

      setAllSessions(sessions);

      // 5. Determine current session
      let currentSession = sessions.find(s => s.sessionId === storedCurrentId) || sessions[0];

      // Load state
      setMessages(currentSession.messages);
      setContext(currentSession.context);
      setSessionCode(currentSession.sessionCode);
      setLastTxid(currentSession.lastTxid || null);
      sessionIdRef.current = currentSession.sessionId;
      setIsDemoMode(currentSession.messages.some(m => m.isDemo)); // Check if loaded session was demo
    };

    loadSessions();
  }, [initializeSession]);

  // Save current state to the sessions list and persist to LS
  const saveCurrentSession = useCallback((newMessages?: Message[], newContext?: ConversationContext) => {
    const msgs = newMessages || messages;
    const ctx = newContext || context;
    const currentId = sessionIdRef.current;

    setAllSessions(prev => {
      const index = prev.findIndex(s => s.sessionId === currentId);

      // Retrieve current title or default to sessionCode if missing
      let title = index >= 0 ? prev[index].title : 'New Session';

      // Dynamic Title Update via PROJECT_NAME tag
      // Check the latest messages for the tag
      for (let i = msgs.length - 1; i >= 0; i--) {
        const msg = msgs[i];
        if (msg.role === 'assistant') {
          const match = msg.content.match(/PROJECT_NAME:\s*(.+)/);
          if (match) {
            title = match[1].trim();
            break;
          }
        }
      }

      const updatedSession: KintsugiSession = {
        sessionId: currentId,
        sessionCode: sessionCode,
        title,
        messages: msgs,
        context: ctx,
        lastTxid: lastTxid || undefined,
        createdAt: index >= 0 ? prev[index].createdAt : new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      const newSessions = [...prev];
      if (index >= 0) {
        newSessions[index] = updatedSession;
      } else {
        newSessions.unshift(updatedSession);
      }

      // Sort by active
      newSessions.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());

      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newSessions));
      localStorage.setItem(CURRENT_SESSION_KEY, currentId);
      return newSessions;
    });
  }, [messages, context, sessionCode, lastTxid]);

  // Synchronize session with server
  const syncSession = useCallback(async (session: KintsugiSession) => {
    try {
      await fetch('/api/kintsugi/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          sessionCode: session.sessionCode,
          title: session.title,
          messages: session.messages,
          context: session.context,
          lastTxid: session.lastTxid
        })
      });
    } catch (e) {
      console.error('Failed to sync session with server:', e);
    }
  }, []);

  // Background Sync to Server
  useEffect(() => {
    const currentSession = allSessions.find(s => s.sessionId === sessionIdRef.current);
    if (currentSession && currentSession.messages.length > 0) {
      const timer = setTimeout(() => {
        syncSession(currentSession);
      }, 5000); // Debounce sync by 5 seconds
      return () => clearTimeout(timer);
    }
  }, [allSessions, syncSession]);

  // Persist on message/context changes
  useEffect(() => {
    if (messages.length > 0 || Object.keys(context).length > 0) {
      // We delay slightly or check diff to avoid infinite loop, 
      // but here reliance on dependency array [messages, context] is standard.
      // We just need to ensure saveCurrentSession doesn't trigger state updates that cause re-render loop.
      // It updates allSessions, which is fine.
      saveCurrentSession();
    }
  }, [messages, context, saveCurrentSession]);

  // Function to switch to a different session
  const loadSession = (sessionId: string) => {
    const session = allSessions.find(s => s.sessionId === sessionId);
    if (session) {
      sessionIdRef.current = session.sessionId;
      setMessages(session.messages);
      setContext(session.context);
      setSessionCode(session.sessionCode);
      setLastTxid(session.lastTxid || null);
      setIsDemoMode(session.messages.some(m => m.isDemo));
      setIsSidebarOpen(false); // Close sidebar on mobile/action
      localStorage.setItem(CURRENT_SESSION_KEY, session.sessionId);
    }
  };

  // Function to create and switch to a new session
  const createNewSession = () => {
    const newSession = initializeSession();
    setAllSessions(prev => [newSession, ...prev]);

    // Switch state
    sessionIdRef.current = newSession.sessionId;
    setMessages([]);
    setContext({});
    setSessionCode(newSession.sessionCode);
    setLastTxid(null);
    setIsDemoMode(false);
    setIsSidebarOpen(false);
    localStorage.setItem(CURRENT_SESSION_KEY, newSession.sessionId);
  };

  // Delete a session
  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const newList = allSessions.filter(s => s.sessionId !== sessionId);
    setAllSessions(newList);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newList));

    // If deleted current session, switch to another or create new
    if (sessionId === sessionIdRef.current) {
      if (newList.length > 0) {
        loadSession(newList[0].sessionId);
      } else {
        createNewSession();
      }
    }
  };

  // No rate limiting - demo mode always works

  // Auto-scroll carousel until user starts typing
  useEffect(() => {
    if (isTyping || !carouselRef.current) return;

    const carousel = carouselRef.current;
    let scrollDirection = 1;

    const interval = setInterval(() => {
      if (!carousel) return;

      // Check if we've reached the end
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 5) {
        scrollDirection = -1;
      } else if (carousel.scrollLeft <= 5) {
        scrollDirection = 1;
      }

      carousel.scrollLeft += scrollDirection * 0.5;
    }, 50);

    return () => clearInterval(interval);
  }, [isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming]);

  // Function to handle automatic repo creation
  const handleCreateRepo = async (msgId: string) => {
    // 1. Get Project Title
    const currentSession = allSessions.find(s => s.sessionId === sessionIdRef.current);
    const title = currentSession?.title || `session-${sessionCode}`;

    // 2. Add 'Creating...' system message
    const tempId = `sys-${Date.now()}`;
    const loadingMsg: Message = { id: tempId, role: 'assistant', content: '_Initializing GitHub Repository..._' };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      const res = await fetch('/api/kintsugi/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectTitle: title, sessionCode })
      });
      const data = await res.json();

      if (data.success) {
        const successMsg: Message = {
          id: `sys-${Date.now() + 1}`,
          role: 'assistant',
          content: `**Repository Created Successfully!**\n\n[Open GitHub Repo](${data.repoUrl})\n\nI have initialized it with the Kintsugi Startup Kit.`
        };
        setMessages(prev => prev.map(m => m.id === tempId ? successMsg : m));
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      const errorMsg: Message = { id: `sys-${Date.now() + 1}`, role: 'assistant', content: `**Error creating repo:** ${e.message}` };
      setMessages(prev => prev.map(m => m.id === tempId ? errorMsg : m));
    }
  };

  // Function to handle automatic chat inscription
  const handleInscribeChat = async () => {
    if (!isConnected) return;

    // 1. Prepare Content (Last 5 messages or since last inscription)
    const logContent = JSON.stringify(messages.slice(-5));

    // 2. Add 'Inscribing...' system message
    const tempId = `sys-ins-${Date.now()}`;
    const loadingMsg: Message = { id: tempId, role: 'assistant', content: '_Recording this exchange to BSV blockchain..._' };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      const res = await fetch('/api/kintsugi/inscribe-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          sessionCode,
          content: logContent,
          prevTxid: lastTxid
        })
      });
      const data = await res.json();

      if (data.success) {
        setLastTxid(data.txid);
        const successMsg: Message = {
          id: `sys-ins-${Date.now() + 1}`,
          role: 'assistant',
          content: `**Chat Fragment Inscribed!**\n\n[Verify on Chain](${data.url})`
        };
        setMessages(prev => prev.map(m => m.id === tempId ? successMsg : m));
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      if (e.message?.includes('WALLET_SIGN_REQUIRED') || e.code === 'WALLET_SIGN_REQUIRED') {
        const errorMsg: Message = {
          id: `sys-ins-${Date.now() + 1}`,
          role: 'assistant',
          content: `**On-chain log recording requires your signature.**\n\nI couldn't sign this automatically because the platform key is not configured. Since you are the owner of this project, please connect your **Yours Wallet** and type "inscribe" to sign this log entries yourself.`
        };
        setMessages(prev => prev.map(m => m.id === tempId ? errorMsg : m));
      } else {
        const errorMsg: Message = { id: `sys-ins-${Date.now() + 1}`, role: 'assistant', content: `**Inscription failed:** ${e.message}` };
        setMessages(prev => prev.map(m => m.id === tempId ? errorMsg : m));
      }
    }
  };

  // Function to handle accepted proposals
  const handleAcceptProposalTag = async (content: string) => {
    // Parse ACCEPT_PROPOSAL: {...} tag
    const match = content.match(/ACCEPT_PROPOSAL:\s*(\{[\s\S]*?\})/);
    if (!match) return;

    try {
      const proposalData = JSON.parse(match[1]);

      // Add loading message
      const tempId = `sys-proposal-${Date.now()}`;
      const loadingMsg: Message = { id: tempId, role: 'assistant', content: '_Recording your proposal..._' };
      setMessages(prev => [...prev, loadingMsg]);

      // Call the propose API
      const res = await fetch('/api/kintsugi/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          sessionCode,
          email: proposalData.email,
          proposalType: proposalData.type || 'new_project',
          title: proposalData.title || 'Untitled Proposal',
          description: proposalData.description,
          projectSlug: proposalData.projectSlug || selectedProject?.slug,
          githubIssueNumber: proposalData.issueNumber,
          githubIssueUrl: proposalData.issueUrl,
          terms: proposalData.terms || {},
        }),
      });

      const data = await res.json();

      if (data.success) {
        const successMsg: Message = {
          id: `sys-proposal-${Date.now() + 1}`,
          role: 'assistant',
          content: `**Proposal Recorded!** ✓\n\n${data.nextSteps}\n\nProposal ID: \`${data.proposalId}\``
        };
        setMessages(prev => prev.map(m => m.id === tempId ? successMsg : m));
      } else {
        throw new Error(data.error || 'Failed to record proposal');
      }
    } catch (e: any) {
      console.error('Proposal recording failed:', e);
      const errorMsg: Message = {
        id: `sys-proposal-${Date.now() + 1}`,
        role: 'assistant',
        content: `**Note:** I couldn't automatically record the proposal. Please email your interest to kintsugi@b0ase.com`
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  // Effect to listen for commands
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      // Check for CREATE_REPO
      if (lastMsg.content.includes('CREATE_REPO') && !processedCommandsRef.current.has(lastMsg.id)) {
        processedCommandsRef.current.add(lastMsg.id);
        handleCreateRepo(lastMsg.id);
      }
      // Check for INSCRIBE_CHAT
      if (lastMsg.content.includes('INSCRIBE_CHAT') && !processedCommandsRef.current.has(lastMsg.id)) {
        processedCommandsRef.current.add(lastMsg.id);
        handleInscribeChat();
      }
      // Check for ACCEPT_PROPOSAL
      if (lastMsg.content.includes('ACCEPT_PROPOSAL:') && !processedCommandsRef.current.has(lastMsg.id + '-proposal')) {
        processedCommandsRef.current.add(lastMsg.id + '-proposal');
        handleAcceptProposalTag(lastMsg.content);
      }
    }
  }, [messages, isConnected, lastTxid, sessionCode, selectedProject]);

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || streaming) return;

    // No frontend rate limiting - let API handle it (demo mode will work when providers exhausted)
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    setInput('');
    setError(null);

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      setStreaming(true);
      streamingMessageRef.current = '';

      const tempAssistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
      };
      setMessages([...updatedMessages, tempAssistantMessage]);

      // Build history for API (exclude the temp assistant message)
      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/kintsugi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionCode,
          history: history.slice(0, -1), // Exclude the just-added user message since we send it separately
          selectedProject: selectedProject ? {
            title: selectedProject.title,
            slug: selectedProject.slug,
            description: selectedProject.description,
            status: selectedProject.status,
            tokenName: selectedProject.tokenName,
            liveUrl: selectedProject.liveUrl,
          } : null,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send message';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response stream');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content' && data.text) {
                streamingMessageRef.current += data.text;
                if (data.isDemo) setIsDemoMode(true);

                // Detect PROJECT_NAME: tag in real-time
                const nameMatch = streamingMessageRef.current.match(/PROJECT_NAME:\s*(.+)/);
                if (nameMatch) {
                  const newTitle = nameMatch[1].trim();
                  setAllSessions(prev =>
                    prev.map(s => s.sessionId === sessionIdRef.current ? { ...s, title: newTitle } : s)
                  );
                }

                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = streamingMessageRef.current;
                    lastMessage.isDemo = data.isDemo || false;
                  }
                  return newMessages;
                });
                // No auto-scroll - user controls scroll position
              } else if (data.type === 'demo_mode') {
                setIsDemoMode(true);
              } else if (data.type === 'done') {
                // Check for special cues in response
                if (streamingMessageRef.current.includes('## PROPOSAL:')) {
                  setShowProposal(true);
                }
                if (streamingMessageRef.current.includes('## PAYMENT_REQUIRED:')) {
                  setShowPayment(true);
                }

                // Final save to sync title and messages
                saveCurrentSession();
              }
              else if (data.type === 'error') {
                // Map the error name for UI use
                if (data.code === 'WALLET_SIGN_REQUIRED' || data.error?.includes('private key not found')) {
                  setError('Inscription Signature Required: Please connect Yours wallet.');
                } else {
                  setError(data.error || 'An error occurred');
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the temp assistant message on error
      setMessages(updatedMessages);
    } finally {
      setStreaming(false);
      streamingMessageRef.current = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAcceptProposal = () => {
    // Navigate to project creation or show next step
    router.push('/kintsugi/roadmap');
  };

  const handlePayWithHandCash = async () => {
    if (!isConnected || provider !== 'handcash') {
      setIsWalletModalOpen(true);
      setError('Please connect your HandCash wallet to pay');
      return;
    }

    setIsPaymentLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kintsugi/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          amount: 999, // £999
          description: `Kintsugi Setup Fee - Session ${sessionCode}`
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Payment failed');
      }

      const result = await response.json();
      setShowPayment(false);

      // Send a follow-up message celebrating success
      sendMessage(`I just paid the £999 setup fee via HandCash! TXID: ${result.txid}`);

    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message || 'Payment failed');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Render markdown-like content
  const renderContent = (content: string) => {
    // Hide specialized tags from UI
    let cleanContent = content.replace(/PROJECT_NAME:.*(\n|$)/g, '').trim();
    cleanContent = cleanContent.replace(/CREATE_REPO.*(\n|$)/g, '').trim();
    cleanContent = cleanContent.replace(/INSCRIBE_CHAT.*(\n|$)/g, '').trim();
    cleanContent = cleanContent.replace(/ACCEPT_PROPOSAL:\s*\{[\s\S]*?\}(\n|$)/g, '').trim(); // Hide ACCEPT_PROPOSAL tag

    if (!cleanContent) return null;

    const lines = cleanContent.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    lines.forEach((line, i) => {
      if (line.startsWith('## PROPOSAL:')) {
        elements.push(
          <h2 key={i} className="text-lg font-semibold text-green-400 mt-4 mb-2 border-b border-green-800/50 pb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-base font-semibold text-white mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <p key={i} className="font-semibold text-white mt-3 mb-1">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      } else if (line.startsWith('| ') && line.includes('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());
        if (!line.includes('---')) {
          tableRows.push(cells);
        }
      } else {
        if (inTable && tableRows.length > 0) {
          elements.push(
            <table key={`table-${i}`} className="w-full text-sm my-3 border border-zinc-700/50 rounded overflow-hidden">
              <thead>
                <tr className="bg-zinc-800/50">
                  {tableRows[0].map((cell, ci) => (
                    <th key={ci} className="px-3 py-2 text-left text-xs font-medium text-zinc-400">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(1).map((row, ri) => (
                  <tr key={ri} className="border-t border-zinc-800/50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-sm">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
          inTable = false;
          tableRows = [];
        }
        if (line.trim() && !line.startsWith('---')) {
          elements.push(
            <p key={i} className="text-zinc-300 my-1 leading-relaxed">{line}</p>
          );
        }
      }
    });

    if (inTable && tableRows.length > 0) {
      elements.push(
        <table key="final-table" className="w-full text-sm my-3 border border-zinc-700/50 rounded overflow-hidden">
          <thead>
            <tr className="bg-zinc-800/50">
              {tableRows[0].map((cell, ci) => (
                <th key={ci} className="px-3 py-2 text-left text-xs font-medium text-zinc-400">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.slice(1).map((row, ri) => (
              <tr key={ri} className="border-t border-zinc-800/50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-sm">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return elements;
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'light' ? 'bg-zinc-100 text-zinc-900' : 'bg-black text-white'}`}>
      {/* Content Card - matches navbar styling */}
      <div className={`fixed top-[140px] md:top-[160px] bottom-6 left-4 right-4 md:left-12 md:right-12 border backdrop-blur-md rounded-xl overflow-hidden flex shadow-2xl transition-colors duration-300 ${theme === 'light' ? 'bg-white/95 border-zinc-200' : 'bg-black/90 border-white/10'}`}>
        {/* Sidebar Overlay for Mobile */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar Panel */}
        <motion.div
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
          className={`border-r flex flex-col z-50 fixed md:relative h-full overflow-hidden transition-colors duration-300 ${theme === 'light' ? 'bg-zinc-50/95 border-zinc-200' : 'bg-zinc-950/50 border-white/10'}`}
          style={{ width: isSidebarOpen ? 260 : 0 }}
        >
          <div className="p-3 w-64 flex flex-col h-full min-w-[260px]">
            <div className="flex items-center justify-between mb-4">
              <button onClick={createNewSession} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors border border-transparent text-sm shadow-md ${theme === 'light' ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <FiPlus /> New Chat
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className={`ml-2 p-2 hover:text-white ${theme === 'light' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <FiX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">History</div>
              {allSessions.map(session => (
                <div key={session.sessionId} className="group flex items-center gap-2">
                  <button
                    onClick={() => loadSession(session.sessionId)}
                    className={`flex-1 text-left truncate px-3 py-2 rounded-lg text-sm transition-colors font-mono ${sessionIdRef.current === session.sessionId ? (theme === 'light' ? 'bg-black text-white' : 'bg-white/10 text-white') : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
                  >
                    <div className="flex flex-col">
                      <span className="truncate">{session.title || session.sessionCode}</span>
                      <span className="text-[10px] text-zinc-500 opacity-60">{session.sessionCode}</span>
                    </div>
                  </button>
                  <button onClick={(e) => deleteSession(e, session.sessionId)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400 transition-all">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 text-[10px] text-zinc-600 px-2 font-mono mt-auto">
              Code: {sessionCode}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full min-w-0">
          {/* Backgrounds */}
          {/* Backgrounds */}
          {/* Backgrounds */}
          <div className={`absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none rounded-r-xl transition-all duration-300 ${theme === 'light' ? 'opacity-[0.05]' : 'opacity-10'}`} style={{ backgroundImage: 'url(/images/blog/kintsugi-bowl.jpg)', filter: theme === 'light' ? 'grayscale(100%) brightness(1.2)' : 'none' }} />
          <div className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${theme === 'light' ? 'bg-gradient-to-b from-white/30 via-white/80 to-white/95' : 'bg-gradient-to-b from-transparent via-black/30 to-black/60'}`} />

          {/* Content Wrapper */}
          <div className="flex-1 flex flex-col relative z-10 w-full max-w-full overflow-hidden">
            {/* Persistent Header */}
            <div className={`border-b px-4 pt-2 pb-2 shrink-0 backdrop-blur-md transition-colors duration-300 ${theme === 'light' ? 'border-zinc-200 bg-white/50' : 'border-white/10 bg-black/30'}`}>
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {!isSidebarOpen && (
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="mr-2 p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                    >
                      <FiMenu size={18} />
                    </button>
                  )}
                  <h1 className={`text-lg font-light transition-colors duration-300 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Kintsugi</h1>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <button onClick={createNewSession} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors" title="New Chat">
                    <FiPlus size={14} />
                    <span className="hidden sm:inline">New</span>
                  </button>
                  <div className="w-px h-3 bg-white/10 hidden sm:block"></div>
                  <Link href="/problem" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    How it works
                  </Link>
                  <Link href="/kintsugi/roadmap" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    Roadmap
                  </Link>
                  <Link href="/kintsugi/invest" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    Invest
                  </Link>
                  <button
                    onClick={isConnected ? () => disconnect() : () => setIsWalletModalOpen(true)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isConnected ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-zinc-400 hover:text-white"}`}
                    title={isConnected ? `Connected via ${provider}: ${address}` : "Connect Wallet"}
                  >
                    <BsWallet2 size={12} />
                    <span className="hidden sm:inline text-[10px]">
                      {isConnected ? (
                        provider === 'handcash' ? `@${address}` : `${address?.slice(0, 4)}...${address?.slice(-4)}`
                      ) : "Connect"}
                    </span>

                  </button>
                </div>
              </div>
            </div>

            {/* Persistent Session Title Bar */}
            <div className={`border-b px-4 py-1.5 shrink-0 backdrop-blur-sm transition-colors duration-300 ${theme === 'light' ? 'border-zinc-200 bg-zinc-50/80' : 'border-white/5 bg-black/20'}`}>
              <div className={`w-full flex items-center justify-between text-[10px] font-mono ${theme === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                <span className="uppercase tracking-wider">Session ID: <span className={`select-all ${theme === 'light' ? 'text-black font-bold' : 'text-zinc-200'}`}>{sessionCode}</span></span>
                {selectedProject! && (
                  <span className={`${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>Context: {selectedProject!.title}</span>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!hasMessages ? (
                // Initial centered view
                <motion.div
                  key="initial"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto relative"
                >
                  <div className="text-center mb-8">
                    <h1 className={`text-5xl md:text-6xl font-orbitron font-bold tracking-[0.15em] uppercase transition-colors duration-300 ${theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>
                      Kintsugi
                    </h1>
                  </div>

                  <div className="w-full max-w-3xl">
                    {/* Contributing badge when project selected */}
                    {selectedProject! && (
                      <p className="text-zinc-500 text-sm mb-3">
                        Contributing to {selectedProject!.title}
                      </p>
                    )}

                    {/* Selected Project Badge */}
                    {selectedProject! && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3"
                      >
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm shadow-sm transition-colors ${theme === 'light' ? 'bg-zinc-100 border-zinc-200 shadow-sm' : 'bg-zinc-800 border-zinc-700'}`}>
                          <span className={`font-bold uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>{selectedProject!.title}</span>
                          {selectedProject!.tokenName && (
                            <span className="text-amber-600 dark:text-amber-500 text-xs font-mono">{selectedProject!.tokenName}</span>
                          )}
                          <button
                            onClick={() => setSelectedProject(null)}
                            className={`ml-1 p-0.5 rounded-full transition-colors ${theme === 'light' ? 'hover:bg-zinc-200 text-zinc-500' : 'hover:bg-zinc-700 text-zinc-400'}`}
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          if (e.target.value.length > 0) setIsTyping(true);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedProject! ? `What needs fixing in ${selectedProject!.title}?` : "What's broken?"}
                        rows={2}
                        className={`w-full border rounded-2xl px-6 py-5 pr-16 text-lg focus:outline-none transition-all resize-none shadow-xl ${theme === 'light' ? 'bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-zinc-400' : 'bg-zinc-900/80 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600'}`}
                        style={{ minHeight: '80px', maxHeight: '250px' }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                        }}
                      />
                      <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || streaming}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden border-2 border-amber-500/50 hover:border-amber-400"
                      >
                        <Image
                          src="/images/blog/kintsugi-bowl.jpg"
                          alt="Send"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      {/* Session code for resuming */}
                      <span className="absolute right-14 top-1/2 -translate-y-1/2 text-zinc-700 text-xs font-mono" title="Your session code - use to resume conversation">
                        {sessionCode}
                      </span>
                    </div>

                    {/* Links under chatbox */}
                    <div className="flex items-center justify-center gap-3 text-zinc-600 text-xs mt-4">
                      <Link href="/problem" className="hover:text-zinc-400 transition-colors">
                        How it works
                      </Link>
                      <span>·</span>
                      <Link href="/kintsugi/roadmap" className="hover:text-zinc-400 transition-colors">
                        Roadmap
                      </Link>
                      <span>·</span>
                      <Link href="/kintsugi/invest" className="hover:text-zinc-400 transition-colors">
                        Invest
                      </Link>
                    </div>

                    {/* Portfolio Carousel - horizontally scrollable, hidden when typing

                    TODO: Conceptual clarity needed for Kintsugi's three distinct offerings:
                    1. New founders: 100% equity in their own idea (main Kintsugi offering)
                    2. Investors: Fund development of existing b0ase apps (NOT 100% equity)
                    3. Developers: Build/fix existing b0ase apps for equity (NOT 100% equity)

                    The carousel suggesting existing projects may confuse users expecting 100% equity.
                    Consider separating these flows or clarifying the different value propositions.
                */}
                    {!isTyping && (
                      <div className="mt-6 -mx-4 px-4 opacity-60 hover:opacity-100 transition-opacity">
                        <div
                          ref={carouselRef}
                          className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {allProjects.map((project, idx) => (
                            <button
                              key={project.id}
                              onClick={() => setSelectedProject(project)}
                              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs ${selectedProject!?.id === project.id
                                ? 'bg-zinc-800 border-zinc-600'
                                : 'bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50'
                                }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${project.status === 'Live' || project.status === 'Production' || project.status === 'Active'
                                ? 'bg-green-500'
                                : project.status === 'Beta' || project.status === 'Development' || project.status === 'Demo'
                                  ? 'bg-yellow-500'
                                  : 'bg-zinc-600'
                                }`} />
                              <span className="text-zinc-400 truncate">{project.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                // Chat view
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col max-h-full overflow-hidden"
                >

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                      {messages.map((message, index) => (
                        <div
                          key={message.id || index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3 ${message.role === 'user'
                              ? theme === 'light'
                                ? 'bg-black text-white border border-black shadow-lg rounded-br-none'
                                : 'bg-white/10 text-white border border-white/10 rounded-br-none'
                              : message.content.includes('## PROPOSAL:')
                                ? theme === 'light' ? 'bg-green-50 text-green-900 border border-green-200' : 'bg-green-950/30 text-white border border-green-900/50'
                                : message.isDemo
                                  ? theme === 'light' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-amber-950/30 text-amber-100 border border-amber-900/50'
                                  : theme === 'light' ? 'bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-bl-none' : 'bg-white/5 text-white border border-white/5 rounded-bl-none'
                              }`}
                          >
                            {/* Demo messages are styled in yellow - no explicit label needed */}
                            {message.role === 'assistant' ? (
                              <div className={`text-sm ${message.isDemo ? 'text-amber-100' : ''}`}>
                                {renderContent(message.content)}
                              </div>
                            ) : (
                              <div className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </div>
                            )}
                            {message.role === 'assistant' && streaming && index === messages.length - 1 && (
                              <span className="inline-block w-2 h-4 ml-1 bg-zinc-500 animate-pulse rounded-sm" />
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} className="pb-4" />
                    </div>
                  </div>

                  {/* Accept Proposal Banner */}
                  {showProposal && !streaming && (
                    <div className="border-t border-green-500/20 bg-green-950/30 px-4 py-4 shrink-0">
                      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-green-400">Proposal Ready</p>
                          <p className="text-sm text-zinc-500">Accept to create your project</p>
                        </div>
                        <button
                          onClick={handleAcceptProposal}
                          className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-medium rounded-full transition-colors"
                        >
                          Accept & Subscribe
                        </button>
                      </div>
                    </div>
                  )}

                  {/* HandCash Payment Banner */}
                  {showPayment && !streaming && (
                    <div className="border-t border-blue-500/20 bg-blue-950/30 px-4 py-4 shrink-0">
                      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium text-blue-400">Setup Fee Required</p>
                          <p className="text-sm text-zinc-500">Pay £999 to start active development</p>
                        </div>
                        <button
                          onClick={handlePayWithHandCash}
                          disabled={isPaymentLoading}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full transition-colors flex items-center gap-2"
                        >
                          {isPaymentLoading ? 'Processing...' : (
                            <>
                              <BsWallet2 size={16} />
                              Pay with HandCash
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rate Limit Warning - Hidden, demo mode handles this now */}

                  {/* Error */}
                  {error && !rateLimited && (
                    <div className="px-4 py-3 bg-red-950/30 border-t border-red-500/20 shrink-0">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}

                  {/* Input - At bottom of card */}
                  <div className={`border-t backdrop-blur-sm p-4 shrink-0 transition-colors duration-300 ${theme === 'light' ? 'border-zinc-200 bg-white/80' : 'border-white/10 bg-black/50'}`}>
                    <div className="max-w-3xl mx-auto">
                      {/* Selected Project Badge in chat view */}
                      {selectedProject! && (
                        <div className="mb-2 flex items-center gap-2">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs">
                            <span className="text-zinc-500">Project:</span>
                            <span className="text-zinc-300">{selectedProject!.title}</span>
                            {selectedProject!.tokenName && (
                              <span className="text-amber-500">{selectedProject!.tokenName}</span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="relative">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={rateLimited ? "Sign in to continue..." : selectedProject! ? `Continue describing ${selectedProject!.title}...` : "Continue describing..."}
                          rows={1}
                          disabled={streaming || rateLimited}
                          className={`w-full border rounded-2xl px-5 py-4 pr-14 focus:outline-none resize-none disabled:opacity-50 transition-colors duration-300 ${theme === 'light'
                            ? 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400'
                            : 'bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20'
                            }`}
                          style={{ minHeight: '56px', maxHeight: '200px' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                          }}
                        />
                        <button
                          onClick={() => sendMessage()}
                          disabled={!input.trim() || streaming}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden border-2 border-amber-500/50 hover:border-amber-400"
                        >
                          {streaming ? (
                            <div className="w-4 h-4 border-2 border-amber-400 border-t-amber-600 rounded-full animate-spin" />
                          ) : (
                            <Image
                              src="/images/blog/kintsugi-bowl.jpg"
                              alt="Send"
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <ConnectWalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
}
