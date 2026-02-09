import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: '$B0ASE',
    template: '%s | $B0ASE',
  },
  metadataBase: new URL('https://b0ase.com'),
  description: '$B0ASE - Personal site and projects',
  openGraph: {
    title: 'B0ASE | Web Development & Digital Design',
    description: 'Web Design Studio & Digital Atelier crafting bespoke digital experiences where elegant design meets blockchain innovation',
    url: 'https://b0ase.com',
    siteName: 'B0ASE',
    images: [
      {
        url: 'https://b0ase.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'B0ASE - Web Development & Digital Design',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'B0ASE | Web Development & Digital Design',
    description: 'Web Design Studio & Digital Atelier crafting bespoke digital experiences where elegant design meets blockchain innovation',
    images: ['https://b0ase.com/og-image.png'],
  },
}; 