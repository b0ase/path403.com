'use client';

import React from 'react';
import Link from 'next/link';
import { FaUserSecret, FaArrowLeft, FaRocket, FaCog, FaChartBar } from 'react-icons/fa';
import AIChat from '@/components/AIChat';

export default function MyAgentPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <FaUserSecret className="text-sky-500 text-3xl mr-4" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">My B0ase AI Agent</h1>
              <p className="text-gray-400 mt-1">Your intelligent assistant for the B0ase platform</p>
            </div>
          </div>
          <Link href="/profile" legacyBehavior>
            <a className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-sky-500 transition-colors">
              <FaArrowLeft className="mr-2" />
              Back to Profile
            </a>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* AI Chat - Main Area */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 h-[600px]">
              <AIChat context="User is on their personal AI agent page" />
            </div>
          </div>

          {/* Agent Status & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent Status */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
                <h3 className="text-lg font-semibold">Agent Status</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-white">Gemini 1.5 Flash</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversations:</span>
                  <span className="text-white">Live</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaRocket className="text-sky-500 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-medium transition-colors flex items-center">
                  <FaCog className="mr-2" />
                  Agent Settings
                </button>
                <button className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors flex items-center">
                  <FaChartBar className="mr-2" />
                  View Analytics
                </button>
              </div>
            </div>

            {/* Agent Capabilities */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Agent Capabilities</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Platform Navigation
                </div>
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Project Planning
                </div>
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Technical Guidance
                </div>
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Business Strategy
                </div>
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Service Recommendations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Questions */}
        <div className="mt-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Try asking me about:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-sky-400 mb-2">Project Management</h4>
              <p className="text-sm text-gray-300">"How do I start a new project on B0ase?"</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-sky-400 mb-2">Services</h4>
              <p className="text-sm text-gray-300">"What web development services does B0ase offer?"</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-sky-400 mb-2">Technical Help</h4>
              <p className="text-sm text-gray-300">"How do I integrate AI into my project?"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 