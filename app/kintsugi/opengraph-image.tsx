import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Fetch the kintsugi-1 image from the public URL
  const imageUrl = 'https://b0ase.com/kintsugi-1.jpg';
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = await imageResponse.arrayBuffer();
  const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;

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
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
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
            alignItems: 'center',
            justifyContent: 'center',
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
            B0ASE
          </div>

          {/* Title */}
          <div style={{
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            Kintsugi
          </div>

          {/* Subtitle */}
          <div style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
          }}>
            Transform your broken processes into golden products
          </div>

          {/* Japanese */}
          <div style={{
            position: 'absolute',
            bottom: 60,
            fontSize: 24,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.2em',
          }}>
            金継ぎ — The art of precious scars
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
