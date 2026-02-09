'use client';

import { useState } from 'react';
import { FaGithub, FaCheck, FaTimes } from 'react-icons/fa';

interface GitHubVerificationStepProps {
  onVerified: (data: { username: string; verified: boolean; stars: number }) => void;
}

export default function GitHubVerificationStep({ onVerified }: GitHubVerificationStepProps) {
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter your GitHub username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get current user ID (in real app, get from auth context)
      const userIdResponse = await fetch('/api/auth/me');
      const userData = await userIdResponse.json();

      const response = await fetch('/api/developer/verify-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: githubUsername,
          userId: userData.id,
        }),
      });

      const result = await response.json();

      if (response.ok && result.verified) {
        setVerificationResult(result);
        setTimeout(() => {
          onVerified({
            username: result.username,
            verified: true,
            stars: result.totalStars,
          });
        }, 1500);
      } else {
        setError(
          result.reasons?.join(', ') ||
            'Verification failed. Your account must be at least 90 days old with 3+ public repos.'
        );
        setVerificationResult(result);
      }
    } catch (err) {
      setError('Failed to verify GitHub account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Verify Your GitHub Account</h2>
      <p className="text-gray-400 mb-6">
        To join the marketplace as a developer, we need to verify your GitHub account.
      </p>

      {/* Requirements */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <FaGithub className="text-sky-400" />
          Requirements
        </h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
            Account age: 90+ days
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
            Public repositories: 3+
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-400 rounded-full" />
            Active development history
          </li>
        </ul>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">GitHub Username</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={githubUsername}
            onChange={(e) => setGithubUsername(e.target.value)}
            placeholder="octocat"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
            disabled={loading || !!verificationResult?.verified}
          />
          <button
            onClick={handleVerify}
            disabled={loading || !!verificationResult?.verified}
            className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : verificationResult?.verified ? (
              <>
                <FaCheck /> Verified
              </>
            ) : (
              <>
                <FaGithub /> Verify
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 rounded-lg p-4 mb-6 flex items-start gap-3">
          <FaTimes className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Verification Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {verificationResult?.verified && (
        <div className="bg-green-900/20 border border-green-800 text-green-400 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaCheck className="text-2xl" />
            <div>
              <p className="font-semibold text-lg">Verification Successful!</p>
              <p className="text-sm text-gray-400">Your GitHub account meets all requirements</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Account Age</p>
              <p className="font-semibold">{verificationResult.accountAge} days</p>
            </div>
            <div>
              <p className="text-gray-400">Public Repos</p>
              <p className="font-semibold">{verificationResult.publicRepos}</p>
            </div>
            <div>
              <p className="text-gray-400">Total Stars</p>
              <p className="font-semibold">{verificationResult.totalStars}</p>
            </div>
          </div>
        </div>
      )}

      {/* Partial Result (failed but showing stats) */}
      {verificationResult && !verificationResult.verified && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-400 mb-3">Your Account Stats:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Account Age</p>
              <p className="font-semibold">
                {verificationResult.accountAge} days
                {verificationResult.accountAge < 90 && (
                  <span className="text-red-400 ml-2">(Need 90+)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Public Repos</p>
              <p className="font-semibold">
                {verificationResult.publicRepos}
                {verificationResult.publicRepos < 3 && (
                  <span className="text-red-400 ml-2">(Need 3+)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
