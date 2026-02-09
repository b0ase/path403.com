'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { 
  FiUser,
  FiMail,
  FiSave,
  FiArrowLeft
} from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('Richard Boase');
  const [bio, setBio] = useState('Founder and Super Admin of b0ase.com');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      setEmail(user.email || '');
    }
  }, [loading, user, router]);

  const handleSave = async () => {
    setIsSaving(true);
    // In a real app, this would save to database
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-sm">LOADING PROFILE...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-16">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-bold mb-2">PROFILE SETTINGS</h1>
              <p className="text-sm text-gray-500">SYSTEM USER: SUPER ADMIN</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} />
              <span>BACK</span>
            </button>
          </div>
        </header>

        <main className="max-w-4xl">
          {/* User Info */}
          <div className="mb-12">
            <h2 className="text-sm text-gray-500 mb-6">USER INFORMATION</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <span className="text-xs text-gray-600 w-32">NAME</span>
                <span className="text-lg">{displayName.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-xs text-gray-600 w-32">EMAIL</span>
                <span className="text-lg">{email.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-xs text-gray-600 w-32">ROLE</span>
                <span className="text-lg">SUPER ADMINISTRATOR</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-xs text-gray-600 w-32">STATUS</span>
                <span className="text-lg text-green-500">[ACTIVE]</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="mb-12">
            <h2 className="text-sm text-gray-500 mb-6">EDIT PROFILE</h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-xs text-gray-600 mb-2">
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-gray-900 text-white font-mono focus:outline-none focus:border-gray-700"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs text-gray-600 mb-2">
                  EMAIL ADDRESS [READ-ONLY]
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 bg-black border border-gray-900 text-gray-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-xs text-gray-600 mb-2">
                  BIO
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-gray-900 text-white font-mono focus:outline-none focus:border-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Privileges */}
          <div className="mb-12">
            <h2 className="text-sm text-gray-500 mb-6">ADMINISTRATOR PRIVILEGES</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600">[001]</span>
                <span>FULL SYSTEM ACCESS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">[002]</span>
                <span>PROJECT MANAGEMENT</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">[003]</span>
                <span>ORACLE SERVER ACCESS</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">[004]</span>
                <span>DATABASE ADMINISTRATION</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-600">[005]</span>
                <span>REVENUE OVERSIGHT</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <span>SAVING...</span>
              ) : (
                <>
                  <FiSave size={14} />
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              [CANCEL]
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}