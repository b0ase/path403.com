#!/usr/bin/env npx tsx

/**
 * CLI Tool for Generating Engagement-Optimized Tweets
 *
 * Usage:
 *   npx tsx scripts/generate-tweet.ts --url "https://b0ase.com/blog/my-post" --title "My Blog Post Title"
 *   npx tsx scripts/generate-tweet.ts --blog-slug "my-post-slug"
 *   npx tsx scripts/generate-tweet.ts --interactive
 *
 * Options:
 *   --url          URL to include in the tweet
 *   --title        Title/topic of the content
 *   --excerpt      Short description of the content
 *   --blog-slug    Fetch content from existing blog post by slug
 *   --variations   Number of variations to generate (default: 1)
 *   --interactive  Interactive mode - prompts for input
 *   --queue        Add to post queue after approval
 *   --help         Show help
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface TweetInput {
  title: string;
  excerpt?: string;
  url: string;
  tags?: string[];
}

interface GeneratedTweet {
  content: string;
  template: string;
  hook: string;
  hasQuestion: boolean;
}

const TWEET_TEMPLATES = [
  { name: 'teaser', description: 'Challenge a common belief' },
  { name: 'challenge', description: 'Hot take with reasoning' },
  { name: 'question_lead', description: 'Start with engaging question' },
  { name: 'value_drop', description: 'Lead with pure value' },
  { name: 'story_hook', description: 'Personal experience angle' },
];

async function generateTweet(input: TweetInput): Promise<GeneratedTweet> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are a Twitter/X engagement expert. Generate a tweet that will drive replies.

CONTENT TO PROMOTE:
Title: ${input.title}
${input.excerpt ? `Excerpt: ${input.excerpt}` : ''}
URL: ${input.url}
${input.tags?.length ? `Topics: ${input.tags.join(', ')}` : ''}

REQUIREMENTS (CRITICAL):
1. Max 270 characters (leave room for URL)
2. MUST include a question or call-to-action for replies
3. MUST provide actual value, not just announce
4. NO hashtags
5. NO emojis at start
6. URL at END on its own line with "→"
7. Make people want to reply BEFORE clicking

TEMPLATES:
- teaser: Challenge common belief, provide value, ask for additions
- challenge: Hot take with reasoning, invite agreement/disagreement
- question_lead: Start with question, share your take, ask theirs
- value_drop: Key insight, why it matters, ask for thoughts
- story_hook: Used to think X, discovered Y, ask if others relate

Return JSON: { content, template, hook, hasQuestion }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text) {
    throw new Error('No response from AI');
  }

  const parsed = JSON.parse(text) as GeneratedTweet;

  if (!parsed.content.includes(input.url)) {
    parsed.content = `${parsed.content.trim()}\n\n→ ${input.url}`;
  }

  return parsed;
}

function validateTweet(content: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  const hashtags = content.match(/#\w+/g) || [];
  if (hashtags.length > 0) {
    issues.push(`Contains ${hashtags.length} hashtag(s)`);
    score -= hashtags.length * 10;
  }

  const urlMatch = content.match(/https?:\/\/[^\s]+/);
  if (urlMatch && content.indexOf(urlMatch[0]) < content.length * 0.7) {
    issues.push('URL should be at end');
    score -= 15;
  }

  if (!content.includes('?')) {
    issues.push('No question mark');
    score -= 10;
  }

  const cleanContent = content.replace(/https?:\/\/[^\s]+/, '').trim();
  if (cleanContent.length > 270) {
    issues.push(`Text too long (${cleanContent.length}/270)`);
    score -= 20;
  }

  return { score: Math.max(0, score), issues };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.length === 0) {
    console.log(`
Tweet Generator CLI

Usage:
  npx tsx scripts/generate-tweet.ts [options]

Options:
  --url <url>          URL to include in tweet
  --title <title>      Title/topic of content
  --excerpt <text>     Short description
  --variations <n>     Number of variations (default: 1)
  --help               Show this help

Examples:
  npx tsx scripts/generate-tweet.ts --title "AI Agents Guide" --url "https://b0ase.com/blog/ai-agents"
  npx tsx scripts/generate-tweet.ts --title "Why we use BSV" --url "https://b0ase.com/blog/why-bsv" --variations 3
`);
    process.exit(0);
  }

  // Parse arguments
  const getArg = (name: string): string | undefined => {
    const idx = args.indexOf(`--${name}`);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const title = getArg('title');
  const url = getArg('url');
  const excerpt = getArg('excerpt');
  const variations = parseInt(getArg('variations') || '1', 10);

  if (!title || !url) {
    console.error('Error: --title and --url are required');
    process.exit(1);
  }

  console.log('\n🐦 Tweet Generator\n');
  console.log(`Title: ${title}`);
  console.log(`URL: ${url}`);
  if (excerpt) console.log(`Excerpt: ${excerpt}`);
  console.log(`Variations: ${variations}`);
  console.log('\n' + '─'.repeat(50) + '\n');

  for (let i = 0; i < variations; i++) {
    if (variations > 1) {
      console.log(`\n📝 Variation ${i + 1}/${variations}\n`);
    }

    try {
      const tweet = await generateTweet({ title, url, excerpt });
      const validation = validateTweet(tweet.content);

      console.log(`Template: ${tweet.template}`);
      console.log(`Hook: "${tweet.hook}"`);
      console.log(`Has Question: ${tweet.hasQuestion ? 'Yes' : 'No'}`);
      console.log(`Score: ${validation.score}/100`);

      if (validation.issues.length > 0) {
        console.log(`Issues: ${validation.issues.join(', ')}`);
      }

      console.log('\n' + '─'.repeat(50));
      console.log('\n' + tweet.content);
      console.log('\n' + '─'.repeat(50));

      // Character count
      const charCount = tweet.content.length;
      console.log(`\nCharacters: ${charCount}/280`);
    } catch (error: any) {
      console.error(`Error generating tweet: ${error.message}`);
    }

    if (i < variations - 1) {
      console.log('\n' + '═'.repeat(50) + '\n');
    }
  }

  console.log('\n✅ Done\n');
}

main().catch(console.error);
