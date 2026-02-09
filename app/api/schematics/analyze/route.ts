import { NextResponse } from 'next/server'
import { analyzeCodebase } from '@/lib/codebase-analyzer'

// Map project slugs to their actual filesystem paths
const projectPaths: Record<string, string> = {
  'ninja-punk-girls': '/Volumes/2026/Projects/ninja-punk-girls-com',
  'zerodice': '/Volumes/2026/Projects/zerodice',
  'audex': '/Volumes/2026/Projects/audex',
  'oneshotcomics': '/Volumes/2026/Projects/oneshotcomics-bsv',
  'osinka-kalaso': '/Volumes/2026/Projects/osinka-kalaso',
  'vexvoid': '/Volumes/2026/Projects/vexvoid-AV-client',
  'b0ase': '/Volumes/2026/Projects/b0ase.com'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
  }

  const projectPath = projectPaths[slug]
  if (!projectPath) {
    return NextResponse.json({ error: 'Unknown project' }, { status: 404 })
  }

  const analysis = analyzeCodebase(projectPath, slug)
  if (!analysis) {
    return NextResponse.json({ error: 'Failed to analyze codebase' }, { status: 500 })
  }

  return NextResponse.json(analysis)
}
