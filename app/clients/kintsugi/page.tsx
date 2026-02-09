'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiSend, FiX, FiMenu, FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletProvider';
import ConnectWalletModal from '@/components/wallet/ConnectWalletModal';
import { BsWallet2 } from 'react-icons/bs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isDemo?: boolean;
  createdAt?: string;
}

// Session data stored in localStorage
interface ClientSession {
  sessionId: string;
  sessionCode: string;
  title: string;
  messages: Message[];
  createdAt: string;
  lastActiveAt: string;
}

const SESSIONS_STORAGE_KEY = 'client_kintsugi_sessions';
const CURRENT_SESSION_KEY = 'client_kintsugi_current_session';

// Service categories that Kintsugi can help with
const SERVICE_CATEGORIES = [
  { id: 'web-app', label: 'Web Application', description: 'Full-stack web apps, dashboards, SaaS platforms' },
  { id: 'mobile-app', label: 'Mobile App', description: 'iOS, Android, or cross-platform applications' },
  { id: 'blockchain', label: 'Blockchain/Web3', description: 'Smart contracts, tokens, DeFi, NFTs' },
  { id: 'ai-ml', label: 'AI/ML Integration', description: 'AI agents, chatbots, data analysis' },
  { id: 'ecommerce', label: 'E-commerce', description: 'Online stores, payment systems, marketplaces' },
  { id: 'api', label: 'API Development', description: 'REST APIs, integrations, microservices' },
  { id: 'design', label: 'UI/UX Design', description: 'Branding, prototypes, design systems' },
  { id: 'other', label: 'Something Else', description: 'Tell us about your unique project' },
];

// Generate a memorable session code
function generateSessionCode(): string {
  const adjectives = ['bright', 'swift', 'bold', 'calm', 'vivid', 'clear', 'warm', 'fresh', 'keen', 'prime'];
  const nouns = ['spark', 'wave', 'beam', 'flow', 'pulse', 'bloom', 'glow', 'rise', 'peak', 'dawn'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

// Generate session ID
function generateSessionId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function ClientKintsugiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Multi-session state
  const [allSessions, setAllSessions] = useState<ClientSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected, address, disconnect, provider } = useWallet();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingMessageRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');

  // initializeSession creates a blank new session
  const initializeSession = useCallback(() => {
    const newSession: ClientSession = {
      sessionId: generateSessionId(),
      sessionCode: generateSessionCode(),
      title: 'New Project Inquiry',
      messages: [],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    return newSession;
  }, []);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const storedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);
    let sessions: ClientSession[] = [];

    if (storedSessions) {
      try {
        sessions = JSON.parse(storedSessions);
      } catch (e) {
        console.error('Failed to load sessions:', e);
      }
    }

    if (sessions.length === 0) {
      const newSession = initializeSession();
      sessions.push(newSession);
    }

    sessions.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
    setAllSessions(sessions);

    let currentSession = sessions.find(s => s.sessionId === storedCurrentId) || sessions[0];
    setMessages(currentSession.messages);
    setSessionCode(currentSession.sessionCode);
    sessionIdRef.current = currentSession.sessionId;
  }, [initializeSession]);

  // Save current state
  const saveCurrentSession = useCallback((newMessages?: Message[]) => {
    const msgs = newMessages || messages;
    const currentId = sessionIdRef.current;

    setAllSessions(prev => {
      const index = prev.findIndex(s => s.sessionId === currentId);
      let title = index >= 0 ? prev[index].title : 'New Project Inquiry';

      // Extract title from conversation
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

      const updatedSession: ClientSession = {
        sessionId: currentId,
        sessionCode: sessionCode,
        title,
        messages: msgs,
        createdAt: index >= 0 ? prev[index].createdAt : new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      const newSessions = [...prev];
      if (index >= 0) {
        newSessions[index] = updatedSession;
      } else {
        newSessions.unshift(updatedSession);
      }

      newSessions.sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime());
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newSessions));
      localStorage.setItem(CURRENT_SESSION_KEY, currentId);
      return newSessions;
    });
  }, [messages, sessionCode]);

  useEffect(() => {
    if (messages.length > 0) {
      saveCurrentSession();
    }
  }, [messages, saveCurrentSession]);

  const loadSession = (sessionId: string) => {
    const session = allSessions.find(s => s.sessionId === sessionId);
    if (session) {
      sessionIdRef.current = session.sessionId;
      setMessages(session.messages);
      setSessionCode(session.sessionCode);
      setIsSidebarOpen(false);
      localStorage.setItem(CURRENT_SESSION_KEY, session.sessionId);
    }
  };

  const createNewSession = () => {
    const newSession = initializeSession();
    setAllSessions(prev => [newSession, ...prev]);
    sessionIdRef.current = newSession.sessionId;
    setMessages([]);
    setSessionCode(newSession.sessionCode);
    setSelectedCategory(null);
    setIsSidebarOpen(false);
    localStorage.setItem(CURRENT_SESSION_KEY, newSession.sessionId);
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const newList = allSessions.filter(s => s.sessionId !== sessionId);
    setAllSessions(newList);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(newList));

    if (sessionId === sessionIdRef.current) {
      if (newList.length > 0) {
        loadSession(newList[0].sessionId);
      } else {
        createNewSession();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming]);

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || streaming) return;

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

      const history = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Use the client-specific API endpoint
      const response = await fetch('/api/kintsugi/client-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionCode,
          history: history.slice(0, -1),
          category: selectedCategory,
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

                // Detect PROJECT_NAME tag
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
              } else if (data.type === 'done') {
                // Check if assistant suggests moving to formal signup
                if (streamingMessageRef.current.includes('READY_FOR_SIGNUP') ||
                    streamingMessageRef.current.includes('proceed to the formal')) {
                  setShowForm(true);
                }
                saveCurrentSession();
              } else if (data.type === 'error') {
                setError(data.error || 'An error occurred');
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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const category = SERVICE_CATEGORIES.find(c => c.id === categoryId);
    if (category) {
      sendMessage(`I'm interested in ${category.label.toLowerCase()} - ${category.description.toLowerCase()}`);
    }
  };

  // Render markdown-like content
  const renderContent = (content: string) => {
    let cleanContent = content.replace(/PROJECT_NAME:.*(\n|$)/g, '').trim();
    cleanContent = cleanContent.replace(/READY_FOR_SIGNUP.*(\n|$)/g, '').trim();

    if (!cleanContent) return null;

    const lines = cleanContent.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith('## ')) {
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
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="text-zinc-300 ml-4 my-1">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() && !line.startsWith('---')) {
        elements.push(
          <p key={i} className="text-zinc-300 my-1 leading-relaxed">{line}</p>
        );
      }
    });

    return elements;
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-black font-sans text-white">
      {/* Content Card - matches navbar styling */}
      <div className="fixed top-[140px] md:top-[160px] bottom-6 left-4 right-4 md:left-12 md:right-12 bg-black/90 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden flex">
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
          className={`bg-zinc-950/50 border-r border-white/10 flex flex-col z-50 fixed md:relative h-full overflow-hidden`}
          style={{ width: isSidebarOpen ? 260 : 0 }}
        >
          <div className="p-3 w-64 flex flex-col h-full min-w-[260px]">
            <div className="flex items-center justify-between mb-4">
              <button onClick={createNewSession} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg transition-colors border border-white/10 text-sm">
                <FiPlus /> New Inquiry
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="ml-2 p-2 text-zinc-500 hover:text-white">
                <FiX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Conversations</div>
              {allSessions.map(session => (
                <div key={session.sessionId} className="group flex items-center gap-2">
                  <button
                    onClick={() => loadSession(session.sessionId)}
                    className={`flex-1 text-left truncate px-3 py-2 rounded-lg text-sm transition-colors font-mono ${sessionIdRef.current === session.sessionId ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
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

            <div className="pt-3 border-t border-white/10 mt-auto">
              <Link
                href="/clients"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <span>Go to Full Form</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-full min-w-0">
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none rounded-r-xl" style={{ backgroundImage: 'url(/images/blog/kintsugi-bowl.jpg)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60 pointer-events-none" />

          {/* Content Wrapper */}
          <div className="flex-1 flex flex-col relative z-10 w-full max-w-full overflow-hidden">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/30 backdrop-blur-md px-4 pt-2 pb-2 shrink-0">
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="mr-2 p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-800 transition-colors"
                  >
                    <FiMenu size={18} />
                  </button>
                )}
                <Link href="/clients/kintsugi" className="flex items-center gap-2">
                  <Image
                    src="/images/blog/kintsugi-bowl.jpg"
                    alt="Kintsugi"
                    width={28}
                    height={28}
                    className="rounded-full border border-amber-500/30"
                  />
                  <h1 className="text-lg font-light text-white">Client Onboarding</h1>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <button onClick={createNewSession} className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors" title="New Inquiry">
                  <FiPlus size={14} />
                  <span className="hidden sm:inline">New</span>
                </button>
                <div className="w-px h-3 bg-zinc-800 hidden sm:block"></div>
                <Link href="/services" className="text-zinc-600 hover:text-zinc-400 transition-colors">
                  Services
                </Link>
                <Link href="/portfolio" className="text-zinc-600 hover:text-zinc-400 transition-colors">
                  Portfolio
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

          {/* Session Code Bar */}
          <div className="border-b border-zinc-900/50 bg-black/25 backdrop-blur-sm px-4 py-1.5 shrink-0">
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="uppercase tracking-wider">Session: <span className="text-zinc-400 select-all">{sessionCode}</span></span>
              {selectedCategory && (
                <span className="text-amber-500/70">Category: {SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!hasMessages ? (
              // Initial view with category selection
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-start pt-8 p-4 overflow-y-auto relative"
              >
                <div className="text-center mb-8">
                  <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white tracking-wide uppercase mb-3">
                    What Can We Build?
                  </h1>
                  <p className="text-zinc-400 text-lg max-w-xl">
                    Tell me about your project and I&apos;ll help you understand what&apos;s possible, estimate scope, and connect you with the right services.
                  </p>
                </div>

                {/* Category Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mb-8">
                  {SERVICE_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`p-4 rounded-xl border transition-all text-left hover:scale-[1.02] ${
                        selectedCategory === category.id
                          ? 'bg-amber-500/10 border-amber-500/50 text-amber-100'
                          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="font-medium text-sm mb-1">{category.label}</div>
                      <div className="text-xs text-zinc-500">{category.description}</div>
                    </button>
                  ))}
                </div>

                <div className="w-full max-w-2xl">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Or describe your project in your own words..."
                      rows={2}
                      className="w-full bg-zinc-900/80 border border-zinc-700 rounded-2xl px-6 py-5 pr-16 text-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
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
                  </div>

                  <div className="flex items-center justify-center gap-3 text-zinc-600 text-xs mt-4">
                    <Link href="/clients" className="hover:text-amber-400 transition-colors">
                      Skip to full form
                    </Link>
                    <span>·</span>
                    <Link href="/services" className="hover:text-zinc-400 transition-colors">
                      Browse services
                    </Link>
                    <span>·</span>
                    <Link href="/portfolio" className="hover:text-zinc-400 transition-colors">
                      See our work
                    </Link>
                  </div>
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
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                            message.role === 'user'
                              ? 'bg-zinc-800 text-white'
                              : message.isDemo
                                ? 'bg-amber-950/30 text-amber-100 border border-amber-900/50'
                                : 'bg-zinc-900/50 text-white'
                          }`}
                        >
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
                    <div ref={messagesEndRef} className="pb-24" />
                  </div>
                </div>

                {/* Ready for Signup Banner */}
                {showForm && !streaming && (
                  <div className="border-t border-amber-900/30 bg-amber-950/20 px-4 py-4">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-amber-400">Ready to Get Started?</p>
                        <p className="text-sm text-zinc-500">Complete the formal project intake form</p>
                      </div>
                      <Link
                        href="/clients"
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-full transition-colors flex items-center gap-2"
                      >
                        <span>Continue to Form</span>
                        <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 bg-red-950/30 border-t border-red-900/30">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Input - At bottom of card */}
                <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm p-4 shrink-0">
                  <div className="max-w-3xl mx-auto">
                    {selectedCategory && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs">
                          <span className="text-amber-400">{SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.label}</span>
                          <button
                            onClick={() => setSelectedCategory(null)}
                            className="text-amber-500/50 hover:text-amber-400"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your project needs..."
                        rows={1}
                        disabled={streaming}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 resize-none disabled:opacity-50"
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
