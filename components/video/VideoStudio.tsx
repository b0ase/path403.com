'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FiScissors,
  FiDownload,
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiSettings,
  FiType,
  FiImage,
  FiMusic,
  FiLayers,
  FiRotateCcw,
  FiRotateCw,
  FiSave,
  FiUpload,
  FiFilm
} from 'react-icons/fi'
import TokenizeModal, { TokenizationOptions } from './TokenizeModal'

interface VideoStudioProps {
  initialVideoFile?: File | null
  onSave?: (videoBlob: Blob) => void
  onExport?: (videoBlob: Blob, format: string) => void
}

export default function VideoStudio({
  initialVideoFile,
  onSave,
  onExport
}: VideoStudioProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [selectedTool, setSelectedTool] = useState<string>('select')
  const [showTokenizeModal, setShowTokenizeModal] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(initialVideoFile || null)
  const [videoMetadata, setVideoMetadata] = useState({
    title: 'Untitled Video',
    duration: 0,
    size: 0,
    url: ''
  })
  const [resolution, setResolution] = useState('1920x1080')
  const [frameRate, setFrameRate] = useState('30')
  const [quality, setQuality] = useState(85)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tools = [
    { id: 'select', name: 'Select', icon: <FiLayers className="w-4 h-4" /> },
    { id: 'trim', name: 'Trim', icon: <FiScissors className="w-4 h-4" /> },
    { id: 'text', name: 'Text', icon: <FiType className="w-4 h-4" /> },
    { id: 'image', name: 'Image', icon: <FiImage className="w-4 h-4" /> },
    { id: 'audio', name: 'Audio', icon: <FiMusic className="w-4 h-4" /> },
  ]

  const exportFormats = [
    { id: 'mp4', name: 'MP4', quality: '1080p' },
    { id: 'webm', name: 'WebM', quality: '720p' },
    { id: 'mov', name: 'MOV', quality: '4K' },
  ]

  useEffect(() => {
    const initializeStudio = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize Video Studio:', error)
        setIsLoading(false)
      }
    }
    initializeStudio()
  }, [])

  useEffect(() => {
    if (videoFile && videoRef.current) {
      const url = URL.createObjectURL(videoFile)
      videoRef.current.src = url

      videoRef.current.onloadedmetadata = () => {
        setVideoMetadata({
          title: videoFile.name.replace(/\.[^/.]+$/, ''),
          duration: videoRef.current?.duration || 0,
          size: videoFile.size,
          url: url
        })
        setDuration(videoRef.current?.duration || 0)
      }

      return () => URL.revokeObjectURL(url)
    }
  }, [videoFile])

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
        videoRef.current.load()
      }
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
    }
  }, [])

  const handleTokenize = (protocol: string, options: TokenizationOptions) => {
    console.log('Tokenizing video with protocol:', protocol, options)
    alert(`Video "${videoMetadata.title}" will be tokenized using ${protocol} protocol!`)
    setShowTokenizeModal(false)
  }

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        try {
          await videoRef.current.play()
          setIsPlaying(true)
        } catch (error) {
          console.warn('Video play interrupted:', error)
          setIsPlaying(false)
        }
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSave = () => {
    console.log('Saving project...')
    if (onSave) {
      onSave(new Blob())
    }
  }

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}...`)
    if (onExport) {
      onExport(new Blob(), format)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white border-t-transparent animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Video Studio</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-widest">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-black text-white flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b border-zinc-800 bg-black p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 border border-zinc-800">
                <FiFilm className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm uppercase tracking-wider">Video Studio</span>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Professional Editor</p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <FiSave className="w-4 h-4" />
                Save
              </button>
              <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
                <FiRotateCcw className="w-4 h-4 text-zinc-400" />
              </button>
              <button className="p-2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors">
                <FiRotateCw className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
              >
                <FiDownload className="w-3 h-3" />
                {format.name}
              </button>
            ))}

            <button
              onClick={() => setShowTokenizeModal(true)}
              disabled={!videoFile}
              className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tokenize
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Tools */}
        <div className="w-16 border-r border-zinc-800 bg-zinc-950 p-2 flex flex-col gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`w-12 h-12 flex items-center justify-center transition-all ${selectedTool === tool.id
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                }`}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Center - Video Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video Container */}
          <div className="flex-1 bg-zinc-950 p-6 flex items-center justify-center min-h-0">
            <div className="relative w-full max-w-4xl">
              {!videoFile ? (
                <div
                  className="aspect-video bg-zinc-900 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload className="w-12 h-12 text-zinc-600 mb-4" />
                  <p className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-1">Drop video here</p>
                  <p className="text-zinc-600 text-xs">or click to browse</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-auto bg-black"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    muted={isMuted}
                  />

                  {/* Video Overlay Controls */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={handlePlayPause}
                      className="p-4 bg-black/60 border border-white/20 hover:bg-black/80 transition-colors"
                    >
                      {isPlaying ? (
                        <FiPause className="w-8 h-8" />
                      ) : (
                        <FiPlay className="w-8 h-8" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Timeline Controls */}
          <div className="border-t border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={handlePlayPause}
                disabled={!videoFile}
                className="p-2 hover:bg-zinc-900 border border-zinc-800 transition-colors disabled:opacity-50"
              >
                {isPlaying ? (
                  <FiPause className="w-5 h-5" />
                ) : (
                  <FiPlay className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={!videoFile}
                className="p-2 hover:bg-zinc-900 border border-zinc-800 transition-colors disabled:opacity-50"
              >
                {isMuted ? (
                  <FiVolumeX className="w-5 h-5" />
                ) : (
                  <FiVolume2 className="w-5 h-5" />
                )}
              </button>

              <span className="text-xs font-mono text-zinc-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  disabled={!videoFile}
                  className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer disabled:opacity-50"
                  style={{
                    background: duration > 0
                      ? `linear-gradient(to right, #ffffff 0%, #ffffff ${(currentTime / duration) * 100}%, #27272a ${(currentTime / duration) * 100}%, #27272a 100%)`
                      : '#27272a'
                  }}
                />
              </div>

              <button className="p-2 hover:bg-zinc-900 border border-zinc-800 transition-colors">
                <FiSettings className="w-5 h-5 text-zinc-400" />
              </button>

              <button className="p-2 hover:bg-zinc-900 border border-zinc-800 transition-colors">
                <FiMaximize className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Timeline Track */}
            <div className="h-20 bg-zinc-900 border border-zinc-800 p-2">
              {videoFile ? (
                <div className="h-full bg-zinc-800 border border-zinc-700 flex items-center px-3">
                  <div className="flex items-center gap-2">
                    <FiFilm className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-400 font-mono truncate max-w-[200px]">
                      {videoMetadata.title}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="text-xs text-zinc-600 uppercase tracking-widest">No video loaded</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-72 border-l border-zinc-800 bg-zinc-950 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <FiSettings className="w-4 h-4" />
              Properties
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-600"
                >
                  <option value="1920x1080">1920x1080 (HD)</option>
                  <option value="3840x2160">3840x2160 (4K)</option>
                  <option value="1280x720">1280x720 (720p)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Frame Rate
                </label>
                <select
                  value={frameRate}
                  onChange={(e) => setFrameRate(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-zinc-600"
                >
                  <option value="30">30 fps</option>
                  <option value="60">60 fps</option>
                  <option value="24">24 fps</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {videoFile && (
                <div className="pt-4 border-t border-zinc-800">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                    Video Info
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Name</span>
                      <span className="text-zinc-300 truncate max-w-[120px]">{videoMetadata.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Duration</span>
                      <span className="text-zinc-300 font-mono">{formatTime(videoMetadata.duration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Size</span>
                      <span className="text-zinc-300 font-mono">
                        {(videoMetadata.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload new video */}
              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <FiUpload className="w-4 h-4" />
                  {videoFile ? 'Change Video' : 'Upload Video'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tokenize Modal */}
      <TokenizeModal
        isOpen={showTokenizeModal}
        onClose={() => setShowTokenizeModal(false)}
        onTokenize={handleTokenize}
        videoTitle={videoMetadata.title}
        videoDuration={videoMetadata.duration}
        videoSize={videoMetadata.size}
        videoUrl={videoMetadata.url}
      />
    </div>
  )
}
