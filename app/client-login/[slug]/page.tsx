'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { portfolioData } from '@/lib/data';
import { FaArrowLeft, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

interface ClientLoginPageProps {
  params: {
    slug: string;
  };
}

export default function ClientLoginPage({ params }: ClientLoginPageProps) {
  const project = portfolioData.projects.find(p => p.slug === params.slug);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!project) {
    notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSlug: project.slug, email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        window.location.href = `/projects/${project.slug}`;
      } else {
        setError(data.error || 'Incorrect credentials.');
        setPassword('');
      }
    } catch (err) {
      setError('Server error. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <Link 
          href="/#projects" 
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <FaArrowLeft size={16} />
          Back to Projects
        </Link>

        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
          <div className="text-center mb-6">
            <FaLock className="mx-auto text-4xl text-purple-400 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Client Login</h1>
            <p className="text-gray-400">{project.title}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Need access? Contact{' '}
              <a 
                href={`mailto:richard@b0ase.com?subject=Access Request - ${project.title}`}
                className="text-purple-400 hover:text-purple-300"
              >
                richard@b0ase.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
