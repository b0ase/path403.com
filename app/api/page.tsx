'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ApiReferencePage() {
  const [internalApiMarkdown, setInternalApiMarkdown] = useState('');
  const [mpcMarkdown, setMpcMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarkdownFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const internalApiResponse = await fetch('/INTERNAL_API_DESIGN.md');
        if (!internalApiResponse.ok) {
          throw new Error(`Failed to fetch INTERNAL_API_DESIGN.md: ${internalApiResponse.statusText}`);
        }
        const internalApiText = await internalApiResponse.text();
        setInternalApiMarkdown(internalApiText);

        const mpcResponse = await fetch('/MPC_DESIGN.md');
        if (!mpcResponse.ok) {
          throw new Error(`Failed to fetch MPC_DESIGN.md: ${mpcResponse.statusText}`);
        }
        const mpcText = await mpcResponse.text();
        setMpcMarkdown(mpcText);

      } catch (err: any) {
        console.error("Error fetching markdown files:", err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkdownFiles();
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 text-gray-200 bg-gray-950 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-3">b0ase.com API &amp; MPC Documentation</h1>
        <p className="text-center text-gray-400 text-base sm:text-lg">
          This page renders the design documents for the b0ase.com internal API and the Model Context Protocol (MPC).
        </p>
        <p className="text-center text-yellow-500 mt-2 font-semibold">
          Important: Functional API endpoints for programmatic access are located under <code className='text-yellow-300 bg-gray-700 px-1 rounded'>/api/v1/...</code> routes and are not browsable here.
        </p>
      </header>

      {/* Links to raw markdown files at the top */}
      <div className="mb-10 flex flex-wrap justify-center gap-4">
        <a
          href="/INTERNAL_API_DESIGN.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-sky-700 hover:bg-sky-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition-colors duration-150"
        >
          View Raw INTERNAL_API_DESIGN.md
        </a>
        <a
          href="/MPC_DESIGN.md"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 sm:px-6 sm:py-3 bg-purple-700 hover:bg-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md transition-colors duration-150"
        >
          View Raw MPC_DESIGN.md
        </a>
      </div>

      {isLoading && (
        <div className="text-center text-xl text-gray-400 py-10">
          Loading documentation...
        </div>
      )}

      {error && (
        <div className="text-center text-xl text-red-400 py-10 bg-red-900/20 p-4 rounded-md">
          <p className="font-semibold">Error loading documentation:</p>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-12">
          <section className="p-4 sm:p-6 md:p-8 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl">
            <h2 className="!text-sky-400 border-b-2 !border-sky-500 pb-2 mb-6 text-xl sm:text-2xl md:text-3xl font-semibold">Internal API Design</h2>
            <div className="mb-6">
              <ReactMarkdown>{internalApiMarkdown}</ReactMarkdown>
            </div>
          </section>

          <section className="p-4 sm:p-6 md:p-8 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl">
            <h2 className="!text-purple-400 border-b-2 !border-purple-500 pb-2 mb-6 text-xl sm:text-2xl md:text-3xl font-semibold">Model Context Protocol (MPC) Design</h2>
            <div className="mb-6">
              <ReactMarkdown>{mpcMarkdown}</ReactMarkdown>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}