'use client';

import { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

/**
 * Developer Search and Filter Component
 *
 * Provides UI for filtering developers by:
 * - Skills (multi-select)
 * - Hourly rate range
 * - Availability
 * - Sort options
 */

interface DeveloperSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  skills: string[];
  minRate?: number;
  maxRate?: number;
  availability?: string;
  sort: string;
}

const commonSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Rust',
  'Go',
  'Solidity',
  'Smart Contracts',
  'Blockchain',
  'Web3',
  'AI/ML',
  'DevOps',
  'Cloud',
  'Database',
  'API Design',
  'UI/UX',
];

const availabilityOptions = [
  { value: '', label: 'Any' },
  { value: 'immediate', label: 'Immediate' },
  { value: 'within_week', label: 'Within Week' },
  { value: 'within_month', label: 'Within Month' },
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'contracts', label: 'Most Contracts' },
  { value: 'rating', label: 'Highest Rating' },
];

export default function DeveloperSearch({ onSearch }: DeveloperSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRate, setMinRate] = useState<string>('');
  const [maxRate, setMaxRate] = useState<string>('');
  const [availability, setAvailability] = useState<string>('');
  const [sort, setSort] = useState<string>('recent');

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const clearAllFilters = () => {
    setSelectedSkills([]);
    setMinRate('');
    setMaxRate('');
    setAvailability('');
    setSort('recent');
  };

  const handleSearch = () => {
    const filters: SearchFilters = {
      skills: selectedSkills,
      minRate: minRate ? parseFloat(minRate) : undefined,
      maxRate: maxRate ? parseFloat(maxRate) : undefined,
      availability: availability || undefined,
      sort,
    };
    onSearch(filters);
  };

  const hasActiveFilters =
    selectedSkills.length > 0 || minRate || maxRate || availability || sort !== 'recent';

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
        {selectedSkills.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 font-mono">
              {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
            </span>
          </div>
        )}
      </div>

      {/* Selected Skills Pills */}
      {selectedSkills.length > 0 && (
        <div className="p-4 border-b border-zinc-900 flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => clearSkill(skill)}
              className="text-xs bg-zinc-900 text-white px-3 py-1 font-mono flex items-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              {skill}
              <FaTimes className="text-[10px] text-zinc-600" />
            </button>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-6 space-y-6">
          {/* Skills Selection */}
          <div>
            <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-3 block">
              Skills
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {commonSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-2 font-mono transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-white text-black'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
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

          {/* Availability */}
          <div>
            <label className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-2 block">
              Availability
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-2 text-sm focus:outline-none focus:border-zinc-700"
            >
              {availabilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
