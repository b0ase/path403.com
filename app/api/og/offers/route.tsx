import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const offers: Record<string, { title: string; price: string; subtitle: string }> = {
  'landing-page': { title: 'LANDING_PAGE', price: '£180', subtitle: 'High-converting landing page' },
  'logo': { title: 'LOGO_DESIGN', price: '£150', subtitle: 'Professional brand identity' },
  'copywriting': { title: 'COPYWRITING', price: '£100', subtitle: 'SEO-optimized copy per page' },
  'video': { title: 'VIDEO_EDIT', price: '£200', subtitle: 'Promo video with motion graphics' },
  'seo': { title: 'SEO_AUDIT', price: '£250', subtitle: 'Comprehensive SEO analysis' },
  'social-media': { title: 'SOCIAL_MEDIA', price: '£300/mo', subtitle: 'Monthly content management' },
  'website': { title: 'WEBSITE', price: '£500+', subtitle: 'Complete multi-page website' },
  'ai-agent': { title: 'AI_AGENT', price: '£800+', subtitle: 'Custom AI for your workflow' },
  'token': { title: 'TOKEN_LAUNCH', price: '£1,500', subtitle: 'BSV token deployment' },
  'app': { title: 'APP_DEV', price: '£2,000+', subtitle: 'Custom web or mobile app' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  // Default to services overview
  if (!slug || !offers[slug]) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000000',
            padding: '60px',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#6b7280', fontSize: 24, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Fixed-Price Packages
            </div>
            <div style={{ color: '#ffffff', fontSize: 72, fontWeight: 'bold', letterSpacing: '-0.02em' }}>
              SERVICES
            </div>
          </div>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>Landing Pages</div>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>Websites</div>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>AI Agents</div>
            <div style={{ color: '#9ca3af', fontSize: 24 }}>Token Launch</div>
          </div>
          <div style={{ color: '#4b5563', fontSize: 20 }}>
            b0ase.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }

  const offer = offers[slug];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000000',
          padding: '60px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#6b7280', fontSize: 24, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {offer.subtitle}
          </div>
          <div style={{ color: '#ffffff', fontSize: 80, fontWeight: 'bold', letterSpacing: '-0.02em', marginBottom: 30 }}>
            {offer.title}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ color: '#ffffff', fontSize: 96, fontWeight: 'bold' }}>{offer.price}</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ color: '#4b5563', fontSize: 20 }}>
            b0ase.com/offers/{slug}
          </div>
          <div style={{ color: '#6b7280', fontSize: 20 }}>
            richard@b0ase.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
