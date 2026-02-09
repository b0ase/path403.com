import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kintsugi Engine | Your Startup in a Box | b0ase.com',
  description: 'Transform your idea into a fundable startup. £999 to start, 100% equity. We build your product, you own everything. Token, website, social media, and KYC included.',
  openGraph: {
    title: 'Kintsugi Engine — Your Startup in a Box',
    description: 'Transform your idea into a fundable startup. £999 to start, 100% equity. Token, website, social media, and KYC included.',
    url: 'https://b0ase.com/kintsugi',
    siteName: 'B0ASE',
    images: [
      {
        url: 'https://b0ase.com/kintsugi-1.jpg',
        width: 1200,
        height: 630,
        alt: 'Kintsugi Engine — Your Startup in a Box',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kintsugi Engine — Your Startup in a Box',
    description: 'Transform your idea into a fundable startup. £999 to start, 100% equity.',
    images: ['https://b0ase.com/kintsugi-1.jpg'],
    creator: '@b0ase',
  },
};

export default function KintsugiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
