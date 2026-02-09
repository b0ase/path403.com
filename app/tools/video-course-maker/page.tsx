'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiVideo,
  FiFileText,
  FiImage,
  FiMic,
  FiUpload,
  FiPlay,
  FiYoutube,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiLayers,
  FiSettings,
  FiBookOpen,
} from 'react-icons/fi';

// Pipeline stages
const PIPELINE_STAGES = [
  {
    id: 'script',
    title: '1. Script Generation',
    icon: FiFileText,
    description: 'AI generates course script from outline or topic',
    details: [
      'Input: Course title, target audience, key topics',
      'AI writes structured script with chapters',
      'Includes speaker notes and timing cues',
      'Markdown format for easy editing',
    ],
    tools: ['Claude API', 'GPT-4', 'Local LLM'],
    output: 'course-script.md',
  },
  {
    id: 'slides',
    title: '2. Slide Generation',
    icon: FiImage,
    description: 'Generate visual slides from script sections',
    details: [
      'Parse script into slide-worthy segments',
      'AI generates slide content + image prompts',
      'Gemini/DALL-E creates visual assets',
      'Code snippets rendered as syntax-highlighted images',
    ],
    tools: ['Gemini 2.0 Flash', 'DALL-E 3', 'Carbon (code)'],
    output: 'slides/*.png',
  },
  {
    id: 'voiceover',
    title: '3. Voice Synthesis',
    icon: FiMic,
    description: 'Convert script to natural AI voiceover',
    details: [
      'Split script into manageable chunks',
      'Generate voice with cheap TTS provider',
      'Multiple voice options (male/female/accent)',
      'Export as high-quality audio files',
    ],
    tools: ['OpenAI TTS', 'Google TTS', 'Coqui TTS', 'Azure TTS'],
    output: 'audio/*.mp3',
  },
  {
    id: 'assembly',
    title: '4. Video Assembly',
    icon: FiLayers,
    description: 'Combine slides + audio into video',
    details: [
      'Sync audio duration with slide transitions',
      'Add intro/outro sequences',
      'Include chapter markers',
      'Render at 1080p/4K',
    ],
    tools: ['FFmpeg', 'Remotion', 'MoviePy'],
    output: 'course-video.mp4',
  },
  {
    id: 'transcript',
    title: '5. Transcript & Metadata',
    icon: FiBookOpen,
    description: 'Generate searchable transcript and SEO metadata',
    details: [
      'Timestamped transcript for YouTube',
      'Chapter markers with timestamps',
      'SEO-optimized title and description',
      'Tags and category suggestions',
    ],
    tools: ['Whisper (verify)', 'Script parser'],
    output: 'transcript.vtt, metadata.json',
  },
  {
    id: 'publish',
    title: '6. YouTube Publish',
    icon: FiYoutube,
    description: 'Automated upload to @BO4SE channel',
    details: [
      'Upload video via YouTube API',
      'Set title, description, tags',
      'Add transcript/captions',
      'Schedule or publish immediately',
    ],
    tools: ['YouTube Data API v3'],
    output: 'Published to @BO4SE',
  },
];

// Cost estimates
const COST_BREAKDOWN = [
  { item: 'Script (Claude/GPT)', cost: '$0.05-0.20', per: 'course' },
  { item: 'Slides (Gemini)', cost: '$0.10-0.50', per: '10 slides' },
  { item: 'Voice (OpenAI TTS)', cost: '$0.015', per: 'minute' },
  { item: 'Video render', cost: '$0.00', per: 'local FFmpeg' },
  { item: 'YouTube upload', cost: '$0.00', per: 'free API' },
];

// Voice providers comparison
const VOICE_PROVIDERS = [
  { name: 'OpenAI TTS', cost: '$15/1M chars', quality: 'Excellent', speed: 'Fast' },
  { name: 'Google TTS', cost: '$4/1M chars', quality: 'Good', speed: 'Fast' },
  { name: 'Azure TTS', cost: '$4/1M chars', quality: 'Excellent', speed: 'Fast' },
  { name: 'Coqui TTS', cost: 'Free (local)', quality: 'Good', speed: 'Slow' },
  { name: 'Piper TTS', cost: 'Free (local)', quality: 'Good', speed: 'Fast' },
];

export default function VideoCourseMarkerPage() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    courseTitle: '',
    targetAudience: '',
    topics: '',
    duration: '30',
    voiceProvider: 'openai',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Course generation pipeline coming soon! This page outlines the architecture.');
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
            <div className="bg-gradient-to-br from-red-500 to-pink-600 p-4 md:p-6 self-start">
              <FiVideo className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                VIDEO COURSE MAKER
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                Automation Pipeline
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-gray-400 max-w-2xl">
              Automated pipeline for producing video courses: AI scripts, generated slides,
              synthetic voiceover, and YouTube publishing. Low-cost, high-volume course production.
            </p>
            <div className="flex gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border border-zinc-700 text-zinc-300 hover:text-white hover:border-white transition-colors"
              >
                All Tools
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                <FiPlay size={14} /> View Courses
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Philosophy Box */}
        <motion.div
          className="mb-12 border border-amber-800/30 bg-amber-900/10 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <h2 className="text-lg font-bold mb-3 text-amber-400">Philosophy: Scripts + Slides, Not AI Video</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Full AI video generation is expensive and unnecessary for educational content.
            A well-written script read by a natural AI voice, paired with clear visual slides,
            delivers the same learning value at 1/100th the cost. This pipeline prioritizes
            <strong className="text-white"> volume and consistency</strong> over flashy production -
            the goal is regular course output to the <strong className="text-white">@BO4SE YouTube channel</strong>.
          </p>
        </motion.div>

        {/* Pipeline Visualization */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-white mb-6 bg-zinc-900 border border-zinc-800 inline-block px-3 py-1 uppercase tracking-widest">
            Production Pipeline
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PIPELINE_STAGES.map((stage, index) => (
              <motion.div
                key={stage.id}
                className={`border p-6 cursor-pointer transition-all ${
                  selectedStage === stage.id
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700'
                }`}
                onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <stage.icon className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{stage.title}</h3>
                      <p className="text-xs text-zinc-500">{stage.output}</p>
                    </div>
                  </div>
                  {index < PIPELINE_STAGES.length - 1 && (
                    <FiArrowRight className="text-zinc-700 hidden lg:block" />
                  )}
                </div>

                <p className="text-zinc-400 text-sm mb-4">{stage.description}</p>

                {selectedStage === stage.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-zinc-800 pt-4 mt-4"
                  >
                    <ul className="space-y-2 mb-4">
                      {stage.details.map((detail, i) => (
                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1">
                      {stage.tools.map((tool, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-400"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two Column Layout: Form + Cost */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Course Generation Form */}
          <motion.div
            className="border border-gray-800 p-8 bg-gray-900/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiSettings className="text-red-400" /> Generate New Course
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Course Title</label>
                <input
                  type="text"
                  value={formData.courseTitle}
                  onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                  placeholder="e.g., Introduction to BSV Smart Contracts"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Audience</label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Developers with JavaScript experience"
                  className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Key Topics (one per line)</label>
                <textarea
                  value={formData.topics}
                  onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                  placeholder="Bitcoin Script basics&#10;OP_PUSH and OP_CHECKSIG&#10;Building a simple contract&#10;Testing and deployment"
                  rows={4}
                  className="w-full px-4 py-3 bg-black border border-zinc-700 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Voice Provider</label>
                  <select
                    value={formData.voiceProvider}
                    onChange={(e) => setFormData({ ...formData, voiceProvider: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-zinc-700 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="openai">OpenAI TTS ($)</option>
                    <option value="google">Google TTS ($)</option>
                    <option value="azure">Azure TTS ($)</option>
                    <option value="coqui">Coqui TTS (Free)</option>
                    <option value="piper">Piper TTS (Free)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-red-600 text-white font-bold uppercase hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
              >
                <FiPlay /> Generate Course
              </button>

              <p className="text-xs text-zinc-500 text-center">
                Pipeline not yet implemented - this page documents the architecture
              </p>
            </form>
          </motion.div>

          {/* Cost Breakdown */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Cost Estimate */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiDollarSign className="text-green-400" /> Cost Per Course (30 min)
              </h3>
              <div className="space-y-2">
                {COST_BREAKDOWN.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{item.item}</span>
                    <span className="text-zinc-300">
                      {item.cost} <span className="text-zinc-500">/ {item.per}</span>
                    </span>
                  </div>
                ))}
                <div className="border-t border-zinc-800 pt-2 mt-2 flex justify-between font-bold">
                  <span className="text-white">Total Estimated</span>
                  <span className="text-green-400">$0.50 - $2.00</span>
                </div>
              </div>
            </div>

            {/* Voice Providers */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiMic className="text-blue-400" /> Voice Provider Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-800">
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Cost</th>
                      <th className="pb-2">Quality</th>
                      <th className="pb-2">Speed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {VOICE_PROVIDERS.map((provider, i) => (
                      <tr key={i} className="border-b border-zinc-800/50">
                        <td className="py-2 text-white">{provider.name}</td>
                        <td className="py-2 text-zinc-400">{provider.cost}</td>
                        <td className="py-2 text-zinc-400">{provider.quality}</td>
                        <td className="py-2 text-zinc-400">{provider.speed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Output Format */}
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <FiUpload className="text-purple-400" /> Output Deliverables
              </h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <strong className="text-white">Video:</strong> 1080p MP4, chapter markers
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <strong className="text-white">Transcript:</strong> VTT captions, full text
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <strong className="text-white">Slides:</strong> PNG exports, editable source
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <strong className="text-white">Script:</strong> Markdown with timing cues
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-green-500" />
                  <strong className="text-white">YouTube:</strong> Auto-published to @BO4SE
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Technical Architecture */}
        <motion.div
          className="mb-12 border border-gray-800 p-8 bg-gray-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-6">Technical Architecture</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-white mb-3">Directory Structure</h3>
              <pre className="text-xs text-zinc-400 bg-black p-4 border border-zinc-800 overflow-x-auto">
{`courses/
├── bsv-smart-contracts/
│   ├── script.md           # AI-generated script
│   ├── slides/
│   │   ├── 001-intro.png
│   │   ├── 002-basics.png
│   │   └── ...
│   ├── audio/
│   │   ├── 001-intro.mp3
│   │   ├── 002-basics.mp3
│   │   └── full-voiceover.mp3
│   ├── output/
│   │   ├── course.mp4
│   │   ├── transcript.vtt
│   │   └── metadata.json
│   └── config.yaml         # Course configuration
└── pipeline/
    ├── generate-script.ts
    ├── generate-slides.ts
    ├── generate-voice.ts
    ├── assemble-video.ts
    └── publish-youtube.ts`}
              </pre>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3">Pipeline Commands</h3>
              <pre className="text-xs text-zinc-400 bg-black p-4 border border-zinc-800 overflow-x-auto">
{`# Generate full course from config
pnpm course:generate courses/bsv-smart-contracts

# Individual stages
pnpm course:script courses/bsv-smart-contracts
pnpm course:slides courses/bsv-smart-contracts
pnpm course:voice courses/bsv-smart-contracts
pnpm course:assemble courses/bsv-smart-contracts
pnpm course:publish courses/bsv-smart-contracts

# Batch generate multiple courses
pnpm course:batch courses/*.yaml

# Preview before publishing
pnpm course:preview courses/bsv-smart-contracts`}
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Integration with /courses */}
        <motion.div
          className="border border-gray-800 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Integration with Course Catalog</h2>
              <p className="text-gray-400">
                Generated courses are automatically added to the /courses page with full metadata,
                transcripts, and YouTube embeds. Each course links back to its source materials.
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-bold hover:border-white hover:text-white transition-colors"
              >
                View Courses
              </Link>
              <a
                href="https://youtube.com/@BO4SE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-500 transition-colors"
              >
                <FiYoutube /> @BO4SE Channel
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
