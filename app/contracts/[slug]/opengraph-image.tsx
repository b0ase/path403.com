import { ImageResponse } from 'next/og';
import { pricingCategories } from '@/lib/pricing-data';
import { getContractTitle } from '@/lib/contract-titles';

export const runtime = 'edge';
export const alt = 'b0ase Contract';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
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
    return new ImageResponse(
      (
        <div
          style={{
            background: 'black',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ color: 'white', fontSize: 60 }}>Contract Not Found</div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'black',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 60,
          fontFamily: 'monospace',
        }}
      >
        {/* Top Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              color: '#71717a',
              fontSize: 14,
              textTransform: 'uppercase',
              letterSpacing: 3,
            }}
          >
            {service.category}
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            color: 'white',
            fontSize: 52,
            fontWeight: 'bold',
            lineHeight: 1.2,
            marginBottom: 30,
          }}
        >
          {getContractTitle(service.service)}
        </div>

        {/* Price */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              color: 'white',
              fontSize: 72,
              fontWeight: 'bold',
            }}
          >
            {service.price}
          </div>
          <div
            style={{
              color: '#71717a',
              fontSize: 24,
              textTransform: 'uppercase',
            }}
          >
            {service.unit}
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div style={{ color: '#22c55e', fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✓</span>
            <span>Pay in BSV, ETH, or SOL</span>
          </div>
          <div style={{ color: '#22c55e', fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✓</span>
            <span>On-chain contract escrow</span>
          </div>
          <div style={{ color: '#22c55e', fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✓</span>
            <span>Verifiable delivery</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #27272a',
            paddingTop: 24,
          }}
        >
          <div
            style={{
              color: '#71717a',
              fontSize: 16,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            b0ase.com/contracts
          </div>
          <div
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            b0ase
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
