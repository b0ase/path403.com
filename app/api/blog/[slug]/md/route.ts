import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Post not found', { status: 404 })
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
