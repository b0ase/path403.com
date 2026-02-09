import { FaArrowLeft, FaRocket, FaUsers, FaCamera, FaVideo, FaHashtag, FaRobot, FaChartLine, FaBrain, FaArrowRight, FaCheck, FaInstagram, FaTwitter, FaTiktok, FaYoutube, FaEnvelope, FaBullhorn, FaFileAlt, FaNewspaper, FaPlay, FaVolumeUp, FaChartPie } from 'react-icons/fa';
import Link from 'next/link';

export default function AIAgentsPage() {
  const agentTypes = [
    {
      name: "Content Creation Agents",
      description: "AI agents specialized in creating various types of content",
      icon: FaFileAlt,
      color: "from-blue-600 to-purple-600",
      modules: [
        { name: "Website Copy Agent", price: "£350", description: "Persuasive landing page and product copy" },
        { name: "Blog Article Agent", price: "£200", description: "Industry authority positioning content" },
        { name: "Social Media Agent", price: "£275", description: "Platform-specific engagement content" },
        { name: "Video Script Agent", price: "£400", description: "Compelling promotional video scripts" },
        { name: "Email Marketing Agent", price: "£275", description: "Lead nurturing email campaigns" },
        { name: "Ad Copy Agent", price: "£200", description: "High-converting advertising copy" }
      ]
    },
    {
      name: "Visual Content Agents",
      description: "AI agents for photo, video, and graphic content creation",
      icon: FaCamera,
      color: "from-pink-600 to-red-600",
      modules: [
        { name: "AI Photo Generation Agent", price: "£900", description: "AI-generated professional photography" },
        { name: "AI Video Creation Agent", price: "£1750", description: "AI-created video content" },
        { name: "Infographic Design Agent", price: "£550", description: "Visual data storytelling graphics" },
        { name: "Product Photography Agent", price: "£800", description: "Professional product photography" },
        { name: "Music Video Agent", price: "£2500", description: "AI-powered music videos with lip-sync" }
      ]
    },
    {
      name: "Audio & Music Agents",
      description: "AI agents specialized in audio content and music production",
      icon: FaVolumeUp,
      color: "from-green-600 to-teal-600",
      modules: [
        { name: "AI Music Composition Agent", price: "£650", description: "Original AI-composed music tracks" },
        { name: "AI Voice Generation Agent", price: "£750", description: "AI voice generation and audio production" },
        { name: "Podcast Content Agent", price: "£400", description: "Scripts and show notes for podcasts" }
      ]
    },
    {
      name: "Social Media & Automation Agents",
      description: "AI agents for social media management and automation",
      icon: FaRobot,
      color: "from-purple-600 to-indigo-600",
      modules: [
        { name: "AI Influencer Agent", price: "£1000", description: "Complete AI-powered social media presence" },
        { name: "Social Automation Agent", price: "£800", description: "Automated social media management" },
        { name: "Community Management Agent", price: "£600", description: "AI-powered community engagement" },
        { name: "Analytics & Growth Agent", price: "£500", description: "Performance tracking and optimization" }
      ]
    },
    {
      name: "Business Intelligence Agents",
      description: "AI agents for analytics, insights, and business optimization",
      icon: FaChartLine,
      color: "from-orange-600 to-yellow-600",
      modules: [
        { name: "Analytics Dashboard Agent", price: "£700", description: "Real-time business intelligence" },
        { name: "Market Research Agent", price: "£800", description: "Competitive analysis and insights" },
        { name: "SEO Optimization Agent", price: "£600", description: "Search engine optimization automation" },
        { name: "Performance Monitoring Agent", price: "£500", description: "Continuous performance tracking" }
      ]
    },
    {
      name: "Customer Service Agents",
      description: "AI agents for customer support and engagement",
      icon: FaUsers,
      color: "from-cyan-600 to-blue-600",
      modules: [
        { name: "Customer Support Agent", price: "£700", description: "24/7 intelligent customer service" },
        { name: "Sales Assistant Agent", price: "£800", description: "AI-powered sales conversations" },
        { name: "Lead Qualification Agent", price: "£600", description: "Automated lead scoring and routing" },
        { name: "Onboarding Agent", price: "£500", description: "User onboarding and guidance" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaBrain className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              AI Agents
            </h1>
            <p className="text-xl text-gray-400 mb-2">Autonomous AI Workers</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Deploy specialized AI agents that work 24/7 to handle your content creation, social media management, 
          customer service, and business operations. Each agent is designed to deliver specific services autonomously 
          while learning and improving over time.
        </p>
      </div>

      {/* Why AI Agents Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Why AI Agents Are the Future of Business
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaBrain className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Autonomous Operation</h3>
              <p className="text-gray-300">AI agents work independently, making decisions and completing tasks without constant supervision</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <FaRocket className="text-purple-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Scalable Efficiency</h3>
              <p className="text-gray-300">Deploy multiple agents simultaneously to handle various business functions at scale</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300">
              <FaChartLine className="text-pink-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-pink-300">Continuous Learning</h3>
              <p className="text-gray-300">Agents improve their performance over time by learning from data and feedback</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto">
              Each AI agent is essentially a specialized AI worker that can deliver our content modules and services. 
              Think of them as your dedicated team members who never sleep, never take breaks, and constantly get better at their jobs.
            </p>
          </div>
        </div>
      </section>

      {/* Agent Types */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Specialized AI Agent Categories
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose from our specialized AI agents, each designed to excel in specific business functions and deliver our content modules autonomously.
          </p>
          
          <div className="space-y-12">
            {agentTypes.map((category, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${category.color} p-6`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <category.icon className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                      <p className="text-white/80">{category.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white text-sm">{module.name}</h4>
                          <span className="text-xs font-bold text-blue-400">{module.price}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{module.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Model */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Flexible AI Agent Pricing
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Single Agent */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Single Agent</h3>
                <div className="text-4xl font-bold text-white mb-2">£500-2500</div>
                <p className="text-gray-400">One-time setup + monthly service</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">1 specialized AI agent</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Dedicated to one service</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">24/7 autonomous operation</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Monthly performance reports</span>
                </li>
              </ul>
              
              <Link href="/contact" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Deploy Single Agent <FaArrowRight />
              </Link>
            </div>

            {/* Agent Team */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-purple-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Agent Team</h3>
                <div className="text-4xl font-bold text-white mb-2">£2000-8000</div>
                <p className="text-gray-400">Setup + monthly coordination</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">3-6 coordinated AI agents</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Multi-service delivery</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Agent coordination & workflow</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Weekly optimization calls</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Integrated analytics dashboard</span>
                </li>
              </ul>
              
              <Link href="/contact" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Deploy Agent Team <FaArrowRight />
              </Link>
            </div>

            {/* Enterprise Fleet */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Enterprise Fleet</h3>
                <div className="text-4xl font-bold text-white mb-2">£10000+</div>
                <p className="text-gray-400">Custom setup + managed service</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">10+ specialized AI agents</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Custom agent development</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Advanced orchestration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">24/7 monitoring & support</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Custom integrations</span>
                </li>
              </ul>
              
              <Link href="/contact" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Deploy Enterprise Fleet <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            How AI Agents Deliver Our Services
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Agent Selection</h3>
              <p className="text-gray-400 text-sm">Choose the AI agents that match your business needs and content requirements</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Training & Setup</h3>
              <p className="text-gray-400 text-sm">We train your agents on your brand, goals, and specific service requirements</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Autonomous Delivery</h3>
              <p className="text-gray-400 text-sm">Agents work 24/7 to deliver content modules and services automatically</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-400">4</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Optimization</h3>
              <p className="text-gray-400 text-sm">Continuous monitoring and improvement based on performance data</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ready to Deploy Your AI Agent Workforce?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your business with autonomous AI agents that deliver our content modules and services while you focus on strategy and growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Your AI Agent Project <FaArrowRight />
            </Link>
            <Link 
              href="/agent" 
              className="border border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              Talk to Our AI Agent <FaRobot />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 