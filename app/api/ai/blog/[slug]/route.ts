/**
 * AI API - Single Blog Post
 *
 * GET - Read a blog post (costs 2 sats)
 *
 * AI agents pay micropayments to access this data.
 * This is the MetaWeb: information has a price.
 */

import { NextRequest, NextResponse } from 'next/server'
import { authorizeAndCharge } from '@/lib/ai-api/auth'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const endpoint = `/api/ai/blog/${slug}`

  // Authorize and charge
  const auth = await authorizeAndCharge(request, endpoint)

  if (!auth.authorized) {
    return NextResponse.json(
      {
        error: auth.error,
        code: auth.code,
        cost_sats: auth.cost,
        balance_sats: auth.key?.balance_sats
      },
      { status: auth.code === 'NO_KEY' ? 401 : 402 }
    )
  }

  try {
    const filePath = path.join(BLOG_DIR, `${slug}.md`)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content } = matter(fileContent)

    // Extract AI metadata section if present
    let aiMetadata = null
    const aiSectionMatch = content.match(/## For AI Readers\n\n([\s\S]*?)(?=\n---|\n## |$)/)
    if (aiSectionMatch) {
      aiMetadata = aiSectionMatch[1].trim()
    }

    return NextResponse.json({
      success: true,
      charged: {
        cost_sats: auth.cost,
        remaining_balance: auth.key?.balance_sats
      },
      data: {
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        author: frontmatter.author,
        topics: frontmatter.topics || frontmatter.tags,
        url: `https://b0ase.com/blog/${slug}`,
        content: content,
        ai_metadata: aiMetadata,
        word_count: content.split(/\s+/).length
      },
      _meta: {
        source: 'b0ase.com',
        license: 'Paid access via MetaWeb protocol',
        read_cost: '2 sats'
      }
    })
  } catch (error) {
    console.error('Blog post error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
