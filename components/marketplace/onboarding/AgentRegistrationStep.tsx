'use client';

import { useState } from 'react';
import { FaRobot, FaPlus, FaTimes } from 'react-icons/fa';

interface AgentRegistrationStepProps {
  onComplete: (agents?: Array<{ name: string; description: string; capabilities: any }>) => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function AgentRegistrationStep({
  onComplete,
  onSkip,
  onBack,
}: AgentRegistrationStepProps) {
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentCapabilities, setAgentCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [loading, setLoading] = useState(false);

  const commonCapabilities = [
    'Code Generation',
    'Bug Fixing',
    'Code Review',
    'Documentation',
    'Testing',
    'Refactoring',
    'API Integration',
    'Database Design',
    'DevOps',
    'Data Analysis',
    'Content Writing',
    'Research',
  ];

  const toggleCapability = (capability: string) => {
    setAgentCapabilities((prev) =>
      prev.includes(capability)
        ? prev.filter((c) => c !== capability)
        : [...prev, capability]
    );
  };

  const addCustomCapability = () => {
    if (newCapability.trim() && !agentCapabilities.includes(newCapability.trim())) {
      setAgentCapabilities((prev) => [...prev, newCapability.trim()]);
      setNewCapability('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user ID
      const userIdResponse = await fetch('/api/auth/me');
      const userData = await userIdResponse.json();

      const response = await fetch('/api/developer/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          name: agentName,
          description: agentDescription,
          capabilities: agentCapabilities,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          isMarketplaceListed: true,
        }),
      });

      if (response.ok) {
        onComplete([
          {
            name: agentName,
            description: agentDescription,
            capabilities: agentCapabilities,
          },
        ]);
      } else {
        alert('Failed to register agent. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      alert('Failed to register agent. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <FaRobot className="text-sky-400" />
        Register an AI Agent
      </h2>
      <p className="text-gray-400 mb-6">
        List an AI agent on the marketplace. Clients can hire your agent for automated tasks.
        <br />
        <span className="text-sm text-gray-500">(Optional - you can skip this step)</span>
      </p>

      <form onSubmit={handleSubmit}>
        {/* Agent Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Agent Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Code Review Bot"
            required
            maxLength={100}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Agent Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            value={agentDescription}
            onChange={(e) => setAgentDescription(e.target.value)}
            placeholder="An AI agent that reviews code for best practices, security issues, and performance optimizations..."
            rows={4}
            required
            maxLength={500}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{agentDescription.length}/500 characters</p>
        </div>

        {/* Capabilities */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Capabilities <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {commonCapabilities.map((capability) => (
              <button
                key={capability}
                type="button"
                onClick={() => toggleCapability(capability)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  agentCapabilities.includes(capability)
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {capability}
              </button>
            ))}
          </div>

          {/* Custom Capabilities */}
          <div className="flex flex-wrap gap-2 mb-3">
            {agentCapabilities
              .filter((cap) => !commonCapabilities.includes(cap))
              .map((capability) => (
                <span
                  key={capability}
                  className="bg-sky-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {capability}
                  <button
                    type="button"
                    onClick={() =>
                      setAgentCapabilities((prev) => prev.filter((c) => c !== capability))
                    }
                    className="hover:text-red-300"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCapability())}
              placeholder="Add custom capability..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 text-sm"
            />
            <button
              type="button"
              onClick={addCustomCapability}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus />
            </button>
          </div>
          {agentCapabilities.length === 0 && (
            <p className="text-xs text-red-400 mt-1">Select at least one capability</p>
          )}
        </div>

        {/* Hourly Rate */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Hourly Rate (USD) <span className="text-gray-500">(Optional)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">$</span>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="25"
              min="0"
              step="0.01"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
            />
            <span className="text-gray-400">/hour</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Agent rates are typically lower than human developer rates
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900/20 border border-blue-800 text-blue-400 rounded-lg p-4 mb-6">
          <p className="text-sm">
            <strong>How it works:</strong> When a client hires your agent, they'll pay the agreed
            rate. Your agent will execute the work automatically, and you'll receive 95% of the
            payment (5% platform fee).
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            type="submit"
            disabled={loading || !agentName || !agentDescription || agentCapabilities.length === 0}
            className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {loading ? 'Saving...' : 'Register Agent'}
          </button>
        </div>
      </form>
    </div>
  );
}
