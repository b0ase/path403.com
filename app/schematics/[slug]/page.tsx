'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { useCallback, useState, useEffect } from 'react'

// Dynamic import to avoid SSR issues with tldraw
const SchematicsEditor = dynamic(
  () => import('@/components/SchematicsEditor'),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500">Loading editor...</div> }
)

// Project metadata
const projectMeta: Record<string, { title: string; description: string; stack: string[] }> = {
  'ninja-punk-girls': {
    title: 'Ninja Punk Girls',
    description: 'NFT platform with marketplace, minting, and 3D viewer',
    stack: ['Next.js 14', 'Prisma', 'Supabase', 'BSV', 'Three.js']
  },
  'zerodice': {
    title: 'Zero Dice',
    description: 'Provably fair blockchain dice gaming platform',
    stack: ['Next.js', 'BSV', 'Supabase']
  },
  'audex': {
    title: 'Audex',
    description: 'Audio exchange platform for decentralized music distribution',
    stack: ['Next.js', 'BSV', 'Supabase']
  },
  'oneshotcomics': {
    title: 'OneShot Comics',
    description: 'Digital comic book publishing and reading platform',
    stack: ['Next.js', 'BSV']
  },
  'osinka-kalaso': {
    title: 'Osinka Kalaso',
    description: 'Virtual world and gaming environment',
    stack: ['Next.js', 'Three.js']
  },
  'vexvoid': {
    title: 'VexVoid',
    description: 'Future-tech fashion brand AV client',
    stack: ['Next.js']
  },
  'b0ase': {
    title: 'b0ase.com',
    description: 'This venture studio platform - 500+ API routes, 100+ models',
    stack: ['Next.js 16', 'Prisma', 'Supabase', 'BSV']
  }
}

export default function SchematicPage() {
  const params = useParams()
  const slug = params.slug as string
  const project = projectMeta[slug]
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Load saved schematic from localStorage
  const [initialData, setInitialData] = useState<any>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`schematic-${slug}`)
    if (saved) {
      try {
        setInitialData(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved schematic:', e)
      }
    }
  }, [slug])

  const handleSave = useCallback((data: any) => {
    setSavedStatus('saving')
    try {
      localStorage.setItem(`schematic-${slug}`, JSON.stringify(data))
      setSavedStatus('saved')
      setTimeout(() => setSavedStatus('idle'), 2000)
    } catch (e) {
      console.error('Failed to save schematic:', e)
      setSavedStatus('idle')
    }
  }, [slug])

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/schematics" className="text-zinc-500 hover:text-white">
            Back to Schematics
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/schematics"
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <FiArrowLeft />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="border-l border-zinc-800 pl-4">
            <h1 className="font-bold">{project.title}</h1>
            <p className="text-xs text-zinc-500">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stack tags */}
          <div className="hidden md:flex gap-2">
            {project.stack.slice(0, 3).map(tech => (
              <span
                key={tech}
                className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-400 rounded font-mono"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Save status */}
          {savedStatus === 'saved' && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <FiSave size={12} /> Saved
            </span>
          )}
          {savedStatus === 'saving' && (
            <span className="text-xs text-zinc-500">Saving...</span>
          )}
        </div>
      </div>

      {/* Editor - full height */}
      <div className="flex-1 relative">
        <SchematicsEditor
          projectSlug={slug}
          projectName={project.title}
          initialData={initialData}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
