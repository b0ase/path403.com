'use client';

import React, { useState } from 'react';
import { FaClock, FaPlay, FaCheckCircle, FaTimesCircle, FaTwitter, FaNewspaper } from 'react-icons/fa';
import { motion } from 'framer-motion';

const cronJobs = [
  {
    id: 'twitter-post',
    name: 'Twitter Auto-Post',
    description: 'Posts content ideas to @b0ase Twitter account',
    schedule: '0 10 * * *', // Daily at 10:00 UTC
    scheduleReadable: 'Daily at 10:00 UTC',
    endpoint: '/api/cron/twitter-post',
    icon: FaTwitter,
    color: 'text-blue-400',
    requiresAuth: true,
  },
  {
    id: 'blog-post',
    name: 'Blog Auto-Generation',
    description: 'Generates blog posts from content ideas and tweets about them',
    schedule: '0 14 * * *', // Daily at 14:00 UTC
    scheduleReadable: 'Daily at 14:00 UTC',
    endpoint: '/api/cron/blog-post',
    icon: FaNewspaper,
    color: 'text-green-400',
    requiresAuth: true,
  },
  {
    id: 'finalize-proposals',
    name: 'Finalize Proposals',
    description: 'Finalizes pending proposals',
    schedule: '*/5 * * * *', // Every 5 minutes
    scheduleReadable: 'Every 5 minutes',
    endpoint: '/api/cron/finalize-proposals',
    icon: FaCheckCircle,
    color: 'text-purple-400',
    requiresAuth: true,
  },
  {
    id: 'expire-purchases',
    name: 'Expire Purchases',
    description: 'Expires old purchase records',
    schedule: '*/5 * * * *', // Every 5 minutes
    scheduleReadable: 'Every 5 minutes',
    endpoint: '/api/cron/expire-purchases',
    icon: FaTimesCircle,
    color: 'text-red-400',
    requiresAuth: true,
  },
];

export default function CronJobsPage() {
  const [testing, setTesting] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const testCronJob = async (job: typeof cronJobs[0]) => {
    setTesting(job.id);
    setResults((prev) => ({ ...prev, [job.id]: { loading: true } }));

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (job.requiresAuth) {
        // In production, CRON_SECRET should be in Vercel env vars
        // For local testing, we'll show a message
        const cronSecret = process.env.NEXT_PUBLIC_CRON_SECRET_TEST;
        if (!cronSecret) {
          setResults((prev) => ({
            ...prev,
            [job.id]: {
              success: false,
              error: 'CRON_SECRET not configured for testing',
              message: 'Add NEXT_PUBLIC_CRON_SECRET_TEST to .env.local for manual testing',
            },
          }));
          setTesting(null);
          return;
        }
        headers['Authorization'] = `Bearer ${cronSecret}`;
      }

      const response = await fetch(job.endpoint, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      setResults((prev) => ({
        ...prev,
        [job.id]: {
          success: response.ok,
          status: response.status,
          data,
        },
      }));
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [job.id]: {
          success: false,
          error: error.message,
        },
      }));
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Cron Jobs Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Monitor and test automated tasks running on b0ase.com
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cronJobs.map((job) => {
            const Icon = job.icon;
            const result = results[job.id];

            return (
              <motion.div
                key={job.id}
                className="border border-gray-800 bg-zinc-900 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`text-2xl ${job.color}`} />
                    <div>
                      <h3 className="text-xl font-bold text-white">{job.name}</h3>
                      <p className="text-sm text-gray-400">{job.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaClock size={12} />
                    <span>{job.scheduleReadable}</span>
                  </div>
                  <div className="font-mono text-xs text-gray-500">
                    {job.schedule}
                  </div>
                  <div className="font-mono text-xs text-gray-600">
                    {job.endpoint}
                  </div>
                </div>

                <button
                  onClick={() => testCronJob(job)}
                  disabled={testing === job.id}
                  className="w-full px-4 py-2 bg-white text-black font-bold hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPlay size={12} />
                  {testing === job.id ? 'Running...' : 'Test Now'}
                </button>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`mt-4 p-4 border ${
                      result.success
                        ? 'border-green-700 bg-green-900/20'
                        : 'border-red-700 bg-red-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.success ? (
                        <FaCheckCircle className="text-green-400" />
                      ) : (
                        <FaTimesCircle className="text-red-400" />
                      )}
                      <span className="font-bold text-sm">
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                      {result.status && (
                        <span className="text-xs text-gray-500">
                          (Status: {result.status})
                        </span>
                      )}
                    </div>

                    <pre className="text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(result.data || result, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 p-6 border border-yellow-700/50 bg-yellow-900/10">
          <h3 className="text-lg font-bold text-yellow-400 mb-2">
            Setup Instructions
          </h3>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>
              <strong>1.</strong> Add <code className="bg-black px-2 py-1">CRON_SECRET</code> to
              Vercel environment variables
            </li>
            <li>
              <strong>2.</strong> For local testing, add{' '}
              <code className="bg-black px-2 py-1">NEXT_PUBLIC_CRON_SECRET_TEST</code> to
              .env.local (same value as CRON_SECRET)
            </li>
            <li>
              <strong>3.</strong> Cron jobs run automatically on schedule in production
            </li>
            <li>
              <strong>4.</strong> Use "Test Now" buttons to manually trigger jobs
            </li>
          </ol>
        </div>

        <div className="mt-8 p-6 border border-gray-800 bg-zinc-900">
          <h3 className="text-lg font-bold mb-4">Cron Schedule Reference</h3>
          <div className="text-sm text-gray-400 space-y-1 font-mono">
            <div>
              <span className="text-gray-500">*</span> {' = '}any value
            </div>
            <div>
              <span className="text-gray-500">*/5</span> {' = '}every 5 units
            </div>
            <div>
              <span className="text-gray-500">0 10 * * *</span> {' = '}daily at 10:00 UTC
            </div>
            <div>
              <span className="text-gray-500">*/5 * * * *</span> {' = '}every 5 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
