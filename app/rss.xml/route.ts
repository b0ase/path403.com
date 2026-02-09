import { blogPosts } from '@/lib/blog';

export async function GET() {
  const baseUrl = 'https://www.b0ase.com';

  // Use static blog posts only - no async fetching
  const validPosts = blogPosts.filter(post => post && post.slug && typeof post.slug === 'string');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>b0ase Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Deep dives into AI agents, automation, Web3, and building production-ready systems. Lessons learned from real deployments.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${validPosts.flatMap(post => [
    `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${post.author.name}</author>
      ${post.tags?.map(tag => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`,
    `
    <item>
      <title><![CDATA[${post.title} (Markdown)]]></title>
      <link>${baseUrl}/blog/${post.slug}.md</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}.md</guid>
      <description><![CDATA[Clean markdown source for AI agents: ${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <author>${post.author.name}</author>
      ${post.tags?.map(tag => `<category>${tag}</category>`).join('\n      ') || ''}
    </item>`
  ]).join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
