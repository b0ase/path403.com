import { ImageResponse } from 'next/og';
import { getBlogPost } from '@/lib/blog';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getDbPost(slug: string) {
    try {
        const result = await pool.query(
            'SELECT title, tags, published_at FROM blog_posts WHERE slug = $1 AND status = $2',
            [slug, 'published']
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching blog post for OG image:', error);
        return null;
    }
}

// Map of slugs to featured images (filenames in og-assets folder)
const FEATURED_IMAGES: Record<string, string> = {
    'kintsugi-engine-transform-problems-into-products': 'kintsugi-3.png',
    'kintsugi-contracts': 'kintsugi-2.png',
    'moneybutton-path-to-10-million': 'money-button-banner.png',
    'anatomy-of-a-bitcoin-empire': 'anatomy-empire.png',
    'blueprint-of-the-bitcoin-corporation': 'blueprint-of-the-bitcoin-corporation.png',
    'bruce-wayne-is-not-batman': 'bruce-wayne-is-not-batman.jpg',
    'floop-the-browser-that-pays-you-to-think': 'floop-hero.jpg',
    // MetaWeb series
    'every-url-is-a-path': 'dollar_path_code_visualization_1769978701391.jpg',
    'metaweb-mathematics': 'metaweb_economic_curve_visualization_1769970092845.jpg',
    'metaweb-first-native-consumer': 'ai_agent_native_consumer_1769969641745.jpg',
    'metaweb-in-hindsight-obvious': 'hindsight_fragments_clarity_1769967220098.jpg',
    'metaweb-hype-crush': 'hype_crush_tsunami_network_1769966534749.jpg',
    'metaweb-token-is-not-the-product': 'metaweb_interlocking_rings_assembly_1769967719495.jpg',
};


async function getBase64Image(filename: string): Promise<string | null> {
    try {
        // Read from dedicated og-assets folder to avoid bundling entire public directory
        const filePath = path.join(process.cwd(), 'og-assets', filename);

        if (fs.existsSync(filePath)) {
            const imageBuffer = await fs.promises.readFile(filePath);
            const ext = filename.endsWith('.png') ? 'png' : 'jpeg';
            return `data:image/${ext};base64,${imageBuffer.toString('base64')}`;
        }

        console.warn(`[OG] Image not found in og-assets: ${filePath}`);
        return null;
    } catch (error) {
        console.error('[OG] Error loading image:', error);
        return null;
    }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Try database first, then static posts
    const dbPost = await getDbPost(slug);
    const post = dbPost ? {
        title: dbPost.title,
        tags: dbPost.tags || [],
        date: dbPost.published_at
    } : getBlogPost(slug);

    // Check for featured image
    const featuredImagePath = FEATURED_IMAGES[slug];
    const base64Image = featuredImagePath ? await getBase64Image(featuredImagePath) : null;

    if (!post) {
        return new ImageResponse(
            (
                <div
                    style={{
                        background: 'black',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontFamily: 'monospace',
                    }}
                >
                    B0ASE
                </div>
            ),
            { ...size }
        );
    }

    // If we have a featured image, use it as background
    if (base64Image) {
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        position: 'relative',
                    }}
                >
                    {/* Background Image */}
                    <img
                        src={base64Image}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Dark Overlay */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.75))',
                        }}
                    />

                    {/* Content */}
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '60px',
                            color: 'white',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        {/* Brand */}
                        <div style={{
                            position: 'absolute',
                            top: 60,
                            left: 60,
                            fontSize: 24,
                            fontFamily: 'monospace',
                            letterSpacing: '0.1em',
                            fontWeight: 'bold',
                        }}>
                            B0ASE / BLOG
                        </div>

                        {/* Date */}
                        <div style={{
                            position: 'absolute',
                            top: 60,
                            right: 60,
                            fontSize: 24,
                            fontFamily: 'monospace',
                            color: 'rgba(255,255,255,0.7)',
                        }}>
                            {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>

                        {/* Title */}
                        <div style={{
                            fontSize: 64,
                            fontWeight: 900,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            marginBottom: 24,
                        }}>
                            {post.title}
                        </div>

                        {/* Tags */}
                        <div style={{ display: 'flex', gap: 16 }}>
                            {post.tags.slice(0, 3).map(tag => (
                                <div key={tag} style={{
                                    fontSize: 18,
                                    fontFamily: 'monospace',
                                    color: 'rgba(255,255,255,0.7)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    #{tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
            { ...size }
        );
    }

    // Default: text-only OG image
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px',
                    fontFamily: 'sans-serif',
                    color: 'white',
                    position: 'relative',
                }}
            >
                {/* Brand Mark */}
                <div style={{
                    position: 'absolute',
                    top: 60,
                    left: 60,
                    fontSize: 24,
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                    fontWeight: 'bold',
                }}>
                    B0ASE / BLOG
                </div>

                {/* Date */}
                <div style={{
                    position: 'absolute',
                    top: 60,
                    right: 60,
                    fontSize: 24,
                    fontFamily: 'monospace',
                    color: '#888',
                }}>
                    {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                {/* Title - Huge & Legible */}
                <div style={{
                    fontSize: 80,
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    color: 'white',
                    maxWidth: '100%',
                }}>
                    {post.title}
                </div>

                {/* Tags */}
                <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
                    {post.tags.slice(0, 3).map(tag => (
                        <div key={tag} style={{
                            fontSize: 20,
                            fontFamily: 'monospace',
                            color: '#888',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            #{tag}
                        </div>
                    ))}
                </div>


                {/* Bottom Marker */}
                <div style={{
                    position: 'absolute',
                    bottom: 60,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    height: 4,
                    background: 'white',
                }} />
            </div>
        ),
        {
            ...size,
        }
    );
}
