import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import matter from 'gray-matter';

// List of posts that are confirmed live on production
const LIVE_POSTS = [
  '100x-business-with-ai-agents', // 100X Your Business with AI Agents
  'building-ai-agents-that-actually-work', // Building AI Agents That Actually Work (database, NOW LIVE!)
  'markdown-auto-discovery-experiment', // The Third Audience: Making b0ase.com AI-Readable
  'why-vibecoding-needs-professional-maintenance', // Why Vibecoding Needs Professional Maintenance
  'why-we-build-on-bsv', // Why We Build on BSV
  'why-developers-deserve-equity', // Why Developers Deserve Equity in What They Build
  'turn-your-code-into-capital', // Turn Your Code Into Capital
  'build-real-products-fast-with-b0ase', // Build Real Products, Fast
  'ai-powered-content-businesses', // Building AI-Powered Content Businesses
  'ai-money-2026-faceless-content-trend', // How to Make $1M in 2026 with AI
  '28-startup-lessons-learned-the-hard-way', // 28 Startup Lessons
  'why-bitcoin-authentication', // Why Bitcoin Authentication Matters
  'bitcoin-auth-technical-guide', // Bitcoin Authentication: Technical Integration Guide
  'quishing', // The Square Trap: Why Security Teams Miss QR Phishing
  'node-js-security-update-jan-2026', // Tuesday, January 13, 2026 Security Releases
  'why-your-startup-looks-cheap', // Why Your Startup Looks Cheap
  'scale-your-business-with-ai-agents', // Scale Your Business with AI Agents
  'replace-your-marketing-team-with-ai', // Replace Your Marketing Team with AI
  'ship-faster-with-ai-development', // Ship Faster: AI-Powered Development
  'automate-customer-support-24-7', // Automate Customer Support 24/7
  'why-small-teams-beat-big-agencies', // Why Small Teams Beat Big Agencies
  'the-real-cost-of-building-in-house', // The Real Cost of Building In-House
  'from-idea-to-launch-in-two-weeks', // From Idea to Launch in Two Weeks
  'ai-agents-vs-chatbots', // AI Agents vs Chatbots
  'building-for-blockchain-without-the-complexity', // Building for Blockchain Without the Complexity
  'the-component-library-approach', // The Component Library Approach
  'what-makes-a-good-technical-spec', // What Makes a Good Technical Spec
  'starting-2026-with-a-new-approach', // Starting 2026 with a New Approach
];

interface BlogPost {
  slug: string;
  title: string;
  source: 'markdown' | 'database' | 'both';
  queued: boolean;
  live: boolean;
  formatted: boolean;
  publishedAt: string | null;
}

export async function GET() {
  try {
    const posts: BlogPost[] = [];
    const seenSlugs = new Set<string>();

    // 1. Get markdown files
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const slug = file.replace('.md', '');
      const filePath = path.join(blogDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      const isLive = LIVE_POSTS.includes(slug);

      // Get publish date from frontmatter
      let publishedAt: string | null = null;
      if (data.date) {
        publishedAt = new Date(data.date).toISOString();
      } else if (data.publishedAt) {
        publishedAt = new Date(data.publishedAt).toISOString();
      }

      posts.push({
        slug,
        title: data.title || slug,
        source: 'markdown',
        queued: false,
        live: isLive,
        formatted: isLive, // Assume live posts are formatted
        publishedAt,
      });

      seenSlugs.add(slug);
    }

    // 2. Get database posts
    const supabase = await createClient();
    const { data: dbPosts, error } = await supabase
      .from('blog_posts')
      .select('slug, title, status, created_at, published_at')
      .order('created_at', { ascending: false });

    if (!error && dbPosts) {
      for (const dbPost of dbPosts) {
        const dbPublishedAt = (dbPost as any).published_at || (dbPost as any).created_at || null;

        if (seenSlugs.has(dbPost.slug)) {
          // Post exists in both - update source and use DB date if available
          const existingPost = posts.find(p => p.slug === dbPost.slug);
          if (existingPost) {
            existingPost.source = 'both';
            // Use database date if markdown doesn't have one
            if (!existingPost.publishedAt && dbPublishedAt) {
              existingPost.publishedAt = dbPublishedAt;
            }
          }
        } else {
          // Database-only post
          const isLive = LIVE_POSTS.includes(dbPost.slug);
          const isPublished = dbPost.status === 'published';

          posts.push({
            slug: dbPost.slug,
            title: dbPost.title,
            source: 'database',
            queued: isPublished && !isLive, // In DB as published but not live = queued
            live: isLive,
            formatted: false,
            publishedAt: dbPublishedAt,
          });

          seenSlugs.add(dbPost.slug);
        }
      }
    }

    // Sort by publish date (most recent first), posts without dates go to the end
    posts.sort((a, b) => {
      // Both have dates - compare them (most recent first)
      if (a.publishedAt && b.publishedAt) {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      // Only a has date - a comes first
      if (a.publishedAt && !b.publishedAt) return -1;
      // Only b has date - b comes first
      if (!a.publishedAt && b.publishedAt) return 1;
      // Neither has date - sort alphabetically
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
