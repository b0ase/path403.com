"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaSpinner, FaLock } from 'react-icons/fa';

export default function FiverrExplorerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fiverrUrl, setFiverrUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await getSupabaseBrowserClient().auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Check if user is admin@b0ase.com
  const isAuthorizedUser = user?.email === 'admin@b0ase.com';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-sky-500 mr-3" />
          <span className="text-xl text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to view this content.</p>
          <Link href="/login" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorizedUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">This content is only available to the authorized user.</p>
          <Link href="/auth/gigs" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Go to Gigs Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleScrape = async () => {
    if (!fiverrUrl) {
      setError('Please enter a Fiverr URL.');
      return;
    }
    setIsLoading(true);
    setScrapedData(null);
    setError(null);

    try {
      const response = await fetch('/api/scrape-fiverr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fiverrUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to scrape data from API');
      }

      const data = await response.json();
      setScrapedData(data);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="mb-6">
        {/* Link back to Gigs Hub can be adjusted if necessary */}
        <Link href="/gigs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Gigs Hub
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Fiverr Explorer</h1>
      <p className="text-gray-400 mb-8">Explore and analyze Fiverr gig opportunities.</p>
      
      <div className="space-y-6">
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-850">
          <h2 className="text-xl font-semibold mb-4 text-sky-400">Fiverr Explorer Overview</h2>
          <p className="text-gray-300 mb-4">
            This page contains personalized Fiverr explorer content for admin@b0ase.com.
          </p>
          {/* Add more Fiverr explorer content as needed */}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-400 mb-4">
          Enter a Fiverr gig URL or seller profile URL to fetch details. This tool can help with competitor analysis, pricing research, and understanding gig structures, aligning with our Research, Strategy, and Action Plan phases.
        </p>

        <div className="mb-4">
          <label htmlFor="fiverrUrl" className="block text-sm font-medium text-gray-300 mb-1">
            Fiverr URL:
          </label>
          <input
            type="url"
            id="fiverrUrl"
            name="fiverrUrl"
            value={fiverrUrl}
            onChange={(e) => setFiverrUrl(e.target.value)}
            placeholder="e.g., https://www.fiverr.com/username/your-gig-slug"
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleScrape}
          disabled={isLoading}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50 transition-colors duration-150 ease-in-out"
        >
          {isLoading ? 'Scraping...' : 'Scrape Fiverr Data'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-800 border border-red-700 text-red-200 rounded-md">
            <p><span className="font-semibold">Error:</span> {error}</p>
          </div>
        )}

        {scrapedData && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3 text-green-400">Scraped Data:</h2>
            <pre className="bg-gray-900 p-4 rounded-md text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(scrapedData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-850 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-teal-400">How to Use This Data:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
          <li>**Research:** Identify keywords, common pricing, gig structures, and top seller strategies.</li>
          <li>**Strategy:** Validate your gig offerings and USPs against successful competitors. Refine your pricing tiers.</li>
          <li>**Action Plan:** Extract inspiration for gig titles, descriptions, and common extras for your own gigs.</li>
          <li>Copy relevant JSON snippets or key data points into your notes on the <Link href="/gigs/research" className="text-blue-400 hover:underline">Research Page</Link>.</li>
        </ul>
      </div>
    </div>
  );
} 