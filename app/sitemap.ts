import { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.b0ase.com';

    // Use static blog posts only - no async fetching to avoid pathname errors
    const blogPostEntries: MetadataRoute.Sitemap = blogPosts.flatMap((post) => {
        // Validate post has required fields before creating URLs
        if (!post || !post.slug || typeof post.slug !== 'string') {
            console.warn('Skipping invalid blog post in sitemap:', post);
            return [];
        }

        return [
            {
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: new Date(post.date),
                changeFrequency: 'weekly' as const,
                priority: post.featured ? 0.8 : 0.6,
            },
            {
                url: `${baseUrl}/blog/${post.slug}.md`,
                lastModified: new Date(post.date),
                changeFrequency: 'weekly' as const,
                priority: post.featured ? 0.7 : 0.5,
            },
        ];
    });

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/mint`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/kintsugi`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        ...blogPostEntries,
    ];
}
