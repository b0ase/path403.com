import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { blogPosts } from '../lib/blog';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

async function syncBlogPosts() {
    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

    for (const file of files) {
        const filePath = path.join(BLOG_DIR, file);
        const slug = file.replace('.md', '');
        const registryPost = blogPosts.find(p => p.slug === slug);

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        let changed = false;

        // Add missing fields from registry
        if (registryPost) {
            if (!data.image && registryPost.image) {
                data.image = registryPost.image;
                changed = true;
            }
            if (!data.slug) {
                data.slug = slug;
                changed = true;
            }
            if (!data.description && registryPost.description) {
                data.description = registryPost.description;
                changed = true;
            }
            if (!data.author) {
                data.author = registryPost.author.name;
                changed = true;
            }
            if (!data.date) {
                data.date = registryPost.date;
                changed = true;
            }
            if (!data.topics && registryPost.tags) {
                data.topics = registryPost.tags;
                changed = true;
            }
        }

        // Add standard fields if missing
        if (!data.audience) {
            data.audience = ["human", "search", "ai"];
            changed = true;
        }
        if (!data.canonical) {
            data.canonical = `https://b0ase.com/blog/${slug}`;
            changed = true;
        }
        if (!data.markdown) {
            data.markdown = `https://b0ase.com/blog/${slug}.md`;
            changed = true;
        }

        if (changed) {
            const newContent = matter.stringify(content, data);
            fs.writeFileSync(filePath, newContent);
            console.log(`Updated ${file}`);
        }
    }
}

syncBlogPosts().catch(console.error);
