'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCpu, FiUser, FiLoader } from 'react-icons/fi';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface DemoAgentChatProps {
    agentName?: string;
    agentRole?: 'discovery' | 'specification' | 'design' | 'development' | 'testing' | 'deployment' | 'support';
    projectName?: string;
    stageName?: string;
    initialMessage?: string;
    className?: string;
}

// Demo responses based on context
const DEMO_RESPONSES: Record<string, string[]> = {
    discovery: [
        "I've analyzed your project idea. Based on current market trends, there's strong demand in this space. Let me outline the key competitors and opportunities I've identified...",
        "Great question! For market validation, I recommend we focus on three areas: 1) Target audience research, 2) Competitor analysis, and 3) Technical feasibility. Which would you like to explore first?",
        "I've completed the initial feasibility assessment. Your project is technically viable with the b0ase.com stack. Estimated complexity: Medium. Shall I generate a preliminary requirements document?",
        "Based on our discussion, I recommend proceeding to the Specification stage. I'll prepare a summary of our discoveries for the next phase. Ready to move forward?",
    ],
    specification: [
        "Let's define your core features. I'll help you prioritize using the MoSCoW method (Must have, Should have, Could have, Won't have). What's the #1 feature your users absolutely need?",
        "I've drafted the initial user stories based on our conversation. Here are the top 5 critical paths... Would you like me to elaborate on any of these?",
        "For the data model, I'm proposing 8 core entities. The relationships look clean. Shall I generate the ER diagram and share it with you?",
        "Excellent progress! The specification is 80% complete. Remaining items: API endpoints definition and security requirements. Let's tackle those next.",
    ],
    design: [
        "I've reviewed successful designs in your industry. I'm seeing patterns around: minimal navigation, bold typography, and dark themes. Does this align with your brand vision?",
        "Based on the spec, I've outlined 12 key screens for your MVP. Let me walk you through the user flow from landing to conversion...",
        "The wireframes are ready for review. I've applied your brand colors and typography. Want me to generate high-fidelity mockups next?",
        "Design system complete! We have: 24 components, 5 color variants, and responsive breakpoints defined. Ready to hand off to development.",
    ],
    development: [
        "I'm tracking 47 tasks across 6 sprints. Current velocity suggests we'll hit the MVP target. Here's today's priority queue...",
        "The backend API is 60% complete. I've flagged 3 potential performance bottlenecks in the current implementation. Want me to elaborate?",
        "Code review complete. I found 2 security concerns and 5 optimization opportunities. None are blockers, but I recommend addressing them before testing.",
        "Build successful! All 127 tests passing. Performance benchmarks look good. Ready to move to the testing phase?",
    ],
    testing: [
        "I've generated 45 test cases covering critical user paths. Automated tests are running now. ETA: 12 minutes for full suite.",
        "Test results in: 98.2% pass rate. 3 edge cases failed - all related to timezone handling. I've created tickets for the fixes.",
        "Security scan complete. No critical vulnerabilities found. 2 medium-severity items flagged for review. Overall: Ready for UAT.",
        "UAT checklist prepared. I've identified 8 key scenarios for client testing. Shall I schedule the testing session?",
    ],
    deployment: [
        "Pre-deployment checklist: 12/15 items complete. Remaining: SSL certificate, DNS propagation, and monitoring setup.",
        "I've configured the production environment. Auto-scaling is enabled, backups are scheduled, and monitoring is active.",
        "Deployment successful! The application is live at your domain. I'm monitoring for any issues. First 100 requests look healthy.",
        "Post-launch status: 99.9% uptime, average response time 142ms, 0 errors in the last hour. Congratulations on the launch!",
    ],
    support: [
        "I'm here to help! I can assist with technical questions, project guidance, or connect you with the b0ase team. What do you need?",
        "I've reviewed your request. This looks like a standard integration question. Here's the recommended approach...",
        "Good news - I can help resolve this directly. Let me walk you through the solution step by step.",
        "I've logged your feedback and created a ticket for the team. Average resolution time is 24 hours. Anything else I can help with?",
    ],
};

const AGENT_NAMES: Record<string, string> = {
    discovery: 'Discovery Agent',
    specification: 'Spec Writer',
    design: 'Design Advisor',
    development: 'Dev Manager',
    testing: 'QA Engineer',
    deployment: 'DevOps Bot',
    support: 'Support Agent',
};

export default function DemoAgentChat({
    agentName,
    agentRole = 'support',
    projectName,
    stageName,
    initialMessage,
    className = '',
}: DemoAgentChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const responseIndex = useRef(0);

    const displayName = agentName || AGENT_NAMES[agentRole] || 'AI Agent';
    const responses = DEMO_RESPONSES[agentRole] || DEMO_RESPONSES.support;

    // Add initial message on mount
    useEffect(() => {
        const greeting = initialMessage || getContextualGreeting();
        setMessages([{
            id: '0',
            role: 'assistant',
            content: greeting,
            timestamp: new Date(),
        }]);
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function getContextualGreeting(): string {
        if (projectName && stageName) {
            return `Hello! I'm your ${displayName} for "${projectName}". We're currently in the ${stageName} stage. How can I help you progress today?`;
        }
        if (projectName) {
            return `Hello! I'm assigned to "${projectName}". What would you like to work on?`;
        }
        return `Hello! I'm ${displayName}. I'm here to guide you through your project. What can I help you with?`;
    }

    function getDemoResponse(): string {
        const response = responses[responseIndex.current % responses.length];
        responseIndex.current += 1;
        return response;
    }

    async function handleSend() {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: getDemoResponse(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
    }

    return (
        <div className={`flex flex-col bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FiCpu className="text-blue-400" size={16} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white">{displayName}</p>
                    <p className="text-xs text-gray-500">
                        {isTyping ? 'Typing...' : 'Online'}
                        <span className="ml-2 text-yellow-500">(Demo Mode)</span>
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                                msg.role === 'user'
                                    ? 'bg-green-500/20'
                                    : 'bg-blue-500/20'
                            }`}>
                                {msg.role === 'user'
                                    ? <FiUser className="text-green-400" size={14} />
                                    : <FiCpu className="text-blue-400" size={14} />
                                }
                            </div>
                            <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
                                msg.role === 'user'
                                    ? 'bg-green-900/30 border border-green-700/30'
                                    : 'bg-gray-800/50 border border-gray-700/30'
                            }`}>
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <FiCpu className="text-blue-400" size={14} />
                        </div>
                        <div className="px-4 py-3 bg-gray-800/50 border border-gray-700/30 rounded-lg">
                            <FiLoader className="animate-spin text-gray-400" size={16} />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask the agent anything..."
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
                        disabled={isTyping}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isTyping}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSend size={18} />
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-2 text-center">
                    Demo mode - responses are simulated. Connect API for real AI.
                </p>
            </div>
        </div>
    );
}
