/**
 * AI API - Blog Posts
 *
 * GET - List all blog posts (costs 1 sat)
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

export async function GET(request: NextRequest) {
  const endpoint = '/api/ai/blog'

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
      { status: auth.code === 'NO_KEY' ? 401 : 402 }  // 402 Payment Required
    )
  }

  try {
    // Read all blog posts
    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

    const posts = files.map(filename => {
      const filePath = path.join(BLOG_DIR, filename)
      const content = fs.readFileSync(filePath, 'utf-8')
      const { data: frontmatter } = matter(content)

      return {
        slug: filename.replace('.md', ''),
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        author: frontmatter.author,
        topics: frontmatter.topics || frontmatter.tags,
        url: `https://b0ase.com/blog/${filename.replace('.md', '')}`,
        api_url: `https://b0ase.com/api/ai/blog/${filename.replace('.md', '')}`
      }
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      success: true,
      charged: {
        cost_sats: auth.cost,
        remaining_balance: auth.key?.balance_sats
      },
      data: {
        count: posts.length,
        posts
      },
      _meta: {
        source: 'b0ase.com',
        license: 'Paid access via MetaWeb protocol',
        pricing: '1 sat for list, 2 sats per post'
      }
    })
  } catch (error) {
    console.error('Blog list error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
