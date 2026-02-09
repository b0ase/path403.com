import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '$402 — Access Tokens for the Open Web';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Glow effect behind text */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* $402 Logo */}
          <div
            style={{
              fontSize: 160,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.02em',
              textShadow: '0 0 80px rgba(59, 130, 246, 0.5)',
              display: 'flex',
            }}
          >
            $402
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: '#9ca3af',
              marginTop: 20,
              letterSpacing: '0.05em',
              display: 'flex',
            }}
          >
            Access Tokens for the Open Web
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              color: '#6b7280',
              marginTop: 16,
              display: 'flex',
            }}
          >
            AI-native micropayments on BSV
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              background: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 20,
              color: '#6b7280',
              display: 'flex',
            }}
          >
            path402.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
