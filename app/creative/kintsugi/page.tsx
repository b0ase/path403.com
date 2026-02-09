'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiSend, FiX, FiMenu, FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useWallet } from '@/contexts/WalletProvider';
import ConnectWalletModal from '@/components/wallet/ConnectWalletModal';
import { BsWallet2 } from 'react-icons/bs';
import {
  Lightbulb,
  Sparkles,
  Wand2,
  Eye,
  Rocket,
  Heart
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isDemo?: boolean;
}

interface CreativeSession {
  sessionId: string;
  sessionCode: string;
  title: string;
  messages: Message[];
  createdAt: string;
  lastActiveAt: string;
}

const SESSIONS_STORAGE_KEY = 'creative_kintsugi_sessions';
const CURRENT_SESSION_KEY = 'creative_kintsugi_current_session';

// What's "broken" that needs repairing with gold?
const BROKEN_ASPECTS = [
  {
    id: 'vision',
    icon: Lightbulb,
    label: 'Vision & Ideas',
    broken: "We're stuck, uninspired, out of ideas",
    repair: 'Blue Sky Sessions',
    gold: 'Fresh perspective and creative possibilities'
  },
  {
    id: 'experience',
    icon: Sparkles,
    label: 'Customer Experience',
    broken: "Our touchpoints are forgettable, frustrating",
    repair: 'Experience Design',
    gold: 'Memorable moments that create fans'
  },
  {
    id: 'brand',
    icon: Wand2,
    label: 'Brand Identity',
    broken: "Our brand feels bland, inconsistent, soulless",
    repair: 'Brand Alchemy',
    gold: 'Identity that people actually feel'
  },
  {
    id: 'digital',
    icon: Eye,
    label: 'Digital Presence',
    broken: "Our digital feels flat, boring, dated",
    repair: 'Immersive Experiences',
    gold: 'Experiences that blur physical and digital'
  },
  {
    id: 'launch',
    icon: Rocket,
    label: 'Launches & Campaigns',
    broken: "Our launches go unnoticed, forgettable",
    repair: 'Launch Concepts',
    gold: 'Buzz that spreads and sticks'
  },
  {
    id: 'relationships',
    icon: Heart,
    label: 'Customer Relationships',
    broken: "It's all transactional, no loyalty",
    repair: 'Customer Delight',
    gold: 'Lifelong fans who spread the word'
  },
];

function generateSessionCode(): string {
  const adjectives = ['golden', 'radiant', 'luminous', 'gilded', 'brilliant', 'gleaming', 'precious', 'refined', 'polished', 'restored'];
  const nouns = ['vessel', 'bowl', 'craft', 'form', 'creation', 'piece', 'work', 'art', 'design', 'vision'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}-${noun}-${num}`;
}

function generateSessionId(): string {
  return `creative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function CreativeKintsugiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionCode, setSessionCode] = useState<string>('');
  const [selectedAspect, setSelectedAspect] = useState<string | null>(null);
  const [showServices, setShowServices] = useState(false);

  const [allSessions, setAllSessions] = useState<CreativeSession[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { isConnected, address, disconnect, provider } = useWallet();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingMessageRef = useRef<string>('');
  const sessionIdRef = useRef<string>('');

  const initializeSession = useCallback(() => {
    const newSession: CreativeSession = {
      sessionId: generateSessionId(),
      sessionCode: generateSessionCode(),
      title: 'Creative Repair',
      messages: [],
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    return newSession;
  }, []);

  useEffect(() => {
    const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const storedCurrentId = localStorage.getItem(CURRENT_SESSION_KEY);
    let sessions: CreativeSession[] = [];

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

  const saveCurrentSession = useCallback((newMessages?: Message[]) => {
    const msgs = newMessages || messages;
    const currentId = sessionIdRef.current;

    setAllSessions(prev => {
      const index = prev.findIndex(s => s.sessionId === currentId);
      let title = index >= 0 ? prev[index].title : 'Creative Repair';

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

      const updatedSession: CreativeSession = {
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
    setSelectedAspect(null);
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

      const response = await fetch('/api/kintsugi/creative-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionCode,
          history: history.slice(0, -1),
          brokenAspect: selectedAspect,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send message';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Use default
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
                if (streamingMessageRef.current.includes('SHOW_SERVICES') ||
                    streamingMessageRef.current.includes('explore our creative services')) {
                  setShowServices(true);
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

  const handleAspectSelect = (aspectId: string) => {
    setSelectedAspect(aspectId);
    const aspect = BROKEN_ASPECTS.find(a => a.id === aspectId);
    if (aspect) {
      sendMessage(`${aspect.broken}. I need help with ${aspect.label.toLowerCase()}.`);
    }
  };

  const renderContent = (content: string) => {
    let cleanContent = content.replace(/PROJECT_NAME:.*(\n|$)/g, '').trim();
    cleanContent = cleanContent.replace(/SHOW_SERVICES.*(\n|$)/g, '').trim();

    if (!cleanContent) return null;

    const lines = cleanContent.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-base font-semibold text-amber-400 mt-4 mb-2">
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
        {/* Sidebar Overlay */}
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

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
          className={`bg-zinc-950/50 border-r border-white/10 flex flex-col z-50 fixed md:relative h-full overflow-hidden`}
          style={{ width: isSidebarOpen ? 260 : 0 }}
        >
          <div className="p-3 w-64 flex flex-col h-full min-w-[260px]">
            <div className="flex items-center justify-between mb-4">
              <button onClick={createNewSession} className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg transition-colors border border-white/10 text-sm">
                <FiPlus /> New Repair
              </button>
              <button onClick={() => setIsSidebarOpen(false)} className="ml-2 p-2 text-zinc-500 hover:text-white">
                <FiX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              <div className="text-xs font-semibold text-zinc-500 mb-2 px-2 uppercase tracking-wider">Sessions</div>
              {allSessions.map(session => (
                <div key={session.sessionId} className="group flex items-center gap-2">
                  <button
                    onClick={() => loadSession(session.sessionId)}
                    className={`flex-1 text-left truncate px-3 py-2 rounded-lg text-sm transition-colors font-mono ${sessionIdRef.current === session.sessionId ? 'bg-amber-900/20 text-amber-200 border border-amber-800/30' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}`}
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
                href="/creative"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <span>View All Services</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative h-full min-w-0">
          {/* Background */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none rounded-r-xl" style={{ backgroundImage: 'url(/images/blog/kintsugi-bowl.jpg)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60 pointer-events-none" />

          {/* Content */}
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
                <Link href="/creative/kintsugi" className="flex items-center gap-2">
                  <Image
                    src="/images/blog/kintsugi-bowl.jpg"
                    alt="Kintsugi"
                    width={28}
                    height={28}
                    className="rounded-full border border-amber-500/50"
                  />
                  <h1 className="text-lg font-light text-amber-100">Creative Kintsugi</h1>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <button onClick={createNewSession} className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-300 transition-colors" title="New Session">
                  <FiPlus size={14} />
                  <span className="hidden sm:inline">New</span>
                </button>
                <div className="w-px h-3 bg-zinc-800 hidden sm:block"></div>
                <Link href="/creative" className="text-zinc-600 hover:text-amber-400 transition-colors">
                  Services
                </Link>
                <Link href="/portfolio" className="text-zinc-600 hover:text-zinc-400 transition-colors">
                  Portfolio
                </Link>
                <button
                  onClick={isConnected ? () => disconnect() : () => setIsWalletModalOpen(true)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${isConnected ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-zinc-400 hover:text-white"}`}
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

          {/* Session Bar */}
          <div className="border-b border-amber-900/20 bg-black/25 backdrop-blur-sm px-4 py-1.5 shrink-0">
            <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span className="uppercase tracking-wider">Session: <span className="text-amber-400/70 select-all">{sessionCode}</span></span>
              {selectedAspect && (
                <span className="text-amber-500/70">Repairing: {BROKEN_ASPECTS.find(a => a.id === selectedAspect)?.label}</span>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!hasMessages ? (
              // Initial view - What's broken?
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-start pt-8 p-4 overflow-y-auto relative"
              >
                {/* Header */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl md:text-5xl font-orbitron font-bold text-amber-100 tracking-wide uppercase mb-3">
                    What Needs Repairing?
                  </h1>
                  <p className="text-zinc-400 text-lg max-w-2xl">
                    Kintsugi is the art of repairing broken pottery with gold, making it more beautiful than before.
                    Let&apos;s explore how we can repair what&apos;s broken in your brand or business — together.
                  </p>
                </div>

                {/* Chatbox - primary input */}
                <div className="w-full max-w-2xl mb-8">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Share what feels broken, and let's find the gold together..."
                      rows={2}
                      className="w-full bg-zinc-900/80 border border-amber-900/30 rounded-2xl px-6 py-5 pr-16 text-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-600/50 resize-none"
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
                </div>

                {/* Or select a common area */}
                <p className="text-zinc-500 text-sm mb-4">Or explore a common area that needs repair:</p>

                {/* Broken Aspects Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mb-6">
                  {BROKEN_ASPECTS.map((aspect) => {
                    const IconComponent = aspect.icon;
                    return (
                      <button
                        key={aspect.id}
                        onClick={() => handleAspectSelect(aspect.id)}
                        className={`p-4 rounded-xl border transition-all text-left hover:scale-[1.02] group ${
                          selectedAspect === aspect.id
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-100'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-amber-700/50 text-zinc-300 hover:bg-zinc-900'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-amber-900/20 group-hover:bg-amber-900/30 transition-colors">
                            <IconComponent className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm mb-1">{aspect.label}</div>
                            <div className="text-xs text-zinc-500 mb-2 italic">&ldquo;{aspect.broken}&rdquo;</div>
                            <div className="text-xs text-amber-600">→ {aspect.repair}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Links */}
                <div className="flex items-center justify-center gap-3 text-zinc-600 text-xs">
                  <Link href="/creative" className="hover:text-amber-400 transition-colors">
                    View all services
                  </Link>
                  <span>·</span>
                  <Link href="/portfolio" className="hover:text-zinc-400 transition-colors">
                    See our work
                  </Link>
                  <span>·</span>
                  <Link href="/contact" className="hover:text-zinc-400 transition-colors">
                    Contact directly
                  </Link>
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
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-900/50 scrollbar-track-transparent">
                  <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                            message.role === 'user'
                              ? 'bg-amber-900/30 text-amber-100 border border-amber-800/30'
                              : message.isDemo
                                ? 'bg-amber-950/30 text-amber-100 border border-amber-900/50'
                                : 'bg-zinc-900/50 text-white border border-zinc-800/50'
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
                            <span className="inline-block w-2 h-4 ml-1 bg-amber-500 animate-pulse rounded-sm" />
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} className="pb-4" />
                  </div>
                </div>

                {/* Show Services Banner */}
                {showServices && !streaming && (
                  <div className="border-t border-amber-500/20 bg-amber-950/30 px-4 py-4 shrink-0">
                    <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-amber-400">Ready to Start Repairing?</p>
                        <p className="text-sm text-zinc-500">Explore our creative services</p>
                      </div>
                      <Link
                        href="/creative"
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-full transition-colors flex items-center gap-2"
                      >
                        <span>View Services</span>
                        <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 bg-red-950/30 border-t border-red-500/20 shrink-0">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                  </div>
                )}

                {/* Input - At bottom of card */}
                <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm p-4 shrink-0">
                  <div className="max-w-3xl mx-auto">
                    {selectedAspect && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs">
                          <span className="text-amber-400">{BROKEN_ASPECTS.find(a => a.id === selectedAspect)?.repair}</span>
                          <button
                            onClick={() => setSelectedAspect(null)}
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
                        placeholder="Tell me more about what needs repairing..."
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
