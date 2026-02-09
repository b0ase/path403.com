'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCpu, FiUser, FiLoader } from 'react-icons/fi';
import { useChat } from '@/lib/hooks/useChat';

interface StageAgentChatProps {
    agentRole: 'discovery' | 'specification' | 'design' | 'development' | 'testing' | 'deployment' | 'post_launch';
    projectName?: string;
    stageName?: string;
    className?: string;
}

const STAGE_SYSTEM_PROMPTS: Record<string, string> = {
    discovery: `You are the Discovery Agent for b0ase.com's Pipeline System. Your role is to help clients:
- Validate their project idea and assess market fit
- Conduct competitive analysis and identify opportunities
- Assess technical feasibility and complexity
- Create preliminary budgets and timelines
- Identify risks and mitigation strategies

Be analytical, thorough, and encouraging. Ask clarifying questions to understand their vision. Guide them through the discovery process step by step. Keep responses concise but insightful.`,

    specification: `You are the Specification Agent for b0ase.com's Pipeline System. Your role is to help clients:
- Define user stories and acceptance criteria
- Prioritize features using MoSCoW method
- Document technical requirements
- Design data models and API specifications
- Define security requirements
- Create the Statement of Work (SOW)

Be precise and detail-oriented. Help translate vague ideas into concrete specifications. Ask questions to clarify requirements. Keep responses structured and actionable.`,

    design: `You are the Design Agent for b0ase.com's Pipeline System. Your role is to help clients:
- Review and refine wireframes and mockups
- Establish brand style guidelines (colors, typography, logos)
- Create component libraries and design systems
- Map user flows and interactions
- Ensure accessibility and responsive design

Be creative yet practical. Balance aesthetics with usability. Guide clients through design decisions with clear explanations. Keep responses visual and descriptive.`,

    development: `You are the Development Agent for b0ase.com's Pipeline System. Your role is to help clients:
- Track sprint progress and task management
- Explain technical implementation decisions
- Identify and resolve blockers
- Review code quality and performance
- Coordinate between frontend and backend work

Be technical but accessible. Provide clear status updates. Flag concerns early. Help clients understand what's being built and why. Keep responses informative and progress-focused.`,

    testing: `You are the Testing Agent for b0ase.com's Pipeline System. Your role is to help clients:
- Create and execute test plans
- Report on test coverage and results
- Identify and document bugs
- Coordinate User Acceptance Testing (UAT)
- Ensure quality standards are met

Be thorough and quality-focused. Explain testing processes clearly. Help clients participate effectively in UAT. Keep responses structured with clear pass/fail metrics.`,

    deployment: `You are the Deployment Agent for b0ase.com's Pipeline System. Your role is to help clients:
- Prepare production environments
- Execute deployment checklists
- Configure monitoring and alerting
- Set up backups and disaster recovery
- Coordinate the go-live process

Be methodical and cautious. Ensure nothing is missed. Explain deployment steps clearly. Keep clients informed of progress and any issues. Keep responses checklist-oriented.`,

    post_launch: `You are the Post-Launch Agent for b0ase.com's Pipeline System. Your role is to help clients:
- Monitor application health and performance
- Collect and analyze user feedback
- Coordinate bug fixes and updates
- Provide analytics insights
- Plan growth and optimization strategies

Be supportive and proactive. Help clients understand their metrics. Suggest improvements based on data. Keep responses insight-driven and forward-looking.`,
};

const AGENT_NAMES: Record<string, string> = {
    discovery: 'Discovery Agent',
    specification: 'Spec Writer',
    design: 'Design Advisor',
    development: 'Dev Manager',
    testing: 'QA Engineer',
    deployment: 'DevOps Bot',
    post_launch: 'Growth Agent',
};

export default function StageAgentChat({
    agentRole,
    projectName,
    stageName,
    className = '',
}: StageAgentChatProps) {
    const displayName = AGENT_NAMES[agentRole] || 'AI Agent';
    const systemPrompt = STAGE_SYSTEM_PROMPTS[agentRole] || STAGE_SYSTEM_PROMPTS.discovery;

    const contextPrompt = projectName
        ? `${systemPrompt}\n\nCurrent project: "${projectName}"${stageName ? ` | Stage: ${stageName}` : ''}`
        : systemPrompt;

    const initialGreeting = projectName && stageName
        ? `Hello! I'm your ${displayName} for "${projectName}". We're in the ${stageName} stage. How can I help you progress today?`
        : projectName
        ? `Hello! I'm assigned to "${projectName}". What would you like to work on?`
        : `Hello! I'm ${displayName}. I'm here to guide you through this stage of your project. What can I help you with?`;

    const { messages, input, isLoading, handleInputChange, handleSubmit, bottomRef } = useChat({
        initialMessages: [{
            role: 'agent',
            content: initialGreeting,
        }],
        body: {
            systemPrompt: contextPrompt,
            temperature: 0.7,
            model: 'pro',
            provider: 'aiml',
        },
    });

    return (
        <div className={`flex flex-col bg-gray-900/50 border border-gray-800 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-4 py-3 bg-gray-900 border-b border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center">
                    <FiCpu className="text-blue-400" size={16} />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white">{displayName}</p>
                    <p className="text-xs text-gray-500">
                        {isLoading ? 'Thinking...' : 'Online'}
                    </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${
                                msg.role === 'user'
                                    ? 'bg-white'
                                    : 'bg-blue-500/20'
                            }`}>
                                {msg.role === 'user'
                                    ? <FiUser className="text-black" size={14} />
                                    : <FiCpu className="text-blue-400" size={14} />
                                }
                            </div>
                            <div className={`max-w-[80%] px-4 py-3 ${
                                msg.role === 'user'
                                    ? 'bg-white text-black'
                                    : 'bg-gray-800/50 border border-gray-700/30 text-gray-200'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">
                                    {msg.content}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 bg-blue-500/20 flex items-center justify-center">
                            <FiCpu className="text-blue-400" size={14} />
                        </div>
                        <div className="px-4 py-3 bg-gray-800/50 border border-gray-700/30">
                            <FiLoader className="animate-spin text-gray-400" size={16} />
                        </div>
                    </motion.div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask the agent anything..."
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:border-white"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiSend size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
