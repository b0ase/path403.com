import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://path402.com'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/whitepaper`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/whitepaper/academic`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/token`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/exchange`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/registry`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/account`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/site-index`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Add blog posts dynamically
  try {
    const blogDir = path.join(process.cwd(), 'public/blog')
    if (fs.existsSync(blogDir)) {
      const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'))
      const blogRoutes = files.flatMap(file => {
        const slug = file.replace('.md', '')
        return [
          {
            url: `${baseUrl}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          },
          {
            url: `${baseUrl}/blog/${slug}.md`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.5,
          }
        ]
      })
      return [...staticRoutes, ...blogRoutes]
    }
  } catch (e) {
    console.error('Error generating sitemap for blog:', e)
  }

  return staticRoutes
}
