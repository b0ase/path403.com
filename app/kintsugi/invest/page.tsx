'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

import { useColorTheme } from '@/components/ThemePicker';

export default function KintsugiInvestPage() {
  const { colorTheme } = useColorTheme();
  const isDark = colorTheme === 'black';
  const theme = isDark ? 'dark' : 'light';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<string>('');

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

      const response = await fetch('/api/kintsugi/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionCode: 'invest-inquiry',
          history: history.slice(0, -1),
          context: 'investor_inquiry',
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

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
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = streamingMessageRef.current;
                  }
                  return newMessages;
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
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

  const hasMessages = messages.length > 0;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-black'}`}>
      {/* Custom gold glow styles */}
      <style jsx global>{`
        .gold-glow {
          color: #ffd700;
          text-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3), 0 0 30px rgba(255, 215, 0, 0.2);
        }
        .gold-glow-subtle {
          color: #ffd700;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
        }
        .gold-text {
          color: #ffd700;
        }
        .gold-border {
          border-color: #ffd700;
        }
        .gold-bg {
          background-color: #ffd700;
        }
      `}</style>

      {/* Content Card */}
      <div className={`fixed top-[140px] md:top-[160px] bottom-6 left-4 right-4 md:left-12 md:right-12 border backdrop-blur-md rounded-xl overflow-hidden flex flex-col transition-colors duration-500 ${isDark ? 'bg-black/90 border-white/10' : 'bg-white/95 border-zinc-200 shadow-2xl'}`}>
        {/* Background */}
        <div className={`absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none rounded-xl transition-all duration-500 ${isDark ? 'opacity-30' : 'opacity-10'}`} style={{ backgroundImage: 'url(/images/blog/kintsugi-bowl.jpg)', filter: isDark ? 'none' : 'grayscale(100%)' }} />
        <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${isDark ? 'bg-gradient-to-b from-transparent via-black/60 to-black/90' : 'bg-gradient-to-b from-transparent via-white/50 to-white/80'}`} />

        {/* Header */}
        <div className={`border-b ${isDark ? 'border-white/10 bg-black/30' : 'border-zinc-200 bg-white/50'} backdrop-blur-md px-4 py-2 shrink-0 relative z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/kintsugi" className="text-sm font-orbitron gold-text hover:gold-glow transition-all">Kintsugi</Link>
              <span className={isDark ? 'text-zinc-600' : 'text-zinc-400'}>·</span>
              <span className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-xs uppercase font-mono tracking-widest`}>Investment</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono uppercase">
              <span className="gold-text">£150K @ £1M</span>
              <a
                href="mailto:richard@b0ase.com?subject=Kintsugi Investment"
                className="px-3 py-1 gold-bg text-black font-black tracking-widest text-[10px] hover:opacity-90 rounded-sm"
              >
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-8">
              {/* Hero */}
              <div className="text-center mb-12">
                <h1 className="text-5xl md:text-7xl font-orbitron font-bold tracking-[0.15em] uppercase gold-glow mb-6">
                  Kintsugi
                </h1>
                <p className={`text-xl md:text-2xl ${isDark ? 'text-zinc-300' : 'text-zinc-800'} mb-4 font-light`}>
                  AI-powered repair for vibe-coded apps
                </p>
                <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-600'} max-w-xl mx-auto text-sm leading-relaxed`}>
                  Millions of apps are being built with AI. Most are 80% done and broken. Kintsugi analyzes what's wrong and fixes it.
                </p>
              </div>

              {/* The Problem */}
              <div className={`mb-12 p-8 border ${isDark ? 'border-white/10 bg-white/5' : 'border-zinc-200 bg-zinc-50'} rounded-2xl`}>
                <h2 className="gold-text text-xs font-black uppercase tracking-[0.2em] mb-6">The Problem</h2>
                <div className="space-y-4">
                  <p className={`${isDark ? 'text-zinc-300' : 'text-zinc-800'} leading-relaxed`}>
                    <span className={`${isDark ? 'text-white' : 'text-black'} font-bold`}>Vibe coding is exploding.</span> Non-developers are building apps with ChatGPT, Claude, Cursor, Replit. The barrier to starting is gone.
                  </p>
                  <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'} leading-relaxed`}>
                    But finishing is hard. These apps hit walls: broken auth, database issues, deployment failures, security holes, features that don't quite work. The vibe coder doesn't know how to fix them. Hiring a developer is expensive and slow.
                  </p>
                  <p className={`${isDark ? 'text-zinc-300' : 'text-zinc-800'} leading-relaxed`}>
                    <span className={`${isDark ? 'text-white' : 'text-black'} font-bold`}>Result:</span> Millions of 80%-done apps that will never ship.
                  </p>
                </div>
              </div>

              {/* The Solution */}
              <div className={`mb-12 p-8 border gold-border ${isDark ? 'bg-yellow-500/5' : 'bg-yellow-500/10'} rounded-2xl shadow-xl shadow-yellow-500/5`}>
                <h2 className="gold-glow-subtle text-xs font-black uppercase tracking-[0.2em] mb-6">The Solution</h2>
                <p className={`${isDark ? 'text-zinc-300' : 'text-zinc-800'} leading-relaxed mb-8`}>
                  Kintsugi analyzes broken codebases, identifies issues, and fixes them. Like the Japanese art of repairing pottery with gold — we don't rebuild, we repair.
                </p>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center group">
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔍</div>
                    <h3 className={`${isDark ? 'text-white' : 'text-black'} text-xs font-black uppercase tracking-widest mb-2`}>Analyze</h3>
                    <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-[10px] leading-relaxed`}>AI scans your codebase for issues</p>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">🔧</div>
                    <h3 className={`${isDark ? 'text-white' : 'text-black'} text-xs font-black uppercase tracking-widest mb-2`}>Diagnose</h3>
                    <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-[10px] leading-relaxed`}>Identifies what's broken and why</p>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">✨</div>
                    <h3 className={`${isDark ? 'text-white' : 'text-black'} text-xs font-black uppercase tracking-widest mb-2`}>Repair</h3>
                    <p className={`${isDark ? 'text-zinc-500' : 'text-zinc-500'} text-[10px] leading-relaxed`}>Fixes issues with working code</p>
                  </div>
                </div>
              </div>

              {/* Market */}
              <div className="mb-12">
                <h2 className="gold-text text-sm font-semibold uppercase tracking-widest mb-4">The Market</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/10 p-4 text-center">
                    <div className="text-2xl font-orbitron gold-text">10M+</div>
                    <div className="text-[10px] text-zinc-500 uppercase mt-1">Cursor users</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 text-center">
                    <div className="text-2xl font-orbitron gold-text">100M+</div>
                    <div className="text-[10px] text-zinc-500 uppercase mt-1">ChatGPT coders</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 text-center">
                    <div className="text-2xl font-orbitron gold-text">∞</div>
                    <div className="text-[10px] text-zinc-500 uppercase mt-1">Broken apps</div>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm mt-4 text-center">
                  Every vibe coder who's ever said "it's almost working" is a potential customer.
                </p>
              </div>

              {/* Traction / Proof */}
              <div className="mb-12 p-6 border border-white/10 bg-white/5">
                <h2 className="gold-text text-sm font-semibold uppercase tracking-widest mb-4">Proof: Dogfooding on 60+ Apps</h2>
                <p className="text-zinc-400 mb-4">
                  We built Kintsugi to solve our own problem. b0ase has 60+ internal apps — many vibe-coded, many broken. We're using Kintsugi to repair them before opening to the public.
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-black/30 border border-white/10 p-3 text-center">
                    <div className="text-lg font-orbitron gold-text">60+</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Apps</div>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-3 text-center">
                    <div className="text-lg font-orbitron gold-text">~85%</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Platform</div>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-3 text-center">
                    <div className="text-lg font-orbitron gold-text">92%</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Agents</div>
                  </div>
                  <div className="bg-black/30 border border-white/10 p-3 text-center">
                    <div className="text-lg font-orbitron gold-text">Live</div>
                    <div className="text-[9px] text-zinc-500 uppercase">Testing</div>
                  </div>
                </div>
              </div>

              {/* Expandable Investment Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:border-[#ffd700]/30 transition-colors mb-4"
              >
                <span className="gold-text text-sm font-semibold">View Investment Details</span>
                {showDetails ? <FiChevronUp className="gold-text" /> : <FiChevronDown className="gold-text" />}
              </button>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 mb-8"
                >
                  {/* The Offer */}
                  <div className="border gold-border p-6">
                    <h3 className="gold-glow-subtle text-sm font-semibold mb-4">The Offer</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase mb-1">Raising</p>
                        <p className="text-xl font-orbitron gold-text">£150K</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase mb-1">Valuation</p>
                        <p className="text-xl font-orbitron text-white">£1M</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase mb-1">Equity</p>
                        <p className="text-xl font-orbitron gold-text">15%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-zinc-500 uppercase mb-1">Minimum</p>
                        <p className="text-xl font-orbitron text-white">£10K</p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-white text-xs font-semibold mb-3">Use of Funds</h4>
                      {[
                        { label: 'AI Infrastructure', desc: '10x Mac Studio Pro cluster', amount: '£75K' },
                        { label: 'Development', desc: 'Complete repair engine', amount: '£35K' },
                        { label: 'Operations', desc: '12 months runway', amount: '£25K' },
                        { label: 'Marketing', desc: 'Vibe coder acquisition', amount: '£15K' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                          <div>
                            <span className="text-zinc-300">{item.label}</span>
                            <span className="text-zinc-600 text-xs ml-2">({item.desc})</span>
                          </div>
                          <span className="text-white font-mono">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Model */}
                  <div className="bg-white/5 border border-white/10 p-6">
                    <h3 className="gold-glow-subtle text-sm font-semibold mb-4">Revenue Model</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xl font-orbitron gold-text mb-1">£99-499</div>
                        <h4 className="text-white text-sm font-semibold">Per repair</h4>
                        <p className="text-zinc-500 text-xs">Based on codebase size/complexity</p>
                      </div>
                      <div>
                        <div className="text-xl font-orbitron gold-text mb-1">£49/mo</div>
                        <h4 className="text-white text-sm font-semibold">Subscription</h4>
                        <p className="text-zinc-500 text-xs">Ongoing maintenance & monitoring</p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="text-center pt-4">
                    <p className="text-2xl font-orbitron font-bold gold-glow mb-2">£10,000 = 1%</p>
                    <p className="text-zinc-500 text-sm mb-4">Ground floor of AI-powered app repair</p>
                    <a
                      href="mailto:richard@b0ase.com?subject=Kintsugi Investment"
                      className="inline-block px-6 py-2 gold-bg text-black font-semibold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
                    >
                      Request Deck
                    </a>
                  </div>
                </motion.div>
              )}

              {/* Suggested Questions */}
              {!hasMessages && (
                <div className="mt-8">
                  <p className="text-zinc-600 text-xs uppercase tracking-widest mb-3">Ask about Kintsugi</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'How is this different from Cursor?',
                      'What types of apps can you fix?',
                      'How does the repair process work?',
                      'What\'s the timeline to launch?',
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-[#ffd700]/30 text-zinc-400 hover:text-white text-xs transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {hasMessages && (
                <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                  <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">Conversation</p>
                  {messages.map((message, index) => (
                    <div
                      key={message.id || index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                          ? 'bg-white/10 text-white border border-white/10'
                          : 'bg-[#ffd700]/10 text-white border border-[#ffd700]/20'
                          }`}
                      >
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        {message.role === 'assistant' && streaming && index === messages.length - 1 && (
                          <span className="inline-block w-2 h-4 ml-1 bg-[#ffd700] animate-pulse rounded-sm" />
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-white/10 bg-black/50 backdrop-blur-sm p-4 shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Kintsugi..."
                  rows={1}
                  disabled={streaming}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#ffd700]/50 rounded-2xl px-5 py-4 pr-14 text-white placeholder:text-zinc-600 focus:outline-none resize-none disabled:opacity-50"
                  style={{ minHeight: '56px', maxHeight: '120px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden border-2 border-[#ffd700]/50 hover:border-[#ffd700]"
                >
                  {streaming ? (
                    <div className="w-4 h-4 border-2 border-[#ffd700] border-t-transparent rounded-full animate-spin" />
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
              <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-600">
                <span>Powered by Kintsugi AI</span>
                <Link href="/kintsugi" className="gold-text hover:underline">Try it yourself →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
