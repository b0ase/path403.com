import { FaArrowLeft, FaBrain, FaRobot, FaChartLine, FaCode, FaDatabase, FaCog, FaPlug, FaArrowRight, FaCheck } from 'react-icons/fa';
import Link from 'next/link';

export default function AIIntegrationPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FaBrain className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              AI Integration
            </h1>
            <p className="text-xl text-gray-400 mb-2">AI Solutions & Automation</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Transform your business with seamless AI integration. We connect cutting-edge AI technologies to your existing infrastructure, 
          enhancing your current systems without disrupting your operations.
        </p>
      </div>

      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            AI Integration Services
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <FaPlug className="text-purple-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-purple-300">API Integration</h3>
              <p className="text-gray-300">Connect AI services to your existing applications and databases with secure, scalable API integrations.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaRobot className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Workflow Automation</h3>
              <p className="text-gray-300">Integrate AI into your current business processes and workflows for enhanced efficiency and productivity.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300">
              <FaChartLine className="text-indigo-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Analytics Enhancement</h3>
              <p className="text-gray-300">Add AI-powered insights to your existing reporting and analytics systems for better decision making.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <FaCode className="text-purple-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-purple-300">Custom AI Solutions</h3>
              <p className="text-gray-300">Develop bespoke AI integrations tailored to your specific business requirements and use cases.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaDatabase className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Data Pipeline Integration</h3>
              <p className="text-gray-300">Connect AI models to your data sources and create automated pipelines for continuous learning.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300">
              <FaCog className="text-indigo-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">System Optimization</h3>
              <p className="text-gray-300">Optimize your existing systems with AI to improve performance, reduce costs, and enhance user experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Integration Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect AI integration package for your business needs. All packages include consultation and ongoing support.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Basic Integration</h3>
                <div className="text-4xl font-bold text-white mb-2">£3,000</div>
                <p className="text-gray-400">Simple AI integrations</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Single AI API integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Basic workflow automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">Documentation & training</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-purple-400 text-sm" />
                  <span className="text-gray-300">1 month support</span>
                </li>
              </ul>
              
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </div>

            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-blue-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Professional Integration</h3>
                <div className="text-4xl font-bold text-white mb-2">£8,000</div>
                <p className="text-gray-400">Advanced AI solutions</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Multiple AI API integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Custom workflow automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Data pipeline setup</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Analytics dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Performance monitoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">3 months support</span>
                </li>
              </ul>
              
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Integration <FaArrowRight />
              </button>
            </div>

            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Enterprise Integration</h3>
                <div className="text-4xl font-bold text-white mb-2">£20,000+</div>
                <p className="text-gray-400">Custom quote</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Unlimited AI integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Custom AI model development</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Advanced automation</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Real-time analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Dedicated support team</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">12 months support</span>
                </li>
              </ul>
              
              <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Examples */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Integration Examples
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
              <FaPlug className="text-purple-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-purple-300">CRM AI Enhancement</h3>
              <p className="text-gray-300">Integrate AI-powered lead scoring, customer insights, and automated follow-ups directly into your existing CRM system.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaRobot className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">Support Bot Integration</h3>
              <p className="text-gray-300">Add intelligent AI chatbots to your website, Slack, or Discord for 24/7 automated customer support and engagement.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300">
              <FaChartLine className="text-indigo-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Analytics Dashboard</h3>
              <p className="text-gray-300">Enhance your existing dashboards with AI-generated insights, predictive analytics, and automated reporting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Integration Technologies
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'OpenAI API', 'Anthropic Claude', 'Google AI', 'Azure AI',
              'REST APIs', 'GraphQL', 'Webhooks', 'Zapier',
              'n8n', 'Microsoft Power Automate', 'Slack APIs', 'Discord Bots'
            ].map((tech, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 text-center hover:border-purple-500/50 transition-all duration-300">
                <span className="text-gray-300 font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Ready to Integrate AI?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's seamlessly integrate AI into your existing systems and workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Your AI Integration <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-purple-500 text-gray-300 hover:text-purple-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Examples
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 