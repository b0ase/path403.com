'use client';

import Link from 'next/link';
import { FaUsersCog, FaCog, FaDatabase } from 'react-icons/fa';
import AdminNotionDashboard from '@/components/AdminNotionDashboard';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4 md:px-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Admin Dashboard</h1>
      
      <div className="max-w-6xl mx-auto">
        
        {/* Notion Integration Section */}
        <AdminNotionDashboard />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Client Approvals Card */}
        <div className="bg-gradient-to-br from-blue-900/80 to-gray-900/80 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
          <FaUsersCog size={40} className="mb-3 text-blue-400" />
          <h2 className="text-2xl font-semibold mb-2">Client Approvals</h2>
          <p className="text-gray-300 mb-5 text-sm flex-grow">Review, approve, or reject new client sign-up requests.</p>
          <Link href="/admin/clients">
            <button className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow transition-all">
              Manage Requests
            </button>
          </Link>
        </div>

        {/* Notion Integration Admin Card */}
        <div className="bg-gradient-to-br from-purple-900/80 to-gray-900/80 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
          <FaDatabase size={40} className="mb-3 text-purple-400" />
          <h2 className="text-2xl font-semibold mb-2">Notion Integration</h2>
          <p className="text-gray-300 mb-5 text-sm flex-grow">Test and manage the Notion API integration, sync projects.</p>
          <Link href="/admin/notion">
            <button className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow transition-all">
              Manage Integration
            </button>
          </Link>
        </div>

        {/* User Management Card */}
        <div className="bg-gradient-to-br from-green-900/80 to-gray-900/80 rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
          <FaCog size={40} className="mb-3 text-green-400" />
          <h2 className="text-2xl font-semibold mb-2">Admin Settings</h2>
          <p className="text-gray-300 mb-5 text-sm flex-grow">Configure system settings and preferences.</p>
          <Link href="/admin/settings">
            <button className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow transition-all">
              Open Settings
            </button>
          </Link>
        </div>

        </div>
      </div>
    </div>
  );
} 