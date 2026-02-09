import { FaArrowLeft, FaMobileAlt, FaApple, FaAndroid, FaReact, FaArrowRight, FaCheck, FaCog } from 'react-icons/fa';
import Link from 'next/link';

export default function AppDevelopmentPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FaMobileAlt className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              App Development
            </h1>
            <p className="text-xl text-gray-400 mb-2">App Development & Tech Support</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Custom mobile and web app development for iOS, Android, and cross-platform solutions. Bring your ideas to life with beautiful, high-performance apps.
        </p>
      </div>
      {/* Key Features */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            App Development Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <FaApple className="text-blue-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-blue-300">iOS App Development</h3>
              <p className="text-gray-300">Native iOS apps for iPhone and iPad, built with Swift and the latest Apple technologies.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-indigo-500/50 transition-all duration-300">
              <FaAndroid className="text-indigo-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-indigo-300">Android App Development</h3>
              <p className="text-gray-300">Native Android apps for phones and tablets, built with Kotlin and modern Android frameworks.</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300">
              <FaReact className="text-cyan-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-cyan-300">Cross-Platform Apps</h3>
              <p className="text-gray-300">React Native and hybrid apps for seamless experiences across iOS, Android, and web.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Packages */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            App Packages
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Choose the perfect app development package for your project. All packages include consultation and support.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-2">Starter App</h3>
                <div className="text-4xl font-bold text-white mb-2">£4,000</div>
                <p className="text-gray-400">Simple MVP or prototype</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Single platform (iOS or Android)</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">Basic UI/UX design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">API integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-blue-400 text-sm" />
                  <span className="text-gray-300">1 month support</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Get Started <FaArrowRight />
              </button>
            </div>
            {/* Professional Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border-2 border-indigo-500 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Professional App</h3>
                <div className="text-4xl font-bold text-white mb-2">£12,000</div>
                <p className="text-gray-400">Full-featured app</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">iOS & Android (cross-platform)</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Custom UI/UX design</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Backend integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">Push notifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-indigo-400 text-sm" />
                  <span className="text-gray-300">3 months support</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Start Project <FaArrowRight />
              </button>
            </div>
            {/* Enterprise Package */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">Enterprise App</h3>
                <div className="text-4xl font-bold text-white mb-2">£30,000+</div>
                <p className="text-gray-400">Custom enterprise solution</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Bespoke architecture</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Integrations & automations</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">Ongoing consulting</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaCheck className="text-cyan-400 text-sm" />
                  <span className="text-gray-300">12 months support</span>
                </li>
              </ul>
              <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                Contact Us <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Ready to Build Your App?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Let's create a high-performance app that delights your users and grows your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
              Start Your App <FaArrowRight />
            </button>
            <button className="border border-gray-600 hover:border-blue-500 text-gray-300 hover:text-blue-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Examples
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 