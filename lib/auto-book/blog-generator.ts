import { generateText, generateJSON } from "@/lib/ai/gemini";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface GeneratedBlogPost {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  tags: string[];
  category: string;
}

export interface ContentIdea {
  id: string;
  url: string;
  title: string;
  source_type: string;
  tags: string[];
  notes: string;
}

const B0ASE_VOICE_GUIDELINES = `
Voice Guidelines for b0ase.com blog posts:

TONE:
- Direct, no-nonsense, slightly irreverent
- Professional but not corporate - we're builders, not suits
- Confident without being arrogant
- Use "we" when referring to b0ase

STYLE:
- Short paragraphs (2-4 sentences max)
- Bold key points with **double asterisks**
- Use concrete examples over abstract theory
- End sections with a punchy one-liner when appropriate
- No emoji in body text
- British English spellings (tokenisation not tokenization)

STRUCTURE:
- Hook the reader in first 2 sentences
- Use only H2 (##) headings - NEVER H1 or H3
- Each section should make one clear point
- Include a "what this means for you" angle
- End with clear next step or CTA to richard@b0ase.com

TOPICS WE COVER:
- AI agents and automation
- Blockchain/BSV tokenisation
- Software development practices
- Startup/business building
- UK tech ecosystem
- Applied AI (not theoretical ML papers)

THINGS TO AVOID:
- Buzzword soup ("leverage", "synergy", "paradigm shift")
- Obvious filler ("In today's fast-paced world...")
- Over-promising ("revolutionise everything")
- Hedge words ("might", "perhaps", "maybe")
- Passive voice when active works better
`;

export class BlogGenerator {
  /**
   * Fetch unused content ideas from the database
   */
  static async getContentIdeas(limit: number = 3): Promise<ContentIdea[]> {
    const { data, error } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('used', false)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching content ideas:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Mark content ideas as used
   */
  static async markIdeasAsUsed(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('content_ideas')
      .update({ used: true, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (error) {
      console.error('Error marking ideas as used:', error);
    }
  }

  /**
   * Generate a blog topic from content ideas
   */
  static async generateTopic(ideas: ContentIdea[]): Promise<{ topic: string; angle: string }> {
    const ideaSummary = ideas.map(i =>
      `- ${i.title || i.url} (${i.source_type})${i.notes ? `: ${i.notes}` : ''}`
    ).join('\n');

    const prompt = `
You are a content strategist for b0ase.com, a UK-based venture studio that builds AI agents, blockchain integrations, and web applications.

Given these content ideas/sources:
${ideaSummary}

Generate ONE compelling blog topic that:
1. Is relevant to b0ase.com's audience (developers, founders, tech-savvy business owners)
2. Has a clear angle or opinion (not just "What is X")
3. Can be written as an 800-1200 word post
4. Ties into one of: AI agents, blockchain/BSV, software development, or startup building

Return JSON:
{
  "topic": "The main topic/title idea",
  "angle": "The specific angle or argument we'll make"
}
`;

    return await generateJSON(prompt);
  }

  /**
   * Generate the full blog post
   */
  static async generatePost(topic: string, angle: string, ideas: ContentIdea[]): Promise<GeneratedBlogPost> {
    const ideaContext = ideas.map(i =>
      `Source: ${i.title || i.url}\nNotes: ${i.notes || 'None'}`
    ).join('\n\n');

    const prompt = `
${B0ASE_VOICE_GUIDELINES}

Write a blog post for b0ase.com.

TOPIC: ${topic}
ANGLE: ${angle}

REFERENCE MATERIAL:
${ideaContext}

REQUIREMENTS:
1. Write 800-1200 words
2. Use ONLY H2 headings (##) - never H1 or H3
3. Start with a hook that grabs attention
4. Make 3-5 clear points with evidence/examples
5. End with a CTA mentioning richard@b0ase.com or our Telegram
6. Be opinionated - take a stance

Return the post as JSON:
{
  "title": "The article title (compelling, not clickbait)",
  "subtitle": "A one-line subtitle expanding on the title",
  "excerpt": "2-3 sentence summary for meta description (max 160 chars)",
  "content": "The full markdown content (NOT including frontmatter)",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "category": "One of: AI, Blockchain, Development, Business, Tech"
}
`;

    const result = await generateJSON(prompt);

    // Generate slug from title
    const slug = result.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      ...result,
      slug
    };
  }

  /**
   * Format the post as a markdown file with frontmatter
   */
  static formatAsMarkdown(post: GeneratedBlogPost): string {
    const today = new Date().toISOString().split('T')[0];

    return `---
title: "${post.title.replace(/"/g, '\\"')}"
subtitle: "${post.subtitle.replace(/"/g, '\\"')}"
date: "${today}"
author: "b0ase"
category: "${post.category}"
tags: ${JSON.stringify(post.tags)}
featured: false
excerpt: "${post.excerpt.replace(/"/g, '\\"')}"
generated: true
---

${post.content}
`;
  }

  /**
   * Save the post to the content/blog directory
   */
  static async savePost(post: GeneratedBlogPost): Promise<string> {
    const markdown = this.formatAsMarkdown(post);
    const filePath = path.join(process.cwd(), 'content', 'blog', `${post.slug}.md`);

    await fs.writeFile(filePath, markdown, 'utf-8');

    return filePath;
  }

  /**
   * Generate the blog.ts entry for this post
   */
  static generateBlogEntry(post: GeneratedBlogPost): string {
    const today = new Date().toISOString().split('T')[0];
    const wordCount = post.content.split(/\s+/).length;
    const readTime = Math.max(3, Math.ceil(wordCount / 200));

    return `    {
        slug: '${post.slug}',
        title: '${post.title.replace(/'/g, "\\'")}',
        description: '${post.excerpt.replace(/'/g, "\\'")}',
        date: '${today}',
        author: { name: 'b0ase', url: 'https://b0ase.com' },
        company: { name: 'b0ase.com', url: 'https://b0ase.com' },
        readTime: '${readTime} min read',
        tags: ${JSON.stringify(post.tags)},
        featured: false
    },`;
  }

  /**
   * Full pipeline: fetch ideas -> generate -> save -> return entry
   */
  static async generateDailyPost(): Promise<{
    success: boolean;
    post?: GeneratedBlogPost;
    filePath?: string;
    blogEntry?: string;
    error?: string;
  }> {
    try {
      // 1. Fetch content ideas
      const ideas = await this.getContentIdeas(3);

      if (ideas.length === 0) {
        return {
          success: false,
          error: 'No unused content ideas available. Add ideas at /dashboard/auto-book/ideas'
        };
      }

      // 2. Generate topic
      const { topic, angle } = await this.generateTopic(ideas);
      console.log(`Generated topic: ${topic} | Angle: ${angle}`);

      // 3. Generate full post
      const post = await this.generatePost(topic, angle, ideas);
      console.log(`Generated post: ${post.title}`);

      // 4. Save to file system
      const filePath = await this.savePost(post);
      console.log(`Saved to: ${filePath}`);

      // 5. Mark ideas as used
      await this.markIdeasAsUsed(ideas.map(i => i.id));

      // 6. Generate blog.ts entry
      const blogEntry = this.generateBlogEntry(post);

      return {
        success: true,
        post,
        filePath,
        blogEntry
      };
    } catch (error) {
      console.error('Error generating daily post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
