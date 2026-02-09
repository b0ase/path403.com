import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services & Pricing | b0ase.com',
  description: 'Fixed-price packages for landing pages, websites, AI agents, token launches, and more.',
  openGraph: {
    title: 'Services & Pricing | b0ase.com',
    description: 'Fixed-price packages for landing pages, websites, AI agents, token launches, and more.',
    images: [
      {
        url: '/api/og/offers',
        width: 1200,
        height: 630,
        alt: 'b0ase.com Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services & Pricing | b0ase.com',
    description: 'Fixed-price packages for landing pages, websites, AI agents, token launches, and more.',
    images: ['/api/og/offers'],
  },
};

export default function OffersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
