'use client';

import { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

interface ProfileSetupStepProps {
  githubUsername?: string;
  onComplete: (data: {
    bio?: string;
    skills?: string[];
    hourlyRate?: number;
    portfolioUrls?: string[];
    availability?: string;
  }) => void;
  onBack: () => void;
}

const commonSkills = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Go',
  'Rust',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Kubernetes',
  'AI/ML',
  'Blockchain',
  'BSV',
  'Solidity',
  'Smart Contracts',
];

export default function ProfileSetupStep({
  githubUsername,
  onComplete,
  onBack,
}: ProfileSetupStepProps) {
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>(['']);
  const [availability, setAvailability] = useState('immediate');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const addPortfolioUrl = () => {
    setPortfolioUrls((prev) => [...prev, '']);
  };

  const updatePortfolioUrl = (index: number, value: string) => {
    setPortfolioUrls((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removePortfolioUrl = (index: number) => {
    setPortfolioUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user ID
      const userIdResponse = await fetch('/api/auth/me');
      const userData = await userIdResponse.json();

      const response = await fetch('/api/developer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          bio: bio.trim() || undefined,
          skills,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          portfolioUrls: portfolioUrls.filter((url) => url.trim()),
          availability,
        }),
      });

      if (response.ok) {
        onComplete({
          bio: bio.trim() || undefined,
          skills,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
          portfolioUrls: portfolioUrls.filter((url) => url.trim()),
          availability,
        });
      } else {
        alert('Failed to save profile. Please try again.');
      }
    } catch (error) {
      alert('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-2">Set Up Your Developer Profile</h2>
      <p className="text-gray-400 mb-6">
        Tell clients about your skills and experience.
      </p>

      {/* Bio */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Bio <span className="text-gray-500">(Optional)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell clients about yourself, your experience, and what you specialize in..."
          rows={4}
          maxLength={500}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">{bio.length}/500 characters</p>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Skills <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {commonSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                skills.includes(skill)
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Custom Skills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {skills
            .filter((skill) => !commonSkills.includes(skill))
            .map((skill) => (
              <span
                key={skill}
                className="bg-sky-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
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
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            placeholder="Add custom skill..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 text-sm"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaPlus />
          </button>
        </div>
        {skills.length === 0 && (
          <p className="text-xs text-red-400 mt-1">Select at least one skill</p>
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
            placeholder="50"
            min="0"
            step="0.01"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
          />
          <span className="text-gray-400">/hour</span>
        </div>
      </div>

      {/* Portfolio URLs */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Portfolio URLs <span className="text-gray-500">(Optional)</span>
        </label>
        <div className="space-y-2">
          {portfolioUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updatePortfolioUrl(index, e.target.value)}
                placeholder="https://yourportfolio.com"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
              />
              {portfolioUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePortfolioUrl(index)}
                  className="text-red-400 hover:text-red-300 px-3"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
        </div>
        {portfolioUrls.length < 10 && (
          <button
            type="button"
            onClick={addPortfolioUrl}
            className="mt-2 text-sm text-sky-400 hover:text-sky-300 flex items-center gap-2"
          >
            <FaPlus className="text-xs" /> Add another URL
          </button>
        )}
      </div>

      {/* Availability */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-2">
          Availability <span className="text-red-400">*</span>
        </label>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
        >
          <option value="immediate">Available Immediately</option>
          <option value="within_week">Within 1 Week</option>
          <option value="within_month">Within 1 Month</option>
          <option value="not_available">Not Currently Available</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || skills.length === 0}
          className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}
