import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = '$402 — PoW20 Hash-to-Mint Token on BSV Mainnet';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const TOKEN_ID = '294691e2069ce8f6b9a1afd1022c6d32f8b30cb24c07b6584385bd6066e95502_0';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#000000',
          position: 'relative',
          fontFamily: 'monospace',
          padding: '48px 56px',
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
              linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            display: 'flex',
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '500px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, borderLeft: '2px solid rgba(255,255,255,0.08)', borderTop: '2px solid rgba(255,255,255,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRight: '2px solid rgba(255,255,255,0.08)', borderTop: '2px solid rgba(255,255,255,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 20, width: 40, height: 40, borderLeft: '2px solid rgba(255,255,255,0.08)', borderBottom: '2px solid rgba(255,255,255,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 20, right: 20, width: 40, height: 40, borderRight: '2px solid rgba(255,255,255,0.08)', borderBottom: '2px solid rgba(255,255,255,0.08)', display: 'flex' }} />

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8, zIndex: 10 }}>
          <div style={{ width: 12, height: 12, background: '#22c55e', borderRadius: '50%', display: 'flex' }} />
          <div style={{ fontSize: 14, color: '#71717a', letterSpacing: '0.2em', textTransform: 'uppercase' as const, display: 'flex' }}>
            Genesis Proof — BSV Mainnet
          </div>
        </div>

        {/* $402 title */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginBottom: 8,
            display: 'flex',
            textShadow: '0 0 60px rgba(59, 130, 246, 0.4)',
          }}
        >
          $402
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 22, color: '#a1a1aa', letterSpacing: '0.15em', marginBottom: 40, display: 'flex' }}>
          POW20 HASH-TO-MINT TOKEN
        </div>

        {/* Token ID */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24, zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#52525b', letterSpacing: '0.2em', textTransform: 'uppercase' as const, display: 'flex' }}>
            Token ID
          </div>
          <div style={{ fontSize: 14, color: '#71717a', display: 'flex', wordBreak: 'break-all' as const }}>
            {TOKEN_ID}
          </div>
        </div>

        {/* DNS Record */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 32, zIndex: 10 }}>
          <div style={{ fontSize: 11, color: '#52525b', letterSpacing: '0.2em', textTransform: 'uppercase' as const, display: 'flex' }}>
            DNS Verification
          </div>
          <div style={{ fontSize: 14, color: '#71717a', display: 'flex' }}>
            _bsv-token.path402.com TXT &quot;token_id=...e95502_0&quot;
          </div>
        </div>

        {/* Contract params row */}
        <div style={{ display: 'flex', gap: 48, zIndex: 10 }}>
          {[
            ['Supply', '21,000,000'],
            ['Per Mint', '50'],
            ['Halving', '210K'],
            ['Pre-mine', '0%'],
            ['Standard', 'BSV-21'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 10, color: '#52525b', letterSpacing: '0.2em', textTransform: 'uppercase' as const, display: 'flex' }}>
                {label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'white', display: 'flex' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 56,
            right: 56,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', display: 'flex' }} />
            <div style={{ fontSize: 16, color: '#52525b', display: 'flex' }}>
              path402.com/token
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#3f3f46', letterSpacing: '0.15em', display: 'flex' }}>
            BSV-21 // POW20 // BRC-114
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
