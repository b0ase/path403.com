#!/usr/bin/env ts-node
/**
 * Generate blog index from markdown files
 * Reads all .md files in content/blog/ and generates the blogPosts array for lib/blog.ts
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface BlogPostFrontmatter {
  title: string;
  date: string;
  author: string;
  category?: string;
  tags: string[];
  excerpt: string;
  readingTime?: string;
  featured?: boolean;
}

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  author: {
    name: string;
    handle?: string;
    url?: string;
  };
  company?: {
    name: string;
    url?: string;
    stats?: string;
  };
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  image?: string;
}

const contentDir = path.join(process.cwd(), 'content', 'blog');

function parseAuthor(authorString: string): { name: string; handle?: string; url?: string } {
  // Handle various author formats
  if (authorString.includes('(@')) {
    const match = authorString.match(/^(.+?)\s*\(@(.+?)\)$/);
    if (match) {
      return {
        name: match[1],
        handle: `@${match[2]}`,
        url: `https://x.com/${match[2]}`
      };
    }
  }

  if (authorString.startsWith('@')) {
    return {
      name: authorString,
      url: `https://x.com/${authorString.slice(1)}`
    };
  }

  return {
    name: authorString,
    url: 'https://b0ase.com'
  };
}

function generateBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(contentDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    try {
      const { data } = matter(fileContent);
      const frontmatter = data as BlogPostFrontmatter;

      const slug = file.replace('.md', '');

      posts.push({
        slug,
        title: frontmatter.title || 'Untitled Post',
        description: frontmatter.excerpt || '',
        author: parseAuthor(frontmatter.author || 'b0ase'),
        company: { name: 'b0ase.com', url: 'https://b0ase.com' },
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        readTime: frontmatter.readingTime || '5 min read',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        featured: frontmatter.featured || false
      });
    } catch (error) {
      console.error(`Error parsing ${file}:`, error);
    }
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

function generateTypeScriptCode(posts: BlogPost[]): string {
  const postsCode = posts.map(post => {
    const lines: string[] = ['    {'];
    lines.push(`        slug: '${post.slug}',`);
    lines.push(`        title: '${post.title.replace(/'/g, "\\'")}',`);
    lines.push(`        description: '${post.description.replace(/'/g, "\\'")}',`);
    lines.push(`        date: '${post.date}',`);

    // Author
    if (post.author.handle && post.author.url) {
      lines.push(`        author: { name: '${post.author.name.replace(/'/g, "\\'")}', handle: '${post.author.handle}', url: '${post.author.url}' },`);
    } else if (post.author.url) {
      lines.push(`        author: { name: '${post.author.name.replace(/'/g, "\\'")}', url: '${post.author.url}' },`);
    } else {
      lines.push(`        author: { name: '${post.author.name.replace(/'/g, "\\'")}' },`);
    }

    // Company
    if (post.company) {
      lines.push(`        company: { name: '${post.company.name}', url: '${post.company.url}' },`);
    }

    lines.push(`        readTime: '${post.readTime}',`);

    // Tags
    const tagsStr = post.tags.map(tag => `'${tag.replace(/'/g, "\\'")}'`).join(', ');
    lines.push(`        tags: [${tagsStr}],`);

    if (post.featured) {
      lines.push(`        featured: true`);
    }

    if (post.image) {
      lines.push(`        image: '${post.image}'`);
    }

    lines.push('    }');
    return lines.join('\n');
  }).join(',\n');

  return `export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    author: {
        name: string;
        handle?: string;
        url?: string;
    };
    company?: {
        name: string;
        url?: string;
        stats?: string;
    };
    date: string;
    readTime: string;
    tags: string[];
    featured?: boolean;
    image?: string;
}

export const blogPosts: BlogPost[] = [
${postsCode}
];

export function getBlogPost(slug: string): BlogPost | undefined {
    return blogPosts.find(post => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
    return blogPosts.filter(post => post.featured);
}

export function getPostsByTag(tag: string): BlogPost[] {
    return blogPosts.filter(post => post.tags.includes(tag));
}
`;
}

// Main execution
const posts = generateBlogPosts();
const code = generateTypeScriptCode(posts);

// Write to lib/blog.ts
const outputPath = path.join(process.cwd(), 'lib', 'blog.ts');
fs.writeFileSync(outputPath, code, 'utf-8');

console.log(`✅ Generated blog index with ${posts.length} posts`);
console.log(`   Written to: ${outputPath}`);
