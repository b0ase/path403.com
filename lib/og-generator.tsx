import { ImageResponse } from 'next/og';

export function generateOgImage(title: string, subtitle?: string) {
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
                    color: 'white',
                }}
            >
                {/* Brand Mark - minimalistic top left or center top */}
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

                {/* Main Title - Huge & Legible */}
                <div style={{
                    fontSize: 96,
                    fontFamily: 'sans-serif',
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                    textAlign: 'center',
                    maxWidth: '90%',
                    lineHeight: 1.1,
                    textTransform: 'uppercase', // Often looks cleaner/bolder for titles
                }}>
                    {title}
                </div>

                {/* Subtitle - Optional */}
                {subtitle && (
                    <div style={{
                        marginTop: 30,
                        fontSize: 32,
                        color: '#888',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        maxWidth: '80%',
                    }}>
                        {subtitle}
                    </div>
                )}

                {/* Decorative footer/corners if needed, but keeping it minimal */}
                <div style={{
                    position: 'absolute',
                    bottom: 60,
                    right: 60,
                    width: 20,
                    height: 20,
                    background: 'white',
                }} />
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
