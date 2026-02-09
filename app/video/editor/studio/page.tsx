'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FiArrowLeft, FiFilm, FiZap, FiHome } from 'react-icons/fi'
import VideoStudio from '@/components/video/VideoStudio'

export default function VideoStudioPage() {
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleSave = (videoBlob: Blob) => {
    console.log('Project saved:', videoBlob)
  }

  const handleExport = (videoBlob: Blob, format: string) => {
    console.log('Exporting video as:', format)
    // Create download link
    const url = URL.createObjectURL(videoBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `video-export.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation Bar */}
      <div className="border-b border-zinc-800 bg-black px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/video"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Video</span>
            </Link>

            <div className="h-4 w-px bg-zinc-800" />

            <div className="flex items-center gap-2">
              <FiFilm className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold uppercase tracking-wider">Video Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/video/library"
              className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white text-xs uppercase tracking-wider transition-colors"
            >
              <FiFilm className="w-3 h-3" />
              Library
            </Link>
            <Link
              href="/video/editor"
              className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white text-xs uppercase tracking-wider transition-colors"
            >
              <FiZap className="w-3 h-3" />
              Chaos Mixer
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white text-xs uppercase tracking-wider transition-colors"
            >
              <FiHome className="w-3 h-3" />
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Studio Interface */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-zinc-950/50 backdrop-blur-sm border border-zinc-900 rounded-pillar overflow-hidden flex flex-col h-[800px]">
          <VideoStudio
            initialVideoFile={videoFile}
            onSave={handleSave}
            onExport={handleExport}
          />
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-zinc-600 px-2 font-mono">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              SYSTEM_ACTIVE
            </span>
            <span>STUDIO_VERSION: 1.0.4_BETA</span>
          </div>
          <div className="flex items-center gap-6">
            <span>MEM: 12.4GB</span>
            <span>NET: 1.2GB/S</span>
          </div>
        </div>
      </main>
    </motion.div>
  )
}
