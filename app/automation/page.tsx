'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiSmartphone, FiCreditCard, FiZap, FiCpu, FiSend, FiTrendingUp, FiBarChart2, FiTarget, FiUsers, FiArrowRight, FiCheck, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AutomationPage() {
    const [isDark] = useState(true);

    const problems = [
        {
            title: "Time-Intensive Content Creation",
            description: "You're spending 20-40 hours per week just creating and managing content across platforms, leaving no time for strategy or growth."
        },
        {
            title: "Platform Fragmentation",
            description: "Each platform requires different formats, posting schedules, and engagement strategies. Managing them manually is overwhelming."
        },
        {
            title: "Revenue Inefficiency",
            description: "You're using multiple disconnected tools for content, scheduling, analytics, and monetization, paying £100-300/month total."
        },
        {
            title: "Creator Burnout",
            description: "The constant cycle of create → format → post → analyze → repeat across 5+ platforms is exhausting and unsustainable."
        }
    ];

    const services = [
        {
            number: "01",
            title: "AI Content Generation & Adaptation",
            description: "Advanced AI systems transform your creative vision into multi-platform content optimized for each channel",
            features: ["Single prompt → multiple content formats", "AI video generation (Runway, Synthesia)", "Voice synthesis in multiple languages", "Platform-optimized content sizing", "Brand-consistent styling", "SEO optimization"],
            deliverable: "Complete content suite from one creative brief"
        },
        {
            number: "02",
            title: "Intelligent Distribution Management",
            description: "Intelligent automation manages posting schedules and engagement across all your channels",
            features: ["10+ platform integrations", "Smart scheduling optimization", "Auto-tagging and hashtag generation", "Cross-platform story coordination", "Engagement assistance", "Real-time performance monitoring"],
            deliverable: "Managed posting schedule across all platforms"
        },
        {
            number: "03",
            title: "Revenue Optimization",
            description: "Maximize your earning potential through smart monetization strategies",
            features: ["Affiliate link optimization", "Sponsorship opportunity matching", "Membership tier management", "Product placement strategy", "Revenue diversification", "Performance-based recommendations"],
            deliverable: "Increased revenue through optimized monetization"
        },
        {
            number: "04",
            title: "Unified Analytics & Strategy",
            description: "Complete performance insights and growth recommendations",
            features: ["Cross-platform analytics", "AI-assisted insights", "Audience growth tracking", "Content performance analysis", "Revenue attribution", "Competitive intelligence"],
            deliverable: "Data-driven strategy for sustainable growth"
        }
    ];

    const packages = [
        {
            tier: "Starter",
            price: "£297",
            period: "/month",
            description: "Perfect for solo creators ready to scale",
            features: ["3 platforms managed", "20 posts per month", "Basic AI content generation", "Standard scheduling", "Monthly performance report", "Email support"],
            highlight: false
        },
        {
            tier: "Professional",
            price: "£597",
            period: "/month",
            description: "For serious creators and small teams",
            features: ["5+ platforms managed", "Unlimited posts", "Advanced AI features", "Revenue optimization", "Weekly strategy sessions", "Priority support", "Custom integrations"],
            highlight: true
        },
        {
            tier: "Enterprise",
            price: "£1,497",
            period: "/month",
            description: "For agencies and large creator operations",
            features: ["Unlimited platforms", "Multi-creator management", "Custom AI model training", "White-label solutions", "Dedicated account manager", "24/7 support", "Advanced analytics"],
            highlight: false
        }
    ];

    const processItems = [
        {
            step: "01",
            title: "Strategy & Setup",
            description: "Comprehensive analysis of your current content performance, audience, and goals to create a custom operations strategy.",
            timeline: "Week 1"
        },
        {
            step: "02",
            title: "Platform Integration",
            description: "Seamless integration with your social accounts and customized workflows tailored to each platform's best practices.",
            timeline: "Week 2"
        },
        {
            step: "03",
            title: "Content Pipeline Creation",
            description: "Advanced AI-powered content generation workflows calibrated to match your brand voice and style perfectly.",
            timeline: "Week 3-4"
        },
        {
            step: "04",
            title: "Execution & Optimization",
            description: "Full deployment with continuous optimization and performance monitoring for maximum results.",
            timeline: "Ongoing"
        }
    ];

    const results = [
        {
            metric: "90%",
            description: "Time saved on content management"
        },
        {
            metric: "3x",
            description: "Average increase in content output"
        },
        {
            metric: "200%",
            description: "Improvement in engagement rates"
        },
        {
            metric: "150%",
            description: "Average revenue increase"
        }
    ];

    const technologies = [
        { name: "OpenAI GPT-4", use: "Content generation" },
        { name: "Runway ML", use: "AI video creation" },
        { name: "N8N Workflows", use: "Automation orchestration" },
        { name: "Custom APIs", use: "Platform integrations" },
        { name: "Machine Learning", use: "Performance optimization" },
        { name: "Cloud Infrastructure", use: "Scalable processing" }
    ];

    const faqs = [
        {
            question: "How quickly can you set up operations for my accounts?",
            answer: "Most clients are operational within 2-4 weeks. I start with your highest-priority platforms and gradually expand to cover your entire ecosystem."
        },
        {
            question: "Will the AI-assisted content sound like me?",
            answer: "Yes. I train custom models on your existing content to match your unique voice, style, and brand personality. The tools I use become an extension of your creative process."
        },
        {
            question: "What platforms do you support?",
            answer: "I work with most major platforms including YouTube, TikTok, Instagram, Twitter, LinkedIn, Facebook, Pinterest, and emerging platforms."
        },
        {
            question: "How do you ensure content quality?",
            answer: "Every piece of content goes through my personal review process. You maintain full approval rights, and I provide detailed previews before any content goes live."
        },
        {
            question: "Can I still create original content myself?",
            answer: "Absolutely. My service enhances your creativity rather than replacing it. You can seamlessly integrate manually created content with the material I generate."
        }
    ];

    return (
        <motion.div
            className="min-h-screen bg-black text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <div className="w-full max-w-none">


                {/* Header - Portolio Style */}
                <motion.header
                    className="px-4 md:px-8 py-16 relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="mb-8 flex flex-col md:flex-row md:items-end gap-6 border-b border-zinc-900 pb-4">
                        <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                            <FiZap className="text-4xl md:text-6xl text-white" />
                        </div>
                        <div className="flex items-end gap-4">
                            <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                                AUTOMATION
                            </h1>
                            <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                                CREATOR_OPS
                            </div>
                        </div>
                    </div>
                </motion.header>

                {/* Service Packages - MOVED TO TOP */}
                <section className="mb-16 px-8">
                    <h2 className="text-sm text-gray-500 mb-2">SERVICE PACKAGES</h2>
                    <h3 className="text-2xl font-bold mb-8">Choose Your Automation Level</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg, index) => (
                            <Link
                                key={index}
                                href={`/automation/packages/${pkg.tier.toLowerCase()}`}
                                className={`border rounded-lg p-6 hover:scale-105 transition-all ${pkg.highlight ? 'border-blue-500 bg-blue-900/10' : 'border-gray-800 hover:border-gray-600'}`}
                            >
                                {pkg.highlight && (
                                    <div className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full mb-4 inline-block">
                                        MOST POPULAR
                                    </div>
                                )}
                                <div className="text-lg font-bold mb-1">{pkg.tier}</div>
                                <div className="text-2xl font-bold mb-2">
                                    {pkg.price}<span className="text-sm text-gray-400">{pkg.period}</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-6">{pkg.description}</p>

                                <ul className="space-y-2 mb-6">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                                            <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className={`w-full py-3 rounded-lg font-medium transition-colors text-center ${pkg.highlight
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-800 text-gray-300'
                                    }`}>
                                    Get Started <FiArrowRight className="inline ml-2" size={14} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="border-t border-gray-800 my-16" />

                <div className="mb-16 px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        {results.map((result, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl font-bold mb-2 text-blue-400">{result.metric}</p>
                                <p className="text-xs text-gray-500 uppercase">{result.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-800 rounded-lg p-8 bg-gray-900/20">
                        <h3 className="text-xl font-bold mb-4">Elite Creator Operations</h3>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            Transform your content creation workflow with our comprehensive automation service. We handle the entire content lifecycle - from ideation to distribution - while you focus on strategy and growth.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            Our AI-powered systems learn your unique style and voice to generate, adapt, and distribute content across all platforms, ensuring maximum engagement and revenue generation at scale.
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-800 my-16" />

                {/* Problem We Solve */}
                <section className="mb-16 px-8">
                    <h2 className="text-sm text-gray-500 mb-2">CHALLENGES WE SOLVE</h2>
                    <h3 className="text-2xl font-bold mb-8">The Creator Time Trap</h3>
                    <p className="text-gray-400 mb-8">Most creators spend 75% of their time on administrative tasks instead of creating. Our automation systems change that.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {problems.map((problem, index) => (
                            <div key={index} className="border-b border-gray-800 pb-6">
                                <div className="flex items-start gap-4">
                                    <div className="pt-1">
                                        <h4 className="text-lg font-medium mb-2">{problem.title}</h4>
                                        <p className="text-sm text-gray-400">{problem.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Our Services */}
                <section className="mb-16 px-8">
                    <h2 className="text-sm text-gray-500 mb-2">OUR SERVICES</h2>
                    <h3 className="text-2xl font-bold mb-8">Complete Creator Automation Suite</h3>

                    <div className="space-y-12">
                        {services.map((service, index) => (
                            <div key={index} className="border-b border-gray-800 pb-12 last:border-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <h4 className="text-xl font-bold">{service.title}</h4>
                                            <p className="text-gray-400">{service.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-5xl font-black text-gray-800">{service.number}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-500 mb-3">FEATURES INCLUDED</h5>
                                        <ul className="space-y-2">
                                            {service.features.map((feature, i) => (
                                                <li key={i} className="text-sm text-gray-400 flex items-start gap-3">
                                                    <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-bold text-gray-500 mb-3">WHAT YOU GET</h5>
                                        <p className="text-blue-400 font-medium">{service.deliverable}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="border-t border-gray-800 my-16" />

                {/* Implementation Process */}
                <section className="mb-16 px-8" id="shadow-steps">
                    <h2 className="text-sm text-gray-500 mb-2">IMPLEMENTATION</h2>
                    <h3 className="text-2xl font-bold mb-8">Implementation Process</h3>

                    <div className="space-y-6">
                        {processItems.map((step, index) => (
                            <div key={index} className="flex gap-6 border-l-2 border-blue-500 pl-8 pb-6">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold -ml-12 mt-1">
                                    {step.step}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-lg font-bold">{step.title}</h4>
                                        <span className="text-sm text-blue-400">{step.timeline}</span>
                                    </div>
                                    <p className="text-gray-400">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Technology Stack */}
                <section className="mb-16 px-8">
                    <h2 className="text-sm text-gray-500 mb-2">TECHNOLOGY</h2>
                    <h3 className="text-2xl font-bold mb-8">Powered by Cutting-Edge AI</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {technologies.map((tech, index) => (
                            <div key={index} className="flex justify-between items-center border-b border-gray-800 pb-3">
                                <span className="font-medium">{tech.name}</span>
                                <span className="text-sm text-gray-400">{tech.use}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="mb-16 px-8" id="azote-spectral">
                    <h2 className="text-sm text-gray-500 mb-2">FREQUENTLY ASKED</h2>
                    <h3 className="text-2xl font-bold mb-8">Questions & Answers</h3>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-800 pb-6">
                                <h4 className="text-lg font-medium mb-3">{faq.question}</h4>
                                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center py-12 px-8">
                    <h3 className="text-3xl font-bold mb-4">Ready to Optimize Your Workflows?</h3>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        Advanced automation systems help creators scale their content operations and increase creative output without burnout.
                        Schedule a consultation to discover how we can transform your creator business.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-blue-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                        >
                            Schedule Consultation
                            <FiArrowRight />
                        </Link>
                        <Link
                            href="#azote-spectral"
                            className="inline-flex items-center gap-2 border border-gray-600 text-gray-300 px-8 py-3 rounded-lg font-bold hover:border-gray-500 transition-colors"
                        >
                            View FAQ
                        </Link>
                    </div>
                </section>
            </div>
        </motion.div>
    );
}