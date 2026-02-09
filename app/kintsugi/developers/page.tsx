'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiUser,
  FiCode,
  FiGlobe,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';

interface Developer {
  id: string;
  name: string;
  email: string;
  skills: string[];
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  projectsCompleted: number;
  rating?: number;
  joinedAt: string;
}

// Placeholder data - will be replaced with database fetch
const PLACEHOLDER_DEVELOPERS: Developer[] = [
  {
    id: '1',
    name: 'Developer Pool Empty',
    email: 'setup@b0ase.com',
    skills: ['Waiting for signups'],
    availability: 'unavailable',
    projectsCompleted: 0,
    joinedAt: new Date().toISOString(),
  },
];

export default function KintsugiDevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>(PLACEHOLDER_DEVELOPERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDevelopers() {
      try {
        // TODO: Fetch from /api/kintsugi/developers
        // const res = await fetch('/api/kintsugi/developers');
        // if (res.ok) {
        //   const data = await res.json();
        //   setDevelopers(data.developers);
        // }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch developers:', error);
        setLoading(false);
      }
    }
    fetchDevelopers();
  }, []);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-400/10';
      case 'busy': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-zinc-500 bg-zinc-500/10';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available': return <FiCheckCircle className="w-3 h-3" />;
      case 'busy': return <FiClock className="w-3 h-3" />;
      default: return <FiAlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/kintsugi"
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Kintsugi Developers</h1>
            <p className="text-zinc-500 text-sm">Internal developer pool for project assignments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold">{developers.length}</div>
            <div className="text-zinc-500 text-sm">Total Developers</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {developers.filter(d => d.availability === 'available').length}
            </div>
            <div className="text-zinc-500 text-sm">Available</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {developers.filter(d => d.availability === 'busy').length}
            </div>
            <div className="text-zinc-500 text-sm">On Projects</div>
          </div>
        </div>

        {/* Developer List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-zinc-500">Loading developers...</div>
          ) : developers.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg">
              <FiUser className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
              <p className="text-zinc-500">No developers signed up yet.</p>
              <p className="text-zinc-600 text-sm mt-1">
                Developers can apply at b0ase.com/developers
              </p>
            </div>
          ) : (
            developers.map((dev) => (
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{dev.name}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getAvailabilityColor(dev.availability)}`}>
                        {getAvailabilityIcon(dev.availability)}
                        {dev.availability}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-sm mb-3">{dev.email}</p>
                    <div className="flex flex-wrap gap-2">
                      {dev.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {dev.rating && (
                      <div className="flex items-center gap-1 text-yellow-400 mb-1">
                        <FiStar className="w-4 h-4" />
                        <span>{dev.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="text-zinc-500">
                      {dev.projectsCompleted} projects
                    </div>
                    {dev.hourlyRate && (
                      <div className="text-zinc-400 font-mono">
                        £{dev.hourlyRate}/hr
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <h3 className="font-semibold mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/developers"
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
            >
              View Public Signup Page
            </Link>
            <button
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              Invite Developer
            </button>
            <button
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              Export List
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-zinc-900 text-center text-zinc-600 text-xs">
          <p>
            Internal page — admin access only.{' '}
            <Link href="/kintsugi" className="text-zinc-400 hover:text-white">Back to Kintsugi</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
