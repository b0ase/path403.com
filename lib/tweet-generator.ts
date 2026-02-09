/**
 * Engagement-Optimized Tweet Generator
 *
 * Uses AI to transform blog content into tweets that follow X algorithm best practices:
 * - Hooks that drive replies
 * - Value-first content
 * - Questions that invite engagement
 * - No spammy hashtags
 * - Links at the end, not beginning
 *
 * Based on X_STRATEGY.md from Claude HQ
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface TweetGeneratorInput {
  title: string;
  excerpt?: string;
  content?: string;
  url: string;
  tags?: string[];
}

export interface GeneratedTweet {
  content: string;
  template: string;
  hook: string;
  hasQuestion: boolean;
}

/**
 * Sanitize user input to prevent prompt injection attacks.
 * - Truncates to reasonable length
 * - Removes potential instruction delimiters
 * - Escapes patterns that could manipulate the AI
 */
function sanitizeInput(input: string | undefined, maxLength: number = 500): string {
  if (!input) return '';

  return input
    // Truncate to max length
    .substring(0, maxLength)
    // Remove potential prompt injection patterns
    .replace(/```/g, '')
    .replace(/---/g, '')
    .replace(/\n{3,}/g, '\n\n')
    // Remove instruction-like patterns
    .replace(/^(ignore|disregard|forget|override|system|assistant|user):/gim, '')
    .replace(/\[INST\]|\[\/INST\]|<\|.*?\|>/gi, '')
    .trim();
}

/**
 * Sanitize URL - only allow http/https URLs
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

const TWEET_TEMPLATES = [
  {
    name: 'teaser',
    description: 'Challenge a common belief, then provide value',
    example: `Most people think [X].

They're wrong.

Here's what actually matters:
• Point 1
• Point 2
• Point 3

What would you add?

→ {url}`,
  },
  {
    name: 'challenge',
    description: 'Hot take with reasoning',
    example: `Hot take: [controversial but defensible position]

Before you @ me, here's my reasoning:
[1-2 sentence summary]

Agree? Disagree? Reply and tell me why.

→ {url}`,
  },
  {
    name: 'question_lead',
    description: 'Start with an engaging question',
    example: `What's the biggest mistake you see in [topic]?

For me, it's [main point].

Here's why that matters:
[Brief value nugget]

What's yours?

→ {url}`,
  },
  {
    name: 'value_drop',
    description: 'Lead with pure value',
    example: `Key insight most people miss about [topic]:

[Actual valuable takeaway]

This matters because [why].

Thoughts?

→ {url}`,
  },
  {
    name: 'story_hook',
    description: 'Personal experience angle',
    example: `I used to think [common belief].

Then I discovered [insight].

The difference:
[Before vs After or Key Learning]

Anyone else experienced this?

→ {url}`,
  },
];

/**
 * Generate an engagement-optimized tweet from blog content
 */
export async function generateEngagementTweet(
  input: TweetGeneratorInput
): Promise<GeneratedTweet> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          content: { type: 'STRING' },
          template: { type: 'STRING' },
          hook: { type: 'STRING' },
          hasQuestion: { type: 'BOOLEAN' },
        },
        required: ['content', 'template', 'hook', 'hasQuestion'],
      },
    } as any,
  });

  // Sanitize all user inputs to prevent prompt injection
  const safeTitle = sanitizeInput(input.title, 200);
  const safeExcerpt = sanitizeInput(input.excerpt, 300);
  const safeContent = sanitizeInput(input.content, 500);
  const safeUrl = sanitizeUrl(input.url);
  const safeTags = input.tags?.slice(0, 10).map(t => sanitizeInput(t, 50)).join(', ') || '';

  if (!safeUrl) {
    throw new Error('Invalid URL provided');
  }

  const prompt = `You are a Twitter/X engagement expert. Generate a tweet that will drive replies and engagement.

BLOG CONTENT TO PROMOTE:
Title: ${safeTitle}
${safeExcerpt ? `Excerpt: ${safeExcerpt}` : ''}
${safeContent ? `Content preview: ${safeContent}...` : ''}
URL: ${safeUrl}
${safeTags ? `Topics: ${safeTags}` : ''}

TWEET REQUIREMENTS (CRITICAL):
1. Maximum 270 characters (leave room for URL)
2. MUST include a question or call-to-action that invites replies
3. MUST provide actual value or insight, not just announce the blog post
4. NO hashtags (they look spammy)
5. NO emojis at the start (looks automated)
6. Put the URL at the END, on its own line, preceded by "→"
7. Make people want to reply before they even click the link

TEMPLATES TO CHOOSE FROM:
${TWEET_TEMPLATES.map((t) => `${t.name}: ${t.description}\nExample:\n${t.example}`).join('\n\n')}

ANTI-PATTERNS TO AVOID:
- "Check out my new blog post about..."
- "Just published: [title]"
- "New post: [title] [url]"
- Starting with emojis
- Multiple hashtags
- Generic "read more" CTAs
- Asking for likes/retweets

Generate ONE tweet that extracts a genuinely interesting insight from this content and frames it to drive discussion.

Return JSON with:
- content: the full tweet text (max 270 chars before URL)
- template: which template you used
- hook: the opening hook (first line)
- hasQuestion: whether the tweet contains a question`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content in AI response');
    }

    const parsed = JSON.parse(text) as GeneratedTweet;

    // Ensure URL is appended correctly
    if (!parsed.content.includes(safeUrl)) {
      parsed.content = `${parsed.content.trim()}\n\n→ ${safeUrl}`;
    }

    return parsed;
  } catch (error) {
    console.error('[TweetGenerator] Error generating tweet:', error);

    // Fallback to a safe template
    return {
      content: `${safeTitle}\n\nThoughts?\n\n→ ${safeUrl}`,
      template: 'fallback',
      hook: safeTitle,
      hasQuestion: true,
    };
  }
}

/**
 * Generate multiple tweet variations for A/B testing or selection
 */
export async function generateTweetVariations(
  input: TweetGeneratorInput,
  count: number = 3
): Promise<GeneratedTweet[]> {
  const tweets: GeneratedTweet[] = [];

  for (let i = 0; i < count; i++) {
    const tweet = await generateEngagementTweet(input);
    tweets.push(tweet);
  }

  return tweets;
}

/**
 * Quick validation that a tweet follows engagement best practices
 */
export function validateTweet(content: string): {
  valid: boolean;
  issues: string[];
  score: number;
} {
  const issues: string[] = [];
  let score = 100;

  // Check for hashtags
  const hashtags = content.match(/#\w+/g) || [];
  if (hashtags.length > 0) {
    issues.push(`Contains ${hashtags.length} hashtag(s) - remove them`);
    score -= hashtags.length * 10;
  }

  // Check for link position
  const urlMatch = content.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    const urlIndex = content.indexOf(urlMatch[0]);
    const contentLength = content.length;
    if (urlIndex < contentLength * 0.7) {
      issues.push('URL should be at the end of the tweet');
      score -= 15;
    }
  }

  // Check for question
  if (!content.includes('?')) {
    issues.push('No question mark - consider adding a question to drive replies');
    score -= 10;
  }

  // Check length
  const cleanContent = content.replace(/https?:\/\/[^\s]+/, '').trim();
  if (cleanContent.length > 270) {
    issues.push('Tweet text (excluding URL) exceeds 270 characters');
    score -= 20;
  }

  // Check for spam patterns
  const spamPatterns = [
    /^(check out|just published|new post|new blog)/i,
    /like and retweet/i,
    /follow me/i,
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      issues.push('Contains spam-like pattern');
      score -= 25;
    }
  }

  // Check for emoji at start (common emoji ranges)
  const firstChar = content.charAt(0);
  const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27BF]/;
  if (emojiRegex.test(firstChar) || emojiRegex.test(content.substring(0, 2))) {
    issues.push('Starts with emoji - looks automated');
    score -= 10;
  }

  return {
    valid: issues.length === 0,
    issues,
    score: Math.max(0, score),
  };
}
