import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Startup in a Box | Kintsugi Model | b0ase.com',
    description: '£999 to start. 100% equity. We build your product, you own everything. Pay monthly to continue — b0ase earns equity through delivered work.',
    openGraph: {
        title: 'Your Startup in a Box — Kintsugi Model',
        description: '£999 to start. 100% equity. We build your product, you own everything.',
        url: 'https://b0ase.com/problem',
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
        title: 'Your Startup in a Box — Kintsugi Model',
        description: '£999 to start. 100% equity. We build your product.',
        images: ['https://b0ase.com/kintsugi-1.jpg'],
        creator: '@b0ase',
    },
};

export default function ProblemLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
