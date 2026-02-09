'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiGithub, FiUser, FiCode, FiGitBranch, FiStar, FiEye, FiZap,
  FiMapPin, FiLink, FiTwitter, FiUsers, FiCalendar, FiTrendingUp,
  FiArrowLeft, FiExternalLink
} from 'react-icons/fi';

// Types
type DeveloperProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio?: string | null;
  location?: string | null;
  blog?: string | null;
  twitter_username?: string | null;
  followers?: number;
  following?: number;
  public_repos?: number;
  created_at?: string;
  social_links?: Record<string, string> & { github?: string };
};

type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  created_at: string;
  homepage?: string | null;
  license?: { name: string } | null;
};

// Language color mapping
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Solidity: '#AA6746',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Dart: '#00B4AB',
};

// Format numbers
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

export default function DeveloperProfilePage({ params }: { params: Promise<{ developerId: string }> }) {
  const { developerId } = use(params);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'name'>('stars');

  // Check if this is a UUID (database user) or GitHub username
  // UUIDs have format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(developerId);
  const isGitHubUser = !isUUID;
  const githubUsername = isGitHubUser ? developerId : null;

  useEffect(() => {
    if (!developerId) return;

    async function fetchData() {
      try {
        if (isGitHubUser && githubUsername) {
          // Fetch directly from GitHub API
          const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${githubUsername}`),
            fetch(`https://api.github.com/users/${githubUsername}/repos?per_page=100&sort=updated`),
          ]);

          if (!userRes.ok) throw new Error('GitHub user not found');

          const userData = await userRes.json();
          setDeveloper({
            id: developerId,
            username: userData.login,
            full_name: userData.name || userData.login,
            avatar_url: userData.avatar_url,
            bio: userData.bio,
            location: userData.location,
            blog: userData.blog,
            twitter_username: userData.twitter_username,
            followers: userData.followers,
            following: userData.following,
            public_repos: userData.public_repos,
            created_at: userData.created_at,
          });

          if (reposRes.ok) {
            const reposData = await reposRes.json();
            setRepos(reposData);
          }
        } else {
          // Fetch from our API for database users
          const devResponse = await fetch(`/api/developers/${developerId}`);
          if (!devResponse.ok) throw new Error('Developer not found');
          const devData = await devResponse.json();
          setDeveloper(devData);

          const reposResponse = await fetch(`/api/developers/${developerId}/repos`);
          if (reposResponse.ok) {
            const reposData = await reposResponse.json();
            setRepos(reposData);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [developerId, isGitHubUser, githubUsername]);

  // Sort repos
  const sortedRepos = [...repos].sort((a, b) => {
    if (sortBy === 'stars') return b.stargazers_count - a.stargazers_count;
    if (sortBy === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-zinc-500 font-mono text-sm">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error || 'Developer not found'}</p>
          <Link href="/developers" className="text-blue-400 hover:underline">
            ← Back to Developers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/developers"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <FiArrowLeft size={14} />
          Back to Developers
        </Link>

        {/* Profile Header */}
        <div className="border border-zinc-800 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {developer.avatar_url ? (
                <img
                  src={developer.avatar_url}
                  alt={developer.full_name || ''}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-zinc-700"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                  <FiUser className="w-12 h-12 text-zinc-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{developer.full_name}</h1>
                  <p className="text-xl text-zinc-500 font-mono">@{developer.username}</p>
                  {developer.bio && (
                    <p className="text-zinc-400 mt-3 max-w-2xl">{developer.bio}</p>
                  )}
                </div>

                <a
                  href={`https://github.com/${developer.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm font-mono"
                >
                  <FiGithub />
                  View on GitHub
                  <FiExternalLink size={12} />
                </a>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500">
                {developer.location && (
                  <span className="flex items-center gap-1">
                    <FiMapPin size={14} />
                    {developer.location}
                  </span>
                )}
                {developer.blog && (
                  <a
                    href={developer.blog.startsWith('http') ? developer.blog : `https://${developer.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <FiLink size={14} />
                    {developer.blog.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {developer.twitter_username && (
                  <a
                    href={`https://twitter.com/${developer.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <FiTwitter size={14} />
                    @{developer.twitter_username}
                  </a>
                )}
                {developer.created_at && (
                  <span className="flex items-center gap-1">
                    <FiCalendar size={14} />
                    Joined {formatDate(developer.created_at)}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                {developer.followers !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{formatNumber(developer.followers)}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Followers</div>
                  </div>
                )}
                {developer.following !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{formatNumber(developer.following)}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Following</div>
                  </div>
                )}
                {developer.public_repos !== undefined && (
                  <div className="text-center">
                    <div className="text-xl font-bold">{formatNumber(developer.public_repos)}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Repos</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Repositories Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold uppercase tracking-tight">
              Repositories ({repos.length})
            </h2>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('stars')}
                className={`px-3 py-1 text-xs font-mono uppercase ${
                  sortBy === 'stars'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                } transition-colors`}
              >
                Stars
              </button>
              <button
                onClick={() => setSortBy('updated')}
                className={`px-3 py-1 text-xs font-mono uppercase ${
                  sortBy === 'updated'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                } transition-colors`}
              >
                Updated
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1 text-xs font-mono uppercase ${
                  sortBy === 'name'
                    ? 'bg-white text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                } transition-colors`}
              >
                Name
              </button>
            </div>
          </div>

          {/* Repo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedRepos.map((repo, index) => (
              <motion.div
                key={repo.id}
                className="border border-zinc-800 p-5 hover:border-zinc-600 transition-colors group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors truncate"
                  >
                    {repo.name}
                  </a>
                  {repo.language && (
                    <span
                      className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${languageColors[repo.language] || '#666'}20`,
                        color: languageColors[repo.language] || '#999',
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: languageColors[repo.language] || '#666' }}
                      />
                      {repo.language}
                    </span>
                  )}
                </div>

                <p className="text-zinc-500 text-sm mb-4 line-clamp-2">
                  {repo.description || 'No description'}
                </p>

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {repo.topics.slice(0, 5).map(topic => (
                      <span
                        key={topic}
                        className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <FiStar size={12} />
                      {formatNumber(repo.stargazers_count)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiGitBranch size={12} />
                      {formatNumber(repo.forks_count)}
                    </span>
                    <span className="text-zinc-600">
                      Updated {formatDate(repo.updated_at)}
                    </span>
                  </div>

                  <Link
                    href={`/mint?repo=${encodeURIComponent(repo.html_url)}`}
                    className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase transition-all"
                  >
                    Tokenize
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {repos.length === 0 && (
            <div className="text-center py-16 text-zinc-500 border border-zinc-800">
              <p>No public repositories found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
