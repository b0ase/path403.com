import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OfferPage from './OfferPage';

// Map slugs to their OG image filenames
const ogImageMap: Record<string, { black: string; white: string }> = {
  'landing-page': { black: 'landing-page.png', white: 'landing-page:white.png' },
  'logo': { black: 'logo-design.png', white: 'logo-design:white.png' },
  'copywriting': { black: 'copywriting.png', white: 'copywriting:white.png' },
  'video': { black: 'video-editing.png', white: 'video-editing:white.png' },
  'seo': { black: 'seo-audit.png', white: 'seo-audit:white.png' },
  'social-media': { black: 'social-media.png', white: 'social-media:white.png' },
  'website': { black: 'website.png', white: 'website:white.png' },
  'ai-agent': { black: 'ai-agent.png', white: 'ai-agent:white.png' },
  'token': { black: 'token-launch.png', white: 'token-launch:white.png' },
  'app': { black: 'app-development.png', white: 'app-dev:white.png' },
  'kyc': { black: 'kyc.png', white: 'kyc:white.png' },
};

const offers: Record<string, {
  title: string;
  displayTitle: string;
  price: string;
  priceLabel: string;
  subtitle: string;
  description: string;
  features: string[];
  cta: { href: string; label: string };
  trustBadge: string;
}> = {
  'landing-page': {
    title: 'Landing Page',
    displayTitle: 'LANDING_PAGE',
    price: '£180',
    priceLabel: 'one-time',
    subtitle: 'Limited Offer',
    description: 'A high-converting landing page designed to capture leads and drive action. Built with modern tech, optimized for speed.',
    features: [
      'Custom responsive design',
      'Mobile-first approach',
      'Contact form integration',
      'SEO optimized',
      'Fast loading speed',
      'Analytics setup',
      '1 round of revisions',
      '48hr turnaround',
    ],
    cta: { href: '/portfolio', label: 'View Portfolio' },
    trustBadge: '50+ landing pages delivered · 5-star reviews · Fast turnaround',
  },
  'logo': {
    title: 'Logo Design',
    displayTitle: 'LOGO_DESIGN',
    price: '£150',
    priceLabel: 'one-time',
    subtitle: 'Brand Identity',
    description: 'Professional logo design that captures your brand essence. Clean, memorable, and versatile across all media.',
    features: [
      '3 initial concepts',
      '2 rounds of revisions',
      'Vector files (SVG, AI)',
      'PNG & JPG exports',
      'Black & white versions',
      'Brand color palette',
      'Usage guidelines',
      '48hr turnaround',
    ],
    cta: { href: '/portfolio', label: 'View Portfolio' },
    trustBadge: '200+ logos designed · All file formats included · Fast delivery',
  },
  'copywriting': {
    title: 'Copywriting',
    displayTitle: 'COPYWRITING',
    price: '£100',
    priceLabel: 'per page',
    subtitle: 'Website Copy',
    description: 'Compelling website copy that converts visitors into customers. SEO-optimized, brand-aligned, and persuasive.',
    features: [
      'Brand voice research',
      'Competitor analysis',
      'SEO keyword integration',
      'Headline options',
      'Call-to-action writing',
      'Meta descriptions',
      '1 revision round',
      '48hr turnaround',
    ],
    cta: { href: '/content', label: 'View Samples' },
    trustBadge: 'Conversion-focused · SEO optimized · Native English',
  },
  'video': {
    title: 'Video Edit',
    displayTitle: 'VIDEO_EDIT',
    price: '£200',
    priceLabel: 'per video',
    subtitle: 'Promo Video',
    description: 'Professional video editing for social media, ads, or promotions. Motion graphics, color grading, and sound design included.',
    features: [
      'Up to 60 seconds',
      'Motion graphics',
      'Color grading',
      'Sound design',
      'Text animations',
      'Music licensing',
      'Multiple formats',
      'Social media cuts',
      '1 revision round',
      '3-day turnaround',
    ],
    cta: { href: '/video', label: 'View Showreel' },
    trustBadge: '4K quality · All platforms · Fast turnaround',
  },
  'seo': {
    title: 'SEO Audit',
    displayTitle: 'SEO_AUDIT',
    price: '£250',
    priceLabel: 'one-time',
    subtitle: 'Search Optimization',
    description: 'Comprehensive SEO audit with actionable recommendations. Improve rankings and drive organic traffic to your site.',
    features: [
      'Technical SEO audit',
      'Keyword research',
      'Competitor analysis',
      'On-page optimization',
      'Meta tag recommendations',
      'Site speed analysis',
      'Mobile optimization check',
      'Backlink analysis',
      'Content recommendations',
      'Detailed PDF report',
    ],
    cta: { href: '/services/seo-marketing', label: 'Learn More' },
    trustBadge: 'Google-focused · Actionable insights · 5-day delivery',
  },
  'social-media': {
    title: 'Social Media',
    displayTitle: 'SOCIAL_MEDIA',
    price: '£300',
    priceLabel: '/month',
    subtitle: 'Monthly Package',
    description: 'Complete social media management. Content creation, scheduling, and engagement across your platforms.',
    features: [
      '12 posts per month',
      'Custom graphics',
      'Caption writing',
      'Hashtag research',
      'Scheduling & posting',
      'Story content',
      'Community management',
      'Monthly analytics report',
      '2 platforms included',
      'Content calendar',
    ],
    cta: { href: '/portfolio', label: 'View Work' },
    trustBadge: 'Instagram · Twitter · LinkedIn · TikTok · Cancel anytime',
  },
  'website': {
    title: 'Website',
    displayTitle: 'WEBSITE',
    price: '£500',
    priceLabel: 'starting from',
    subtitle: 'Full Website Package',
    description: 'Complete multi-page website with modern design, CMS integration, and everything you need to launch your online presence.',
    features: [
      'Up to 5 pages',
      'Custom responsive design',
      'Content Management System',
      'Contact form + email setup',
      'SEO optimization',
      'Google Analytics',
      'SSL certificate',
      'Mobile-first design',
      '2 rounds of revisions',
      '1 week turnaround',
    ],
    cta: { href: '/portfolio', label: 'View Portfolio' },
    trustBadge: '100+ websites delivered · Next.js & React · Fast turnaround',
  },
  'ai-agent': {
    title: 'AI Agent',
    displayTitle: 'AI_AGENT',
    price: '£800',
    priceLabel: 'starting from',
    subtitle: 'Custom AI Solution',
    description: 'Custom AI agent built for your specific workflow. Automate tasks, answer questions, and integrate with your existing tools.',
    features: [
      'Custom trained agent',
      'API integration',
      'Web interface',
      'Knowledge base setup',
      'Conversation memory',
      'Multi-platform deployment',
      'Usage analytics',
      'Documentation',
      '30 days support',
      '2 week delivery',
    ],
    cta: { href: '/agents', label: 'View Agents' },
    trustBadge: 'GPT-4 & Claude powered · Custom integrations · Enterprise ready',
  },
  'token': {
    title: 'Token Launch',
    displayTitle: 'TOKEN_LAUNCH',
    price: '£1,500',
    priceLabel: 'complete package',
    subtitle: 'Blockchain Launch',
    description: 'Launch your own token on BSV blockchain. Smart contract deployment, tokenomics design, and listing support included.',
    features: [
      'Token contract deployment',
      'Tokenomics design',
      'Brand & logo design',
      'Landing page',
      'Whitepaper writing',
      'Exchange listing support',
      'Wallet integration',
      'Social media setup',
      'Community templates',
      'Launch strategy',
    ],
    cta: { href: '/tokens', label: 'View Tokens' },
    trustBadge: 'BSV blockchain · 1Sat Ordinals · Full support included',
  },
  'app': {
    title: 'App Development',
    displayTitle: 'APP_DEV',
    price: '£2,000',
    priceLabel: 'starting from',
    subtitle: 'Mobile & Web App',
    description: 'Custom web or mobile application development. From MVP to full-featured product, built with modern tech stack.',
    features: [
      'Requirements analysis',
      'UI/UX design',
      'Frontend development',
      'Backend & API',
      'Database setup',
      'User authentication',
      'Cloud deployment',
      'Testing & QA',
      'Documentation',
      '30 days support',
    ],
    cta: { href: '/portfolio', label: 'View Portfolio' },
    trustBadge: 'React Native · Next.js · Node.js · PostgreSQL · AWS',
  },
  'kyc': {
    title: 'KYC Integration',
    displayTitle: 'KYC_INTEGRATION',
    price: '£500',
    priceLabel: '+ £2.50/user',
    subtitle: 'Compliance Ready',
    description: 'Plug-and-play identity verification for tokens, shares, and regulated platforms. Powered by Veriff with full AML compliance.',
    features: [
      'KYC provider setup (Veriff)',
      'Web widget integration',
      'Identity document verification',
      'Liveness detection',
      'AML screening',
      'Investor whitelist management',
      'Compliance dashboard access',
      'Webhook integration',
      'Multi-jurisdiction support',
      '230+ countries covered',
    ],
    cta: { href: '/packages/token-launch', label: 'View Token Package' },
    trustBadge: 'Powered by Veriff · GDPR compliant · STO & ICO ready',
  },
};

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { theme } = await searchParams;
  const offer = offers[slug];

  if (!offer) {
    return {
      title: 'Not Found',
    };
  }

  // Determine which OG image to use based on theme
  const isWhite = theme === 'white';
  const imageFiles = ogImageMap[slug];
  const ogImagePath = imageFiles
    ? (isWhite ? `/offers-white/${imageFiles.white}` : `/offers-black/${imageFiles.black}`)
    : `/offers-black/offers.png`;

  return {
    title: `${offer.title} - ${offer.price} | b0ase.com`,
    description: offer.description,
    openGraph: {
      title: `${offer.displayTitle} - ${offer.price}`,
      description: offer.description,
      images: [
        {
          url: `https://b0ase.com${ogImagePath}`,
          width: 1200,
          height: 630,
          alt: `${offer.title} - ${offer.price}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${offer.displayTitle} - ${offer.price}`,
      description: offer.description,
      images: [`https://b0ase.com${ogImagePath}`],
    },
  };
}

export function generateStaticParams() {
  return Object.keys(offers).map((slug) => ({ slug }));
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const offer = offers[slug];

  if (!offer) {
    notFound();
  }

  return <OfferPage offer={offer} slug={slug} />;
}
