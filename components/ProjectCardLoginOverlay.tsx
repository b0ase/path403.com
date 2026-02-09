'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Project } from '@/lib/data'; 
import { FaExternalLinkAlt, FaLock, FaInfoCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

interface ProjectCardLoginOverlayProps {
  project: Project;
  isVisible: boolean;
}

export default function ProjectCardLoginOverlay({ project, isVisible }: ProjectCardLoginOverlayProps) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!project) {
    return null; 
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      router.push(`/projects/${project.slug}`); 
    } else {
        setError(data.error || 'Incorrect password.');
        setPassword('');
      }
    } catch (err) {
      setError('Server error.');
    }
    setLoading(false);
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLoginForm(true);
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLoginForm(false);
    setError('');
    setPassword('');
    setEmail('');
  };

  return (
    <div 
      className={`absolute inset-0 z-10 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={e => e.stopPropagation()}
    >
      {!showLoginForm ? (
        <div className="w-full max-w-xs space-y-3">
          <h3 className="text-lg font-semibold text-white mb-4 text-center truncate" title={project.title}>
            {project.title}
          </h3>
          
          {/* Visit Website Button */}
          <a
            href={project.liveUrl || `https://${project.title}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <FaExternalLinkAlt size={14} />
            Visit Website
          </a>

          {/* Orange Preview Button - on every rollover */}
          <a
            href={project.liveUrl || `https://${project.title}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <FaExternalLinkAlt size={14} />
            Preview
          </a>

          {/* Client Login Button */}
          <button
            onClick={handleLoginClick}
            className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <FaLock size={14} />
            Client Login
          </button>

          {/* Project Vision Link */}
          <Link
            href={`/projects/${project.slug}`}
            className="w-full px-4 py-2 bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <FaInfoCircle size={14} />
            View Vision
          </Link>
        </div>
      ) : (
      <div className="w-full max-w-xs">
          <button
            onClick={handleBackClick}
            className="text-gray-400 hover:text-white mb-3 text-sm flex items-center gap-1"
          >
            ← Back to options
          </button>
          
        <h3 className="text-lg font-semibold text-white mb-3 text-center truncate" title={project.title}>
            Client Login: {project.title}
        </h3>
          
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
              <label htmlFor={`email-${project.slug}`} className="sr-only">
                Email
              </label>
              <input
                type="email"
                id={`email-${project.slug}`}
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="relative">
            <label htmlFor={`password-${project.slug}`} className="sr-only">
              Password
            </label>
            <input
                type={showPassword ? 'text' : 'password'}
                id={`password-${project.slug}`}
              placeholder="Password"
              value={password}
                onChange={(e) => setPassword(e.target.value)}
              required
                className="w-full px-3 py-2 border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
            />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200 focus:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button 
            type="submit"
              className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              disabled={loading || !email || !password}
          >
              <FaLock size={14} />
              {loading ? 'Logging in...' : 'Access Project'}
          </button>
        </form>
      </div>
      )}
    </div>
  );
} 