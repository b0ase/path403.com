'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiMusic, FiPlay, FiExternalLink, FiHeadphones, FiDisc, FiMic, FiArrowRight, FiHome } from 'react-icons/fi';

// b0ase Label Artists
const artists = [
  {
    id: 'b0ase',
    name: 'b0ase',
    role: 'Electronic Producer',
    description: 'Experimental electronic music producer exploring the boundaries of ambient, glitch, and AI-generated soundscapes.',
    genre: 'Electronic / Ambient',
    sunoProfile: 'https://suno.com/@b0ase',
    status: 'Active',
    trackCount: 6,
    tracks: [
      {
        title: 'Fragmented Signals',
        url: 'https://cdn1.suno.ai/40669a72-62ac-48ba-aa64-611e77afc410.mp3',
        plays: 9,
        duration: '2:57',
        status: 'Released'
      },
      {
        title: 'Echoes of the Hollow Bamboo',
        url: 'https://cdn1.suno.ai/929f9b6a-56f2-4349-8ed5-b7411d59e1df.mp3',
        plays: 12,
        duration: '3:12',
        status: 'Released'
      },
      {
        title: 'Digital Reverie',
        url: 'https://cdn1.suno.ai/7b613644-bd1f-472d-964f-03dc2d332fbb.mp3',
        plays: 8,
        duration: '2:45',
        status: 'Released'
      },
      {
        title: 'A Deeper Chaos',
        url: 'https://cdn1.suno.ai/b7df49bb-0ab3-4c23-9bbc-4cca5917bc7e.mp3',
        plays: 15,
        duration: '3:28',
        status: 'Released'
      },
      {
        title: 'Digital Haiku',
        url: 'https://cdn1.suno.ai/30f8712c-585f-4438-8717-284b41cd1bc0.mp3',
        plays: 11,
        duration: '2:33',
        status: 'Released'
      },
      {
        title: 'Digital Haiku (Alt)',
        url: 'https://cdn1.suno.ai/4d163863-9ebd-493e-bb8e-8723294a8365.mp3',
        plays: 7,
        duration: '2:35',
        status: 'Released'
      }
    ]
  },
  {
    id: 'vexvoid',
    name: 'VEX V0ID',
    role: 'AI Artist',
    description: 'AI-powered artist creating atmospheric dark ambient and experimental electronic music.',
    genre: 'Dark Ambient / Atmospheric',
    sunoProfile: 'https://suno.com/@v3xv0id',
    status: 'Active',
    trackCount: 11,
    tracks: [
      { title: 'Echoes in the Abyss', status: 'Released', album: 'Echoes Series' },
      { title: 'Echoes in the Dust', status: 'Released', album: 'Echoes Series' },
      { title: 'Echoes in the Fog', status: 'Released', album: 'Echoes Series' },
      { title: 'Echoes in the Mist', status: 'Released', album: 'Echoes Series' },
      { title: 'Echoes in the Abyss (Alt)', status: 'Released', album: 'Echoes Series' },
      { title: 'Digital Phantoms', status: 'Released', album: 'Digital Dreams' },
      { title: 'Neural Dreams', status: 'Released', album: 'Digital Dreams' },
      { title: 'Synthetic Memories', status: 'Released', album: 'Digital Dreams' },
      { title: 'Void Walker', status: 'Released', album: 'Dark Ambient' },
      { title: 'Shadow Protocol', status: 'Released', album: 'Dark Ambient' },
      { title: 'Quantum Echoes', status: 'Unreleased', album: 'Upcoming' }
    ]
  },
  {
    id: 'cherryx',
    name: 'CherryX',
    role: 'AI Artist',
    description: 'Street art inspired electronic music featuring cherry-themed soundscapes and urban aesthetics.',
    genre: 'Electronic / Urban',
    sunoProfile: null,
    status: 'Active',
    trackCount: 14,
    tracks: [
      { title: 'Cherry Graffiti', url: '/music/Cherry Graffiti.mp3', status: 'Released', album: 'Graffiti Series' },
      { title: 'Cherry Graffiti (Alt 1)', url: '/music/Cherry Graffiti (1).mp3', status: 'Released', album: 'Graffiti Series' },
      { title: 'Cherry Graffiti (Alt 2)', url: '/music/Cherry Graffiti (2).mp3', status: 'Released', album: 'Graffiti Series' },
      { title: 'Digital Ghosts', url: '/music/Digital Ghosts.mp3', status: 'Released', album: 'Urban Dreams' },
      { title: 'Echo Chamber', url: '/music/Echo Chamber.mp3', status: 'Released', album: 'Urban Dreams' },
      { title: 'Fragments of Static', url: '/music/Fragments of Static.mp3', status: 'Released', album: 'Static Series' },
      { title: 'Glitch in the Fog', url: '/music/Glitch in the Fog.mp3', status: 'Released', album: 'Static Series' },
      { title: 'Glitch in the Wind', url: '/music/Glitch in the Wind.mp3', status: 'Released', album: 'Static Series' },
      { title: 'Midnight Graffiti Symphony', url: '/music/Midnight Graffiti Symphony.mp3', status: 'Released', album: 'Graffiti Series' },
      { title: 'Midnight Murals', url: '/music/Midnight Murals.mp3', status: 'Released', album: 'Graffiti Series' },
      { title: 'Shadow Steps', url: '/music/Shadow Steps.mp3', status: 'Released', album: 'Urban Dreams' },
      { title: 'Shattered Frequencies', url: '/music/Shattered Frequencies.mp3', status: 'Released', album: 'Static Series' },
      { title: 'Static Dreams', url: '/music/Static Dreams.mp3', status: 'Released', album: 'Static Series' },
      { title: 'Static Reverie', url: '/music/Static Reverie.mp3', status: 'Released', album: 'Static Series' }
    ]
  },
  {
    id: 'aivj',
    name: 'AIVJ',
    role: 'AI VJ / Producer',
    description: 'AI Video Jockey creating immersive audiovisual experiences. Industrial electronic soundscapes for visual performances.',
    genre: 'Industrial / Electronic',
    sunoProfile: null,
    status: 'Active',
    trackCount: 11,
    tracks: [
      { title: 'Broken Machine Dreams', status: 'Released', album: 'Machine Series' },
      { title: 'Echoes in the Machine', status: 'Released', album: 'Echoes' },
      { title: 'Echoes in the Rust', status: 'Released', album: 'Echoes' },
      { title: 'Kintsugi Breaks', status: 'Released', album: 'Kintsugi' },
      { title: 'Kōjō no Yami (Factory Darkness)', status: 'Released', album: 'Industrial' },
      { title: 'Neon Rust', status: 'Released', album: 'Industrial' },
      { title: 'Shadow Steps', status: 'Released', album: 'Industrial' },
      { title: 'Shattered Echoes', status: 'Released', album: 'Echoes' },
      { title: 'Shattered Frequencies', status: 'Released', album: 'Industrial' },
      { title: 'Shattered Kintsugi', status: 'Released', album: 'Kintsugi' },
      { title: '都市の静脈 (Veins of the City)', status: 'Released', album: 'Industrial' }
    ]
  },
  {
    id: 'ninjapunk',
    name: 'Ninja Punk Girls',
    role: 'Electronic Rock',
    description: 'High-energy cyberpunk collective blending electronic beats with punk rock attitude.',
    genre: 'Cyberpunk / Electronic Rock',
    sunoProfile: null,
    status: 'Upcoming',
    trackCount: 0,
    tracks: []
  }
];

export default function MusicPage() {
  const [isDark, setIsDark] = useState(true);
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);

  return (
    <motion.div
      className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >


      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 pt-32 pb-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div>
          {/* Page Title */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                <FiMusic className="text-4xl md:text-6xl text-white" />
              </div>
              <div className="flex items-end gap-4">
                <h2 className={`text-4xl md:text-6xl font-bold ${isDark ? 'text-white' : 'text-black'} leading-none tracking-tighter`}>
                  MUSIC
                </h2>
                <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                  ELECTRONIC
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="flex items-baseline gap-8 mb-16"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div>
              <span className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {artists.length}
              </span>
              <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Artists
              </span>
            </div>
            <div>
              <span className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                42
              </span>
              <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tracks
              </span>
            </div>
            <div>
              <span className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                10
              </span>
              <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Albums
              </span>
            </div>
          </motion.div>

          {/* Divider */}
          <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} my-16`} />

          {/* Artists List */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Label Artists
              </h3>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {artists.length} Total
              </span>
            </div>

            {/* Artist Rows */}
            <div className="space-y-2">
              {artists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className={`group border-b ${isDark ? 'border-gray-800 hover:border-gray-600' : 'border-gray-200 hover:border-gray-400'} transition-all duration-300`}
                >
                  <div
                    className="py-6 cursor-pointer"
                    onClick={() => setExpandedArtist(expandedArtist === artist.id ? null : artist.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} w-8`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-4">
                            <h4 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                              {artist.name}
                            </h4>
                            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                              {artist.role}
                            </span>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mt-1`}>
                            {artist.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-12">
                        <div className="hidden md:block text-right">
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            Genre
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {artist.genre}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            Tracks
                          </p>
                          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                            {artist.trackCount}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                            Status
                          </p>
                          <p className={`text-sm font-medium ${artist.status === 'Active'
                              ? 'text-green-500'
                              : artist.status === 'Upcoming'
                                ? 'text-yellow-500'
                                : isDark ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                            {artist.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {artist.sunoProfile && (
                            <a
                              href={artist.sunoProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`p-2 rounded-full transition-all ${isDark
                                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                                  : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                                }`}
                              title="Suno Profile"
                            >
                              <FiExternalLink size={18} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Tracks */}
                    {expandedArtist === artist.id && artist.tracks.length > 0 && (
                      <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
                          {artist.tracks.map((track, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FiPlay size={12} className={`${isDark ? 'text-gray-500' : 'text-gray-600'}`} />
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {track.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                {track.duration && (
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {track.duration}
                                  </span>
                                )}
                                {track.plays && (
                                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                                    {track.plays} plays
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-0.5 rounded ${track.status === 'Released'
                                    ? isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-500/10 text-green-600'
                                    : isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-500/10 text-yellow-600'
                                  }`}>
                                  {track.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                Founded
              </p>
              <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                2024
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                Genre Focus
              </p>
              <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Electronic
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                Distribution
              </p>
              <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                Digital
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                Releases
              </p>
              <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                42+
              </p>
            </div>
          </div>

          {/* Audex Feature Card */}
          <motion.div
            className="mt-16 p-6 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-black to-black rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <FiDisc className="text-purple-400 text-2xl" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">AUDEX</h3>
                  <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded font-mono uppercase">
                    $AUDEX
                  </span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                  AI music platform with speculative markets for AI-generated tunes and artists.
                  Create music like SUNO, then trade popularity futures and invest in AI artist royalties.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <a
                  href="https://www.audex.website/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider hover:from-purple-600 hover:to-pink-600 transition-all text-sm shadow-lg shadow-purple-500/20"
                >
                  <FiMusic size={16} />
                  Launch Audex
                  <FiArrowRight size={14} />
                </a>
                <Link
                  href="/websites/audex-website"
                  className="inline-flex items-center justify-center gap-2 border border-purple-500/30 text-purple-400 px-6 py-2 rounded-full font-mono text-xs uppercase tracking-wider hover:bg-purple-500/10 transition-all"
                >
                  View Project Details
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <div className={`mt-24 pt-8 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className={`px-4 py-2 border rounded-full text-sm ${isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-500'
                    }`}
                >
                  Home
                </Link>
                <a
                  href="https://suno.com/@b0ase"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 border rounded-full text-sm ${isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-300 hover:border-gray-500'
                    }`}
                >
                  Suno
                </a>
                <a
                  href="mailto:music@b0ase.com"
                  className={`px-4 py-2 rounded-full text-sm font-medium ${isDark ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-black text-white hover:bg-gray-800'
                    }`}
                >
                  Contact
                </a>
              </div>

              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                b0ase Label - Electronic Music Collective
              </div>
            </div>
          </div>
        </div>
      </motion.section>

    </motion.div>
  );
}