import { Metadata } from 'next';
import { pricingCategories } from '@/lib/pricing-data';
import { getContractTitle } from '@/lib/contract-titles';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;

  // Find the service from pricing data
  const allServices = pricingCategories.flatMap(cat =>
    cat.items.map(item => {
      const categorySlug = cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const serviceSlug = item.service.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        id: `${categorySlug}-${serviceSlug}`,
        service: item.service,
        price: item.price,
        unit: item.unit,
        category: cat.category,
      };
    })
  );

  const service = allServices.find(s => s.id === slug);

  if (!service) {
    return {
      title: 'Contract Not Found | b0ase',
      description: 'This contract could not be found.',
    };
  }

  const title = `${getContractTitle(service.service)} for ${service.price}`;
  const description = `Professional ${service.service.toLowerCase()} service. ${service.unit === 'one-time' ? 'Fixed price' : `Priced ${service.unit}`}. Pay in BSV, ETH, or SOL. On-chain contract with escrow.`;

  return {
    title: `${title} | b0ase Contracts`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://b0ase.com/contracts/${slug}`,
      siteName: 'b0ase',
      images: [
        {
          url: `/contracts/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@b0ase',
      images: [`/contracts/${slug}/opengraph-image`],
    },
  };
}
