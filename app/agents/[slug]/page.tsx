'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import {
  FaRobot,
  FaHeadset,
  FaShoppingCart,
  FaPencilAlt,
  FaChartLine,
  FaDatabase
} from 'react-icons/fa';

const AGENTS_DATA: Record<string, {
  icon: any;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  price: string;
  deliveryTime: string;
  features: string[];
  capabilities: { title: string; description: string }[];
  techStack: string[];
  pricing: { item: string; price: string }[];
  useCases: string[];
}> = {
  'customer-support': {
    icon: FaHeadset,
    title: 'Customer Support Agent',
    category: 'Support Automation',
    description: 'Handle inquiries, resolve issues, and provide 24/7 support without human intervention.',
    fullDescription: 'A fully autonomous customer support agent that handles inquiries via chat, email, or integrated messaging platforms. Uses natural language understanding to interpret customer needs, access your knowledge base, and provide accurate responses. Escalates complex issues to human agents when necessary.',
    price: '£800-1,500',
    deliveryTime: '2-3 weeks',
    features: ['24/7 Availability', 'Multi-channel Support', 'Knowledge Base Integration', 'Ticket Creation', 'Sentiment Analysis', 'Auto-escalation', 'Response Templates', 'Analytics Dashboard'],
    capabilities: [
      { title: 'Natural Language Understanding', description: 'Interprets customer queries in natural language and identifies intent.' },
      { title: 'Knowledge Base Search', description: 'Searches your documentation, FAQs, and past tickets for relevant answers.' },
      { title: 'Smart Escalation', description: 'Recognizes when human intervention is needed and routes appropriately.' }
    ],
    techStack: ['Claude API', 'OpenAI', 'LangChain', 'Vector DB', 'Webhooks', 'REST API'],
    pricing: [
      { item: 'Core Agent Development', price: '£800' },
      { item: 'Knowledge Base Integration', price: '£200' },
      { item: 'Multi-channel Setup (Slack, Email, Web)', price: '£300' },
      { item: 'Analytics Dashboard', price: '£200' }
    ],
    useCases: ['E-commerce support', 'SaaS helpdesk', 'Technical support', 'Booking assistance']
  },
  'sales-assistant': {
    icon: FaShoppingCart,
    title: 'Sales Assistant Agent',
    category: 'Sales Automation',
    description: 'Qualify leads, answer product questions, and guide customers through the buying process.',
    fullDescription: 'An intelligent sales agent that engages with prospects, qualifies leads based on your criteria, answers product questions, and guides customers through the purchase funnel. Integrates with your CRM to log interactions and update lead scores automatically.',
    price: '£1,200-2,200',
    deliveryTime: '3-4 weeks',
    features: ['Lead Qualification', 'Product Q&A', 'CRM Integration', 'Meeting Scheduling', 'Quote Generation', 'Follow-up Sequences', 'Objection Handling', 'Pipeline Updates'],
    capabilities: [
      { title: 'Lead Scoring', description: 'Automatically scores leads based on conversation signals and buying intent.' },
      { title: 'Product Expertise', description: 'Deep knowledge of your products and services for accurate recommendations.' },
      { title: 'CRM Sync', description: 'Pushes all interactions and lead data to your CRM in real-time.' }
    ],
    techStack: ['Claude API', 'OpenAI', 'Salesforce API', 'HubSpot API', 'Calendly', 'Stripe'],
    pricing: [
      { item: 'Core Sales Agent', price: '£1,200' },
      { item: 'CRM Integration (Salesforce/HubSpot)', price: '£400' },
      { item: 'Calendar & Scheduling Integration', price: '£200' },
      { item: 'Quote Generation System', price: '£400' }
    ],
    useCases: ['B2B sales', 'E-commerce upselling', 'Service bookings', 'Demo scheduling']
  },
  'content-agent': {
    icon: FaPencilAlt,
    title: 'Content Agent',
    category: 'Content Automation',
    description: 'Generate blog posts, social media content, and marketing copy on autopilot.',
    fullDescription: 'A creative content agent that generates high-quality blog posts, social media content, email newsletters, and marketing copy. Learns your brand voice, follows your style guidelines, and can operate on a schedule or on-demand. Includes SEO optimization and content calendar management.',
    price: '£600-1,200',
    deliveryTime: '2 weeks',
    features: ['Blog Generation', 'Social Media Posts', 'Email Newsletters', 'SEO Optimization', 'Brand Voice Matching', 'Content Calendar', 'Image Suggestions', 'Multi-format Output'],
    capabilities: [
      { title: 'Brand Voice Learning', description: 'Analyzes your existing content to match your unique tone and style.' },
      { title: 'SEO Integration', description: 'Optimizes content for search with keyword research and meta tags.' },
      { title: 'Scheduled Publishing', description: 'Automates content creation on a defined schedule.' }
    ],
    techStack: ['Claude API', 'OpenAI', 'WordPress API', 'Buffer API', 'Semrush', 'Ahrefs'],
    pricing: [
      { item: 'Core Content Agent', price: '£600' },
      { item: 'CMS Integration (WordPress/Ghost)', price: '£200' },
      { item: 'Social Media Scheduling', price: '£200' },
      { item: 'SEO Optimization Module', price: '£200' }
    ],
    useCases: ['Blog automation', 'Social media management', 'Newsletter creation', 'Product descriptions']
  },
  'data-analyst': {
    icon: FaChartLine,
    title: 'Data Analyst Agent',
    category: 'Analytics Automation',
    description: 'Process data, generate reports, and surface insights from your business metrics.',
    fullDescription: 'An analytical agent that connects to your data sources, processes large datasets, generates automated reports, and surfaces actionable insights. Can answer natural language questions about your data and create visualizations on demand.',
    price: '£1,500-2,800',
    deliveryTime: '4-5 weeks',
    features: ['Data Processing', 'Report Generation', 'Natural Language Queries', 'Anomaly Detection', 'Trend Analysis', 'Custom Dashboards', 'Scheduled Reports', 'Alert System'],
    capabilities: [
      { title: 'Multi-source Integration', description: 'Connects to databases, APIs, spreadsheets, and cloud services.' },
      { title: 'Natural Language Analysis', description: 'Ask questions about your data in plain English.' },
      { title: 'Automated Insights', description: 'Proactively surfaces trends, anomalies, and opportunities.' }
    ],
    techStack: ['Claude API', 'Python', 'PostgreSQL', 'BigQuery', 'Pandas', 'Matplotlib', 'Plotly'],
    pricing: [
      { item: 'Core Analytics Agent', price: '£1,500' },
      { item: 'Database Integrations', price: '£400' },
      { item: 'Custom Dashboard Builder', price: '£500' },
      { item: 'Automated Reporting System', price: '£400' }
    ],
    useCases: ['Business intelligence', 'Financial reporting', 'Marketing analytics', 'Operations metrics']
  },
  'internal-tools': {
    icon: FaDatabase,
    title: 'Internal Tools Agent',
    category: 'Operations Automation',
    description: 'Automate internal workflows, manage documentation, and streamline operations.',
    fullDescription: 'An operations agent that automates internal workflows, manages documentation, handles employee requests, and streamlines day-to-day operations. Perfect for HR queries, IT helpdesk, onboarding processes, and knowledge management.',
    price: '£1,000-1,800',
    deliveryTime: '3 weeks',
    features: ['Workflow Automation', 'Document Management', 'Employee Self-service', 'Onboarding Flows', 'IT Helpdesk', 'Policy Lookup', 'Approval Routing', 'Slack/Teams Integration'],
    capabilities: [
      { title: 'Workflow Engine', description: 'Creates and executes multi-step automated workflows.' },
      { title: 'Knowledge Search', description: 'Instantly searches internal docs, wikis, and policies.' },
      { title: 'Team Integration', description: 'Works within Slack, Teams, or your existing tools.' }
    ],
    techStack: ['Claude API', 'Slack API', 'Microsoft Graph', 'Notion API', 'Google Workspace', 'Zapier'],
    pricing: [
      { item: 'Core Operations Agent', price: '£1,000' },
      { item: 'Slack/Teams Integration', price: '£300' },
      { item: 'Document Management System', price: '£300' },
      { item: 'Custom Workflow Builder', price: '£200' }
    ],
    useCases: ['HR automation', 'IT helpdesk', 'Employee onboarding', 'Knowledge management']
  },
  'custom-workflow': {
    icon: FaRobot,
    title: 'Custom Workflow Agent',
    category: 'Custom Development',
    description: 'Build a completely custom agent tailored to your specific business needs.',
    fullDescription: 'A fully custom AI agent designed from the ground up for your specific use case. We work with you to understand your requirements, design the agent architecture, integrate with your existing systems, and deliver a solution that perfectly fits your workflow.',
    price: '£2,000-5,000',
    deliveryTime: '4-8 weeks',
    features: ['Custom Architecture', 'Bespoke Integrations', 'Tailored Training', 'Dedicated Support', 'Full Documentation', 'Testing Suite', 'Deployment Support', 'Ongoing Maintenance'],
    capabilities: [
      { title: 'Custom Design', description: 'Agent architecture designed specifically for your use case.' },
      { title: 'Any Integration', description: 'Connects to any system with an API or data export.' },
      { title: 'Iterative Development', description: 'Built in sprints with your feedback at every stage.' }
    ],
    techStack: ['Claude API', 'OpenAI', 'Custom APIs', 'Your Tech Stack', 'LangChain', 'Vector DB'],
    pricing: [
      { item: 'Discovery & Architecture', price: '£500' },
      { item: 'Core Agent Development', price: '£1,500' },
      { item: 'Custom Integrations', price: '£1,000' },
      { item: 'Testing & Deployment', price: '£500' },
      { item: 'Documentation & Training', price: '£500' }
    ],
    useCases: ['Industry-specific solutions', 'Complex workflows', 'Multi-agent systems', 'Enterprise automation']
  }
};

export default function AgentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const agent = AGENTS_DATA[slug];

  if (!agent) {
    notFound();
  }

  const IconComponent = agent.icon;
  const totalMin = agent.pricing.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[£,]/g, ''));
    return sum + price;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black"
    >
      <div className="px-4 md:px-8 py-16">
        <Link href="/agents" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8">
          <FiArrowLeft />
          <span>Back to Agents</span>
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-12">
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800">
              <IconComponent className="text-3xl md:text-4xl text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-2">{agent.category}</p>
              <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-4">{agent.title}</h1>
              <p className="text-zinc-400 max-w-2xl">{agent.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl md:text-3xl font-bold text-white mb-4">{agent.price}</div>
              <Link href="/contact" className="bg-white text-black hover:bg-zinc-200 px-6 py-2 text-xs uppercase font-bold tracking-wider inline-block">Get Quote</Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">{agent.deliveryTime} delivery</span>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Description & Features */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-950 border border-zinc-900 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Overview</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{agent.fullDescription}</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Core Features</h2>
              <div className="grid grid-cols-1 gap-2">
                {agent.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <FiCheck className="text-emerald-500 flex-shrink-0" />
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Column 2: Capabilities & Tech Stack */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-950 border border-zinc-900 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Key Capabilities</h2>
              <div className="space-y-4">
                {agent.capabilities.map((cap, i) => (
                  <div key={i} className="border-l-2 border-zinc-800 pl-4">
                    <h3 className="font-bold text-white text-sm mb-1">{cap.title}</h3>
                    <p className="text-zinc-500 text-xs">{cap.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Technology Stack</h2>
              <div className="flex flex-wrap gap-2">
                {agent.techStack.map((tech) => (
                  <span key={tech} className="text-[10px] uppercase font-bold text-zinc-500 border border-zinc-800 px-2 py-1 bg-zinc-900">{tech}</span>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Use Cases</h2>
              <ul className="space-y-2">
                {agent.useCases.map((useCase, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-400 text-sm">
                    <span className="text-zinc-600">-</span>
                    {useCase}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Column 3: Pricing Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-zinc-950 border border-zinc-900 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">Pricing Breakdown</h2>
              <div className="space-y-3">
                {agent.pricing.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-900">
                    <span className="text-zinc-500 text-sm">{item.item}</span>
                    <span className="font-bold text-white">{item.price}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-white">Total (all options)</span>
                  <span className="font-bold text-emerald-500">£{totalMin.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-zinc-600 text-xs mt-4">* Final price depends on specific requirements and integrations needed.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-4">What's Included</h2>
              <ul className="space-y-2 text-zinc-400 text-sm">
                <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>Full source code ownership</li>
                <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>Deployment to your infrastructure</li>
                <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>Documentation & setup guide</li>
                <li className="flex items-start gap-2"><span className="text-zinc-600">-</span>30 days post-launch support</li>
              </ul>
            </div>
            <div className="pt-4">
              <Link
                href="/contact"
                className="w-full bg-white text-black hover:bg-zinc-200 px-6 py-3 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2"
              >
                Get a Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
