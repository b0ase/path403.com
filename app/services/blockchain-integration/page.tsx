'use client';

import React from 'react';
import { FaArrowLeft, FaCube, FaShieldAlt, FaCode, FaUsers, FaRobot, FaLink, FaRocket } from 'react-icons/fa';
import Link from 'next/link';

export default function BlockchainIntegrationPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <FaCube className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Blockchain Integration
            </h1>
            <p className="text-xl text-gray-400 mb-2">Smart Contracts & dApps</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Leverage the power of decentralized technology to build secure, transparent, and innovative solutions. 
          From smart contracts to dApps, we bring blockchain technology to your business.
        </p>
      </div>

      <div className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Blockchain Services
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500/50 transition-all duration-300">
              <FaCode className="text-orange-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-orange-300">Smart Contract Development</h3>
              <p className="text-gray-300">Design, develop, and deploy secure smart contracts for DeFi, NFTs, governance, and custom use cases.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300">
              <FaCube className="text-yellow-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-yellow-300">dApp Development</h3>
              <p className="text-gray-300">Full-stack decentralized application development with modern frontend frameworks and blockchain backends.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition-all duration-300">
              <FaUsers className="text-amber-400 text-2xl mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-amber-300">Web3 Consulting</h3>
              <p className="text-gray-300">Expert guidance on tokenomics, governance models, and go-to-market strategies for Web3 projects.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Blockchain Packages
          </h2>
          <p className="text-center text-gray-400 mb-12">Choose the right blockchain solution for your project</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 hover:border-orange-500/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-orange-300 mb-4">Smart Contract</h3>
              <div className="text-4xl font-bold text-white mb-2">£5,000</div>
              <p className="text-gray-400 mb-6">Single contract deployment</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <FaCode className="text-orange-400 flex-shrink-0" />
                  Smart contract development
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaShieldAlt className="text-orange-400 flex-shrink-0" />
                  Security audit included
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaRocket className="text-orange-400 flex-shrink-0" />
                  Deployment & testing
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-orange-500 rounded-xl p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-orange-300 mb-4">Full dApp</h3>
              <div className="text-4xl font-bold text-white mb-2">£15,000</div>
              <p className="text-gray-400 mb-6">Complete dApp solution</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <FaCode className="text-orange-400 flex-shrink-0" />
                  Frontend & backend development
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaShieldAlt className="text-orange-400 flex-shrink-0" />
                  Smart contract integration
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaUsers className="text-orange-400 flex-shrink-0" />
                  User authentication & wallets
                </li>
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 hover:border-orange-500/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-orange-300 mb-4">Enterprise</h3>
              <div className="text-4xl font-bold text-white mb-2">£50,000+</div>
              <p className="text-gray-400 mb-6">Custom blockchain solutions</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <FaRobot className="text-orange-400 flex-shrink-0" />
                  Custom protocol development
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaLink className="text-orange-400 flex-shrink-0" />
                  Multi-chain integration
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <FaUsers className="text-orange-400 flex-shrink-0" />
                  Dedicated team support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Ready to Build on Blockchain?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Let's discuss your blockchain project and create innovative solutions for the decentralized future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              Start Your Project
            </button>
            <button className="border border-gray-600 hover:border-orange-500 text-gray-300 hover:text-orange-300 font-semibold py-3 px-8 rounded-lg transition-all duration-300">
              View Examples
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}