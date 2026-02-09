import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - B0ASE Rate Card',
  description: 'Complete rate card with 110+ services. Web development, branding, video production, AI automation, blockchain integration and more.',
  openGraph: {
    title: 'Pricing - B0ASE Rate Card',
    description: 'Complete rate card with 110+ services. Web development, branding, video production, AI automation, blockchain integration and more.',
    url: 'https://b0ase.com/pricing',
    siteName: 'B0ASE',
    images: [
      {
        url: 'https://b0ase.com/og-pricing.png',
        width: 1200,
        height: 630,
        alt: 'B0ASE Pricing - Complete Rate Card',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing - B0ASE Rate Card',
    description: 'Complete rate card with 110+ services.',
    images: ['https://b0ase.com/og-pricing.png'],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
