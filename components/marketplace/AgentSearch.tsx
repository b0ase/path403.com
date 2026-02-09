'use client';

import { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

/**
 * Agent Search and Filter Component
 *
 * Provides UI for filtering agents by:
 * - Capabilities (multi-select)
 * - Model
 * - Hourly rate range
 * - Sort options
 */

interface AgentSearchProps {
  onSearch: (filters: AgentSearchFilters) => void;
}

export interface AgentSearchFilters {
  capabilities: string[];
  model?: string;
  minRate?: number;
  maxRate?: number;
  sort: string;
}

const commonCapabilities = [
  'Full-stack development',
  'Frontend development',
  'Backend development',
  'API design',
  'Database design',
  'Smart contracts',
  'Blockchain',
  'System architecture',
  'Code review',
  'Documentation',
  'Testing',
  'DevOps',
  'UI/UX design',
  'Data analysis',
  'Machine learning',
  'Security audit',
];

const modelOptions = [
  { value: '', label: 'Any Model' },
  { value: 'claude-sonnet-4.5', label: 'Claude Sonnet 4.5' },
  { value: 'claude-opus-4.5', label: 'Claude Opus 4.5' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gemini', label: 'Gemini' },
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'contracts', label: 'Most Contracts' },
];

export default function AgentSearch({ onSearch }: AgentSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [model, setModel] = useState<string>('');
  const [minRate, setMinRate] = useState<string>('');
  const [maxRate, setMaxRate] = useState<string>('');
  const [sort, setSort] = useState<string>('recent');

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(capability) ? prev.filter((c) => c !== capability) : [...prev, capability]
    );
  };

  const clearCapability = (capability: string) => {
    setSelectedCapabilities((prev) => prev.filter((c) => c !== capability));
  };

  const clearAllFilters = () => {
    setSelectedCapabilities([]);
    setModel('');
    setMinRate('');
    setMaxRate('');
    setSort('recent');
  };

  const handleSearch = () => {
    const filters: AgentSearchFilters = {
      capabilities: selectedCapabilities,
      model: model || undefined,
      minRate: minRate ? parseFloat(minRate) : undefined,
      maxRate: maxRate ? parseFloat(maxRate) : undefined,
      sort,
    };
    onSearch(filters);
  };

  const hasActiveFilters =
    selectedCapabilities.length > 0 || model || minRate || maxRate || sort !== 'recent';

  return (
    <div className="border border-zinc-900 mb-8">
      {/* Filter Toggle Bar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-white hover:text-zinc-400 transition-colors font-mono uppercase tracking-wider flex items-center gap-2"
          >
            <FaFilter className="text-xs" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {hasActiveFilters && (
            <>
              <span className="text-zinc-800">|</span>
              <button
                onClick={clearAllFilters}
                className="text-xs text-zinc-600 hover:text-white transition-colors font-mono uppercase tracking-wider"
              >
                Clear All
              </button>
            </>
          )}
        </div>

        {/* Active Filters Count */}
        {selectedCapabilities.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 font-mono">
              {selectedCapabilities.length} capabilit{selectedCapabilities.length !== 1 ? 'ies' : 'y'} selected
            </span>
          </div>
        )}
      </div>

      {/* Selected Capabilities Pills */}
      {selectedCapabilities.length > 0 && (
        <div className="p-4 border-b border-zinc-900 flex flex-wrap gap-2">
          {selectedCapabilities.map((capability) => (
            <button
              key={capability}
              onClick={() => clearCapability(capability)}
              className="text-xs bg-zinc-900 text-white px-3 py-1 font-mono flex items-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              {capability}
              <FaTimes className="text-[10px] text-zinc-600" />
            </button>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-6 space-y-6">
          {/* Capabilities Selection */}
          <div>
            <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-3 block">
              Capabilities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonCapabilities.map((capability) => (
                <button
                  key={capability}
                  onClick={() => toggleCapability(capability)}
                  className={`text-xs px-3 py-2 font-mono transition-colors ${
                    selectedCapabilities.includes(capability)
                      ? 'bg-white text-black'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {capability}
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              AI Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rate Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
                Min Rate (£/hr)
              </label>
              <input
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div>
              <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
                Max Rate (£/hr)
              </label>
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                placeholder="1000"
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="w-full bg-white text-black px-6 py-3 hover:bg-zinc-200 transition-colors font-mono uppercase tracking-wider text-sm"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
