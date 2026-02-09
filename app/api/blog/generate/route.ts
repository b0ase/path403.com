import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDbPool } from '@/lib/database/pool';


// Google Gemini has generous free tier
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const pool = getDbPool();

  try {
    const { contentIdeaId } = await request.json();

    if (!contentIdeaId) {
      return NextResponse.json(
        { error: 'contentIdeaId is required' },
        { status: 400 }
      );
    }

    // Fetch the content idea
    const ideaResult = await pool.query(
      'SELECT * FROM content_ideas WHERE id = $1',
      [contentIdeaId]
    );

    if (ideaResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Content idea not found' },
        { status: 404 }
      );
    }

    const idea = ideaResult.rows[0];

    // Check if already used
    if (idea.used) {
      return NextResponse.json(
        { error: 'This content idea has already been used' },
        { status: 400 }
      );
    }

    // Generate blog post with Gemini (has generous free tier)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
        // @ts-ignore - responseSchema type definition issue in SDK
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            excerpt: { type: 'STRING' },
            content: { type: 'STRING' },
            tags: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            }
          },
          required: ['title', 'excerpt', 'content', 'tags']
        }
      },
    });

    const prompt = `You are a professional technical writer for b0ase.com, a venture studio focused on web development, AI agents, automation, and blockchain integration.

Generate a blog post based on this content idea:

Title: ${idea.title}
URL: ${idea.url}
Tags: ${idea.tags?.join(', ') || 'automation, development, AI'}
Notes: ${idea.notes || 'No additional notes'}

Requirements:
1. Create an engaging, professional blog post (800-1200 words)
2. Focus on b0ase.com services and capabilities (web development, AI agents, automation, smart contracts)
3. Make it valuable for businesses, developers, and entrepreneurs
4. Use proper markdown formatting
5. Include practical examples and use cases
6. SEO-friendly with natural keyword usage
7. End with a clear call-to-action to work with b0ase.com

CONTENT STRATEGY - CRITICAL:
- Focus on selling b0ase.com services, NOT specific blockchain technologies
- Use generic terms like "blockchain" or "smart contracts" rather than specific chain names
- Only mention specific implementation details (like BSV) if technically necessary
- Emphasize business value, automation, and practical results
- Make the content appealing to a broad audience, not just crypto enthusiasts

FORMATTING RULES:
- Keep each paragraph 2-4 sentences with blank lines between paragraphs
- Use proper heading hierarchy (##, ###)
- Use bullet points and numbered lists where appropriate
- Keep content scannable and well-structured

Return JSON with this structure (title, excerpt, content, tags array)`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let content = response.text();

    if (!content) {
      throw new Error('No content in AI response');
    }

    // With responseSchema set to application/json, the content should already be valid JSON
    // Just parse it directly
    console.log('AI Response (first 500 chars):', content.substring(0, 500));

    let blogData;
    try {
      blogData = JSON.parse(content);
    } catch (parseError: any) {
      console.error('JSON Parse Error:', parseError.message);
      console.error('Full content:', content);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    // Ensure proper paragraph formatting in markdown content
    // The content should already have proper formatting from Gemini's responseSchema
    // Just ensure we don't have excessive newlines
    if (blogData.content) {
      blogData.content = blogData.content
        .replace(/\n{3,}/g, '\n\n') // Limit to max double breaks
        .trim();
    }

    // Generate slug
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Get author (first user in system)
    const authorResult = await pool.query(
      'SELECT id FROM profiles LIMIT 1'
    );

    if (authorResult.rows.length === 0) {
      throw new Error('No author found in profiles table');
    }

    const authorId = authorResult.rows[0].id;

    // Insert blog post
    const blogResult = await pool.query(
      `INSERT INTO blog_posts (
        author_id, title, slug, excerpt, content, tags, status, published_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [
        authorId,
        blogData.title,
        slug,
        blogData.excerpt,
        blogData.content,
        blogData.tags,
        'published',
      ]
    );

    const blogPost = blogResult.rows[0];

    // Mark content idea as used
    await pool.query(
      'UPDATE content_ideas SET used = true WHERE id = $1',
      [contentIdeaId]
    );

    return NextResponse.json({
      success: true,
      blogPost: {
        id: blogPost.id,
        title: blogPost.title,
        slug: blogPost.slug,
        excerpt: blogPost.excerpt,
        url: `https://b0ase.com/blog/${blogPost.slug}`,
      },
    });
  } catch (error: any) {
    console.error('Blog generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate blog post',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
