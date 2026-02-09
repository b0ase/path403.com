import { Metadata } from "next";
import OffersClient from "./OffersClient";

type Props = {
  searchParams: Promise<{ theme?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { theme } = await searchParams;
  const isWhite = theme === 'white';
  const ogImagePath = isWhite
    ? '/offers-white/offers:white.png'
    : '/offers-black/offers.png';

  return {
    title: 'Offers - Fixed Price Packages | b0ase.com',
    description: 'Fixed-price web development, design, and marketing packages. Landing pages, logos, copywriting, video editing, SEO, and more.',
    openGraph: {
      title: 'OFFERS - Fixed Price Packages',
      description: 'Fixed-price web development, design, and marketing packages from b0ase.com',
      images: [
        {
          url: `https://b0ase.com${ogImagePath}`,
          width: 1200,
          height: 630,
          alt: 'b0ase.com Offers',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'OFFERS - Fixed Price Packages',
      description: 'Fixed-price web development, design, and marketing packages from b0ase.com',
      images: [`https://b0ase.com${ogImagePath}`],
    },
  };
}

export default function OffersPage() {
  return <OffersClient />;
}
