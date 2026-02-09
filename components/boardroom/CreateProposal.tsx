'use client';

import React, { useState } from 'react';

interface CreateProposalProps {
  roomId: string;
  onSubmit: (proposal: {
    title: string;
    description: string;
    options: string[];
    endsAt: string;
    tokenWeighted: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function CreateProposal({ roomId, onSubmit, onCancel }: CreateProposalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['Yes', 'No']);
  const [duration, setDuration] = useState(7); // days
  const [tokenWeighted, setTokenWeighted] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const endsAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString();
      await onSubmit({ title, description, options, endsAt, tokenWeighted });
    } catch (error) {
      console.error('Failed to create proposal:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="bg-black border border-white/20">
      <div className="border-b border-white/20 p-4">
        <h3 className="text-lg font-bold uppercase tracking-wider">
          CREATE PROPOSAL
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
            TITLE
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proposal title..."
            className="w-full bg-black border border-white/20 p-3 text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
            DESCRIPTION
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your proposal..."
            rows={4}
            className="w-full bg-black border border-white/20 p-3 text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none resize-none"
            required
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
            VOTING OPTIONS
          </label>
          <div className="space-y-2">
            {options.map((option, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 bg-black border border-white/20 p-2 text-white placeholder-white/40 focus:border-cyan-400 focus:outline-none text-sm"
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="px-3 border border-white/20 text-white/60 hover:text-red-400 hover:border-red-400"
                  >
                    X
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
            >
              + ADD OPTION
            </button>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/60 mb-2">
            VOTING DURATION
          </label>
          <div className="flex gap-2">
            {[1, 3, 7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDuration(days)}
                className={`px-3 py-2 text-sm border transition-colors ${
                  duration === days
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {/* Token Weighted */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={tokenWeighted}
              onChange={(e) => setTokenWeighted(e.target.checked)}
              className="w-4 h-4 accent-cyan-400"
            />
            <span className="text-sm">
              Token-weighted voting (votes weighted by token balance)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/20">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-white/20 text-white/60 hover:text-white hover:border-white/40 uppercase tracking-wider text-sm"
          >
            CANCEL
          </button>
          <button
            type="submit"
            disabled={submitting || !title || !description}
            className="flex-1 py-3 bg-cyan-400 text-black font-bold uppercase tracking-wider text-sm hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'CREATING...' : 'CREATE PROPOSAL'}
          </button>
        </div>
      </form>
    </div>
  );
}
