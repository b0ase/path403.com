'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FiArrowLeft,
    FiArrowRight,
    FiGlobe,
    FiSmartphone,
    FiBox,
    FiCpu,
    FiShoppingCart,
    FiTrendingUp,
    FiZap,
} from 'react-icons/fi';
import StageAgentChat from '@/components/pipeline/StageAgentChat';

interface ProjectCategory {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    examples: string[];
    priceRange: string;
    timeline: string;
}

const PROJECT_CATEGORIES: ProjectCategory[] = [
    {
        id: 'web-app',
        name: 'Web Application',
        description: 'Full-stack web applications with modern frameworks',
        icon: <FiGlobe size={24} />,
        examples: ['SaaS Platform', 'Dashboard', 'Marketplace', 'Portal'],
        priceRange: '£5,000 - £50,000',
        timeline: '4-16 weeks',
    },
    {
        id: 'mobile-app',
        name: 'Mobile App',
        description: 'Native or cross-platform mobile applications',
        icon: <FiSmartphone size={24} />,
        examples: ['iOS App', 'Android App', 'React Native', 'Flutter'],
        priceRange: '£8,000 - £60,000',
        timeline: '6-20 weeks',
    },
    {
        id: 'blockchain',
        name: 'Blockchain / Web3',
        description: 'Token launches, NFTs, smart contracts, DApps',
        icon: <FiBox size={24} />,
        examples: ['Token Launch', 'NFT Platform', 'DEX', 'DAO'],
        priceRange: '£10,000 - £80,000',
        timeline: '8-24 weeks',
    },
    {
        id: 'ai-ml',
        name: 'AI / ML Integration',
        description: 'AI-powered features, chatbots, automation',
        icon: <FiCpu size={24} />,
        examples: ['Chatbot', 'Recommendation Engine', 'Image Analysis', 'NLP'],
        priceRange: '£5,000 - £40,000',
        timeline: '4-12 weeks',
    },
    {
        id: 'ecommerce',
        name: 'E-Commerce',
        description: 'Online stores, payment integration, inventory',
        icon: <FiShoppingCart size={24} />,
        examples: ['Shopify Store', 'Custom Store', 'Subscription Box', 'B2B'],
        priceRange: '£3,000 - £30,000',
        timeline: '3-12 weeks',
    },
    {
        id: 'automation',
        name: 'Business Automation',
        description: 'Workflow automation, integrations, bots',
        icon: <FiZap size={24} />,
        examples: ['CRM Integration', 'Email Automation', 'Social Posting', 'Reports'],
        priceRange: '£2,000 - £20,000',
        timeline: '2-8 weeks',
    },
];

export default function NewProjectPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [projectName, setProjectName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [showChat, setShowChat] = useState(false);

    const handleCreateProject = () => {
        // In demo mode, generate a slug and redirect
        const slug = projectName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || `project-${Date.now()}`;

        router.push(`/pipeline/${slug}`);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="px-4 md:px-8 py-16">
                {/* Header */}
                <Link
                    href="/pipeline"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
                >
                    <FiArrowLeft />
                    <span>Back to Pipeline</span>
                </Link>

                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">
                        Start New Project
                    </h1>
                    <p className="text-white/60">
                        Tell us about your project and our AI agents will guide you through every step.
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex items-center gap-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                step >= s ? 'bg-white text-black' : 'bg-white/10 text-white/40'
                            }`}>
                                {s}
                            </div>
                            {s < 3 && (
                                <div className={`w-16 h-0.5 ${step > s ? 'bg-white' : 'bg-white/10'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Area */}
                    <div className="lg:col-span-2">
                        {/* Step 1: Project Info */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm uppercase tracking-wider text-white/60 mb-2">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="My Awesome App"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm uppercase tracking-wider text-white/60 mb-4">
                                        Project Category
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {PROJECT_CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`p-4 rounded-lg border text-left transition-all ${
                                                    selectedCategory === cat.id
                                                        ? 'bg-white/10 border-white'
                                                        : 'bg-white/5 border-white/20 hover:border-white/40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`p-2 rounded ${
                                                        selectedCategory === cat.id
                                                            ? 'bg-white text-black'
                                                            : 'bg-white/10'
                                                    }`}>
                                                        {cat.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">{cat.name}</p>
                                                        <p className="text-xs text-white/60">{cat.priceRange}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-white/60">{cat.description}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!projectName || !selectedCategory}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue
                                    <FiArrowRight />
                                </button>
                            </motion.div>
                        )}

                        {/* Step 2: Description */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm uppercase tracking-wider text-white/60 mb-2">
                                        Describe Your Project
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell us about your idea, target audience, key features, and goals..."
                                        rows={6}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm uppercase tracking-wider text-white/60 mb-2">
                                        Budget Range
                                    </label>
                                    <select
                                        value={budget}
                                        onChange={(e) => setBudget(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                                    >
                                        <option value="">Select a budget range</option>
                                        <option value="under-5k">Under £5,000</option>
                                        <option value="5k-15k">£5,000 - £15,000</option>
                                        <option value="15k-30k">£15,000 - £30,000</option>
                                        <option value="30k-50k">£30,000 - £50,000</option>
                                        <option value="50k-plus">£50,000+</option>
                                    </select>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="px-6 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!description}
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue
                                        <FiArrowRight />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review & Create */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <div className="bg-white/5 border border-white/20 rounded-lg p-6 space-y-4">
                                    <h3 className="text-lg font-bold uppercase tracking-tight">Project Summary</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-white/60 uppercase tracking-wider">Name</p>
                                            <p className="font-bold">{projectName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/60 uppercase tracking-wider">Category</p>
                                            <p className="font-bold">
                                                {PROJECT_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/60 uppercase tracking-wider">Budget</p>
                                            <p className="font-bold">{budget || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-white/60 uppercase tracking-wider">Est. Timeline</p>
                                            <p className="font-bold">
                                                {PROJECT_CATEGORIES.find(c => c.id === selectedCategory)?.timeline}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Description</p>
                                        <p className="text-sm text-white/80">{description}</p>
                                    </div>
                                </div>

                                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                                    <p className="text-sm text-blue-300">
                                        <strong>Demo Mode:</strong> Your project will be created with simulated data.
                                        In production, this information would be sent to our Discovery Agent for initial analysis.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-6 py-3 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleCreateProject}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <FiZap />
                                        Create Project & Start Pipeline
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Agent Chat Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <h3 className="text-sm uppercase tracking-wider text-white/60 mb-4">
                                Need Help? Ask Our Agent
                            </h3>
                            <StageAgentChat
                                agentRole="discovery"
                                projectName={projectName || undefined}
                                stageName="Project Setup"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
